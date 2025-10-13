import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Reportes from './pages/Reportes';
import EstadisticasView from './pages/EstadisticasView';
import ClienteForm from './pages/ClienteForm';
import Pagos from './pages/Pagos';
import HistorialPagos from './pages/HistorialPagos';
import PerfilesInternet from './pages/PerfilesInternet';

// 🆕 IMPORTAR COMPONENTES NUEVOS
import CalendarioCobros from './components/Calendario/CalendarioCobros';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Login />} />
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
                        {/* 🆕 RUTA DEL CALENDARIO */}
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