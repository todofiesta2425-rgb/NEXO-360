import { 
  Product, 
  Client, 
  Sale, 
  InventoryMovement, 
  Expense, 
  Employee, 
  BusinessConfig, 
  SyncLog,
  SaleItem,
  PaymentMethod,
  MovementType,
  ImportBatch,
  ImportedProductRow
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CLIENTS,
  INITIAL_SALES,
  INITIAL_MOVEMENTS,
  INITIAL_EXPENSES,
  INITIAL_EMPLOYEES,
  INITIAL_CONFIG,
  INITIAL_SYNC_LOGS,
  DEFAULT_ROLES
} from '../data/mockData';
import { RoleDefinition } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'nexo360_products',
  CLIENTS: 'nexo360_clients',
  SALES: 'nexo360_sales',
  MOVEMENTS: 'nexo360_movements',
  EXPENSES: 'nexo360_expenses',
  EMPLOYEES: 'nexo360_employees',
  ROLES: 'nexo360_roles',
  CURRENT_EMP: 'nexo360_current_emp_id',
  CONFIG: 'nexo360_config',
  SYNC_LOGS: 'nexo360_sync_logs',
  IMPORT_BATCHES: 'nexo360_import_batches',
  IS_INITIALIZED: 'nexo360_initialized_v2'
};

class StorageService {
  private hasInitialized = false;

  constructor() {
    this.initIfEmpty();
  }

  private initIfEmpty() {
    if (typeof window === 'undefined') return;
    const isInit = localStorage.getItem(STORAGE_KEYS.IS_INITIALIZED);
    if (!isInit) {
      this.resetToDemo();
    }
    this.hasInitialized = true;
  }

