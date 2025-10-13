import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './BusquedaGlobal.css';

const BusquedaGlobal = () => {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [seleccionado, setSeleccionado] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Atajo de teclado: Ctrl+K o Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // ESC para cerrar
      if (e.key === 'Escape') {
        setMostrarResultados(false);
        setQuery('');
        inputRef.current?.blur();
      }

      // Navegación con flechas
      if (mostrarResultados && resultados.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSeleccionado((prev) => (prev + 1) % resultados.length);
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSeleccionado((prev) => (prev - 1 + resultados.length) % resultados.length);
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          irACliente(resultados[seleccionado]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mostrarResultados, resultados, seleccionado]);

  // Búsqueda con debounce
  useEffect(() => {
    if (query.length < 2) {
      setResultados([]);
      setMostrarResultados(false);
      return;
    }

    const timer = setTimeout(() => {
      buscar();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const buscar = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/clientes/buscar', {
        params: { q: query },
        headers: { Authorization: `Bearer ${token}` }
      });

      setResultados(response.data);
      setMostrarResultados(true);
      setSeleccionado(0);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const irACliente = (cliente) => {
    navigate(`/clientes/${cliente.id}`);
    setMostrarResultados(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const resaltarTexto = (texto, query) => {
    if (!texto) return '';
    const regex = new RegExp(`(${query})`, 'gi');
    return texto.replace(regex, '<mark>$1</mark>');
  };

  return (
    <div className="busqueda-global">
      <div className="busqueda-input-container">
        <span className="busqueda-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          className="busqueda-input"
          placeholder="Buscar cliente (Ctrl+K)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setMostrarResultados(true)}
        />
        {query && (
          <button 
            className="busqueda-limpiar"
            onClick={() => {
              setQuery('');
              setMostrarResultados(false);
              inputRef.current?.focus();
            }}
          >
            ×
          </button>
        )}
        <kbd className="busqueda-atajo">Ctrl K</kbd>
      </div>

      {mostrarResultados && (
        <>
          <div 
            className="busqueda-overlay" 
            onClick={() => setMostrarResultados(false)}
          />
          <div className="busqueda-resultados">
            {loading ? (
              <div className="resultado-loading">Buscando...</div>
            ) : resultados.length === 0 ? (
              <div className="resultado-vacio">
                <p>No se encontraron resultados para "{query}"</p>
                <small>Intenta buscar por nombre, DNI, código, dirección o teléfono</small>
              </div>
            ) : (
              <>
                <div className="resultados-header">
                  {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
                </div>
                <div className="resultados-lista">
                  {resultados.map((cliente, index) => (
                    <div
                      key={cliente.id}
                      className={`resultado-item ${seleccionado === index ? 'seleccionado' : ''}`}
                      onClick={() => irACliente(cliente)}
                      onMouseEnter={() => setSeleccionado(index)}
                    >
                      <div className="resultado-icono">
                        {cliente.tipo_servicio === 'TV' ? '📺' : 
                         cliente.tipo_servicio === 'INTERNET' ? '🌐' : '📡'}
                      </div>
                      
                      <div className="resultado-info">
                        <div className="resultado-nombre">
                          <span 
                            dangerouslySetInnerHTML={{ 
                              __html: resaltarTexto(cliente.nombre, query) 
                            }}
                          />
                          <span className="resultado-codigo">{cliente.codigo}</span>
                        </div>
                        
                        <div className="resultado-detalles">
                          {cliente.dni && (
                            <span 
                              className="detalle"
                              dangerouslySetInnerHTML={{ 
                                __html: `DNI: ${resaltarTexto(cliente.dni, query)}` 
                              }}
                            />
                          )}
                          {cliente.telefono && (
                            <span 
                              className="detalle"
                              dangerouslySetInnerHTML={{ 
                                __html: `📞 ${resaltarTexto(cliente.telefono, query)}` 
                              }}
                            />
                          )}
                          <span 
                            className="detalle"
                            dangerouslySetInnerHTML={{ 
                              __html: resaltarTexto(cliente.direccion, query) 
                            }}
                          />
                        </div>
                      </div>

                      <div className="resultado-estado">
                        <span className={`badge ${cliente.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}`}>
                          {cliente.estado}
                        </span>
                        <div className="resultado-precio">
                          S/ {parseFloat(cliente.precio_mensual).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="resultados-footer">
                  <span>↑↓ Navegar</span>
                  <span>↵ Seleccionar</span>
                  <span>Esc Cerrar</span>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BusquedaGlobal;