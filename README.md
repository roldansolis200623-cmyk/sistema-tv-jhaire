# 📺 Sistema de Gestión TV Jhaire

> Plataforma CRM full stack en producción para la gestión integral de empresas de telecomunicaciones (ISP / Cable TV).

🔗 **Demo en vivo:** [sistema-tv-jhaire.vercel.app](https://sistema-tv-jhaire.vercel.app)  
🌐 **Sitio web:** [tvjhair.com](https://tvjhair.com)

---

## 📌 ¿Qué es este proyecto?

TV Jhaire es un sistema de gestión empresarial completo, desarrollado para una empresa real de telecomunicaciones en Tayabamba, Perú. Reemplazó procesos manuales en papel por una plataforma web moderna que gestiona **más de 700 clientes activos**, con módulos de cobro, reportes automatizados, notificaciones por WhatsApp, portal para clientes, gestión de incidencias y analítica ejecutiva en tiempo real.

---

## 🖥️ Módulos del sistema

| Módulo | Descripción |
|--------|-------------|
| 📊 **Dashboard Ejecutivo** | KPIs en tiempo real: ingresos, morosidad, clientes activos/suspendidos |
| 👥 **Gestión de Clientes** | CRUD completo con historial, suspensión/reactivación y perfiles de internet |
| 💰 **Módulo de Pagos** | Registro de pagos, lógica de deudas multi-mes, pagos adelantados y saldo negativo |
| 📄 **Reportes** | Exportación a Excel y PDF con tablas, gráficos y resúmenes ejecutivos |
| 📱 **WhatsApp Automático** | Envío de recordatorios, recibos y avisos vía Twilio API |
| 🔔 **Notificaciones Inteligentes** | Alertas automáticas basadas en estado de cuenta y comportamiento del cliente |
| 🌐 **Portal del Cliente** | Vista pública donde el cliente consulta su estado de cuenta y pagos |
| 📋 **Incidencias** | Registro y seguimiento de fallas técnicas reportadas |
| ✅ **Tareas** | Sistema interno de gestión de tareas para el equipo |
| 📡 **Perfiles de Internet** | Gestión de planes y velocidades por cliente |
| 🗓️ **Calendario de Cobros** | Vista mensual de vencimientos y clientes por cobrar |
| ⚙️ **CRON Jobs** | Automatización programada: cálculo de deudas, envío de recordatorios, logs |
| 🔐 **Autenticación** | JWT con roles y permisos, encriptación bcrypt |

---

## ✨ Características técnicas destacadas

- **Seguridad de producción:** Helmet.js, rate limiting, CORS configurado, protección contra SQL injection, HSTS
- **Compresión GZIP** en todas las respuestas del servidor
- **Generación de QR** para recibos de pago
- **Impresión de recibos** directamente desde el navegador
- **Notificaciones por email** vía Nodemailer (SMTP)
- **Animaciones** con Framer Motion y AOS
- **Gráficos interactivos** con Chart.js y Recharts
- **Exportación a Excel** con ExcelJS y xlsx
- **Portal público** para clientes sin necesidad de login
- **Modo oscuro/claro** persistente
- **Responsive** para móvil y escritorio
- **Logs de CRON** registrados en base de datos para auditoría

---

## 🛠️ Tech Stack

### Backend
| Tecnología | Uso |
|-----------|-----|
| Node.js + Express | Servidor y API REST |
| PostgreSQL + pg | Base de datos relacional |
| JWT + bcryptjs | Autenticación y seguridad |
| Twilio | WhatsApp API |
| node-cron | Automatización programada |
| ExcelJS + PDFKit + jsPDF | Generación de reportes |
| Helmet + express-rate-limit | Seguridad HTTP |
| Nodemailer | Envío de emails |
| QRCode | Generación de códigos QR |
| Railway | Deploy del servidor |

### Frontend
| Tecnología | Uso |
|-----------|-----|
| React | Interfaz de usuario |
| React Router DOM | Navegación SPA |
| Axios | Consumo de API REST |
| Chart.js + Recharts | Gráficos y analítica |
| Framer Motion + AOS | Animaciones |
| jsPDF + html2canvas | Exportación PDF desde cliente |
| xlsx + file-saver | Exportación Excel desde cliente |
| react-to-print | Impresión de recibos |
| qrcode.react | Renderizado de QR |
| Lucide React | Íconos |
| Vercel | Deploy del frontend |

---

## 📁 Estructura del proyecto

```
sistema-tv-jhaire/
├── backend/
│   ├── server.js
│   └── src/
│       ├── app.js                  # Express + seguridad + middlewares
│       ├── config/
│       │   └── database.js         # Conexión PostgreSQL
│       ├── controllers/            # Lógica de negocio
│       │   ├── authController.js
│       │   ├── clienteController.js
│       │   ├── pagoController.js
│       │   ├── dashboardController.js
│       │   ├── reporteController.js
│       │   ├── reporteExcelController.js
│       │   ├── reportePdfController.js
│       │   ├── whatsappController.js
│       │   ├── notificacionController.js
│       │   ├── notificacionInteligenteController.js
│       │   ├── incidenciaController.js
│       │   ├── cronController.js
│       │   └── perfilInternetController.js
│       ├── routes/                 # Endpoints de la API
│       ├── models/                 # Queries a la base de datos
│       ├── services/               # WhatsApp, CRON, PDF, notificaciones
│       └── middlewares/            # Auth, autorización, validación
└── frontend/
    └── src/
        ├── pages/                  # Vistas principales
        │   ├── Dashboard.js
        │   ├── DashboardExecutive.jsx
        │   ├── Clientes.jsx
        │   ├── Pagos.jsx
        │   ├── Reportes.jsx
        │   ├── Incidencias.jsx
        │   ├── Tareas.jsx
        │   ├── NotificacionesInteligentes.jsx
        │   ├── PerfilesInternet.jsx
        │   ├── HistorialPagos.jsx
        │   ├── ClientPortal.jsx    # Portal público para clientes
        │   └── Landing.jsx
        ├── components/             # Componentes reutilizables
        └── services/               # Capa de comunicación con la API
```

---

## ⚙️ Variables de entorno

### Backend — `.env`
```env
# Base de datos
DB_HOST=tu_host
DB_PORT=5432
DB_NAME=tv_jhaire
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# Autenticación
JWT_SECRET=tu_secreto_jwt

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=tu_sid
TWILIO_AUTH_TOKEN=tu_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_password_de_aplicacion

# CORS
ALLOWED_ORIGINS=https://tvjhair.com,https://sistema-tv-jhaire.vercel.app
```

### Frontend — `.env`
```env
REACT_APP_API_URL=https://tu-backend.railway.app
```

---

## 🏃 Cómo correr localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/roldansolis200623-cmyk/sistema-tv-jhaire.git
cd sistema-tv-jhaire

# 2. Backend
cd backend
npm install
cp .env.example .env   # Configurar variables
npm run dev            # Corre en http://localhost:4000

# 3. Frontend (en otra terminal)
cd frontend
npm install
npm start              # Corre en http://localhost:3000
```

---

## 🚀 Deploy

| Servicio | Plataforma |
|---------|-----------|
| Backend (API) | Railway |
| Frontend | Vercel |
| Base de datos | PostgreSQL en Railway |

---

## 👨‍💻 Autor

**Juan Gabriel Roldán Solís**  
Desarrollador Full Stack | Ingeniería de Sistemas — CIBERTEC  
📧 roldansolis200623@gmail.com  
🌐 [tvjhair.com](https://tvjhair.com)  
💻 [github.com/roldansolis200623-cmyk](https://github.com/roldansolis200623-cmyk)
