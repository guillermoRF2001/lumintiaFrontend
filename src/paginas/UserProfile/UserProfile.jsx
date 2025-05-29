import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../componentes/Header/Header";
import AvatarPlaceholder from "../../componentes/AvatarPlaceholder/AvatarPlaceholder";
import { getUserById, deleteUser } from "../../api/userApi";
import Swal from "sweetalert2";
import "./UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        fetchUserData(parsedUser.id);
      } catch (error) {
        console.error("Error al parsear el usuario del localStorage", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const userData = await getUserById(userId);
      setUser(userData);
    } catch (error) {
      console.error("Error obteniendo datos del usuario", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/editUser/${user.id}`);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará tu cuenta permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar cuenta",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(user.id);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        Swal.fire("Eliminado", "Tu cuenta ha sido eliminada.", "success");
        navigate("/");
      } catch (error) {
        console.error("Error eliminando usuario", error);
        Swal.fire("Error", "No se pudo eliminar la cuenta.", "error");
      }
    }
  };

  if (loading) return <div className="userprofile-loading">Cargando perfil...</div>;
  if (!user) return <div className="userprofile-error">Usuario no encontrado.</div>;

  return (
    <div className="userprofile-wrapper">
      <Header />
      <div className="userprofile-content">
        <div className="userprofile-avatar">
          {user.profile_picture ? (
            <img src={user.profile_picture} alt={user.name} className="userprofile-img" />
          ) : (
            <AvatarPlaceholder name={user.name} size={80} />
          )}
        </div>
        <div className="userprofile-info">
          <h1 className="userprofile-name">{user.name}</h1>
          <p className="userprofile-email">{user.email}</p>
          <p className="userprofile-role">
            Rol: <strong>{user.role === "teacher" ? "Profesor" : "Estudiante"}</strong>
          </p>
          <p className="userprofile-date">
            Miembro desde: {new Date(user.created_at).toLocaleDateString()}
          </p>
          <div className="userprofile-actions">
            <button className="userprofile-btn edit" onClick={handleEdit}>
              Editar Perfil
            </button>
            <button className="userprofile-btn delete" onClick={handleDelete}>
              Eliminar Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
