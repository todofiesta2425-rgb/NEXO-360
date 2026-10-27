import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  ShoppingCart, 
  Boxes, 
  UserCheck, 
  Receipt, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Store,
  FileSpreadsheet
} from 'lucide-react';
import { NexoLogo } from '../common/NexoLogo';
import { UserRole } from '../../types';

export type NavTab = 
  | 'dashboard' 
  | 'products' 
  | 'catalog' 
  | 'clients' 
  | 'sales' 
  | 'inventory' 
  | 'employees' 
  | 'expenses' 
  | 'reports' 
  | 'settings'
  | 'import';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  userRole,
  isMobileOpen,
  onCloseMobile
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['propietario', 'administrador', 'empleado', 'solo_lectura']
    },
    {
      id: 'sales' as NavTab,
      label: 'Ventas y POS',
      icon: ShoppingCart,
      allowedRoles: ['propietario', 'administrador', 'empleado', 'solo_lectura'],
      badge: 'Caja'
    },
    {
      id: 'products' as NavTab,
      label: 'Productos y Precios',
      icon: Package,
      allowedRoles: ['propietario', 'administrador', 'empleado', 'solo_lectura']
    },
    {
      id: 'import' as NavTab,
      label: 'Importar Productos',
      icon: FileSpreadsheet,
      allowedRoles: ['propietario', 'administrador', 'empleado'],
      badge: 'OCR',
      highlight: true
    },
    {
      id: 'inventory' as NavTab,
      label: 'Inventario y Kardex',
      icon: Boxes,
      allowedRoles: ['propietario', 'administrador', 'empleado', 'solo_lectura']
    },
    {
      id: 'clients' as NavTab,
      label: 'Clientes',
      icon: Users,
      allowedRoles: ['propietario', 'administrador', 'empleado', 'solo_lectura']
    },
    {
      id: 'catalog' as NavTab,
      label: 'Catálogo Público',
      icon: Store,
      allowedRoles: ['propietario', 'administrador', 'empleado', 'solo_lectura']
    },
    {
      id: 'expenses' as NavTab,
      label: 'Gastos y Caja',
      icon: Receipt,
      allowedRoles: ['propietario', 'administrador', 'empleado', 'solo_lectura']
    },
    {
      id: 'reports' as NavTab,
      label: 'Reportes y Cierres',
      icon: BarChart3,
      allowedRoles: ['propietario', 'administrador', 'solo_lectura'] // Empleados restricted in standard view
    },
    {
      id: 'employees' as NavTab,
      label: 'Equipo y Permisos',
      icon: UserCheck,
      allowedRoles: ['propietario', 'administrador', 'solo_lectura']
    },
    {
      id: 'settings' as NavTab,
      label: 'Configuración & Sheets',
      icon: Settings,
      allowedRoles: ['propietario', 'administrador']
    }
  ];

  const handleItemClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#101820] text-[#F2F4F6] transition-all duration-300 border-r border-[#101820]/80 shadow-2xl ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Top Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="overflow-hidden">
            {collapsed ? (
              <div className="flex justify-center w-full">
                <NexoLogo size="sm" light />
              </div>
            ) : (
              <NexoLogo size="md" light showTagline={false} />
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            aria-label="Contraer menú lateral"
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          <div className={`px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 ${collapsed ? 'text-center' : ''}`}>
            {collapsed ? '•••' : 'Módulos Comerciales'}
          </div>

          {navItems.map(item => {
            const isAllowed = 
              item.allowedRoles.includes(userRole) || 
              userRole === 'propietario' || 
              userRole === 'administrador' || 
              !['propietario', 'administrador', 'empleado', 'solo_lectura'].includes(userRole);
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`group relative flex items-center w-full rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#35D0BA] text-[#101820] shadow-md shadow-[#35D0BA]/20 font-bold'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                } ${collapsed ? 'justify-center' : 'justify-between'} ${
                  !isAllowed ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon 
                    size={20} 
                    className={`shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#101820]' : item.highlight ? 'text-[#35D0BA]' : 'text-gray-300'
                    }`} 
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!collapsed && item.badge && (
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-[#101820] text-[#35D0BA]' : 'bg-[#F5A623] text-[#101820]'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Floating tooltip on collapsed view */}
                {collapsed && (
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#101820] text-white text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-white/10">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Operational Footer Info */}
        <div className="p-3 border-t border-white/10 shrink-0 bg-[#0d141b]">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#35D0BA] animate-pulse" />
                  NEXO 360 v2.4
                </span>
                <span className="text-[10px] text-[#35D0BA] font-semibold bg-[#35D0BA]/10 px-2 py-0.5 rounded">
                  En línea
                </span>
              </div>
              <div className="text-[11px] text-gray-400 leading-tight">
                «Tu negocio conectado. Cada movimiento bajo control»
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#35D0BA]" title="NEXO 360 Activo" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
