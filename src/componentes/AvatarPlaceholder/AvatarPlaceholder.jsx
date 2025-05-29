import React from 'react';
import './AvatarPlaceholder.css';

const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = '#' + (hash & 0x00FFFFFF).toString(16).padStart(6, '0');
  return color;
};

const AvatarPlaceholder = ({ name, size = 50 }) => {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const bgColor = stringToColor(name || 'usuario');

  return (
    <div
      className="avatar-placeholder"
      style={{
        backgroundColor: bgColor,
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: size * 0.5,
        textTransform: 'uppercase',
      }}
    >
      {initial}
    </div>
  );
};

export default AvatarPlaceholder;
