export type UserRole = 'propietario' | 'administrador' | 'empleado' | 'solo_lectura' | string;

export interface RolePermissionSet {
  canPos: boolean;                 // Cobrar y registrar ventas en POS
  canReposition: boolean;          // Anular ventas y reponer mercadería
  canEditProducts: boolean;        // Alta y edición de precios y productos
  canAdjustStock: boolean;         // Cargar entradas y ajustes de inventario
  canViewMargins: boolean;         // Ver costos y márgenes de ganancia
  canManageExpenses: boolean;      // Cargar gastos operativos de caja
  canConfigureIntegrations: boolean; // Configurar Google Sheets y Firebase
  canManageEmployees: boolean;     // Administrar colaboradores y roles
}

export interface RoleDefinition {
  id: string;
  name: string;
  label: string;
  description: string;
  badgeBg: string;
  badgeColor?: string;
  isSystem: boolean;
  permissions: RolePermissionSet;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  avatarColor: string;
  lastActive?: string;
}

export type ProductUnit = 'unidad' | 'kg' | 'litro' | 'caja' | 'pack' | 'metro';

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  supplierCode?: string;
  name: string;
  brand?: string;
  presentation?: string;
  description: string;
  category: string;
  salePrice: number;
  unitCost: number;
  stock: number;
  minStock: number;
  unit: ProductUnit;
  supplier?: string;
  imageUrl?: string;
  status: 'activo' | 'inactivo';
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 
  | 'entrada' 
  | 'salida_venta' 
  | 'salida_merma' 
  | 'ajuste_positivo' 
  | 'ajuste_negativo' 
  | 'anulacion_venta';

export interface InventoryMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  productSku: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  resultingStock: number;
  employeeId: string;
  employeeName: string;
  observation: string;
  saleId?: string;
  referenceDoc?: string;
  syncedToSheets?: boolean;
}

export interface Client {
  id: string;
  name: string;
  taxId?: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  totalPurchases: number;
  lastPurchaseDate?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  productSku: string;
  unit: ProductUnit;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  subtotal: number;
}

export type PaymentMethod = 
  | 'efectivo' 
  | 'transferencia' 
  | 'tarjeta_debito' 
  | 'tarjeta_credito' 
  | 'cuenta_corriente' 
  | 'otro';

export type SaleStatus = 'completada' | 'anulada';
export type SyncStatus = 'pendiente' | 'sincronizado' | 'error';

export interface Sale {
  id: string;
  saleNumber: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: SaleStatus;
  employeeId: string;
  employeeName: string;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  syncStatus: SyncStatus;
  sheetsRowId?: string;
  syncError?: string;
  syncedAt?: string;
}

export type ExpenseCategory = 
  | 'proveedores' 
  | 'alquiler' 
  | 'servicios' 
  | 'sueldos' 
  | 'impuestos' 
  | 'mantenimiento' 
  | 'marketing' 
  | 'logistica' 
  | 'otros';

export interface Expense {
  id: string;
  date: string;
  concept: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  employeeId: string;
  employeeName: string;
  notes?: string;
  receiptNumber?: string;
  syncStatus: SyncStatus;
  syncedAt?: string;
  syncError?: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  module: 'ventas' | 'inventario' | 'productos' | 'clientes' | 'gastos';
  action: 'create' | 'update' | 'sync' | 'retry';
  status: 'completado' | 'pendiente' | 'error';
  message: string;
  itemCount?: number;
  details?: string;
}

export interface BusinessConfig {
  name: string;
  legalName: string;
  taxId: string;
  address: string;
  phone: string;
  currencySymbol: string;
  lowStockThresholdNotification: boolean;
  autoSyncSheets: boolean;
  sheetsSpreadsheetId: string;
  sheetsConnected: boolean;
  firebaseConnected: boolean;
  demoMode: boolean;
}

export interface FilterPeriod {
  from?: string;
  to?: string;
  preset: 'hoy' | 'ayer' | 'ultimos_7_dias' | 'este_mes' | 'mes_anterior' | 'todo';
}

export type ImportMatchAction = 
  | 'crear_nuevo' 
  | 'actualizar_costo' 
  | 'actualizar_todo' 
  | 'vincular' 
  | 'omitir';

export interface ImportedProductRow {
  id: string;
  selected: boolean;
  sourceRowIndex: number;
  code: string;
  barcode?: string;
  supplierCode?: string;
  name: string;
  brand?: string;
  category: string;
  presentation?: string;
  unit: ProductUnit;
  quantity: number;
  unitCost: number;
  suggestedSalePrice: number;
  totalPrice: number;
  supplier?: string;
  validationStatus: 'valido' | 'advertencia' | 'error';
  validationErrors: string[];
  matchType: 'nuevo' | 'existente_exacto' | 'existente_similar';
  matchedProductId?: string;
  matchedProductSku?: string;
  matchedProductName?: string;
  matchedCurrentCost?: number;
  matchedCurrentSalePrice?: number;
  matchedCurrentStock?: number;
  action: ImportMatchAction;
  diffs: string[];
}

export interface ImportBatch {
  id: string;
  date: string;
  fileName: string;
  fileType: 'xlsx' | 'xls' | 'csv' | 'pdf' | 'imagen';
  fileSize: number;
  documentNumber?: string;
  documentDate?: string;
  supplierName?: string;
  employeeId: string;
  employeeName: string;
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  stockMovementsCount: number;
  totalPurchasedAmount: number;
  stockReceptionRecorded: boolean;
  errorsCount: number;
  status: 'completado' | 'parcial' | 'error';
  items?: ImportedProductRow[];
}

