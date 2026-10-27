import { Product, Client, Sale, InventoryMovement, Expense, Employee, BusinessConfig, SyncLog, RoleDefinition } from '../types';

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'propietario',
    name: 'Propietario',
    label: 'Propietario (Acceso Total)',
    description: 'Acceso total y administración de credenciales, configuración y roles',
    badgeBg: 'bg-[#101820] text-[#35D0BA] border border-[#35D0BA]/30',
    isSystem: true,
    permissions: {
      canPos: true,
      canReposition: true,
      canEditProducts: true,
      canAdjustStock: true,
      canViewMargins: true,
      canManageExpenses: true,
      canConfigureIntegrations: true,
      canManageEmployees: true,
    }
  },
  {
    id: 'administrador',
    name: 'Administrador',
    label: 'Administrador de Tienda',
    description: 'Gestión de productos, stock, clientes, reportes y caja',
    badgeBg: 'bg-[#35D0BA]/20 text-[#101820] border border-[#35D0BA]/40',
    isSystem: true,
    permissions: {
      canPos: true,
      canReposition: true,
      canEditProducts: true,
      canAdjustStock: true,
      canViewMargins: true,
      canManageExpenses: true,
      canConfigureIntegrations: true,
      canManageEmployees: false,
    }
  },
  {
    id: 'empleado',
    name: 'Empleado / Ventas',
    label: 'Empleado / Ventas (Cajero)',
    description: 'Cobro en POS, emisión de tickets, recepción de mercadería y consulta de stock',
    badgeBg: 'bg-[#F5A623]/20 text-[#101820] border border-[#F5A623]/40',
    isSystem: true,
    permissions: {
      canPos: true,
      canReposition: false,
      canEditProducts: false,
      canAdjustStock: true,
      canViewMargins: false,
      canManageExpenses: true,
      canConfigureIntegrations: false,
      canManageEmployees: false,
    }
  },
  {
    id: 'solo_lectura',
    name: 'Solo Lectura (Auditoría)',
    label: 'Solo Lectura (Auditoría Externa)',
    description: 'Visualización de reportes sin permisos de mutación operativa',
    badgeBg: 'bg-gray-200 text-gray-700 border border-gray-300',
    isSystem: true,
    permissions: {
      canPos: false,
      canReposition: false,
      canEditProducts: false,
      canAdjustStock: false,
      canViewMargins: true,
      canManageExpenses: false,
      canConfigureIntegrations: false,
      canManageEmployees: false,
    }
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-01',
    name: 'Martín Gómez',
    email: 'martin.gomez@nexo360.com',
    role: 'propietario',
    active: true,
    avatarColor: '#101820',
    lastActive: 'Hace 5 min'
  },
  {
    id: 'emp-02',
    name: 'Lucía Fernández',
    email: 'lucia.f@nexo360.com',
    role: 'administrador',
    active: true,
    avatarColor: '#35D0BA',
    lastActive: 'Hace 12 min'
  },
  {
    id: 'emp-03',
    name: 'Carlos Vega',
    email: 'carlos.v@nexo360.com',
    role: 'empleado',
    active: true,
    avatarColor: '#F5A623',
    lastActive: 'Hace 2 min'
  },
  {
    id: 'emp-04',
    name: 'Romina Solís (Auditoría)',
    email: 'auditoria@externa.com',
    role: 'solo_lectura',
    active: true,
    avatarColor: '#64748B',
    lastActive: 'Ayer'
  }
];

