
const API_URL = 'http://localhost:4000/api/calendar';

export const getEvents = async (token) => {
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al cargar eventos');
  }

  return await response.json();
};

export const getEventById = async (id, token) => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener el evento');
  }

  return await response.json();
};

export const createEvent = async (eventData, token) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || 'Error al crear el evento');
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('La respuesta del servidor no es un JSON válido');
  }
};

export const updateEvent = async (id, eventData, token) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || 'Error al actualizar el evento');
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('La respuesta del servidor no es un JSON válido');
  }
};

export const deleteEvent = async (id, token) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Error al eliminar el evento');
  }
};