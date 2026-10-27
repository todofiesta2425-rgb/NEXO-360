import * as XLSX from 'xlsx';
import { createWorker } from 'tesseract.js';
import { ImportedProductRow, Product, ProductUnit } from '../types';

export interface ParsedDocumentResult {
  fileName: string;
  fileType: 'xlsx' | 'xls' | 'csv' | 'pdf' | 'imagen';
  fileSize: number;
  documentNumber?: string;
  documentDate?: string;
  supplierName?: string;
  detectedRows: ImportedProductRow[];
  totalRows: number;
  availableSheets?: string[];
  rawTextPreview?: string;
  warnings: string[];
}

// Utility: Normalize string for comparison (removes accents, lowercase, removes extra spaces)
export function normalizeText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Utility: Parse Latin American / Argentine currency numbers e.g. "$ 1.250,50" -> 1250.50
export function parseArgentineNumber(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  
  let s = String(val).trim();
  // Remove currency symbols and non-numeric chars except '.' and ',' and '-'
  s = s.replace(/[$€US\s]/g, '');

  // If contains both '.' and ',', check which is thousand separator
  if (s.includes('.') && s.includes(',')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      // Format 1.250,50 -> remove dots, replace comma with dot
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // Format 1,250.50 -> remove commas
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    // Only comma: 1250,50 -> 1250.50
    s = s.replace(',', '.');
  }

  const num = parseFloat(s);
  return isNaN(num) ? 0 : num;
}

class ImportParserService {
  // --- Intelligent Duplicate Detection ---
  public matchRowWithExistingProducts(
    row: Partial<ImportedProductRow>,
    existingProducts: Product[]
  ): Pick<ImportedProductRow, 'matchType' | 'matchedProductId' | 'matchedProductSku' | 'matchedProductName' | 'matchedCurrentCost' | 'matchedCurrentSalePrice' | 'matchedCurrentStock' | 'action' | 'diffs' | 'validationStatus' | 'validationErrors'> {
    let matchedProduct: Product | undefined;
    let matchType: ImportedProductRow['matchType'] = 'nuevo';
    const diffs: string[] = [];

    // Order 1: Barcode match (EAN / UPC)
    if (row.barcode && row.barcode.trim()) {
      const cleanBarcode = row.barcode.trim();
      matchedProduct = existingProducts.find(p => p.barcode && p.barcode.trim() === cleanBarcode);
      if (matchedProduct) {
        matchType = 'existente_exacto';
        diffs.push(`Coincidencia exacta por Código de Barras (${cleanBarcode})`);
      }
    }

    // Order 2: Supplier Code match
    if (!matchedProduct && row.supplierCode && row.supplierCode.trim()) {
      const cleanSuppCode = row.supplierCode.trim().toLowerCase();
      matchedProduct = existingProducts.find(p => p.supplierCode && p.supplierCode.trim().toLowerCase() === cleanSuppCode);
      if (matchedProduct) {
        matchType = 'existente_exacto';
        diffs.push(`Coincidencia por Código de Proveedor (${row.supplierCode})`);
      }
    }

    // Order 3: Internal SKU match
    if (!matchedProduct && row.code && row.code.trim()) {
      const cleanSku = row.code.trim().toUpperCase();
      matchedProduct = existingProducts.find(p => p.sku.trim().toUpperCase() === cleanSku);
      if (matchedProduct) {
        matchType = 'existente_exacto';
        diffs.push(`Coincidencia por Código SKU (${cleanSku})`);
      }
    }

    // Order 4: Normalized Name + Brand + Presentation match
    if (!matchedProduct && row.name) {
      const normDocName = normalizeText(row.name);
      matchedProduct = existingProducts.find(p => {
        const normExisting = normalizeText(p.name);
        return normDocName === normExisting || normDocName.includes(normExisting) || normExisting.includes(normDocName);
      });

      if (matchedProduct) {
        matchType = 'existente_similar';
        diffs.push(`Coincidencia por similitud de nombre comercial`);
      }
    }

    const rowCost = row.unitCost ?? 0;
    const rowQty = row.quantity ?? 0;

    // Compare differences if matched
    let defaultAction: ImportedProductRow['action'] = 'crear_nuevo';
    if (matchedProduct) {
      defaultAction = 'actualizar_costo';

      if (matchedProduct.unitCost !== rowCost && rowCost > 0) {
        const diffPercent = matchedProduct.unitCost > 0
          ? (((rowCost - matchedProduct.unitCost) / matchedProduct.unitCost) * 100).toFixed(1)
          : 'N/A';
        diffs.push(`Costo registrado: $${matchedProduct.unitCost.toLocaleString('es-AR')} ➔ Nuevo en doc: $${rowCost.toLocaleString('es-AR')} (${diffPercent}%)`);
      } else {
        diffs.push(`Costo idéntico: $${matchedProduct.unitCost.toLocaleString('es-AR')}`);
      }

      if (rowQty > 0) {
        diffs.push(`Stock actual en sistema: ${matchedProduct.stock} ${matchedProduct.unit}s. Cantidad en doc: ${rowQty}`);
      }
    }

    // Validation Status
    const errors: string[] = [];
    if (!row.name || !row.name.trim()) {
      errors.push('Falta el nombre o descripción del producto');
    }
    if (rowCost < 0) {
      errors.push('El precio unitario no puede ser negativo');
    }

    let validationStatus: ImportedProductRow['validationStatus'] = 'valido';
    if (errors.length > 0) {
      validationStatus = 'error';
    } else if (matchType === 'existente_similar') {
      validationStatus = 'advertencia';
    }

    return {
      matchType,
      matchedProductId: matchedProduct?.id,
      matchedProductSku: matchedProduct?.sku,
      matchedProductName: matchedProduct?.name,
      matchedCurrentCost: matchedProduct?.unitCost,
      matchedCurrentSalePrice: matchedProduct?.salePrice,
      matchedCurrentStock: matchedProduct?.stock,
      action: defaultAction,
      diffs,
      validationStatus,
      validationErrors: errors
    };
  }

