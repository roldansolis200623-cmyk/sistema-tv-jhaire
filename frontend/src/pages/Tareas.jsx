// ============================================
// frontend/src/pages/Tareas.jsx
// SISTEMA DE TAREAS ULTRA PRO
// ============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Circle,
    Clock,
    AlertCircle,
    Plus,
    Filter,
    Calendar,
    User,
    Target,
    Trash2,
    Edit,
    CheckCheck,
    Brain,
    TrendingUp,
    X
} from 'lucide-react';
import api from '../services/api';
import './Tareas.css';

const Tareas = () => {
    const [tareas, setTareas] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todos');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [tareaEditando, setTareaEditando] = useState(null);
    
    const [nuevaTarea, setNuevaTarea] = useState({
        titulo: '',
        descripcion: '',
        prioridad: 'MEDIA',
        fecha_vencimiento: ''
    });

    useEffect(() => {
        cargarDatos();
    }, [filtro]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            
            const params = {};
            if (filtro !== 'todos') {
                params.estado = filtro;
            }
            
            const [tareasRes, statsRes] = await Promise.all([
                api.get('/tareas', { params }),
                api.get('/tareas/stats')
            ]);
            
            setTareas(tareasRes.data.tareas || []);
            setStats(statsRes.data.stats || {});
            setLoading(false);
        } catch (error) {
            console.error('Error cargando tareas:', error);
            setLoading(false);
        }
    };

    const crearTarea = async () => {
        try {
            if (!nuevaTarea.titulo) {
                alert('El título es requerido');
                return;
            }
            
            await api.post('/tareas', nuevaTarea);
            
            setNuevaTarea({
                titulo: '',
                descripcion: '',
                prioridad: 'MEDIA',
                fecha_vencimiento: ''
            });
            setMostrarModal(false);
            cargarDatos();
        } catch (error) {
            console.error('Error creando tarea:', error);
            alert('Error al crear tarea');
        }
    };

    const completarTarea = async (id) => {
        try {
            await api.post(`/tareas/${id}/completar`);
            cargarDatos();
        } catch (error) {
            console.error('Error completando tarea:', error);
        }
    };

    const eliminarTarea = async (id) => {
        if (!window.confirm('¿Eliminar esta tarea?')) return;
        
        try {
            await api.delete(`/tareas/${id}`);
            cargarDatos();
        } catch (error) {
            console.error('Error eliminando tarea:', error);
        }
    };

    const getPrioridadColor = (prioridad) => {
        const colores = {
            'CRÍTICA': 'critica',
            'ALTA': 'alta',
            'MEDIA': 'media',
            'BAJA': 'baja'
        };
        return colores[prioridad] || 'media';
    };

    const getPrioridadIcon = (prioridad) => {
        if (prioridad === 'CRÍTICA') return <AlertCircle size={16} />;
        if (prioridad === 'ALTA') return <TrendingUp size={16} />;
        return <Target size={16} />;
    };

    const getEstadoIcon = (estado) => {
        if (estado === 'completada') return <CheckCircle2 size={20} />;
        if (estado === 'en_progreso') return <Clock size={20} />;
        return <Circle size={20} />;
    };

    const getTipoIcon = (tipo) => {
        if (tipo === 'recomendacion_ia') return <Brain size={16} />;
        if (tipo === 'alerta') return <AlertCircle size={16} />;
        return <CheckCheck size={16} />;
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'Sin fecha';
        const d = new Date(fecha);
        const hoy = new Date();
        const diff = Math.floor((d - hoy) / (1000 * 60 * 60 * 24));
        
        if (diff < 0) return '¡Vencida!';
        if (diff === 0) return 'Hoy';
        if (diff === 1) return 'Mañana';
        return `En ${diff} días`;
    };

    if (loading) {
        return (
            <div className="tareas-loading">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="loading-spinner"
                />
                <p>Cargando tareas...</p>
            </div>
        );
    }

    return (
        <div className="tareas-container">
            {/* HEADER */}
            <motion.header 
                className="tareas-header"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="header-content">
                    <div className="header-left">
                        <h1>📋 Mis Tareas</h1>
                        <p className="subtitle">Gestiona tus actividades y recomendaciones</p>
                    </div>
                    <motion.button
                        className="btn-nueva-tarea"
                        onClick={() => setMostrarModal(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus size={20} />
                        Nueva Tarea
                    </motion.button>
                </div>
            </motion.header>

            {/* STATS */}
            <div className="tareas-stats">
                <motion.div 
                    className="stat-card pendientes"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon">
                        <Circle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.pendientes || 0}</span>
                        <span className="stat-label">Pendientes</span>
                    </div>
                </motion.div>

                <motion.div 
                    className="stat-card en-progreso"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.en_progreso || 0}</span>
                        <span className="stat-label">En Progreso</span>
                    </div>
                </motion.div>

                <motion.div 
                    className="stat-card completadas"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.completadas || 0}</span>
                        <span className="stat-label">Completadas</span>
                    </div>
                </motion.div>

                <motion.div 
                    className="stat-card criticas"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="stat-icon">
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.criticas || 0}</span>
                        <span className="stat-label">Críticas</span>
                    </div>
                </motion.div>
            </div>

            {/* FILTROS */}
            <div className="tareas-filtros">
                <div className="filtros-tabs">
                    {['todos', 'pendiente', 'en_progreso', 'completada'].map(f => (
                        <button
                            key={f}
                            className={`filtro-tab ${filtro === f ? 'active' : ''}`}
                            onClick={() => setFiltro(f)}
                        >
                            {f === 'todos' && 'Todas'}
                            {f === 'pendiente' && 'Pendientes'}
                            {f === 'en_progreso' && 'En Progreso'}
                            {f === 'completada' && 'Completadas'}
                        </button>
                    ))}
                </div>
            </div>

            {/* LISTA DE TAREAS */}
            <div className="tareas-lista">
                <AnimatePresence>
                    {tareas.length === 0 ? (
                        <motion.div 
                            className="tareas-vacio"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <CheckCircle2 size={64} />
                            <h3>No hay tareas</h3>
                            <p>Crea una nueva tarea o espera recomendaciones de la IA</p>
                        </motion.div>
                    ) : (
                        tareas.map((tarea, index) => (
                            <motion.div
                                key={tarea.id}
                                className={`tarea-card ${tarea.estado} prioridad-${getPrioridadColor(tarea.prioridad)}`}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                            >
                                <div className="tarea-check">
                                    <button
                                        className="btn-completar"
                                        onClick={() => completarTarea(tarea.id)}
                                        disabled={tarea.estado === 'completada'}
                                    >
                                        {getEstadoIcon(tarea.estado)}
                                    </button>
                                </div>

                                <div className="tarea-contenido">
                                    <div className="tarea-header-inline">
                                        <h3 className={tarea.estado === 'completada' ? 'completada' : ''}>
                                            {tarea.titulo}
                                        </h3>
                                        <div className="tarea-badges">
                                            <span className={`badge-prioridad ${getPrioridadColor(tarea.prioridad)}`}>
                                                {getPrioridadIcon(tarea.prioridad)}
                                                {tarea.prioridad}
                                            </span>
                                            {tarea.creado_por === 'ia' && (
                                                <span className="badge-ia">
                                                    <Brain size={14} />
                                                    IA
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {tarea.descripcion && (
                                        <p className="tarea-descripcion">{tarea.descripcion}</p>
                                    )}

                                    <div className="tarea-meta">
                                        {tarea.fecha_vencimiento && (
                                            <span className="meta-item fecha">
                                                <Calendar size={14} />
                                                {formatFecha(tarea.fecha_vencimiento)}
                                            </span>
                                        )}
                                        {tarea.cliente_nombre && (
                                            <span className="meta-item cliente">
                                                <User size={14} />
                                                {tarea.cliente_nombre}
                                            </span>
                                        )}
                                        <span className="meta-item tipo">
                                            {getTipoIcon(tarea.tipo)}
                                            {tarea.tipo.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="tarea-acciones">
                                    <button
                                        className="btn-accion"
                                        onClick={() => eliminarTarea(tarea.id)}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* MODAL NUEVA TAREA */}
            <AnimatePresence>
                {mostrarModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMostrarModal(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Nueva Tarea</h2>
                                <button
                                    className="btn-cerrar"
                                    onClick={() => setMostrarModal(false)}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Título *</label>
                                    <input
                                        type="text"
                                        value={nuevaTarea.titulo}
                                        onChange={(e) => setNuevaTarea({
                                            ...nuevaTarea,
                                            titulo: e.target.value
                                        })}
                                        placeholder="¿Qué necesitas hacer?"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Descripción</label>
                                    <textarea
                                        value={nuevaTarea.descripcion}
                                        onChange={(e) => setNuevaTarea({
                                            ...nuevaTarea,
                                            descripcion: e.target.value
                                        })}
                                        placeholder="Detalles adicionales..."
                                        rows="4"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Prioridad</label>
                                        <select
                                            value={nuevaTarea.prioridad}
                                            onChange={(e) => setNuevaTarea({
                                                ...nuevaTarea,
                                                prioridad: e.target.value
                                            })}
                                        >
                                            <option value="BAJA">Baja</option>
                                            <option value="MEDIA">Media</option>
                                            <option value="ALTA">Alta</option>
                                            <option value="CRÍTICA">Crítica</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Fecha Vencimiento</label>
                                        <input
                                            type="date"
                                            value={nuevaTarea.fecha_vencimiento}
                                            onChange={(e) => setNuevaTarea({
                                                ...nuevaTarea,
                                                fecha_vencimiento: e.target.value
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn-cancelar"
                                    onClick={() => setMostrarModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn-crear"
                                    onClick={crearTarea}
                                >
                                    <Plus size={18} />
                                    Crear Tarea
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tareas;