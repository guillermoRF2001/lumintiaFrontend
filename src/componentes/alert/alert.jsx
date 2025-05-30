import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

const Alert = ({ type, message, show }) => {
  useEffect(() => {
    if (show) {
      Swal.fire({
        icon: type, 
        title: type === 'success' ? 'Éxito' : 'Error',
        text: message,
        confirmButtonText: 'Aceptar',
      });
    }
  }, [show, type, message]); 

  return null; 
};

export default Alert;