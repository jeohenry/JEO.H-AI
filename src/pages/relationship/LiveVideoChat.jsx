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
  Record,
} from "lucide-react";
import { toast } from "react-hot-toast";
import API from "@/api"; // ✅ Use shared axios instance from api.jsx

/* ───────── 🌐 Local constants ───────── */
const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8000";
const WS_BASE = API_BASE.replace(
  /^http/,
  window.location.protocol === "https:" ? "wss" : "ws"
);

const LiveVideoChat = ({ userId, peerId }) => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const chatEndRef = useRef(null);

  // WebRTC & streams
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
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  // WebSocket & recorder
  const signallingWS = useRef(null);
  const recordWS = useRef(null);
  const recorderRef = useRef(null);

  // reconnect
  const reconnectTimerRef = useRef(null);
  const retryDelayRef = useRef(1000);
  const typingTimeoutRef = useRef(null);

  // ───── send signal safely ─────
  const sendSignal = (obj) => {
    try {
      if (
        signallingWS.current &&
        signallingWS.current.readyState === WebSocket.OPEN
      ) {
        signallingWS.current.send(JSON.stringify(obj));
      }
    } catch (err) {
      console.warn("sendSignal err", err);
    }
  };

  // ───── auto-scroll chat ─────
  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  // ───── call timer ─────
  useEffect(() => {
    const t = setInterval(() => {
      if (startTime) {
        const elapsed = Date.now() - startTime;
        const mins = Math.floor(elapsed / 60000);
        const secs = Math.floor((elapsed % 60000) / 1000);
        setCallDuration(
          `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
        );
      }
    }, 1000);
    return () => clearInterval(t);
  }, [startTime]);

  // ───── main connection logic ─────
  useEffect(() => {
    if (!userId) return;

    const connect = async () => {
      setConnectionStatus((prev) =>
        prev === "reconnecting" ? "reconnecting" : "connecting"
      );

      const newPC = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      setPc(newPC);

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
        try {
          signallingWS.current.close();
        } catch {}
      };

      signallingWS.current.onmessage = async (e) => {
        try {
          const m = JSON.parse(e.data);
          const { type } = m;

          if (type === "offer") {
            await newPC.setRemoteDescription(new RTCSessionDescription(m));
            const answer = await newPC.createAnswer();
            await newPC.setLocalDescription(answer);
            sendSignal({
              type: "answer",
              ...answer,
              sender: userId,
              target: m.sender,
            });
          } else if (type === "answer") {
            await newPC.setRemoteDescription(new RTCSessionDescription(m));
          } else if (type === "candidate" && m.candidate) {
            await newPC.addIceCandidate(new RTCIceCandidate(m.candidate));
          } else if (type === "chat") {
            setMessages((prev) => [
              ...prev,
              { sender: m.sender, message: m.message },
            ]);
          } else if (type === "typing") {
            setPartnerTyping(true);
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(
              () => setPartnerTyping(false),
              1800
            );
          } else if (type === "latency") {
            setLatency(m.ms);
          }
        } catch (err) {
          console.warn("WS message parse error", err);
        }
      };

      // local media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localVideo.current.srcObject = stream;
        localStreamRef.current = stream;
        stream.getTracks().forEach((t) => newPC.addTrack(t, stream));
      } catch (err) {
        console.error("getUserMedia failed", err);
        toast.error("⚠️ Please allow camera & microphone");
      }

      // record WS
      recordWS.current = new WebSocket(`${WS_BASE}/ws/record/private/${userId}`);

      // remote track
      newPC.ontrack = (ev) => {
        remoteVideo.current.srcObject = ev.streams[0];
        setStartTime(Date.now());
      };

      // ICE
      newPC.onicecandidate = (ev) => {
        if (ev.candidate) {
          sendSignal({
            type: "candidate",
            candidate: ev.candidate,
            sender: userId,
            target: peerId,
          });
        }
      };
    };

    const scheduleReconnect = () => {
      if (reconnectTimerRef.current) return;
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30000);
        connect();
      }, retryDelayRef.current);
    };

    connect();

    return () => {
      try {
        pc?.close();
      } catch {}
      try {
        signallingWS.current?.close();
      } catch {}
      try {
        recordWS.current?.close();
      } catch {}
      if (recorderRef.current) {
        try {
          recorderRef.current.stop();
        } catch {}
      }
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, peerId]);

  // ───── call, hangup, and controls ─────
  const callPeer = async () => {
    if (!pc) return toast.error("⚠️ Peer connection not ready");
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal({ type: "offer", ...offer, sender: userId, target: peerId });
    } catch (err) {
      toast.error("⚠️ Failed to start call");
    }
  };

  const hangUp = () => {
    try {
      pc?.close();
      signallingWS.current?.close();
      recordWS.current?.close();
      recorderRef.current?.stop();
    } catch {}
    setConnectionStatus("disconnected");
    setStartTime(null);
    toast.success("📞 Call ended");
  };

  const handleSend = () => {
    if (!newMsg.trim()) return;
    sendSignal({
      type: "chat",
      message: newMsg.trim(),
      sender: userId,
      target: peerId,
    });
    setMessages((p) => [...p, { sender: "You", message: newMsg.trim() }]);
    setNewMsg("");
  };

  const handleTyping = (e) => {
    setNewMsg(e.target.value);
    sendSignal({ type: "typing", sender: userId, target: peerId });
  };

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

  // ───── screen share ─────
  const startScreenShare = async () => {
    if (!pc) return toast.error("⚠️ Peer connection not ready");
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = pc
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");

      if (sender) await sender.replaceTrack(screenTrack);
      localVideo.current.srcObject = screenStream;

      screenTrack.onended = async () => {
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const camTrack = camStream.getVideoTracks()[0];
        if (sender) await sender.replaceTrack(camTrack);
        localVideo.current.srcObject = localStreamRef.current;
      };
    } catch {
      toast.error("⚠️ Screen share denied");
    }
  };

  // ───── recording ─────
  const startRecording = () => {
    if (recording) return;
    const stream = localStreamRef.current;
    if (!stream) return toast.error("⚠️ No local stream");

    if (!recordWS.current || recordWS.current.readyState !== WebSocket.OPEN) {
      recordWS.current = new WebSocket(`${WS_BASE}/ws/record/private/${userId}`);
    }

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8",
      });
      recorder.ondataavailable = (e) => {
        if (
          e.data?.size > 0 &&
          recordWS.current?.readyState === WebSocket.OPEN
        ) {
          e.data.arrayBuffer().then((buf) => {
            recordWS.current.send(buf);
          });
        }
      };
      recorder.onstart = () => {
        setRecording(true);
        toast.success("🔴 Recording started");
      };
      recorder.onstop = () => {
        setRecording(false);
        toast.success("💾 Recording stopped");
      };
      recorder.start(1000);
      recorderRef.current = recorder;
    } catch {
      toast.error("⚠️ Recording failed");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recordWS.current?.close();
  };

  // ✅ Download recording using shared API
  const downloadRecording = async () => {
    try {
      const res = await API.get(`/private/download/${userId}`);
      if (res.data.download_url) {
        const a = document.createElement("a");
        a.href = res.data.download_url;
        a.download = `private_call_${userId}.webm`;
        a.click();
        toast.success("📥 Recording downloaded!");
      } else {
        toast.error("❌ No recording available yet.");
      }
    } catch (err) {
      console.error("Download failed", err);
      toast.error("⚠️ Failed to download recording");
    }
  };

  // ───── UI ─────
  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 grid gap-4 md:grid-cols-2 grid-cols-1"
      >
        {/* Local video and controls */}
        {/* ... (UI unchanged for brevity, same as your existing layout) ... */}
      </motion.div>
    </PageWrapper>
  );
};

export default LiveVideoChat;