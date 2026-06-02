# README — Rama `dev` (Documentación Técnica)

> **Asignatura:** Aplicaciones y Servicios Web · Lab 4 DevOps  
> Documentación técnica del frontend, backend y base de datos.

---

## 1. Arquitectura del Sistema

```
Cliente (Navegador)
        │ HTTP/JSON
        ▼
┌───────────────┐        ┌──────────────────────────────────────┐
│  Frontend     │◀──────▶│  Backend (FastAPI)                   │
│  React + TS   │  REST  │  app/                                │
│  Vite + nginx │        │   ├── api/        ← Rutas HTTP       │
└───────────────┘        │   ├── auth/       ← JWT              │
                         │   ├── crud/       ← Lógica de BD     │
                         │   ├── models/     ← SQLAlchemy ORM   │
                         │   ├── schemas/    ← Pydantic         │
                         │   ├── db.py       ← Conexión         │
                         │   └── main.py     ← Entrada          │
                         └─────────────┬────────────────────────┘
                                       │ SQLAlchemy / psycopg2
                                       ▼
                              ┌─────────────────┐
                              │  PostgreSQL 15  │
                              │  Base de datos  │
                              └─────────────────┘
```

---

## 2. Diseño de Base de Datos

### Modelo Entidad-Relación

```
┌──────────────────┐         ┌──────────────────────┐         ┌────────────────────┐
│    usuarios      │         │       reservas       │         │     espacios       │
├──────────────────┤         ├──────────────────────┤         ├────────────────────┤
│ id_usuario  PK   │◀───┐    │ id_reserva      PK   │    ┌───▶│ id_espacio    PK   │
│ nombre           │    └────│ id_usuario      FK   │    │    │ nombre             │
│ correo  UNIQUE   │         │ id_espacio      FK   │────┘    │ ubicacion          │
│ password HASHED  │         │ fecha           DATE │         │ capacidad    INT   │
│ rol              │         │ hora_inicio     TIME │         │ estado             │
│  ('admin'|       │         │ hora_fin        TIME │         │  ('activo'|        │
│   'usuario')     │         │ cantidad_asist  INT  │         │   'inactivo'|      │
└──────────────────┘         │ estado               │         │   'en mantenimiento│
                             │  ('esperando'|       │         │   'no disponible') │
                             │   'aprobada'|        │         └────────────────────┘
                             │   'rechazada')       │
                             └──────────────────────┘
```

### Restricciones de integridad
- `usuarios.correo` → UNIQUE
- `usuarios.rol` → CHECK IN ('admin', 'usuario')
- `espacios.estado` → CHECK IN ('activo', 'inactivo', 'en mantenimiento', 'no disponible')
- `reservas.estado` → CHECK IN ('esperando', 'aprobada', 'rechazada') DEFAULT 'esperando'
- `reservas.id_usuario` → FK → usuarios(id_usuario)
- `reservas.id_espacio` → FK → espacios(id_espacio)

---

## 3. Estructura de Carpetas del Proyecto

### Backend (`App-reservas/`)

```
App-reservas/
├── app/
│   ├── api/
│   │   ├── auth.py        ← POST /api/auth/token, GET /api/auth/me
│   │   ├── usuarios.py    ← POST /register, POST /, GET /
│   │   ├── espacios.py    ← GET /, POST /, GET /{id}, PUT /{id}
│   │   └── reservas.py    ← POST /, GET /me, GET /, PUT /{id}/estado, POST /{id}/cancel
│   ├── auth/
│   │   └── auth.py        ← JWT: crear, verificar token; dependencias get_current_user, require_admin
│   ├── crud/
│   │   ├── usuarios.py    ← CRUD usuarios (create_user, get_user_by_email, list_users)
│   │   ├── espacios.py    ← CRUD espacios (create, list, get, update)
│   │   └── reservas.py    ← CRUD reservas + todas las reglas de negocio
│   ├── models/
│   │   ├── usuario.py     ← Modelo SQLAlchemy tabla `usuarios`
│   │   ├── espacio.py     ← Modelo SQLAlchemy tabla `espacios`
│   │   └── reserva.py     ← Modelo SQLAlchemy tabla `reservas`
│   ├── schemas/
│   │   ├── usuario.py     ← Pydantic: UsuarioCreate, UsuarioRegister, UsuarioOut
│   │   ├── espacio.py     ← Pydantic: EspacioCreate, EspacioOut
│   │   └── reserva.py     ← Pydantic: ReservaCreate, ReservaOut
│   ├── db.py              ← engine, SessionLocal, Base, get_db
│   └── main.py            ← FastAPI app, CORS, routers, startup (create_tables + seed_admin)
├── database/
│   └── init.sql           ← DDL: CREATE TABLE + datos iniciales (2 espacios)
├── scripts/
│   └── seed_admin.py      ← Script para crear usuario admin manualmente
├── Dockerfile
├── requirements.txt
└── README.dev.md          ← Este archivo
```

