# FitLife Gym - Aplicación Web Completa

## Descripción

Aplicación web completa para un gimnasio moderno con sistema de membresías, pagos, autenticación segura y panel de administración.

## 🚀 Características

- ✅ Sistema de autenticación con JWT
- ✅ Registro y login de usuarios
- ✅ Perfil de usuario con estadísticas
- ✅ Planes y membresías (mensual, trimestral, anual)
- ✅ Sistema de pagos simulado
- ✅ Sección de comentarios y reseñas
- ✅ Formulario de contacto
- ✅ Panel de administración
- ✅ Diseño responsive
- ✅ Medidas de seguridad (bcrypt, protección contra XSS, SQL Injection)

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el proyecto

```bash
git clone <repositorio>
cd Gym
```

### 2. Instalar dependencias

```bash
npm install
cd frontend && npm install
cd ..
```

**Nota:** El proyecto usa **SQLite** como base de datos. No necesitas instalar MongoDB. La base de datos se creará automáticamente.

## ▶️ Ejecución

### Iniciar el backend

```bash
npm run dev
```

El servidor correra en: http://localhost:5000

La base de datos SQLite se creara automaticamente en `database.sqlite`

### Iniciar el frontend (en otra terminal)

```bash
cd frontend
npm start
```

La aplicación correra en: http://localhost:3000

## 📱 Estructura del Proyecto

```
Gym/
├── backend/              # Servidor Node.js
│   ├── config/
│   │   └── database.js   # Configuración SQLite
│   ├── models/           # Modelos de Sequelize
│   │   ├── User.js
│   │   ├── Plan.js
│   │   ├── Comment.js
│   │   ├── Contact.js
│   │   └── PaymentHistory.js
│   ├── routes/          # Rutas de la API
│   ├── middleware/     # Middleware
│   ├── server.js        # Servidor principal
│   └── .env            # Variables de entorno
│
├── frontend/            # Aplicación React
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── context/    # Contextos de React
│   │   ├── pages/      # Páginas de la app
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── package.json
└── README.md
```

## 🔐 Credenciales de Prueba

### Crear administrador

Puedes hacer que un usuario sea administrador directamente en la base de datos SQLite:

1. Abre el archivo `database.sqlite` con un visor de SQLite (como DB Browser for SQLite)
2. Busca la tabla `users`
3. Cambia el campo `isAdmin` de 0 a 1 para el usuario que desees

O usa el panel de administración directamente si tienes acceso.

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual
- `POST /api/auth/change-password` - Cambiar contraseña

### Usuarios
- `GET /api/users/profile/me` - Perfil
- `PUT /api/users/profile/me` - Actualizar perfil
- `GET /api/users/stats/me` - Estadísticas
- `GET /api/users/payment-history/me` - Historial de pagos

### Planes
- `GET /api/plans` - Lista de planes
- `GET /api/plans/:id` - Detalle de plan

### Pagos
- `POST /api/payments` - Procesar pago
- `GET /api/payments/history` - Historial
- `GET /api/payments/methods` - Métodos de pago

### Comentarios
- `GET /api/comments` - Lista de comentarios
- `POST /api/comments` - Crear comentario

### Contacto
- `POST /api/contact` - Enviar mensaje
- `GET /api/contact/info` - Información de contacto

## 🛡️ Medidas de Seguridad Implementadas

1. **Hash de contraseñas**: bcrypt con 12 rounds
2. **JWT Tokens**: Tokens seguros con expiración
3. **Helmet**: Protección de headers HTTP
4. **CORS**: Control de acceso configurado
5. **Validación**: express-validator en todas las rutas
6. **SQLite**: Base de datos local sin exposición a internet

## 📄 Licencia

ISC
