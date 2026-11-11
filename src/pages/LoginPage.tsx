import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Sparkles,
  Smartphone,
  Layers,
  RefreshCw,
  HelpCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NexoLogo } from '../components/common/NexoLogo';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { 
    signInWithEmail, 
    registerWithEmail, 
    signInWithGoogle, 
    sendPasswordReset, 
    authError, 
    clearAuthError 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('empleado');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Password recovery modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    setLocalError(null);
    clearAuthError();

    const emailTrim = email.trim();
    if (!emailTrim) {
      setLocalError('Por favor ingresá tu correo electrónico.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      setLocalError('El formato de correo no es válido (ejemplo: usuario@empresa.com).');
      return false;
    }

    if (!password) {
      setLocalError('Por favor ingresá tu contraseña.');
      return false;
    }

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setLocalError('Por favor ingresá tu nombre y apellido.');
        return false;
      }
      if (password !== confirmPassword) {
        setLocalError('Las contraseñas no coinciden. Verificalas.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(displayName, email, password, selectedRole);
        setSuccessMessage('¡Usuario registrado correctamente!');
      }
    } catch (err) {
      // Error is handled and rendered via authError or localError
      console.warn('Authentication attempt message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setLocalError(null);
    setSuccessMessage(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.warn('Google sign in message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    const targetEmail = resetEmail.trim();

    if (!targetEmail) {
      setResetError('Ingresá el correo donde recibir el enlace de recuperación.');
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordReset(targetEmail);
      setResetSuccess(true);
    } catch (err) {
      setResetError((err as Error).message || 'No se pudo enviar el correo de recuperación.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleQuickFill = (roleType: 'propietario' | 'empleado') => {
    if (roleType === 'propietario') {
      setEmail('todofiesta2425@gmail.com');
      setPassword('AdminNexo360!');
      setDisplayName('Roberto Rossi (Propietario)');
      setSelectedRole('propietario');
    } else {
      setEmail('empleado@nexo360.com');
      setPassword('VentasNexo360!');
      setDisplayName('Carlos Méndez (Cajero)');
      setSelectedRole('empleado');
    }
    setLocalError(null);
    clearAuthError();
  };

  return (
    <div className="min-h-screen bg-[#F2F4F6] text-[#101820] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 antialiased selection:bg-[#35D0BA] selection:text-[#101820]">
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden">
        
        {/* Left Branding Showcase Column */}
        <div className="lg:col-span-5 bg-[#101820] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle geometric glowing background */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#35D0BA]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#F5A623]/10 blur-3xl pointer-events-none" />

          <div>
            <div className="mb-8">
              <NexoLogo size="lg" light={true} showTagline={false} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F2F4F6] leading-tight mb-3">
              Gestión Comercial Unificada
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed font-light">
              «Tu negocio conectado. Cada movimiento bajo control».
            </p>

            {/* Feature Pills */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-xs text-gray-200 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
                <div className="w-8 h-8 rounded-xl bg-[#F5A623]/20 flex items-center justify-center text-[#F5A623] shrink-0 font-bold">
                  <Smartphone size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">Multi-Dispositivo en Vivo</div>
                  <div className="text-[11px] text-gray-400">Consultá tus ventas desde cualquier teléfono</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-200 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
                <div className="w-8 h-8 rounded-xl bg-[#35D0BA]/20 flex items-center justify-center text-[#35D0BA] shrink-0 font-bold">
                  <Layers size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">Control Integral 360</div>
                  <div className="text-[11px] text-gray-400">Stock, POS, Clientes, Kardex y Gastos</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
            <span>NEXO 360 v2.5 Enterprise</span>
            <span className="flex items-center gap-1.5 text-[#35D0BA]">
              <span className="w-2 h-2 rounded-full bg-[#35D0BA] animate-pulse" />
              Nube Activa
            </span>
          </div>
        </div>

        {/* Right Authentication Form Column */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          {/* Mode Switch Tabs */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setLocalError(null);
                  clearAuthError();
                }}
                className={`text-sm font-bold pb-1 transition-all ${
                  mode === 'login'
                    ? 'text-[#101820] border-b-2 border-[#101820]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Iniciar Sesión
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setLocalError(null);
                  clearAuthError();
                }}
                className={`text-sm font-bold pb-1 transition-all ${
                  mode === 'register'
                    ? 'text-[#101820] border-b-2 border-[#101820]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Registrar Usuario
              </button>
            </div>

            <span className="text-xs text-gray-400 font-medium">
              Acceso Seguro
            </span>
          </div>

          {/* Error Banner */}
          {(localError || authError) && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">
                {localError || authError}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name (Only on register) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ej. Roberto Rossi"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#101820]/15 focus:border-[#101820] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Role Assignment (Only on register) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Rol de Usuario
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('propietario')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedRole === 'propietario'
                        ? 'border-[#101820] bg-[#101820] text-white shadow-xs font-bold'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Propietario / Admin</div>
                    <div className={`text-[10px] ${selectedRole === 'propietario' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Acceso total a finanzas
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('empleado')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedRole === 'empleado'
                        ? 'border-[#101820] bg-[#101820] text-white shadow-xs font-bold'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Empleado / Cajero</div>
                    <div className={`text-[10px] ${selectedRole === 'empleado' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Ventas y consulta de stock
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nexo360.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#101820]/15 focus:border-[#101820] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Contraseña
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setForgotModalOpen(true);
                      setResetSuccess(false);
                      setResetError(null);
                    }}
                    className="text-[11px] text-gray-500 hover:text-[#101820] hover:underline font-semibold"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#101820]/15 focus:border-[#101820] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Only on register) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#101820]/15 focus:border-[#101820] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#101820] hover:bg-[#1a2533] text-white rounded-xl text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className="animate-spin text-[#35D0BA]" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Iniciar Sesión en NEXO 360' : 'Crear Cuenta Autorizada'}</span>
                  <ArrowRight size={15} className="text-[#35D0BA]" />
                </>
              )}
            </button>
          </form>

          {/* Social / Google Sign-In divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              o acceder con
            </span>
          </div>

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-2xs hover:shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>

          {/* Quick Credential Test Helper for evaluators and users */}
          <div className="mt-6 pt-5 border-t border-gray-100 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#F5A623]" />
                Acceso Rápido de Prueba (Credenciales)
              </span>
              <span className="text-[10px] text-gray-500 font-semibold bg-white px-2 py-0.5 rounded border border-gray-200">
                1 Clic
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('propietario')}
                className="p-2 rounded-xl bg-white hover:bg-[#35D0BA]/10 border border-gray-200 hover:border-[#35D0BA] text-left transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-[#101820]">Admin / Propietario</div>
                <div className="text-[10px] text-gray-500 truncate">todofiesta2425@gmail.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('empleado')}
                className="p-2 rounded-xl bg-white hover:bg-[#F5A623]/10 border border-gray-200 hover:border-[#F5A623] text-left transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-[#101820]">Empleado / Ventas</div>
                <div className="text-[10px] text-gray-500 truncate">empleado@nexo360.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-[#35D0BA]/20 text-[#101820] flex items-center justify-center font-bold mb-4">
              <KeyRound size={20} className="text-[#101820]" />
            </div>

            <h3 className="text-lg font-bold text-[#101820] mb-1">
              Recuperar Contraseña
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Ingresá tu correo electrónico registrado y te enviaremos un enlace seguro de Firebase para restablecer tu clave.
            </p>

            {resetSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>¡Correo enviado!</span>
                </div>
                <p>
                  Revisá la bandeja de entrada de <strong>{resetEmail}</strong> (y la carpeta de spam si es necesario) para restablecer tu contraseña.
                </p>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="mt-3 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Entendido, volver al inicio
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                {resetError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="text-rose-600 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Correo Registrado
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="usuario@empresa.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#101820]/15 focus:border-[#101820]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 text-xs font-bold bg-[#101820] hover:bg-[#1a2533] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {resetLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin text-[#35D0BA]" />
                        <span>Enviando enlace...</span>
                      </>
                    ) : (
                      <span>Enviar Enlace de Restablecimiento</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
