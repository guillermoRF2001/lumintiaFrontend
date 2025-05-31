import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Alert from '../../componentes/alert/alert.jsx';
import Header from '../../componentes/Header/Header.jsx';
import { createVideo } from '../../api/videoApi';
import { updateUserRole } from '../../api/userApi';
import { setCookie, getCookie } from '../../utils/cookieHelper';
import './UploadVideo.css';

function UploadVideo() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnail: null,
    video: null,
  });

  const [alertConfig, setAlertConfig] = useState({
    show: false,
    type: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'video' && files[0]) {
      const videoFile = files[0];
      if (!videoFile.type.startsWith('video/')) {
        return setAlertConfig({
          show: true,
          type: 'error',
          message: 'Por favor, selecciona un archivo de video válido.',
        });
      }
      processVideo(videoFile);
    } else if (name === 'thumbnail' && files[0]) {
      setForm((prevForm) => ({ ...prevForm, thumbnail: files[0] }));
    } else {
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
    }
  };

  const handleVideoClick = () => {
    document.getElementById('videoInput').click();
  };

  const processVideo = (videoFile) => {
    setForm((prevForm) => ({ ...prevForm, video: videoFile }));

    const videoElement = document.createElement('video');
    videoElement.src = URL.createObjectURL(videoFile);
    videoElement.currentTime = 1;
    videoElement.addEventListener('loadeddata', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL('image/jpeg');
      setPreviewImage(thumbnailUrl);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      processVideo(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsImageDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setForm((prevForm) => ({ ...prevForm, thumbnail: droppedFile }));
    } else {
      setAlertConfig({
        show: true,
        type: 'error',
        message: 'Por favor, suelta una imagen válida.',
      });
    }
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
    setIsImageDragging(true);
  };

  const handleImageDragLeave = () => {
    setIsImageDragging(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let progressBar;

      Swal.fire({
        title: 'Subiendo video...',
        html: `
          <div style="width: 100%; background: #eee; border-radius: 5px; overflow: hidden;">
            <div id="progress-bar" style="width: 0%; background: #3085d6; height: 20px;"></div>
          </div>
          <p id="progress-label" style="margin-top: 10px;">0%</p>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          progressBar = document.getElementById('progress-bar');
          document.getElementById('progress-label').textContent = '0%';
        },
      });

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);

      if (!form.video) {
        Swal.close();
        return;
      }

      formData.append("video", form.video);
      if (form.thumbnail) formData.append("thumbnail", form.thumbnail);

      await createVideo(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (progressBar) {
          progressBar.style.width = `${percent}%`;
          document.getElementById('progress-label').textContent = `${percent}%`;
        }
      });

      Swal.fire({
        icon: 'success',
        title: '¡Video subido!',
        text: 'Tu video se ha subido exitosamente.',
        timer: 2000,
        showConfirmButton: false,
      });

      const user = JSON.parse(localStorage.getItem('user'));
      const skipPrompt = getCookie(`skipBecomeTeacherPrompt_${user?.id}`);

      if (user && user.role === 'student' && !skipPrompt) {
        const result = await Swal.fire({
          title: '¿Quieres convertirte en profesor?',
          text: 'Puedes empezar a compartir tus conocimientos como profesor.',
          icon: 'question',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Sí, cambiar a profesor',
          denyButtonText: 'No, seguir como estudiante',
          cancelButtonText: 'No volver a preguntar',
        });

        if (result.isConfirmed) {
          await updateUserRole(user.id, 'teacher');
          user.role = 'teacher';
          localStorage.setItem('user', JSON.stringify(user));
          Swal.fire('¡Ahora eres profesor!', '', 'success');
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          setCookie(`skipBecomeTeacherPrompt_${user.id}`, true);
        }
      }

      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (error) {
      console.error("Error al subir video:", error);

      Swal.fire({
        icon: 'error',
        title: 'Error al subir',
        text: 'Hubo un problema. Intenta nuevamente.',
      });
    }
  };

  return (
    <div className="uploadvideo-father">
      <Header />
      <div className="uploadvideo-body">
        <div className="uploadvideo-content">
          <div className="video-upload-section">
            <div
              className={`video-dropzone ${isDragging ? 'dragging' : ''}`}
              onClick={handleVideoClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {previewImage ? (
                <img src={previewImage} alt="thumbnail" className="video-thumbnail" />
              ) : (
                <p>Haz clic o arrastra un video aquí</p>
              )}
              <input
                type="file"
                name="video"
                id="videoInput"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleChange}
              />
            </div>

            <div className="thumbnail-upload-section">
              <div
                className={`thumbnail-dropzone ${isImageDragging ? 'dragging' : ''}`}
                onClick={() => document.getElementById('thumbnailInput').click()}
                onDrop={handleImageDrop}
                onDragOver={handleImageDragOver}
                onDragLeave={handleImageDragLeave}
              >
                {form.thumbnail ? (
                  <img
                    src={URL.createObjectURL(form.thumbnail)}
                    alt="thumbnail personalizada"
                    className="custom-thumbnail"
                  />
                ) : (
                  <p>Haz clic o arrastra una imagen aquí</p>
                )}
                <input
                  type="file"
                  name="thumbnail"
                  id="thumbnailInput"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="uploadvideo-form-container">
            <h1 className="uploadvideo-title">Subir nuevo video</h1>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ej. Qué es una matriz"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="description"
                  className="form-input"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Breve explicación del contenido del video"
                />
              </div>

              <button className="uploadvideo-button" type="submit">
                Subir Video
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

export default UploadVideo;
