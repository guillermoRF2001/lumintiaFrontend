import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUsers } from "../../api/userApi";
import { getVideos } from "../../api/videoApi";
import Header from "../../componentes/Header/Header";
import AvatarPlaceholder from "../../componentes/AvatarPlaceholder/AvatarPlaceholder";
import "../HomeVideo/HomeVideo.css";
import "./TeacherDetail.css"; 

const TeacherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await getUsers();
        const selectedTeacher = users.find(
          (user) => user.id.toString() === id && user.role === "teacher"
        );

        if (!selectedTeacher) {
          setLoading(false);
          return;
        }

        setTeacher(selectedTeacher);

        const allVideos = await getVideos();

        // Enriquecemos videos con datos del usuario (el profesor)
        const teacherVideos = allVideos
          .filter((video) => video.user_id.toString() === id)
          .map((video) => ({
            ...video,
            user: selectedTeacher,
          }));

        setVideos(teacherVideos);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Solo filtramos por título, ignoramos el usuario
  const filteredVideos = videos.filter((video) =>
    video.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Crear filas de 4 videos
  const rows = [];
  for (let i = 0; i < filteredVideos.length; i += 4) {
    rows.push(filteredVideos.slice(i, i + 4));
  }

  const handleVideoClick = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  if (loading) return <div>Cargando detalles del profesor...</div>;
  if (!teacher) return <div>Profesor no encontrado.</div>;

  return (
    <div className="teacher-detail-page">
      <Header />
      <div className="teacher-detail-container">
        <div className="teacher-info-card">
          <div className="teacher-image-large">
            {teacher.profile_picture ? (
              <img src={teacher.profile_picture} alt={teacher.name} />
            ) : (
              <AvatarPlaceholder name={teacher.name} size={100} />
            )}
          </div>
          <div className="teacher-info">
            <h2>{teacher.name}</h2>
            <p>{teacher.email}</p>
          </div>
        </div>

        <div className="teacher-videos-list">
          <h3>Videos Subidos</h3>

          <div className="search-bar-container-details" style={{ marginBottom: "1rem" }}>
            <div className="search-bar-details">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por título"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredVideos.length === 0 ? (
            <p>No se encontraron videos que coincidan con la búsqueda.</p>
          ) : (
            <div className="image-grid">
              {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                  {row.map((video) => (
                    <div
                      key={video.id}
                      className="image-item"
                      onClick={() => handleVideoClick(video.id)}
                    >
                      <img
                        src={video.thumbnail_url || "/placeholder.jpg"}
                        alt={video.title || "Video"}
                        className="image-video-thumbnail"
                      />
                      <div className="video-info">
                        <p className="video-title">{video.title}</p>
                        {video.user && (
                          <div className="user-info">
                            {video.user.profile_picture ? (
                              <img
                                src={video.user.profile_picture}
                                alt={video.user.name}
                                className="user-image-video"
                              />
                            ) : (
                              <AvatarPlaceholder
                                name={video.user.name}
                                size={20}
                              />
                            )}
                            <span className="user-name">{video.user.name}</span>
                          </div>
                        )}
                        <p className="video-views">
                          Visualizaciones: {video.views || 0}<br />
                          likes: {video.likes || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;
