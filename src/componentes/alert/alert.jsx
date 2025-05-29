import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

const Alert = ({ type, message, show }) => {
  useEffect(() => {
    if (show) {
      Swal.fire({
        icon: type, // Usamos el tipo directamente como icono
        title: type === 'success' ? 'Éxito' : 'Error', // Personalizamos el título
        text: message,
        confirmButtonText: 'Aceptar',
      });
    }
  }, [show, type, message]); // Se ejecuta cuando cambia `show`, `type` o `message`

  return null; // Este componente no renderiza nada en el DOM
};

export default Alert;