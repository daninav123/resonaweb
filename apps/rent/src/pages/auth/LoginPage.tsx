import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import SEOHead from '../../components/SEO/SEOHead';

const LoginPage = () => {
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
    <>
      <SEOHead
        title="Iniciar sesión | ReSona Rent"
        description="Accede a tu cuenta de ReSona Rent para gestionar tus pedidos de alquiler."
        canonicalUrl="https://resonarent.com/login"
        noindex
      />
      <div className="min-h-screen bg-ink flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold text-cream">
          Inicia sesión en tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-cream/65">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-resona-light hover:text-blue-500"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-ink-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-cream/75">
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
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-cream/15 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@email.com"
                />
                <Mail className="h-5 w-5 text-cream/45 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cream/75">
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
                  className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-cream/15 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <Lock className="h-5 w-5 text-cream/45 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-cream/45 hover:text-gray-500"
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
                  className="h-4 w-4 text-resona-light focus:ring-blue-500 border-cream/15 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-cream">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-resona-light hover:text-blue-500"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-resona hover:bg-resona-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cream/15" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-ink-800 text-cream/50">O continúa con</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-cream/15 rounded-md shadow-sm bg-ink-800 text-sm font-medium text-cream/50 hover:bg-white/5"
              >
                Google
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-cream/15 rounded-md shadow-sm bg-ink-800 text-sm font-medium text-cream/50 hover:bg-white/5"
              >
                Facebook
              </button>
            </div>
          </div>

        </div>
      </div>
      </div>
    </>
  );
};

export default LoginPage;
