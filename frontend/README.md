# ReservaSpace — Sistema de Gestión de Reservas Institucionales

> **Rama:** `main` — Manual de usuario e informe final  
> **Asignatura:** Aplicaciones y Servicios Web · Laboratorio 4 — Integrador DevOps

---

## 1. Descripción General

**ReservaSpace** es una aplicación web para la gestión de reservas de espacios institucionales (salas de reuniones, laboratorios, auditorios y aulas especiales). Resuelve el problema de conflictos de horarios, reservas fuera de horario y solicitudes sin anticipación suficiente, garantizando una administración ordenada de los recursos de la institución.

### Objetivo

Proporcionar una plataforma que permita a usuarios reservar espacios de forma autónoma, mientras que los administradores gestionan los espacios y aprueban o rechazan solicitudes, aplicando reglas de negocio que garantizan la integridad del sistema.

---

## 2. Integrantes del Equipo

| Nombre | Rol en el proyecto |
|--------|-------------------|
| *(Integrante 1)* | Backend / Base de datos |
| *(Integrante 2)* | Frontend / Docker |
| *(Integrante 3)* | Documentación / Testing |

> Verificar commits individuales en el historial de Git del repositorio.

---

## 3. Qué hace la aplicación y qué problema resuelve

La institución no contaba con un sistema centralizado para gestionar la reserva de sus espacios. Los conflictos de horario, las reservas improvisadas sin anticipación y la falta de control sobre quién aprueba o rechaza solicitudes generaban desorden. **ReservaSpace** soluciona esto mediante:

- Un flujo de solicitud → aprobación con roles diferenciados.
- Validación automática de reglas de negocio en el servidor (horarios, capacidad, solapamiento, anticipación mínima).
- Una interfaz web intuitiva accesible desde cualquier navegador.

---

## 4. Arquitectura General y Tecnologías

```
┌─────────────────────────────────────────────────┐
│                 Docker Compose                  │
│                                                 │
│  ┌─────────────┐   ┌────────────┐   ┌────────┐  │
│  │  Frontend   │──▶│  Backend   │──▶│   DB   │  │
│  │ React + TS  │   │  FastAPI   │   │Postgres│  │
│  │ nginx :80   │   │   :8000    │   │ :5432  │  │
│  └─────────────┘   └────────────┘   └────────┘  │
│          └──── Red interna: appnet ─────────┘   │
└─────────────────────────────────────────────────┘
```

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Python 3.11 + FastAPI + Uvicorn |
| Base de datos | PostgreSQL 15 |
| ORM | SQLAlchemy 1.4 |
| Autenticación | JWT — python-jose + passlib/bcrypt |
| Contenedores | Docker + Docker Compose |
| Proxy / Servidor estático | nginx |

---

## 5. Credenciales de Acceso por Defecto

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| Administrador | `admin@itm.edu.co` | `admin123` |

> ⚠️ Cambiar en producción mediante variables de entorno en `.env`.

---

## 6. Resumen del Despliegue

El sistema completo se levanta con un solo comando desde la raíz del repositorio:

```bash
git clone <URL_REPOSITORIO> && cd <carpeta>
cp .env.example .env          # ajustar si se desea
docker compose up -d --build
```

| Servicio | URL |
|---------|-----|
| **Aplicación web** | http://localhost |
| **API REST** | http://localhost:8000 |
| **Swagger / Docs** | http://localhost:8000/docs |

> Para instrucciones detalladas ver el `README.ops.md` (rama `ops`).

---

## 7. Tutorial de Uso con Imágenes

### 7.1 Pantalla de inicio — Splash

Al abrir `http://localhost` aparece la pantalla de bienvenida. Hacer clic en **"Comenzar"** para acceder al sistema.

![Splash screen](screenshots/01_splash.png)

---

### 7.2 Inicio de Sesión

Ingresar el correo institucional y contraseña. El sistema redirige automáticamente según el rol del usuario.

![Pantalla de login](screenshots/02_login.png)

**Error de autenticación:** si las credenciales son incorrectas, el sistema muestra un mensaje de error en pantalla.

![Error de login](screenshots/03_error_login.png)

---

### 7.3 Registro de Nuevo Usuario

Cualquier persona puede crear su cuenta haciendo clic en **"Regístrate"**. Los usuarios registrados por autoregistro reciben el rol `usuario`.

![Pantalla de registro](screenshots/04_registro.png)

---

### 7.4 Dashboard del Usuario

Tras iniciar sesión, el usuario ve un resumen de espacios disponibles y el estado de sus reservas, junto con acceso rápido a los espacios activos.

![Dashboard usuario](screenshots/05_dashboard_usuario.png)

---

### 7.5 Consultar Espacios

Desde el menú **"Espacios"** se puede explorar el catálogo completo con búsqueda por nombre o ubicación.

![Catálogo de espacios](screenshots/06_catalogo_espacios.png)

---

### 7.6 Crear una Reserva

Hacer clic en **"Reservar"** en cualquier espacio activo para abrir el formulario de reserva.

![Formulario crear reserva](screenshots/07_form_crear_reserva.png)

---

### 7.7 Mensajes de Error — Reglas de Negocio

El sistema valida todas las reglas de negocio y muestra mensajes claros cuando no se cumplen:

**Error: intento de reservar un domingo**

![Error domingo](screenshots/08_error_domingo.png)

**Error: conflicto de horario con otra reserva existente**

![Error conflicto horario](screenshots/09_error_conflicto.png)

**Error: cantidad de asistentes supera la capacidad del espacio**

![Error capacidad](screenshots/10_error_capacidad.png)

---

### 7.8 Reserva Creada Exitosamente

Al cumplir todas las reglas, la reserva se crea con estado `esperando`, pendiente de aprobación.

