import React, { useState, useEffect } from 'react';
import { 
  Plus, Check, Trash2, Calendar, AlertCircle, CheckCircle2, Clock, ListTodo,
  Edit2, Archive, Repeat2, Flag, Tag, Users, MessageSquare, Paperclip,
  MoreVertical, ChevronDown, Search, Filter, SortAsc, Eye, Share2, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './02_Tareas_PREMIUM_COMPLETO.css';

const TareasPremiumCompleto = () => {
  const navigate = useNavigate();
  const [tareas, setTareas] = useState([]);
  const [filter, setFilter] = useState('todas');
  const [sortBy, setSortBy] = useState('fecha');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Datos iniciales
  useEffect(() => {
    const tareasDemo = [
      {
        id: 1,
        titulo: 'Contactar cliente Juan Pérez',
        descripcion: 'Llamar a cliente en riesgo crítico. Discutir plan de pagos.',
        prioridad: 'CRÍTICA',
        estado: 'pendiente',
        tipo: 'recomendacion_ia',
        fecha_vencimiento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        fecha_creacion: new Date(Date.now() - 2 * 60 * 60 * 1000),
        asignado: 'Jeny García',
        etiquetas: ['cobro', 'urgente', 'cliente'],
        comentarios: 2,
        archivos: 1,
        subtareas: [
          { id: 1, titulo: 'Preparar documentos', completada: false },
          { id: 2, titulo: 'Revisar historial de pagos', completada: true }
        ]
      },
      {
        id: 2,
        titulo: 'Enviar recordatorio de pago',
        descripcion: 'Enviar WhatsApp a 10 clientes con pagos próximos',
        prioridad: 'ALTA',
        estado: 'pendiente',
        tipo: 'recordatorio',
        fecha_vencimiento: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        fecha_creacion: new Date(Date.now() - 5 * 60 * 60 * 1000),
        asignado: 'Jeny García',
        etiquetas: ['comunicación', 'recordatorio'],
        comentarios: 0,
        archivos: 0,
        subtareas: []
      },
      {
        id: 3,
        titulo: 'Preparar reporte mensual',
        descripcion: 'Consolidar información de ingresos, cobranza y clientes',
        prioridad: 'MEDIA',
        estado: 'en_progreso',
        tipo: 'manual',
        fecha_vencimiento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        fecha_creacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        asignado: 'Jeny García',
        etiquetas: ['reporte', 'análisis'],
        comentarios: 3,
        archivos: 2,
        subtareas: [
          { id: 1, titulo: 'Recopilar datos de pagos', completada: true },
          { id: 2, titulo: 'Calcular métricas', completada: false },
          { id: 3, titulo: 'Generar gráficos', completada: false }
        ]
      },
      {
        id: 4,
        titulo: 'Revisar incidencias técnicas',
        descripcion: 'Validar y resolver tickets de sistema abiertos',
        prioridad: 'MEDIA',
        estado: 'completada',
        tipo: 'alerta',
        fecha_vencimiento: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        fecha_creacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        asignado: 'Jeny García',
        etiquetas: ['técnico', 'sistema'],
        comentarios: 1,
        archivos: 0,
        subtareas: [
          { id: 1, titulo: 'Revisar errores', completada: true },
          { id: 2, titulo: 'Aplicar parches', completada: true }
        ]
      },
      {
        id: 5,
        titulo: 'Actualizar datos de clientes',
        descripcion: 'Sincronizar información de clientes con CRM',
        prioridad: 'BAJA',
        estado: 'pendiente',
        tipo: 'manual',
        fecha_vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        fecha_creacion: new Date(Date.now() - 10 * 60 * 60 * 1000),
        asignado: 'Jeny García',
        etiquetas: ['datos', 'clientes'],
        comentarios: 0,
        archivos: 0,
        subtareas: []
      }
    ];
    setTareas(tareasDemo);
  }, []);

  const tareasFiltered = tareas
    .filter(t => {
      if (filter === 'todas') return true;
      return t.estado === filter;
    })
    .filter(t => 
      t.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const tareasSorted = [...tareasFiltered].sort((a, b) => {
    switch(sortBy) {
      case 'prioridad':
        const prioridades = { 'CRÍTICA': 0, 'ALTA': 1, 'MEDIA': 2, 'BAJA': 3 };
        return prioridades[a.prioridad] - prioridades[b.prioridad];
      case 'fecha':
        return a.fecha_vencimiento - b.fecha_vencimiento;
      case 'reciente':
        return b.fecha_creacion - a.fecha_creacion;
      default:
        return 0;
    }
  });

  const estadisticas = {
    total: tareas.length,
    pendiente: tareas.filter(t => t.estado === 'pendiente').length,
    en_progreso: tareas.filter(t => t.estado === 'en_progreso').length,
    completada: tareas.filter(t => t.estado === 'completada').length,
    critica: tareas.filter(t => t.prioridad === 'CRÍTICA').length
  };

  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case 'CRÍTICA': return 'critical';
      case 'ALTA': return 'high';
      case 'MEDIA': return 'medium';
      case 'BAJA': return 'low';
      default: return 'medium';
    }
  };

  const getIconoEstado = (estado) => {
    switch(estado) {
      case 'pendiente': return <Clock size={16} />;
      case 'en_progreso': return <AlertCircle size={16} />;
      case 'completada': return <CheckCircle2 size={16} />;
      default: return <ListTodo size={16} />;
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="tareas-premium-completo">
      {/* Back Button */}
      <button className="btn-back-tareas" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} />
        <span>Volver al Panel</span>
      </button>

      {/* Header */}
      <div className="tareas-header-premium">
        <div className="header-top">
          <div className="header-left">
            <div className="icon-wrapper-tareas">
              <ListTodo size={32} />
            </div>
            <div>
              <h1>Mis Tareas</h1>
              <p>Gestión completa de tareas ejecutivas y recomendaciones IA</p>
            </div>
          </div>
          <button className="btn-create-tareas" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Nueva Tarea
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid-tareas">
          <div className="stat-card pending">
            <div className="stat-number">{estadisticas.pendiente}</div>
            <div className="stat-label">Pendientes</div>
          </div>
          <div className="stat-card progress">
            <div className="stat-number">{estadisticas.en_progreso}</div>
            <div className="stat-label">En Progreso</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-number">{estadisticas.completada}</div>
            <div className="stat-label">Completadas</div>
          </div>
          <div className="stat-card critical">
            <div className="stat-number">{estadisticas.critica}</div>
            <div className="stat-label">Críticas</div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="search-filter-tareas">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text"
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <button className="btn-filter" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
            Filtros
          </button>

          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="fecha">Ordenar por Fecha</option>
            <option value="prioridad">Ordenar por Prioridad</option>
            <option value="reciente">Más Recientes</option>
          </select>
        </div>
      </div>

      {/* Filtros Expandidos */}
      {showFilters && (
        <div className="filter-panel-tareas">
          <button 
            className={`filter-btn ${filter === 'todas' ? 'active' : ''}`}
            onClick={() => setFilter('todas')}
          >
            Todas ({estadisticas.total})
          </button>
          <button 
            className={`filter-btn ${filter === 'pendiente' ? 'active' : ''}`}
            onClick={() => setFilter('pendiente')}
          >
            Pendientes ({estadisticas.pendiente})
          </button>
          <button 
            className={`filter-btn ${filter === 'en_progreso' ? 'active' : ''}`}
            onClick={() => setFilter('en_progreso')}
          >
            En Progreso ({estadisticas.en_progreso})
          </button>
          <button 
            className={`filter-btn ${filter === 'completada' ? 'active' : ''}`}
            onClick={() => setFilter('completada')}
          >
            Completadas ({estadisticas.completada})
          </button>
        </div>
      )}

      {/* Lista de Tareas */}
      <div className="tareas-container-premium">
        {tareasSorted.length === 0 ? (
          <div className="empty-state">
            <ListTodo size={48} />
            <h3>Sin tareas</h3>
            <p>Crea una nueva tarea para empezar</p>
          </div>
        ) : (
          tareasSorted.map(tarea => (
            <div 
              key={tarea.id}
              className={`tarea-card-premium ${getPrioridadColor(tarea.prioridad)} ${tarea.estado}`}
              onClick={() => { setSelectedTarea(tarea); setShowDetails(true); }}
            >
              <div className="tarea-header-premium">
                <div className="tarea-left">
                  <div className={`prioridad-badge ${getPrioridadColor(tarea.prioridad)}`}>
                    {tarea.prioridad}
                  </div>
                  <div className="tarea-title-section">
                    <h3>{tarea.titulo}</h3>
                    {tarea.tipo === 'recomendacion_ia' && (
                      <span className="badge-ia">🤖 IA</span>
                    )}
                  </div>
                </div>
                <div className="tarea-actions-premium">
                  <button className="btn-action estado">
                    {getIconoEstado(tarea.estado)}
                    <span>{tarea.estado.replace('_', ' ').toUpperCase()}</span>
                  </button>
                  <button className="btn-action menu">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="tarea-body-premium">
                <p className="descripcion">{tarea.descripcion}</p>

                {tarea.subtareas && tarea.subtareas.length > 0 && (
                  <div className="subtareas-preview">
                    <span className="subtareas-label">
                      {tarea.subtareas.filter(s => s.completada).length}/{tarea.subtareas.length} subtareas
                    </span>
                    <div className="subtareas-bar">
                      <div 
                        className="subtareas-progress"
                        style={{width: `${(tarea.subtareas.filter(s => s.completada).length / tarea.subtareas.length) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                )}

                {tarea.etiquetas && tarea.etiquetas.length > 0 && (
                  <div className="etiquetas-section">
                    {tarea.etiquetas.map((tag, idx) => (
                      <span key={idx} className="etiqueta">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="tarea-footer-premium">
                <div className="footer-left">
                  <div className="fecha">
                    <Calendar size={14} />
                    <span>
                      {formatDate(tarea.fecha_vencimiento)}
                      {getDaysUntil(tarea.fecha_vencimiento) <= 1 && (
                        <span className="urgente"> · URGENTE</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="footer-right">
                  {tarea.comentarios > 0 && (
                    <div className="comentarios-badge">
                      <MessageSquare size={14} />
                      <span>{tarea.comentarios}</span>
                    </div>
                  )}
                  {tarea.archivos > 0 && (
                    <div className="archivos-badge">
                      <Paperclip size={14} />
                      <span>{tarea.archivos}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Creación */}
      {showModal && (
        <div className="modal-overlay-tareas" onClick={() => setShowModal(false)}>
          <div className="modal-content-tareas" onClick={e => e.stopPropagation()}>
            <div className="modal-header-tareas">
              <h2>Nueva Tarea</h2>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body-tareas">
              <input type="text" placeholder="Título de la tarea" />
              <textarea placeholder="Descripción" rows="4" />
              <select>
                <option value="BAJA">Baja Prioridad</option>
                <option value="MEDIA">Media Prioridad</option>
                <option value="ALTA">Alta Prioridad</option>
                <option value="CRÍTICA">Crítica</option>
              </select>
              <input type="date" />
            </div>
            <div className="modal-footer-tareas">
              <button className="btn-cancel-modal" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-save-modal">Guardar Tarea</button>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Detalles */}
      {showDetails && selectedTarea && (
        <div className="details-panel" onClick={() => setShowDetails(false)}>
          <div className="details-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close-details" onClick={() => setShowDetails(false)}>✕</button>
            <h2>{selectedTarea.titulo}</h2>
            <p>{selectedTarea.descripcion}</p>
            {/* Más contenido aquí */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tareas;