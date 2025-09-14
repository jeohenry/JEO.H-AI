// src/components/GroupVideoCall.jsx
import React, { useEffect, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const WS_BASE = API_BASE.replace(
  /^http/,
  window.location.protocol === "https:" ? "wss" : "ws"
);

export default function GroupVideoCall({ roomId, userId }) {
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const streamsRef = useRef({});
  const localStreamRef = useRef(null);
  const currentVideoTrackRef = useRef(null);
  const recorderSocketRef = useRef(null);

  // 🔥 NEW refs for reconnect logic
  const reconnectTimerRef = useRef(null);
  const retryDelayRef = useRef(1000);

  const [remoteStreams, setRemoteStreams] = useState({});
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isRecording, setIsRecording] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  // 🔥 NEW states for mute/unmute
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  // ------------------------
  // Setup WebSocket
  // ------------------------
  useEffect(() => {
    if (!roomId || !userId) return;

    const connect = () => {
      setConnectionStatus((prev) =>
        prev === "reconnecting" ? "reconnecting" : "connecting"
      );

      const socket = new WebSocket(`${WS_BASE}/ws/call/${roomId}`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("[WS] Connected");
        retryDelayRef.current = 1000;
        setConnectionStatus("connected");
      };

      socket.onclose = () => {
        console.warn("[WS] Disconnected, retrying...");
        setConnectionStatus("reconnecting");
        scheduleReconnect();
      };

      socket.onerror = (err) => {
        console.error("[WS] Error:", err);
        socket.close();
      };

      socket.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        const { type, from, data } = msg;

        if (from === userId) return;

        switch (type) {
          case "participants": // 🔥 sync participants list
            setParticipants(data);
            peersRef.current = {};
            streamsRef.current = {};
            setRemoteStreams({});
            break;
          case "join":
            setParticipants((prev) => [...new Set([...prev, from])]);
            await createPeerConnection(from, true);
            break;
          case "leave":
            setParticipants((prev) => prev.filter((p) => p !== from));
            break;
          case "offer":
            const pcOffer = await createPeerConnection(from, false);
            await pcOffer.setRemoteDescription(new RTCSessionDescription(data));
            const answer = await pcOffer.createAnswer();
            await pcOffer.setLocalDescription(answer);
            sendSignal({ type: "answer", from: userId, to: from, data: answer });
            break;
          case "answer":
            const pcAnswer = peersRef.current[from];
            if (pcAnswer) {
              await pcAnswer.setRemoteDescription(new RTCSessionDescription(data));
            }
            break;
          case "ice-candidate":
            if (data) {
              const pc = peersRef.current[from];
              if (pc) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(data));
                } catch (err) {
                  console.warn("Error adding ICE candidate:", err);
                }
              }
            }
            break;
          case "chat":
            setMessages((prev) => [...prev, { sender: from, message: data }]);
            break;
          default:
            break;
        }
      };
    };

    const scheduleReconnect = () => {
      if (reconnectTimerRef.current) return;

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30000); // max 30s
        connect();
      }, retryDelayRef.current);
    };

    connect();

    return () => {
      socketRef.current?.close();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
      setConnectionStatus("disconnected");
    };
  }, [roomId, userId]);

  // ------------------------
  // Helpers
  // ------------------------
  const sendSignal = (msg) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  };

  const createPeerConnection = async (peerId, isInitiator) => {
    if (peersRef.current[peerId]) return peersRef.current[peerId];

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Local tracks
    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
    });

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: "ice-candidate",
          from: userId,
          to: peerId,
          data: event.candidate,
        });
      }
    };

    // Remote stream
    const remoteStream = new MediaStream();
    streamsRef.current[peerId] = remoteStream;
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
      setRemoteStreams((prev) => ({ ...prev, [peerId]: remoteStream }));
    };

    peersRef.current[peerId] = pc;

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal({ type: "offer", from: userId, to: peerId, data: offer });
    }

    return pc;
  };

  const startLocalStream = async () => {
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    currentVideoTrackRef.current = localStreamRef.current.getVideoTracks()[0];
    return localStreamRef.current;
  };

  const replaceVideoTrack = (newTrack) => {
    if (localStreamRef.current) {
      const oldTrack = currentVideoTrackRef.current;
      if (oldTrack) localStreamRef.current.removeTrack(oldTrack);
      localStreamRef.current.addTrack(newTrack);
      currentVideoTrackRef.current = newTrack;
    }

    Object.values(peersRef.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
      if (sender) sender.replaceTrack(newTrack);
    });
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      replaceVideoTrack(screenTrack);

      screenTrack.onended = async () => {
        await stopScreenShare();
      };

      return screenStream;
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const stopScreenShare = async () => {
    const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const camTrack = camStream.getVideoTracks()[0];
    replaceVideoTrack(camTrack);
    return camStream;
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = { type: "chat", from: userId, data: newMessage.trim() };
    sendSignal(msg);
    setMessages((prev) => [...prev, { sender: userId, message: newMessage.trim() }]);
    setNewMessage("");
  };

  // ------------------------
  // NEW: Mute/Unmute Controls
  // ------------------------
  const toggleAudio = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsAudioMuted(!track.enabled);
    });
  };

  const toggleVideo = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsVideoMuted(!track.enabled);
    });
  };

  // ------------------------
  // Recording
  // ------------------------
  const startRecording = async () => {
    if (!localStreamRef.current) return;

    const recorderSocket = new WebSocket(`${WS_BASE}/ws/record/group/${roomId}`);
    recorderSocketRef.current = recorderSocket;

    recorderSocket.onopen = () => {
      const mediaRecorder = new MediaRecorder(localStreamRef.current, {
        mimeType: "video/webm; codecs=vp8,opus",
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0 && recorderSocket.readyState === WebSocket.OPEN) {
          e.data.arrayBuffer().then((buf) => recorderSocket.send(buf));
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);

      recorderSocket.onclose = () => {
        mediaRecorder.stop();
        setIsRecording(false);
      };
    };
  };

  const stopRecording = () => {
    recorderSocketRef.current?.close();
    setIsRecording(false);
  };

  const downloadRecording = async () => {
    const res = await fetch(`${API_BASE}/group/download/${roomId}`);
    if (res.ok) {
      const { download_url } = await res.json();
      window.open(download_url, "_blank");
    } else {
      alert("No recording found");
    }
  };

  // ------------------------
  // UI
  // ------------------------
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-center">📹 Group Call Room: {roomId}</h2>
      <p className="text-center text-sm">Status: {connectionStatus}</p>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={async () => {
            const stream = await startLocalStream();
            const video = document.getElementById("local-video");
            if (video) video.srcObject = stream;
          }}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Start Camera
        </button>
        <button onClick={toggleAudio} className="px-3 py-1 bg-gray-700 text-white rounded">
          {isAudioMuted ? "Unmute Audio" : "Mute Audio"}
        </button>
        <button onClick={toggleVideo} className="px-3 py-1 bg-gray-700 text-white rounded">
          {isVideoMuted ? "Unmute Video" : "Mute Video"}
        </button>
        <button
          onClick={startScreenShare}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Share Screen
        </button>
        <button
          onClick={stopScreenShare}
          className="px-3 py-1 bg-gray-600 text-white rounded"
        >
          Stop Share
        </button>
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-3 py-1 bg-yellow-600 text-white rounded"
          >
            Stop Recording
          </button>
        )}
        <button
          onClick={downloadRecording}
          className="px-3 py-1 bg-indigo-600 text-white rounded"
        >
          Download Recording
        </button>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
        <video
          id="local-video"
          autoPlay
          playsInline
          muted
          className="w-full h-48 bg-black rounded"
        ></video>
        {Object.entries(remoteStreams).map(([peerId, stream]) => (
          <video
            key={peerId}
            autoPlay
            playsInline
            ref={(el) => {
              if (el && stream) el.srcObject = stream;
            }}
            className="w-full h-48 bg-black rounded"
          ></video>
        ))}
      </div>

      {/* Participants */}
      <div>
        <h3 className="font-semibold">👥 Participants</h3>
        <ul className="list-disc pl-5">
          {participants.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>

      {/* Chat */}
      <div>
        <h3 className="font-semibold mb-2">💬 Chat</h3>
        <div className="border h-40 overflow-y-auto p-2 rounded bg-gray-100 dark:bg-gray-800">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`px-3 py-2 my-1 rounded-lg text-sm w-fit max-w-[75%] ${
                m.sender === userId
                  ? "ml-auto bg-blue-600 text-white"
                  : "mr-auto bg-gray-300 dark:bg-gray-700 dark:text-white"
              }`}
            >
              <strong className="block text-xs opacity-70">{m.sender}</strong>
              {m.message}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border px-3 py-2 rounded-lg bg-white text-black dark:bg-gray-900 dark:text-white"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}