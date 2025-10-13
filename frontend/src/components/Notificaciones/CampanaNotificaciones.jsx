import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CampanaNotificaciones.css';

const CampanaNotificaciones = () => {
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarContador();
    const interval = setInterval(cargarContador, 30000); // Cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mostrarPanel) {
      cargarNotificaciones();
    }
  }, [mostrarPanel]);

  const cargarContador = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notificaciones/contador', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNoLeidas(response.data.no_leidas);
    } catch (error) {
      console.error('Error al cargar contador:', error);
    }
  };

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notificaciones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificaciones(response.data);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (notifId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/notificaciones/${notifId}/leer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotificaciones(notificaciones.map(n => 
        n.id === notifId ? { ...n, leida: true } : n
      ));
      cargarContador();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:5000/api/notificaciones/marcar-todas-leidas', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const eliminarNotificacion = async (notifId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/notificaciones/${notifId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotificaciones(notificaciones.filter(n => n.id !== notifId));
      cargarContador();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getIcono = (tipo) => {
    const iconos = {
      'VENCIMIENTO_HOY': '⏰',
      'VENCIMIENTO_PROXIMO': '📅',
      'DEUDA_2_MESES': '⚠️',
      'DEUDA_3_MESES': '🚨',
      'NUEVO_PAGO': '💰',
    };
    return iconos[tipo] || '📢';
  };

  const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const notifFecha = new Date(fecha);
    const diffMs = ahora - notifFecha;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    
    return notifFecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  };

  return (
    <>
      <button 
        className="campana-btn" 
        onClick={() => setMostrarPanel(!mostrarPanel)}
      >
        🔔
        {noLeidas > 0 && (
          <span className="campana-badge">{noLeidas > 99 ? '99+' : noLeidas}</span>
        )}
      </button>

      {mostrarPanel && (
        <>
          <div className="notif-overlay" onClick={() => setMostrarPanel(false)} />
          <div className="notif-panel">
            <div className="notif-header">
              <div className="header-left">
                <h3>🔔 Notificaciones</h3>
                {noLeidas > 0 && <span className="badge-count">{noLeidas}</span>}
              </div>
              <button className="close-btn" onClick={() => setMostrarPanel(false)}>×</button>
            </div>

            {noLeidas > 0 && (
              <div className="notif-actions">
                <button className="btn-marcar-todas" onClick={marcarTodasLeidas}>
                  ✓ Marcar todas como leídas
                </button>
              </div>
            )}

            <div className="notif-lista">
              {loading ? (
                <div className="loading">Cargando...</div>
              ) : notificaciones.length === 0 ? (
                <div className="no-notif">✨ No hay notificaciones</div>
              ) : (
                notificaciones.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notif-item ${!notif.leida ? 'no-leida' : ''}`}
                    onClick={() => !notif.leida && marcarComoLeida(notif.id)}
                  >
                    <div className="notif-icon">{getIcono(notif.tipo)}</div>
                    <div className="notif-content">
                      <div className="notif-titulo">{notif.titulo}</div>
                      <div className="notif-mensaje">{notif.mensaje}</div>
                      <div className="notif-tiempo">{formatearTiempo(notif.fecha_creacion)}</div>
                    </div>
                    <button 
                      className="btn-eliminar"
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarNotificacion(notif.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CampanaNotificaciones;