-- Esquema base (coincide con tus tablas de PostgreSQL)
CREATE TABLE IF NOT EXISTS usuarios(
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    CHECK (rol IN ('admin','usuario'))
);

CREATE TABLE IF NOT EXISTS espacios(
    id_espacio SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(100),
    capacidad INTEGER NOT NULL,
    estado VARCHAR(30),
    CHECK(
        estado IN(
            'activo',
            'inactivo',
            'en mantenimiento',
            'no disponible'
        )
    )
);

CREATE TABLE IF NOT EXISTS reservas(
    id_reserva SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_espacio INTEGER NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    cantidad_asistentes INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'esperando',
    FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY(id_espacio) REFERENCES espacios(id_espacio),
    CHECK(
        estado IN(
            'esperando',
            'aprobada',
            'rechazada'
        )
    )
);

-- Usuario admin: ejecutar `python scripts/seed_admin.py` después de levantar el backend

INSERT INTO espacios (nombre, ubicacion, capacidad, estado)
SELECT 'Sala de Juntas A', 'Edificio Principal, Piso 2', 15, 'activo'
WHERE NOT EXISTS (SELECT 1 FROM espacios WHERE nombre = 'Sala de Juntas A');

INSERT INTO espacios (nombre, ubicacion, capacidad, estado)
SELECT 'Laboratorio de Cómputo 1', 'Edificio B, Piso 1', 30, 'activo'
WHERE NOT EXISTS (SELECT 1 FROM espacios WHERE nombre = 'Laboratorio de Cómputo 1');
