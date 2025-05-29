  import React, { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { loginUser } from '../../api/userApi.js';
  import Alert from '../../componentes/alert/alert.jsx';
  import Header from '../../componentes/Header/Header';
  import './Login.css';

  function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alertConfig, setAlertConfig] = useState({
      show: false,
      type: '',
      message: '',
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const { token, user } = await loginUser({ email, password });
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        setAlertConfig({
          show: true,
          type: 'success',
          message: 'Inicio de sesión exitoso!',
        });

        setTimeout(() => {
          navigate('/home');
        }, 2000);
      } catch (error) {
        setAlertConfig({
          show: true,
          type: 'error',
          message: 'Credenciales incorrectas. Inténtalo de nuevo.',
        });
      }
    };

    const handleNavigateToRegister = () => {
      navigate('/registro');
    };

    const handleForgotPassword = () => {
      // Lógica para recuperar contraseña
      navigate('/recuperar-contrasena');
    };

    return (
      <div className="login-father">
        <Header />

        <div className="login-body">
          <div className="login-content">
            <div className="login-text-container">
              <h1>En Lumintia, la educación<br/>no tiene límites.</h1>
              <p>Explora videos gratuitos<br/>
              sobre todos los temas de instituto <br/>
              y accede a recursos diseñados para que <br/>
              aprendas de manera simple y práctica.</p>
              <h2>Conquista el <br/>
              conocimiento a tu ritmo!</h2>
            </div>

            <div className="login-container">
              <h1 className="login-title">Log in</h1>
              
              <div className="login-input-group">
                <label>Correo</label>
                <input
                  type="email"
                  className="login-input-text"
                  placeholder="Ingresa tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="login-input-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  className="login-input-text"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/*Funcionalidad futura*/}
                {/* 
                  <span className="forgot-password" onClick={handleForgotPassword}>
                    Olvidastes la contraseña
                  </span> 
                  */}
              </div>
              
              <button className="button-login" onClick={handleSubmit}>
                Iniciar Sesion
              </button>
              
              <p className="regist-text">
                Si aun no tienes cuenta,{' '}
                <span className="regist-link" onClick={handleNavigateToRegister}>
                  registrate
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
  }

  export default Login;