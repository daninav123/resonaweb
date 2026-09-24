import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout/Layout';

const RegisterPage = () => {
  // Evitar indexación de página de registro
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
  const { register, loading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    acceptTerms: false,
    acceptPrivacy: false, // RGPD: Política de Privacidad (obligatorio)
    acceptMarketing: false, // RGPD: Comunicaciones comerciales (opcional)
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = () => {
    const errors = [];
    
    if (!formData.firstName.trim()) errors.push('El nombre es obligatorio');
    if (!formData.lastName.trim()) errors.push('El apellido es obligatorio');
    if (!formData.email.trim()) errors.push('El email es obligatorio');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('El email no es válido');
    }
    if (formData.password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (formData.password !== formData.confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }
    if (!formData.acceptTerms) {
      errors.push('Debes aceptar los términos y condiciones');
    }
    if (!formData.acceptPrivacy) {
      errors.push('Debes aceptar la Política de Privacidad (obligatorio por RGPD)');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const success = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || undefined,
      // RGPD: Enviar consentimientos
      acceptPrivacy: formData.acceptPrivacy,
      acceptMarketing: formData.acceptMarketing,
    });
    
    if (success) {
      navigate('/');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-paper flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink md:text-[42px]">
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-ink-600">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-accent-700 hover:text-accent-600"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-1 py-2">
          {(error || validationErrors.length > 0) && (
            <div className="mb-5 rounded-sm border border-ink/15 bg-paper-200 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-accent-400" />
                <div className="ml-3">
                  {error && <p className="text-sm text-accent-800">{error}</p>}
                  {validationErrors.map((err, idx) => (
                    <p key={idx} className="text-sm text-accent-800">{err}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-ink-700">
                  Nombre
                </label>
                <div className="mt-1 relative">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="block h-12 w-full appearance-none rounded-sm border border-ink/15 bg-transparent pl-10 pr-3 text-[15px] text-ink placeholder:text-ink-400 focus:border-ink focus:outline-none"
                  />
                  <User className="h-5 w-5 text-ink-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-ink-700">
                  Apellido
                </label>
                <div className="mt-1 relative">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="block h-12 w-full appearance-none rounded-sm border border-ink/15 bg-transparent pl-10 pr-3 text-[15px] text-ink placeholder:text-ink-400 focus:border-ink focus:outline-none"
                  />
                  <User className="h-5 w-5 text-ink-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

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
              <label htmlFor="phone" className="block text-sm font-medium text-ink-700">
                Teléfono (opcional)
              </label>
              <div className="mt-1 relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="block h-12 w-full appearance-none rounded-sm border border-ink/15 bg-transparent pl-10 pr-3 text-[15px] text-ink placeholder:text-ink-400 focus:border-ink focus:outline-none"
                  placeholder="+34 600 000 000"
                />
                <Phone className="h-5 w-5 text-ink-400 absolute left-3 top-2.5" />
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
                  autoComplete="new-password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-700">
                Confirmar contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="block h-12 w-full appearance-none rounded-sm border border-ink/15 bg-transparent pl-10 pr-10 text-[15px] text-ink placeholder:text-ink-400 focus:border-ink focus:outline-none"
                  placeholder="••••••••"
                />
                <Lock className="h-5 w-5 text-ink-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-ink-400 hover:text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* RGPD: Política de Privacidad + Condiciones (OBLIGATORIO) */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="accept-privacy"
                    name="accept-privacy"
                    type="checkbox"
                    required
                    checked={formData.acceptPrivacy}
                    onChange={(e) => setFormData({ ...formData, acceptPrivacy: e.target.checked })}
                    className="h-4 w-4 text-accent-600 focus:ring-resona border-paper-400 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="accept-privacy" className="font-medium text-ink">
                    He leído y acepto la{' '}
                    <Link to="/politica-privacidad" target="_blank" className="text-accent-600 hover:text-accent-600/80 underline">
                      Política de Privacidad
                    </Link>
                    {' '}y las{' '}
                    <Link to="/terminos-condiciones" target="_blank" className="text-accent-600 hover:text-accent-600/80 underline">
                      Condiciones de Contratación
                    </Link>
                    {' '}<span className="text-accent-700">*</span>
                  </label>
                  <p className="text-xs text-ink-500 mt-1">
                    Obligatorio según RGPD para crear tu cuenta y gestionar pedidos.
                  </p>
                </div>
              </div>

              {/* RGPD: Comunicaciones Comerciales (OPCIONAL) */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="accept-marketing"
                    name="accept-marketing"
                    type="checkbox"
                    checked={formData.acceptMarketing}
                    onChange={(e) => setFormData({ ...formData, acceptMarketing: e.target.checked })}
                    className="h-4 w-4 text-accent-600 focus:ring-resona border-paper-400 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="accept-marketing" className="font-medium text-ink-700">
                    Acepto recibir comunicaciones comerciales y promociones
                  </label>
                  <p className="text-xs text-ink-500 mt-1">
                    Opcional. Puedes darte de baja en cualquier momento.
                  </p>
                </div>
              </div>

              <p className="text-xs text-ink-500 italic">
                🔒 Tus datos están protegidos según el RGPD. Nunca compartiremos tu información con terceros.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-full bg-ink text-[15px] font-medium text-cream-100 transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
