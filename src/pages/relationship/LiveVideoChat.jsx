// src/pages/relationship/LiveVideoChat.jsx
import React, { useRef, useEffect, useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Smile,
  Download,
  Monitor,
  PhoneOff,
  Record
} from "lucide-react";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const WS_BASE = API_BASE.replace(/^http/, window.location.protocol === "https:" ? "wss" : "ws");

const LiveVideoChat = ({ userId, peerId }) => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const chatEndRef = useRef(null);

  // WebRTC + streams
  const [pc, setPc] = useState(null);
  const localStreamRef = useRef(null);

  // UI state
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [recording, setRecording] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState("00:00");
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [latency, setLatency] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // connecting|connected|reconnecting|disconnected

  // sockets & recorder
  const signallingWS = useRef(null); // /ws/webrtc/{user_id}
  const recordWS = useRef(null); // /ws/record/private/{user_id}
  const recorderRef = useRef(null);

  // reconnect helpers
  const reconnectTimerRef = useRef(null);
  const retryDelayRef = useRef(1000);

  // typing debounce
  const typingTimeoutRef = useRef(null);

  // --- utility: send via signalling if open ---
  const sendSignal = (obj) => {
    try {
      if (signallingWS.current && signallingWS.current.readyState === WebSocket.OPEN) {
        signallingWS.current.send(JSON.stringify(obj));
      }
    } catch (err) {
      console.warn("sendSignal err", err);
    }
  };

  // --- auto-scroll chat ---
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  // --- call timer ---
  useEffect(() => {
    const t = setInterval(() => {
      if (startTime) {
        const elapsed = Date.now() - startTime;
        const mins = Math.floor(elapsed / 60000);
        const secs = Math.floor((elapsed % 60000) / 1000);
        setCallDuration(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [startTime]);

  // --- connect (set up PC + signaling + local stream + recorder WS) ---
  useEffect(() => {
    // If either missing, don't start
    if (!userId) return;

    const connect = async () => {
      setConnectionStatus((prev) => (prev === "reconnecting" ? "reconnecting" : "connecting"));

      // create peerconnection
      const newPC = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      setPc(newPC);

      // create signalling websocket to private endpoint
      signallingWS.current = new WebSocket(`${WS_BASE}/ws/webrtc/${userId}`);

      signallingWS.current.onopen = () => {
        console.info("[WS] signalling connected");
        setConnectionStatus("connected");
        retryDelayRef.current = 1000;
      };

      signallingWS.current.onclose = () => {
        console.warn("[WS] signalling closed, trying reconnect");
        setConnectionStatus("reconnecting");
        scheduleReconnect();
      };

      signallingWS.current.onerror = (err) => {
        console.error("[WS] signalling error", err);
        try { signallingWS.current.close(); } catch {}
      };

      signallingWS.current.onmessage = async (e) => {
        try {
          const m = JSON.parse(e.data);
          const { type } = m;

          if (type === "offer") {
            // remote sent offer
            await newPC.setRemoteDescription(new RTCSessionDescription(m));
            const answer = await newPC.createAnswer();
            await newPC.setLocalDescription(answer);
            sendSignal({ type: "answer", ...answer, sender: userId, target: m.sender });
          } else if (type === "answer") {
            await newPC.setRemoteDescription(new RTCSessionDescription(m));
          } else if (type === "candidate" && m.candidate) {
            try {
              await newPC.addIceCandidate(new RTCIceCandidate(m.candidate));
            } catch (err) {
              console.warn("addIceCandidate error", err);
            }
          } else if (type === "chat") {
            setMessages((prev) => [...prev, { sender: m.sender, message: m.message }]);
          } else if (type === "typing") {
            setPartnerTyping(true);
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 1800);
          } else if (type === "latency") {
            setLatency(m.ms);
          }
        } catch (err) {
          console.warn("signalling onmessage parse error", err);
        }
      };

      // local stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.current.srcObject = stream;
        localStreamRef.current = stream;

        // add tracks to peer
        stream.getTracks().forEach((t) => newPC.addTrack(t, stream));
      } catch (err) {
        console.error("Failed to getUserMedia", err);
        toast.error("⚠️ Please allow camera & microphone");
      }

      // connect recorder WS but do not start sending yet (MediaRecorder will start when recording toggled)
      recordWS.current = new WebSocket(`${WS_BASE}/ws/record/private/${userId}`);
      recordWS.current.onopen = () => {
        console.info("[WS] record connected");
      };
      recordWS.current.onclose = () => {
        console.info("[WS] record closed");
      };
      recordWS.current.onerror = (err) => {
        console.warn("[WS] record error", err);
      };

      // remote stream event
      newPC.ontrack = (ev) => {
        if (remoteVideo.current && !remoteVideo.current.srcObject) {
          remoteVideo.current.srcObject = ev.streams[0];
          setStartTime(Date.now());
        } else if (remoteVideo.current) {
          // replace if needed
          remoteVideo.current.srcObject = ev.streams[0];
          setStartTime(Date.now());
        }
      };

      // icecandidate -> send to peer (target = peerId)
      newPC.onicecandidate = (ev) => {
        if (ev.candidate && signallingWS.current && signallingWS.current.readyState === WebSocket.OPEN) {
          sendSignal({ type: "candidate", candidate: ev.candidate, sender: userId, target: peerId });
        }
      };
    }; // connect()

    const scheduleReconnect = () => {
      if (reconnectTimerRef.current) return;
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30000);
        connect();
      }, retryDelayRef.current);
    };

    // start initial connection
    connect();

    // cleanup on unmount or when userId/peerId changes
    return () => {
      try { pc?.close(); } catch {}
      try { signallingWS.current?.close(); } catch {}
      try { recordWS.current?.close(); } catch {}
      if (recorderRef.current) {
        try { recorderRef.current.stop(); } catch {}
      }
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, peerId]);

  // --- call (initiate offer) ---
  const callPeer = async () => {
    if (!pc) {
      toast.error("⚠️ Peer connection not ready");
      return;
    }
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal({ type: "offer", ...offer, sender: userId, target: peerId });
    } catch (err) {
      console.error("callPeer err", err);
      toast.error("⚠️ Failed to create offer");
    }
  };

  // --- hang up: close everything and notify backend via close of sockets ---
  const hangUp = () => {
    try { pc?.close(); } catch {}
    try { signallingWS.current?.close(); } catch {}
    try { recordWS.current?.close(); } catch {}
    if (recorderRef.current) {
      try {
        recorderRef.current.stop();
      } catch {}
    }
    setConnectionStatus("disconnected");
    setStartTime(null);
    toast.success("📞 Call ended");
  };

  // --- chat functions ---
  const handleSend = () => {
    if (!newMsg.trim()) return;
    const payload = { type: "chat", message: newMsg.trim(), sender: userId, target: peerId };
    sendSignal(payload);
    setMessages((prev) => [...prev, { sender: "You", message: newMsg.trim() }]);
    setNewMsg("");
  };

  const handleTyping = (e) => {
    setNewMsg(e.target.value);
    // debounce typing notification
    sendSignal({ type: "typing", sender: userId, target: peerId });
  };

  // --- toggles ---
  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !cameraOn;
      setCameraOn(!cameraOn);
    }
  };

  // --- screen share (replace outgoing video track) ---
  const startScreenShare = async () => {
    if (!pc) return toast.error("⚠️ Peer connection not ready");
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      // find sender
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
      if (sender) {
        await sender.replaceTrack(screenTrack);
      }

      // show locally the screen
      if (localVideo.current) localVideo.current.srcObject = screenStream;

      // when screen sharing ends, restore camera
      screenTrack.onended = async () => {
        // restore camera track
        try {
          const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const camTrack = camStream.getVideoTracks()[0];
          if (sender) await sender.replaceTrack(camTrack);
          // set localVideo back to original local stream
          if (localVideo.current) localVideo.current.srcObject = localStreamRef.current;
        } catch (err) {
          console.warn("Failed to restore camera after screen share", err);
        }
      };
    } catch (err) {
      console.error("Screen share failed", err);
      toast.error("⚠️ Screen share failed or denied");
    }
  };

  // --- recording: start/stop MediaRecorder that sends chunks to recordWS ---
  const startRecording = () => {
    if (recording) return;
    const stream = localStreamRef.current;
    if (!stream) return toast.error("⚠️ Local stream not available");

    if (!recordWS.current || recordWS.current.readyState !== WebSocket.OPEN) {
      // Try to re-open a fresh recordWS if closed
      recordWS.current = new WebSocket(`${WS_BASE}/ws/record/private/${userId}`);
      recordWS.current.onopen = () => {
        toast.success("Recording socket reconnected");
        // then start recorder below
      };
      recordWS.current.onerror = (err) => {
        console.warn("recordWS error", err);
        toast.error("⚠️ Recording socket error");
      };
    }

    try {
      const mime = "video/webm;codecs=vp8";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0 && recordWS.current && recordWS.current.readyState === WebSocket.OPEN) {
          // send raw bytes (backend compresses)
          e.data.arrayBuffer().then((buf) => {
            try {
              recordWS.current.send(buf);
            } catch (err) {
              console.warn("recordWS send err", err);
            }
          });
        }
      };
      recorder.onstart = () => {
        setRecording(true);
        toast.success("🔴 Recording started", { id: "recording" });
      };
      recorder.onstop = () => {
        setRecording(false);
        toast.success("💾 Recording stopped", { id: "recording" });
        // backend will save on WS disconnect or its own logic
      };
      recorder.start(1000); // chunk every second
      recorderRef.current = recorder;
    } catch (err) {
      console.error("startRecording err", err);
      toast.error("⚠️ Recording failed to start");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try {
        recorderRef.current.stop();
      } catch (err) {
        console.warn("recorder stop err", err);
      }
    }
    // optionally close recordWS to force backend save (video.py saves on disconnect)
    try {
      recordWS.current?.close();
    } catch {}
  };

  // --- download recording (calls your backend endpoint) ---
  const downloadRecording = async () => {
    try {
      const res = await fetch(`${API_BASE}/private/download/${userId}`);
      if (!res.ok) throw new Error("Download failed");
      const data = await res.json();
      if (data.download_url) {
        const a = document.createElement("a");
        a.href = data.download_url;
        a.download = `private_call_${userId}.webm`;
        a.click();
        toast.success("📥 Recording downloaded!");
      } else {
        toast.error("❌ No recording available yet.");
      }
    } catch (err) {
      console.error("downloadRecording err", err);
      toast.error("⚠️ Failed to download recording");
    }
  };

  // --- UI render ---
  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 grid gap-4 md:grid-cols-2 grid-cols-1">
        {/* Local video */}
        <div className="space-y-2">
          <video
            ref={localVideo}
            autoPlay
            playsInline
            muted
            className={`rounded shadow w-full ${selectedFilter !== "none" ? selectedFilter : ""}`}
          />
          <div className="flex justify-between items-center">
            <p className="font-medium">Your Camera</p>
            <span className="text-sm text-gray-500">⏱️ {callDuration}</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={toggleMic} className="bg-gray-800 p-2 text-white rounded-lg">
              {micOn ? <Mic /> : <MicOff />}
            </button>

            <button onClick={toggleCamera} className="bg-gray-800 p-2 text-white rounded-lg">
              {cameraOn ? <Camera /> : <CameraOff />}
            </button>

            <button onClick={startScreenShare} className="bg-orange-600 hover:bg-orange-700 p-2 text-white rounded-lg flex items-center gap-1">
              <Monitor size={16} /> Share Screen
            </button>

            {!recording ? (
              <button onClick={startRecording} className="bg-red-600 hover:bg-red-700 p-2 text-white rounded-lg flex items-center gap-1">
                <Record size={16} /> Record
              </button>
            ) : (
              <button onClick={stopRecording} className="bg-yellow-600 hover:bg-yellow-700 p-2 text-white rounded-lg flex items-center gap-1">
                Stop
              </button>
            )}

            <button onClick={downloadRecording} className="bg-purple-600 hover:bg-purple-700 p-2 text-white rounded-lg flex items-center gap-1">
              <Download size={16} /> Download
            </button>
          </div>

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="mt-2 p-2 border rounded-lg w-full"
          >
            <option value="none">None</option>
            <option value="grayscale">Grayscale (use CSS utility)</option>
            <option value="sepia">Sepia</option>
            <option value="blur-sm">Slight Blur</option>
            <option value="brightness-125">Bright</option>
            <option value="contrast-200">High Contrast</option>
          </select>
        </div>

        {/* Remote video */}
        <div className="space-y-2">
          <video ref={remoteVideo} autoPlay playsInline className="rounded shadow w-full" />
          <p className="text-center font-medium">
            Partner Camera {latency !== null && <span className="text-xs text-gray-500">(Ping: {latency}ms)</span>}
          </p>
          <p className="text-xs text-gray-500">Status: {connectionStatus}</p>
        </div>

        {/* Chat */}
        <div className="md:col-span-2 bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Chat
          </h3>

          <div className="h-48 overflow-y-auto bg-gray-100 dark:bg-gray-800 p-2 mb-2 border rounded-lg space-y-2">
            {messages.map((msg, i) => {
              const isYou = msg.sender === "You" || msg.sender === userId;
              return (
                <div
                  key={i}
                  className={`max-w-[75%] px-3 py-2 rounded-lg break-words text-sm
                    ${isYou ? "ml-auto bg-blue-600 text-white" : "mr-auto bg-gray-200 text-black dark:bg-gray-700 dark:text-white"}`}
                >
                  <strong className="block text-xs opacity-80 mb-0.5">{isYou ? "You" : msg.sender}</strong>
                  {msg.message}
                </div>
              );
            })}
            {partnerTyping && <p className="text-xs italic text-blue-500">💬 Partner is typing...</p>}
            <div ref={chatEndRef} />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={handleTyping}
              placeholder="Type a message"
              className="flex-1 p-3 rounded-lg border transition-colors
                         bg-white text-black placeholder-gray-500
                         dark:bg-gray-900 dark:text-white dark:placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button onClick={handleSend} className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">Send</button>
              <button className="px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"><Smile size={16} /></button>
            </div>
          </div>
        </div>

        {/* Call controls */}
        <div className="md:col-span-2 flex justify-center gap-4">
          <button onClick={callPeer} className="px-4 py-2 bg-green-600 text-white rounded-lg">Start Call</button>
          <button onClick={hangUp} className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-1"><PhoneOff size={16} /> End Call</button>
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default LiveVideoChat;