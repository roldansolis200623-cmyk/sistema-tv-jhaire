import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import './Landing.css';

function Landing() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [hoveredCard, setHoveredCard] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll();
    
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
    const y = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

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

    // Datos de planes
    const planes = [
        { 
            name: 'Básico', 
            speed: '20', 
            price: '45', 
            features: ['20 Mbps', 'WiFi básico', 'Soporte 24/7', '1 dispositivo'],
            color: 'from-blue-500 to-cyan-500',
            icon: '🚀'
        },
        { 
            name: 'Premium', 
            speed: '50', 
            price: '75', 
            features: ['50 Mbps', 'WiFi Mesh', 'Soporte prioritario', '5 dispositivos'], 
            popular: true,
            color: 'from-purple-500 to-pink-500',
            icon: '⚡'
        },
        { 
            name: 'Ultra', 
            speed: '100', 
            price: '120', 
            features: ['100 Mbps', 'WiFi Pro', 'Soporte VIP', 'Ilimitado'],
            color: 'from-orange-500 to-red-500',
            icon: '🔥'
        }
    ];

    // Servicios
    const servicios = [
        {
            icon: '🌐',
            title: 'Internet Fibra Óptica',
            description: 'Conexión ultrarrápida con tecnología de última generación',
            features: ['Sin cortes', 'Velocidad simétrica', 'IP dedicada'],
            gradient: 'from-blue-500 to-purple-500'
        },
        {
            icon: '📺',
            title: 'TV Cable HD',
            description: 'Más de 100 canales en alta definición',
            features: ['HD/4K', 'Grabación', 'Sin contrato'],
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            icon: '📡',
            title: 'WiFi Mesh',
            description: 'Cobertura total sin zonas muertas',
            features: ['Cobertura amplia', 'Roaming automático', 'App control'],
            gradient: 'from-pink-500 to-orange-500'
        }
    ];

    return (
        <div className="futuristic-landing" ref={containerRef}>
            {/* ANIMATED BACKGROUND */}
            <div className="animated-bg">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
                <div className="grid-overlay"></div>
            </div>

            {/* PARTICLES */}
            <div className="particles">
                {[...Array(50)].map((_, i) => (
                    <div 
                        key={i} 
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* NAVBAR FUTURISTA */}
            <motion.nav 
                className={`futuristic-nav ${scrolled ? 'scrolled' : ''}`}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
                <div className="nav-container">
                    <motion.div 
                        className="nav-logo"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="logo-glow">
                            <img src="/logo.png" alt="TV Jhaire" className="logo-image" />
                        </div>
                        <span className="logo-text">TV Jhaire</span>
                    </motion.div>
                    
                    <ul className="nav-links">
                        {['Inicio', 'Servicios', 'Planes', 'Contacto'].map((item, i) => (
                            <motion.li 
                                key={item}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                            >
                                <a href={`#${item.toLowerCase()}`}>
                                    <span className="nav-link-text">{item}</span>
                                    <span className="nav-link-line"></span>
                                </a>
                            </motion.li>
                        ))}
                    </ul>

                    <div className="nav-actions">
                        <motion.button
                            className="btn-glass"
                            onClick={() => navigate('/cliente/consulta')}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>Portal Cliente</span>
                        </motion.button>
                        <motion.button
                            className="btn-gradient"
                            onClick={() => navigate('/login')}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>Admin</span>
                            <div className="btn-shine"></div>
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* HERO FUTURISTA */}
            <section className="hero-futuristic" id="inicio">
                <motion.div 
                    className="hero-content"
                    style={{ opacity, scale, y }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <motion.div 
                            className="hero-badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                        >
                            <div className="badge-pulse"></div>
                            <span>Conectividad del Futuro</span>
                        </motion.div>

                        <h1 className="hero-title">
                            <motion.span
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            >
                                Internet de
                            </motion.span>
                            <br />
                            <motion.span 
                                className="gradient-text-animated"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.7 }}
                            >
                                Alta Velocidad
                            </motion.span>
                        </h1>

                        <motion.p 
                            className="hero-description"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                        >
                            Experimenta la conexión más avanzada del mercado con tecnología que redefine el futuro
                        </motion.p>

                        <motion.div 
                            className="hero-buttons"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1 }}
                        >
                            <motion.button
                                className="btn-hero-primary"
                                onClick={() => navigate('/cliente/consulta')}
                                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(139, 92, 246, 0.5)" }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>Consultar Deuda</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <div className="btn-ripple"></div>
                            </motion.button>
                            <motion.button
                                className="btn-hero-glass"
                                onClick={() => setShowPaymentModal(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>Realizar Pago</span>
                            </motion.button>
                        </motion.div>

                        <motion.div 
                            className="hero-stats"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.3 }}
                        >
                            {[
                                { number: '500+', label: 'Clientes', icon: '👥' },
                                { number: '99.9%', label: 'Uptime', icon: '⚡' },
                                { number: '24/7', label: 'Soporte', icon: '🛡️' }
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    className="stat-card"
                                    whileHover={{ y: -5, scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="stat-icon">{stat.icon}</div>
                                    <div className="stat-number">{stat.number}</div>
                                    <div className="stat-label">{stat.label}</div>
                                    <div className="stat-glow"></div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* SPEED VISUALIZER 3D */}
                    <motion.div
                        className="speed-visualizer"
                        initial={{ opacity: 0, scale: 0.5, rotateY: -30 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        style={{
                            transform: `perspective(1000px) rotateY(${mousePosition.x * 0.5}deg) rotateX(${-mousePosition.y * 0.5}deg)`
                        }}
                    >
                        <div className="speed-rings">
                            <div className="ring ring-1"></div>
                            <div className="ring ring-2"></div>
                            <div className="ring ring-3"></div>
                        </div>
                        <div className="speed-center">
                            <motion.div 
                                className="speed-value"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                100
                            </motion.div>
                            <div className="speed-unit">Mbps</div>
                        </div>
                        <div className="speed-particles">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="speed-particle" style={{
                                    animationDelay: `${i * 0.1}s`
                                }}></div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* SERVICIOS FUTURISTAS */}
            <section className="services-futuristic" id="servicios">
                <div className="section-container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="section-title">Servicios de Vanguardia</h2>
                        <p className="section-subtitle">Tecnología que transforma tu experiencia digital</p>
                    </motion.div>

                    <div className="services-grid-3d">
                        {servicios.map((service, index) => (
                            <motion.div
                                key={index}
                                className="service-card-3d"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                onHoverStart={() => setHoveredCard(index)}
                                onHoverEnd={() => setHoveredCard(null)}
                                whileHover={{ 
                                    z: 50,
                                    rotateX: 10,
                                    rotateY: 10,
                                    transition: { duration: 0.3 }
                                }}
                            >
                                <div className="card-shine"></div>
                                <div className={`card-gradient bg-gradient-to-br ${service.gradient}`}></div>
                                
                                <motion.div 
                                    className="service-icon-3d"
                                    animate={hoveredCard === index ? { 
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.2, 1]
                                    } : {}}
                                    transition={{ duration: 0.5 }}
                                >
                                    {service.icon}
                                </motion.div>

                                <h3 className="service-title-3d">{service.title}</h3>
                                <p className="service-desc-3d">{service.description}</p>

                                <ul className="service-features-3d">
                                    {service.features.map((feature, i) => (
                                        <motion.li 
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={hoveredCard === index ? { opacity: 1, x: 0 } : { opacity: 0.7, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </motion.li>
                                    ))}
                                </ul>

                                <motion.button
                                    className="service-btn"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Más info
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PLANES 3D CARDS */}
            <section className="plans-futuristic" id="planes">
                <div className="section-container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">Planes Diseñados para Ti</h2>
                        <p className="section-subtitle">Elige el poder que necesitas</p>
                    </motion.div>

                    <div className="plans-grid-3d">
                        {planes.map((plan, index) => (
                            <motion.div
                                key={index}
                                className={`plan-card-3d ${plan.popular ? 'popular' : ''}`}
                                initial={{ opacity: 0, y: 50, rotateX: -20 }}
                                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                whileHover={{ 
                                    y: -20,
                                    rotateY: 5,
                                    scale: 1.05,
                                    transition: { duration: 0.3 }
                                }}
                            >
                                {plan.popular && (
                                    <motion.div 
                                        className="popular-badge"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.5 + index * 0.2 }}
                                    >
                                        <span>⭐ Más Popular</span>
                                    </motion.div>
                                )}

                                <div className="plan-icon">{plan.icon}</div>
                                <h3 className="plan-name">{plan.name}</h3>
                                
                                <div className="plan-speed-display">
                                    <motion.div 
                                        className="speed-number"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                        {plan.speed}
                                    </motion.div>
                                    <span>Mbps</span>
                                </div>

                                <div className="plan-price-display">
                                    <span className="currency">S/</span>
                                    <span className="amount">{plan.price}</span>
                                    <span className="period">/mes</span>
                                </div>

                                <ul className="plan-features-list">
                                    {plan.features.map((feature, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + index * 0.2 + i * 0.1 }}
                                        >
                                            <div className="feature-check">✓</div>
                                            {feature}
                                        </motion.li>
                                    ))}
                                </ul>

                                <motion.button
                                    className="plan-button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowPaymentModal(true)}
                                >
                                    <span>Contratar Ahora</span>
                                    <div className="button-glow"></div>
                                </motion.button>

                                <div className={`plan-bg-gradient bg-gradient-to-br ${plan.color}`}></div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA FUTURISTA */}
            <section className="cta-futuristic" id="contacto">
                <motion.div
                    className="cta-container-3d"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="cta-bg-animated"></div>
                    <h2 className="cta-title">¿Listo para el Futuro?</h2>
                    <p className="cta-description">
                        Únete a la revolución digital. Miles de clientes ya disfrutan de la mejor conexión.
                    </p>
                    <div className="cta-buttons">
                        <motion.button
                            className="cta-btn-primary"
                            onClick={() => window.open('https://wa.me/51995151453', '_blank')}
                            whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(34, 197, 94, 0.5)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            <span>Contactar por WhatsApp</span>
                        </motion.button>
                        <motion.button
                            className="cta-btn-glass"
                            onClick={() => setShowPaymentModal(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>Ver Medios de Pago</span>
                        </motion.button>
                    </div>
                </motion.div>
            </section>

            {/* FOOTER MODERNO */}
            <footer className="footer-futuristic">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <img src="/logo.png" alt="TV Jhaire" className="logo-image" />
                            <span>TV Jhaire</span>
                        </div>
                        <p>Conectando el futuro, hoy.</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Servicios</h4>
                            <a href="#servicios">Internet</a>
                            <a href="#servicios">TV Cable</a>
                            <a href="#servicios">WiFi</a>
                        </div>
                        <div className="footer-column">
                            <h4>Soporte</h4>
                            <a href="#contacto">Contacto</a>
                            <a href="/cliente/consulta">Portal</a>
                            <a href="https://wa.me/51995151453">WhatsApp</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 TV Jhaire. Todos los derechos reservados.</p>
                </div>
            </footer>

            {/* MODAL DE PAGO FUTURISTA */}
            <PaymentModal 
                isOpen={showPaymentModal} 
                onClose={() => setShowPaymentModal(false)} 
            />
        </div>
    );
}

// COMPONENTE: MODAL DE PAGO FUTURISTA
function PaymentModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1);

    const paymentMethods = [
        {
            name: 'Yape',
            icon: '💳',
            number: '995 151 453',
            holder: 'JHAIRE MAMANI',
            color: 'from-purple-500 to-pink-500',
            steps: [
                'Abre tu app Yape',
                'Envía el monto a 995 151 453',
                'Nombre: JHAIRE MAMANI',
                'Toma captura del comprobante',
                'Envíala por WhatsApp'
            ]
        },
        {
            name: 'Plin',
            icon: '📱',
            number: '995 151 453',
            holder: 'JHAIRE MAMANI',
            color: 'from-blue-500 to-cyan-500',
            steps: [
                'Abre tu app Plin',
                'Envía el monto a 995 151 453',
                'Nombre: JHAIRE MAMANI',
                'Toma captura del comprobante',
                'Envíala por WhatsApp'
            ]
        },
        {
            name: 'Transferencia',
            icon: '🏦',
            bank: 'BCP',
            account: 'xxx-xxxxxxxx-x-xx',
            holder: 'JHAIRE MAMANI',
            color: 'from-green-500 to-emerald-500',
            steps: [
                'Ingresa a tu banca online',
                'Transfiere al BCP',
                'Cuenta: xxx-xxxxxxxx-x-xx',
                'Titular: JHAIRE MAMANI',
                'Envía comprobante por WhatsApp'
            ]
        },
        {
            name: 'Efectivo',
            icon: '💵',
            location: 'Oficina TV Jhaire',
            address: 'Av. Principal 123, Lima',
            color: 'from-yellow-500 to-orange-500',
            steps: [
                'Visita nuestra oficina',
                'Av. Principal 123, Lima',
                'Horario: Lun-Sáb 9am-6pm',
                'Realiza el pago en efectivo',
                'Recibe tu comprobante'
            ]
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="payment-modal"
                        initial={{ opacity: 0, scale: 0.8, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 100 }}
                        transition={{ type: "spring", damping: 25 }}
                    >
                        <div className="modal-header">
                            <h2>💳 Medios de Pago</h2>
                            <motion.button
                                className="modal-close"
                                onClick={onClose}
                                whileHover={{ rotate: 90 }}
                            >
                                ✕
                            </motion.button>
                        </div>

                        <div className="payment-methods-grid">
                            {paymentMethods.map((method, index) => (
                                <motion.div
                                    key={index}
                                    className="payment-method-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    onClick={() => setStep(index + 1)}
                                >
                                    <div className={`method-gradient bg-gradient-to-br ${method.color}`}></div>
                                    <div className="method-icon">{method.icon}</div>
                                    <h3>{method.name}</h3>
                                    {method.number && <p className="method-number">{method.number}</p>}
                                    {method.bank && <p className="method-bank">{method.bank}</p>}
                                    <motion.div
                                        className="method-arrow"
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        →
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>

                        {step > 0 && step <= paymentMethods.length && (
                            <motion.div
                                className="payment-steps"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <h3>📋 Pasos para pagar con {paymentMethods[step - 1].name}</h3>
                                <ol className="steps-list">
                                    {paymentMethods[step - 1].steps.map((stepText, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <span className="step-number">{i + 1}</span>
                                            <span>{stepText}</span>
                                        </motion.li>
                                    ))}
                                </ol>
                                <motion.button
                                    className="whatsapp-btn"
                                    onClick={() => window.open('https://wa.me/51995151453', '_blank')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    Confirmar por WhatsApp
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default Landing;