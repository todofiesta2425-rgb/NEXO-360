import React, { useState, useMemo, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Download, 
  Boxes, 
  ExternalLink, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  Check,
  ChevronDown
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { importParserService, ParsedDocumentResult } from '../services/importParserService';
import { googleSheetsService } from '../services/sheetsService';
import { ImportedProductRow, ImportMatchAction, ImportBatch, ProductUnit } from '../types';
import { SAMPLE_IMPORT_PRESETS, SampleDocumentPreset } from '../data/sampleImportFiles';

export const ImportProductsPage: React.FC<{ onNavigateToProducts?: () => void }> = ({ onNavigateToProducts }) => {
  const [activeSubTab, setActiveSubTab] = useState<'scanner' | 'history'>('scanner');

  // File loading state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);

  // Extracted rows state
  const [parsedResult, setParsedResult] = useState<ParsedDocumentResult | null>(null);
  const [importedRows, setImportedRows] = useState<ImportedProductRow[]>([]);
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [recordStockReception, setRecordStockReception] = useState(true);

  // Filters inside results
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'nuevos' | 'repetidos' | 'errores'>('todos');

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [importSummaryResult, setImportSummaryResult] = useState<any | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingProducts = storageService.getProducts();
  const currentEmp = storageService.getCurrentEmployee();
  const importHistory = storageService.getImportBatches();

  // Handle local file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const processSelectedFile = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setProcessingProgress(20);
    setProcessingStatus(`Analizando ${file.name}...`);
    setParsedResult(null);

    try {
      let result: ParsedDocumentResult;
      const lowerName = file.name.toLowerCase();

      if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv')) {
        setProcessingStatus('Leyendo filas y detectando columnas comerciales...');
        result = await importParserService.parseExcelOrCsv(file, existingProducts);
      } else if (lowerName.endsWith('.pdf')) {
        setProcessingStatus('Extrayendo capa de texto digital del documento PDF...');
        result = await importParserService.parsePdfDigitalText(file, existingProducts);
      } else if (
        lowerName.endsWith('.png') || 
        lowerName.endsWith('.jpg') || 
        lowerName.endsWith('.jpeg') || 
        lowerName.endsWith('.webp')
      ) {
        setProcessingStatus('Ejecutando reconocimiento óptico de caracteres (OCR)...');
        result = await importParserService.parseImageOcr(file, existingProducts, (prog, st) => {
          setProcessingProgress(prog);
          setProcessingStatus(st);
        });
      } else {
        throw new Error('Formato de archivo no compatible. Utilice XLSX, XLS, CSV, PDF o imágenes JPG/PNG.');
      }

      setParsedResult(result);
      setImportedRows(result.detectedRows);
      setDocumentNumber(result.documentNumber || '');
      setDocumentDate(result.documentDate || new Date().toISOString().slice(0, 10));
      setSupplierName(result.supplierName || '');
      setProcessingProgress(100);
    } catch (err: any) {
      alert(err?.message || 'Error al procesar el archivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Load a pre-packaged sample preset
  const handleLoadSamplePreset = (preset: SampleDocumentPreset) => {
    setIsProcessing(true);
    setProcessingProgress(40);
    setProcessingStatus(`Cargando archivo de prueba: ${preset.name}...`);

    setTimeout(() => {
      // Re-run intelligent duplicate detection against current live database
      const rowsWithMatch: ImportedProductRow[] = preset.detectedRows.map((r, i) => {
        const matchInfo = importParserService.matchRowWithExistingProducts(r, existingProducts);
        return {
          ...r,
          id: `sample-${preset.id}-${i}-${Date.now()}`,
          selected: true,
          ...matchInfo
        };
      });

      const res: ParsedDocumentResult = {
        fileName: preset.fileName,
        fileType: preset.fileType,
        fileSize: preset.fileSize,
        documentNumber: preset.documentNumber,
        documentDate: preset.documentDate,
        supplierName: preset.supplierName,
        detectedRows: rowsWithMatch,
        totalRows: rowsWithMatch.length,
        rawTextPreview: preset.rawTextPreview,
        warnings: []
      };

      setParsedResult(res);
      setImportedRows(rowsWithMatch);
      setDocumentNumber(preset.documentNumber);
      setDocumentDate(preset.documentDate);
      setSupplierName(preset.supplierName);
      setIsProcessing(false);
      setProcessingProgress(100);
    }, 450);
  };

  const handleClearCurrentFile = () => {
    setSelectedFile(null);
    setParsedResult(null);
    setImportedRows([]);
    setDocumentNumber('');
    setSupplierName('');
    setImportSummaryResult(null);
  };

  // Modify row field
  const handleUpdateRowField = (id: string, field: keyof ImportedProductRow, value: any) => {
    setImportedRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      
      // If quantity or unitCost changed, recalculate totalPrice
      if (field === 'quantity' || field === 'unitCost') {
        updated.totalPrice = updated.quantity * updated.unitCost;
      }

      // Re-validate row
      const errors: string[] = [];
      if (!updated.name || !updated.name.trim()) errors.push('Falta el nombre del producto');
      if (updated.unitCost < 0) errors.push('El precio unitario no puede ser negativo');
      updated.validationErrors = errors;
      updated.validationStatus = errors.length > 0 ? 'error' : updated.matchType === 'existente_similar' ? 'advertencia' : 'valido';

      return updated;
    }));
  };

  const handleToggleSelectAll = (checked: boolean) => {
    setImportedRows(prev => prev.map(r => ({ ...r, selected: checked })));
  };

  const handleRemoveRow = (id: string) => {
    setImportedRows(prev => prev.filter(r => r.id !== id));
  };

  // Summary counts
  const summaryCounts = useMemo(() => {
    const total = importedRows.length;
    const selected = importedRows.filter(r => r.selected).length;
    const nuevos = importedRows.filter(r => r.matchType === 'nuevo').length;
    const repetidos = importedRows.filter(r => r.matchType !== 'nuevo').length;
    const errores = importedRows.filter(r => r.validationStatus === 'error').length;
    const totalAmount = importedRows.filter(r => r.selected && r.action !== 'omitir').reduce((acc, r) => acc + r.totalPrice, 0);

    return { total, selected, nuevos, repetidos, errores, totalAmount };
  }, [importedRows]);

  // Filtered rows for the preview table
  const displayedRows = useMemo(() => {
    return importedRows.filter(r => {
      const matchSearch = 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.barcode && r.barcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.brand && r.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchFilter = true;
      if (filterType === 'nuevos') matchFilter = r.matchType === 'nuevo';
      else if (filterType === 'repetidos') matchFilter = r.matchType !== 'nuevo';
      else if (filterType === 'errores') matchFilter = r.validationStatus === 'error';

      return matchSearch && matchFilter;
    });
  }, [importedRows, searchQuery, filterType]);

  // Execute Import Confirmation
  const handleConfirmImport = () => {
    if (summaryCounts.selected === 0) {
      alert('No seleccionaste ningún producto para importar.');
      return;
    }

    if (summaryCounts.errores > 0) {
      const confirmContinue = window.confirm(
        `Hay ${summaryCounts.errores} fila(s) con errores de validación. ¿Deseás continuar importando solo las filas válidas?`
      );
      if (!confirmContinue) return;
    }

    setShowConfirmModal(true);
  };

  const handleExecuteFinalImport = () => {
    try {
      const result = storageService.executeProductImport({
        rows: importedRows,
        recordStockReception,
        fileName: selectedFile?.name || parsedResult?.fileName || 'Documento_Importado',
        fileType: parsedResult?.fileType || 'xlsx',
        fileSize: selectedFile?.size || parsedResult?.fileSize || 1000,
        documentNumber: documentNumber || undefined,
        documentDate: documentDate || undefined,
        supplierName: supplierName || undefined
      });

      // Try triggering Sheets sync in background
      googleSheetsService.syncPendingQueue();

      setImportSummaryResult(result);
      setShowConfirmModal(false);
    } catch (err: any) {
      alert(err?.message || 'Error al ejecutar la importación.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Module Navigation */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#101820]">
              Escáner Inteligente de Productos y Facturas
            </h1>
            <span className="bg-[#35D0BA]/15 text-[#101820] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#35D0BA]/30">
              OCR & Extracción
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Cargá facturas, remitos, listas de precios en Excel, CSV, PDF o fotos con detección automática de productos repetidos.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveSubTab('scanner')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'scanner'
                ? 'bg-[#101820] text-[#35D0BA] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload size={14} />
            <span>Escáner / Carga</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-[#101820] text-[#35D0BA] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock size={14} />
            <span>Historial ({importHistory.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'scanner' ? (
        <div className="space-y-6">
          {/* Success summary if just imported */}
          {importSummaryResult && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-6 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-emerald-900">
                    ¡Importación Procesada Exitosamente!
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Se crearon <strong>{importSummaryResult.createdCount} productos nuevos</strong>, se actualizaron <strong>{importSummaryResult.updatedCount} productos existentes</strong> y se registraron <strong>{importSummaryResult.movementsCount} movimientos de stock</strong> en el Kardex.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleClearCurrentFile}
                  className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors"
                >
                  Importar otro archivo
                </button>
                {onNavigateToProducts && (
                  <button
                    onClick={onNavigateToProducts}
                    className="px-4 py-2 rounded-xl bg-[#101820] text-[#35D0BA] text-xs font-bold hover:bg-black transition-colors"
                  >
                    Ver Catálogo Maestro →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Upload Zone & Quick Sample Presets */}
          {!parsedResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Drag and drop upload box */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-8 border-2 border-dashed border-gray-300 hover:border-[#35D0BA] transition-all text-center group cursor-pointer shadow-xs">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv, .pdf, .jpg, .jpeg, .png, .webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="space-y-4"
                >
                  <div className="w-16 h-16 rounded-3xl bg-gray-50 group-hover:bg-[#35D0BA]/15 text-gray-400 group-hover:text-[#101820] flex items-center justify-center mx-auto transition-colors">
                    <Upload size={32} />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-gray-800">
                      Hacé clic o arrastrá tu archivo aquí
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                      Formatos compatibles: <strong>Excel (.xlsx, .xls)</strong>, <strong>CSV</strong>, <strong>PDF digital</strong> o <strong>fotos de facturas (JPG, PNG)</strong>.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-semibold flex items-center gap-1">
                      <FileSpreadsheet size={13} className="text-emerald-600" /> Excel / CSV
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-semibold flex items-center gap-1">
                      <FileText size={13} className="text-rose-600" /> Factura PDF
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-semibold flex items-center gap-1">
                      <ImageIcon size={13} className="text-blue-600" /> Foto OCR
                    </span>
                  </div>

                  {isProcessing && (
                    <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                      <div className="flex items-center justify-center gap-2 font-bold">
                        <RefreshCw size={14} className="animate-spin text-amber-700" />
                        <span>{processingStatus}</span>
                      </div>
                      <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${processingProgress}%` }} 
                          className="bg-[#F5A623] h-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sample Presets Panel (Zero-cost Immediate Testing) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#F5A623]" />
                    <h3 className="font-bold text-sm text-[#101820]">
                      Probar Inmediatamente con Archivos de Ejemplo
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Hacé clic en cualquiera de estos comprobantes simulados para verificar el motor de extracción y detección de duplicados sin necesidad de subir un archivo:
                  </p>
                </div>

                <div className="space-y-3">
                  {SAMPLE_IMPORT_PRESETS.map(preset => (
                    <div
                      key={preset.id}
                      onClick={() => handleLoadSamplePreset(preset)}
                      className="p-3.5 rounded-2xl border border-gray-200 hover:border-[#35D0BA] bg-gray-50/70 hover:bg-[#35D0BA]/5 cursor-pointer transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-gray-900 group-hover:text-[#101820]">
                            {preset.name}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                            {preset.description}
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                          preset.fileType === 'pdf' ? 'bg-rose-100 text-rose-800' :
                          preset.fileType === 'csv' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {preset.fileType}
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[10px] text-gray-400">
                        <span>{preset.detectedRows.length} artículos detectados</span>
                        <span className="font-bold text-[#101820] group-hover:text-[#35D0BA] flex items-center gap-1">
                          Cargar ejemplo <ArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Editable Preview Table */}
          {parsedResult && (
            <div className="space-y-4">
              {/* Document Overview Bar */}
              <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#101820] text-[#35D0BA] flex items-center justify-center font-bold text-xs shrink-0">
                    {parsedResult.fileType.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-gray-900">
                        {parsedResult.fileName}
                      </h3>
                      <span className="text-[10px] text-gray-400 font-mono">
                        ({(parsedResult.fileSize / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3 mt-0.5">
                      <span>Filas detectadas: <strong>{summaryCounts.total}</strong></span>
                      <span>Total compra: <strong>${summaryCounts.totalAmount.toLocaleString('es-AR')}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleClearCurrentFile}
                    className="px-3.5 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs font-semibold transition-colors"
                  >
                    Reemplazar / Cancelar
                  </button>

                  <button
                    onClick={handleConfirmImport}
                    className="px-5 py-2 rounded-xl bg-[#101820] text-[#35D0BA] text-xs font-bold hover:bg-[#101820]/90 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={15} />
                    <span>Confirmar Importación ({summaryCounts.selected})</span>
                  </button>
                </div>
              </div>

              {/* Document Metadata Form */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">N° Factura / Remito</label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={e => setDocumentNumber(e.target.value)}
                    placeholder="Ej. FC-A-0004-00004812"
                    className="w-full px-3 py-1.5 border rounded-xl font-mono focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Fecha del Comprobante</label>
                  <input
                    type="date"
                    value={documentDate}
                    onChange={e => setDocumentDate(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Proveedor</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                    placeholder="Ej. Distribuidora Andina S.A."
                    className="w-full px-3 py-1.5 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>

                {/* Stock Reception Checkbox */}
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="stockCheck"
                    checked={recordStockReception}
                    onChange={e => setRecordStockReception(e.target.checked)}
                    className="w-4 h-4 accent-[#35D0BA] rounded cursor-pointer"
                  />
                  <label htmlFor="stockCheck" className="text-gray-800 font-bold cursor-pointer">
                    Registrar entrada de mercadería (Sumar al stock)
                  </label>
                </div>
              </div>

              {/* Filter and Search Bar for extracted products */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar dentro de los resultados detectados..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                  <button
                    onClick={() => setFilterType('todos')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      filterType === 'todos' ? 'bg-[#101820] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Todos ({summaryCounts.total})
                  </button>
                  <button
                    onClick={() => setFilterType('nuevos')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      filterType === 'nuevos' ? 'bg-[#101820] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Nuevos ({summaryCounts.nuevos})
                  </button>
                  <button
                    onClick={() => setFilterType('repetidos')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      filterType === 'repetidos' ? 'bg-[#101820] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Coincidencias ({summaryCounts.repetidos})
                  </button>
                  {summaryCounts.errores > 0 && (
                    <button
                      onClick={() => setFilterType('errores')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        filterType === 'errores' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Errores ({summaryCounts.errores})
                    </button>
                  )}
                </div>
              </div>

              {/* Editable Product Review Table */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                        <th className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={summaryCounts.selected === summaryCounts.total && summaryCounts.total > 0}
                            onChange={e => handleToggleSelectAll(e.target.checked)}
                            className="w-4 h-4 accent-[#35D0BA] rounded cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-3">Código / SKU</th>
                        <th className="py-3 px-3">Producto / Marca</th>
                        <th className="py-3 px-3">Presentación / Categoría</th>
                        <th className="py-3 px-3 text-center">Cant.</th>
                        <th className="py-3 px-3 text-right">Costo Unit. ($)</th>
                        <th className="py-3 px-3 text-right">P. Venta Sugerido ($)</th>
                        <th className="py-3 px-3 text-center">Coincidencia en Catálogo</th>
                        <th className="py-3 px-3">Acción a Realizar</th>
                        <th className="py-3 px-3 text-center">Eliminar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displayedRows.map(row => {
                        const isMatch = row.matchType !== 'nuevo';

                        return (
                          <tr 
                            key={row.id} 
                            className={`hover:bg-gray-50/80 transition-colors ${
                              !row.selected ? 'opacity-40 bg-gray-50/50' : ''
                            } ${row.validationStatus === 'error' ? 'bg-rose-50/30' : ''}`}
                          >
                            {/* Selection Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={row.selected}
                                onChange={e => handleUpdateRowField(row.id, 'selected', e.target.checked)}
                                className="w-4 h-4 accent-[#35D0BA] rounded cursor-pointer"
                              />
                            </td>

                            {/* Code / SKU input */}
                            <td className="py-2.5 px-3 min-w-[110px]">
                              <input
                                type="text"
                                value={row.code}
                                onChange={e => handleUpdateRowField(row.id, 'code', e.target.value.toUpperCase())}
                                className="w-full px-2 py-1 border rounded-lg font-mono font-bold text-xs bg-transparent focus:bg-white focus:outline-hidden"
                              />
                              {row.barcode && (
                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                  Bar: {row.barcode}
                                </div>
                              )}
                            </td>

                            {/* Product Name & Brand */}
                            <td className="py-2.5 px-3 min-w-[200px]">
                              <input
                                type="text"
                                value={row.name}
                                onChange={e => handleUpdateRowField(row.id, 'name', e.target.value)}
                                className="w-full px-2 py-1 border rounded-lg font-bold text-xs bg-transparent focus:bg-white focus:outline-hidden"
                              />
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="text"
                                  value={row.brand || ''}
                                  onChange={e => handleUpdateRowField(row.id, 'brand', e.target.value)}
                                  placeholder="Marca..."
                                  className="w-1/2 px-1.5 py-0.5 text-[10px] border border-gray-200 rounded text-gray-600"
                                />
                                {row.validationErrors.length > 0 && (
                                  <span className="text-[10px] text-rose-600 font-bold">
                                    {row.validationErrors[0]}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Presentation & Category */}
                            <td className="py-2.5 px-3 min-w-[140px]">
                              <input
                                type="text"
                                value={row.presentation || ''}
                                onChange={e => handleUpdateRowField(row.id, 'presentation', e.target.value)}
                                placeholder="Presentación (1kg, x12)..."
                                className="w-full px-1.5 py-0.5 text-[11px] border border-gray-200 rounded mb-1"
                              />
                              <input
                                type="text"
                                value={row.category}
                                onChange={e => handleUpdateRowField(row.id, 'category', e.target.value)}
                                className="w-full px-1.5 py-0.5 text-[10px] border border-gray-200 rounded text-gray-600"
                              />
                            </td>

                            {/* Quantity */}
                            <td className="py-2.5 px-3 text-center w-20">
                              <input
                                type="number"
                                min="1"
                                value={row.quantity}
                                onChange={e => handleUpdateRowField(row.id, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-16 px-1.5 py-1 text-center font-bold border rounded-lg text-xs"
                              />
                            </td>

                            {/* Unit Cost */}
                            <td className="py-2.5 px-3 text-right w-28">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={row.unitCost}
                                onChange={e => handleUpdateRowField(row.id, 'unitCost', parseFloat(e.target.value) || 0)}
                                className="w-24 px-1.5 py-1 text-right font-black border rounded-lg text-xs text-rose-800"
                              />
                            </td>

                            {/* Suggested Sale Price */}
                            <td className="py-2.5 px-3 text-right w-28">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={row.suggestedSalePrice}
                                onChange={e => handleUpdateRowField(row.id, 'suggestedSalePrice', parseFloat(e.target.value) || 0)}
                                className="w-24 px-1.5 py-1 text-right font-bold border rounded-lg text-xs text-[#101820]"
                              />
                            </td>

                            {/* Catalog Match Info */}
                            <td className="py-2.5 px-3 text-center min-w-[160px]">
                              {isMatch ? (
                                <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-left">
                                  <div className="font-bold text-amber-950 text-[11px] truncate">
                                    {row.matchedProductName}
                                  </div>
                                  <div className="text-[10px] text-amber-800 font-mono">
                                    SKU: {row.matchedProductSku}
                                  </div>
                                  {row.diffs.length > 0 && (
                                    <div className="text-[9px] text-amber-700 mt-0.5 leading-tight">
                                      {row.diffs[0]}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Producto Nuevo
                                </span>
                              )}
                            </td>

                            {/* Action selector */}
                            <td className="py-2.5 px-3 min-w-[150px]">
                              <select
                                value={row.action}
                                onChange={e => handleUpdateRowField(row.id, 'action', e.target.value as ImportMatchAction)}
                                className="w-full px-2 py-1 border rounded-lg font-semibold text-[11px] bg-white focus:outline-hidden"
                              >
                                {isMatch ? (
                                  <>
                                    <option value="actualizar_costo">Actualizar costo de compra</option>
                                    <option value="actualizar_todo">Actualizar costo y precio</option>
                                    <option value="vincular">Vincular sin tocar precios</option>
                                    <option value="crear_nuevo">Crear como producto nuevo</option>
                                    <option value="omitir">Omitir fila</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="crear_nuevo">Crear nuevo producto</option>
                                    <option value="omitir">Omitir fila</option>
                                  </>
                                )}
                              </select>
                            </td>

                            {/* Remove Row */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(row.id)}
                                className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* History SubTab */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#101820]">
                Historial de Lotes Importados
              </h3>
              <p className="text-xs text-gray-500">
                Auditoría de facturas, remitos y listas de precios procesadas.
              </p>
            </div>

            <button
              onClick={() => storageService.exportTableToCsv('importaciones')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors"
            >
              <Download size={14} />
              <span>Exportar Historial CSV</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Fecha / Hora</th>
                    <th className="py-3 px-4">Archivo / Formato</th>
                    <th className="py-3 px-4">Comprobante / Proveedor</th>
                    <th className="py-3 px-4 text-center">Nuevos</th>
                    <th className="py-3 px-4 text-center">Actualizados</th>
                    <th className="py-3 px-4 text-center">Mov. Stock</th>
                    <th className="py-3 px-4 text-right">Monto Total</th>
                    <th className="py-3 px-4">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {importHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        No se han procesado importaciones todavía.
                      </td>
                    </tr>
                  ) : (
                    importHistory.map(batch => (
                      <tr key={batch.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(batch.date).toLocaleString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">{batch.fileName}</div>
                          <span className="text-[10px] font-mono text-gray-400 uppercase">
                            {batch.fileType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-800">
                            {batch.documentNumber || 'Sin N°'}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {batch.supplierName || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700">
                          +{batch.createdCount}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-amber-700">
                          {batch.updatedCount}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-gray-700">
                          {batch.stockMovementsCount}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-gray-900">
                          ${batch.totalPurchasedAmount.toLocaleString('es-AR')}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {batch.employeeName}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Committing to Database */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-3 text-[#101820] mb-3">
              <ShieldCheck size={28} className="text-[#35D0BA]" />
              <div>
                <h3 className="text-lg font-black text-[#101820]">
                  Confirmar Importación al Catálogo
                </h3>
                <p className="text-xs text-gray-500">Revisión previa a la grabación definitiva</p>
              </div>
            </div>

            <div className="my-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Productos nuevos a crear:</span>
                <span className="font-bold text-emerald-700">
                  +{importedRows.filter(r => r.selected && r.action === 'crear_nuevo').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Productos existentes a actualizar:</span>
                <span className="font-bold text-amber-700">
                  {importedRows.filter(r => r.selected && r.action !== 'crear_nuevo' && r.action !== 'omitir').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Filas omitidas:</span>
                <span className="font-semibold text-gray-500">
                  {importedRows.filter(r => !r.selected || r.action === 'omitir').length}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-800 font-bold">Entrada de stock (Kardex):</span>
                <span className="font-bold text-[#101820]">
                  {recordStockReception ? '✔ Sí, sumar cantidades' : '✖ No, solo actualizar catálogo'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-800 font-bold">Total compra facturada:</span>
                <span className="font-black text-[#101820]">
                  ${summaryCounts.totalAmount.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 leading-tight mb-5">
              Al confirmar, los productos quedarán inmediatamente disponibles en los desplegables de búsqueda de Ventas y Movimientos de Stock.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancelar y seguir editando
              </button>
              <button
                type="button"
                onClick={handleExecuteFinalImport}
                className="px-5 py-2 rounded-xl bg-[#101820] text-[#35D0BA] font-bold text-xs hover:bg-[#101820]/90 transition-colors shadow-md"
              >
                Confirmar y Grabar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