export const INITIAL_CONFIG: BusinessConfig = {
  name: 'NEXO 360 Store Central',
  legalName: 'Distribuidora NEXO S.A.S.',
  taxId: '30-71649281-9',
  address: 'Av. Corrientes 2450, CABA',
  phone: '+54 11 4820-9900',
  currencySymbol: '$',
  lowStockThresholdNotification: true,
  autoSyncSheets: true,
  sheetsSpreadsheetId: '',
  sheetsConnected: false,
  firebaseConnected: false,
  demoMode: true
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'Distribuidora San Telmo',
    taxId: '30-68945123-2',
    phone: '+54 11 5590-1122',
    email: 'compras@santelmodist.com',
    address: 'Defensa 842, San Telmo',
    notes: 'Cliente mayorista frecuente con cuenta al día.',
    createdAt: '2026-01-15T09:30:00Z',
    totalPurchases: 452800,
    lastPurchaseDate: '2026-10-25T16:40:00Z'
  },
  {
    id: 'cli-002',
    name: 'Mariana Rossi',
    taxId: '27-34589120-4',
    phone: '+54 11 4981-6677',
    email: 'mariana.rossi@gmail.com',
    address: 'Av. Santa Fe 3120, 4B',
    notes: 'Cliente minorista preferente.',
    createdAt: '2026-03-02T11:15:00Z',
    totalPurchases: 78500,
    lastPurchaseDate: '2026-10-26T10:15:00Z'
  },
  {
    id: 'cli-003',
    name: 'Gastronomía Del Parque S.R.L.',
    taxId: '33-71029481-9',
    phone: '+54 11 6390-8800',
    email: 'administracion@delparquegastro.com',
    address: 'Av. Juramento 1850, Belgrano',
    notes: 'Entrega en depósito los martes y jueves.',
    createdAt: '2026-02-20T14:00:00Z',
    totalPurchases: 890400,
    lastPurchaseDate: '2026-10-24T18:00:00Z'
  },
  {
    id: 'cli-004',
    name: 'Esteban Morales',
    taxId: '20-31849201-3',
    phone: '+54 11 3411-9022',
    email: 'esteban.morales@hotmail.com',
    address: 'Thames 1420, Palermo',
    notes: 'Pagos habituales con transferencia bancaria.',
    createdAt: '2026-05-10T16:20:00Z',
    totalPurchases: 134200,
    lastPurchaseDate: '2026-10-22T12:30:00Z'
  },
  {
    id: 'cli-005',
    name: 'Consumidor Final',
    phone: 'Sin teléfono',
    notes: 'Registro rápido para ventas de mostrador.',
    createdAt: '2026-01-01T08:00:00Z',
    totalPurchases: 320900,
    lastPurchaseDate: '2026-10-26T11:45:00Z'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    sku: 'BEV-001',
    barcode: '7791234567890',
    supplierCode: 'AND-CF-01',
    name: 'Café de Especialidad Colombia 1kg',
    brand: 'Café Andino',
    presentation: '1kg',
    description: 'Grano tostado medio de origen Huila, notas a caramelo y frutos rojos.',
    category: 'Cafetería',
    salePrice: 18500,
    unitCost: 11200,
    stock: 24,
    minStock: 10,
    unit: 'unidad',
    supplier: 'Importadora Café Andino',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop&q=60',
    status: 'activo',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-10-24T14:30:00Z'
  },
  {
    id: 'prod-002',
    sku: 'BEV-002',
    barcode: '7791234567891',
    supplierCode: 'AND-ESP-05',
    name: 'Café Espresso Blend Intenso 500g',
    brand: 'Café Andino',
    presentation: '500g',
    description: 'Mezcla equilibrada arábica y robusta con cuerpo pronunciado.',
    category: 'Cafetería',
    salePrice: 10200,
    unitCost: 5900,
    stock: 5, // Low stock alert!
    minStock: 8,
    unit: 'unidad',
    supplier: 'Importadora Café Andino',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=60',
    status: 'activo',
    createdAt: '2026-01-10T10:15:00Z',
    updatedAt: '2026-10-25T11:00:00Z'
  },
  {
    id: 'prod-003',
    sku: 'ACC-101',
    barcode: '7798889990001',
    supplierCode: 'TH-450-SS',
    name: 'Taza Térmica Acero Inoxidable 450ml',
    brand: 'ThermoTech',
    presentation: '450ml',
    description: 'Doble capa con sellado al vacío, conserva 8h frío y 6h calor.',
    category: 'Accesorios',
    salePrice: 14900,
    unitCost: 7800,
    stock: 38,
    minStock: 12,
    unit: 'unidad',
    supplier: 'ThermoTech Supplies',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&auto=format&fit=crop&q=60',
    status: 'activo',
    createdAt: '2026-02-05T09:00:00Z',
    updatedAt: '2026-10-18T16:00:00Z'
  },
  {
    id: 'prod-004',
    sku: 'ACC-102',
    barcode: '7798889990002',
    supplierCode: 'BT-GRIND-01',
    name: 'Molinillo Manual Cónico Cerámico',
    brand: 'Barista Tools Co.',
    presentation: 'Manual',
    description: 'Regulación de molienda de espresso a prensa francesa con manivela ergonómica.',
    category: 'Accesorios',
    salePrice: 28900,
    unitCost: 16500,
    stock: 3, // Low stock alert!
    minStock: 5,
    unit: 'unidad',
    supplier: 'Barista Tools Co.',
    imageUrl: 'https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?w=400&auto=format&fit=crop&q=60',
    status: 'activo',
    createdAt: '2026-02-12T11:30:00Z',
    updatedAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'prod-005',
    sku: 'ALI-201',
    barcode: '7795554443331',
    supplierCode: 'CS-ALF-12',
    name: 'Caja Alfajores Artesanales x12',
    brand: 'Chocolatería del Sur',
    presentation: 'Caja x12',
    description: 'Relleno de dulce de leche premium bañado en chocolate amargo 70%.',
    category: 'Pastelería',
    salePrice: 12500,
    unitCost: 7200,
    stock: 42,
    minStock: 15,
    unit: 'caja',
    supplier: 'Chocolatería del Sur',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=60',
    status: 'activo',
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-10-25T09:30:00Z'
  },
  {
    id: 'prod-006',
    sku: 'ALI-202',
    barcode: '7795554443332',
    supplierCode: 'CS-COOK-250',
    name: 'Cookies Avena, Miel y Chips 250g',
    brand: 'Chocolatería del Sur',
    presentation: '250g',
    description: 'Elaboración artesanal sin conservantes ni grasas hidrogenadas.',
    category: 'Pastelería',
    salePrice: 4800,
    unitCost: 2600,
    stock: 2, // Low stock alert!
    minStock: 10,
    unit: 'pack',
    supplier: 'Chocolatería del Sur',
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop&q=60',
    status: 'activo',
    createdAt: '2026-03-05T12:00:00Z',
    updatedAt: '2026-10-26T08:00:00Z'
  },
  {
    id: 'prod-007',
    sku: 'MAT-301',
    barcode: '7792223334441',
    supplierCode: 'BT-V60-02',
    name: 'Filtros de Papel V60 Tamaño 02 (100u)',
    brand: 'Barista Tools Co.',
    presentation: '100u',
    description: 'Papel blanqueado sin olor, extracción balanceada sin residuos.',
    category: 'Insumos',
    salePrice: 8500,
    unitCost: 4500,
    stock: 65,
    minStock: 20,
    unit: 'pack',
    supplier: 'Barista Tools Co.',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&auto=format&fit=crop&q=60',
    status: 'activo',
    createdAt: '2026-02-15T15:00:00Z',
    updatedAt: '2026-10-22T13:40:00Z'
  },
  {
    id: 'prod-008',
    sku: 'MAT-302',
    barcode: '7797778889991',
    supplierCode: 'VP-ALM-1L',
    name: 'Leche de Almendras Barista Edition 1L',
    brand: 'Veggie Prime',
    presentation: '1 Litro',
    description: 'Fórmula especial para espumado cremoso y arte latte vegetal.',
    category: 'Insumos',
    salePrice: 3800,
    unitCost: 2200,
    stock: 48,
    minStock: 18,
    unit: 'litro',
    supplier: 'Lácteos & Veggie Prime',
    imageUrl: 'https://images.unsplash.com/photo-1568651767672-019689874cb1?w=400&auto=format&fit=crop&q=60',
    status: 'activo',
    createdAt: '2026-04-01T09:00:00Z',
    updatedAt: '2026-10-24T18:00:00Z'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-101',
    saleNumber: 'V-001041',
    date: '2026-10-26T10:15:00Z',
    items: [
      {
        productId: 'prod-001',
        productName: 'Café de Especialidad Colombia 1kg',
        productSku: 'BEV-001',
        unit: 'unidad',
        quantity: 2,
        unitPrice: 18500,
        unitCost: 11200,
        subtotal: 37000
      },
      {
        productId: 'prod-005',
        productName: 'Caja Alfajores Artesanales x12',
        productSku: 'ALI-201',
        unit: 'caja',
        quantity: 1,
        unitPrice: 12500,
        unitCost: 7200,
        subtotal: 12500
      }
    ],
    subtotal: 49500,
    discount: 0,
    total: 49500,
    status: 'completada',
    employeeId: 'emp-03',
    employeeName: 'Carlos Vega',
    clientId: 'cli-002',
    clientName: 'Mariana Rossi',
    clientPhone: '+54 11 4981-6677',
    paymentMethod: 'tarjeta_debito',
    notes: 'Pago posnet aprobado.',
    syncStatus: 'sincronizado',
    sheetsRowId: 'row-101',
    syncedAt: '2026-10-26T10:15:30Z'
  },
  {
    id: 'sale-102',
    saleNumber: 'V-001042',
    date: '2026-10-26T11:45:00Z',
    items: [
      {
        productId: 'prod-003',
        productName: 'Taza Térmica Acero Inoxidable 450ml',
        productSku: 'ACC-101',
        unit: 'unidad',
        quantity: 1,
        unitPrice: 14900,
        unitCost: 7800,
        subtotal: 14900
      },
      {
        productId: 'prod-007',
        productName: 'Filtros de Papel V60 Tamaño 02 (100u)',
        productSku: 'MAT-301',
        unit: 'pack',
        quantity: 2,
        unitPrice: 8500,
        unitCost: 4500,
        subtotal: 17000
      }
    ],
    subtotal: 31900,
    discount: 1900,
    total: 30000,
    status: 'completada',
    employeeId: 'emp-03',
    employeeName: 'Carlos Vega',
    clientId: 'cli-005',
    clientName: 'Consumidor Final',
    paymentMethod: 'efectivo',
    notes: 'Descuento cliente mostrador.',
    syncStatus: 'sincronizado',
    sheetsRowId: 'row-102',
    syncedAt: '2026-10-26T11:45:20Z'
  },
  {
    id: 'sale-103',
    saleNumber: 'V-001043',
    date: '2026-10-25T16:40:00Z',
    items: [
      {
        productId: 'prod-001',
        productName: 'Café de Especialidad Colombia 1kg',
        productSku: 'BEV-001',
        unit: 'unidad',
        quantity: 10,
        unitPrice: 17500,
        unitCost: 11200,
        subtotal: 175000
      },
      {
        productId: 'prod-008',
        productName: 'Leche de Almendras Barista Edition 1L',
        productSku: 'MAT-302',
        unit: 'litro',
        quantity: 24,
        unitPrice: 3500,
        unitCost: 2200,
        subtotal: 84000
      }
    ],
    subtotal: 259000,
    discount: 9000,
    total: 250000,
    status: 'completada',
    employeeId: 'emp-02',
    employeeName: 'Lucía Fernández',
    clientId: 'cli-001',
    clientName: 'Distribuidora San Telmo',
    clientPhone: '+54 11 5590-1122',
    paymentMethod: 'transferencia',
    notes: 'Factura A N° 0004-00001290.',
    syncStatus: 'sincronizado',
    sheetsRowId: 'row-103',
    syncedAt: '2026-10-25T16:42:10Z'
  },
  {
    id: 'sale-104',
    saleNumber: 'V-001044',
    date: '2026-10-24T18:00:00Z',
    items: [
      {
        productId: 'prod-004',
        productName: 'Molinillo Manual Cónico Cerámico',
        productSku: 'ACC-102',
        unit: 'unidad',
        quantity: 2,
        unitPrice: 28900,
        unitCost: 16500,
        subtotal: 57800
      },
      {
        productId: 'prod-005',
        productName: 'Caja Alfajores Artesanales x12',
        productSku: 'ALI-201',
        unit: 'caja',
        quantity: 5,
        unitPrice: 12500,
        unitCost: 7200,
        subtotal: 62500
      }
    ],
    subtotal: 120300,
    discount: 0,
    total: 120300,
    status: 'completada',
    employeeId: 'emp-01',
    employeeName: 'Martín Gómez',
    clientId: 'cli-003',
    clientName: 'Gastronomía Del Parque S.R.L.',
    paymentMethod: 'cuenta_corriente',
    notes: 'Plazo 15 días.',
    syncStatus: 'sincronizado',
    sheetsRowId: 'row-104',
    syncedAt: '2026-10-24T18:05:00Z'
  },
  {
    id: 'sale-105',
    saleNumber: 'V-001045',
    date: '2026-10-23T14:20:00Z',
    items: [
      {
        productId: 'prod-002',
        productName: 'Café Espresso Blend Intenso 500g',
        productSku: 'BEV-002',
        unit: 'unidad',
        quantity: 4,
        unitPrice: 10200,
        unitCost: 5900,
        subtotal: 40800
      }
    ],
    subtotal: 40800,
    discount: 0,
    total: 40800,
    status: 'completada',
    employeeId: 'emp-03',
    employeeName: 'Carlos Vega',
    clientId: 'cli-005',
    clientName: 'Consumidor Final',
    paymentMethod: 'tarjeta_credito',
    notes: '1 pago sin interés.',
    syncStatus: 'sincronizado',
    sheetsRowId: 'row-105',
    syncedAt: '2026-10-23T14:21:00Z'
  },
  {
    id: 'sale-106',
    saleNumber: 'V-001046',
    date: '2026-10-22T12:30:00Z',
    items: [
      {
        productId: 'prod-003',
        productName: 'Taza Térmica Acero Inoxidable 450ml',
        productSku: 'ACC-101',
        unit: 'unidad',
        quantity: 2,
        unitPrice: 14900,
        unitCost: 7800,
        subtotal: 29800
      },
      {
        productId: 'prod-006',
        productName: 'Cookies Avena, Miel y Chips 250g',
        productSku: 'ALI-202',
        unit: 'pack',
        quantity: 4,
        unitPrice: 4800,
        unitCost: 2600,
        subtotal: 19200
      }
    ],
    subtotal: 49000,
    discount: 0,
    total: 49000,
    status: 'completada',
    employeeId: 'emp-03',
    employeeName: 'Carlos Vega',
    clientId: 'cli-004',
    clientName: 'Esteban Morales',
    paymentMethod: 'transferencia',
    notes: 'Comprobante recibido por WhatsApp.',
    syncStatus: 'sincronizado',
    sheetsRowId: 'row-106',
    syncedAt: '2026-10-22T12:35:00Z'
  },
  {
    id: 'sale-107',
    saleNumber: 'V-001047',
    date: '2026-10-21T17:10:00Z',
    items: [
      {
        productId: 'prod-005',
        productName: 'Caja Alfajores Artesanales x12',
        productSku: 'ALI-201',
        unit: 'caja',
        quantity: 6,
        unitPrice: 12500,
        unitCost: 7200,
        subtotal: 75000
      }
    ],
    subtotal: 75000,
    discount: 0,
    total: 75000,
    status: 'completada',
    employeeId: 'emp-02',
    employeeName: 'Lucía Fernández',
    clientId: 'cli-005',
    clientName: 'Consumidor Final',
    paymentMethod: 'efectivo',
    notes: 'Pedido para evento.',
    syncStatus: 'sincronizado',
    sheetsRowId: 'row-107',
    syncedAt: '2026-10-21T17:15:00Z'
  },
  {
    id: 'sale-108',
    saleNumber: 'V-001048',
    date: '2026-10-20T11:00:00Z',
    items: [
      {
        productId: 'prod-001',
        productName: 'Café de Especialidad Colombia 1kg',
        productSku: 'BEV-001',
        unit: 'unidad',
        quantity: 3,
        unitPrice: 18500,
        unitCost: 11200,
        subtotal: 55500
      }
    ],
    subtotal: 55500,
    discount: 0,
    total: 55500,
    status: 'completada',
    employeeId: 'emp-01',
    employeeName: 'Martín Gómez',
    clientId: 'cli-002',
    clientName: 'Mariana Rossi',
    paymentMethod: 'tarjeta_debito',
    notes: 'Compra presencial.',
    syncStatus: 'sincronizado',
    sheetsRowId: 'row-108',
    syncedAt: '2026-10-20T11:05:00Z'
  }
];

