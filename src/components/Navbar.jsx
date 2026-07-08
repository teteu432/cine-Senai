import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <svg className="navbar-logo-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
          </svg>
          Cine<span>Senai</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            Catálogo
          </Link>
          <Link to="/sessoes" className={`nav-link ${isActive('/sessoes')}`}>
            Sessões
          </Link>

          {user && (
            <Link to="/minhas-reservas" className={`nav-link ${isActive('/minhas-reservas')}`}>
              Minhas Reservas
            </Link>
          )}

          {isAdmin() && (
            <div className="navbar-admin-section">
              <span className="navbar-divider">|</span>
              <Link to="/admin" className={`nav-link navbar-admin-link ${isActive('/admin')}`}>
                Painel Admin
              </Link>
              <Link to="/admin/filmes" className={`nav-link navbar-admin-link ${isActive('/admin/filmes')}`}>
                Filmes
              </Link>
              <Link to="/admin/salas" className={`nav-link navbar-admin-link ${isActive('/admin/salas')}`}>
                Salas
              </Link>
              <Link to="/admin/sessoes" className={`nav-link navbar-admin-link ${isActive('/admin/sessoes')}`}>
                Sessões
              </Link>
              <Link to="/admin/reservas" className={`nav-link navbar-admin-link ${isActive('/admin/reservas')}`}>
                Reservas
              </Link>
              <Link to="/admin/usuarios" className={`nav-link navbar-admin-link ${isActive('/admin/usuarios')}`}>
                Usuários
              </Link>
            </div>
          )}
        </div>

        <div className="navbar-auth">
          {user ? (
            <div className="navbar-user-info">
              <div className="navbar-user-badge">
                <span className="navbar-user-name">{user.nome}</span>
                <span className="navbar-user-role">{user.cargo}</span>
              </div>
              <button onClick={handleLogout} className="navbar-logout-btn">
                Sair
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar-login-btn">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
