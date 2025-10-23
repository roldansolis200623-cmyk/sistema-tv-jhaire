import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            {/* NAVBAR */}
            <nav className="landing-navbar">
                <div className="landing-logo">
                    <span className="logo-icon">📡</span>
                    <span className="logo-text">TV Jhaire</span>
                </div>
                <ul className="landing-nav-links">
                    <li><a href="#inicio">Inicio</a></li>
                    <li><a href="#servicios">Servicios</a></li>
                    <li><a href="#contacto">Contacto</a></li>
                </ul>
            </nav>

            {/* HERO */}
            <section className="landing-hero" id="inicio">
                <h1 className="hero-title">Internet de Alta Velocidad</h1>
                <p className="hero-subtitle">La mejor conexión para tu hogar o negocio</p>
            </section>

            {/* PORTALES */}
            <div className="portales-container">
                {/* PORTAL CLIENTE */}
                <div className="portal-card">
                    <div className="portal-icon">👤</div>
                    <h2>Portal Cliente</h2>
                    <p>Consulta tu deuda y realiza pagos en línea de forma rápida y segura</p>
                    <button 
                        className="btn-primary"
                        onClick={() => navigate('/cliente/consulta')}
                    >
                        🔍 Consultar mi Deuda
                    </button>
                </div>

                {/* PORTAL ADMIN */}
                <div className="portal-card">
                    <div className="portal-icon">🔐</div>
                    <h2>Panel Administrador</h2>
                    <p>Acceso al sistema de gestión completo para administradores</p>
                    <button 
                        className="btn-primary"
                        onClick={() => navigate('/login')}
                    >
                        🚀 Ingresar al Panel
                    </button>
                </div>
            </div>

            {/* FEATURES */}
            <section className="landing-features" id="servicios">
                <h2 className="features-title">¿Por qué elegirnos?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Internet Rápido</h3>
                        <p>Velocidades de hasta 100 Mbps para tu hogar</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💰</div>
                        <h3>Precios Accesibles</h3>
                        <p>Planes desde S/ 50 mensuales</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🛠️</div>
                        <h3>Soporte 24/7</h3>
                        <p>Asistencia técnica cuando lo necesites</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📱</div>
                        <h3>Autogestión</h3>
                        <p>Consulta tu deuda y paga en línea</p>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-footer" id="contacto">
                <p><strong>Telecomunicaciones Jhair EIRL</strong></p>
                <p>📍 Lima, Perú | 📞 991-569-419 | 📧 info@tvjhaire.com</p>
                <p className="footer-copy">© 2025 TV Jhaire. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}

export default Landing;