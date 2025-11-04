// ============================================
// frontend/src/components/DashboardFilters.jsx
// FILTROS DINÁMICOS AVANZADOS
// ============================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Users, TrendingUp, Filter } from 'lucide-react';
import './DashboardFilters.css';

const DashboardFilters = ({ dateRange, setDateRange, filters, setFilters, onClose }) => {
    const [tempFilters, setTempFilters] = useState(filters);
    const [tempDateRange, setTempDateRange] = useState(dateRange);

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setDateRange(tempDateRange);
        onClose();
    };

    const handleResetFilters = () => {
        const defaultFilters = {
            zona: 'todas',
            estado: 'todos',
            scoreMin: 0,
            scoreMax: 100
        };
        const defaultDateRange = {
            start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            end: new Date()
        };
        setTempFilters(defaultFilters);
        setTempDateRange(defaultDateRange);
        setFilters(defaultFilters);
        setDateRange(defaultDateRange);
    };

    return (
        <motion.div
            className="filters-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="filters-panel"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="filters-header">
                    <div className="filters-title">
                        <Filter size={24} />
                        <h2>Filtros Avanzados</h2>
                    </div>
                    <button className="btn-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="filters-content">
                    {/* RANGO DE FECHAS */}
                    <div className="filter-section">
                        <div className="filter-label">
                            <Calendar size={20} />
                            <span>Rango de Fechas</span>
                        </div>
                        <div className="date-inputs">
                            <div className="date-input-group">
                                <label>Desde</label>
                                <input
                                    type="date"
                                    value={tempDateRange.start.toISOString().split('T')[0]}
                                    onChange={(e) => setTempDateRange({
                                        ...tempDateRange,
                                        start: new Date(e.target.value)
                                    })}
                                    className="date-input"
                                />
                            </div>
                            <div className="date-input-group">
                                <label>Hasta</label>
                                <input
                                    type="date"
                                    value={tempDateRange.end.toISOString().split('T')[0]}
                                    onChange={(e) => setTempDateRange({
                                        ...tempDateRange,
                                        end: new Date(e.target.value)
                                    })}
                                    className="date-input"
                                />
                            </div>
                        </div>

                        {/* QUICK FILTERS */}
                        <div className="quick-filters">
                            <button
                                className="quick-filter-btn"
                                onClick={() => setTempDateRange({
                                    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                    end: new Date()
                                })}
                            >
                                Este Mes
                            </button>
                            <button
                                className="quick-filter-btn"
                                onClick={() => {
                                    const today = new Date();
                                    setTempDateRange({
                                        start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
                                        end: new Date(today.getFullYear(), today.getMonth(), 0)
                                    });
                                }}
                            >
                                Mes Anterior
                            </button>
                            <button
                                className="quick-filter-btn"
                                onClick={() => {
                                    const today = new Date();
                                    setTempDateRange({
                                        start: new Date(today.getFullYear(), 0, 1),
                                        end: today
                                    });
                                }}
                            >
                                Este Año
                            </button>
                        </div>
                    </div>

                    {/* ZONA GEOGRÁFICA */}
                    <div className="filter-section">
                        <div className="filter-label">
                            <MapPin size={20} />
                            <span>Zona Geográfica</span>
                        </div>
                        <select
                            className="filter-select"
                            value={tempFilters.zona}
                            onChange={(e) => setTempFilters({
                                ...tempFilters,
                                zona: e.target.value
                            })}
                        >
                            <option value="todas">Todas las Zonas</option>
                            <option value="norte">Zona Norte</option>
                            <option value="sur">Zona Sur</option>
                            <option value="este">Zona Este</option>
                            <option value="oeste">Zona Oeste</option>
                            <option value="centro">Zona Centro</option>
                        </select>
                    </div>

                    {/* ESTADO DE CLIENTE */}
                    <div className="filter-section">
                        <div className="filter-label">
                            <Users size={20} />
                            <span>Estado de Cliente</span>
                        </div>
                        <div className="filter-chips">
                            {['todos', 'activo', 'suspendido', 'cortado'].map(estado => (
                                <button
                                    key={estado}
                                    className={`filter-chip ${tempFilters.estado === estado ? 'active' : ''}`}
                                    onClick={() => setTempFilters({
                                        ...tempFilters,
                                        estado
                                    })}
                                >
                                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RANGO DE SCORE */}
                    <div className="filter-section">
                        <div className="filter-label">
                            <TrendingUp size={20} />
                            <span>Score de Pago</span>
                        </div>
                        <div className="score-range">
                            <div className="score-inputs">
                                <div className="score-input-group">
                                    <label>Mínimo</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={tempFilters.scoreMin}
                                        onChange={(e) => setTempFilters({
                                            ...tempFilters,
                                            scoreMin: parseInt(e.target.value) || 0
                                        })}
                                        className="score-input"
                                    />
                                </div>
                                <div className="score-input-group">
                                    <label>Máximo</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={tempFilters.scoreMax}
                                        onChange={(e) => setTempFilters({
                                            ...tempFilters,
                                            scoreMax: parseInt(e.target.value) || 100
                                        })}
                                        className="score-input"
                                    />
                                </div>
                            </div>
                            <div className="score-slider">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={tempFilters.scoreMin}
                                    onChange={(e) => setTempFilters({
                                        ...tempFilters,
                                        scoreMin: parseInt(e.target.value)
                                    })}
                                    className="slider slider-min"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={tempFilters.scoreMax}
                                    onChange={(e) => setTempFilters({
                                        ...tempFilters,
                                        scoreMax: parseInt(e.target.value)
                                    })}
                                    className="slider slider-max"
                                />
                            </div>
                            <div className="score-labels">
                                <span>0</span>
                                <span>25</span>
                                <span>50</span>
                                <span>75</span>
                                <span>100</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="filters-footer">
                    <button
                        className="btn-reset"
                        onClick={handleResetFilters}
                    >
                        Restablecer
                    </button>
                    <div className="footer-actions">
                        <button
                            className="btn-cancel"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn-apply"
                            onClick={handleApplyFilters}
                        >
                            Aplicar Filtros
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DashboardFilters;