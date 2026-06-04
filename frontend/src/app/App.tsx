import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { ApiError } from '../services/api';
import {
  Calendar,
  MapPin,
  User,
  LogOut,
  Settings,
  Users,
  Bell,
  Menu,
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  Clock,
  TriangleAlert,
  Search,
  ChevronRight,
  Eye,
  CircleX,
  LayoutDashboard,
  Filter,
  CircleCheck
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#1E293B', '#8B5CF6', '#EC4899'];

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function buildChartData(reservations: ReturnType<typeof useApp>['reservations']) {
  // Reservations per weekday from all data
  const counts: Record<string, number> = { Lun: 0, Mar: 0, Mié: 0, Jue: 0, Vie: 0, Sáb: 0, Dom: 0 };
  reservations.forEach(r => {
    const d = new Date(r.date + 'T00:00:00');
    const name = DAY_NAMES[d.getDay()];
    if (name in counts) counts[name] = (counts[name] || 0) + 1;
  });
  return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((name, i) => ({
    id: String(i + 1),
    name,
    reservas: counts[name] || 0,
  }));
}

function buildSpacesChartData(reservations: ReturnType<typeof useApp>['reservations']) {
  const counts: Record<string, number> = {};
  reservations.forEach(r => {
    const name = r.space;
    counts[name] = (counts[name] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], i) => ({ id: String(i), name, value }));
}

// --- COMPONENTS ---

const StatusBadge = ({ status, type = 'space' }: { status: string, type?: 'space' | 'reservation' }) => {
  const getStyles = () => {
    if (type === 'space') {
      switch (status) {
        case 'activo': return 'bg-success/10 text-success border-success/20';
        case 'inactivo': return 'bg-muted text-muted-foreground border-border';
        case 'mantenimiento': return 'bg-warning/10 text-warning border-warning/20';
        case 'no disponible': return 'bg-error/10 text-error border-error/20';
        default: return 'bg-muted text-muted-foreground border-border';
      }
    } else {
      switch (status) {
        case 'aprobada': return 'bg-success/10 text-success border-success/20';
        case 'esperando': return 'bg-warning/10 text-warning border-warning/20';
        case 'rechazada': return 'bg-error/10 text-error border-error/20';
        default: return 'bg-muted text-muted-foreground border-border';
      }
    }
  };

  const labels: Record<string, string> = {
    'activo': 'Activo',
    'inactivo': 'Inactivo',
    'mantenimiento': 'Mantenimiento',
    'no disponible': 'No Disponible',
    'aprobada': 'Aprobada',
    'esperando': 'Esperando',
    'rechazada': 'Rechazada'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStyles()}`}>
      {labels[status] || status}
    </span>
  );
};

const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center space-x-4">
    <div className={`p-4 rounded-xl ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
    </div>
  </div>
);

// --- SCREENS ---

const Splash = ({ onNext }: { onNext: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center min-h-screen bg-primary text-primary-foreground p-6 relative overflow-hidden"
  >
    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
    
    <motion.div 
      initial={{ scale: 0.8, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring' }}
      className="p-5 bg-white rounded-3xl shadow-2xl mb-8 relative z-10"
    >
      <div className="bg-primary/10 p-4 rounded-2xl">
        <Calendar className="w-16 h-16 text-primary" />
      </div>
    </motion.div>
    
    <motion.h1 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight"
    >
      ReservaSpace
    </motion.h1>
    
    <motion.p 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="text-primary-foreground/80 mb-12 text-center max-w-sm text-lg"
    >
      Gestiona espacios institucionales fácilmente
    </motion.p>
    
    <motion.button 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      onClick={onNext} 
      className="bg-white text-primary px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-xl relative z-10"
    >
      Comenzar
    </motion.button>
  </motion.div>
);

const Login = ({ onLogin, onGoRegister }: { onLogin: (role: 'user' | 'admin') => void, onGoRegister: () => void }) => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    if (!email.includes('@')) {
      toast.error('Correo inválido');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      const role = await login(email, password);
      toast.success('Inicio de sesión exitoso');
      onLogin(role);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo iniciar sesión';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Calendar className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
          Bienvenido de nuevo
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Inicia sesión en tu cuenta
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Correo institucional
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  className="block w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@institucion.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  className="block w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary/80">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full justify-center rounded-xl border border-transparent bg-primary py-3 px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60"
              >
                {submitting ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <button onClick={onGoRegister} className="font-medium text-primary hover:text-primary/80">
                Regístrate
              </button>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Register = ({ onGoLogin }: { onGoLogin: () => void }) => {
  const { register } = useApp();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.confirm) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    if (formData.password !== formData.confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Cuenta creada exitosamente. Ya puedes iniciar sesión.');
      onGoLogin();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo crear la cuenta';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
          Crear cuenta
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-border">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-foreground">Nombre completo</label>
              <div className="mt-1">
                <input
                  type="text"
                  className="block w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Correo institucional</label>
              <div className="mt-1">
                <input
                  type="email"
                  className="block w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Contraseña</label>
              <div className="mt-1">
                <input
                  type="password"
                  className="block w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Confirmar contraseña</label>
              <div className="mt-1">
                <input
                  type="password"
                  className="block w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                  value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full justify-center rounded-xl border border-transparent bg-primary py-3 px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mt-6 disabled:opacity-60"
              >
                {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <button onClick={onGoLogin} className="font-medium text-primary hover:text-primary/80">
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- USER VIEWS ---

const UserDashboard = ({ onChangeView }: { onChangeView: (view: string) => void }) => {
  const { spaces, reservations } = useApp();
  const activeSpaces = spaces.filter((s) => s.status === 'activo');
  const pending = reservations.filter((r) => r.status === 'esperando').length;
  const approved = reservations.filter((r) => r.status === 'aprobada').length;
  const rejected = reservations.filter((r) => r.status === 'rechazada').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Espacios Disponibles" value={String(activeSpaces.length)} icon={MapPin} colorClass="bg-primary/10 text-primary" />
        <StatCard title="Reservas Pendientes" value={String(pending)} icon={Clock} colorClass="bg-warning/10 text-warning" />
        <StatCard title="Reservas Aprobadas" value={String(approved)} icon={CircleCheck} colorClass="bg-success/10 text-success" />
        <StatCard title="Reservas Rechazadas" value={String(rejected)} icon={CircleX} colorClass="bg-error/10 text-error" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Espacios disponibles</h2>
          <button onClick={() => onChangeView('user_spaces')} className="text-sm text-primary font-medium hover:underline flex items-center">
            Ver todos <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSpaces.slice(0, 6).map(space => (
            <div key={space.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-32 bg-muted relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <h3 className="text-white font-bold text-lg">{space.name}</h3>
                  <StatusBadge status={space.status} />
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" /> {space.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2" /> Capacidad: {space.capacity} personas
                </div>
                <button 
                  onClick={() => space.status === 'activo' ? onChangeView('user_create') : toast.error('Espacio no disponible')}
                  className={`w-full py-2.5 rounded-xl font-medium mt-2 transition-colors ${
                    space.status === 'activo' 
                      ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  Reservar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UserSpaces = ({ onChangeView }: { onChangeView: (view: string) => void }) => {
  const { spaces } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSpaces = spaces.filter(space => 
    space.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    space.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Catálogo de Espacios</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar espacio o ubicación..." 
            className="w-full sm:w-72 pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpaces.map(space => (
          <div key={space.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
            <div className="h-40 bg-muted relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <h3 className="text-white font-bold text-lg leading-tight">{space.name}</h3>
                <StatusBadge status={space.status} />
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="space-y-3 mb-4 flex-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" /> {space.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2" /> Capacidad: {space.capacity} personas
                </div>
              </div>
              <button 
                onClick={() => space.status === 'activo' ? onChangeView('user_create') : toast.error('Espacio no disponible')}
                className={`w-full py-2.5 rounded-xl font-medium transition-colors mt-auto ${
                  space.status === 'activo' 
                    ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white' 
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                Reservar
              </button>
            </div>
          </div>
        ))}
        
        {filteredSpaces.length === 0 && (
          <div className="col-span-full py-12 text-center bg-card border border-border rounded-2xl">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No se encontraron espacios</h3>
            <p className="text-muted-foreground mt-1">Intenta con otros términos de búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateReservation = ({ onBack }: { onBack: () => void }) => {
  const { spaces, createReservation } = useApp();
  const [formData, setFormData] = useState({
    space: '',
    date: '',
    start: '',
    end: '',
    attendees: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.space || !formData.date || !formData.start || !formData.end || !formData.attendees) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const space = spaces.find(s => s.id.toString() === formData.space);
    if (!space) return;

    if (parseInt(formData.attendees) > space.capacity) {
      toast.error(`La capacidad excede el límite del espacio (${space.capacity} personas)`);
      return;
    }

    if (formData.start >= formData.end) {
      toast.error('La hora de inicio debe ser menor a la hora de fin');
      return;
    }

    setSubmitting(true);
    try {
      await createReservation({
        id_espacio: space.id,
        fecha: formData.date,
        hora_inicio: formData.start,
        hora_fin: formData.end,
        cantidad_asistentes: parseInt(formData.attendees, 10),
      });
      toast.success('Reserva creada exitosamente');
      onBack();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo crear la reserva';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 p-2 hover:bg-muted rounded-full">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <h2 className="text-2xl font-bold text-foreground">Crear Reserva</h2>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Seleccionar espacio</label>
            <select 
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:ring-primary focus:border-primary"
              value={formData.space}
              onChange={e => setFormData({...formData, space: e.target.value})}
            >
              <option value="">Seleccione un espacio...</option>
              {spaces.filter(s => s.status === 'activo').map(s => (
                <option key={s.id} value={s.id}>{s.name} (Cap. {s.capacity})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Fecha</label>
              <input 
                type="date" 
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:ring-primary focus:border-primary"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
              <p className="text-xs text-muted-foreground mt-1">Mínimo 24h de anticipación</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cantidad de asistentes</label>
              <input 
                type="number" 
                min="1"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:ring-primary focus:border-primary"
                value={formData.attendees}
                onChange={e => setFormData({...formData, attendees: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Hora inicio</label>
              <input 
                type="time" 
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:ring-primary focus:border-primary"
                value={formData.start}
                onChange={e => setFormData({...formData, start: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Hora fin</label>
              <input 
                type="time" 
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:ring-primary focus:border-primary"
                value={formData.end}
                onChange={e => setFormData({...formData, end: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl flex items-start space-x-3 text-sm text-primary-foreground/80 mt-4 border border-primary/10">
            <TriangleAlert className="w-5 h-5 text-primary shrink-0" />
            <div className="text-primary/90">
              <p className="font-semibold mb-1">Horarios permitidos:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Lunes a Viernes: 7:00 AM – 8:00 PM</li>
                <li>Sábados: 8:00 AM – 12:00 PM</li>
                <li>Domingos: No permitido</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onBack} className="px-6 py-3 rounded-xl border border-border font-medium hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-60">
              {submitting ? 'Guardando...' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MyReservations = () => {
  const { reservations, cancelReservation } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMyReservations = reservations.filter(r => 
      r.space.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Mis Reservas</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar reserva..." 
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Espacio</th>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Asistentes</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMyReservations.map((res) => (
                <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{res.id}</td>
                  <td className="px-6 py-4">{res.space}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{res.date}</div>
                    <div className="text-muted-foreground text-xs">{res.start} - {res.end}</div>
                  </td>
                  <td className="px-6 py-4">{res.attendees}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={res.status} type="reservation" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Ver detalle">
                        <Eye className="w-4 h-4" />
                      </button>
                      {res.status === 'esperando' && (
                        <button
                          onClick={async () => {
                            try {
                              await cancelReservation(res.id_reserva);
                              toast.success('Reserva cancelada');
                            } catch (error) {
                              const message = error instanceof ApiError ? error.message : 'No se pudo cancelar';
                              toast.error(message);
                            }
                          }}
                          className="p-2 text-muted-foreground hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Cancelar reserva"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando {filteredMyReservations.length} resultado(s)</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-border rounded-lg hover:bg-muted disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 border border-border rounded-lg bg-primary text-white">1</button>
            <button className="px-3 py-1 border border-border rounded-lg hover:bg-muted disabled:opacity-50" disabled>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { user } = useApp();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Mi Perfil</h2>
      
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-8 items-start">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center border-4 border-background shadow-lg">
            <User className="w-16 h-16 text-primary" />
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-primary/10 text-primary border-primary/20">
            {user?.rol === 'admin' ? 'Administrador' : 'Usuario'}
          </span>
        </div>
        
        <div className="flex-1 space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre completo</label>
              <div className="text-lg font-semibold text-foreground">{user?.nombre || '-'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Correo institucional</label>
              <div className="text-lg font-semibold text-foreground">{user?.correo || '-'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Rol</label>
              <div className="text-lg font-semibold text-foreground">{user?.rol === 'admin' ? 'Administrador' : 'Usuario'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">ID de usuario</label>
              <div className="text-lg font-semibold text-foreground">{user?.id_usuario ?? '-'}</div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-border flex flex-wrap gap-4">
            <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center">
              <Pencil className="w-4 h-4 mr-2" /> Editar perfil
            </button>
            <button className="px-6 py-2.5 border border-border rounded-xl font-medium hover:bg-muted transition-colors">
              Cambiar contraseña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN VIEWS ---

const AdminDashboard = () => {
  const { users, spaces, reservations } = useApp();
  const activeSpaces = spaces.filter((s) => s.status === 'activo').length;
  const pending = reservations.filter((r) => r.status === 'esperando').length;
  const approved = reservations.filter((r) => r.status === 'aprobada').length;

  const chartData = buildChartData(reservations);
  const spacesChartData = buildSpacesChartData(reservations);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Usuarios Registrados" value={String(users.length)} icon={Users} colorClass="bg-blue-100 text-blue-600" />
        <StatCard title="Espacios Activos" value={String(activeSpaces)} icon={MapPin} colorClass="bg-green-100 text-green-600" />
        <StatCard title="Reservas Pendientes" value={String(pending)} icon={Clock} colorClass="bg-amber-100 text-amber-600" />
        <StatCard title="Reservas Aprobadas" value={String(approved)} icon={CircleCheck} colorClass="bg-purple-100 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Reservas por día</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} id="reservations-chart">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} allowDecimals={false} />
                <Tooltip cursor={{fill: 'var(--muted)'}} contentStyle={{borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="reservas" fill="var(--primary)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Reservas por espacio</h3>
          {spacesChartData.length > 0 ? (
            <>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart id="spaces-chart">
                    <Pie
                      data={spacesChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {spacesChartData.map((entry, index) => (
                        <Cell key={`pie-cell-${entry.id}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {spacesChartData.map((entry, index) => (
                  <div key={entry.id} className="flex items-center text-sm text-muted-foreground">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="truncate max-w-[120px]">{entry.name}</span>
                    <span className="ml-1 font-medium text-foreground">({entry.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Sin reservas registradas</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SpaceModal = ({
  title,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  initial: { name: string; location: string; capacity: string; status: string };
  onClose: () => void;
  onSave: (data: { name: string; location: string; capacity: string; status: string }) => Promise<void>;
}) => {
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.capacity) {
      toast.error('Nombre y capacidad son obligatorios');
      return;
    }
    setSubmitting(true);
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo guardar el espacio';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-border"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Ubicación</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 focus:ring-primary focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Capacidad</label>
              <input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Estado</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 focus:ring-primary focus:border-primary">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="no disponible">No disponible</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border font-medium hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-60">{submitting ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AdminSpaces = () => {
  const { spaces, createSpace, updateSpace } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [editSpace, setEditSpace] = useState<typeof spaces[0] | null>(null);

  const emptyForm = { name: '', location: '', capacity: '', status: 'activo' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Espacios</h2>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Agregar Espacio
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Ubicación</th>
                <th className="px-6 py-4">Capacidad</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {spaces.map((space) => (
                <tr key={space.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{space.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{space.location}</td>
                  <td className="px-6 py-4">{space.capacity} pax</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={space.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditSpace(space)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <SpaceModal
          title="Nuevo Espacio"
          initial={emptyForm}
          onClose={() => setShowCreate(false)}
          onSave={async (data) => {
            await createSpace({ ...data, capacity: parseInt(data.capacity, 10) });
            toast.success('Espacio creado exitosamente');
          }}
        />
      )}

      {editSpace && (
        <SpaceModal
          title="Editar Espacio"
          initial={{
            name: editSpace.name,
            location: editSpace.location,
            capacity: String(editSpace.capacity),
            status: editSpace.status,
          }}
          onClose={() => setEditSpace(null)}
          onSave={async (data) => {
            await updateSpace(editSpace.id, { ...data, capacity: parseInt(data.capacity, 10) });
            toast.success('Espacio actualizado exitosamente');
            setEditSpace(null);
          }}
        />
      )}
    </div>
  );
};

const AdminReservations = () => {
  const { reservations, updateReservationStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReservations = reservations.filter(res => 
    res.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    res.space.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Reservas</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 border border-border rounded-xl hover:bg-muted text-muted-foreground">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Espacio</th>
                <th className="px-6 py-4">Fecha/Hora</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{res.user}</td>
                  <td className="px-6 py-4 text-muted-foreground">{res.space}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{res.date}</div>
                    <div className="text-muted-foreground text-xs">{res.start} - {res.end}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={res.status} type="reservation" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Ver detalle">
                        <Eye className="w-4 h-4" />
                      </button>
                      {res.status === 'esperando' && (
                        <>
                          <button
                            onClick={async () => {
                              try {
                                await updateReservationStatus(res.id_reserva, 'aprobada');
                                toast.success('Reserva aprobada');
                              } catch (error) {
                                const message = error instanceof ApiError ? error.message : 'No se pudo aprobar';
                                toast.error(message);
                              }
                            }}
                            className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                            title="Aprobar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await updateReservationStatus(res.id_reserva, 'rechazada');
                                toast.success('Reserva rechazada');
                              } catch (error) {
                                const message = error instanceof ApiError ? error.message : 'No se pudo rechazar';
                                toast.error(message);
                              }
                            }}
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                            title="Rechazar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


const AdminUsers = () => {
  const { users } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2.5 bg-card border border-border text-foreground rounded-xl font-medium hover:bg-muted flex items-center transition-colors">
            <Filter className="w-4 h-4 mr-2" /> Filtros
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Último acceso</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-muted-foreground text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{user.role}</td>
                  <td className="px-6 py-4 text-muted-foreground">—</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-success/10 text-success border-success/20">
                      Activo
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Ver">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


const AdminSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Configuración del Sistema</h2>
      
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Reglas de Negocio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Anticipación mínima (horas)</label>
              <input type="number" defaultValue={24} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Días de antelación máxima</label>
              <input type="number" defaultValue={30} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 focus:ring-primary focus:border-primary" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Horarios Operativos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div>
                <div className="font-medium">Lunes a Viernes</div>
                <div className="text-sm text-muted-foreground">07:00 AM - 08:00 PM</div>
              </div>
              <button className="text-primary hover:underline text-sm font-medium">Editar</button>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div>
                <div className="font-medium">Sábados</div>
                <div className="text-sm text-muted-foreground">08:00 AM - 12:00 PM</div>
              </div>
              <button className="text-primary hover:underline text-sm font-medium">Editar</button>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/30">
              <div>
                <div className="font-medium">Domingos</div>
                <div className="text-sm text-error">Cerrado</div>
              </div>
              <button className="text-primary hover:underline text-sm font-medium">Editar</button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex justify-end">
          <button onClick={() => toast.success('Configuración guardada')} className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

// --- LAYOUTS ---

const MainLayout = ({ 
  children, 
  role, 
  currentView, 
  onChangeView, 
  onLogout 
}: { 
  children: React.ReactNode, 
  role: 'user' | 'admin', 
  currentView: string,
  onChangeView: (v: string) => void,
  onLogout: () => void
}) => {
  const { user } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = role === 'admin' ? [
    { id: 'admin_home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin_users', label: 'Usuarios', icon: Users },
    { id: 'admin_spaces', label: 'Espacios', icon: MapPin },
    { id: 'admin_reservations', label: 'Reservas', icon: Calendar },
    { id: 'admin_settings', label: 'Configuración', icon: Settings },
  ] : [
    { id: 'user_home', label: 'Inicio', icon: LayoutDashboard },
    { id: 'user_spaces', label: 'Espacios', icon: MapPin },
    { id: 'user_reservations', label: 'Mis Reservas', icon: Calendar },
    { id: 'user_profile', label: 'Mi Perfil', icon: User },
  ];

  const handleNavClick = (id: string) => {
    // Si no está implementado, mostramos toast
    const implemented = ['user_home', 'user_spaces', 'user_reservations', 'user_profile', 'admin_home', 'admin_users', 'admin_spaces', 'admin_reservations', 'admin_settings'];
    if (implemented.includes(id)) {
      onChangeView(id);
    } else {
      toast.info('Sección en desarrollo');
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg"><Calendar className="w-5 h-5 text-white" /></div>
          <span className="font-bold text-lg">ReservaSpace</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-muted rounded-lg">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:relative md:h-screen md:sticky md:top-0
      `}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl"><Calendar className="w-6 h-6 text-white" /></div>
          <span className="font-bold text-xl tracking-tight text-foreground">ReservaSpace</span>
        </div>
        
        <div className="flex-1 px-4 py-6 md:py-2 space-y-1 overflow-y-auto mt-16 md:mt-0">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Menú principal</p>
          {navItems.map(item => {
            const isActive = currentView === item.id || (currentView === 'user_create' && item.id === 'user_home');
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-colors font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar Desktop */}
        <header className="hidden md:flex bg-card border-b border-border h-20 items-center justify-between px-8 sticky top-0 z-20">
          <h1 className="text-xl font-bold text-foreground capitalize">
            {role === 'admin' ? 'Panel de Administración' : 'Portal de Usuario'}
          </h1>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-card"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-border relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {user?.nombre || (role === 'admin' ? 'Administrador' : 'Usuario')}
                  </p>
                  <p className="text-xs text-muted-foreground">{role === 'admin' ? 'Administrador' : 'Usuario'}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <User className="w-5 h-5 text-primary" />
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute top-14 right-0 w-64 bg-card border border-border rounded-xl shadow-lg z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">{user?.nombre}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.correo}</p>
                    </div>
                    
                    <div className="px-4 py-2 mt-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Detalles de la sesión</div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Estado:</span>
                          <span className="text-success font-medium flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-success"></div> Activo
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Último acceso:</span>
                          <span className="text-foreground">Hace 2 mins</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Permisos:</span>
                          <span className="text-foreground">{role === 'admin' ? 'Completos' : 'Lectura/Reserva'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border mt-2 pt-2">
                      <button 
                        onClick={() => {
                          setProfileOpen(false);
                          if(role === 'user') onChangeView('user_profile');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" /> Configuración
                      </button>
                      <button 
                        onClick={() => {
                          setProfileOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  const { role: authRole, logout: authLogout, loading, user } = useApp();
  const [view, setView] = useState('splash');
  const [role, setRole] = useState<'user' | 'admin' | null>(null);

  React.useEffect(() => {
    if (user && authRole) {
      setRole(authRole);
      setView(authRole === 'admin' ? 'admin_home' : 'user_home');
    }
  }, [user, authRole]);

  const handleLogin = (r: 'user' | 'admin') => {
    setRole(r);
    setView(r === 'admin' ? 'admin_home' : 'user_home');
  };

  const handleLogout = () => {
    authLogout();
    setRole(null);
    setView('login');
  };

  if (loading && !view.startsWith('splash') && view !== 'login' && view !== 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Cargando...
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors theme="light" />
      <AnimatePresence mode="wait">
        {view === 'splash' && <Splash key="splash" onNext={() => setView('login')} />}
        {view === 'login' && <Login key="login" onLogin={handleLogin} onGoRegister={() => setView('register')} />}
        {view === 'register' && <Register key="register" onGoLogin={() => setView('login')} />}
        
        {role && ['user_home', 'user_spaces', 'user_create', 'user_reservations', 'user_profile', 'admin_home', 'admin_users', 'admin_spaces', 'admin_reservations', 'admin_settings'].includes(view) && (
          <MainLayout role={role} currentView={view} onChangeView={setView} onLogout={handleLogout}>
            {view === 'user_home' && <UserDashboard onChangeView={setView} />}
            {view === 'user_spaces' && <UserSpaces onChangeView={setView} />}
            {view === 'user_create' && <CreateReservation onBack={() => setView('user_spaces')} />}
            {view === 'user_reservations' && <MyReservations />}
            {view === 'user_profile' && <UserProfile />}
            
            {view === 'admin_home' && <AdminDashboard />}
            {view === 'admin_users' && <AdminUsers />}
            {view === 'admin_spaces' && <AdminSpaces />}
            {view === 'admin_reservations' && <AdminReservations />}
            {view === 'admin_settings' && <AdminSettings />}
          </MainLayout>
        )}
      </AnimatePresence>
    </>
  );
}
