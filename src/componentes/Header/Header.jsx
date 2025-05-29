// Header.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import imgUsuario from '../../assets/images/imgUsuario.png';
import chatImage from '../../assets/images/chatImage.png';
import imgCalendar from '../../assets/images/imgCalendar.png';

import logout from '../../assets/images/logout.png';
import cross from '../../assets/images/cross.png';

function Header() {

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token);
    };

    window.addEventListener('storage', checkLoginStatus);
    checkLoginStatus();

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate('/home');
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleUserClick = () => {
    navigate('/user');
    setShowSettings(false);
  };

  const handleChats = () => {
    navigate('/chatList');
    setShowSettings(false);
  };

  const handleCalendar = () => {
    navigate('/calendar');
    setShowSettings(false);
  };

  return (
    <div className="header-container">
      <button onClick={handleLogoClick} className="header-icon_button">
        <img src="/LogoClaro.png" alt="logo" className="header-icon_container" />
      </button>

      {isLoggedIn ? (
        <>
          
          {/* SEARCHBAR MOVIDA AQUÍ */}
         
          <div className='header-buttons-body'>
            <button className="header-button" onClick={() => navigate('/teachers')}>Profesores</button>
            <button className="header-button" onClick={() => navigate('/createVideo')}>upload</button>
             <button className="header-button"  onClick={() => navigate(`/teacher/${user.id}`)}>Mi Cuenta</button>
            <button className="header-button" onClick={toggleSettings}>Ajustes</button>
          </div>


          {showSettings && (
            <div className="settings-popup">
              <button id='close-b' onClick={toggleSettings}>
                <img id='close' className='icon-adj' src={cross} alt="cross" />
              </button>
              <div className='use-lout'>
                <button className="settings-button" onClick={handleUserClick}>
                  <img className='icon-adj' src={imgUsuario} alt="imgUsuario" />Usuario
                </button>
                <button className="settings-button" onClick={handleChats}>
                  <img className='icon-adj' src={chatImage} alt="chatImage.png" />Chats
                </button>
                <button className="settings-button" onClick={handleCalendar}>
                  <img className='icon-adj' src={imgCalendar} alt="imgCalendar.png" />Calendario
                </button>
                <button className="settings-button" onClick={handleLogout}>
                  <img className='icon-adj' id='logout-btn' src={logout} alt="logout" />LogOut
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="headerH-container"></div>
      )}
    </div>
  );
}

export default Header;
