import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './ClientPortal.css';

function ClientPortal() {
    const navigate = useNavigate();
    const [dni, setDni] = useState('');
    const [loading, setLoading] = useState(false);
    const [clientData, setClientData] = useState(null);
    const [error, setError] = useState('');

    const API_URL = 'https://sistema-tv-jhaire-production-1248.up.railway.app/api';

    const consultarDeuda = async (e) => {
        e.preventDefault();
        
        if (!dni || dni.length < 8) {
            setError('Por favor ingresa un DNI o número válido');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_URL}/public/consultar-deuda`, {
                dni: dni.trim()
            });

            setClientData(response.data.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Cliente no encontrado. Verifica tu DNI o número de teléfono.');
            } else {
                setError('Error al consultar. Intenta nuevamente.');
            }
            setClientData(null);
        } finally {
            setLoading(false);
        }
    };

    const confirmarPago = () => {
        const mensaje = `Hola, soy ${clientData.nombre} (DNI: ${dni}).\n\nAcabo de realizar el pago de S/ ${clientData.deuda_total.toFixed(2)}.\n\nAdjunto mi comprobante de pago.`;
        const whatsappUrl = `https://wa.me/51995151453?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappUrl, '_blank');
    };

    const volverConsulta = () => {
        setClientData(null);
        setDni('');
        setError('');
    };

    return (
        <div className="modern-portal">
            {/* HEADER */}
            <motion.nav 
                className="portal-nav"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="nav-content">
                    <motion.div 
                        className="nav-logo"
                        onClick={() => navigate('/')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="logo-icon">📡</span>
                        <span className="logo-text">TV Jhaire</span>
                    </motion.div>
                    <motion.button
                        className="back-button"
                        onClick={() => navigate('/')}
                        whileHover={{ x: -5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver al inicio
                    </motion.button>
                </div>
            </motion.nav>

            {/* MAIN CONTENT */}
            <div className="portal-main">
                <AnimatePresence mode="wait">
                    {!clientData ? (
                        // CONSULTA FORM
                        <motion.div
                            key="consulta"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="consulta-container"
                        >
                            <motion.div 
                                className="consulta-icon"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            >
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </motion.div>

                            <h1 className="consulta-title">Consulta tu Estado de Cuenta</h1>
                            <p className="consulta-subtitle">
                                Ingresa tu DNI o número de teléfono para ver tu información
                            </p>

                            <form onSubmit={consultarDeuda} className="consulta-form">
                                <div className="form-group">
                                    <label htmlFor="dni" className="form-label">
                                        DNI o Teléfono
                                    </label>
                                    <div className="input-wrapper">
                                        <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                        </svg>
                                        <input
                                            type="text"
                                            id="dni"
                                            className="form-input"
                                            placeholder="Ej: 72845123 o 951234567"
                                            value={dni}
                                            onChange={(e) => setDni(e.target.value)}
                                            maxLength="9"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        className="error-alert"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {error}
                                    </motion.div>
                                )}

                                <motion.button
                                    type="submit"
                                    className="submit-button"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? (
                                        <div className="loading">
                                            <div className="spinner"></div>
                                            <span>Consultando...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <span>Consultar</span>
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <div className="consulta-help">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Puedes usar tu DNI de 8 dígitos o número de teléfono de 9 dígitos</span>
                            </div>
                        </motion.div>
                    ) : (
                        // RESULT VIEW
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="result-container"
                        >
                            {/* CLIENT INFO CARD */}
                            <div className="info-card">
                                <div className="info-header">
                                    <div className="client-info">
                                        <div className="client-avatar">
                                            {clientData.nombre.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="client-name">{clientData.nombre}</h2>
                                            <p className="client-detail">DNI: {clientData.dni}</p>
                                            <p className="client-detail">Teléfono: {clientData.telefono}</p>
                                        </div>
                                    </div>
                                    <motion.span 
                                        className={`status-badge ${clientData.estado}`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    >
                                        {clientData.estado === 'activo' && '✓ Activo'}
                                        {clientData.estado === 'suspendido' && '⏸ Suspendido'}
                                        {clientData.estado === 'cortado' && '✗ Cortado'}
                                    </motion.span>
                                </div>

                                <div className="info-grid">
                                    <div className="info-item">
                                        <div className="info-label">Plan</div>
                                        <div className="info-value">{clientData.plan}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">Servicio</div>
                                        <div className="info-value">{clientData.tipo_servicio}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">Mensualidad</div>
                                        <div className="info-value">S/ {clientData.precio_mensual}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">Dirección</div>
                                        <div className="info-value">{clientData.direccion}</div>
                                    </div>
                                </div>
                            </div>

                            {/* DEUDA CARD */}
                            <div className="deuda-card">
                                <div className="deuda-header">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h3>Deuda Total</h3>
                                        <p>{clientData.meses_deuda} {clientData.meses_deuda === 1 ? 'mes' : 'meses'} pendientes</p>
                                    </div>
                                </div>

                                <motion.div 
                                    className="deuda-amount"
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 150 }}
                                >
                                    S/ {clientData.deuda_total.toFixed(2)}
                                </motion.div>

                                {clientData.deuda_total > 0 ? (
                                    <>
                                        <div className="deuda-breakdown">
                                            <div className="breakdown-item">
                                                <span>Monto base</span>
                                                <span>S/ {(clientData.meses_deuda * clientData.precio_mensual).toFixed(2)}</span>
                                            </div>
                                            <div className="breakdown-item total">
                                                <span>Total a pagar</span>
                                                <span>S/ {clientData.deuda_total.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <motion.button
                                            className="pay-button"
                                            onClick={confirmarPago}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                            </svg>
                                            <span>Confirmar Pago por WhatsApp</span>
                                        </motion.button>
                                    </>
                                ) : (
                                    <div className="no-deuda">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p>¡No tienes deuda pendiente!</p>
                                    </div>
                                )}
                            </div>

                            {/* BACK BUTTON */}
                            <motion.button
                                className="back-to-search"
                                onClick={volverConsulta}
                                whileHover={{ x: -5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Nueva consulta
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default ClientPortal;