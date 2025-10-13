import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import {
  Users, TrendingUp, DollarSign, AlertTriangle,
  Wallet, Target, Activity, Award
} from 'lucide-react';
import './DashboardView.css';

const DashboardView = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/clientes');
      const data = await response.json();
      setClientes(data);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setLoading(false);
    }
  };

  // Calcular métricas
  const totalClientes = clientes.length;
  const clientesActivos = clientes.filter(c => c.estado === 'activo').length;
  const clientesDeudores = clientes.filter(c => c.meses_deuda > 0).length;
  
  const ingresoMensual = clientes
    .filter(c => c.estado === 'activo')
    .reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0);
  
  const ingresoPotencial = clientes
    .reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0);
  
  const tasaCobranza = totalClientes > 0 
    ? ((clientesActivos - clientesDeudores) / totalClientes) * 100 
    : 0;
  
  const montoEnRiesgo = clientes
    .filter(c => c.meses_deuda > 0)
    .reduce((sum, c) => sum + (c.precio_mensual * c.meses_deuda), 0);

  // Datos para gráficos
  const datosEstados = [
    { name: 'Activos', value: clientesActivos, color: '#10b981' },
    { name: 'Inactivos', value: clientes.filter(c => c.estado === 'inactivo').length, color: '#ef4444' },
    { name: 'Suspendidos', value: clientes.filter(c => c.estado === 'suspendido').length, color: '#f59e0b' }
  ];

  const datosServicios = Object.entries(
    clientes.reduce((acc, c) => {
      acc[c.tipo_servicio] = (acc[c.tipo_servicio] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const datosDeudas = [
    { name: 'Sin deuda', value: clientes.filter(c => c.meses_deuda === 0).length, color: '#10b981' },
    { name: '1-3 meses', value: clientes.filter(c => c.meses_deuda >= 1 && c.meses_deuda <= 3).length, color: '#f59e0b' },
    { name: '+3 meses', value: clientes.filter(c => c.meses_deuda > 3).length, color: '#ef4444' }
  ];

  const topDeudores = clientes
    .filter(c => c.meses_deuda > 0)
    .map(c => ({
      ...c,
      deudaTotal: c.precio_mensual * c.meses_deuda
    }))
    .sort((a, b) => b.deudaTotal - a.deudaTotal)
    .slice(0, 5);

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const cardHover = {
    scale: 1.05,
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    transition: { type: 'spring', stiffness: 300 }
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="dashboard-container">
      {/* Partículas de fondo */}
      <div className="particles-bg">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <motion.div
        className="dashboard-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header animado */}
        <motion.div 
          className="dashboard-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="dashboard-title">
            <span className="title-icon">📊</span>
            Dashboard Empresarial
            <motion.span 
              className="title-pulse"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </h1>
          <p className="dashboard-subtitle">Análisis en tiempo real de tu negocio</p>
        </motion.div>

        {/* Métricas principales */}
        <motion.div 
          className="metrics-grid"
          ref={ref}
        >
          <MetricCard
            icon={<Users />}
            title="Total Clientes"
            value={totalClientes}
            color="#6366f1"
            delay={0}
            inView={inView}
          />
          <MetricCard
            icon={<Activity />}
            title="Clientes Activos"
            value={clientesActivos}
            color="#10b981"
            delay={0.1}
            inView={inView}
          />
          <MetricCard
            icon={<AlertTriangle />}
            title="Deudores"
            value={clientesDeudores}
            color="#f59e0b"
            delay={0.2}
            inView={inView}
          />
          <MetricCard
            icon={<DollarSign />}
            title="Ingreso Mensual"
            value={ingresoMensual}
            prefix="S/ "
            decimals={2}
            color="#8b5cf6"
            delay={0.3}
            inView={inView}
          />
          <MetricCard
            icon={<TrendingUp />}
            title="Ingreso Potencial"
            value={ingresoPotencial}
            prefix="S/ "
            decimals={2}
            color="#06b6d4"
            delay={0.4}
            inView={inView}
          />
          <MetricCard
            icon={<Target />}
            title="Tasa Cobranza"
            value={tasaCobranza}
            suffix="%"
            decimals={1}
            color="#ec4899"
            delay={0.5}
            inView={inView}
          />
          <MetricCard
            icon={<Wallet />}
            title="En Riesgo"
            value={montoEnRiesgo}
            prefix="S/ "
            decimals={2}
            color="#ef4444"
            delay={0.6}
            inView={inView}
          />
        </motion.div>

        {/* Gráficos */}
        <motion.div 
          className="charts-grid"
          variants={containerVariants}
        >
          <motion.div 
            className="chart-card"
            variants={itemVariants}
            whileHover={cardHover}
          >
            <h3 className="chart-title">
              <span className="chart-icon">🎯</span>
              Estados de Clientes
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosEstados}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {datosEstados.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div 
            className="chart-card"
            variants={itemVariants}
            whileHover={cardHover}
          >
            <h3 className="chart-title">
              <span className="chart-icon">📺</span>
              Distribución de Servicios
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosServicios}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="url(#colorGradient)"
                  animationBegin={200}
                  animationDuration={1000}
                  radius={[10, 10, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div 
            className="chart-card"
            variants={itemVariants}
            whileHover={cardHover}
          >
            <h3 className="chart-title">
              <span className="chart-icon">💸</span>
              Análisis de Deudas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosDeudas} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis type="number" stroke="#fff" />
                <YAxis dataKey="name" type="category" stroke="#fff" />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  animationBegin={400}
                  animationDuration={1000}
                  radius={[0, 10, 10, 0]}
                >
                  {datosDeudas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>

        {/* Top Deudores */}
        <motion.div 
          className="top-deudores"
          variants={itemVariants}
          whileHover={cardHover}
        >
          <h3 className="section-title">
            <Award className="section-icon" />
            Top 5 Deudores
          </h3>
          <div className="deudores-list">
            {topDeudores.map((cliente, index) => (
              <motion.div
                key={cliente.id}
                className="deudor-item"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ x: 10, scale: 1.02 }}
              >
                <div className="deudor-rank">
                  <span className="rank-number">{index + 1}</span>
                </div>
                <div className="deudor-info">
                  <span className="deudor-nombre">
                    {cliente.nombre} {cliente.apellido}
                  </span>
                  <span className="deudor-meses">{cliente.meses_deuda} meses</span>
                </div>
                <motion.div 
                  className="deudor-monto"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  S/ {cliente.deudaTotal.toFixed(2)}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Componente de métrica animada
const MetricCard = ({ icon, title, value, prefix = '', suffix = '', decimals = 0, color, delay, inView }) => (
  <motion.div
    className="metric-card"
    variants={{
      hidden: { scale: 0.8, opacity: 0 },
      visible: { scale: 1, opacity: 1 }
    }}
    transition={{ delay, type: 'spring' }}
    whileHover={{
      scale: 1.05,
      boxShadow: `0 20px 40px ${color}40`,
      borderColor: color
    }}
    style={{ borderLeftColor: color }}
  >
    <motion.div 
      className="metric-icon"
      style={{ background: `${color}20`, color }}
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay }}
    >
      {icon}
    </motion.div>
    <div className="metric-content">
      <span className="metric-title">{title}</span>
      <motion.span 
        className="metric-value"
        style={{ color }}
      >
        {inView && (
          <CountUp
            start={0}
            end={value}
            duration={2}
            decimals={decimals}
            prefix={prefix}
            suffix={suffix}
          />
        )}
      </motion.span>
    </div>
    <motion.div 
      className="metric-pulse"
      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{ background: color }}
    />
  </motion.div>
);

// Tooltip personalizado
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div 
        className="custom-tooltip"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <p className="tooltip-label">{payload[0].name}</p>
        <p className="tooltip-value">{payload[0].value}</p>
      </motion.div>
    );
  }
  return null;
};

// Label personalizado para el pie chart
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Skeleton Loader
const SkeletonLoader = () => (
  <div className="skeleton-container">
    {[...Array(7)].map((_, i) => (
      <motion.div
        key={i}
        className="skeleton-card"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
      />
    ))}
  </div>
);

export default DashboardView;