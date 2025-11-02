import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import notificacionService from '../services/notificacionInteligenteService';
import './NotificacionesInteligentes.css';

const NotificacionesInteligentes = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    
    const [notificaciones, setNotificaciones] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        tipo: null,
        prioridad: null,
        leida: null
    });
    const [vistaActual, setVistaActual] = useState('todas'); // 'todas', 'criticas', 'atencion', 'recordatorios'
    const [seleccionados, setSeleccionados] = useState([]); // IDs de notificaciones seleccionadas
    const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);

    // Cargar datos
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [notifs, resum] = await Promise.all([
                notificacionService.obtenerTodas(filtros),
                notificacionService.obtenerResumen()
            ]);
            setNotificaciones(notifs);
            setResumen(resum);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros]);

    // Aplicar filtro por vista
    const aplicarVistaFiltro = (vista) => {
        setVistaActual(vista);
        switch (vista) {
            case 'criticas':
                setFiltros({ tipo: 'CRITICO', prioridad: null, leida: false });
                break;
            case 'atencion':
                setFiltros({ tipo: 'ATENCION', prioridad: null, leida: false });
                break;
            case 'recordatorios':
                setFiltros({ tipo: 'RECORDATORIO', prioridad: null, leida: null });
                break;
            default:
                setFiltros({ tipo: null, prioridad: null, leida: false });
        }
    };

    // Marcar como leída
    const marcarLeida = async (id) => {
        try {
            await notificacionService.marcarLeida(id);
            cargarDatos();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Marcar todas como leídas
    const marcarTodasLeidas = async () => {
        try {
            const ids = notificaciones
                .filter(n => !n.leida)
                .map(n => n.id);
            
            if (ids.length === 0) {
                alert('No hay notificaciones sin leer');
                return;
            }

            await notificacionService.marcarVariasLeidas(ids);
            cargarDatos();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Archivar notificación
    const archivarNotificacion = async (id) => {
        try {
            await notificacionService.archivar(id);
            cargarDatos();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Refrescar notificaciones
    const refrescar = async () => {
        try {
            setLoading(true);
            await notificacionService.generar();
            await cargarDatos();
            alert('Notificaciones actualizadas correctamente');
        } catch (error) {
            console.error('Error refrescando notificaciones:', error);
            const errorMsg = error.response?.data?.message || 'Error al actualizar. Verifica tu conexión.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Ir a cliente
    const irACliente = (clienteId) => {
        // Por ahora solo navega a la lista de clientes
        // TODO: Implementar navegación a cliente específico cuando la ruta esté disponible
        // navigate(`/clientes/${clienteId}`);
        navigate(`/clientes`);
    };

    // Enviar WhatsApp
    const enviarWhatsApp = (notificacion) => {
        // Validar que el teléfono exista
        if (!notificacion.telefono) {
            alert('Este cliente no tiene número de teléfono registrado');
            return;
        }

        const mensaje = encodeURIComponent(
            `Hola ${notificacion.nombre}, te contactamos de TV Jhaire. ${notificacion.mensaje}`
        );
        const url = `https://wa.me/51${notificacion.telefono}?text=${mensaje}`;
        window.open(url, '_blank');
        marcarLeida(notificacion.id);
    };

    // Toggle selección individual
    const toggleSeleccion = (notifId) => {
        setSeleccionados(prev => {
            if (prev.includes(notifId)) {
                return prev.filter(id => id !== notifId);
            } else {
                return [...prev, notifId];
            }
        });
    };

    // Seleccionar/Deseleccionar todos
    const toggleSeleccionTodos = () => {
        if (seleccionados.length === notificaciones.length) {
            setSeleccionados([]);
        } else {
            setSeleccionados(notificaciones.map(n => n.id));
        }
    };

    // Enviar WhatsApp masivo
    const enviarWhatsAppMasivo = async () => {
        const notificacionesAEnviar = notificaciones.filter(n => seleccionados.includes(n.id));

        if (notificacionesAEnviar.length === 0) {
            alert('Selecciona al menos un cliente para enviar WhatsApp');
            return;
        }

        const sinTelefono = notificacionesAEnviar.filter(n => !n.telefono);
        if (sinTelefono.length > 0) {
            const confirmar = window.confirm(
                `${sinTelefono.length} cliente(s) no tienen teléfono. ¿Continuar con los demás?`
            );
            if (!confirmar) return;
        }

        const clientesValidos = notificacionesAEnviar.filter(n => n.telefono);

        if (clientesValidos.length === 0) {
            alert('Ningún cliente seleccionado tiene teléfono');
            return;
        }

        const confirmar = window.confirm(
            `¿Enviar WhatsApp a ${clientesValidos.length} cliente(s)?\n\nSe abrirán las conversaciones una por una.`
        );

        if (!confirmar) return;

        setEnviandoWhatsApp(true);

        // Enviar uno por uno con delay
        for (let i = 0; i < clientesValidos.length; i++) {
            const notif = clientesValidos[i];

            const mensaje = encodeURIComponent(
                `Hola ${notif.nombre}, somos de TV Jhaire.\n\n` +
                `Te recordamos que tienes una deuda pendiente de S/ ${formatearMonto(notif.deuda_actual)}.\n` +
                `Días sin pagar: ${formatearNumero(notif.dias_sin_pagar, 0)} días.\n\n` +
                `Por favor, regulariza tu pago para evitar el corte del servicio.\n\n` +
                `¡Gracias! 🙏`
            );

            const url = `https://wa.me/51${notif.telefono}?text=${mensaje}`;

            // Abrir WhatsApp
            window.open(url, '_blank');

            // Marcar como leída
            try {
                await marcarLeida(notif.id);
            } catch (error) {
                console.error('Error marcando como leída:', error);
            }

            // Delay de 2 segundos entre cada mensaje (excepto el último)
            if (i < clientesValidos.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        setEnviandoWhatsApp(false);
        setSeleccionados([]);
        alert(`WhatsApp enviado a ${clientesValidos.length} cliente(s)`);
        cargarDatos();
    };

    // Obtener icono según tipo
    const obtenerIcono = (tipo) => {
        switch (tipo) {
            case 'CRITICO': return '🔴';
            case 'ATENCION': return '⚠️';
            case 'RECORDATORIO': return '📅';
            case 'AL_DIA': return '✅';
            default: return '📋';
        }
    };

    // Obtener color según prioridad
    const obtenerColorPrioridad = (prioridad) => {
        switch (prioridad) {
            case 'alta': return 'notif-alta';
            case 'media': return 'notif-media';
            case 'baja': return 'notif-baja';
            default: return 'notif-info';
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // 🔧 HELPER: Formatear monto de forma segura
    const formatearMonto = (valor) => {
        const numero = Number(valor);
        return isNaN(numero) ? '0.00' : numero.toFixed(2);
    };

    // 🔧 HELPER: Formatear número entero de forma segura
    const formatearNumero = (valor, defecto = 0) => {
        const numero = Number(valor);
        return isNaN(numero) ? defecto : numero;
    };

    if (loading && !resumen) {
        return (
            <div className="notificaciones-loading">
                <div className="spinner"></div>
                <p>Cargando notificaciones...</p>
            </div>
        );
    }

    return (
        <div className="notificaciones-container">
            {/* Header */}
            <header className="notificaciones-header">
                <div className="header-left">
                    <button onClick={() => navigate('/dashboard')} className="btn-volver">
                        ← Volver al Dashboard
                    </button>
                    <h1>🔔 Notificaciones Inteligentes</h1>
                </div>
                <div className="header-right">
                    <button onClick={refrescar} className="btn-refresh" disabled={loading}>
                        🔄 Actualizar
                    </button>
                    <button onClick={handleLogout} className="btn-logout">
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {/* Resumen de notificaciones */}
            {resumen && (
                <div className="notif-resumen">
                    <div 
                        className={`resumen-card ${vistaActual === 'todas' ? 'active' : ''}`}
                        onClick={() => aplicarVistaFiltro('todas')}
                    >
                        <div className="card-icono">📊</div>
                        <div className="card-info">
                            <h3>{formatearNumero(resumen.total, 0)}</h3>
                            <p>Total</p>
                        </div>
                    </div>

                    <div 
                        className={`resumen-card criticas ${vistaActual === 'criticas' ? 'active' : ''}`}
                        onClick={() => aplicarVistaFiltro('criticas')}
                    >
                        <div className="card-icono">🔴</div>
                        <div className="card-info">
                            <h3>{formatearNumero(resumen.criticas, 0)}</h3>
                            <p>Críticas</p>
                        </div>
                    </div>

                    <div 
                        className={`resumen-card atencion ${vistaActual === 'atencion' ? 'active' : ''}`}
                        onClick={() => aplicarVistaFiltro('atencion')}
                    >
                        <div className="card-icono">⚠️</div>
                        <div className="card-info">
                            <h3>{formatearNumero(resumen.atencion, 0)}</h3>
                            <p>Atención</p>
                        </div>
                    </div>

                    <div 
                        className={`resumen-card recordatorios ${vistaActual === 'recordatorios' ? 'active' : ''}`}
                        onClick={() => aplicarVistaFiltro('recordatorios')}
                    >
                        <div className="card-icono">📅</div>
                        <div className="card-info">
                            <h3>{formatearNumero(resumen.recordatorios, 0)}</h3>
                            <p>Recordatorios</p>
                        </div>
                    </div>

                    <div className="resumen-card no-leidas">
                        <div className="card-icono">📬</div>
                        <div className="card-info">
                            <h3>{formatearNumero(resumen.no_leidas, 0)}</h3>
                            <p>Sin Leer</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Acciones rápidas */}
            <div className="notif-acciones">
                <button onClick={marcarTodasLeidas} className="btn-accion">
                    ✓ Marcar todas como leídas
                </button>
                <button onClick={() => setFiltros({ ...filtros, leida: filtros.leida === false ? null : false })} className="btn-accion">
                    {filtros.leida === false ? '📭 Mostrar todas' : '📬 Solo no leídas'}
                </button>
                <button
                    onClick={toggleSeleccionTodos}
                    className="btn-accion"
                    disabled={notificaciones.length === 0}
                >
                    {seleccionados.length === notificaciones.length && notificaciones.length > 0 ? '⬜ Deseleccionar todos' : '☑️ Seleccionar todos'}
                </button>
                {seleccionados.length > 0 && (
                    <button
                        onClick={enviarWhatsAppMasivo}
                        className="btn-accion btn-whatsapp-masivo"
                        disabled={enviandoWhatsApp}
                    >
                        {enviandoWhatsApp ? '⏳ Enviando...' : `📱 Enviar WhatsApp (${seleccionados.length})`}
                    </button>
                )}
            </div>

            {/* Lista de notificaciones */}
            <div className="notif-lista">
                {loading ? (
                    <div className="spinner-small">Cargando...</div>
                ) : notificaciones.length === 0 ? (
                    <div className="notif-vacia">
                        <p>🎉 ¡No hay notificaciones!</p>
                        <p>Todos los clientes están al día</p>
                    </div>
                ) : (
                    notificaciones.map(notif => (
                        <div
                            key={notif.id}
                            className={`notif-card ${obtenerColorPrioridad(notif.prioridad)} ${notif.leida ? 'leida' : 'no-leida'} ${seleccionados.includes(notif.id) ? 'seleccionada' : ''}`}
                        >
                            <div className="notif-header-card">
                                <div className="notif-tipo">
                                    <input
                                        type="checkbox"
                                        checked={seleccionados.includes(notif.id)}
                                        onChange={() => toggleSeleccion(notif.id)}
                                        className="notif-checkbox"
                                    />
                                    <span className="tipo-icono">{obtenerIcono(notif.tipo)}</span>
                                    <span className="tipo-texto">{notif.tipo}</span>
                                </div>
                                {!notif.leida && <span className="badge-nuevo">NUEVO</span>}
                            </div>

                            <div className="notif-body">
                                <h3 onClick={() => irACliente(notif.cliente_id)} className="cliente-nombre">
                                    {notif.nombre} {notif.apellido}
                                </h3>
                                <p className="notif-titulo">{notif.titulo}</p>
                                <p className="notif-mensaje">{notif.mensaje}</p>

                                <div className="notif-detalles">
                                    <span className="detalle-item">
                                        💰 Deuda: S/ {formatearMonto(notif.deuda_actual)}
                                    </span>
                                    <span className="detalle-item">
                                        📅 {formatearNumero(notif.dias_sin_pagar, 0)} días sin pagar
                                    </span>
                                    <span className="detalle-item">
                                        ⏱️ Patrón: cada {formatearNumero(notif.patron_detectado, 30)} días
                                    </span>
                                </div>
                            </div>

                            <div className="notif-footer">
                                <div className="notif-acciones-card">
                                    {notif.accion_sugerida === 'visitar' && (
                                        <button className="btn-accion-card visitar" onClick={() => irACliente(notif.cliente_id)}>
                                            🚶 Visitar
                                        </button>
                                    )}
                                    {(notif.accion_sugerida === 'llamar' || notif.accion_sugerida === 'whatsapp') && (
                                        <button className="btn-accion-card whatsapp" onClick={() => enviarWhatsApp(notif)}>
                                            💬 WhatsApp
                                        </button>
                                    )}
                                    <button className="btn-accion-card cliente" onClick={() => irACliente(notif.cliente_id)}>
                                        👤 Ver Cliente
                                    </button>
                                </div>

                                <div className="notif-meta">
                                    {!notif.leida && (
                                        <button className="btn-mini" onClick={() => marcarLeida(notif.id)}>
                                            ✓ Marcar leída
                                        </button>
                                    )}
                                    <button className="btn-mini archivar" onClick={() => archivarNotificacion(notif.id)}>
                                        🗑️ Archivar
                                    </button>
                                    <span className="fecha">
                                        {new Date(notif.fecha_creacion).toLocaleDateString('es-PE', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificacionesInteligentes;