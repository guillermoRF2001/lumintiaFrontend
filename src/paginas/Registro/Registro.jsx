import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../api/userApi.js';
import Alert from '../../componentes/alert/alert.jsx';
import Header from '../../componentes/Header/Header';
import './Registro.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    type: '',
    message: '',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAlertConfig({
        show: true,
        type: 'error',
        message: 'Las contraseñas no coinciden',
      });
      return;
    }

    try {
      const result = await createUser({ name, email, password });
      setAlertConfig({
        show: true,
        type: 'success',  
        message: 'Registro exitoso! Redirigiendo al login...',
      });

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setAlertConfig({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Error al registrar el usuario',
      });
    }
  };

  const handleNavigateToLogin = () => {
    navigate('/');
  };

  return (
    <div className="register-father">
      <Header />

      <div className="register-body">
        <div className="register-content">
          <div className="register-text-container">
            <h1>En Lumintia, la educación<br/>no tiene límites.</h1>
            <p>Explora videos gratuitos<br/>
             sobre todos los temas de instituto <br/>
             y accede a recursos diseñados para que <br/>
             aprendas de manera simple y práctica.</p>
            <h2>Conquista el <br/>
            conocimiento a tu ritmo!</h2>
          </div>

          <div className="register-container">
            <h1 className="register-title">Registro</h1>
            
            <div className="register-input-group">
              <label>Nombre completo</label>
              <input
                type="text"
                className="register-input-text"
                placeholder="Ingresa tu nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="register-input-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                className="register-input-text"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="register-input-group">
              <label>Contraseña</label>
              <input
                type="password"
                className="register-input-text"
                placeholder="Crea una contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="register-input-group">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                className="register-input-text"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <button className="register-button" onClick={handleSubmit}>
              Registrarse
            </button>
            
            <p className="register-bottom-text">
              ¿Ya tienes una cuenta?{' '}
              <span className="register-link" onClick={handleNavigateToLogin}>
                Inicia sesión
              </span>
            </p>
          </div>
        </div>
      </div>

      <Alert
        show={alertConfig.show}
        type={alertConfig.type}
        message={alertConfig.message}
        onClose={() => setAlertConfig({...alertConfig, show: false})}
      />
      
    </div>
  );
};

export default Register;