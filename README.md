# Previate - Hackathon Project

Proyecto full-stack que incluye una API backend y una aplicación web frontend.

## 📁 Estructura del Proyecto

```
hackaton/
├── api/          # Backend API (Node.js + Express)
└── web/          # Frontend Web (React + Vite)
```

## 🚀 Instalación y Configuración

### Backend (API)

```bash
cd api
npm install
```

Crea un archivo `.env` en la carpeta `api/` con las siguientes variables:

```env
DB_USER=tu_usuario_db
DB_PASS=tu_contraseña_db
# Agrega otras variables de entorno necesarias
```

Para ejecutar en desarrollo:
```bash
npm run dev
```

Para ejecutar en producción:
```bash
npm start
```

### Frontend (Web)

```bash
cd web
npm install
```

Para ejecutar en desarrollo:
```bash
npm run dev
```

Para construir para producción:
```bash
npm run build
```

## 🛠️ Tecnologías

### Backend
- Node.js
- Express
- MySQL2
- Socket.io
- JWT (jsonwebtoken)
- Bcrypt
- Nodemailer
- Multer
- Sharp

### Frontend
- React
- Vite
- React Router
- Axios
- Framer Motion
- Sass
- React Query

## 📝 Notas

- Asegúrate de tener MySQL configurado y corriendo antes de iniciar la API
- El frontend se conecta a la API mediante axios (configurado en `web/src/config/axios.js`)

## 📄 Licencia

Ver archivo LICENSE en la carpeta `api/`

