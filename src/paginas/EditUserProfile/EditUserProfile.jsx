import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../componentes/Header/Header';
import Alert from '../../componentes/alert/alert';
import { getUserById, updateUserWithImage, deleteUser } from '../../api/userApi';
import './EditUserProfile.css';

function EditUserProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [previewImage, setPreviewImage] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: null,
  });

  const [alertConfig, setAlertConfig] = useState({
    show: false,
    type: '',
    message: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getUserById(id);
        setForm({
          name: user.name || '',
          email: user.email || '',
          password: '',
          confirmPassword: '',
          profilePicture: null,
        });
        if (user.profile_image_url) { 
          setPreviewImage(user.profile_image_url);
        }
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
        Swal.fire('Error', 'No se pudo cargar el perfil.', 'error');
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'profilePicture' && files[0]) {
      setForm((prev) => ({ ...prev, profilePicture: files[0] }));
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return setAlertConfig({
        show: true,
        type: 'error',
        message: 'Las contraseñas no coinciden.',
      });
    }

    try {
      Swal.fire({
        title: 'Actualizando perfil...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const userData = {
        id,
        name: form.name,
        email: form.email,
      };

      if (form.password) {
        userData.password = form.password;
      }

      const updatedUser = await updateUserWithImage(userData, form.profilePicture);

      Swal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: 'Tus datos se han guardado correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate('/user'), 2000);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      Swal.fire('Error', 'No se pudo actualizar el perfil.', 'error');
    }
  };

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará tu cuenta permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (confirm.isConfirmed) {
      try {
        await deleteUser(id);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");

        Swal.fire('Eliminado', 'Tu cuenta ha sido eliminada.', 'success');
        navigate('/');
      } catch (error) {
        console.error("Error al eliminar cuenta:", error);
        Swal.fire('Error', 'No se pudo eliminar tu cuenta.', 'error');
      }
    }
  };

  return (
    <div className="edituser-father">
      <Header />

      <div className="edituser-body">
        <div className="edituser-content">
          <div className="edituser-form-container">
            <h1 className="edituser-title">Editar Perfil</h1>

            <form onSubmit={handleSubmit}>
              <div className="edituser-form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="name"
                  className="edituser-input"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div className="edituser-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="edituser-input"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="correo@example.com"
                />
              </div>

              <div className="edituser-form-group">
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  name="password"
                  className="edituser-input"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="********"
                />
              </div>

              <div className="edituser-form-group">
                <label>Confirmar contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="edituser-input"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="********"
                />
              </div>

              <div className="edituser-form-group">
                <label>Foto de perfil</label>
                <div
                  className="edituser-thumbnail-container"
                  onClick={() => document.getElementById('profilePictureInput').click()}
                  style={{ cursor: 'pointer' }}
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="edituser-thumbnail" />
                  ) : (
                    <p>Haz clic para seleccionar una imagen</p>
                  )}
                  <input
                    type="file"
                    name="profilePicture"
                    id="profilePictureInput"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="submit" className="edituser-button">
                Guardar Cambios
              </button>

              <button
                type="button"
                className="edituser-button delete"
                onClick={handleDelete}
              >
                Eliminar Cuenta
              </button>
            </form>
          </div>
        </div>
      </div>

      <Alert
        show={alertConfig.show}
        type={alertConfig.type}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, show: false })}
      />
    </div>
  );
}

export default EditUserProfile;
