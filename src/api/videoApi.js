import axios from "axios";

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


export const incrementVideoViews = async (id) => {
  try {
    const response = await fetch(`http://localhost:4000/api/videos/${id}/views`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al incrementar visualizaciones: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en incrementVideoViews:", error.message);
    throw error;
  }
};

export const getCommentsByVideoId = async (videoId) => {
  try {
    const response = await fetch(`http://localhost:4000/api/videos/${videoId}/comments`, {
      headers: { "Content-Type": "application/json" },
    });
    const text = await response.text();
    return JSON.parse(text); 
  } catch (error) {
    console.error("Error en getCommentsByVideoId:", error.message);
    throw error;
  }
};

export const addCommentToVideo = async (videoId, comment) => {
  try {
    const response = await fetch(`http://localhost:4000/api/videos/${videoId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    });
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error en addCommentToVideo:", error.message);
    throw error;
  }
};

export const incrementVideoLikes = async (id) => {
  try {
    const response = await fetch(`http://localhost:4000/api/videos/${id}/likes`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al incrementar likes: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en incrementVideoLikes:", error.message);
    throw error;
  }
};
