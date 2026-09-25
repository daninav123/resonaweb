import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout/Layout';

const LoginPage = () => {
  // Evitar indexación de página de login
  useEffect(() => {
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);
    
    return () => {
      document.head.removeChild(metaRobots);
    };
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Aceptar tanto { from: '/path' } como { from: { pathname: '/path' } }
  const from = typeof location.state?.from === 'string' 
    ? location.state.from 
    : location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // console.log('🔐 Intentando login...', { 
    //   email: formData.email,
    //   redirectTo: from 
    // });
    
    const success = await login(formData.email, formData.password);
    
    if (success) {
      // console.log('✅ Login exitoso - redirigiendo a:', from);
      navigate(from, { replace: true });
    }
    // Login fallido se maneja en el store con toast
  };

  return (
    <Layout>
      <div className="flex min-h-screen flex-col justify-center bg-paper px-5 pb-24 pt-36 sm:px-6 md:pt-44 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-center text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink md:text-[42px]">
          Inicia sesión en tu cuenta
        </h1>
        <p className="mt-2 text-center text-sm text-ink-600">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-accent-700 hover:text-accent-600"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-1 py-2">
          {error && (
            <div className="mb-5 rounded-sm border border-ink/15 bg-paper-200 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-accent-400" />
                <div className="ml-3">
                  <p className="text-sm text-accent-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700">
                Correo electrónico
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block h-12 w-full appearance-none rounded-sm border border-ink/15 bg-transparent pl-10 pr-3 text-[15px] text-ink placeholder:text-ink-400 focus:border-ink focus:outline-none"
                  placeholder="tu@email.com"
                />
                <Mail className="h-5 w-5 text-ink-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block h-12 w-full appearance-none rounded-sm border border-ink/15 bg-transparent pl-10 pr-10 text-[15px] text-ink placeholder:text-ink-400 focus:border-ink focus:outline-none"
                  placeholder="••••••••"
                />
                <Lock className="h-5 w-5 text-ink-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-ink-400 hover:text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-accent-700 focus:ring-accent-600 border-paper-400 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-ink">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-accent-700 hover:text-accent-600"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-full bg-ink text-[15px] font-medium text-cream-100 transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-paper-400" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-paper-50 text-ink-500">O continúa con</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-ink/20 text-[14px] text-ink-700 transition-colors hover:border-ink/40 hover:text-ink"
              >
                Google
              </button>
              <button
                type="button"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-ink/20 text-[14px] text-ink-700 transition-colors hover:border-ink/40 hover:text-ink"
              >
                Facebook
              </button>
            </div>
          </div>

        </div>
      </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
