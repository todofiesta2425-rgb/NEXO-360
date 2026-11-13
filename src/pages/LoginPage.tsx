import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  X,
  ShoppingCart,
  Boxes,
  ScanLine,
  Users,
  Receipt,
  FileSpreadsheet,
  ShieldCheck,
  Store,
  BarChart3,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NexoLogo } from '../components/common/NexoLogo';
import { AuthFormPanel } from '../components/auth/AuthFormPanel';
import {
  SystemPreviewBackdrop,
  InteractiveInteriorShowcase
} from '../components/auth/SystemPreviewBackdrop';

export const LoginPage: React.FC = () => {
  const { sendPasswordReset } = useAuth();

  // Hero initial mode + global Auth Modal state for buttons across the page
  const [heroAuthMode, setHeroAuthMode] = useState<'login' | 'register'>('login');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Password recovery modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenForgotPassword = (prefillEmail: string) => {
    setAuthModalOpen(false);
    setResetEmail(prefillEmail);
    setForgotModalOpen(true);
    setResetSuccess(false);
    setResetError(null);
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

  const modulesList = [
    {
      num: '01',
      title: 'Ventas, Caja y Punto de Venta (POS)',
      description:
        'Cobrá en mostrador con múltiples medios de pago, descuentos, asignación de cliente y emisión de tickets con descuento automático de stock.',
      icon: ShoppingCart,
      span: 'lg:col-span-2',
      highlights: ['Efectivo, transferencia y tarjetas', 'Anulación controlada', 'Comprobante instantáneo']
    },
    {
      num: '02',
      title: 'Escáner OCR de Facturas y Excel',
      description:
        'Importá listas de precios en Excel, CSV, PDF o fotos de facturas para crear productos y actualizar costos sin carga manual.',
      icon: ScanLine,
      span: 'lg:col-span-1',
      highlights: ['Lectura de facturas JPG/PNG/PDF', 'Planillas XLSX y CSV']
    },
    {
      num: '03',
      title: 'Inventario, Kardex y Stock Mínimo',
      description:
        'Seguimiento unitario de cada entrada, salida, merma o reposición con alertas tempranas antes de quedarte sin mercadería.',
      icon: Boxes,
      span: 'lg:col-span-1',
      highlights: ['Kardex auditado por usuario', 'Alertas de reposición']
    },
    {
      num: '04',
      title: 'Productos, Precios y Catálogo Público',
      description:
        'Administrá costos, márgenes y precios de venta, y compartí un catálogo visual actualizado listo para consultar desde el celular.',
      icon: Store,
      span: 'lg:col-span-1',
      highlights: ['Control de márgenes', 'Vista pública compartible']
    },
    {
      num: '05',
      title: 'Clientes, Gastos y Reportes de Cierre',
      description:
        'Historial de compras por cliente, registro diario de gastos operativos y balances netos con exportación de resúmenes.',
      icon: BarChart3,
      span: 'lg:col-span-1',
      highlights: ['Balance ingresos vs gastos', 'Ranking de productos']
    },
    {
      num: '06',
      title: 'Sincronización Real con Google Sheets y Firebase',
      description:
        'Consultá desde tu casa lo que tu equipo vende en el local. Cada operación se respalda en la nube y se refleja en tu planilla.',
      icon: FileSpreadsheet,
      span: 'lg:col-span-3',
      highlights: ['Cola resiliente sin cortes', 'Acceso multi-dispositivo en tiempo real', 'Respaldo automático en Google Sheets']
    }
  ];

  return (
    <div className="min-h-screen bg-[#F2F4F6] text-[#101820] flex flex-col antialiased selection:bg-[#35D0BA] selection:text-[#101820]">
      {/* Sticky Top Navigation Bar with Direct Login & Register */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark */}
          <a href="#inicio" className="shrink-0 focus:outline-none">
            <NexoLogo size="md" light={false} showTagline={false} />
          </a>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-gray-600">
            <a href="#vista-interior" className="hover:text-[#101820] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
              Vista Interior
            </a>
            <a href="#modulos" className="hover:text-[#101820] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
              Qué Incluye
            </a>
            <a href="#roles" className="hover:text-[#101820] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
              Roles y Seguridad
            </a>
            <a href="#sincronizacion" className="hover:text-[#101820] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
              Multi-Dispositivo
            </a>
          </nav>

          {/* Zone 3: Top Auth Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#101820] hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#101820] hover:bg-[#1a2533] text-white transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>Registrarse</span>
              <ArrowRight size={14} className="text-[#35D0BA]" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO PORTADA: Shows the inside of NEXO 360 in the background + Login/Register right upfront */}
      <section
        id="inicio"
        className="relative bg-[#101820] text-white overflow-hidden border-b border-white/10"
      >
        {/* Real NEXO 360 Workspace Background */}
        <SystemPreviewBackdrop />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Cover Proposition & Interior Preview Callout */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-semibold tracking-wide text-[#35D0BA]">
                NEXO 360 · Gestión Comercial Integral
              </div>

              <h1
                className="font-black tracking-tight text-white leading-[1.08]"
                style={{ fontSize: 'clamp(2.1rem, 4vw, 3.35rem)', textWrap: 'balance' }}
              >
                Tu negocio conectado. Cada movimiento bajo control.
              </h1>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl">
                Administrá ventas en punto de venta, inventario con kardex, importación inteligente de facturas, clientes, gastos y reportes diarios desde cualquier computadora, tablet o celular, con respaldo automático en Firebase y Google Sheets.
              </p>

              {/* Action Buttons visible immediately */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setHeroAuthMode('register');
                    openAuthModal('register');
                  }}
                  className="px-6 py-3 rounded-xl bg-[#35D0BA] hover:bg-[#2bbba7] text-[#101820] text-xs sm:text-sm font-extrabold transition-colors shadow-lg flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Crear Cuenta y Comenzar</span>
                  <ArrowRight size={16} />
                </button>

                <a
                  href="#vista-interior"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Ver qué hay adentro</span>
                  <ChevronRight size={16} />
                </a>
              </div>

              {/* Concrete Interior Capabilities Summary */}
              <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-mono font-bold text-white text-base tabular-nums">10 Módulos</div>
                  <div className="text-gray-400">POS, Stock, OCR y Finanzas</div>
                </div>
                <div>
                  <div className="font-mono font-bold text-[#35D0BA] text-base tabular-nums">Tiempo Real</div>
                  <div className="text-gray-400">Cloud Firestore + Sheets</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="font-mono font-bold text-[#F5A623] text-base tabular-nums">Multi-Rol</div>
                  <div className="text-gray-400">Propietario y Empleados</div>
                </div>
              </div>
            </div>

            {/* Right Column: Clean Login & Registration Card directly at the top */}
            <div className="lg:col-span-5">
              <div className="bg-white text-[#101820] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200/80">
                <div className="mb-4">
                  <h2 className="text-lg font-extrabold text-[#101820]">
                    Ingresá a tu espacio comercial
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Accedé con tu cuenta existente o registrá un nuevo usuario.
                  </p>
                </div>

                <AuthFormPanel
                  initialMode={heroAuthMode}
                  onOpenForgotPassword={handleOpenForgotPassword}
                  compact={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: Interactive Preview of What's Inside */}
      <section id="vista-interior" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Vista previa del sistema
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101820]">
              Explorá todo lo que vas a encontrar adentro
            </h2>
            <p className="text-sm text-gray-600">
              Cambiá entre las pantallas principales para conocer cómo operan tus cajas, tu depósito y la carga automática de mercadería antes de entrar.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-[#101820] transition-colors cursor-pointer whitespace-nowrap"
            >
              Ya tengo cuenta
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="px-4 py-2.5 rounded-xl bg-[#101820] hover:bg-[#1a2533] text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              Registrarme Gratis
            </button>
          </div>
        </div>

        <InteractiveInteriorShowcase onOpenAuth={openAuthModal} />
      </section>

      {/* SECTION 2: Complete Modules Overview */}
      <section id="modulos" className="py-14 sm:py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Arquitectura modular
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101820]">
              Cada área de tu comercio conectada en un mismo tablero
            </h2>
            <p className="text-sm text-gray-600">
              Sin planillas sueltas ni sistemas desconectados: lo que carga el depósito impacta en el punto de venta, en el catálogo y en tus reportes financieros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modulesList.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.num}
                  className={`${mod.span} bg-[#F2F4F6]/60 rounded-3xl p-6 border border-gray-200 flex flex-col justify-between gap-4 hover:border-gray-300 transition-colors`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gray-500">
                        {mod.num}.
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-[#101820] text-[#35D0BA] flex items-center justify-center">
                        <Icon size={18} />
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-[#101820]">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-600">
                    <span>{mod.highlights.join(' · ')}</span>
                    <button
                      type="button"
                      onClick={() => openAuthModal('register')}
                      className="font-bold text-[#101820] hover:underline cursor-pointer whitespace-nowrap"
                    >
                      Acceder →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: Multi-Role Access & Security */}
      <section id="roles" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Control de acceso y permisos
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101820]">
              Cada colaborador ve y opera exactamente lo que necesita
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Protegé tus costos, márgenes y configuraciones sensibles mediante reglas verificadas en Firebase y Firestore. Creá cuentas para tu equipo en segundos.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="px-5 py-2.5 rounded-xl bg-[#101820] hover:bg-[#1a2533] text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                Registrar Usuario Ahora
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-[#101820] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-[#101820] text-white rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#35D0BA]">Nivel 01</span>
                <ShieldCheck size={20} className="text-[#35D0BA]" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold">Propietario / Administrador</h3>
                <p className="text-xs text-gray-300 mt-1">
                  Control absoluto sobre la operación comercial y la seguridad del negocio.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-gray-200 pt-2 border-t border-white/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#35D0BA] shrink-0" />
                  <span>Reportes de rentabilidad, costos y márgenes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#35D0BA] shrink-0" />
                  <span>Gestión de empleados, roles y permisos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#35D0BA] shrink-0" />
                  <span>Configuración de Google Sheets y Firebase</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#35D0BA] shrink-0" />
                  <span>Anulación de ventas y auditoría de caja</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F5A623]">Nivel 02</span>
                <Users size={20} className="text-[#101820]" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#101820]">Empleado / Ventas</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Interfaz ágil de mostrador para vender y controlar stock sin exponer configuraciones críticas.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-gray-700 pt-2 border-t border-gray-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#101820] shrink-0" />
                  <span>Cobro rápido en Punto de Venta (POS)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#101820] shrink-0" />
                  <span>Consulta de precios, catálogo y disponibilidad</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#101820] shrink-0" />
                  <span>Alta de clientes y gastos menores de caja</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#101820] shrink-0" />
                  <span>Sin acceso a edición de roles ni ajustes globales</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Multi-Device & Final Call-to-Action Banner */}
      <section id="sincronizacion" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-[#101820] text-white rounded-3xl p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#35D0BA]">
              <Smartphone size={16} />
              <span>Computadora · Tablet · Celular</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Empezá a operar tu comercio con NEXO 360 hoy mismo
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Creá tu usuario en menos de un minuto o iniciá sesión para continuar gestionando ventas, inventario y reportes desde donde estés.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="px-6 py-3 rounded-xl bg-[#35D0BA] hover:bg-[#2bbba7] text-[#101820] text-xs font-extrabold transition-colors shadow-lg flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>Registrarme Ahora</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-[#101820]">NEXO 360</span>
            <span aria-hidden="true">·</span>
            <span>Tu negocio conectado. Cada movimiento bajo control.</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="font-semibold text-gray-700 hover:text-[#101820] cursor-pointer"
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="font-semibold text-gray-700 hover:text-[#101820] cursor-pointer"
            >
              Crear Cuenta
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal triggered from Top Bar or any CTA across the Cover Page */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              aria-label="Cerrar ventana de acceso"
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-5">
              <NexoLogo size="sm" light={false} showTagline={false} />
              <h3 className="text-lg font-extrabold text-[#101820] mt-3">
                {authModalMode === 'login' ? 'Bienvenido a NEXO 360' : 'Creá tu cuenta en NEXO 360'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {authModalMode === 'login'
                  ? 'Ingresá tus credenciales para abrir tu panel comercial.'
                  : 'Registrá tu usuario para operar ventas, stock y reportes.'}
              </p>
            </div>

            <AuthFormPanel
              initialMode={authModalMode}
              onOpenForgotPassword={handleOpenForgotPassword}
            />
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              aria-label="Cerrar"
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
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
                  <span>Correo enviado</span>
                </div>
                <p>
                  Revisá la bandeja de entrada de <strong>{resetEmail}</strong> (y la carpeta de spam si es necesario) para restablecer tu contraseña.
                </p>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="mt-3 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">
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
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 text-xs font-bold bg-[#101820] hover:bg-[#1a2533] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
