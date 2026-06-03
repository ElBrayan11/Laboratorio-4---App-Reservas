import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';
import { api, ApiError, getToken, setToken } from '../services/api';
import type { ReservationUI, SpaceUI, UserUI, Usuario } from '../types/api';
import { mapEspacio, mapReserva, mapUsuario, toApiSpaceStatus } from '../lib/mappers';

interface AppContextValue {
  user: Usuario | null;
  role: 'user' | 'admin' | null;
  spaces: SpaceUI[];
  reservations: ReservationUI[];
  users: UserUI[];
  loading: boolean;
  login: (correo: string, password: string) => Promise<'user' | 'admin'>;
  logout: () => void;
  register: (nombre: string, correo: string, password: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  createSpace: (data: {
    name: string;
    location: string;
    capacity: number;
    status: string;
  }) => Promise<void>;
  updateSpace: (id: number, data: {
    name: string;
    location: string;
    capacity: number;
    status: string;
  }) => Promise<void>;
  createReservation: (data: {
    id_espacio: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    cantidad_asistentes: number;
  }) => Promise<void>;
  updateReservationStatus: (id: number, estado: string) => Promise<void>;
  cancelReservation: (id: number) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [spaces, setSpaces] = useState<SpaceUI[]>([]);
  const [rawReservas, setRawReservas] = useState<Awaited<ReturnType<typeof api.myReservas>>>([]);
  const [users, setUsers] = useState<UserUI[]>([]);
  const [loading, setLoading] = useState(false);

  const role = user?.rol === 'admin' ? 'admin' : user ? 'user' : null;

  const reservations = useMemo(
    () => rawReservas.map((r) => mapReserva(r, spaces, users)),
    [rawReservas, spaces, users],
  );

  const loadEspacios = useCallback(async () => {
    const data = await api.listEspacios();
    setSpaces(data.map(mapEspacio));
  }, []);

  const loadReservas = useCallback(
    async (currentRole: 'user' | 'admin') => {
      const data =
        currentRole === 'admin' ? await api.listReservas() : await api.myReservas();
      setRawReservas(data);
    },
    [],
  );

  const loadUsuarios = useCallback(async () => {
    const data = await api.listUsuarios();
    setUsers(data.map(mapUsuario));
  }, []);

  const refreshAll = useCallback(async () => {
    if (!getToken() || !role) return;
    setLoading(true);
    try {
      await loadEspacios();
      if (role === 'admin') {
        await loadUsuarios();
      }
      await loadReservas(role);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Error al cargar datos';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [role, loadEspacios, loadReservas, loadUsuarios]);

  const login = useCallback(async (correo: string, password: string) => {
    const response = await api.login(correo, password);
    setToken(response.access_token);
    const me = await api.me();
    setUser(me);
    const userRole = me.rol === 'admin' ? 'admin' : 'user';

    await loadEspacios();
    if (userRole === 'admin') {
      await loadUsuarios();
    } else {
      setUsers([mapUsuario(me)]);
    }
    await loadReservas(userRole);

    return userRole;
  }, [loadEspacios, loadReservas, loadUsuarios]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSpaces([]);
    setRawReservas([]);
    setUsers([]);
  }, []);

  const register = useCallback(async (nombre: string, correo: string, password: string) => {
    await api.register(nombre, correo, password);
  }, []);

  const createSpace = useCallback(
    async (data: { name: string; location: string; capacity: number; status: string }) => {
      await api.createEspacio({
        nombre: data.name,
        ubicacion: data.location,
        capacidad: data.capacity,
        estado: toApiSpaceStatus(data.status),
      });
      await loadEspacios();
    },
    [loadEspacios],
  );

  const updateSpace = useCallback(
    async (id: number, data: { name: string; location: string; capacity: number; status: string }) => {
      await api.updateEspacio(id, {
        nombre: data.name,
        ubicacion: data.location,
        capacidad: data.capacity,
        estado: toApiSpaceStatus(data.status),
      });
      await loadEspacios();
    },
    [loadEspacios],
  );

  const createReservation = useCallback(
    async (data: {
      id_espacio: number;
      fecha: string;
      hora_inicio: string;
      hora_fin: string;
      cantidad_asistentes: number;
    }) => {
      await api.createReserva({
        ...data,
        hora_inicio: data.hora_inicio.length === 5 ? `${data.hora_inicio}:00` : data.hora_inicio,
        hora_fin: data.hora_fin.length === 5 ? `${data.hora_fin}:00` : data.hora_fin,
      });
      if (role) await loadReservas(role);
    },
    [loadReservas, role],
  );

  const updateReservationStatus = useCallback(
    async (id: number, estado: string) => {
      await api.updateReservaEstado(id, estado);
      if (role) await loadReservas(role);
    },
    [loadReservas, role],
  );

  const cancelReservation = useCallback(
    async (id: number) => {
      await api.cancelReserva(id);
      if (role) await loadReservas(role);
    },
    [loadReservas, role],
  );

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    (async () => {
      setLoading(true);
      try {
        const me = await api.me();
        setUser(me);
        const userRole = me.rol === 'admin' ? 'admin' : 'user';
        await loadEspacios();
        if (userRole === 'admin') {
          await loadUsuarios();
        } else {
          setUsers([mapUsuario(me)]);
        }
        await loadReservas(userRole);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadEspacios, loadReservas, loadUsuarios]);

  const value: AppContextValue = {
    user,
    role,
    spaces,
    reservations,
    users,
    loading,
    login,
    logout,
    register,
    refreshAll,
    createSpace,
    updateSpace,
    createReservation,
    updateReservationStatus,
    cancelReservation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return ctx;
}
