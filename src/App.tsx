import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { SalesPage } from './pages/SalesPage';
import { InventoryPage } from './pages/InventoryPage';
import { CatalogPage } from './pages/CatalogPage';
import { ClientsPage } from './pages/ClientsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ReportsPage } from './pages/ReportsPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { SettingsPage } from './pages/SettingsPage';
import { ImportProductsPage } from './pages/ImportProductsPage';
import { LoginPage } from './pages/LoginPage';
import { RestockModal } from './components/modals/RestockModal';
import { MovementHistoryModal } from './components/modals/MovementHistoryModal';
import { storageService } from './services/storageService';
import { Product, Employee, BusinessConfig } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NexoLogo } from './components/common/NexoLogo';
import { ShieldAlert, ArrowLeft, RefreshCw, Lock } from 'lucide-react';

function ProtectedRouteFallback({
  tabName,
  userRole,
  onBackToDashboard
}: {
  tabName: string;
  userRole: string;
  onBackToDashboard: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 border border-gray-200/80 shadow-md text-center">
      <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
        <Lock size={28} />
      </div>
      <h2 className="text-xl font-black text-[#101820] mb-2">
        Acceso Restringido: {tabName}
      </h2>
      <p className="text-xs text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
        Este módulo contiene información confidencial y configuraciones del negocio reservadas para el rol <strong>Propietario</strong> o <strong>Administrador</strong>. Tu perfil actual está asignado como <span className="capitalize font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{userRole}</span>.
      </p>
      <button
        onClick={onBackToDashboard}
        className="px-5 py-2.5 bg-[#101820] hover:bg-[#1a2533] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 mx-auto cursor-pointer"
      >
        <ArrowLeft size={15} />
        <span>Volver al Dashboard Principal</span>
      </button>
    </div>
  );
}

function MainApp() {
  const { user, profile, role, isAdmin, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Storage reactive states
  const [config, setConfig] = useState<BusinessConfig>(storageService.getConfig());
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(storageService.getCurrentEmployee());
  const [employees, setEmployees] = useState<Employee[]>(storageService.getEmployees());

  // Global Modals
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockTargetProduct, setRestockTargetProduct] = useState<Product | null>(null);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyTargetProduct, setHistoryTargetProduct] = useState<Product | null>(null);

  // Subscribe to storage mutations across all modules
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setConfig(storageService.getConfig());
      setCurrentEmployee(storageService.getCurrentEmployee());
      setEmployees(storageService.getEmployees());
    });
    return unsubscribe;
  }, []);

  // Sync active authenticated user with storage currentEmployee
  useEffect(() => {
    if (profile) {
      const all = storageService.getEmployees();
      const match = all.find(e => e.id === profile.id || e.email.toLowerCase() === profile.email.toLowerCase());
      if (match) {
        setCurrentEmployee(match);
      }
    }
  }, [profile]);

  const handleSelectEmployee = (id: string) => {
    storageService.setCurrentEmployee(id);
    setCurrentEmployee(storageService.getCurrentEmployee());
  };

  const handleOpenRestock = (product?: Product) => {
    setRestockTargetProduct(product || null);
    setRestockModalOpen(true);
  };

  const handleOpenMovementHistory = (product: Product) => {
    setHistoryTargetProduct(product);
    setHistoryModalOpen(true);
  };

  // 1. Loading splash screen while verifying Firebase session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#101820] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
          <NexoLogo size="xl" light={true} showTagline={false} />
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 mt-2">
            <RefreshCw size={16} className="animate-spin text-[#35D0BA]" />
            <span>Verificando sesión segura en Firebase...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state: render full enterprise LoginPage
  if (!user) {
    return <LoginPage />;
  }

  // Determine active operating role (from profile or fallback)
  const activeRole = profile?.role || role || currentEmployee.role;
  const isSuperOrAdmin = activeRole === 'propietario' || activeRole === 'administrador';

  return (
    <div className="min-h-screen bg-[#F2F4F6] text-[#101820] flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole={activeRole}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Operational Header */}
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          currentEmployee={currentEmployee}
          allEmployees={employees}
          onSelectEmployee={handleSelectEmployee}
          config={config}
          onOpenCatalog={() => setCurrentTab('catalog')}
          onOpenSettings={() => setCurrentTab('settings')}
        />

        {/* Dynamic Page Container with Role Route Protection */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DashboardPage 
              onNavigate={setCurrentTab} 
              onOpenRestockModal={handleOpenRestock}
            />
          )}

          {currentTab === 'sales' && <SalesPage />}

          {currentTab === 'products' && (
            <ProductsPage 
              onOpenRestockModal={handleOpenRestock}
              onOpenMovementHistoryModal={handleOpenMovementHistory}
              onNavigateToImport={() => setCurrentTab('import')}
            />
          )}

          {currentTab === 'import' && (
            <ImportProductsPage 
              onNavigateToProducts={() => setCurrentTab('products')}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryPage onOpenRestockModal={handleOpenRestock} />
          )}

          {currentTab === 'catalog' && <CatalogPage />}

          {currentTab === 'clients' && <ClientsPage />}

          {currentTab === 'expenses' && <ExpensesPage />}

          {/* Protected Administrative Routes */}
          {currentTab === 'reports' && (
            isSuperOrAdmin ? (
              <ReportsPage />
            ) : (
              <ProtectedRouteFallback
                tabName="Reportes y Cierres de Caja"
                userRole={activeRole}
                onBackToDashboard={() => setCurrentTab('dashboard')}
              />
            )
          )}

          {currentTab === 'employees' && (
            isSuperOrAdmin ? (
              <EmployeesPage />
            ) : (
              <ProtectedRouteFallback
                tabName="Equipo y Permisos"
                userRole={activeRole}
                onBackToDashboard={() => setCurrentTab('dashboard')}
              />
            )
          )}

          {currentTab === 'settings' && (
            isSuperOrAdmin ? (
              <SettingsPage />
            ) : (
              <ProtectedRouteFallback
                tabName="Configuración & Integraciones"
                userRole={activeRole}
                onBackToDashboard={() => setCurrentTab('dashboard')}
              />
            )
          )}
        </main>
      </div>

      {/* Global Modals */}
      <RestockModal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        targetProduct={restockTargetProduct}
      />

      <MovementHistoryModal
        product={historyTargetProduct}
        onClose={() => setHistoryModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
