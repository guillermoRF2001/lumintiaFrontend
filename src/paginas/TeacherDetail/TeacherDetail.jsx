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
  const [searchField, setSearchField] = useState("title");
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
        const teacherVideos = allVideos.filter(
          (video) => video.user_id.toString() === id
        );

        setVideos(teacherVideos);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePayTeacher = () => {
    navigate(`/payteacher/${id}`);
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
            <p>Disponible: {teacher.available ? "Sí" : "No"}</p>
          </div>
        </div>

        <div className="teacher-videos-list">
          <h3>Videos Subidos</h3>
          {videos.length === 0 ? (
            <p>Este profesor aún no ha subido videos.</p>
          ) : (
            <div className="image-grid">
              {videos.reduce((rows, video, index) => {
                const rowIndex = Math.floor(index / 4);
                if (!rows[rowIndex]) rows[rowIndex] = [];
                rows[rowIndex].push(video);
                return rows;
              }, []).map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                  {row.map((video) => (
                    <div
                      key={video.id}
                      className="image-item"
                      onClick={() => navigate(`/video/${video.id}`)}
                    >
                      <img
                        src={video.thumbnail_url || "/placeholder.jpg"}
                        alt={video.title}
                      />
                      <div className="video-info">
                        <p className="video-title">{video.title}</p>
                        <div className="user-info">
                          <img
                            src={teacher.profile_picture || "/user-placeholder.jpg"}
                            alt={teacher.name}
                            className="user-image"
                          />
                          <span className="user-name">{teacher.name}</span>
                        </div>
                        <p className="video-views">
                          Visualizaciones: {video.views || 0}
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
