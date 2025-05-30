import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../componentes/Header/Header";
import AvatarPlaceholder from "../../componentes/AvatarPlaceholder/AvatarPlaceholder";
import {
  getVideoById,
  incrementVideoViews,
  getCommentsByVideoId,
  addCommentToVideo,
  incrementVideoLikes,
} from "../../api/videoApi";
import "./VideoDetail.css";

function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [likes, setLikes] = useState(0); 

  const mensajesContainerRef = useRef(null);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = loggedInUser?.id;
  const currentUserName = loggedInUser?.name || loggedInUser?.email || "Anonimo";
  const isAdmin = loggedInUser?.is_admin;

  useEffect(() => {
    const fetchVideoUserComments = async () => {
      try {
        setIsLoading(true);

        const videoData = await getVideoById(id);
        setVideo(videoData);
        setLikes(videoData.likes || 0); 

        await incrementVideoViews(videoData.id);

        const userResponse = await fetch(
          `http://localhost:4000/api/users/${videoData.user_id}`
        );
        const userData = await userResponse.json();
        setUser(userData);

        const commentsData = await getCommentsByVideoId(videoData.id);
        setComments(Array.isArray(commentsData) ? commentsData.reverse() : []);
      } catch (error) {
        console.error("Error al cargar video, usuario o comentarios:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoUserComments();
  }, [id]);

  useEffect(() => {
    if (mensajesContainerRef.current) {
      mensajesContainerRef.current.scrollTop = 0;
    }
  }, [comments]);

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;

    try {
      const newComment = { usuario: currentUserName, texto: newCommentText.trim() };
      const updatedComments = await addCommentToVideo(video.id, newComment);

      setComments(Array.isArray(updatedComments) ? updatedComments : [...comments, newComment]);
      setNewCommentText("");
    } catch (error) {
      console.error("Error al agregar comentario:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleLikeClick = async () => {
    try {
      const data = await incrementVideoLikes(video.id);
      setLikes(data.likes);
    } catch (error) {
      console.error("Error incrementando likes:", error);
    }
  };

  if (isLoading) return <div>Cargando video...</div>;
  if (!video || !user) return <div>Video o usuario no encontrado.</div>;

  const handleEditClick = () => {
    navigate(`/edit/${video.id}`);
  };

  const goToUserProfile = () => {
    navigate(`/teacher/${video.user_id}`);
  };

  return (
    <div className="video-detail-page">
      <Header />
      <div className="video-container">
        <div className="video-player">
          <video
            src={video.video_url}
            controls
            autoPlay
            poster={video.thumbnail_url || "/placeholder.jpg"}
          />
        </div>

        {/* Envuelve .video-info para que el botón se posicione dentro */}
        <div style={{ position: "relative" }}>
          <button
            onClick={handleLikeClick}
            className="like-button"
            title="Me gusta"
          >
            👍 {likes}
          </button>

          <div className="video-info">
            <h1>{video.title}</h1>

            <div
              className="video-user"
              onClick={goToUserProfile}
              style={{ cursor: "pointer" }}
            >
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  className="video-user-avatar"
                />
              ) : (
                <AvatarPlaceholder name={user.name || `${user.id}`} size={40} />
              )}
              <span className="video-user-name">{user.name || `${user.id}`}</span>
            </div>

            <p className="video-stats">
              {video.views} visualizaciones 
            </p>

            <p className="video-description">{video.description}</p>

            {(video.user_id === currentUserId || isAdmin) && (
              <button className="edit-button" onClick={handleEditClick}>
                Editar Video
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="comments-section">
        <h2>Comentarios</h2>
        <div className="chat-input-container">
          <textarea
            className="chat-input"
            placeholder="Escribe un comentario..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            style={{ resize: "none" }}
          />
          <button onClick={handleAddComment} className="send-button">
            ➤
          </button>
        </div>
        <div className="mensajes-container" ref={mensajesContainerRef}>
          <ul className="ul-mensajes">
            {comments.length === 0 && (
              <li className="li-mensaje">No hay comentarios aún.</li>
            )}
            {comments.map((comment, idx) => (
              <li
                key={idx}
                className={`li-mensaje ${
                  comment.usuario === currentUserName
                    ? "own-message"
                    : "other-message"
                }`}
              >
                <strong>{comment.usuario}:</strong> {comment.texto}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default VideoDetail;
