import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Wifi, Radio, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [credentials, setCredentials] = useState({ usuario: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(credentials.usuario, credentials.password);
            navigate('/dashboard');
        } catch (err) {
            setError('Usuario o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Lado izquierdo - Video de fondo */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
                {/* Video de fondo */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                >
                    <source src="/video-telecomunicaciones.mp4" type="video/mp4" />
                    {/* Si no tienes video, comenta estas líneas y usa la imagen de respaldo */}
                </video>
                
                {/* Imagen de respaldo si no hay video */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ 
                        backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200')"
                    }}
                />

                {/* Overlay oscuro */}
                <div className="absolute inset-0 bg-black/40" />
                
                {/* Partículas flotantes */}
                <div className="absolute inset-0">
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-white rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                opacity: Math.random() * 0.5
                            }}
                            animate={{
                                y: [0, -50, 0],
                                x: [0, Math.random() * 30 - 15, 0],
                                scale: [1, 1.5, 1],
                                opacity: [0.2, 0.6, 0.2]
                            }}
                            transition={{
                                duration: 4 + Math.random() * 3,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                        />
                    ))}
                </div>

                {/* Contenido */}
                <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        {/* LOGO DE LA EMPRESA */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 1 }}
                            className="mb-8"
                        >
                            <img 
                                src="/logo.png" 
                                alt="Logo Empresa" 
                                className="w-48 h-48 mx-auto object-contain drop-shadow-2xl"
                            />
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-5xl font-bold mb-4 drop-shadow-lg"
                        >
                            Sistema de Gestión
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-2xl mb-8 text-white/90"
                        >
                            TV / Internet
                        </motion.p>
                        
                        <div className="flex gap-6 justify-center mb-8">
                            {[
                                { icon: Radio, label: 'Cable TV' },
                                { icon: Wifi, label: 'Internet' },
                                { icon: Smartphone, label: 'Móvil' }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.9 + index * 0.2 }}
                                    whileHover={{ scale: 1.1 }}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/20 transition-all">
                                        <item.icon size={32} />
                                    </div>
                                    <p className="text-sm text-white/80 font-semibold">{item.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="text-white/70 text-lg"
                        >
                            Gestión completa de clientes, pagos y servicios
                        </motion.p>
                    </motion.div>
                </div>

                {/* Decoración inferior */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
            </div>

            {/* Lado derecho - Formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
                        {/* Logo pequeño en formulario */}
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="w-20 h-20 mx-auto mb-8"
                        >
                            <img 
                                src="/logo.png" 
                                alt="Logo" 
                                className="w-full h-full object-contain"
                            />
                        </motion.div>

                        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
                            Iniciar Sesión
                        </h2>
                        <p className="text-center text-gray-500 mb-8">
                            Accede a tu panel de administración
                        </p>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Usuario
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={credentials.usuario}
                                        onChange={(e) => setCredentials({ ...credentials, usuario: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                                        placeholder="Ingrese su usuario"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="password"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                                        placeholder="Ingrese su contraseña"
                                        required
                                    />
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                        />
                                        Iniciando...
                                    </span>
                                ) : (
                                    'Iniciar Sesión'
                                )}
                            </motion.button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-center text-sm text-gray-500">
                                Usuario por defecto: <span className="font-semibold text-gray-700">admin</span>
                            </p>
                            <p className="text-center text-sm text-gray-500">
                                Contraseña: <span className="font-semibold text-gray-700">admin123</span>
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-gray-400 text-sm mt-6">
                        © 2025 Sistema de Gestión TV/Internet
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;