### Frontend (`Front-App-reservas/`)

```
Front-App-reservas/
├── src/
│   ├── app/
│   │   └── App.tsx         ← Componente raíz: todas las pantallas y layouts
│   ├── context/
│   │   └── AppContext.tsx   ← Estado global: usuario, espacios, reservas, usuarios
│   ├── services/
│   │   └── api.ts           ← Cliente HTTP: fetch wrapper + manejo de errores
│   ├── types/
│   │   └── api.ts           ← Interfaces TypeScript: Usuario, Espacio, Reserva, etc.
│   ├── lib/
│   │   └── mappers.ts       ← Transforma datos API → UI (mapEspacio, mapReserva, etc.)
│   ├── styles/              ← CSS global, Tailwind, variables de tema
│   ├── components/ui/       ← Componentes shadcn/ui (Button, Dialog, etc.)
│   └── main.tsx             ← Entry point → AppProvider → App
├── Dockerfile               ← Multi-stage: node build + nginx serve
├── nginx.conf               ← Proxy /api/ → backend:8000, SPA fallback
├── vite.config.ts
└── package.json
```

---

## 4. Tecnologías y Librerías

### Backend

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `fastapi` | 0.95.2 | Framework web REST |
| `uvicorn[standard]` | 0.22.0 | Servidor ASGI |
| `SQLAlchemy` | 1.4.50 | ORM para Python |
| `psycopg2-binary` | 2.9.6 | Driver PostgreSQL |
| `python-jose[cryptography]` | 3.3.0 | Generación y verificación JWT |
| `passlib[bcrypt]` | 1.7.4 | Hash de contraseñas |
| `python-multipart` | 0.0.6 | Formularios (OAuth2PasswordRequestForm) |
| `python-dotenv` | 1.0.0 | Variables de entorno `.env` |
| `email-validator` | 2.1.1 | Validación de correos en Pydantic |

### Frontend

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `react` | 18.3.1 | Framework UI |
| `typescript` | — | Tipado estático |
| `vite` | 6.3.5 | Bundler / dev server |
| `tailwindcss` | 4.1.12 | Estilos utilitarios |
| `motion` | 12.x | Animaciones |
| `sonner` | 2.0.3 | Notificaciones toast |
| `lucide-react` | — | Iconografía |
| `recharts` | 2.15.2 | Gráficas (barras, dona) |
| `@radix-ui/*` | — | Componentes UI accesibles |

---

## 5. Endpoints de la API

### Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/token` | ❌ | Login, retorna JWT |
| GET | `/api/auth/me` | ✅ | Usuario autenticado actual |

**Ejemplo login:**
```bash
curl -X POST http://localhost:8000/api/auth/token \
  -d "username=admin@itm.edu.co&password=admin123"
```

### Usuarios

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | `/api/usuarios/register` | ❌ | — | Autoregistro (rol=usuario) |
| POST | `/api/usuarios/` | ✅ | admin | Crear usuario con rol personalizado |
| GET | `/api/usuarios/` | ✅ | admin | Listar todos los usuarios |

### Espacios

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/api/espacios/` | ❌ | — | Listar todos los espacios |
| GET | `/api/espacios/{id}` | ❌ | — | Detalle de un espacio |
| POST | `/api/espacios/` | ✅ | admin | Crear espacio |
| PUT | `/api/espacios/{id}` | ✅ | admin | Actualizar espacio |

### Reservas

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | `/api/reservas/` | ✅ | usuario/admin | Crear reserva (valida reglas) |
| GET | `/api/reservas/me` | ✅ | usuario/admin | Mis reservas |
| GET | `/api/reservas/` | ✅ | admin | Todas las reservas |
| PUT | `/api/reservas/{id}/estado` | ✅ | admin | Cambiar estado (aprobada/rechazada) |
| POST | `/api/reservas/{id}/cancel` | ✅ | usuario/admin | Cancelar reserva |

> Documentación interactiva completa en `http://localhost:8000/docs` (Swagger UI).

