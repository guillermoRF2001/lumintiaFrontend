import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../../api/userApi";
import { getVideos } from "../../api/videoApi";
import "./TeacherList.css";
import Header from "../../componentes/Header/Header";
import AvatarPlaceholder from "../../componentes/AvatarPlaceholder/AvatarPlaceholder.jsx";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatsCreados, setChatsCreados] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const users = await getUsers();
        const allVideos = await getVideos();

        const teacherList = users
          .filter((user) => user.role === "teacher")
          .map((teacher) => {
            const videoCount = allVideos.filter(
              (video) => video.user_id === teacher.id
            ).length;

            return { ...teacher, videos_count: videoCount };
          });

        setTeachers(teacherList);

        if (currentUser?.id) {
          socket.emit("get_user_chats", currentUser.id);
        }

        socket.on("user_chats", (chats) => {
          const existentes = {};
          chats.forEach((chat) => {
            const key = [chat.user1_id, chat.user2_id].sort().join("_");
            existentes[key] = true;
          });
          setChatsCreados(existentes);
        });
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      socket.off("user_chats");
    };
  }, []);

  const handleCrearChat = (teacherId) => {
    if (!currentUser || !currentUser.id) {
      alert("Usuario no autenticado.");
      return;
    }

    const user1_id = currentUser.id;
    const user2_id = teacherId;
    const chatKey = [user1_id, user2_id].sort().join("_");

    if (!chatsCreados[chatKey]) {
      socket.emit("join_room", { room: null, user1_id, user2_id });
      setChatsCreados((prev) => ({ ...prev, [chatKey]: true }));
    }

    navigate("/chatList", { state: { abrirChatCon: teacherId } });
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Cargando profesores...</div>;
  }

  return (
    <div className="teacher-list-page">
      <Header />
      <div className="teacher-list-container">
        <h2>Lista de Profesores</h2>

        <div className="search-bar-container-teacher">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="teacher-list">
          {filteredTeachers.map((teacher) => {
            const chatKey = [currentUser?.id, teacher.id].sort().join("_");
            const chatYaCreado = chatsCreados[chatKey];
            const esElMismoUsuario = currentUser?.id === teacher.id;

            return (
              <div key={teacher.id} className="teacher-card">
                <div className="teacher-image">
                  {teacher.profile_picture ? (
                    <img src={teacher.profile_picture} alt={teacher.name} />
                  ) : (
                    <AvatarPlaceholder name={teacher.name} size={60} />
                  )}
                </div>
                <div className="teacher-info">
                  <h3>{teacher.name}</h3>
                  <p>{teacher.email}</p>
                  <p>Videos Subidos: {teacher.videos_count}</p>
                </div>
                <div className="teacher-actions">
                  {!esElMismoUsuario && (
                    <button
                      onClick={() => handleCrearChat(teacher.id)}
                      className="crear-chat"
                    >
                      {chatYaCreado ? "Abrir chat" : "Crear chat"}
                    </button>
                  )}
                  <button
                    className="details-teacher"
                    onClick={() => navigate(`/teacher/${teacher.id}`)}
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeacherList;
