import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  FileSpreadsheet, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Building2, 
  DollarSign, 
  Download, 
  Trash2, 
  Code, 
  ShieldCheck, 
  Clock,
  HelpCircle,
  Play
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { googleSheetsService, SheetsDiagnostic } from '../services/sheetsService';
import { BusinessConfig, SyncLog } from '../types';

export const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<BusinessConfig>(storageService.getConfig());
  const [diagnostic, setDiagnostic] = useState<SheetsDiagnostic | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'sheets' | 'firebase' | 'business' | 'logs'>('sheets');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const syncLogs = storageService.getSyncLogs();
  const pendingOps = googleSheetsService.getPendingOperationsCount();

  useEffect(() => {
    runDiagnosticCheck();
  }, []);

  const runDiagnosticCheck = async () => {
    setIsTesting(true);
    const diag = await googleSheetsService.runDiagnostic();
    setDiagnostic(diag);
    setIsTesting(false);
  };

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await googleSheetsService.syncPendingQueue(true);
    await runDiagnosticCheck();
    setIsSyncing(false);
  };

  const handleToggleDemoMode = (enabled: boolean) => {
    const updated = storageService.updateConfig({ demoMode: enabled });
    setConfig(updated);
  };

  const handleResetDemoData = () => {
    if (window.confirm('¿Restablecer el sistema con los datos iniciales? Se recuperarán los productos, clientes y movimientos base.')) {
      storageService.resetToDemo();
      setConfig(storageService.getConfig());
      runDiagnosticCheck();
    }
  };

  const sheetTabs = googleSheetsService.getSheetStructureDocumentation();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#101820]">
            Configuración e Integraciones del Negocio
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Conexión con Google Sheets, Cloud Firestore, datos fiscales y auditoría técnica.
          </p>
        </div>

        {/* Quick Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl flex-wrap">
          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'sheets' ? 'bg-[#101820] text-[#35D0BA] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>Google Sheets</span>
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'firebase' ? 'bg-[#101820] text-[#35D0BA] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Database size={14} />
            <span>Firebase DB</span>
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'business' ? 'bg-[#101820] text-[#35D0BA] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 size={14} />
            <span>Datos Empresa</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'logs' ? 'bg-[#101820] text-[#35D0BA] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock size={14} />
            <span>Registro Sync ({syncLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Google Sheets Integration */}
      {activeTab === 'sheets' && (
        <div className="space-y-6">
          {/* Status Diagnostic Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  config.sheetsConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#101820]">
                      Integración Automática con Google Sheets
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      config.sheetsConnected 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {config.sheetsConnected ? 'Conexión Activa' : 'Modo Cola Local'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Permite al propietario revisar desde su celular o computadora cada venta, movimiento y gasto registrado por sus empleados.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={runDiagnosticCheck}
                  disabled={isTesting}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
                  <span>Comprobar Estado</span>
                </button>

                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl bg-[#101820] text-[#35D0BA] text-xs font-bold hover:bg-[#101820]/90 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                  <span>Sincronizar Cola ({pendingOps.total})</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Details */}
            {diagnostic && (
              <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-gray-600">Estado de la Integración:</span>
                  <span className={diagnostic.isConnected ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold'}>
                    {diagnostic.statusMessage}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Operaciones en cola local:</span>
                  <span className="font-bold text-[#101820]">
                    {pendingOps.sales} ventas, {pendingOps.movements} movimientos, {pendingOps.expenses} gastos
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Garantía de no duplicidad:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Identificadores únicos estables por fila (Idempotente)
                  </span>
                </div>
              </div>
            )}

            {/* Configuration Form for Sheets */}
            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Parámetros de la Planilla Google Sheets
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    ID de la Planilla (Spreadsheet ID)
                  </label>
                  <input
                    type="text"
                    value={config.sheetsSpreadsheetId}
                    onChange={e => {
                      const updated = storageService.updateConfig({ sheetsSpreadsheetId: e.target.value });
                      setConfig(updated);
                    }}
                    placeholder="Ej. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Se encuentra en la URL de tu Google Sheet: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">/spreadsheets/d/&#123;ID&#125;/edit</code>
                  </span>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Sincronización Automática
                  </label>
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 bg-gray-50">
                    <div>
                      <span className="font-bold text-gray-800 block">Envío en tiempo real</span>
                      <span className="text-[10px] text-gray-500">Intenta sincronizar al confirmar cada venta</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.autoSyncSheets}
                      onChange={e => {
                        const updated = storageService.updateConfig({ autoSyncSheets: e.target.checked });
                        setConfig(updated);
                      }}
                      className="w-5 h-5 accent-[#35D0BA] rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Required Sheets Tabs Documentation */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
            <h3 className="text-base font-bold text-[#101820] mb-1">
              Estructura de Hojas Requeridas en Google Sheets
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              La integración sincroniza automáticamente las siguientes 6 pestañas operativas:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {sheetTabs.map(tab => (
                <div key={tab.tab} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 font-mono text-sm flex items-center gap-1.5">
                      <FileSpreadsheet size={15} className="text-[#35D0BA]" />
                      {tab.tab}
                    </span>
                    <span className="text-[10px] font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                      {tab.columns.length} columnas
                    </span>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-tight">
                    {tab.description}
                  </p>
                  <div className="pt-2 border-t border-gray-200/70 flex flex-wrap gap-1">
                    {tab.columns.map(col => (
                      <span key={col} className="bg-white px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-600 border border-gray-200">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Firebase Firestore Database Architecture */}
      {activeTab === 'firebase' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#101820] text-[#35D0BA] flex items-center justify-center shrink-0">
                <Database size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101820]">
                  Base de Datos Cloud Firestore (Sincronización Multi-Dispositivo)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Arquitectura compartida para que el propietario pueda supervisar en vivo lo que los empleados registran en sus puestos de trabajo.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Modo de Almacenamiento Activo:</span>
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#101820] text-[#35D0BA]">
                  Local Seguro Resiliente
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                La aplicación funciona completamente de forma local sin requerir credenciales ni facturación previa. Cuando se aprovisiona Firestore, los listeners en tiempo real (<code className="font-mono text-gray-800 bg-gray-200 px-1 py-0.5 rounded">onSnapshot</code>) replican los registros entre celulares, tablets y computadoras instantáneamente.
              </p>

              <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span className="text-[11px] font-semibold text-gray-700">
                    Reglas de seguridad estrictas generadas en <strong>firestore.rules</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Code size={16} className="text-[#35D0BA]" />
                  <span className="text-[11px] font-semibold text-gray-700">
                    Esquema validado en <strong>firebase-blueprint.json</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reset System Control */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#101820]">
                Restablecer Datos del Sistema
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Restablecer productos, clientes, ventas y movimientos al catálogo base del sistema.
              </p>
            </div>

            <button
              onClick={handleResetDemoData}
              className="px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors flex items-center gap-2 shrink-0"
            >
              <Trash2 size={15} className="text-rose-600" />
              <span>Restablecer Datos Iniciales</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Business Information Form */}
      {activeTab === 'business' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#101820]">
              Identidad Comercial del Negocio
            </h3>
            <p className="text-xs text-gray-500">
              Estos datos aparecen en los tickets emitidos, comprobantes de venta y el catálogo público.
            </p>
          </div>

          <form onSubmit={handleSaveBusiness} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Nombre Comercial de la Tienda *</label>
                <input
                  type="text"
                  required
                  value={config.name}
                  onChange={e => setConfig({ ...config, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Razón Social Legal</label>
                <input
                  type="text"
                  value={config.legalName}
                  onChange={e => setConfig({ ...config, legalName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">CUIT / Identificación Fiscal</label>
                <input
                  type="text"
                  value={config.taxId}
                  onChange={e => setConfig({ ...config, taxId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-mono focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Teléfono Móvil / WhatsApp</label>
                <input
                  type="text"
                  value={config.phone}
                  onChange={e => setConfig({ ...config, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Símbolo Monetario</label>
                <input
                  type="text"
                  value={config.currencySymbol}
                  onChange={e => setConfig({ ...config, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-bold focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Dirección del Establecimiento</label>
              <input
                type="text"
                value={config.address}
                onChange={e => setConfig({ ...config, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={15} /> Cambios guardados con éxito
                </span>
              )}
              <div className="ml-auto">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#101820] text-[#35D0BA] font-bold text-xs shadow-md hover:bg-[#101820]/90 transition-colors"
                >
                  Guardar Configuración
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Sync Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#101820]">
                Registro Técnico de Sincronización y Auditoría
              </h3>
              <p className="text-xs text-gray-500">
                Historial de eventos de comunicación con Google Sheets y colas de respaldo.
              </p>
            </div>

            <button
              onClick={() => {
                storageService.updateConfig({ demoMode: false });
                alert('Historial actualizado.');
              }}
              className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
            >
              Últimos {syncLogs.length} eventos
            </button>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {syncLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                No hay registros de sincronización aún.
              </div>
            ) : (
              syncLogs.map(log => (
                <div key={log.id} className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        log.status === 'completado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'error'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.status}
                      </span>
                      <span className="font-semibold text-gray-800 capitalize">
                        Módulo: {log.module}
                      </span>
                    </div>

                    <div className="text-gray-700 font-medium mt-1">
                      {log.message}
                    </div>

                    {log.details && (
                      <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                        {log.details}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString('es-AR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
