Diseña un frontend moderno y profesional para una aplicación web llamada "ReservaSpace", destinada a la gestión de reservas de espacios institucionales (salas, laboratorios, auditorios y aulas especiales).

Basarse estrictamente en estos requisitos funcionales, reglas de negocio y estructura de datos.

OBJETIVO DEL SISTEMA:
Crear una plataforma donde usuarios y administradores puedan gestionar reservas de espacios institucionales con autenticación JWT y control por roles.

TECNOLOGÍA OBJETIVO:
Generar únicamente diseño frontend (UI/UX), preparado para ser implementado posteriormente en React o HTML/CSS/JS.

ESTILO VISUAL:
- Diseño moderno tipo dashboard
- Minimalista y profesional
- Responsive (desktop y móvil)
- Colores:
   - Primario: #2563EB (azul)
   - Secundario: #1E293B
   - Éxito: #22C55E
   - Error: #EF4444
   - Advertencia: #F59E0B
- Tarjetas con sombras suaves
- Bordes redondeados
- Iconografía moderna
- Navegación lateral para escritorio
- Menú inferior para móvil

BASE DE DATOS:

Tabla usuarios:
- id_usuario
- nombre
- correo
- password
- rol (admin | usuario)

Tabla espacios:
- id_espacio
- nombre
- ubicacion
- capacidad
- estado:
   - activo
   - inactivo
   - en mantenimiento
   - no disponible

Tabla reservas:
- id_reserva
- id_usuario
- id_espacio
- fecha
- hora_inicio
- hora_fin
- cantidad_asistentes
- estado:
   - esperando
   - aprobada
   - rechazada

GENERAR LAS SIGUIENTES PANTALLAS:

1. Pantalla Splash
- Logo de la aplicación
- Nombre: ReservaSpace
- Frase:
"Gestiona espacios institucionales fácilmente"
- Botón "Comenzar"

------------------------------------------------

2. Pantalla Login

Campos:
- Correo
- Contraseña

Opciones:
- Recordar sesión
- Recuperar contraseña

Botones:
- Iniciar sesión
- Registrarse

Validaciones visuales:
- Correo inválido
- Contraseña incorrecta

Mostrar mensajes tipo toast:
- Inicio exitoso
- Error de autenticación

------------------------------------------------

3. Pantalla Registro

Campos:
- Nombre completo
- Correo
- Contraseña
- Confirmar contraseña

Botón:
- Crear cuenta

Rol:
- usuario por defecto

Validaciones:
- Campos vacíos
- Contraseñas diferentes
- Correo existente

------------------------------------------------

4. Dashboard Usuario

Barra superior:
- Foto de perfil
- Nombre usuario
- Notificaciones
- Cerrar sesión

Sidebar:

Inicio
Espacios
Reservas
Mi perfil
Cerrar sesión

Contenido principal:

Tarjetas resumen:

- Espacios disponibles
- Reservas pendientes
- Reservas aprobadas
- Reservas rechazadas

Sección:
"Espacios disponibles"

Mostrar tarjetas con:

- Nombre espacio
- Ubicación
- Capacidad
- Estado
- Botón Reservar

Estado visual:

Activo → verde
Inactivo → gris
Mantenimiento → amarillo
No disponible → rojo

------------------------------------------------

5. Crear Reserva

Formulario:

Seleccionar espacio
Fecha
Hora inicio
Hora fin
Cantidad asistentes

Botón:
Crear reserva

Mostrar errores visuales:

- Horario ocupado
- Capacidad excedida
- Debe reservar con mínimo 24 horas
- Horario fuera del permitido
- Hora inicio debe ser menor a hora fin
- Espacio no disponible

Mostrar mensaje:

"Reserva creada exitosamente"

Estado inicial:
esperando

------------------------------------------------

6. Mis Reservas

Tabla con:

ID
Espacio
Fecha
Hora inicio
Hora fin
Cantidad asistentes
Estado

Estados con colores:

Esperando → amarillo
Aprobada → verde
Rechazada → rojo

Acciones:

Ver detalle
Cancelar reserva

------------------------------------------------

7. Dashboard Administrador

Sidebar:

Dashboard
Usuarios
Espacios
Reservas
Configuración
Cerrar sesión

Tarjetas estadísticas:

Usuarios registrados
Espacios activos
Reservas pendientes
Reservas aprobadas

Gráficos:

Reservas por día
Espacios más utilizados

------------------------------------------------

8. Gestión de Espacios (Admin)

Tabla:

Nombre
Ubicación
Capacidad
Estado

Acciones:

Agregar
Editar
Eliminar
Cambiar estado

Formulario modal:

Nombre
Ubicación
Capacidad
Estado

------------------------------------------------

9. Gestión de Reservas (Admin)

Tabla completa:

Usuario
Espacio
Fecha
Hora inicio
Hora fin
Cantidad asistentes
Estado

Botones:

Aprobar
Rechazar
Ver detalle

Modal detalle:

Información completa

------------------------------------------------

10. Perfil usuario

Mostrar:

Foto
Nombre
Correo
Rol

Botones:

Editar perfil
Cambiar contraseña

------------------------------------------------

REGLAS DE NEGOCIO A REPRESENTAR VISUALMENTE:

- Solo usuarios autenticados pueden reservar
- Solo administradores aprueban o rechazan reservas
- No permitir reservas superpuestas
- Mínimo 24 horas de anticipación
- Horarios permitidos:

Lunes–Viernes:
7:00 AM – 8:00 PM

Sábados:
8:00 AM –12:00 PM

Domingos:
No permitido

- Hora inicio debe ser menor a hora fin
- Espacios inactivos o en mantenimiento no pueden reservarse
- Capacidad asistentes ≤ capacidad espacio
- Estado inicial reserva = esperando

COMPONENTES EXTRA:

- Toast notifications
- Modales
- Confirmaciones
- Loader
- Skeleton loading
- Estados vacíos
- Paginación
- Buscador
- Filtros
- Calendario visual de reservas

Generar prototipo navegable completo con flujo entre pantallas.