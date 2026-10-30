import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuthData } from '../utils/auth';
import './Sidebar.css';

const navLinks = {
  admin: [
    { to: '/admin', text: '📊 Dashboard' },
    { to: '/admin/usuarios', text: '👥 Usuarios' },
    { to: '/admin/clases', text: '📚 Clases' },
    { to: '/admin/materias', text: '📖 Materias' },
    { to: '/admin/horarios', text: '⏰ Horarios' },
    { to: '/admin/observaciones', text: '📝 Observaciones' },
    { to: '/admin/recursos', text: '📁 Recursos' },
  ],
  profesor: [
    { to: '/profesor', text: '📊 Dashboard' },
    { to: '/profesor/horario', text: '⏰ Horario' },
    { to: '/profesor/recursos', text: '📁 Recursos' },
    { to: '/profesor/tareas', text: '📋 Tareas' },
    { to: '/profesor/observaciones', text: '📝 Observaciones' },
  ],
  alumno: [
    { to: '/alumno', text: '📊 Dashboard' },
    { to: '/alumno/horario', text: '⏰ Horario' },
    { to: '/alumno/recursos', text: '📁 Recursos' },
    { to: '/alumno/tareas', text: '📋 Tareas' },
    { to: '/alumno/observaciones', text: '📝 Observaciones' },
  ],
};

export default function Sidebar({ role, isOpen, isMobile, onClose }) {
  const links = navLinks[role.toLowerCase()] || [];
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
    if (isMobile) {
      onClose();
    }
  };

  const handleLinkClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isMobile ? 'mobile' : 'desktop'} ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink 
                to={link.to} 
                end={true}
                onClick={handleLinkClick}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                {link.text}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Botón de cerrar sesión - siempre visible en móvil, solo en desktop al final */}
      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-role">{role}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Cerrar sesión
        </button>
      </div>
      
      {/* Botón de cerrar para móvil */}
      {isMobile && (
        <button className="mobile-close-btn" onClick={onClose}>
          ×
        </button>
      )}
    </aside>
  );
}
