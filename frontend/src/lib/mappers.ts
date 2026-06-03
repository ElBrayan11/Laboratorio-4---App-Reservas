import type { Espacio, Reserva, Usuario } from '../types/api';
import type { ReservationUI, SpaceUI, UserUI } from '../types/api';

export function normalizeSpaceStatus(status: string): string {
  if (status === 'en mantenimiento') return 'mantenimiento';
  return status;
}

export function toApiSpaceStatus(status: string): string {
  if (status === 'mantenimiento') return 'en mantenimiento';
  return status;
}

export function mapEspacio(espacio: Espacio): SpaceUI {
  return {
    id: espacio.id_espacio,
    name: espacio.nombre,
    location: espacio.ubicacion || '',
    capacity: espacio.capacidad,
    status: normalizeSpaceStatus(espacio.estado),
  };
}

export function mapUsuario(usuario: Usuario): UserUI {
  return {
    id: usuario.id_usuario,
    name: usuario.nombre,
    email: usuario.correo,
    role: usuario.rol === 'admin' ? 'Administrador' : 'Usuario',
  };
}

export function formatTime(value: string): string {
  return value.length >= 5 ? value.slice(0, 5) : value;
}

export function mapReserva(
  reserva: Reserva,
  espacios: SpaceUI[],
  usuarios: UserUI[],
): ReservationUI {
  const espacio = espacios.find((e) => e.id === reserva.id_espacio);
  const usuario = usuarios.find((u) => u.id === reserva.id_usuario);

  return {
    id: `R${String(reserva.id_reserva).padStart(3, '0')}`,
    id_reserva: reserva.id_reserva,
    user: usuario?.name || `Usuario #${reserva.id_usuario}`,
    space: espacio?.name || `Espacio #${reserva.id_espacio}`,
    date: reserva.fecha,
    start: formatTime(reserva.hora_inicio),
    end: formatTime(reserva.hora_fin),
    attendees: reserva.cantidad_asistentes,
    status: reserva.estado,
  };
}
