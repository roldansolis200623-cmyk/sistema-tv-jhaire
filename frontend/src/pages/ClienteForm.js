import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Phone, MapPin, CreditCard, Calendar,
    Wifi, Tv, DollarSign, AlertCircle, Save, X,
    CheckCircle, Info, Sparkles, ArrowLeft, Zap,
    FileText, TrendingDown, Clock  // 👈 AGREGADO Clock aquí
} from 'lucide-react';
import { clienteService } from '../services/api';
import perfilInternetService from '../services/perfilInternetService';
import HistorialCliente from '../components/HistorialCliente';

const ClienteForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [perfiles, setPerfiles] = useState([]);
    const [activeTab, setActiveTab] = useState('personal');
    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        telefono: '',
        email: '',
        direccion: '',
        tipo_servicio: 'Solo Internet',
        tipo_senal: '',
        perfil_internet_id: '',
        plan: '',
        precio_mensual: '',
        fecha_instalacion: new Date().toISOString().split('T')[0],
        estado: 'activo',
        estado_pago: 'deudor',
        meses_deuda: 0
    });

    useEffect(() => {
        cargarPerfiles();
        if (id) {
            loadCliente();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const cargarPerfiles = async () => {
        try {
            const data = await perfilInternetService.getAll();
            setPerfiles(data);
        } catch (error) {
            console.error('Error cargando perfiles:', error);
        }
    };

    const loadCliente = async () => {
        try {
            const data = await clienteService.getById(id);
            setFormData({
                ...data,
                fecha_instalacion: data.fecha_instalacion?.split('T')[0] || '',
                tipo_senal: data.tipo_senal || '',
                estado_pago: data.estado_pago || 'deudor',
                meses_deuda: data.meses_deuda || 0,
                perfil_internet_id: data.perfil_internet_id || ''
            });
        } catch (error) {
            setError('Error cargando cliente');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'tipo_servicio') {
            const nuevoFormData = {
                ...formData,
                tipo_servicio: value
            };

            if (value === 'Solo Internet') {
                nuevoFormData.tipo_senal = '';
            }

            if (value === 'Solo Cable') {
                nuevoFormData.perfil_internet_id = '';
                nuevoFormData.plan = '';
            }

            setFormData(nuevoFormData);
            return;
        }

        if (name === 'perfil_internet_id' && value) {
            const perfilSeleccionado = perfiles.find(p => p.id === parseInt(value));
            if (perfilSeleccionado) {
                setFormData({
                    ...formData,
                    perfil_internet_id: value,
                    plan: `${perfilSeleccionado.nombre} - ${perfilSeleccionado.velocidad} Mbps`,
                    precio_mensual: perfilSeleccionado.precio_regular
                });
                return;
            }
        }

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (id) {
                await clienteService.update(id, formData);
            } else {
                await clienteService.create(formData);
            }
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Error guardando cliente');
        } finally {
            setLoading(false);
        }
    };

    const tieneInternet = formData.tipo_servicio === 'Solo Internet' || formData.tipo_servicio === 'Dúo';
    const tieneCable = formData.tipo_servicio === 'Solo Cable' || formData.tipo_servicio === 'Dúo';

    const tabs = [
        { id: 'personal', label: 'Información Personal', icon: <User size={18} /> },
        { id: 'servicio', label: 'Servicio', icon: <Wifi size={18} /> },
        { id: 'financiero', label: 'Estado Financiero', icon: <DollarSign size={18} /> }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4 relative overflow-hidden">
            {/* Partículas de fondo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full opacity-20"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Volver al Dashboard
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
                        >
                            <Sparkles className="text-white" size={24} />
                        </motion.div>
                        <div>
                            <h1 className="text-4xl font-bold text-white">
                                {id ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h1>
                            <p className="text-white/60 text-sm">
                                Complete toda la información del cliente
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Notificaciones */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 bg-red-500/20 backdrop-blur-xl border border-red-500/50 text-white px-6 py-4 rounded-2xl flex items-center gap-3"
                        >
                            <AlertCircle size={24} />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 bg-green-500/20 backdrop-blur-xl border border-green-500/50 text-white px-6 py-4 rounded-2xl flex items-center gap-3"
                        >
                            <CheckCircle size={24} />
                            <span>Cliente guardado exitosamente</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Formulario con Tabs */}
                <motion.form
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onSubmit={handleSubmit}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Tabs Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                        <div className="flex gap-2">
                            {tabs.map((tab) => (
                                <motion.button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-white text-purple-900 shadow-lg'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Tabs Content */}
                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            {activeTab === 'personal' && (
                                <motion.div
                                    key="personal"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} icon={<User size={18} />} required />
                                        <InputField label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} icon={<User size={18} />} required />
                                        <InputField label="DNI" name="dni" value={formData.dni} onChange={handleChange} icon={<CreditCard size={18} />} maxLength="8" placeholder="8 dígitos" required />
                                        <InputField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} icon={<Phone size={18} />} placeholder="9 dígitos" />
                                        <div className="md:col-span-2">
                                            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} icon={<Mail size={18} />} placeholder="ejemplo@correo.com" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <InputField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} icon={<MapPin size={18} />} placeholder="Calle, número, urbanización, distrito" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'servicio' && (
                                <motion.div
                                    key="servicio"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <SelectField label="Tipo de Servicio" name="tipo_servicio" value={formData.tipo_servicio} onChange={handleChange} icon={<Tv size={18} />} required>
                                                <option value="Solo Internet">Solo Internet</option>
                                                <option value="Solo Cable">Solo Cable</option>
                                                <option value="Dúo">Dúo (Internet + Cable)</option>
                                            </SelectField>
                                        </div>

                                        {tieneInternet && (
                                            <>
                                                <div className="md:col-span-2">
                                                    <SelectField label="Perfil de Internet" name="perfil_internet_id" value={formData.perfil_internet_id} onChange={handleChange} icon={<Zap size={18} />}>
                                                        <option value="">Seleccionar perfil...</option>
                                                        {perfiles.map(perfil => (
                                                            <option key={perfil.id} value={perfil.id}>
                                                                {perfil.nombre} - {perfil.velocidad} Mbps (S/ {perfil.precio_regular})
                                                            </option>
                                                        ))}
                                                    </SelectField>
                                                    <p className="text-xs text-white/60 mt-2 flex items-center gap-2">
                                                        <Info size={14} />
                                                        Al seleccionar un perfil, se auto-rellenan plan y precio
                                                    </p>
                                                </div>

                                                <InputField label="Plan de Internet" name="plan" value={formData.plan} onChange={handleChange} icon={<FileText size={18} />} placeholder="Descripción del plan" />
                                            </>
                                        )}

                                        {tieneCable && (
                                            <SelectField label="Tipo de Señal TV" name="tipo_senal" value={formData.tipo_senal} onChange={handleChange} icon={<Wifi size={18} />} required>
                                                <option value="">Seleccione...</option>
                                                <option value="Analógica">Analógica</option>
                                                <option value="Digital">Digital</option>
                                                <option value="Mixta">Mixta (Analógica + Digital)</option>
                                            </SelectField>
                                        )}

                                        <InputField label="Precio Mensual (S/)" name="precio_mensual" type="number" step="0.01" value={formData.precio_mensual} onChange={handleChange} icon={<DollarSign size={18} />} placeholder="0.00" required />

                                        <InputField label="Fecha de Instalación" name="fecha_instalacion" type="date" value={formData.fecha_instalacion} onChange={handleChange} icon={<Calendar size={18} />} />

                                        <SelectField label="Estado del Servicio" name="estado" value={formData.estado} onChange={handleChange} icon={<CheckCircle size={18} />}>
                                            <option value="activo">Activo</option>
                                            <option value="suspendido">Suspendido</option>
                                            <option value="cancelado">Cancelado</option>
                                        </SelectField>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'financiero' && (
                                <motion.div
                                    key="financiero"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {!id && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6 flex items-start gap-3"
                                        >
                                            <Info size={20} className="text-yellow-300 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-white/90">
                                                <strong>Nota:</strong> Estos campos son para registrar el estado actual del cliente al momento de migrar. Si el cliente ya tiene deuda, indíquelo aquí.
                                            </p>
                                        </motion.div>
                                    )}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectField label="Estado de Pago" name="estado_pago" value={formData.estado_pago} onChange={handleChange} icon={<DollarSign size={18} />}>
                                            <option value="pagado">Pagado (al día)</option>
                                            <option value="deudor">Deudor (1-2 meses)</option>
                                            <option value="moroso">Moroso (3+ meses)</option>
                                        </SelectField>

                                        <div>
                                            <InputField label="Meses de Deuda" name="meses_deuda" type="number" value={formData.meses_deuda} onChange={handleChange} icon={<TrendingDown size={18} />} min="0" max="24" placeholder="0" />
                                            <p className="text-xs text-white/60 mt-2">
                                                Número de meses que debe al momento de registrar
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Botones */}
                    <div className="px-8 pb-8 flex gap-4">
                        {/* Botón de Historial - Solo en modo edición */}
                        {id && (
                            <motion.button
                                type="button"
                                onClick={() => setMostrarHistorial(true)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                            >
                                <Clock size={20} />
                                Ver Historial
                            </motion.button>
                        )}

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-2xl transition-all"
                        >
                            {loading ? (
                                <>
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    {id ? 'Actualizar Cliente' : 'Crear Cliente'}
                                </>
                            )}
                        </motion.button>
                        
                        <motion.button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                        >
                            <X size={20} />
                            Cancelar
                        </motion.button>
                    </div>
                </motion.form>

                {/* Modal de Historial - AQUÍ VA, FUERA DEL FORM */}
                <AnimatePresence>
                    {mostrarHistorial && (
                        <HistorialCliente 
                            clienteId={id}
                            isOpen={mostrarHistorial}
                            onClose={() => setMostrarHistorial(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const InputField = ({ label, icon, ...props }) => (
    <motion.div whileHover={{ scale: 1.01 }} className="group">
        <label className="block text-white/90 text-sm font-semibold mb-2 flex items-center gap-2">
            {icon}
            {label} {props.required && <span className="text-red-400">*</span>}
        </label>
        <input {...props} className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all group-hover:bg-white/15" />
    </motion.div>
);

const SelectField = ({ label, icon, children, ...props }) => (
    <motion.div whileHover={{ scale: 1.01 }} className="group">
        <label className="block text-white/90 text-sm font-semibold mb-2 flex items-center gap-2">
            {icon}
            {label} {props.required && <span className="text-red-400">*</span>}
        </label>
        <select {...props} className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all group-hover:bg-white/15 appearance-none cursor-pointer">
            {children}
        </select>
    </motion.div>
);

export default ClienteForm;