  // --- Excel and CSV Parser ---
  public async parseExcelOrCsv(
    file: File,
    existingProducts: Product[],
    selectedSheetName?: string
  ): Promise<ParsedDocumentResult> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetNames = workbook.SheetNames;
    const targetSheet = selectedSheetName && sheetNames.includes(selectedSheetName)
      ? selectedSheetName
      : sheetNames[0];

    const worksheet = workbook.Sheets[targetSheet];
    const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!rawRows || rawRows.length === 0) {
      throw new Error('La planilla seleccionada no contiene filas con datos.');
    }

    // Locate header row
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rawRows.length, 15); i++) {
      const row = rawRows[i];
      if (!Array.isArray(row)) continue;
      const rowStr = row.map(c => String(c).toLowerCase()).join(' ');
      if (
        (rowStr.includes('descrip') || rowStr.includes('producto') || rowStr.includes('articulo') || rowStr.includes('nombre')) &&
        (rowStr.includes('precio') || rowStr.includes('costo') || rowStr.includes('cant') || rowStr.includes('subtotal') || rowStr.includes('importe'))
      ) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      // Fallback: assume row 0 is header
      headerRowIndex = 0;
    }

    const headers = (rawRows[headerRowIndex] || []).map(h => String(h || '').trim());
    
    // Map column indexes
    const colIndex = {
      code: -1,
      barcode: -1,
      name: -1,
      brand: -1,
      category: -1,
      presentation: -1,
      quantity: -1,
      cost: -1,
      salePrice: -1,
      unit: -1,
      total: -1
    };

    headers.forEach((h, idx) => {
      const nh = normalizeText(h);
      if (nh.includes('barra') || nh.includes('ean') || nh.includes('barcode')) colIndex.barcode = idx;
      else if (nh.includes('sku') || nh.includes('codigo') || nh.includes('cod') || nh.includes('id')) colIndex.code = idx;
      else if (nh.includes('descrip') || nh.includes('producto') || nh.includes('articulo') || nh.includes('nombre')) colIndex.name = idx;
      else if (nh.includes('marca') || nh.includes('brand')) colIndex.brand = idx;
      else if (nh.includes('categ') || nh.includes('rubro')) colIndex.category = idx;
      else if (nh.includes('present') || nh.includes('tamano') || nh.includes('peso') || nh.includes('envase')) colIndex.presentation = idx;
      else if (nh.includes('cant') || nh.includes('unidades') || nh.includes('bultos') || nh.includes('qty')) colIndex.quantity = idx;
      else if (nh.includes('costo') || nh.includes('p unit') || nh.includes('unitario') || nh.includes('compra')) colIndex.cost = idx;
      else if (nh.includes('venta') || nh.includes('pvp') || nh.includes('publico')) colIndex.salePrice = idx;
      else if (nh.includes('unidad') || nh.includes('medida') || nh.includes('u m')) colIndex.unit = idx;
      else if (nh.includes('total') || nh.includes('subtotal') || nh.includes('importe')) colIndex.total = idx;
    });

    // If no cost column found, fallback to price or total
    if (colIndex.cost === -1 && colIndex.salePrice !== -1) colIndex.cost = colIndex.salePrice;
    if (colIndex.cost === -1 && colIndex.total !== -1) colIndex.cost = colIndex.total;

    // Process data rows
    const detectedRows: ImportedProductRow[] = [];
    const warnings: string[] = [];

    for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!row || row.length === 0) continue;

      const nameVal = colIndex.name !== -1 ? String(row[colIndex.name] || '').trim() : '';
      if (!nameVal) continue; // Skip empty rows

      // Skip subtotal or footer summary rows
      const lowerName = nameVal.toLowerCase();
      if (
        lowerName.startsWith('total') || 
        lowerName.startsWith('subtotal') || 
        lowerName.startsWith('iva') || 
        lowerName.startsWith('percepcion') ||
        lowerName.startsWith('son pesos')
      ) {
        continue;
      }

      const rawCode = colIndex.code !== -1 ? String(row[colIndex.code] || '').trim() : '';
      const rawBarcode = colIndex.barcode !== -1 ? String(row[colIndex.barcode] || '').trim() : '';
      const rawBrand = colIndex.brand !== -1 ? String(row[colIndex.brand] || '').trim() : '';
      const rawCat = colIndex.category !== -1 ? String(row[colIndex.category] || '').trim() : 'General';
      const rawPresentation = colIndex.presentation !== -1 ? String(row[colIndex.presentation] || '').trim() : '';
      const rawQty = colIndex.quantity !== -1 ? parseArgentineNumber(row[colIndex.quantity]) : 1;
      const rawCost = colIndex.cost !== -1 ? parseArgentineNumber(row[colIndex.cost]) : 0;
      const rawTotal = colIndex.total !== -1 ? parseArgentineNumber(row[colIndex.total]) : rawQty * rawCost;

      // Auto SKU generation if code empty
      const generatedSku = rawCode || `IMP-${Math.floor(1000 + Math.random() * 9000)}`;

      // Calculate suggested sale price (approx 50% markup over cost if not specified)
      const suggestedSale = rawCost > 0 ? Math.round(rawCost * 1.5) : 0;

      const baseRow = {
        id: `imp-row-${Date.now()}-${r}`,
        selected: true,
        sourceRowIndex: r + 1,
        code: generatedSku,
        barcode: rawBarcode || undefined,
        supplierCode: rawCode || undefined,
        name: nameVal,
        brand: rawBrand || undefined,
        category: rawCat || 'General',
        presentation: rawPresentation || undefined,
        unit: 'unidad' as ProductUnit,
        quantity: rawQty,
        unitCost: rawCost,
        suggestedSalePrice: suggestedSale,
        totalPrice: rawTotal,
        supplier: file.name.replace(/\.[^/.]+$/, '').slice(0, 50)
      };

      const matchInfo = this.matchRowWithExistingProducts(baseRow, existingProducts);

      detectedRows.push({
        ...baseRow,
        ...matchInfo
      });
    }

    const fileType = file.name.endsWith('.csv') ? 'csv' : file.name.endsWith('.xls') ? 'xls' : 'xlsx';

    return {
      fileName: file.name,
      fileType,
      fileSize: file.size,
      availableSheets: sheetNames,
      totalRows: detectedRows.length,
      detectedRows,
      warnings
    };
  }

  // --- PDF Digital Text Parser ---
  public async parsePdfDigitalText(
    file: File,
    existingProducts: Product[]
  ): Promise<ParsedDocumentResult> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    
    // Convert arrayBuffer to binary string
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }

    // Extract text stream tokens from PDF stream objects: BT ... ET
    const textPieces: string[] = [];
    const streamRegex = /BT[\s\S]*?ET/g;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(binary)) !== null) {
      const block = match[0];
      // Extract strings inside parentheses: (Some text) Tj or [(...) (...) ] TJ
      const stringMatches = block.match(/\(([^)]+)\)/g);
      if (stringMatches) {
        const text = stringMatches.map(m => m.slice(1, -1)).join(' ');
        if (text.trim().length > 0) {
          textPieces.push(text);
        }
      }
    }

    const fullExtractedText = textPieces.join('\n');

    // If PDF is scanned or encrypted without digital stream, return fallback with helpful OCR option
    if (textPieces.length === 0 || fullExtractedText.trim().length < 20) {
      // Scanned PDF detection
      return {
        fileName: file.name,
        fileType: 'pdf',
        fileSize: file.size,
        totalRows: 0,
        detectedRows: [],
        warnings: [
          'Este archivo PDF no contiene texto digital seleccionable (posible PDF escaneado como imagen).',
          'Podés subir la página como imagen (PNG/JPG) para aplicar el OCR óptico de NEXO 360.'
        ],
        rawTextPreview: 'No se detectó capa de texto digital nativa en el PDF.'
      };
    }

    // Try extracting document metadata
    let docNumber: string | undefined;
    let docDate: string | undefined;
    let supplierName: string | undefined;

    const invoiceMatch = fullExtractedText.match(/(factura|remito|comprobante)[^\d]{0,10}([a-z0-9\-]+)/i);
    if (invoiceMatch) docNumber = invoiceMatch[0].trim();

    const dateMatch = fullExtractedText.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/);
    if (dateMatch) docDate = dateMatch[0];

    // Split into lines and parse product rows
    const lines = fullExtractedText.split('\n');
    const detectedRows: ImportedProductRow[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.length < 5) return;

      // Check if line contains numbers (like prices and quantities)
      const numMatches = trimmed.match(/\d+([.,]\d+)?/g);
      if (numMatches && numMatches.length >= 2) {
        // Likely a product line
        const words = trimmed.split(/\s+/);
        // Find text description
        const descParts = words.filter(w => !w.match(/^[$€0-9.,\-]+$/));
        const desc = descParts.join(' ');
        if (desc.length >= 3 && !desc.toLowerCase().includes('total') && !desc.toLowerCase().includes('subtotal')) {
          const qty = parseArgentineNumber(numMatches[0]) || 1;
          const cost = parseArgentineNumber(numMatches[numMatches.length - 1]) || 0;

          const row = {
            id: `imp-pdf-${Date.now()}-${idx}`,
            selected: true,
            sourceRowIndex: idx + 1,
            code: `PDF-${Math.floor(1000 + Math.random() * 9000)}`,
            name: desc,
            category: 'General',
            unit: 'unidad' as ProductUnit,
            quantity: qty,
            unitCost: cost,
            suggestedSalePrice: Math.round(cost * 1.5),
            totalPrice: qty * cost,
            supplier: file.name.replace(/\.[^/.]+$/, '').slice(0, 40)
          };

          const matchInfo = this.matchRowWithExistingProducts(row, existingProducts);
          detectedRows.push({ ...row, ...matchInfo });
        }
      }
    });

    return {
      fileName: file.name,
      fileType: 'pdf',
      fileSize: file.size,
      documentNumber: docNumber,
      documentDate: docDate,
      supplierName: supplierName || 'Proveedor Factura PDF',
      totalRows: detectedRows.length,
      detectedRows,
      rawTextPreview: fullExtractedText.slice(0, 600),
      warnings: detectedRows.length === 0 ? ['Se extrajo texto del PDF pero no se identificó una estructura tabular clara. Podés revisar los campos manualmente o cargar el preset de prueba.'] : []
    };
  }

  // --- Image OCR Parser (Tesseract.js) ---
  public async parseImageOcr(
    file: File,
    existingProducts: Product[],
    onProgress?: (progress: number, status: string) => void
  ): Promise<ParsedDocumentResult> {
    onProgress?.(10, 'Iniciando motor de OCR óptico local...');
    
    let text = '';
    try {
      const worker = await createWorker('spa');
      onProgress?.(40, 'Reconociendo caracteres en la imagen...');
      const ret = await worker.recognize(file);
      text = ret.data.text;
      await worker.terminate();
    } catch (err: any) {
      console.warn('OCR fallback error:', err);
      text = '';
    }

    onProgress?.(80, 'Extrayendo columnas y productos...');

    // If OCR returned empty or low quality, check if it matches one of our sample presets or parse lines
    if (!text || text.trim().length < 15) {
      return {
        fileName: file.name,
        fileType: 'imagen',
        fileSize: file.size,
        totalRows: 0,
        detectedRows: [],
        warnings: [
          'La calidad de la imagen no permitió extraer texto con nitidez suficiente.',
          'Recomendación: asegurate de tomar la fotografía con buena iluminación y de frente a la tabla de productos.'
        ],
        rawTextPreview: 'Texto OCR insuficiente.'
      };
    }

    const lines = text.split('\n');
    const detectedRows: ImportedProductRow[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.length < 5) return;

      const numMatches = trimmed.match(/\d+([.,]\d+)?/g);
      if (numMatches && numMatches.length >= 2) {
        const words = trimmed.split(/\s+/);
        const descParts = words.filter(w => !w.match(/^[$€0-9.,\-]+$/));
        const desc = descParts.join(' ');
        if (desc.length >= 3 && !desc.toLowerCase().includes('total') && !desc.toLowerCase().includes('cuit')) {
          const qty = parseArgentineNumber(numMatches[0]) || 1;
          const cost = parseArgentineNumber(numMatches[numMatches.length - 1]) || 0;

          const row = {
            id: `imp-ocr-${Date.now()}-${idx}`,
            selected: true,
            sourceRowIndex: idx + 1,
            code: `OCR-${Math.floor(1000 + Math.random() * 9000)}`,
            name: desc,
            category: 'General',
            unit: 'unidad' as ProductUnit,
            quantity: qty,
            unitCost: cost,
            suggestedSalePrice: Math.round(cost * 1.5),
            totalPrice: qty * cost,
            supplier: 'Proveedor Detectado por OCR'
          };

          const matchInfo = this.matchRowWithExistingProducts(row, existingProducts);
          detectedRows.push({ ...row, ...matchInfo });
        }
      }
    });

    onProgress?.(100, 'Procesamiento completado');

    return {
      fileName: file.name,
      fileType: 'imagen',
      fileSize: file.size,
      totalRows: detectedRows.length,
      detectedRows,
      rawTextPreview: text.slice(0, 500),
      warnings: detectedRows.length === 0 ? ['OCR completado. Por favor verificá los datos en la tabla antes de confirmar.'] : []
    };
  }
}

export const importParserService = new ImportParserService();
