import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ClientPortal.css';

function ClientPortal() {
    const navigate = useNavigate();
    const [dni, setDni] = useState('');
    const [loading, setLoading] = useState(false);
    const [clientData, setClientData] = useState(null);
    const [error, setError] = useState('');

    // 🔥 CORREGIDO: URL sin /api al final
    const API_URL = process.env.REACT_APP_API_URL || 'https://sistema-tv-jhaire-production-1248.up.railway.app';

    const consultarDeuda = async (e) => {
        e.preventDefault();
        
        if (!dni || dni.length < 8) {
            setError('Por favor ingresa un DNI o número válido');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 🔥 URL correcta: API_URL + /api/public/consultar-deuda
            const response = await axios.post(`${API_URL}/api/public/consultar-deuda`, {
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
        const whatsappUrl = `https://wa.me/51991569419?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappUrl, '_blank');
    };

    const volverConsulta = () => {
        setClientData(null);
        setDni('');
        setError('');
    };

    return (
        <div className="client-portal-container">
            <nav className="client-navbar">
                <div className="navbar-logo" onClick={() => navigate('/')}>
                    <span>📡</span>
                    <span>TV Jhaire</span>
                </div>
                <button className="btn-back" onClick={() => navigate('/')}>
                    ← Volver al inicio
                </button>
            </nav>

            <div className="client-portal-content">
                {!clientData ? (
                    <div className="consulta-card">
                        <div className="card-icon">👤</div>
                        <h1>Consulta tu Deuda</h1>
                        <p className="card-subtitle">
                            Ingresa tu DNI o número de teléfono para consultar tu estado de cuenta
                        </p>

                        <form onSubmit={consultarDeuda}>
                            <div className="form-group">
                                <label>DNI o Número de Teléfono</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: 72845123 o 951234567"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value)}
                                    maxLength="9"
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div className="error-message">
                                    ⚠️ {error}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="btn-consultar"
                                disabled={loading}
                            >
                                {loading ? '🔍 Consultando...' : '🔍 Consultar Deuda'}
                            </button>
                        </form>

                        <div className="info-box">
                            <p><strong>💡 ¿Necesitas ayuda?</strong></p>
                            <p>Contacta con nosotros:</p>
                            <p>📞 991-569-419 | 📧 info@tvjhaire.com</p>
                        </div>
                    </div>
                ) : (
                    <div className="resultado-card">
                        <div className="cliente-header">
                            <div className="avatar">
                                {clientData.nombre.charAt(0)}
                            </div>
                            <div className="cliente-info">
                                <h2>{clientData.nombre}</h2>
                                <p>DNI: {dni}</p>
                                <p>📍 {clientData.direccion}</p>
                                <p>📞 {clientData.telefono}</p>
                            </div>
                        </div>

                        <div className={`deuda-box ${clientData.meses_deuda === 0 ? 'deuda-ok' : 'deuda-pendiente'}`}>
                            {clientData.meses_deuda === 0 ? (
                                <>
                                    <div className="deuda-label">✅ Estado de Cuenta</div>
                                    <div className="deuda-monto-ok">¡AL DÍA!</div>
                                    <p>No tienes deudas pendientes</p>
                                </>
                            ) : (
                                <>
                                    <div className="deuda-label">⚠️ Deuda Pendiente</div>
                                    <div className="deuda-monto">S/ {clientData.deuda_total.toFixed(2)}</div>
                                    <p>{clientData.meses_deuda} {clientData.meses_deuda === 1 ? 'mes' : 'meses'} pendiente{clientData.meses_deuda > 1 ? 's' : ''}</p>
                                    <p className="precio-mes">S/ {clientData.precio_mensual.toFixed(2)} por mes</p>
                                </>
                            )}
                        </div>

                        {clientData.meses_deuda > 0 && (
                            <>
                                <h3 className="metodos-title">💳 Métodos de Pago</h3>
                                <div className="metodos-pago">
                                    <div className="metodo-card">
                                        <div className="metodo-icon">📱</div>
                                        <div className="metodo-info">
                                            <strong>Yape / Plin</strong>
                                            <p>991-569-419 (Francisca)</p>
                                            <p>995-151-453 (Damian)</p>
                                        </div>
                                    </div>
                                    <div className="metodo-card">
                                        <div className="metodo-icon">🏦</div>
                                        <div className="metodo-info">
                                            <strong>BCP</strong>
                                            <p>570-04329682069</p>
                                            <p>570-71655133-0-75</p>
                                        </div>
                                    </div>
                                    <div className="metodo-card">
                                        <div className="metodo-icon">🏦</div>
                                        <div className="metodo-info">
                                            <strong>Interbank</strong>
                                            <p>772-300-6808874</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    className="btn-confirmar-pago"
                                    onClick={confirmarPago}
                                >
                                    ✅ Ya realicé mi pago
                                </button>
                            </>
                        )}

                        <button 
                            className="btn-volver"
                            onClick={volverConsulta}
                        >
                            ← Nueva consulta
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClientPortal;