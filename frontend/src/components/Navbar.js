import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">💪</span>
          <span>FitLife</span>
        </Link>

        <button className="navbar-toggle" onClick={toggleMenu} aria-label="Menú">
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <ul className={`navbar-nav ${menuOpen ? 'active' : ''}`}>
          <li>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </Link>
          </li>
          <li>
            <Link 
              to="/planes" 
              className={`nav-link ${isActive('/planes') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Planes
            </Link>
          </li>
          <li>
            <Link 
              to="/comentarios" 
              className={`nav-link ${isActive('/comentarios') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Reseñas
            </Link>
          </li>
          <li>
            <Link 
              to="/contacto" 
              className={`nav-link ${isActive('/contacto') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Contacto
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              <li>
                <Link 
                  to="/perfil" 
                  className={`nav-link ${isActive('/perfil') ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Mi Perfil
                </Link>
              </li>
              {user?.isAdmin && (
                <li>
                  <Link 
                    to="/admin" 
                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link 
                  to="/login" 
                  className="btn btn-outline btn-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="btn btn-primary btn-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Regístrate
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
