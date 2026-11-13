import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthFormPanelProps {
  initialMode?: 'login' | 'register';
  onOpenForgotPassword: (prefillEmail: string) => void;
  compact?: boolean;
}

export const AuthFormPanel: React.FC<AuthFormPanelProps> = ({
  initialMode = 'login',
  onOpenForgotPassword,
  compact = false
}) => {
  const {
    signInWithEmail,
    registerWithEmail,
    signInWithGoogle,
    authError,
    clearAuthError
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('empleado');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setLocalError(null);
    clearAuthError();
  }, [initialMode]);

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
        setSuccessMessage('Usuario registrado correctamente.');
      }
    } catch (err) {
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

  return (
    <div className={compact ? 'space-y-4' : 'space-y-5'}>
      {/* Mode Switch Tabs */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLocalError(null);
              clearAuthError();
            }}
            className={`text-sm font-bold pb-1.5 transition-all cursor-pointer whitespace-nowrap ${
              mode === 'login'
                ? 'text-[#101820] border-b-2 border-[#101820]'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setLocalError(null);
              clearAuthError();
            }}
            className={`text-sm font-bold pb-1.5 transition-all cursor-pointer whitespace-nowrap ${
              mode === 'register'
                ? 'text-[#101820] border-b-2 border-[#101820]'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Registrarse
          </button>
        </div>

        <span className="text-[11px] text-gray-500 font-semibold whitespace-nowrap">
          Acceso Seguro
        </span>
      </div>

      {/* Error Banner */}
      {(localError || authError) && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{localError || authError}</div>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nombre completo
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ej. Laura Martínez"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#101820]/15 focus:border-[#101820] transition-all"
              />
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Rol en el negocio
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedRole('propietario')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'propietario'
                    ? 'border-[#101820] bg-[#101820] text-white font-bold'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium'
                }`}
              >
                <div className="text-[11px] font-bold">Propietario / Admin</div>
                <div className={`text-[10px] ${selectedRole === 'propietario' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Control total del sistema
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('empleado')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'empleado'
                    ? 'border-[#101820] bg-[#101820] text-white font-bold'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium'
                }`}
              >
                <div className="text-[11px] font-bold">Empleado / Ventas</div>
                <div className={`text-[10px] ${selectedRole === 'empleado' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Caja, POS e inventario
                </div>
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@tunegocio.com"
              autoComplete="email"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#101820]/15 focus:border-[#101820] transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-gray-700">
              Contraseña
            </label>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => onOpenForgotPassword(email)}
                className="text-[11px] text-gray-500 hover:text-[#101820] hover:underline font-semibold cursor-pointer"
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Confirmar contraseña
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-[#101820] hover:bg-[#1a2533] text-white rounded-xl text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw size={15} className="animate-spin text-[#35D0BA]" />
              <span>Verificando acceso...</span>
            </>
          ) : (
            <>
              <span>{mode === 'login' ? 'Iniciar Sesión en NEXO 360' : 'Crear Cuenta y Entrar'}</span>
              <ArrowRight size={15} className="text-[#35D0BA]" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <span className="relative bg-white px-3 text-[11px] font-semibold text-gray-400">
          o continuar con
        </span>
      </div>

      {/* Google Sign-in Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
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
    </div>
  );
};