export const INITIAL_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'mov-001',
    date: '2026-10-26T11:45:00Z',
    productId: 'prod-003',
    productName: 'Taza Térmica Acero Inoxidable 450ml',
    productSku: 'ACC-101',
    type: 'salida_venta',
    quantity: 1,
    previousStock: 39,
    resultingStock: 38,
    employeeId: 'emp-03',
    employeeName: 'Carlos Vega',
    observation: 'Venta V-001042',
    saleId: 'sale-102',
    syncedToSheets: true
  },
  {
    id: 'mov-002',
    date: '2026-10-26T11:45:00Z',
    productId: 'prod-007',
    productName: 'Filtros de Papel V60 Tamaño 02 (100u)',
    productSku: 'MAT-301',
    type: 'salida_venta',
    quantity: 2,
    previousStock: 67,
    resultingStock: 65,
    employeeId: 'emp-03',
    employeeName: 'Carlos Vega',
    observation: 'Venta V-001042',
    saleId: 'sale-102',
    syncedToSheets: true
  },
  {
    id: 'mov-003',
    date: '2026-10-26T10:15:00Z',
    productId: 'prod-001',
    productName: 'Café de Especialidad Colombia 1kg',
    productSku: 'BEV-001',
    type: 'salida_venta',
    quantity: 2,
    previousStock: 26,
    resultingStock: 24,
    employeeId: 'emp-03',
    employeeName: 'Carlos Vega',
    observation: 'Venta V-001041',
    saleId: 'sale-101',
    syncedToSheets: true
  },
  {
    id: 'mov-004',
    date: '2026-10-26T08:30:00Z',
    productId: 'prod-008',
    productName: 'Leche de Almendras Barista Edition 1L',
    productSku: 'MAT-302',
    type: 'entrada',
    quantity: 30,
    previousStock: 18,
    resultingStock: 48,
    employeeId: 'emp-02',
    employeeName: 'Lucía Fernández',
    observation: 'Recepción pedido semanal Remito #44910',
    referenceDoc: 'REM-44910',
    syncedToSheets: true
  },
  {
    id: 'mov-005',
    date: '2026-10-25T17:00:00Z',
    productId: 'prod-006',
    productName: 'Cookies Avena, Miel y Chips 250g',
    productSku: 'ALI-202',
    type: 'salida_merma',
    quantity: 1,
    previousStock: 3,
    resultingStock: 2,
    employeeId: 'emp-02',
    employeeName: 'Lucía Fernández',
    observation: 'Paquete dañado en exhibidor.',
    syncedToSheets: true
  },
  {
    id: 'mov-006',
    date: '2026-10-25T16:40:00Z',
    productId: 'prod-001',
    productName: 'Café de Especialidad Colombia 1kg',
    productSku: 'BEV-001',
    type: 'salida_venta',
    quantity: 10,
    previousStock: 36,
    resultingStock: 26,
    employeeId: 'emp-02',
    employeeName: 'Lucía Fernández',
    observation: 'Venta mayorista V-001043',
    saleId: 'sale-103',
    syncedToSheets: true
  },
  {
    id: 'mov-007',
    date: '2026-10-24T09:00:00Z',
    productId: 'prod-005',
    productName: 'Caja Alfajores Artesanales x12',
    productSku: 'ALI-201',
    type: 'entrada',
    quantity: 50,
    previousStock: -3,
    resultingStock: 47,
    employeeId: 'emp-01',
    employeeName: 'Martín Gómez',
    observation: 'Ingreso lote fresco fábrica Chocolatería del Sur',
    referenceDoc: 'FAC-B-8921',
    syncedToSheets: true
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-001',
    date: '2026-10-25T15:30:00Z',
    concept: 'Pago Abono Internet Fibra Óptica 500MB',
    category: 'servicios',
    amount: 28500,
    paymentMethod: 'transferencia',
    employeeId: 'emp-01',
    employeeName: 'Martín Gómez',
    notes: 'Factura Telecom Octubre 2026',
    receiptNumber: 'FACT-0029-8812',
    syncStatus: 'sincronizado',
    syncedAt: '2026-10-25T15:35:00Z'
  },
  {
    id: 'exp-002',
    date: '2026-10-24T11:00:00Z',
    concept: 'Artículos de Limpieza e Higiene Local',
    category: 'mantenimiento',
    amount: 14200,
    paymentMethod: 'efectivo',
    employeeId: 'emp-02',
    employeeName: 'Lucía Fernández',
    notes: 'Ticket Química Belgrano',
    receiptNumber: 'TKT-99120',
    syncStatus: 'sincronizado',
    syncedAt: '2026-10-24T11:02:00Z'
  },
  {
    id: 'exp-003',
    date: '2026-10-22T10:15:00Z',
    concept: 'Servicio de Mensajería y Envíos Clientes',
    category: 'logistica',
    amount: 18900,
    paymentMethod: 'transferencia',
    employeeId: 'emp-03',
    employeeName: 'Carlos Vega',
    notes: 'Pack 10 envíos en moto CABA',
    receiptNumber: 'LOG-4412',
    syncStatus: 'sincronizado',
    syncedAt: '2026-10-22T10:20:00Z'
  },
  {
    id: 'exp-004',
    date: '2026-10-20T16:00:00Z',
    concept: 'Bolsas Kraft Biodegradables Impresas x500',
    category: 'proveedores',
    amount: 45000,
    paymentMethod: 'transferencia',
    employeeId: 'emp-01',
    employeeName: 'Martín Gómez',
    notes: 'Packaging con logo NEXO 360',
    receiptNumber: 'FAC-A-33291',
    syncStatus: 'sincronizado',
    syncedAt: '2026-10-20T16:05:00Z'
  }
];

export const INITIAL_SYNC_LOGS: SyncLog[] = [
  {
    id: 'sync-001',
    timestamp: '2026-10-26T11:45:20Z',
    module: 'ventas',
    action: 'sync',
    status: 'completado',
    message: 'Venta V-001042 registrada y sincronizada a cola operativa',
    itemCount: 2
  },
  {
    id: 'sync-002',
    timestamp: '2026-10-26T11:45:21Z',
    module: 'inventario',
    action: 'sync',
    status: 'completado',
    message: '2 movimientos de stock vinculados guardados con éxito',
    itemCount: 2
  },
  {
    id: 'sync-003',
    timestamp: '2026-10-26T10:15:30Z',
    module: 'ventas',
    action: 'sync',
    status: 'completado',
    message: 'Venta V-001041 sincronizada',
    itemCount: 2
  },
  {
    id: 'sync-004',
    timestamp: '2026-10-26T08:30:15Z',
    module: 'inventario',
    action: 'sync',
    status: 'completado',
    message: 'Entrada de mercadería: +30 Leche de Almendras',
    itemCount: 1
  }
];
