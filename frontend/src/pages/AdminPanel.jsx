import React, { useState, useEffect } from 'react';
import { 
  BarChart3, ListTodo, Bell, Users, DollarSign, 
  TrendingUp, Settings, LogOut, Menu, X, ChevronRight,
  Calendar, FileText, AlertTriangle, PieChart, ArrowRight,
  CheckCircle2, Clock, AlertCircle, Zap, Target, Award,
  Eye, Download, Share2, MoreVertical, Plus, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel_PREMIUM.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModule, setSelectedModule] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [stats, setStats] = useState({
    tareasTotal: 24,
    tareasUrgentes: 5,
    notificacionesNoLeidas: 12,
    clientesEnRiesgo: 8,
    ingresosMes: 45320,
    tazaCobranza: 87.5
  });

  // Estadísticas en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        ...prev,
        tareasTotal: Math.max(prev.tareasTotal + (Math.random() > 0.5 ? 1 : 0) - (Math.random() > 0.5 ? 1 : 0)),
        notificacionesNoLeidas: Math.max(0, prev.notificacionesNoLeidas + (Math.random() > 0.7 ? 1 : 0))
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const modules = [
    {
      id: 'overview',
      title: 'Dashboard',
      icon: BarChart3,
      color: '#0A84FF',
      description: 'Vista general del negocio',
      stats: 'Última actualización: hace 2 min'
    },
    {
      id: 'tareas',
      title: 'Mis Tareas',
      icon: ListTodo,
      color: '#34C759',
      description: 'Gestión de tareas diarias',
      stats: `${stats.tareasTotal} tareas | ${stats.tareasUrgentes} urgentes`,
      action: () => navigate('/tareas')
    },
    {
      id: 'notificaciones',
      title: 'Notificaciones IA',
      icon: Bell,
      color: '#FF9500',
      description: 'Alertas inteligentes en tiempo real',
      stats: `${stats.notificacionesNoLeidas} no leídas`,
      action: () => navigate('/notificaciones-inteligentes')
    },
    {
      id: 'ejecutivo',
      title: 'Dashboard Ejecutivo',
      icon: TrendingUp,
      color: '#5856D6',
      description: 'Análisis financiero y recomendaciones',
      stats: 'Riesgo crediticio: bajo',
      action: () => navigate('/dashboard-executive')
    },
    {
      id: 'clientes',
      title: 'Clientes',
      icon: Users,
      color: '#FF3B30',
      description: 'Gestión de cartera de clientes',
      stats: `${stats.clientesEnRiesgo} en riesgo`,
      action: () => navigate('/clientes')
    },
    {
      id: 'pagos',
      title: 'Pagos',
      icon: DollarSign,
      color: '#34C759',
      description: 'Control de ingresos y cobranza',
      stats: `$${stats.ingresosMes.toLocaleString()}`,
      action: () => navigate('/pagos')
    }
  ];

  const quickStats = [
    {
      label: 'Tareas Hoy',
      value: stats.tareasUrgentes,
      icon: ListTodo,
      color: 'blue',
      trend: '+2 vs ayer',
      status: 'up'
    },
    {
      label: 'Sin Leer',
      value: stats.notificacionesNoLeidas,
      icon: Bell,
      color: 'orange',
      trend: '+1 nueva',
      status: 'up'
    },
    {
      label: 'En Riesgo',
      value: stats.clientesEnRiesgo,
      icon: AlertTriangle,
      color: 'red',
      trend: '-1 vs semana',
      status: 'down'
    },
    {
      label: 'Tasa Cobranza',
      value: `${stats.tazaCobranza}%`,
      icon: TrendingUp,
      color: 'green',
      trend: '+5.2%',
      status: 'up'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'tarea', title: 'Contactar cliente Juan Pérez', time: 'hace 5 min', status: 'urgente' },
    { id: 2, type: 'pago', title: 'Pago recibido de María García - $450', time: 'hace 12 min', status: 'exitoso' },
    { id: 3, type: 'notificacion', title: 'Alerta: Cliente en riesgo crítico', time: 'hace 30 min', status: 'critica' },
    { id: 4, type: 'sistema', title: 'Reporte diario generado', time: 'hace 1h', status: 'normal' },
    { id: 5, type: 'tarea', title: 'Preparar reporte mensual', time: 'hace 2h', status: 'en_progreso' }
  ];

  const handleNavigate = (module) => {
    if (module.action) {
      module.action();
    }
    setSelectedModule(module.id);
  };

  return (
    <div className="admin-panel-premium">
      {/* Sidebar */}
      <div className={`sidebar-premium ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">
              <BarChart3 size={28} />
            </div>
            {sidebarOpen && (
              <div className="logo-text">
                <h2>Admin Panel</h2>
                <p>Sistema Profesional</p>
              </div>
            )}
          </div>
          <button 
            className="toggle-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navegación Principal */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            {sidebarOpen && <h3 className="nav-title">Módulos Principales</h3>}
            <div className="nav-items">
              {modules.map(module => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    className={`nav-item ${selectedModule === module.id ? 'active' : ''}`}
                    onClick={() => handleNavigate(module)}
                    title={module.title}
                    style={selectedModule === module.id ? { borderLeftColor: module.color } : {}}
                  >
                    <div className="nav-icon" style={{ color: module.color }}>
                      <Icon size={20} />
                    </div>
                    {sidebarOpen && (
                      <div className="nav-content">
                        <span className="nav-label">{module.title}</span>
                        <span className="nav-desc">{module.description}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sección Secundaria */}
          {sidebarOpen && (
            <div className="nav-section secondary">
              <h3 className="nav-title">Más Opciones</h3>
              <div className="nav-items">
                <button className="nav-item">
                  <Settings size={20} />
                  <div className="nav-content">
                    <span className="nav-label">Configuración</span>
                  </div>
                </button>
                <button className="nav-item logout">
                  <LogOut size={20} />
                  <div className="nav-content">
                    <span className="nav-label">Cerrar Sesión</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* User Profile en Sidebar */}
        {sidebarOpen && (
          <div className="sidebar-profile">
            <div className="profile-avatar">
              <span>JG</span>
            </div>
            <div className="profile-info">
              <h4>Jeny García</h4>
              <p>Secretaria Ejecutiva</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content-premium">
        {/* Top Header */}
        <div className="top-header-premium">
          <div className="header-left">
            <h1>Panel de Administración</h1>
            <p>Gestión integrada de tareas, notificaciones y análisis ejecutivo</p>
          </div>
          <div className="header-right">
            <button className="btn-icon-header">
              <Search size={20} />
            </button>
            <button 
              className="btn-icon-header notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {stats.notificacionesNoLeidas > 0 && (
                <span className="notification-badge">{stats.notificacionesNoLeidas}</span>
              )}
            </button>
            <button 
              className="btn-icon-header profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="avatar-small">JG</div>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats-grid">
          {quickStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={`quick-stat-card ${stat.color}`}>
                <div className="stat-icon">
                  <Icon size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-value">{stat.value}</span>
                  <span className={`stat-trend ${stat.status}`}>{stat.trend}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Módulos Grid */}
        <div className="modules-section">
          <div className="section-header">
            <h2>Acceso Rápido a Módulos</h2>
            <p>Navega a los sistemas principales desde aquí</p>
          </div>

          <div className="modules-grid-premium">
            {modules.map(module => {
              const Icon = module.icon;
              return (
                <div 
                  key={module.id}
                  className={`module-card-premium ${selectedModule === module.id ? 'active' : ''}`}
                  onClick={() => handleNavigate(module)}
                  style={{
                    borderTopColor: module.color,
                    background: `linear-gradient(135deg, rgba(${parseInt(module.color.slice(1,3),16)},${parseInt(module.color.slice(3,5),16)},${parseInt(module.color.slice(5,7),16)}, 0.05), rgba(255,255,255, 0.02))`
                  }}
                >
                  <div className="module-header-card">
                    <div className="module-icon-large" style={{ color: module.color }}>
                      <Icon size={32} />
                    </div>
                    <button className="btn-more">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  <div className="module-body-card">
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                  </div>
                  <div className="module-footer-card">
                    <span className="module-stat">{module.stats}</span>
                    <ArrowRight size={18} className="arrow-icon" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="activity-section">
          <div className="section-header">
            <h2>Actividad Reciente</h2>
            <button className="btn-view-all">Ver todo →</button>
          </div>

          <div className="activity-timeline">
            {recentActivities.map((activity, idx) => {
              let IconComponent;
              let statusClass = activity.status;

              switch(activity.type) {
                case 'tarea':
                  IconComponent = CheckCircle2;
                  break;
                case 'pago':
                  IconComponent = DollarSign;
                  break;
                case 'notificacion':
                  IconComponent = AlertTriangle;
                  break;
                default:
                  IconComponent = Zap;
              }

              return (
                <div key={idx} className={`activity-item ${statusClass}`}>
                  <div className="activity-marker">
                    <IconComponent size={16} />
                  </div>
                  <div className="activity-line"></div>
                  <div className="activity-content">
                    <p className="activity-title">{activity.title}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="bottom-stats-premium">
          <div className="stat-box">
            <div className="stat-box-header">
              <Target size={24} />
              <h3>Objetivos del Mes</h3>
            </div>
            <div className="stat-box-body">
              <div className="progress-item">
                <span>Cobranza</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '87%' }}></div>
                </div>
                <span className="progress-value">87%</span>
              </div>
              <div className="progress-item">
                <span>Tareas Completadas</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
                <span className="progress-value">65%</span>
              </div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-box-header">
              <Award size={24} />
              <h3>Performance</h3>
            </div>
            <div className="stat-box-body">
              <div className="performance-badges">
                <div className="badge">⭐ Excelente Desempeño</div>
                <div className="badge">🎯 Metas Alcanzadas</div>
                <div className="badge">🚀 Ritmo Acelerado</div>
              </div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-box-header">
              <Eye size={24} />
              <h3>Últimas Transacciones</h3>
            </div>
            <div className="stat-box-body">
              <p>Total de pagos procesados este mes: <strong>$45,320</strong></p>
              <p>Clientes activos: <strong>127</strong></p>
              <p>Tasa de retención: <strong>92.3%</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="dropdown-header">
            <h3>Notificaciones</h3>
            <button className="btn-close" onClick={() => setShowNotifications(false)}>×</button>
          </div>
          <div className="notifications-list">
            {[1,2,3,4].map(i => (
              <div key={i} className="notification-item">
                <div className="notification-icon">🔔</div>
                <div className="notification-text">
                  <p>Notificación importante #{i}</p>
                  <span>Hace 5 minutos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente auxiliar para Search
const Search = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

export default AdminPanel;