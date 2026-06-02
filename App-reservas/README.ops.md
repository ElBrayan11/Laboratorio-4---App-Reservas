# README — Rama `ops` (Documentación de Despliegue)

> **Asignatura:** Aplicaciones y Servicios Web · Lab 4 DevOps  
> Guía completa para desplegar ReservaSpace con Docker Compose.

---

## 1. Requisitos Previos

| Herramienta | Versión mínima | Verificar |
|-------------|---------------|-----------|
| Docker | 24.x | `docker --version` |
| Docker Compose | v2.x (incluido en Docker Desktop) | `docker compose version` |
| Git | 2.x | `git --version` |
| Windows con WSL 2 o Linux | — | WSL: `wsl --version` |

> **WSL en Windows:** Instalar desde PowerShell como administrador:  
> `wsl --install` y luego reiniciar.

---

## 2. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd <nombre-del-repositorio>

# Verificar que estás en la rama main
git branch
```

---

## 3. Configuración de Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus valores (opcional para desarrollo local)
nano .env     # Linux/WSL
notepad .env  # Windows
```

### Contenido del archivo `.env.example`

```env
# --- Base de datos PostgreSQL ---
POSTGRES_DB=serviciosweb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# --- Backend FastAPI ---
# Clave secreta JWT — CAMBIAR en producción (mínimo 32 caracteres aleatorios)
SECRET_KEY=CAMBIA_ESTA_CLAVE_POR_UNA_SECRETA_EN_PRODUCCION

# --- Usuario administrador inicial ---
ADMIN_EMAIL=admin@itm.edu.co
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrador
```

### Descripción de variables

| Variable | Descripción | Valor por defecto |
|----------|-------------|------------------|
| `POSTGRES_DB` | Nombre de la base de datos | `serviciosweb` |
| `POSTGRES_USER` | Usuario de PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | `postgres` |
| `SECRET_KEY` | Clave para firmar tokens JWT | *(cambiar siempre)* |
| `ADMIN_EMAIL` | Correo del admin inicial | `admin@itm.edu.co` |
| `ADMIN_PASSWORD` | Contraseña del admin inicial | `admin123` |
| `ADMIN_NAME` | Nombre del admin inicial | `Administrador` |

> ⚠️ Nunca subir el archivo `.env` al repositorio. Está incluido en `.gitignore`.

---

## 4. Dockerfile — Backend

`App-reservas/Dockerfile`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
COPY app /app/app
ENV PYTHONPATH=/app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Explicación:**
- Imagen base `python:3.11-slim` (liviana).
- Instala dependencias primero (caché de capas Docker).
- Copia solo el código de la app.
- Define `PYTHONPATH` para que los imports relativos funcionen.
- Expone puerto 8000 mediante uvicorn.

---

## 5. Dockerfile — Frontend

`Front-App-reservas/Dockerfile`:

```dockerfile
# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV VITE_API_URL=""
RUN npm run build

# ---- Production stage ----
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Explicación:**
- **Stage 1 (builder):** Construye el proyecto React con Vite. `VITE_API_URL=""` hace que el frontend use rutas relativas `/api/` que nginx proxifica.
- **Stage 2 (producción):** Imagen nginx liviana que sirve los archivos estáticos compilados.

### Configuración nginx (`nginx.conf`)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing — todas las rutas van a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy de /api/ hacia el contenedor backend
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 6. Archivo `docker-compose.yml`

```yaml
services:

  db:
    image: postgres:15
    env_file: .env
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-serviciosweb}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./App-reservas/database/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - appnet
    restart: unless-stopped

  backend:
    build: ./App-reservas
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@db:5432/${POSTGRES_DB:-serviciosweb}
      SECRET_KEY: ${SECRET_KEY}
      ADMIN_EMAIL: ${ADMIN_EMAIL:-admin@itm.edu.co}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD:-admin123}
      ADMIN_NAME: ${ADMIN_NAME:-Administrador}
    ports:
      - '8000:8000'
    networks:
      - appnet
    restart: unless-stopped

  frontend:
    build: ./Front-App-reservas
    depends_on:
      - backend
    ports:
      - '80:80'
    networks:
      - appnet
    restart: unless-stopped

volumes:
  db-data:

networks:
  appnet:
    driver: bridge
