import { ImportedProductRow } from '../types';

export interface SampleDocumentPreset {
  id: string;
  name: string;
  fileName: string;
  fileType: 'xlsx' | 'csv' | 'pdf' | 'imagen';
  fileSize: number;
  documentNumber: string;
  documentDate: string;
  supplierName: string;
  description: string;
  rawTextPreview: string;
  detectedRows: Omit<ImportedProductRow, 'id' | 'selected' | 'validationStatus' | 'validationErrors' | 'matchType' | 'action' | 'diffs'>[];
}

export const SAMPLE_IMPORT_PRESETS: SampleDocumentPreset[] = [
  {
    id: 'sample-inv-01',
    name: 'Factura A — Distribuidora Café Andino',
    fileName: 'Factura_A_0004-00004812_Andino.pdf',
    fileType: 'pdf',
    fileSize: 184520,
    documentNumber: 'FC-A-0004-00004812',
    documentDate: '2026-10-25',
    supplierName: 'Importadora Café Andino S.A.',
    description: 'Factura con 2 artículos existentes (actualización de costos de compra) y 2 artículos nuevos.',
    rawTextPreview: `DISTRIBUIDORA CAFÉ ANDINO S.A. - CUIT: 30-71449911-3
FACTURA A N° 0004-00004812 - FECHA: 25/10/2026
CLIENTE: NEXO 360 STORE CENTRAL - CUIT: 30-71649281-9
-----------------------------------------------------------------------------------
CODIGO    COD.BARRAS      DESCRIPCION                 CANT.  P.UNITARIO   SUBTOTAL
AND-CF-01 7791234567890   Café Colombia Huila 1kg     20     $ 11.900,00  $ 238.000,00
AND-ESP-05 7791234567891  Café Espresso Blend 500g    15     $ 6.300,00   $  94.500,00
AND-BR-01 7791234567899   Café Brasil Santos 1kg      10     $ 12.800,00  $ 128.000,00
VAS-TR-24 7799991112223   Vaso Térmico Polipapel 240ml 50    $    450,00  $  22.500,00
-----------------------------------------------------------------------------------
SUBTOTAL GRAVADO: $ 483.000,00 | IVA 21%: $ 101.430,00 | TOTAL: $ 584.430,00`,
    detectedRows: [
      {
        sourceRowIndex: 1,
        code: 'BEV-001',
        barcode: '7791234567890',
        supplierCode: 'AND-CF-01',
        name: 'Café de Especialidad Colombia 1kg',
        brand: 'Café Andino',
        category: 'Cafetería',
        presentation: '1kg',
        unit: 'unidad',
        quantity: 20,
        unitCost: 11900,
        suggestedSalePrice: 19500,
        totalPrice: 238000,
        supplier: 'Importadora Café Andino S.A.'
      },
      {
        sourceRowIndex: 2,
        code: 'BEV-002',
        barcode: '7791234567891',
        supplierCode: 'AND-ESP-05',
        name: 'Café Espresso Blend Intenso 500g',
        brand: 'Café Andino',
        category: 'Cafetería',
        presentation: '500g',
        unit: 'unidad',
        quantity: 15,
        unitCost: 6300,
        suggestedSalePrice: 10800,
        totalPrice: 94500,
        supplier: 'Importadora Café Andino S.A.'
      },
      {
        sourceRowIndex: 3,
        code: 'BEV-009',
        barcode: '7791234567899',
        supplierCode: 'AND-BR-01',
        name: 'Café Grano Brasil Santos Cerrado 1kg',
        brand: 'Café Andino',
        category: 'Cafetería',
        presentation: '1kg',
        unit: 'unidad',
        quantity: 10,
        unitCost: 12800,
        suggestedSalePrice: 19900,
        totalPrice: 128000,
        supplier: 'Importadora Café Andino S.A.'
      },
      {
        sourceRowIndex: 4,
        code: 'MAT-309',
        barcode: '7799991112223',
        supplierCode: 'VAS-TR-24',
        name: 'Vasos Térmicos Polipapel Barista 240ml',
        brand: 'EcoCup',
        category: 'Insumos',
        presentation: 'Pack x50',
        unit: 'pack',
        quantity: 50,
        unitCost: 450,
        suggestedSalePrice: 900,
        totalPrice: 22500,
        supplier: 'Importadora Café Andino S.A.'
      }
    ]
  },
  {
    id: 'sample-csv-02',
    name: 'Lista de Precios Excel/CSV — Chocolatería del Sur',
    fileName: 'Lista_Precios_Mayorista_ChocolateriaSur.csv',
    fileType: 'csv',
    fileSize: 92400,
    documentNumber: 'LISTA-OCT-2026',
    documentDate: '2026-10-24',
    supplierName: 'Chocolatería del Sur',
    description: 'Lista de costos mayoristas con códigos de barras, marcas y presentaciones.',
    rawTextPreview: `SKU;CODIGO_BARRAS;PRODUCTO;MARCA;PRESENTACION;COSTO_MAYORISTA;CATEGORIA;STOCK_PACK
ALI-201;7795554443331;Caja Alfajores Artesanales x12;Chocolatería del Sur;Caja x12;7500,00;Pastelería;30
ALI-202;7795554443332;Cookies Avena, Miel y Chips 250g;Chocolatería del Sur;250g;2750,00;Pastelería;25
ALI-203;7795554443333;Tableta Chocolate Amargo 70% 100g;Chocolatería del Sur;100g;3200,00;Pastelería;40
ALI-204;7795554443334;Alfajor Blanco con Nuez x6;Chocolatería del Sur;Caja x6;6100,00;Pastelería;20`,
    detectedRows: [
      {
        sourceRowIndex: 1,
        code: 'ALI-201',
        barcode: '7795554443331',
        supplierCode: 'CS-ALF-12',
        name: 'Caja Alfajores Artesanales x12',
        brand: 'Chocolatería del Sur',
        category: 'Pastelería',
        presentation: 'Caja x12',
        unit: 'caja',
        quantity: 30,
        unitCost: 7500,
        suggestedSalePrice: 12500,
        totalPrice: 225000,
        supplier: 'Chocolatería del Sur'
      },
      {
        sourceRowIndex: 2,
        code: 'ALI-202',
        barcode: '7795554443332',
        supplierCode: 'CS-COOK-250',
        name: 'Cookies Avena, Miel y Chips 250g',
        brand: 'Chocolatería del Sur',
        category: 'Pastelería',
        presentation: '250g',
        unit: 'pack',
        quantity: 25,
        unitCost: 2750,
        suggestedSalePrice: 4800,
        totalPrice: 68750,
        supplier: 'Chocolatería del Sur'
      },
      {
        sourceRowIndex: 3,
        code: 'ALI-203',
        barcode: '7795554443333',
        supplierCode: 'CS-TAB-70',
        name: 'Tableta Chocolate Amargo 70% 100g',
        brand: 'Chocolatería del Sur',
        category: 'Pastelería',
        presentation: '100g',
        unit: 'unidad',
        quantity: 40,
        unitCost: 3200,
        suggestedSalePrice: 5500,
        totalPrice: 128000,
        supplier: 'Chocolatería del Sur'
      },
      {
        sourceRowIndex: 4,
        code: 'ALI-204',
        barcode: '7795554443334',
        supplierCode: 'CS-ALF-BL',
        name: 'Alfajor Blanco con Nuez x6',
        brand: 'Chocolatería del Sur',
        category: 'Pastelería',
        presentation: 'Caja x6',
        unit: 'caja',
        quantity: 20,
        unitCost: 6100,
        suggestedSalePrice: 9900,
        totalPrice: 122000,
        supplier: 'Chocolatería del Sur'
      }
    ]
  },
  {
    id: 'sample-rem-03',
    name: 'Remito de Entrega / Imagen de Comprobante — Barista Tools',
    fileName: 'Foto_Remito_Mercaderia_44921.jpg',
    fileType: 'imagen',
    fileSize: 450120,
    documentNumber: 'REM-44921',
    documentDate: '2026-10-26',
    supplierName: 'Barista Tools Co.',
    description: 'Foto de remito físico con recepción de filtros y accesorios de cafetería.',
    rawTextPreview: `[ESCANEADO OCR CON TESSERACT]
REMITO N° R-0002-00044921 - BARISTA TOOLS CO.
FECHA DE ENTREGA: 26/10/2026
RECEPTOR: NEXO 360 CENTRAL
DETALLE DE BULTOS / ARTICULOS:
• 10u - FILTROS PAPEL V60 TAMAÑO 02 (100U) - COD: MAT-301 - $ 4.700 c/u
• 5u  - BALANZA DIGITAL DE PRECISION 0.1G - COD: ACC-109 - $ 18.500 c/u
• 3u  - JARRA PITCHER ACERO INOX ARTE LATTE 600ML - COD: ACC-110 - $ 11.200 c/u`,
    detectedRows: [
      {
        sourceRowIndex: 1,
        code: 'MAT-301',
        barcode: '7792223334441',
        supplierCode: 'BT-V60-02',
        name: 'Filtros de Papel V60 Tamaño 02 (100u)',
        brand: 'Barista Tools Co.',
        category: 'Insumos',
        presentation: '100u',
        unit: 'pack',
        quantity: 10,
        unitCost: 4700,
        suggestedSalePrice: 8500,
        totalPrice: 47000,
        supplier: 'Barista Tools Co.'
      },
      {
        sourceRowIndex: 2,
        code: 'ACC-109',
        barcode: '7798889990010',
        supplierCode: 'BT-SCALE-01',
        name: 'Balanza Digital Barista con Timer 0.1g',
        brand: 'Barista Tools Co.',
        category: 'Accesorios',
        presentation: 'Unidad',
        unit: 'unidad',
        quantity: 5,
        unitCost: 18500,
        suggestedSalePrice: 32000,
        totalPrice: 92500,
        supplier: 'Barista Tools Co.'
      },
      {
        sourceRowIndex: 3,
        code: 'ACC-110',
        barcode: '7798889990011',
        supplierCode: 'BT-JUG-600',
        name: 'Jarra Pitcher Espumado Arte Latte 600ml',
        brand: 'Barista Tools Co.',
        category: 'Accesorios',
        presentation: '600ml',
        unit: 'unidad',
        quantity: 3,
        unitCost: 11200,
        suggestedSalePrice: 19800,
        totalPrice: 33600,
        supplier: 'Barista Tools Co.'
      }
    ]
  }
];
