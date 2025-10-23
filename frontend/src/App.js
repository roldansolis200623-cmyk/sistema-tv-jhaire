import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Landing from './pages/Landing';
import ClientPortal from './pages/ClientPortal';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Reportes from './pages/Reportes';
import EstadisticasView from './pages/EstadisticasView';
import ClienteForm from './pages/ClienteForm';
import Pagos from './pages/Pagos';
import HistorialPagos from './pages/HistorialPagos';
import PerfilesInternet from './pages/PerfilesInternet';
import Incidencias from './pages/Incidencias';
import CalendarioCobros from './components/Calendario/CalendarioCobros';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    // 🎨 Inicializar AOS para animaciones
    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }, []);

    return (
        <ThemeProvider>
            <Router>
                <AuthProvider>
                    <Routes>
                        {/* 🆕 RUTAS PÚBLICAS */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/cliente/consulta" element={<ClientPortal />} />
                        
                        {/* RUTA DE LOGIN */}
                        <Route path="/login" element={<Login />} />
                        
                        {/* RUTAS PROTEGIDAS (ADMIN) */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/clientes"
                            element={
                                <ProtectedRoute>
                                    <Clientes />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/reportes"
                            element={
                                <ProtectedRoute>
                                    <Reportes />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/estadisticas"
                            element={
                                <ProtectedRoute>
                                    <EstadisticasView />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/incidencias"
                            element={
                                <ProtectedRoute>
                                    <Incidencias />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/calendario"
                            element={
                                <ProtectedRoute>
                                    <CalendarioCobros />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/clientes/nuevo"
                            element={
                                <ProtectedRoute>
                                    <ClienteForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/clientes/editar/:id"
                            element={
                                <ProtectedRoute>
                                    <ClienteForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/pagos"
                            element={
                                <ProtectedRoute>
                                    <Pagos />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/historial-pagos/:clienteId"
                            element={
                                <ProtectedRoute>
                                    <HistorialPagos />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/perfiles-internet"
                            element={
                                <ProtectedRoute>
                                    <PerfilesInternet />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;