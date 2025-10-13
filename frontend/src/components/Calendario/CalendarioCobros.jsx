import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CalendarioCobros.css';

const CalendarioCobros = () => {
  const [vencimientos, setVencimientos] = useState({});
  const [mesActual, setMesActual] = useState(new Date());
  const [clientesDelDia, setClientesDelDia] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarVencimientos();
  }, [mesActual]);

  const cargarVencimientos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const inicioMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
      const finMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);

      const response = await axios.get('http://localhost:5000/api/clientes/vencimientos', {
        params: {
          fechaInicio: inicioMes.toISOString().split('T')[0],
          fechaFin: finMes.toISOString().split('T')[0]
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      // Agrupar por día
      const agrupados = {};
      response.data.forEach(cliente => {
        const fecha = cliente.proximo_pago.split('T')[0];
        if (!agrupados[fecha]) {
          agrupados[fecha] = [];
        }
        agrupados[fecha].push(cliente);
      });

      setVencimientos(agrupados);
    } catch (error) {
      console.error('Error al cargar vencimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const verDetallesDia = (dia) => {
    const fechaKey = `${mesActual.getFullYear()}-${String(mesActual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    setClientesDelDia(vencimientos[fechaKey] || []);
    setDiaSeleccionado(dia);
  };

  const cambiarMes = (direccion) => {
    const nuevoMes = new Date(mesActual);
    nuevoMes.setMonth(nuevoMes.getMonth() + direccion);
    setMesActual(nuevoMes);
    setDiaSeleccionado(null);
    setClientesDelDia([]);
  };

  const getDiasDelMes = () => {
    const año = mesActual.getFullYear();
    const mes = mesActual.getMonth();
    const primerDia = new Date(año, mes, 1).getDay();
    const ultimoDia = new Date(año, mes + 1, 0).getDate();

    const dias = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < primerDia; i++) {
      dias.push(null);
    }

    // Días del mes
    for (let dia = 1; dia <= ultimoDia; dia++) {
      dias.push(dia);
    }

    return dias;
  };

  const getClientesDelDia = (dia) => {
    const fechaKey = `${mesActual.getFullYear()}-${String(mesActual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return vencimientos[fechaKey] || [];
  };

  const getTotalDia = (dia) => {
    const clientes = getClientesDelDia(dia);
    return clientes.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0);
  };

  const esHoy = (dia) => {
    const hoy = new Date();
    return dia === hoy.getDate() && 
           mesActual.getMonth() === hoy.getMonth() && 
           mesActual.getFullYear() === hoy.getFullYear();
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="calendario-container">
      <div className="calendario-header">
        <h2>📅 Calendario de Vencimientos</h2>
        
        <div className="mes-navegacion">
          <button onClick={() => cambiarMes(-1)}>‹</button>
          <h3>{meses[mesActual.getMonth()]} {mesActual.getFullYear()}</h3>
          <button onClick={() => cambiarMes(1)}>›</button>
        </div>

        <button className="btn-hoy" onClick={() => setMesActual(new Date())}>
          Hoy
        </button>
      </div>

      <div className="calendario-grid">
        {dias.map(dia => (
          <div key={dia} className="dia-header">{dia}</div>
        ))}

        {getDiasDelMes().map((dia, index) => {
          if (dia === null) {
            return <div key={`empty-${index}`} className="dia-vacio"></div>;
          }

          const clientesDia = getClientesDelDia(dia);
          const totalDia = getTotalDia(dia);

          return (
            <div
              key={dia}
              className={`dia-celda ${esHoy(dia) ? 'hoy' : ''} ${diaSeleccionado === dia ? 'seleccionado' : ''}`}
              onClick={() => verDetallesDia(dia)}
            >
              <div className="dia-numero">{dia}</div>
              
              {clientesDia.length > 0 && (
                <div className="dia-info">
                  <div className="cliente-count">{clientesDia.length} cliente{clientesDia.length > 1 ? 's' : ''}</div>
                  <div className="total-dia">S/ {totalDia.toFixed(2)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {diaSeleccionado && (
        <div className="panel-detalle">
          <div className="detalle-header">
            <h3>{diaSeleccionado} de {meses[mesActual.getMonth()]}</h3>
            <button onClick={() => { setDiaSeleccionado(null); setClientesDelDia([]); }}>×</button>
          </div>

          <div className="detalle-stats">
            <div className="stat">
              <span className="stat-label">Clientes:</span>
              <span className="stat-value">{clientesDelDia.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total:</span>
              <span className="stat-value">
                S/ {clientesDelDia.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="clientes-lista">
            {clientesDelDia.length === 0 ? (
              <p className="no-data">No hay vencimientos este día</p>
            ) : (
              clientesDelDia.map(cliente => (
                <div key={cliente.id} className="cliente-card">
                  <div className="cliente-info">
                    <div className="cliente-nombre">
                      {cliente.nombre}
                      <span className="cliente-codigo">{cliente.codigo}</span>
                    </div>
                    <div className="cliente-direccion">{cliente.direccion}</div>
                    <div className="cliente-monto">S/ {parseFloat(cliente.precio_mensual).toFixed(2)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioCobros;