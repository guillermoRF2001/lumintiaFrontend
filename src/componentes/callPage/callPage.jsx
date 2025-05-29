import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "peerjs";
import Swal from "sweetalert2";
import "./CallPage.css";

const socket = io("http://localhost:4000");

const CallPage = () => {
  const { id: roomId } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const callInstance = useRef(null);
  const localStream = useRef(null);
  const screenStream = useRef(null);
  const [peerId, setPeerId] = useState("");
  const [callStatus, setCallStatus] = useState("Conectando...");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const callUser = useCallback((peerIdToCall, stream) => {
    if (!peerInstance.current || !stream || callInstance.current) return;

    setCallStatus(`Llamando a ${peerIdToCall}...`);
    const call = peerInstance.current.call(peerIdToCall, stream);
    setIsCallActive(true);
    callInstance.current = call;

    call.on("stream", (remoteStream) => {
      remoteVideoRef.current.srcObject = remoteStream;
      setCallStatus("En llamada...");
    });

    call.on("close", () => {
      remoteVideoRef.current.srcObject = null;
      callInstance.current = null;
      setIsCallActive(false);
      setCallStatus("Llamada finalizada");
    });

    call.on("error", (err) => {
      setCallStatus(`Error: ${err.message}`);
    });
  }, []);

  useEffect(() => {
    const peer = new Peer({
      debug: 3,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" }
        ]
      }
    });

    peer.on("open", (id) => {
      setPeerId(id);
      socket.emit("register-peer", id);

      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localVideoRef.current.srcObject = stream;
          localStream.current = stream;
          socket.emit("join-call", roomId);
        })
        .catch((err) => {
          setCallStatus(`Error: ${err.message}`);
          Swal.fire({
            title: "Error de permisos",
            text: "No se pudo acceder a la cámara o micrófono.",
            icon: "error"
          });
        });
    });

    peer.on("call", (call) => {
      if (callInstance.current) {
        call.close();
        return;
      }

      call.answer(localStream.current);
      setIsCallActive(true);
      callInstance.current = call;

      call.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
        setCallStatus("En llamada...");
      });

      call.on("close", () => {
        remoteVideoRef.current.srcObject = null;
        callInstance.current = null;
        setIsCallActive(false);
        setCallStatus("Llamada finalizada");
      });

      call.on("error", (err) => {
        setCallStatus(`Error: ${err.message}`);
      });
    });

    peer.on("error", (err) => {
      setCallStatus(`Error: ${err.message}`);
      Swal.fire({
        title: "Error de conexión",
        text: "No se pudo establecer la conexión P2P.",
        icon: "error"
      });
    });

    socket.on("all-users", (users) => {
      if (users.length > 0) {
        setCallStatus(`Conectando con ${users.length} participante(s)...`);
        users.forEach((peerId) => {
          if (!callInstance.current) {
            callUser(peerId, localStream.current);
          }
        });
      } else {
        setCallStatus("Esperando a otros participantes...");
      }
    });

    socket.on("user-joined", (newPeerId) => {
      if (!callInstance.current && localStream.current) {
        callUser(newPeerId, localStream.current);
      }
    });

    peerInstance.current = peer;

    return () => {
      socket.emit("leave-call", roomId);
      if (callInstance.current) callInstance.current.close();
      if (peerInstance.current) peerInstance.current.destroy();
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStream.current) {
        screenStream.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId, callUser]);

  const endCall = () => {
    if (callInstance.current) {
      callInstance.current.close();
    }

    setTimeout(() => {
      window.close();
      if (!window.closed) {
        Swal.fire({
          title: "Llamada finalizada",
          text: "Puedes cerrar esta pestaña manualmente.",
          icon: "info"
        });
      }
    }, 500);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        screenStream.current = screen;
        localVideoRef.current.srcObject = screen;

        const videoTrack = screen.getVideoTracks()[0];
        const sender = callInstance.current?.peerConnection
          .getSenders()
          .find((s) => s.track.kind === "video");

        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }

        videoTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error al compartir pantalla:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStream.current) {
      screenStream.current.getTracks().forEach((track) => track.stop());
    }

    if (localStream.current) {
      const cameraTrack = localStream.current.getVideoTracks()[0];
      const sender = callInstance.current?.peerConnection
        .getSenders()
        .find((s) => s.track.kind === "video");

      if (sender && cameraTrack) {
        sender.replaceTrack(cameraTrack);
      }

      localVideoRef.current.srcObject = localStream.current;
    }

    setIsScreenSharing(false);
  };

  const handleFullscreen = (ref) => {
    if (ref.current.requestFullscreen) {
      ref.current.requestFullscreen();
    } else if (ref.current.webkitRequestFullscreen) {
      ref.current.webkitRequestFullscreen();
    } else if (ref.current.mozRequestFullScreen) {
      ref.current.mozRequestFullScreen();
    } else if (ref.current.msRequestFullscreen) {
      ref.current.msRequestFullscreen();
    }
  };

  return (
    <div className="call-container">
      <div className="call-header">
        <h2 className="call-title">Llamada en curso</h2>
        <div className="call-info">
          <p><strong>Sala ID:</strong> {roomId}</p>
          <p><strong>Tu Peer ID:</strong> {peerId}</p>
        </div>
      </div>

      <div className="call-status">{callStatus}</div>

      <div className="video-wrapper">
        <div
          className="video-box local-video"
          onClick={() => handleFullscreen(localVideoRef)}
        >
          <video ref={localVideoRef} autoPlay muted playsInline />
          <div className="video-label">Tu cámara</div>
        </div>
        <div
          className="video-box remote-video"
          onClick={() => handleFullscreen(remoteVideoRef)}
        >
          <video ref={remoteVideoRef} autoPlay playsInline />
          <div className="video-label">Participante</div>
        </div>
      </div>

      <div className="call-controls">
        <button
          className="screen-share-button"
          onClick={toggleScreenShare}
          disabled={!isCallActive}
        >
          {isScreenSharing ? "Detener compartir pantalla" : "Compartir pantalla"}
        </button>
        <button
          className="end-call-button"
          onClick={endCall}
          disabled={!isCallActive}
        >
          Finalizar llamada
        </button>
      </div>
    </div>
  );
};

export default CallPage;
