// src/pages/GroupVideoCall.jsx
import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";

const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

let peers = {};

const GroupVideoCall = () => {
  const localVideoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [participants, setParticipants] = useState(1);
  const [typingUser, setTypingUser] = useState(null);
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room") || "default";
  const navigate = useNavigate();
  const ws = useRef(null);
  const localStream = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/call/${roomId}`);

    ws.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const { type, from, offer, answer, candidate, chat, typing, join } = data;

      if (typing) {
        setTypingUser(from);
        setTimeout(() => setTypingUser(null), 1500);
        return;
      }

      if (chat) {
        toast.success("💬 New message received");
        setMessages((prev) => [...prev, { from, text: chat }]);
        return;
      }

      if (join) {
        setParticipants((prev) => prev + 1);
        toast(`👤 ${from} joined the call`);
      }

      switch (type) {
        case "offer":
          peers[from] = createPeerConnection(from);
          await peers[from].setRemoteDescription(new RTCSessionDescription(offer));
          const ans = await peers[from].createAnswer();
          await peers[from].setLocalDescription(ans);
          ws.current.send(JSON.stringify({ type: "answer", to: from, answer: ans, from: roomId }));
          break;

        case "answer":
          if (peers[from]) await peers[from].setRemoteDescription(new RTCSessionDescription(answer));
          break;

        case "candidate":
          if (peers[from]) await peers[from].addIceCandidate(new RTCIceCandidate(candidate));
          break;

        default:
          break;
      }
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream.current = stream;
        localVideoRef.current.srcObject = stream;
        ws.current.onopen = () => {
          ws.current.send(JSON.stringify({ type: "join", from: roomId }));
        };
      })
      .catch((err) => console.error("Media access error:", err));

    return () => {
      ws.current?.close();
      Object.values(peers).forEach((pc) => pc.close());
    };
  }, [roomId]);

  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection(servers);
    localStream.current.getTracks().forEach((track) => pc.addTrack(track, localStream.current));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        ws.current.send(JSON.stringify({ type: "candidate", candidate: e.candidate, from: roomId, to: peerId }));
      }
    };

    pc.ontrack = (e) => {
      setRemoteStreams((prev) => ({ ...prev, [peerId]: e.streams[0] }));
    };

    return pc;
  };

  const toggleCamera = () => {
    const stream = localVideoRef.current.srcObject;
    const videoTrack = stream.getVideoTracks()[0];
    videoTrack.enabled = !cameraOn;
    setCameraOn(!cameraOn);
  };

  const toggleMic = () => {
    const stream = localVideoRef.current.srcObject;
    const audioTrack = stream.getAudioTracks()[0];
    audioTrack.enabled = !micOn;
    setMicOn(!micOn);
  };

  const leaveCall = () => {
    const stream = localVideoRef.current.srcObject;
    stream.getTracks().forEach((track) => track.stop());
    toast("📴 You left the call");
    navigate("/");
  };

  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      ws.current.send(JSON.stringify({ chat: newMessage, from: roomId }));
      setMessages((prev) => [...prev, { from: "You", text: newMessage }]);
      setNewMessage("");
    }
  };

  const handleTyping = () => {
    ws.current.send(JSON.stringify({ typing: true, from: roomId }));
  };

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="p-4"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">🎥 Group Video Call</h2>

        <div className="text-center mb-4">
          <Link
            to="/relationship"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            ← Back to Relationship
          </Link>
        </div>

        <p className="text-center text-sm mb-4">👥 Participants: {participants}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <video ref={localVideoRef} autoPlay muted className="w-full max-w-lg rounded shadow" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
              {Object.entries(remoteStreams).map(([id, stream]) => (
                <video
                  key={id}
                  autoPlay
                  playsInline
                  ref={(video) => video && (video.srcObject = stream)}
                  className="rounded shadow w-full"
                />
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button onClick={toggleCamera} className="bg-blue-500 px-4 py-2 rounded text-white">
                {cameraOn ? "📷 Off" : "📷 On"}
              </button>
              <button onClick={toggleMic} className="bg-green-500 px-4 py-2 rounded text-white">
                {micOn ? "🎙️ Mute" : "🎙️ Unmute"}
              </button>
              <button onClick={leaveCall} className="bg-red-600 px-4 py-2 rounded text-white">
                ❌ Leave
              </button>
            </div>
          </div>

          <div className="bg-white border p-4 rounded shadow h-[480px] overflow-y-scroll">
            <h3 className="text-lg font-semibold mb-2">💬 Live Chat</h3>
            <div className="space-y-2">
              {messages.map((msg, idx) => (
                <div key={idx} className="bg-gray-100 p-2 rounded">
                  <strong>{msg.from}:</strong> {msg.text}
                </div>
              ))}
              {typingUser && (
                <p className="text-xs text-gray-500 italic">✍️ {typingUser} is typing...</p>
              )}
            </div>
            <div className="mt-4 flex">
              <input
                type="text"
                className="border p-2 rounded flex-1 mr-2"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleTyping}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage} className="bg-indigo-600 text-white px-4 py-2 rounded">
                ➤
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default GroupVideoCall;










