// src/pages/relationship/LiveVideoChat.jsx

import React, { useRef, useEffect, useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import { motion } from "framer-motion";
import { Mic, MicOff, Camera, CameraOff, Smile, Download } from "lucide-react";
import { toast } from "react-hot-toast";

const LiveVideoChat = ({ userId, peerId }) => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const [pc, setPc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState("00:00");
  const [selectedFilter, setSelectedFilter] = useState("none");
  const ws = useRef(null);
  const recordWS = useRef(null);
  const recorderRef = useRef(null);
  const localStreamRef = useRef(null);

  // --- Setup peer connection and WebSocket ---
  useEffect(() => {
    const newPeerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    setPc(newPeerConnection);

    // --- Signaling WS ---
    ws.current = new WebSocket(`ws://localhost:8000/ws/webrtc/${userId}`);

    ws.current.onmessage = async (event) => {
      const m = JSON.parse(event.data);

      switch (m.type) {
        case "offer":
          await newPeerConnection.setRemoteDescription(new RTCSessionDescription(m));
          const answer = await newPeerConnection.createAnswer();
          await newPeerConnection.setLocalDescription(answer);
          ws.current.send(
            JSON.stringify({ type: "answer", ...answer, sender: userId, target: m.sender })
          );
          break;

        case "answer":
          await newPeerConnection.setRemoteDescription(new RTCSessionDescription(m));
          break;

        case "candidate":
          await newPeerConnection.addIceCandidate(new RTCIceCandidate(m.candidate));
          break;

        case "chat":
          setMessages((prev) => [...prev, { from: m.sender, text: m.message }]);
          break;

        case "typing":
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2000);
          break;

        case "unavailable":
          toast.error(`❌ User ${m.target} is offline or unreachable`);
          break;

        case "presence":
          if (m.online !== undefined) {
            toast.success(`ℹ️ ${m.target} is ${m.online ? "online" : "offline"}`);
          }
          break;

        default:
          break;
      }
    };

    // --- Local stream + recording ---
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      // Attach to local video
      localVideo.current.srcObject = stream;
      localStreamRef.current = stream;

      // Add tracks to WebRTC
      stream.getTracks().forEach((track) => newPeerConnection.addTrack(track, stream));

      // Recording socket
      recordWS.current = new WebSocket(`ws://localhost:8000/ws/record/private/${userId}`);
      recordWS.current.onopen = () => {
        toast.success("🎥 Recording started", { id: "recording" });

        const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp8" });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && recordWS.current.readyState === WebSocket.OPEN) {
            e.data.arrayBuffer().then((buf) => recordWS.current.send(buf));
          }
        };
        recorder.start(1000); // 1s chunks
        recorderRef.current = recorder;
      };
      recordWS.current.onclose = () => {
        toast.error("⚠️ Recording connection closed unexpectedly", { id: "recording" });
      };
    });

    // --- Remote stream ---
    newPeerConnection.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
      setStartTime(Date.now());
    };

    // --- ICE candidates ---
    newPeerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        ws.current.send(
          JSON.stringify({
            type: "candidate",
            candidate: event.candidate,
            sender: userId,
            target: peerId,
          })
        );
      }
    };

    // Cleanup
    return () => {
      newPeerConnection.close();
      ws.current?.close();
      recordWS.current?.close();
      if (recorderRef.current) {
        recorderRef.current.stop();
        toast.success("💾 Recording saved", { id: "recording" });
      }
    };
  }, [userId, peerId]);

  // --- Call duration timer ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime) {
        const elapsed = Date.now() - startTime;
        const mins = Math.floor(elapsed / 60000);
        const secs = Math.floor((elapsed % 60000) / 1000);
        setCallDuration(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const callPeer = async () => {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws.current.send(
      JSON.stringify({ type: "offer", ...offer, sender: userId, target: peerId })
    );
  };

  const sendMessage = () => {
    if (newMsg.trim() !== "") {
      ws.current.send(
        JSON.stringify({ type: "chat", message: newMsg.trim(), sender: userId, target: peerId })
      );
      setMessages((prev) => [...prev, { from: "You", text: newMsg.trim() }]);
      setNewMsg("");
    }
  };

  const handleTyping = () => {
    ws.current.send(JSON.stringify({ type: "typing", sender: userId, target: peerId }));
  };

  const toggleMic = () => {
    const track = localStreamRef.current.getAudioTracks()[0];
    if (track) {
      track.enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleCamera = () => {
    const track = localStreamRef.current.getVideoTracks()[0];
    if (track) {
      track.enabled = !cameraOn;
      setCameraOn(!cameraOn);
    }
  };

  const handleVoiceToText = async () => {
    alert("🎤 Voice-to-text feature will transcribe soon...");
  };

  const downloadRecording = async () => {
    try {
      const res = await fetch(`http://localhost:8000/private/download/${userId}`);
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
      toast.error("⚠️ Failed to download recording");
    }
  };

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 grid gap-4 md:grid-cols-2 grid-cols-1"
      >
        <div className="space-y-2">
          <video
            ref={localVideo}
            autoPlay
            playsInline
            muted
            className={`rounded shadow w-full filter-${selectedFilter}`}
          />
          <div className="flex justify-between items-center">
            <p className="font-medium">Your Camera</p>
            <span className="text-sm text-gray-500">⏱️ {callDuration}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleMic} className="bg-gray-800 p-2 text-white rounded">
              {micOn ? <Mic /> : <MicOff />}
            </button>
            <button onClick={toggleCamera} className="bg-gray-800 p-2 text-white rounded">
              {cameraOn ? <Camera /> : <CameraOff />}
            </button>
            <button
              onClick={downloadRecording}
              className="bg-purple-600 p-2 text-white rounded flex items-center gap-1"
            >
              <Download size={16} /> Download
            </button>
          </div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="mt-2 p-2 border rounded w-full"
          >
            <option value="none">None</option>
            <option value="grayscale">Grayscale</option>
            <option value="sepia">Sepia</option>
            <option value="blur-sm">Slight Blur</option>
            <option value="brightness-125">Bright</option>
            <option value="contrast-200">High Contrast</option>
          </select>
        </div>

        <div className="space-y-2">
          <video ref={remoteVideo} autoPlay playsInline className="rounded shadow w-full" />
          <p className="text-center font-medium">Partner Camera</p>
        </div>

        <div className="md:col-span-2 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Chat</h3>
          <div className="h-48 overflow-y-auto bg-gray-100 p-2 mb-2 border rounded">
            {messages.map((msg, i) => (
              <div key={i} className="mb-1">
                <strong>{msg.from}:</strong> {msg.text}
              </div>
            ))}
            {isTyping && <p className="text-xs italic text-blue-500">💬 Typing...</p>}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onInput={handleTyping}
              placeholder="Type a message"
              className="flex-1 p-2 border rounded"
            />
            <button onClick={sendMessage} className="px-4 bg-blue-600 text-white rounded">
              Send
            </button>
            <button onClick={handleVoiceToText} className="px-4 bg-gray-700 text-white rounded">
              <Mic size={16} />
            </button>
            <button className="px-4 bg-yellow-500 text-white rounded">
              <Smile size={16} />
            </button>
          </div>
        </div>

        <button
          onClick={callPeer}
          className="p-2 bg-green-600 text-white rounded md:col-span-2"
        >
          Start Video Call
        </button>
      </motion.div>
    </PageWrapper>
  );
};

export default LiveVideoChat;