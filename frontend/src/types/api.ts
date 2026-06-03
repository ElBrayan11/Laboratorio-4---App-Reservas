export interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: 'admin' | 'usuario';
}

export interface Espacio {
  id_espacio: number;
  nombre: string;
  ubicacion: string | null;
  capacidad: number;
  estado: string;
}

export interface Reserva {
  id_reserva: number;
  id_usuario: number;
  id_espacio: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  cantidad_asistentes: number;
  estado: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  rol: string;
  nombre: string;
  correo: string;
  id_usuario: number;
}

export interface SpaceUI {
  id: number;
  name: string;
  location: string;
  capacity: number;
  status: string;
}

export interface ReservationUI {
  id: string;
  id_reserva: number;
  user: string;
  space: string;
  date: string;
  start: string;
  end: string;
  attendees: number;
  status: string;
}

export interface UserUI {
  id: number;
  name: string;
  email: string;
  role: string;
}
