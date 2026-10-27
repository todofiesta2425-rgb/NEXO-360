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
  ChevronDown 
} from 'lucide-react';
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

  const roleBadge = getRoleBadge(currentEmployee.role);

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

          {/* Role & Employee Selector */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs"
                style={{ backgroundColor: currentEmployee.avatarColor || '#101820' }}
              >
                {currentEmployee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-bold text-[#101820] leading-tight flex items-center gap-1">
                  {currentEmployee.name}
                  <ChevronDown size={12} className="text-gray-400" />
                </span>
                <span className="text-[10px] text-gray-500 capitalize">
                  {roleBadge.label}
                </span>
              </div>
            </button>

            {/* Dropdown Menu to test different employee roles */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Cambiar Perfil Operativo (Simulación)
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Permite comprobar cómo ven la app el propietario, cajeros y administradores.
                  </p>
                </div>

                <div className="py-1">
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
                        className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-[#35D0BA]/10 font-bold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: emp.avatarColor }}
                          >
                            {emp.name[0]}
                          </span>
                          <div>
                            <div className="text-gray-800 leading-tight">{emp.name}</div>
                            <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-semibold mt-0.5 ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={14} className="text-[#101820]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 px-3 border-t border-gray-100 flex justify-between items-center">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onOpenSettings();
                    }}
                    className="text-xs text-[#101820] font-semibold hover:text-[#35D0BA] transition-colors"
                  >
                    Gestión de Empleados →
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
