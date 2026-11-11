import React, { useState } from 'react';
import { 
  Menu, 
  RefreshCw, 
  FileSpreadsheet, 
  Database, 
  UserCircle, 
  CheckCircle2, 
  Clock, 
  Store, 
  ChevronDown,
  LogOut,
  ShieldCheck,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Employee, UserRole, BusinessConfig } from '../../types';
import { storageService } from '../../services/storageService';
import { googleSheetsService } from '../../services/sheetsService';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  currentEmployee: Employee;
  allEmployees: Employee[];
  onSelectEmployee: (id: string) => void;
  config: BusinessConfig;
  onOpenCatalog: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  currentEmployee,
  allEmployees,
  onSelectEmployee,
  config,
  onOpenCatalog,
  onOpenSettings
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const pendingOps = googleSheetsService.getPendingOperationsCount();

  const handleManualSync = async () => {
    setIsSyncing(true);
    await googleSheetsService.syncPendingQueue(true);
    setIsSyncing(false);
  };

  const getRoleBadge = (role: UserRole) => {
    const customRole = storageService.getRoles().find(r => r.id === role);
    if (customRole) {
      return { label: customRole.name, bg: customRole.badgeBg || 'bg-indigo-100 text-indigo-900 border border-indigo-200' };
    }
    switch (role) {
      case 'propietario':
        return { label: 'Propietario', bg: 'bg-[#101820] text-[#35D0BA] border border-[#35D0BA]/30' };
      case 'administrador':
        return { label: 'Administrador', bg: 'bg-[#35D0BA]/15 text-[#101820] border border-[#35D0BA]/40' };
      case 'empleado':
        return { label: 'Empleado / Ventas', bg: 'bg-[#F5A623]/20 text-[#101820] border border-[#F5A623]/40' };
      case 'solo_lectura':
        return { label: 'Solo Lectura', bg: 'bg-gray-200 text-gray-700 border border-gray-300' };
      default:
        return { label: role, bg: 'bg-gray-100 text-gray-800 border border-gray-300' };
    }
  };

  const { user, profile, signOut: handleSignOut } = useAuth();

  const activeName = profile?.displayName || currentEmployee.name;
  const activeEmail = user?.email || profile?.email || currentEmployee.email;
  const activeRole = profile?.role || currentEmployee.role;
  const roleBadge = getRoleBadge(activeRole);

  const onLogoutClick = async () => {
    if (window.confirm('¿Seguro que deseás cerrar la sesión en NEXO 360?')) {
      setShowRoleMenu(false);
      await handleSignOut();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">

      {/* Main App Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Organization info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            aria-label="Abrir menú"
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#101820] transition-colors"
          >
            <Menu size={22} />
          </button>

          <div className="flex flex-col">
            <span className="font-bold text-[#101820] text-sm sm:text-base leading-tight">
              {config.name}
            </span>
            <span className="text-[11px] text-gray-500 font-medium hidden sm:inline">
              {config.legalName} • CUIT: {config.taxId}
            </span>
          </div>
        </div>

        {/* Right: Operational Status & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Public Catalog Link */}
          <button
            onClick={onOpenCatalog}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-[#35D0BA]/15 text-gray-700 hover:text-[#101820] text-xs font-semibold transition-colors border border-gray-200"
          >
            <Store size={15} className="text-[#35D0BA]" />
            <span>Ver Catálogo</span>
          </button>

          {/* Google Sheets Sync Pill */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              title={
                config.sheetsConnected 
                  ? `Google Sheets Conectado. ${pendingOps.total} pendientes.` 
                  : 'Google Sheets en cola de respaldo local.'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                pendingOps.total > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <FileSpreadsheet size={15} className={pendingOps.total > 0 ? 'text-amber-600' : 'text-emerald-600'} />
              <span className="hidden sm:inline">Sheets:</span>
              {pendingOps.total > 0 ? (
                <span className="flex items-center gap-1 font-bold">
                  {pendingOps.total} pend.
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  Al día <CheckCircle2 size={12} />
                </span>
              )}
            </button>
          </div>

          {/* User Profile & Session Menu */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-colors text-left cursor-pointer"
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs"
                style={{ backgroundColor: profile?.avatarColor || currentEmployee.avatarColor || '#101820' }}
              >
                {activeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-bold text-[#101820] leading-tight flex items-center gap-1">
                  {activeName}
                  <ChevronDown size={12} className="text-gray-400" />
                </span>
                <span className="text-[10px] text-gray-500 capitalize">
                  {roleBadge.label}
                </span>
              </div>
            </button>

            {/* Dropdown Menu for Active User Profile */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Identity Header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                      style={{ backgroundColor: profile?.avatarColor || currentEmployee.avatarColor || '#101820' }}
                    >
                      {activeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-[#101820] truncate">
                        {activeName}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {activeEmail}
                      </div>
                      <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold mt-1 ${roleBadge.bg}`}>
                        {roleBadge.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium">
                    <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                    <span>Firebase Auth & Zero-Trust Activo</span>
                  </div>
                </div>

                {/* Switch Simulation Profile if Admin */}
                {allEmployees.length > 1 && (
                  <div className="py-2 px-3 border-b border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Perfiles de Equipo
                    </p>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {allEmployees.map(emp => {
                        const isSelected = emp.id === currentEmployee.id;
                        const badge = getRoleBadge(emp.role);
                        return (
                          <button
                            key={emp.id}
                            onClick={() => {
                              onSelectEmployee(emp.id);
                              setShowRoleMenu(false);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs hover:bg-gray-100 transition-colors ${
                              isSelected ? 'bg-[#35D0BA]/15 font-bold' : ''
                            }`}
                          >
                            <span className="truncate text-[11px] text-gray-700">{emp.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions & Logout */}
                <div className="pt-1 px-2 space-y-1">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onOpenSettings();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>Configuración del Sistema</span>
                    <span className="text-gray-400">→</span>
                  </button>

                  <button
                    onClick={onLogoutClick}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={14} className="text-rose-600" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </header>
  );
};
