import type { Espacio, LoginResponse, Reserva, Usuario } from '../types/api';

// VITE_API_URL="" en Docker → rutas relativas /api (nginx proxy). En dev, proxy de Vite.
function resolveApiUrl(): string {
  const env = import.meta.env.VITE_API_URL;
  if (env === '') return '';
  if (typeof env === 'string' && env.length > 0) return env.replace(/\/$/, '');
  if (import.meta.env.DEV) return '';
  return 'http://localhost:8000';
}

const API_URL = resolveApiUrl();
const TOKEN_KEY = 'reservas_token';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (auth) {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const isFormBody =
    options.body instanceof FormData || options.body instanceof URLSearchParams;

  if (options.body && !isFormBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'Error en la solicitud';
    try {
      const data = await response.json();
      if (Array.isArray(data.detail)) {
        message =
          data.detail
            .map((e: { msg?: string; loc?: string[] }) => e.msg)
            .filter(Boolean)
            .join('. ') || message;
      } else {
        message = data.detail ?? message;
      }
      if (typeof message !== 'string') {
        message = JSON.stringify(message);
      }
    } catch {
      message = response.statusText || message;
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  login(correo: string, password: string) {
    const body = new URLSearchParams({
      username: correo,
      password,
    });

    return request<LoginResponse>(
      '/api/auth/token',
      {
        method: 'POST',
        body,
      },
      false,
    );
  },

  me() {
    return request<Usuario>('/api/auth/me');
  },

  register(nombre: string, correo: string, password: string) {
    return request<Usuario>(
      '/api/usuarios/register',
      {
        method: 'POST',
        body: JSON.stringify({ nombre, correo, password }),
      },
      false,
    );
  },

  listEspacios() {
    return request<Espacio[]>('/api/espacios/');
  },

  createEspacio(data: {
    nombre: string;
    ubicacion?: string;
    capacidad: number;
    estado: string;
  }) {
    return request<Espacio>('/api/espacios/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEspacio(
    id: number,
    data: { nombre: string; ubicacion?: string; capacidad: number; estado: string },
  ) {
    return request<Espacio>(`/api/espacios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  listReservas() {
    return request<Reserva[]>('/api/reservas/');
  },

  myReservas() {
    return request<Reserva[]>('/api/reservas/me');
  },

  createReserva(data: {
    id_espacio: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    cantidad_asistentes: number;
  }) {
    return request<Reserva>('/api/reservas/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateReservaEstado(id: number, estado: string) {
    return request<Reserva>(`/api/reservas/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    });
  },

  cancelReserva(id: number) {
    return request<Reserva>(`/api/reservas/${id}/cancel`, { method: 'POST' });
  },

  listUsuarios() {
    return request<Usuario[]>('/api/usuarios/');
  },
};