---

## 6. Autenticación JWT

### Flujo de autenticación

```
1. POST /api/auth/token  (username=correo, password=pwd)
         │
         ▼
2. Backend verifica credenciales con bcrypt
         │
         ▼
3. Retorna { access_token, token_type: "bearer", rol, nombre, correo }
         │
         ▼
4. Frontend guarda token en localStorage
         │
         ▼
5. Cada petición protegida incluye: Authorization: Bearer <token>
         │
         ▼
6. Backend decodifica JWT → obtiene correo (sub) → consulta usuario → verifica rol
```

### Configuración del token

- **Algoritmo:** HS256
- **Expiración:** 24 horas
- **Clave:** variable de entorno `SECRET_KEY`
- **Contenido del payload:** `{ "sub": "<correo>", "exp": <timestamp> }`

### Dependencias de FastAPI

```python
get_current_user(token)   # Cualquier usuario autenticado
require_admin(user)       # Solo rol 'admin'
```

---

## 7. Reglas de Negocio — Implementación

Todas las validaciones están en `app/crud/reservas.py → check_business_rules()`.

```python
def check_business_rules(db, user_id, reserva):
    # Regla F: hora_inicio < hora_fin
    if reserva.hora_inicio >= reserva.hora_fin: raise ...

    # Regla D: mínimo 24h de anticipación
    if datetime.combine(fecha, hora_inicio) - now < timedelta(hours=24): raise ...

    # Regla E: horario permitido según día de semana
    if weekday == 6:           # Domingo → prohibido
    if weekday == 5:           # Sábado → 08:00-12:00
    else:                      # L-V    → 07:00-20:00

    # Obtener espacio desde BD
    espacio = db.query(Espacio).filter(id == id_espacio).first()

    # Regla G: espacio no debe estar inactivo/mantenimiento/no disponible
    if espacio.estado in ('inactivo', 'en mantenimiento', 'no disponible'): raise ...

    # Regla H: cantidad_asistentes <= capacidad
    if reserva.cantidad_asistentes > espacio.capacidad: raise ...

    # Regla C: sin solapamiento (estados esperando y aprobada bloquean)
    existing = db.query(Reserva).filter(
        id_espacio == reserva.id_espacio,
        fecha == reserva.fecha,
        estado.in_(['esperando', 'aprobada'])
    ).all()
    for ex in existing:
        if is_overlap(hora_inicio, hora_fin, ex.hora_inicio, ex.hora_fin): raise ...
```

**La regla I** (estado inicial `esperando`, solo admin cambia estado) se aplica en `create_reserva` y en el endpoint `PUT /api/reservas/{id}/estado` (protegido por `require_admin`).

**La regla A** (solo autenticado crea reservas) y **la regla B** (solo admin aprueba) se aplican mediante las dependencias de FastAPI en cada endpoint.

---

## 8. Ejecución en Modo Desarrollo

### Backend

```bash
# 1. Crear entorno virtual
cd App-reservas
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar base de datos local (PostgreSQL corriendo en localhost:5432)
# Crear la base de datos: CREATE DATABASE serviciosweb;

# 4. Variables de entorno
cp ../.env.example .env
# Editar DATABASE_URL si es necesario

# 5. Iniciar servidor con recarga automática
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El servidor crea las tablas automáticamente en el startup y crea el usuario admin si no existe.

Acceder a la documentación: `http://localhost:8000/docs`

### Frontend

```bash
cd Front-App-reservas

# Instalar dependencias
npm install

# Configurar URL de la API (para desarrollo local)
echo "VITE_API_URL=http://localhost:8000" > .env

# Iniciar servidor de desarrollo
npm run dev
# Disponible en: http://localhost:5173
```

> En modo Docker, el frontend se conecta al backend a través del proxy nginx (`/api/` → `backend:8000`), por lo que `VITE_API_URL` queda vacío en el build de producción.
