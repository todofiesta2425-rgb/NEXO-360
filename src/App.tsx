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
import { RestockModal } from './components/modals/RestockModal';
import { MovementHistoryModal } from './components/modals/MovementHistoryModal';
import { storageService } from './services/storageService';
import { Product, Employee, BusinessConfig } from './types';

export default function App() {
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

  return (
    <div className="min-h-screen bg-[#F2F4F6] text-[#101820] flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole={currentEmployee.role}
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

        {/* Dynamic Page Container */}
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

          {currentTab === 'reports' && <ReportsPage />}

          {currentTab === 'employees' && <EmployeesPage />}

          {currentTab === 'settings' && <SettingsPage />}
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
