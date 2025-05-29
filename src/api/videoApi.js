import axios from "axios";

/**
 * Sube un video al servidor con barra de progreso.
 * Incluye automáticamente el ID del usuario desde localStorage.
 * 
 * @param {FormData} formData - Datos del video y demás campos.
 * @param {function} onUploadProgress - Callback para progreso (recibe porcentaje).
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const createVideo = async (formData, onUploadProgress) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) {
      throw new Error("No se ha encontrado un usuario en el localStorage");
    }

    formData.append("user_id", user.id);

    if (!formData.has("video")) {
      throw new Error("El formulario debe contener un archivo de video con el campo 'video'");
    }

    // Debug del contenido del FormData
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await axios.post("http://localhost:4000/api/videos", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error en createVideo:", error);
    throw error;
  }
};

/**
 * Obtiene todos los videos.
 */
export const getVideos = async () => {
  try {
    const response = await fetch("http://localhost:4000/api/videos", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error en getVideos:", error.message);
    throw error;
  }
};

/**
 * Obtiene un video por ID.
 */
export const getVideoById = async (id) => {
  try {
    const response = await fetch(`http://localhost:4000/api/videos/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error en getVideoById:", error.message);
    throw error;
  }
};

/**
 * Actualiza un video existente.
 */
export const updateVideo = async (id, formData, onUploadProgress) => {
  try {
    const response = await axios.put(`http://localhost:4000/api/videos/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error en updateVideo:", error.message);
    throw error;
  }
};


/**
 * Elimina un video por ID.
 */
export const deleteVideo = async (videoId) => {
  try {
    const response = await fetch(`http://localhost:4000/api/videos/${videoId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar el video: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en deleteVideo:", error.message);
    throw error;
  }
};
