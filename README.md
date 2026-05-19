# 📺 Sistema de Gestión TV Jhaire

> CRM web en producción para la gestión integral de clientes de televisión por cable e internet.

🔗 **Demo en vivo:** [sistema-tv-jhaire.vercel.app](https://sistema-tv-jhaire.vercel.app)

---

## 🚀 ¿Qué es este proyecto?

TV Jhaire es un sistema CRM completo desarrollado para una empresa real de telecomunicaciones, reemplazando procesos manuales por una plataforma web moderna. Gestiona más de **700 clientes activos** con funcionalidades de cobro, reportes, notificaciones y analítica de negocio.

---

## ✨ Funcionalidades principales

- 📋 **Gestión de clientes** — CRUD completo con historial de servicios y pagos
- 💰 **Módulo de pagos** — Lógica de deudas multi-mes, pagos adelantados y saldo negativo
- 📊 **Dashboard de analítica** — Métricas en tiempo real con Chart.js
- 📱 **WhatsApp automático** — Recordatorios de cobro vía Twilio API
- 📄 **Reportes** — Exportación a Excel y PDF
- 🔐 **Autenticación JWT** — Sistema de roles y permisos por usuario
- 🛡️ **Seguridad** — Protección contra SQL injection, rate limiting, CORS y auditoría de dependencias
- ⏰ **CRON Jobs** — Automatización de tareas programadas

---

## 🛠️ Tech Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React, CSS3, Chart.js |
| Backend | Node.js, Express |
| Base de Datos | PostgreSQL |
| Autenticación | JWT |
| Notificaciones | Twilio (WhatsApp API) |
| Deploy Backend | Railway |
| Deploy Frontend | Vercel |
| Control de versiones | Git / GitHub |

---

## 📁 Estructura del proyecto

```
sistema-tv-jhaire/
├── backend/
│   ├── src/
│   │   ├── config/        # Configuración DB y entorno
│   │   ├── controllers/   # Lógica de negocio
│   │   ├── routes/        # Endpoints de la API
│   │   └── middleware/    # Auth, rate limiting, seguridad
│   └── railway.toml
└── Interfaz/              # Frontend React
```

---

## ⚙️ Variables de entorno

Crea un archivo `.env` en `/backend` con:

```env
DB_HOST=tu_host
DB_PORT=5432
DB_NAME=tv_jhaire
DB_USER=tu_usuario
DB_PASSWORD=tu_password
JWT_SECRET=tu_secreto
TWILIO_SID=tu_sid
TWILIO_TOKEN=tu_token
TWILIO_WHATSAPP=whatsapp:+14155238886
```

---

## 🏃 Cómo correr el proyecto localmente

```bash
# Clonar el repo
git clone https://github.com/roldansolis200623-cmyk/sistema-tv-jhaire.git

# Backend
cd backend
npm install
npm start

# Frontend (en otra terminal)
cd Interfaz
npm install
npm run dev
```

---

## 👨‍💻 Autor

**Juan Gabriel Roldán Solís**  
Desarrollador Full Stack | Ingeniería de Sistemas — CIBERTEC  
📧 roldansolis200623@gmail.com  
🌐 [sistema-tv-jhaire.vercel.app](https://sistema-tv-jhaire.vercel.app)
