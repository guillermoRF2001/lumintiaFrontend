const API_URL = 'http://localhost:4000/api/users';

export const createUser = async (userData) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    const text = await response.text(); 

    if (!response.ok) {
        throw new Error(text || 'Error al crear el usuario');
    }

    try {
        const data = JSON.parse(text); 
        return data;
    } catch (error) {
        throw new Error('La respuesta del servidor no es un JSON válido');
    }
};

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    const text = await response.text(); 

    if (!response.ok) {
        throw new Error(text || 'Error al iniciar sesión');
    }

    try {
        const { token, user } = JSON.parse(text); 

        localStorage.setItem('authToken', token);;
        localStorage.setItem('user', JSON.stringify(user));

        return { token, user };
    } catch (error) {
        throw new Error('La respuesta del servidor no es un JSON válido');
    }
};


export const getUsers = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error('Error fetching users');
    }
    return await response.json();
};

export const getUserById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
        throw new Error('Error fetching user');
    }
    return await response.json();
};


export const updateUser = async (user) => {
    const response = await fetch(`${API_URL}/${user.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });

    if (!response.ok) {
        throw new Error('Error updating user');
    }

    return await response.json();
};

export const updateUserWithImage = async (userData, imageFile) => {
    const formData = new FormData();

    for (const key in userData) {
        if (userData[key] !== undefined && userData[key] !== null) {
            formData.append(key, userData[key]);
        }
    }

    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await fetch(`${API_URL}/${userData.id}`, {
        method: 'PUT',
        body: formData,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Error updating user with image');
    }

    return await response.json();
};

export const deleteUser = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Error deleting user');
    }
};


export const updateUserRole = async (userId, newRole) => {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: newRole }),
    });
  
    if (!response.ok) {
      throw new Error('Error al actualizar el rol del usuario');
    }
  
    return await response.json();
  };
  