![Reserva creada](screenshots/11_reserva_creada.png)

---

### 7.9 Consultar Mis Reservas

El usuario puede ver todas sus reservas con fecha, hora, estado y opción de cancelar las que están en `esperando`.

![Mis reservas](screenshots/12_mis_reservas.png)

---

### 7.10 Cancelar una Reserva

Hacer clic en el ícono de papelera 🗑 sobre una reserva en estado `esperando` la cancela. El estado cambia a `rechazada`.

![Reserva cancelada](screenshots/13_reserva_cancelada.png)

---

### 7.11 Cerrar Sesión

Hacer clic en **"Cerrar sesión"** en el menú lateral o en el desplegable del perfil.

![Cierre de sesión](screenshots/14_logout.png)

---

### 7.12 Dashboard del Administrador

El panel de admin muestra métricas en tiempo real: usuarios, espacios activos, reservas pendientes y aprobadas. Las gráficas usan datos reales de la base de datos.

![Dashboard admin](screenshots/15_dashboard_admin.png)

---

### 7.13 Gestión de Espacios (Admin)

El administrador puede ver, crear y editar todos los espacios del sistema.

![Gestión espacios](screenshots/16_admin_espacios.png)

**Modal para crear un nuevo espacio:**

![Modal crear espacio](screenshots/17_modal_crear_espacio.png)

**Modal para editar un espacio existente:**

![Modal editar espacio](screenshots/18_modal_editar_espacio.png)

---

### 7.14 Gestión de Reservas (Admin)

El administrador ve todas las reservas del sistema y puede aprobar o rechazar las que están en estado `esperando`.

![Gestión reservas admin](screenshots/19_admin_reservas.png)

**Aprobar una reserva** (clic en ✓ verde):

![Reserva aprobada](screenshots/20_reserva_aprobada.png)

**Rechazar una reserva** (clic en ✗ rojo):

![Reserva rechazada](screenshots/21_reserva_rechazada.png)

---

### 7.15 Gestión de Usuarios (Admin)

El administrador puede consultar todos los usuarios registrados, con nombre, correo y rol.

![Gestión usuarios admin](screenshots/22_admin_usuarios.png)

---

## 8. Reglas de Negocio del Sistema

| Regla | Descripción |
|-------|-------------|
| Autenticación requerida | Solo usuarios con sesión activa pueden crear reservas |
| Solo admin aprueba | Cambio de estado `esperando → aprobada/rechazada` requiere rol admin |
| Sin solapamiento | No se puede reservar un espacio si hay reserva `esperando` o `aprobada` en ese horario |
| 24 h de anticipación | La reserva debe crearse al menos 24 horas antes de la hora de inicio |
| Horario L–V | 07:00 a.m. – 08:00 p.m. |
| Horario sábado | 08:00 a.m. – 12:00 m. |
| Domingos | No se permiten reservas |
| Inicio < fin | La hora de inicio debe ser estrictamente anterior a la hora de fin |
| Espacios disponibles | Solo espacios `activo` aceptan nuevas reservas |
| Capacidad | La cantidad de asistentes no puede superar la capacidad del espacio |

---

## 9. Conclusiones, Dificultades y Aprendizajes

### Logros del proyecto
- Implementación completa de una API REST con FastAPI integrando autenticación JWT, roles diferenciados y todas las reglas de negocio especificadas.
- Desarrollo de una interfaz de usuario moderna, responsiva y funcional con React y TypeScript.
- Despliegue exitoso de una arquitectura de tres capas usando Docker Compose, con comunicación interna entre contenedores mediante una red bridge dedicada.
- Aplicación de buenas prácticas de seguridad: contraseñas hasheadas con bcrypt, endpoints protegidos por roles, variables de entorno para secretos.

### Dificultades encontradas
- Configuración de CORS al integrar el frontend en nginx con el backend en un contenedor separado: se resolvió mediante el proxy `/api/` en nginx.conf.
- Manejo correcto de tipos de tiempo (`time`, `date`) entre Python, PostgreSQL y el formulario React (formato HH:MM vs HH:MM:SS).
- Sincronización del estado global en React al refrescar datos después de cada operación exitosa.

### Aprendizajes obtenidos
- Comprensión práctica de la arquitectura de microservicios contenedorizados y su orquestación con Docker Compose.
- Implementación end-to-end de autenticación JWT: generación, verificación, almacenamiento en cliente y uso en encabezados HTTP.
- Diseño e implementación de reglas de negocio robustas en la capa de CRUD del backend.
- Uso de nginx como servidor de archivos estáticos y proxy reverso en un entorno Docker.

### Mejoras futuras
- Notificaciones por correo electrónico al crear o aprobar/rechazar reservas.
- Módulo de reportes exportables en PDF o CSV.
- Tests automatizados: pytest en backend, Vitest en frontend.
- Pipeline CI/CD con GitHub Actions para build y deploy automático.
- Modo oscuro y mejoras de accesibilidad (etiquetas ARIA).

---

## 10. Referencias

1. Docker, Inc. (2024). *Docker documentation*. https://docs.docker.com  
2. Docker, Inc. (2024). *Docker Compose overview*. https://docs.docker.com/compose  
3. Bayer, M. (2024). *SQLAlchemy documentation*. https://docs.sqlalchemy.org  
4. Jones, M. et al. (2015). *JSON Web Token (JWT)* — RFC 7519. https://datatracker.ietf.org/doc/html/rfc7519  
5. FastAPI. (2024). *FastAPI documentation*. https://fastapi.tiangolo.com  
6. React. (2024). *React documentation*. https://react.dev  
7. Chacon, S. & Straub, B. (2014). *Pro Git*. Apress.
