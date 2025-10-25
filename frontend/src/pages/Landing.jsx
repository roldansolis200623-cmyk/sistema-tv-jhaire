import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import '../Apple-White-Theme.css'; 

function Landing() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-container">
            {/* NAVBAR MEJORADO */}
            <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="landing-logo">
                    <span className="logo-icon">📡</span>
                    <span className="logo-text">TV Jhaire</span>
                </div>
                <ul className="landing-nav-links">
                    <li><a href="#inicio">Inicio</a></li>
                    <li><a href="#servicios">Servicios</a></li>
                    <li><a href="#planes">Planes</a></li>
                    <li><a href="#contacto">Contacto</a></li>
                </ul>
            </nav>

            {/* HERO MEJORADO */}
            <section className="landing-hero" id="inicio">
                <div className="hero-content animate-fade-in">
                    <h1 className="hero-title">
                        Internet de <span className="gradient-text">Alta Velocidad</span>
                    </h1>
                    <p className="hero-subtitle">
                        La mejor conexión para tu hogar o negocio
                    </p>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <div className="stat-number">100+</div>
                            <div className="stat-label">Clientes Activos</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">99.9%</div>
                            <div className="stat-label">Uptime</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Soporte</div>
                        </div>
                    </div>
                </div>
                
                {/* Efecto de onda animada */}
                <div className="wave-container">
                    <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none">
                        <defs>
                            <path id="wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                        </defs>
                        <g className="wave-parallax">
                            <use href="#wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
                            <use href="#wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
                            <use href="#wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
                            <use href="#wave" x="48" y="7" fill="#fff" />
                        </g>
                    </svg>
                </div>
            </section>

            {/* PORTALES MEJORADOS CON GLASSMORPHISM */}
            <div className="portales-section">
                <h2 className="section-title">Acceso Rápido</h2>
                <div className="portales-container">
                    {/* PORTAL CLIENTE */}
                    <div className="portal-card glass-card" data-aos="fade-up">
                        <div className="card-glow"></div>
                        <div className="portal-icon-container">
                            <div className="portal-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                        <h2>Portal Cliente</h2>
                        <p>Consulta tu estado de cuenta y realiza pagos en línea de forma segura</p>
                        <ul className="feature-list">
                            <li>✓ Consulta instantánea</li>
                            <li>✓ Múltiples métodos de pago</li>
                            <li>✓ Confirmación automática</li>
                        </ul>
                        <button 
                            className="btn-primary glow-on-hover"
                            onClick={() => navigate('/cliente/consulta')}
                        >
                            <span>🔍 Consultar Deuda</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* PORTAL ADMIN */}
                    <div className="portal-card glass-card" data-aos="fade-up" data-aos-delay="200">
                        <div className="card-glow"></div>
                        <div className="portal-icon-container">
                            <div className="portal-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                        <h2>Panel Administrador</h2>
                        <p>Gestiona clientes, pagos e incidencias desde un solo lugar</p>
                        <ul className="feature-list">
                            <li>✓ Dashboard completo</li>
                            <li>✓ Reportes en tiempo real</li>
                            <li>✓ Control total</li>
                        </ul>
                        <button 
                            className="btn-primary glow-on-hover"
                            onClick={() => navigate('/login')}
                        >
                            <span>🚀 Ingresar al Panel</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* PLANES */}
            <section className="planes-section" id="planes">
                <h2 className="section-title">Nuestros Planes</h2>
                <div className="planes-grid">
                    <div className="plan-card" data-aos="zoom-in">
                        <div className="plan-header">
                            <h3>Básico</h3>
                            <div className="plan-price">
                                <span className="currency">S/</span>
                                <span className="amount">50</span>
                                <span className="period">/mes</span>
                            </div>
                        </div>
                        <ul className="plan-features">
                            <li>✓ 20 Mbps</li>
                            <li>✓ Wi-Fi incluido</li>
                            <li>✓ Soporte 24/7</li>
                        </ul>
                    </div>
                    
                    <div className="plan-card featured" data-aos="zoom-in" data-aos-delay="100">
                        <div className="popular-badge">Más Popular</div>
                        <div className="plan-header">
                            <h3>Pro</h3>
                            <div className="plan-price">
                                <span className="currency">S/</span>
                                <span className="amount">80</span>
                                <span className="period">/mes</span>
                            </div>
                        </div>
                        <ul className="plan-features">
                            <li>✓ 50 Mbps</li>
                            <li>✓ Wi-Fi 6 incluido</li>
                            <li>✓ Instalación gratis</li>
                            <li>✓ IP fija</li>
                        </ul>
                    </div>
                    
                    <div className="plan-card" data-aos="zoom-in" data-aos-delay="200">
                        <div className="plan-header">
                            <h3>Premium</h3>
                            <div className="plan-price">
                                <span className="currency">S/</span>
                                <span className="amount">120</span>
                                <span className="period">/mes</span>
                            </div>
                        </div>
                        <ul className="plan-features">
                            <li>✓ 100 Mbps</li>
                            <li>✓ Wi-Fi 6 Mesh</li>
                            <li>✓ Soporte prioritario</li>
                            <li>✓ IP fija dedicada</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="landing-features" id="servicios">
                <h2 className="section-title">¿Por qué elegirnos?</h2>
                <div className="features-grid">
                    <div className="feature-card" data-aos="fade-up">
                        <div className="feature-icon-modern">⚡</div>
                        <h3>Internet Rápido</h3>
                        <p>Velocidades de hasta 100 Mbps con fibra óptica</p>
                    </div>
                    <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
                        <div className="feature-icon-modern">💰</div>
                        <h3>Precios Accesibles</h3>
                        <p>Planes desde S/ 50 sin costos ocultos</p>
                    </div>
                    <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
                        <div className="feature-icon-modern">🛠️</div>
                        <h3>Soporte 24/7</h3>
                        <p>Asistencia técnica inmediata vía WhatsApp</p>
                    </div>
                    <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
                        <div className="feature-icon-modern">📱</div>
                        <h3>Autogestión</h3>
                        <p>Consulta y paga desde tu celular</p>
                    </div>
                </div>
            </section>

            {/* FOOTER MEJORADO */}
            <footer className="landing-footer" id="contacto">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Telecomunicaciones Jhair EIRL</h3>
                        <p>Conectando familias y negocios desde 2020</p>
                    </div>
                    <div className="footer-section">
                        <h4>Contacto</h4>
                        <p>📍 Lima, Perú</p>
                        <p>📞 991-569-419 | 995-151-453</p>
                        <p>📧 info@tvjhaire.com</p>
                    </div>
                    <div className="footer-section">
                        <h4>Horarios</h4>
                        <p>Lunes a Sábado: 8am - 8pm</p>
                        <p>Domingos: 9am - 2pm</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2025 TV Jhaire. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

export default Landing;