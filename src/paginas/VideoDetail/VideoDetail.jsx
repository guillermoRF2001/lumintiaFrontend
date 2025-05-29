import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../componentes/Header/Header";
import AvatarPlaceholder from "../../componentes/AvatarPlaceholder/AvatarPlaceholder";
import "./VideoDetail.css";

function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = loggedInUser?.id;
  const isAdmin = loggedInUser?.is_admin;

  useEffect(() => {
    const fetchVideoAndUser = async () => {
      try {
        // Obtener detalles del video
        const videoResponse = await fetch(`http://localhost:4000/api/videos/${id}`);
        const videoData = await videoResponse.json();
        setVideo(videoData);

        // Obtener detalles del usuario usando el user_id del video
        const userResponse = await fetch(`http://localhost:4000/api/users/${videoData.user_id}`);
        const userData = await userResponse.json();
        setUser(userData);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoAndUser();
  }, [id]);

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
        <div className="video-info">
          <h1>{video.title}</h1>

          <div className="video-user" onClick={goToUserProfile}>
            {/* Mostrar imagen de perfil del usuario si existe */}
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name}
                className="video-user-avatar"
              />
            ) : (
              <AvatarPlaceholder
                name={user.name || `${user.id}`}
                size={40}
              />
            )}
            <span className="video-user-name">
              {/* Mostrar el username del usuario */}
              {user.name || `${user.id}`}
            </span>
          </div>

          <p className="video-stats">
            {video.views} visualizaciones • {video.likes} likes
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
  );
}

export default VideoDetail;
