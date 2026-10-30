import { useState } from 'react';
import './LandingPage.css';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="brand-logo">
              <img
                src="/images/logos/logo.jpeg"
                alt="Colegio Carlos Julio García"
                className="brand-logo-img"
              />
            </div>
            <div className="brand-text">
              <h1 className="brand-name">Colegio Carlos Julio García</h1>
              <span className="brand-tagline">Aprendiendo juntos</span>
            </div>
          </div>
          
          <button 
            className={`nav-toggle ${isMenuOpen ? 'nav-toggle-open' : ''}`} 
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <div className={`nav-menu ${isMenuOpen ? 'nav-menu-open' : ''}`}>
            {isMenuOpen && (
              <button 
                className="nav-close-btn" 
                onClick={toggleMenu}
                aria-label="Close navigation"
              >
                <span className="close-icon">×</span>
              </button>
            )}
            <a href="#features" className="nav-link">Características</a>
            <a href="#benefits" className="nav-link">Beneficios</a>
            <a href="#about" className="nav-link">Nosotros</a>
            <a href="#contact" className="nav-link">Contacto</a>
            <a href="/login" className="nav-button">Iniciar Sesión</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Gestión escolar <span className="hero-highlight">segura</span> y <span className="hero-highlight">organizada</span>
            </h1>
            <p className="hero-description">
              Plataforma del colegio para administrar clases, recursos, horarios, observaciones y accesos.
              Los usuarios son registrados por el administrador; no existe auto-registro público.
            </p>
            <div className="hero-actions">
              <a href="/login" className="btn btn-primary">Iniciar Sesión</a>
              <a href="#features" className="btn btn-secondary">Ver Funciones</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-illustration">
              <div className="illustration-element illustration-1"></div>
              <div className="illustration-element illustration-2"></div>
              <div className="illustration-element illustration-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Funcionalidades para la gestión escolar</h2>
            <p className="section-subtitle">
              Herramientas diseñadas para administrar clases, recursos y accesos internamente
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" className="feature-icon-svg" aria-hidden="true">
                  <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v2h12V4H6Zm0 4v12h12V8H6Zm3 2h2v2H9v-2Zm4 0h2v2h-2v-2Zm-4 4h2v2H9v-2Zm4 0h2v2h-2v-2Z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">Gestión de clases y horarios</h3>
              <p className="feature-description">
                Organización eficiente de cursos, asignación de aulas y administración 
                de horarios para la operación diaria del colegio.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" className="feature-icon-svg" aria-hidden="true">
                  <path d="M4 4h16v2H4V4Zm0 4h16v12H4V8Zm2 2v8h12v-8H6Zm2 2h8v2H8v-2Z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">Recursos escolares</h3>
              <p className="feature-description">
                Administración de archivos y documentos de apoyo, con acceso controlado 
                para docentes y estudiantes autorizados.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" className="feature-icon-svg" aria-hidden="true">
                  <path d="M4 4h16v10H9.5L7 17.5V14H4V4Zm2 2v6h3v3.5L12 12H18V6H6Zm12 8h2v2h-2v-2Zm-6 3h2v2h-2v-2Zm-6-3h2v2H6v-2Z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">Registro de observaciones</h3>
              <p className="feature-description">
                Registra observaciones académicas y disciplinarias para seguimiento 
                interno de estudiantes y apoyo docente.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" className="feature-icon-svg" aria-hidden="true">
                  <path d="M4 17h16v2H4v-2Zm3-6h3v6H7v-6Zm5-4h3v10h-3V7Zm5 2h3v8h-3V9Z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">Control de accesos</h3>
              <p className="feature-description">
                Gestión de cuentas y permisos por rol, con acceso seguro y supervisado 
                desde administración.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="benefits">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="section-title">Beneficios para la gestión interna del colegio</h2>
              
              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-marker"></div>
                  <div className="benefit-content">
                    <h4>Para Administración</h4>
                    <p>Centraliza el registro de usuarios, recursos, horarios y permisos con control total.</p>
                  </div>
                </div>
                
                <div className="benefit-item">
                  <div className="benefit-marker"></div>
                  <div className="benefit-content">
                    <h4>Para Docentes</h4>
                    <p>Organiza clases, encuentra recursos y registra observaciones desde un mismo sistema.</p>
                  </div>
                </div>
                
                <div className="benefit-item">
                  <div className="benefit-marker"></div>
                  <div className="benefit-content">
                    <h4>Para Estudiantes</h4>
                    <p>Consulta horarios y materiales autorizados en un entorno digital seguro.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="benefits-visual">
              <div className="visual-element visual-1"></div>
              <div className="visual-element visual-2"></div>
              <div className="visual-element visual-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">Comprometidos con la gestión escolar</h2>
              <p className="about-description">
                En Colegio Carlos Julio García ofrecemos una plataforma enfocada en la gestión interna:
                clases, recursos, horarios, observaciones y accesos. Todo el control de usuarios
                queda en manos del administrador del colegio.
              </p>
              <p className="about-description">
                Esta herramienta permite centralizar la operación escolar, mejorar la coordinación
                docente y mantener la información disponible para estudiantes autorizados.
              </p>
              <div className="about-stats">
                <div className="stat-item">
                  <div className="stat-number">1000+</div>
                  <div className="stat-label">Estudiantes</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">Docentes</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">15+</div>
                  <div className="stat-label">Años de Experiencia</div>
                </div>
              </div>
            </div>
            
            <div className="about-visual">
              <div className="about-image-placeholder">
                <div className="image-overlay"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-brand-text">
                <h3>Colegio Carlos Julio García</h3>
                <p>Contacto: <a href="mailto:contacto@colegiocarlosjuliogarcia.edu.co">contacto@colegiocarlosjuliogarcia.edu.co</a></p>
              </div>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h4>Plataforma</h4>
                <a href="#features">Características</a>
                <a href="#benefits">Beneficios</a>
                <a href="#about">Nosotros</a>
              </div>
              
              <div className="footer-column">
                <h4>Soporte</h4>
                <a href="#contact">Contacto</a>
                <a href="/login">Acceso</a>
                <a href="#help">Ayuda</a>
              </div>
              
              <div className="footer-column">
                <h4>Legal</h4>
                <a href="#privacy">Privacidad</a>
                <a href="#terms">Términos</a>
                <a href="#cookies">Cookies</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2026 Colegio Carlos Julio García. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
