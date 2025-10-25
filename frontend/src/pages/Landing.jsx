import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Landing.css';

function Landing() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="modern-landing">
            {/* FLOATING SHAPES BACKGROUND */}
            <div className="floating-shapes">
                <motion.div 
                    className="shape shape-1"
                    animate={{
                        x: mousePosition.x,
                        y: mousePosition.y,
                    }}
                    transition={{ type: "spring", stiffness: 50 }}
                />
                <motion.div 
                    className="shape shape-2"
                    animate={{
                        x: -mousePosition.x * 0.5,
                        y: -mousePosition.y * 0.5,
                    }}
                    transition={{ type: "spring", stiffness: 30 }}
                />
                <motion.div 
                    className="shape shape-3"
                    animate={{
                        x: mousePosition.x * 0.3,
                        y: -mousePosition.y * 0.3,
                    }}
                    transition={{ type: "spring", stiffness: 40 }}
                />
            </div>

            {/* NAVBAR */}
            <motion.nav 
                className={`modern-nav ${scrolled ? 'scrolled' : ''}`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="nav-container">
                    <motion.div 
                        className="nav-logo"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="logo-icon">📡</span>
                        <span className="logo-text">TV Jhaire</span>
                    </motion.div>
                    
                    <ul className="nav-links">
                        <li><a href="#inicio">Inicio</a></li>
                        <li><a href="#servicios">Servicios</a></li>
                        <li><a href="#planes">Planes</a></li>
                        <li><a href="#contacto">Contacto</a></li>
                    </ul>

                    <div className="nav-actions">
                        <motion.button
                            className="btn-outline"
                            onClick={() => navigate('/cliente/consulta')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Portal Cliente
                        </motion.button>
                        <motion.button
                            className="btn-primary"
                            onClick={() => navigate('/login')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Admin
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* HERO SECTION */}
            <section className="hero-modern" id="inicio">
                <div className="hero-container">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div 
                            className="hero-badge"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className="badge-dot"></span>
                            Conectividad Premium
                        </motion.div>

                        <h1 className="hero-title">
                            Internet de
                            <br />
                            <span className="gradient-text">Alta Velocidad</span>
                        </h1>

                        <p className="hero-description">
                            Experimenta la mejor conexión para tu hogar o negocio.
                            Velocidad, estabilidad y soporte 24/7.
                        </p>

                        <div className="hero-buttons">
                            <motion.button
                                className="btn-hero-primary"
                                onClick={() => navigate('/cliente/consulta')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>Consultar Deuda</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </motion.button>
                            <motion.button
                                className="btn-hero-secondary"
                                onClick={() => document.getElementById('planes').scrollIntoView({ behavior: 'smooth' })}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Ver Planes
                            </motion.button>
                        </div>

                        <div className="hero-stats">
                            <motion.div 
                                className="stat-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="stat-number">500+</div>
                                <div className="stat-label">Clientes</div>
                            </motion.div>
                            <motion.div 
                                className="stat-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="stat-number">99.9%</div>
                                <div className="stat-label">Uptime</div>
                            </motion.div>
                            <motion.div 
                                className="stat-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="stat-number">24/7</div>
                                <div className="stat-label">Soporte</div>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="hero-visual"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <div className="visual-card">
                            <div className="card-glow"></div>
                            <div className="speed-indicator">
                                <div className="speed-ring"></div>
                                <div className="speed-value">
                                    <span className="speed-number">100</span>
                                    <span className="speed-unit">Mbps</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* SERVICES SECTION */}
            <section className="services-modern" id="servicios">
                <div className="section-container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="section-title">Nuestros Servicios</h2>
                        <p className="section-subtitle">
                            Soluciones integrales de conectividad para todos tus dispositivos
                        </p>
                    </motion.div>

                    <div className="services-grid">
                        {[
                            {
                                icon: (
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                                    </svg>
                                ),
                                title: 'Internet Fibra Óptica',
                                description: 'Velocidades de hasta 100 Mbps con tecnología de última generación',
                                features: ['Sin cortes', 'Velocidad simétrica', 'IP dedicada']
                            },
                            {
                                icon: (
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                ),
                                title: 'TV Cable HD',
                                description: 'Más de 100 canales en alta definición con contenido premium',
                                features: ['HD/4K', 'Grabación', 'Sin contrato']
                            },
                            {
                                icon: (
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
                                    </svg>
                                ),
                                title: 'WiFi Mesh',
                                description: 'Cobertura total en tu hogar sin zonas muertas',
                                features: ['Cobertura amplia', 'Roaming automático', 'App control']
                            }
                        ].map((service, index) => (
                            <motion.div
                                key={index}
                                className="service-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                            >
                                <div className="service-icon">{service.icon}</div>
                                <h3 className="service-title">{service.title}</h3>
                                <p className="service-description">{service.description}</p>
                                <ul className="service-features">
                                    {service.features.map((feature, i) => (
                                        <li key={i}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PLANS SECTION */}
            <section className="plans-modern" id="planes">
                <div className="section-container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="section-title">Planes que se adaptan a ti</h2>
                        <p className="section-subtitle">
                            Elige el plan perfecto para tu hogar o negocio
                        </p>
                    </motion.div>

                    <div className="plans-grid">
                        {[
                            { name: 'Básico', speed: '20', price: '45', features: ['20 Mbps', 'WiFi básico', 'Soporte 24/7', '1 dispositivo'] },
                            { name: 'Premium', speed: '50', price: '75', features: ['50 Mbps', 'WiFi Mesh', 'Soporte prioritario', '5 dispositivos'], popular: true },
                            { name: 'Ultra', speed: '100', price: '120', features: ['100 Mbps', 'WiFi Pro', 'Soporte VIP', 'Ilimitado'] }
                        ].map((plan, index) => (
                            <motion.div
                                key={index}
                                className={`plan-card ${plan.popular ? 'popular' : ''}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -15 }}
                            >
                                {plan.popular && <div className="popular-badge">Más popular</div>}
                                <div className="plan-header">
                                    <h3 className="plan-name">{plan.name}</h3>
                                    <div className="plan-speed">{plan.speed} Mbps</div>
                                    <div className="plan-price">
                                        <span className="price-currency">S/</span>
                                        <span className="price-amount">{plan.price}</span>
                                        <span className="price-period">/mes</span>
                                    </div>
                                </div>
                                <ul className="plan-features">
                                    {plan.features.map((feature, i) => (
                                        <li key={i}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <motion.button
                                    className="plan-button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Contratar
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="cta-modern" id="contacto">
                <div className="cta-container">
                    <motion.div
                        className="cta-content"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="cta-title">¿Listo para la mejor conexión?</h2>
                        <p className="cta-description">
                            Únete a cientos de clientes satisfechos y disfruta de internet sin límites
                        </p>
                        <div className="cta-buttons">
                            <motion.button
                                className="cta-btn-primary"
                                onClick={() => window.open('https://wa.me/51995151453', '_blank')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                Contactar por WhatsApp
                            </motion.button>
                            <motion.button
                                className="cta-btn-secondary"
                                onClick={() => navigate('/cliente/consulta')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Portal Cliente
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="modern-footer">
                <div className="footer-container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <span className="logo-icon">📡</span>
                                <span className="logo-text">TV Jhaire</span>
                            </div>
                            <p className="footer-description">
                                Internet y TV de alta calidad para tu hogar
                            </p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Servicios</h4>
                                <a href="#servicios">Internet</a>
                                <a href="#servicios">TV Cable</a>
                                <a href="#servicios">WiFi Mesh</a>
                            </div>
                            <div className="footer-column">
                                <h4>Soporte</h4>
                                <a href="#contacto">Contacto</a>
                                <a href="/cliente/consulta">Portal Cliente</a>
                                <a href="https://wa.me/51995151453" target="_blank" rel="noreferrer">WhatsApp</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 TV Jhaire. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;