```

---

## 7. Puertos Utilizados

| Servicio | Puerto host | Puerto contenedor | URL de acceso |
|----------|------------|------------------|---------------|
| Frontend (nginx) | 80 | 80 | http://localhost |
| Backend (FastAPI) | 8000 | 8000 | http://localhost:8000 |
| Swagger UI | 8000 | 8000 | http://localhost:8000/docs |
| PostgreSQL | *(interno)* | 5432 | Solo entre contenedores |

---

## 8. Configuración de Red y Persistencia

### Red interna (`appnet`)
Todos los contenedores comparten la red `appnet` de tipo `bridge`. Esto permite:
- `frontend` → llama a `backend:8000` internamente (via nginx proxy).
- `backend` → llama a `db:5432` internamente (via SQLAlchemy).
- El exterior solo accede a los puertos 80 y 8000 expuestos.

### Volumen de datos (`db-data`)
El volumen `db-data` persiste los datos de PostgreSQL entre reinicios y recreaciones de contenedores. Solo se elimina explícitamente con `docker compose down -v`.

---

## 9. Construcción y Ejecución

### Primer inicio (build + up)

```bash
# Desde la raíz del repositorio
docker compose up -d --build
```

### Verificar que los contenedores están corriendo

```bash
docker compose ps
# Debe mostrar los 3 servicios con estado "Up"
```

### Ver logs en tiempo real

```bash
# Todos los servicios
docker compose logs -f

# Solo backend
docker compose logs -f backend

# Solo base de datos
docker compose logs -f db
```

### Verificar el sistema

```bash
# 1. Frontend accesible
curl http://localhost

# 2. Backend responde
curl http://localhost:8000/docs

# 3. Login de admin
curl -X POST http://localhost:8000/api/auth/token \
  -d "username=admin@itm.edu.co&password=admin123"

# 4. Listar espacios
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/token \
  -d "username=admin@itm.edu.co&password=admin123" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/espacios/
```

---

## 10. Apagado, Reinicio y Actualización

### Detener servicios (preserva datos)

```bash
docker compose stop
```

### Reiniciar servicios

```bash
docker compose restart
```

### Apagar y eliminar contenedores (preserva volumen de datos)

```bash
docker compose down
```

### Apagar y eliminar TODO incluyendo la base de datos

```bash
docker compose down -v
# ⚠️ Esto borra todos los datos de PostgreSQL
```

### Actualizar después de cambios en el código

```bash
# Reconstruir imagen y reiniciar el servicio afectado
docker compose up -d --build backend
# o
docker compose up -d --build frontend
# o reconstruir todo
docker compose up -d --build
```

---

## 11. Solución de Errores Comunes

### ❌ Error: "Cannot connect to Docker daemon"

```bash
# Verificar que Docker Desktop está corriendo
docker info

# Si usas WSL, asegurar que la integración WSL está habilitada en Docker Desktop Settings
```

### ❌ Backend no inicia: "could not connect to server"

**Causa:** El backend inicia antes que la base de datos esté lista.  
**Solución:** El `healthcheck` en `db` y `depends_on: condition: service_healthy` en `backend` garantizan el orden. Si persiste:

```bash
docker compose logs db
# Verificar que PostgreSQL inició correctamente
docker compose restart backend
```

### ❌ Error 500 en login: "JWT decode error"

**Causa:** `SECRET_KEY` no configurada o vacía.  
**Solución:** Verificar `.env`:
```bash
cat .env | grep SECRET_KEY
# El valor no debe ser vacío
```

### ❌ Frontend muestra "Network Error" o no carga datos

**Causa:** El proxy nginx no está llegando al backend.  
**Verificar:**
```bash
# ¿Está corriendo el backend?
docker compose ps backend

# ¿Responde directamente?
curl http://localhost:8000/api/espacios/

# ¿El proxy funciona?
curl http://localhost/api/espacios/
```

### ❌ Puerto 80 en uso

**Causa:** Otro proceso usa el puerto 80 (IIS, Apache, etc.).  
**Solución:** Cambiar el puerto en `docker-compose.yml`:
```yaml
frontend:
  ports:
    - '8080:80'   # Usar puerto 8080 en su lugar
```

### ❌ Datos iniciales no cargados (sin espacios ni admin)

```bash
# Ver si el init.sql se ejecutó
docker compose logs db | grep "database system is ready"

# Si la BD ya existía (volumen previo), el init.sql no vuelve a correr
# Solución: borrar el volumen y reiniciar
docker compose down -v
docker compose up -d --build
```
