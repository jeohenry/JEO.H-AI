// src/hooks/useWebRTCChat.js
import { useEffect, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const WS_BASE = API_BASE.replace(
  /^http/,
  window.location.protocol === "https:" ? "wss" : "ws"
);

export const useWebRTCChat = (roomId, userId) => {
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const streamsRef = useRef({});
  const localStreamRef = useRef(null);
  const currentVideoTrackRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const retryDelayRef = useRef(1000);

  const [remoteStreams, setRemoteStreams] = useState({});
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  // values: "connecting" | "connected" | "reconnecting" | "disconnected"

  useEffect(() => {
    if (!roomId || !userId) return;

    const connect = () => {
      setConnectionStatus((prev) =>
        prev === "reconnecting" ? "reconnecting" : "connecting"
      );

      const socket = new WebSocket(`${WS_BASE}/webrtc/ws/${roomId}/${userId}`);
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

        if (type === "participants") {
          setParticipants(data);
          // reset state on reconnect
          peersRef.current = {};
          streamsRef.current = {};
          setRemoteStreams({});
        }

        if (type === "chat") {
          setMessages((prev) => [...prev, { sender: from, message: data }]);
        }

        if (type === "join") {
          setParticipants(data);
          await createPeerConnection(from, true);
        }

        if (type === "leave") {
          setParticipants(data);
        }

        if (type === "offer") {
          const pc = await createPeerConnection(from, false);
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal({ type: "answer", from: userId, to: from, data: answer });
        }

        if (type === "answer") {
          const pc = peersRef.current[from];
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(data));
          }
        }

        if (type === "ice-candidate" && data) {
          const pc = peersRef.current[from];
          if (pc) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(data));
            } catch (err) {
              console.warn("Error adding ICE candidate:", err);
            }
          }
        }
      };
    };

    const scheduleReconnect = () => {
      if (reconnectTimerRef.current) return;

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30000); // cap 30s
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
      setConnectionStatus("disconnected");
    };
  }, [roomId, userId]);

  // --- Helpers ---
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

    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
    });

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

  const sendMessage = (text) => {
    const msg = { type: "chat", from: userId, data: text };
    sendSignal(msg);
    setMessages((prev) => [...prev, { sender: userId, message: text }]);
  };

  return {
    localStream: localStreamRef,
    remoteStreams,
    participants,
    connectionStatus, // ✅ expose to UI
    startLocalStream,
    startScreenShare,
    stopScreenShare,
    sendMessage,
    messages,
  };
};