  public resetToDemo(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(DEFAULT_ROLES));
    localStorage.setItem(STORAGE_KEYS.CURRENT_EMP, INITIAL_EMPLOYEES[0].id);
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
    localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(INITIAL_SYNC_LOGS));
    localStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, 'true');
    this.notifyChange();
  }

  // --- Reactive Listeners ---
  private listeners: (() => void)[] = [];

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyChange(): void {
    this.listeners.forEach(fn => fn());
  }

  // --- Config ---
  public getConfig(): BusinessConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return data ? JSON.parse(data) : INITIAL_CONFIG;
    } catch {
      return INITIAL_CONFIG;
    }
  }

  public updateConfig(patch: Partial<BusinessConfig>): BusinessConfig {
    const current = this.getConfig();
    const updated = { ...current, ...patch };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    this.notifyChange();
    return updated;
  }

  // --- Employees & Active Profile ---
  public getEmployees(): Employee[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  }

  public getCurrentEmployee(): Employee {
    const employees = this.getEmployees();
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_EMP);
    const found = employees.find(e => e.id === currentId);
    return found || employees[0] || INITIAL_EMPLOYEES[0];
  }

  public setCurrentEmployee(id: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_EMP, id);
    this.notifyChange();
  }

  public saveEmployee(employee: Employee): void {
    const employees = this.getEmployees();
    const index = employees.findIndex(e => e.id === employee.id);
    if (index >= 0) {
      employees[index] = employee;
    } else {
      employees.push(employee);
    }
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    this.notifyChange();
  }

  public deleteEmployee(id: string): { success: boolean; message?: string } {
    const employees = this.getEmployees();
    const currentEmp = this.getCurrentEmployee();

    if (id === currentEmp.id) {
      return { success: false, message: 'No podés eliminar tu propio perfil de sesión activa.' };
    }

    const empToDelete = employees.find(e => e.id === id);
    if (!empToDelete) {
      return { success: false, message: 'El colaborador no existe.' };
    }

    if (empToDelete.role === 'propietario') {
      const ownersCount = employees.filter(e => e.role === 'propietario').length;
      if (ownersCount <= 1) {
        return { success: false, message: 'El sistema debe conservar al menos un Propietario con acceso total.' };
      }
    }

    const updated = employees.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updated));
    this.notifyChange();
    return { success: true };
  }

  // --- Roles Operativos y Permisos ---
  public getRoles(): RoleDefinition[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROLES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_ROLES;
  }

  public saveRole(role: RoleDefinition): void {
    const roles = this.getRoles();
    const index = roles.findIndex(r => r.id === role.id);
    if (index >= 0) {
      roles[index] = role;
    } else {
      roles.push(role);
    }
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
    this.notifyChange();
  }

  public deleteRole(roleId: string): { success: boolean; message?: string } {
    const roles = this.getRoles();
    const roleToDelete = roles.find(r => r.id === roleId);

    if (!roleToDelete) {
      return { success: false, message: 'El rol no existe.' };
    }
    if (roleToDelete.isSystem) {
      return { success: false, message: 'No se pueden eliminar los roles base del sistema (Propietario, Administrador, Empleado, Solo Lectura).' };
    }

    const employees = this.getEmployees();
    const assignedCount = employees.filter(e => e.role === roleId).length;
    if (assignedCount > 0) {
      return { 
        success: false, 
        message: `Hay ${assignedCount} colaborador(es) con este rol asignado. Reasigna sus roles antes de eliminarlo.` 
      };
    }

    const updated = roles.filter(r => r.id !== roleId);
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(updated));
    this.notifyChange();
    return { success: true };
  }

  // --- Products ---
  public getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  public saveProduct(product: Product): Product {
    const products = this.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      products[existingIndex] = { ...product, updatedAt: now };
    } else {
      products.unshift({
        ...product,
        createdAt: product.createdAt || now,
        updatedAt: now
      });
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notifyChange();
    return product;
  }

  public deleteOrDeactivateProduct(id: string): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index >= 0) {
      // Soft deactivate to preserve historical integrity
      products[index].status = 'inactivo';
      products[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.notifyChange();
    }
  }

  // --- Clients ---
  public getClients(): Client[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      return data ? JSON.parse(data) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  }

  public saveClient(client: Client): Client {
    const clients = this.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    if (index >= 0) {
      clients[index] = client;
    } else {
      clients.unshift({
        ...client,
        createdAt: client.createdAt || new Date().toISOString(),
        totalPurchases: client.totalPurchases || 0
      });
    }
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    this.notifyChange();
    return client;
  }

  // --- Inventory Movements ---
  public getMovements(): InventoryMovement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      return data ? JSON.parse(data) : INITIAL_MOVEMENTS;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  }

  public recordManualMovement(params: {
    productId: string;
    type: MovementType;
    quantity: number;
    observation: string;
    referenceDoc?: string;
  }): InventoryMovement {
    const products = this.getProducts();
    const product = products.find(p => p.id === params.productId);
    if (!product) {
      throw new Error(`Producto con ID ${params.productId} no encontrado`);
    }

    const currentEmp = this.getCurrentEmployee();
    const previousStock = product.stock;
    let resultingStock = previousStock;

    if (params.type === 'entrada' || params.type === 'ajuste_positivo' || params.type === 'anulacion_venta') {
      resultingStock = previousStock + params.quantity;
    } else {
      // salida_venta, salida_merma, ajuste_negativo
      resultingStock = Math.max(0, previousStock - params.quantity);
    }

    // Update product stock
    product.stock = resultingStock;
    product.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Create movement
    const movement: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      type: params.type,
      quantity: params.quantity,
      previousStock,
      resultingStock,
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      observation: params.observation,
      referenceDoc: params.referenceDoc,
      syncedToSheets: false
    };

    const movements = this.getMovements();
    movements.unshift(movement);
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));

    this.addSyncLog({
      module: 'inventario',
      action: 'create',
      status: 'completado',
      message: `Movimiento ${movement.type.toUpperCase()}: ${product.name} (${params.quantity > 0 ? '+' : ''}${params.quantity} ${product.unit})`,
      itemCount: 1
    });

    this.notifyChange();
    return movement;
  }

  // --- Sales ---
  public getSales(): Sale[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SALES);
      return data ? JSON.parse(data) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  }

  public createSale(params: {
    items: SaleItem[];
    clientId?: string;
    clientName?: string;
    clientPhone?: string;
    paymentMethod: PaymentMethod;
    discount?: number;
    notes?: string;
  }): Sale {
    if (!params.items || params.items.length === 0) {
      throw new Error('El carrito no contiene productos.');
    }

    const products = this.getProducts();
    const currentEmp = this.getCurrentEmployee();
    const now = new Date().toISOString();
    const saleId = `sale-${Date.now()}`;
    const nextSaleNum = `V-${String(this.getSales().length + 1041).padStart(6, '0')}`;

    // Subtotal and Total calculations
    const subtotal = params.items.reduce((acc, it) => acc + it.subtotal, 0);
    const discount = Math.max(0, params.discount || 0);
    const total = Math.max(0, subtotal - discount);

    // 1. Validate and Deduct Stock idempotently
    const createdMovements: InventoryMovement[] = [];

    for (const item of params.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const prevStock = prod.stock;
        const newStock = Math.max(0, prevStock - item.quantity);
        prod.stock = newStock;
        prod.updatedAt = now;

        createdMovements.push({
          id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          date: now,
          productId: prod.id,
          productName: prod.name,
          productSku: prod.sku,
          type: 'salida_venta',
          quantity: item.quantity,
          previousStock: prevStock,
          resultingStock: newStock,
          employeeId: currentEmp.id,
          employeeName: currentEmp.name,
          observation: `Venta ${nextSaleNum}`,
          saleId: saleId,
          syncedToSheets: false
        });
      }
    }

    // Save updated products
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Save inventory movements
    const movements = this.getMovements();
    movements.unshift(...createdMovements);
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));

    // 2. Update Client totals if client selected
    if (params.clientId) {
      const clients = this.getClients();
      const cli = clients.find(c => c.id === params.clientId);
      if (cli) {
        cli.totalPurchases = (cli.totalPurchases || 0) + total;
        cli.lastPurchaseDate = now;
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      }
    }

    // 3. Create Sale record
    const newSale: Sale = {
      id: saleId,
      saleNumber: nextSaleNum,
      date: now,
      items: params.items,
      subtotal,
      discount,
      total,
      status: 'completada',
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      clientId: params.clientId,
      clientName: params.clientName || 'Consumidor Final',
      clientPhone: params.clientPhone,
      paymentMethod: params.paymentMethod,
      notes: params.notes,
      syncStatus: 'pendiente', // Marked as pending until confirmed by Google Sheets sync
      syncedAt: undefined
    };

    const sales = this.getSales();
    sales.unshift(newSale);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

    this.addSyncLog({
      module: 'ventas',
      action: 'create',
      status: 'completado',
      message: `Venta ${newSale.saleNumber} confirmada ($${total.toLocaleString('es-AR')}) - Pendiente sync Sheets`,
      itemCount: params.items.length
    });

    this.notifyChange();
    return newSale;
  }

  public cancelSale(saleId: string, reason: string): Sale {
    const sales = this.getSales();
    const sale = sales.find(s => s.id === saleId);
    if (!sale) throw new Error(`Venta ${saleId} no encontrada`);
    if (sale.status === 'anulada') throw new Error('Esta venta ya se encuentra anulada');

    const products = this.getProducts();
    const currentEmp = this.getCurrentEmployee();
    const now = new Date().toISOString();

    // Revert stock idempotently for each item
    const createdMovements: InventoryMovement[] = [];
    for (const item of sale.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const prevStock = prod.stock;
        const newStock = prevStock + item.quantity;
        prod.stock = newStock;
        prod.updatedAt = now;

        createdMovements.push({
          id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          date: now,
          productId: prod.id,
          productName: prod.name,
          productSku: prod.sku,
          type: 'anulacion_venta',
          quantity: item.quantity,
          previousStock: prevStock,
          resultingStock: newStock,
          employeeId: currentEmp.id,
          employeeName: currentEmp.name,
          observation: `Anulación de venta ${sale.saleNumber}. Motivo: ${reason}`,
          saleId: sale.id,
          syncedToSheets: false
        });
      }
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    const movements = this.getMovements();
    movements.unshift(...createdMovements);
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));

    // Update sale status
    sale.status = 'anulada';
    sale.notes = sale.notes ? `${sale.notes} | ANULADA: ${reason}` : `ANULADA: ${reason}`;
    sale.syncStatus = 'pendiente';

    // If client had purchases, adjust
    if (sale.clientId) {
      const clients = this.getClients();
      const cli = clients.find(c => c.id === sale.clientId);
      if (cli) {
        cli.totalPurchases = Math.max(0, (cli.totalPurchases || 0) - sale.total);
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      }
    }

    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

    this.addSyncLog({
      module: 'ventas',
      action: 'update',
      status: 'completado',
      message: `Venta ${sale.saleNumber} anulada. Mercadería reincorporada al inventario.`,
      itemCount: sale.items.length
    });

    this.notifyChange();
    return sale;
  }

  // --- Expenses ---
  public getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  }

  public createExpense(params: {
    concept: string;
    category: Expense['category'];
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    receiptNumber?: string;
    date?: string;
  }): Expense {
    const currentEmp = this.getCurrentEmployee();
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      date: params.date || new Date().toISOString(),
      concept: params.concept,
      category: params.category,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      notes: params.notes,
      receiptNumber: params.receiptNumber,
      syncStatus: 'pendiente'
    };

    const expenses = this.getExpenses();
    expenses.unshift(newExpense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));

    this.addSyncLog({
      module: 'gastos',
      action: 'create',
      status: 'completado',
      message: `Gasto registrado: ${params.concept} ($${params.amount.toLocaleString('es-AR')})`,
      itemCount: 1
    });

    this.notifyChange();
    return newExpense;
  }

  // --- Sync Logs & Sync Status Updaters ---
  public getSyncLogs(): SyncLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
      return data ? JSON.parse(data) : INITIAL_SYNC_LOGS;
    } catch {
      return INITIAL_SYNC_LOGS;
    }
  }

  public addSyncLog(log: Omit<SyncLog, 'id' | 'timestamp'>): SyncLog {
    const fullLog: SyncLog = {
      ...log,
      id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    const logs = this.getSyncLogs();
    logs.unshift(fullLog);
    // keep last 50 logs
    localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(logs.slice(0, 50)));
    this.notifyChange();
    return fullLog;
  }

  public markSaleAsSynced(saleId: string, sheetsRowId?: string): void {
    const sales = this.getSales();
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
      sale.syncStatus = 'sincronizado';
      sale.syncedAt = new Date().toISOString();
      sale.sheetsRowId = sheetsRowId || sale.sheetsRowId || `row-${sale.saleNumber}`;
      sale.syncError = undefined;
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
      this.notifyChange();
    }
  }

  public markSaleAsSyncError(saleId: string, error: string): void {
    const sales = this.getSales();
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
      sale.syncStatus = 'error';
      sale.syncError = error;
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
      this.notifyChange();
    }
  }

  public markExpenseAsSynced(expenseId: string): void {
    const expenses = this.getExpenses();
    const exp = expenses.find(e => e.id === expenseId);
    if (exp) {
      exp.syncStatus = 'sincronizado';
      exp.syncedAt = new Date().toISOString();
      exp.syncError = undefined;
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      this.notifyChange();
    }
  }

  // --- Import Batches & Smart Product Import ---
  public getImportBatches(): ImportBatch[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IMPORT_BATCHES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveImportBatch(batch: ImportBatch): void {
    const batches = this.getImportBatches();
    batches.unshift(batch);
    localStorage.setItem(STORAGE_KEYS.IMPORT_BATCHES, JSON.stringify(batches.slice(0, 50)));
    this.notifyChange();
  }

  public executeProductImport(params: {
    rows: ImportedProductRow[];
    recordStockReception: boolean;
    fileName: string;
    fileType: any;
    fileSize: number;
    documentNumber?: string;
    documentDate?: string;
    supplierName?: string;
  }): {
    createdCount: number;
    updatedCount: number;
    skippedCount: number;
    movementsCount: number;
    totalPurchasedAmount: number;
  } {
    const products = this.getProducts();
    const currentEmp = this.getCurrentEmployee();
    const now = new Date().toISOString();

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let movementsCount = 0;
    let totalPurchasedAmount = 0;

    const newMovements: InventoryMovement[] = [];

    // Filter only selected rows
    const selectedRows = params.rows.filter(r => r.selected);

    for (const row of selectedRows) {
      if (row.action === 'omitir') {
        skippedCount++;
        continue;
      }

      totalPurchasedAmount += row.totalPrice;

      if (row.action === 'crear_nuevo') {
        // Create brand new product
        const newProduct: Product = {
          id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sku: row.code || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
          barcode: row.barcode || undefined,
          supplierCode: row.supplierCode || undefined,
          name: row.name.trim(),
          brand: row.brand || undefined,
          presentation: row.presentation || undefined,
          description: `Importado desde ${params.fileName} (${row.category})`,
          category: row.category || 'General',
          salePrice: row.suggestedSalePrice > 0 ? row.suggestedSalePrice : Math.round(row.unitCost * 1.5),
          unitCost: row.unitCost,
          stock: params.recordStockReception ? row.quantity : 0,
          minStock: 5,
          unit: row.unit || 'unidad',
          supplier: row.supplier || params.supplierName || undefined,
          status: 'activo',
          createdAt: now,
          updatedAt: now
        };

        products.unshift(newProduct);
        createdCount++;

        // If stock reception is confirmed, log the stock movement
        if (params.recordStockReception && row.quantity > 0) {
          newMovements.push({
            id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            date: now,
            productId: newProduct.id,
            productName: newProduct.name,
            productSku: newProduct.sku,
            type: 'entrada',
            quantity: row.quantity,
            previousStock: 0,
            resultingStock: row.quantity,
            employeeId: currentEmp.id,
            employeeName: currentEmp.name,
            observation: `Recepción importación ${params.documentNumber ? `Doc: ${params.documentNumber}` : params.fileName}`,
            referenceDoc: params.documentNumber || undefined,
            syncedToSheets: false
          });
          movementsCount++;
        }
      } else {
        // Matched existing product
        const existing = products.find(p => p.id === row.matchedProductId);
        if (existing) {
          const previousStock = existing.stock;
          let newStock = previousStock;

          if (row.action === 'actualizar_costo') {
            existing.unitCost = row.unitCost;
            existing.updatedAt = now;
            if (row.barcode && !existing.barcode) existing.barcode = row.barcode;
            if (row.supplierCode && !existing.supplierCode) existing.supplierCode = row.supplierCode;
          } else if (row.action === 'actualizar_todo') {
            existing.unitCost = row.unitCost;
            if (row.suggestedSalePrice > 0) existing.salePrice = row.suggestedSalePrice;
            if (row.barcode) existing.barcode = row.barcode;
            if (row.brand) existing.brand = row.brand;
            if (row.presentation) existing.presentation = row.presentation;
            if (row.category) existing.category = row.category;
            existing.updatedAt = now;
          } else if (row.action === 'vincular') {
            if (row.barcode && !existing.barcode) existing.barcode = row.barcode;
            if (row.supplierCode && !existing.supplierCode) existing.supplierCode = row.supplierCode;
            existing.updatedAt = now;
          }

          // Stock reception for existing product
          if (params.recordStockReception && row.quantity > 0) {
            newStock = previousStock + row.quantity;
            existing.stock = newStock;

            newMovements.push({
              id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              date: now,
              productId: existing.id,
              productName: existing.name,
              productSku: existing.sku,
              type: 'entrada',
              quantity: row.quantity,
              previousStock,
              resultingStock: newStock,
              employeeId: currentEmp.id,
              employeeName: currentEmp.name,
              observation: `Recepción importación ${params.documentNumber ? `Doc: ${params.documentNumber}` : params.fileName}`,
              referenceDoc: params.documentNumber || undefined,
              syncedToSheets: false
            });
            movementsCount++;
          }

          updatedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    // Save updated products
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Save new inventory movements if any
    if (newMovements.length > 0) {
      const movements = this.getMovements();
      movements.unshift(...newMovements);
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    }

    // Record import batch history
    const batch: ImportBatch = {
      id: `batch-${Date.now()}`,
      date: now,
      fileName: params.fileName,
      fileType: params.fileType,
      fileSize: params.fileSize,
      documentNumber: params.documentNumber,
      documentDate: params.documentDate,
      supplierName: params.supplierName,
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      totalRows: selectedRows.length,
      createdCount,
      updatedCount,
      skippedCount,
      stockMovementsCount: movementsCount,
      totalPurchasedAmount,
      stockReceptionRecorded: params.recordStockReception,
      errorsCount: 0,
      status: 'completado',
      items: selectedRows
    };

    this.saveImportBatch(batch);

    this.addSyncLog({
      module: 'productos',
      action: 'create',
      status: 'completado',
      message: `Importación exitosa de ${params.fileName}: ${createdCount} creados, ${updatedCount} actualizados, ${movementsCount} mov. stock.`,
      itemCount: createdCount + updatedCount
    });

    this.notifyChange();

    return {
      createdCount,
      updatedCount,
      skippedCount,
      movementsCount,
      totalPurchasedAmount
    };
  }

  // --- CSV Export (Zero-Cost and Fallback Guarantee) ---
  public exportTableToCsv(
    tableName: 'productos' | 'ventas' | 'inventario' | 'clientes' | 'gastos' | 'importaciones'
  ): void {
    let rows: Record<string, any>[] = [];
    let filename = `NEXO360_${tableName}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (tableName === 'productos') {
      rows = this.getProducts().map(p => ({
        SKU: p.sku,
        'Código de Barras': p.barcode || 'N/A',
        Nombre: p.name,
        Marca: p.brand || 'N/A',
        Presentación: p.presentation || 'N/A',
        Categoría: p.category,
        'Precio Venta': p.salePrice,
        Costo: p.unitCost,
        Stock: p.stock,
        'Stock Mínimo': p.minStock,
        Unidad: p.unit,
        Estado: p.status,
        Proveedor: p.supplier || 'N/A'
      }));
    } else if (tableName === 'ventas') {
      rows = this.getSales().map(s => ({
        'N° Venta': s.saleNumber,
        Fecha: s.date,
        Cliente: s.clientName,
        Empleado: s.employeeName,
        'Medio de Pago': s.paymentMethod,
        Subtotal: s.subtotal,
        Descuento: s.discount,
        Total: s.total,
        Estado: s.status,
        'Sync Sheets': s.syncStatus
      }));
    } else if (tableName === 'inventario') {
      rows = this.getMovements().map(m => ({
        Fecha: m.date,
        SKU: m.productSku,
        Producto: m.productName,
        Tipo: m.type,
        Cantidad: m.quantity,
        'Saldo Resultante': m.resultingStock,
        Responsable: m.employeeName,
        Observación: m.observation,
        'Ref Venta/Doc': m.saleId || m.referenceDoc || ''
      }));
    } else if (tableName === 'clientes') {
      rows = this.getClients().map(c => ({
        Nombre: c.name,
        'CUIT/DNI': c.taxId || 'N/A',
        Teléfono: c.phone,
        Email: c.email || 'N/A',
        Dirección: c.address || 'N/A',
        'Total Compras': c.totalPurchases,
        'Última Compra': c.lastPurchaseDate || 'N/A'
      }));
    } else if (tableName === 'gastos') {
      rows = this.getExpenses().map(e => ({
        Fecha: e.date,
        Concepto: e.concept,
        Categoría: e.category,
        Monto: e.amount,
        'Medio de Pago': e.paymentMethod,
        Responsable: e.employeeName,
        Comprobante: e.receiptNumber || 'N/A'
      }));
    } else if (tableName === 'importaciones') {
      rows = this.getImportBatches().map(b => ({
        Fecha: b.date,
        Archivo: b.fileName,
        Tipo: b.fileType,
        'Doc N°': b.documentNumber || 'N/A',
        Proveedor: b.supplierName || 'N/A',
        Operador: b.employeeName,
        'Productos Creados': b.createdCount,
        'Productos Actualizados': b.updatedCount,
        'Movimientos Stock': b.stockMovementsCount,
        'Monto Comprado': b.totalPurchasedAmount,
        Estado: b.status
      }));
    }

    if (rows.length === 0) {
      alert(`No hay registros para exportar en ${tableName}.`);
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => 
        headers.map(h => {
          const val = row[h] === undefined || row[h] === null ? '' : String(row[h]);
          return `"${val.replace(/"/g, '""')}"`;
        }).join(';')
      )
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const storageService = new StorageService();
