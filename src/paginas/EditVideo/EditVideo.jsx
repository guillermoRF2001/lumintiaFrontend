import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Alert from '../../componentes/alert/alert.jsx';
import Header from '../../componentes/Header/Header.jsx';
import { getVideoById, updateVideo, deleteVideo } from '../../api/videoApi'; 
import './EditVideo.css';

function EditVideo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isDragging, setIsDragging] = useState(false);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const video = await getVideoById(id);
        setForm({
          title: video.title || '',
          description: video.description || '',
          thumbnail: null,
          video: null,
        });
        setPreviewImage(video.thumbnailUrl);
      } catch (error) {
        console.error("Error al cargar video:", error);
        Swal.fire('Error', 'No se pudo cargar el video.', 'error');
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'video' && files[0]) {
      const videoFile = files[0];
      if (!videoFile.type.startsWith('video/')) {
        return setAlertConfig({
          show: true,
          type: 'error',
          message: 'Selecciona un archivo de video válido.',
        });
      }
      processVideo(videoFile);
    } else if (name === 'thumbnail' && files[0]) {
      setForm((prev) => ({ ...prev, thumbnail: files[0] }));
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const processVideo = (videoFile) => {
    setForm((prev) => ({ ...prev, video: videoFile }));

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

  const handleVideoClick = () => {
    document.getElementById('videoInput').click();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let progressBar;

      Swal.fire({
        title: 'Actualizando video...',
        html: `
          <div style="width: 100%; background: #eee; border-radius: 5px; overflow: hidden;">
            <div id="progress-bar" style="width: 0%; background: #f5a623; height: 20px;"></div>
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
      formData.append('title', form.title);
      formData.append('description', form.description);
      if (form.video) formData.append('video', form.video);
      if (form.thumbnail) formData.append('thumbnail', form.thumbnail);

      await updateVideo(id, formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (progressBar) {
          progressBar.style.width = `${percent}%`;
          document.getElementById('progress-label').textContent = `${percent}%`;
        }
      });

      Swal.fire({
        icon: 'success',
        title: '¡Video actualizado!',
        text: 'Se guardaron los cambios.',
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate('/home'), 2000);
    } catch (error) {
      console.error("Error al actualizar video:", error);
      Swal.fire('Error', 'Hubo un problema al actualizar el video.', 'error');
    }
  };

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el video permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (confirm.isConfirmed) {
      try {
        await deleteVideo(id);
        Swal.fire('Eliminado', 'El video ha sido eliminado.', 'success');
        navigate('/home');
      } catch (error) {
        console.error("Error al eliminar video:", error);
        Swal.fire('Error', 'No se pudo eliminar el video.', 'error');
      }
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
                className="thumbnail-dropzone"
                onClick={() => document.getElementById('thumbnailInput').click()}
              >
                {form.thumbnail ? (
                  <img
                    src={URL.createObjectURL(form.thumbnail)}
                    alt="thumbnail personalizada"
                    className="custom-thumbnail"
                  />
                ) : (
                  <p>Haz clic para seleccionar una miniatura</p>
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
            <h1 className="uploadvideo-title">Editar video</h1>

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
                Guardar Cambios
              </button>

              <button
                type="button"
                className="uploadvideo-button delete-button"
                onClick={handleDelete}
                style={{ backgroundColor: '#e74c3c', marginTop: '10px' }}
              >
                Eliminar Video
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

export default EditVideo;
