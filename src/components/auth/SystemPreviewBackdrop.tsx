import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  FileSpreadsheet,
  Users,
  Receipt,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ScanLine,
  Store
} from 'lucide-react';

/**
 * Atmospheric background showing the real NEXO 360 interior workspace
 * rendered behind the Hero cover with subtle perspective and high-legibility contrast.
 */
export const SystemPreviewBackdrop: React.FC = () => {
  const barHeights = [42, 68, 54, 82, 65, 94, 78];

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
    >
      {/* Simulated NEXO 360 Workspace Canvas positioned cleanly behind the Hero */}
      <div className="absolute -right-12 top-6 w-[1150px] max-w-none opacity-25 lg:opacity-35 transform -rotate-2 scale-95 lg:scale-100 origin-top-right">
        <div className="bg-[#F2F4F6] text-[#101820] rounded-3xl border border-white/15 shadow-2xl overflow-hidden grid grid-cols-12 min-h-[600px]">
          {/* Simulated Left Sidebar */}
          <div className="col-span-3 bg-[#101820] p-5 flex flex-col justify-between border-r border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-4 border-b border-white/10">
                <div className="w-7 h-7 rounded-lg bg-[#35D0BA]/20 border border-[#35D0BA]/50 flex items-center justify-center text-[#35D0BA] font-black text-xs">
                  N
                </div>
                <span className="font-extrabold text-white tracking-tight text-sm">NEXO 360</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {[
                  { label: 'Dashboard', icon: LayoutDashboard, active: true },
                  { label: 'Ventas y POS', icon: ShoppingCart },
                  { label: 'Productos y Precios', icon: Package },
                  { label: 'Importar OCR', icon: FileSpreadsheet },
                  { label: 'Inventario y Kardex', icon: Boxes },
                  { label: 'Clientes', icon: Users },
                  { label: 'Gastos y Caja', icon: Receipt },
                  { label: 'Reportes y Cierres', icon: BarChart3 },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold ${
                        item.active
                          ? 'bg-[#35D0BA] text-[#101820]'
                          : 'text-gray-300'
                      }`}
                    >
                      <Icon size={15} />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] text-gray-400 border-t border-white/10 pt-3">
              Sincronización Cloud & Sheets
            </div>
          </div>

          {/* Simulated Interior Main Content */}
          <div className="col-span-9 p-6 space-y-5 bg-[#F2F4F6]">
            {/* Top Header Bar */}
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-gray-200">
              <div>
                <div className="text-xs font-extrabold text-[#101820]">Resumen Comercial Diario</div>
                <div className="text-[11px] text-gray-500">Sucursal Central · Caja Activa</div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-emerald-700">Sheets: Al día</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#101820] text-white">Propietario</span>
              </div>
            </div>

            {/* 4 KPI Summary Cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <div className="text-[11px] text-gray-500 font-semibold">Ventas del Mes</div>
                <div className="text-lg font-black font-mono tabular-nums text-[#101820] mt-1">$ 2.845.900</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp size={12} /> +18,4% vs mes ant.
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <div className="text-[11px] text-gray-500 font-semibold">Operaciones POS</div>
                <div className="text-lg font-black font-mono tabular-nums text-[#101820] mt-1">184 tickets</div>
                <div className="text-[11px] text-gray-500 mt-1">Ticket prom: $ 15.466</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <div className="text-[11px] text-gray-500 font-semibold">Productos Activos</div>
                <div className="text-lg font-black font-mono tabular-nums text-[#101820] mt-1">428 SKU</div>
                <div className="text-[11px] text-[#101820] font-semibold mt-1">Catálogo sincronizado</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <div className="text-[11px] text-gray-500 font-semibold">Alertas de Stock</div>
                <div className="text-lg font-black font-mono tabular-nums text-amber-700 mt-1">6 bajos</div>
                <div className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} /> Reposición sugerida
                </div>
              </div>
            </div>

            {/* Chart + Recent Activity Grid */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-7 bg-white p-5 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold text-[#101820]">Ingresos Últimos 7 Días</div>
                  <div className="text-[11px] font-mono text-gray-500">ARS ($)</div>
                </div>
                <div className="h-36 flex items-end gap-3 pt-4">
                  {barHeights.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-lg bg-[#101820]"
                        style={{ height: `${h}%`, opacity: i === 5 ? 1 : 0.78 }}
                      />
                      <span className="text-[10px] font-mono text-gray-500">
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-5 bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                <div className="text-xs font-bold text-[#101820]">Últimos Movimientos</div>
                {[
                  { ref: 'Venta #V-1048', detail: 'Efectivo · 4 ítems', amount: '+$ 48.500' },
                  { ref: 'Ingreso Stock', detail: 'Factura Proveedor #892', amount: '+36 unid.' },
                  { ref: 'Venta #V-1047', detail: 'Transferencia · Cliente M.', amount: '+$ 92.300' },
                  { ref: 'Gasto Logística', detail: 'Flete Reparto Zona Norte', amount: '-$ 18.000' },
                ].map((row) => (
                  <div key={row.ref} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0 text-xs">
                    <div>
                      <div className="font-bold text-[#101820]">{row.ref}</div>
                      <div className="text-[10px] text-gray-500">{row.detail}</div>
                    </div>
                    <span className="font-mono font-bold tabular-nums text-[#101820]">{row.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contrast Scrim so foreground cover typography remains crisp and legible */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#101820] via-[#101820]/95 to-[#101820]/75" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#101820] via-transparent to-[#101820]/60" />
    </div>
  );
};

type PreviewTab = 'dashboard' | 'pos' | 'inventory' | 'ocr';

/**
 * Interactive preview section allowing visitors to inspect every module inside NEXO 360
 * before signing in or creating an account.
 */
export const InteractiveInteriorShowcase: React.FC<{
  onOpenAuth: (mode: 'login' | 'register') => void;
}> = ({ onOpenAuth }) => {
  const [activeTab, setActiveTab] = useState<PreviewTab>('dashboard');

  const tabs: { id: PreviewTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
    { id: 'pos', label: 'Punto de Venta (POS)', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventario y Kardex', icon: Boxes },
    { id: 'ocr', label: 'Escáner OCR & Excel', icon: ScanLine },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Interactive Module Selector Bar */}
      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#101820] text-white shadow-xs'
                    : 'text-gray-600 hover:text-[#101820] hover:bg-gray-200/70'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onOpenAuth('register')}
          className="px-4 py-2 rounded-xl bg-[#35D0BA] hover:bg-[#2bbba7] text-[#101820] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Probar este módulo ahora</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Preview Viewport Area */}
      <div className="p-5 sm:p-8 bg-[#F2F4F6]/60">
        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-extrabold text-[#101820]">
                  Panel de Control del Propietario en Tiempo Real
                </h4>
                <p className="text-xs text-gray-600">
                  Visualizá ventas del día, caja neta, gastos operativos y alertas de reposición desde cualquier dispositivo.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-gray-500 whitespace-nowrap">
                Actualización automática · Cloud + Sheets
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <div className="text-xs text-gray-500 font-medium">Facturación Diaria</div>
                <div className="text-2xl font-black font-mono tabular-nums text-[#101820] mt-1">$ 348.200</div>
                <div className="text-xs text-emerald-700 font-semibold mt-1">24 ventas cerradas hoy</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <div className="text-xs text-gray-500 font-medium">Balance Operativo Mes</div>
                <div className="text-2xl font-black font-mono tabular-nums text-[#101820] mt-1">$ 1.980.400</div>
                <div className="text-xs text-gray-500 mt-1">Ingresos menos gastos de caja</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <div className="text-xs text-gray-500 font-medium">Valorización de Stock</div>
                <div className="text-2xl font-black font-mono tabular-nums text-[#101820] mt-1">$ 8.420.000</div>
                <div className="text-xs text-gray-500 mt-1">428 productos activos</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <div className="text-xs text-gray-500 font-medium">Reposición Urgente</div>
                <div className="text-2xl font-black font-mono tabular-nums text-amber-700 mt-1">6 artículos</div>
                <div className="text-xs text-amber-700 font-semibold mt-1">Por debajo del stock mínimo</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <tr>
                    <th className="px-4 py-3">Comprobante</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Vendedor</th>
                    <th className="px-4 py-3">Medio de Pago</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-mono font-bold text-[#101820]">V-001048</td>
                    <td className="px-4 py-3 text-gray-700">Distribuidora del Sur SRL</td>
                    <td className="px-4 py-3 text-gray-600">Lucía Fernández</td>
                    <td className="px-4 py-3 text-gray-600">Transferencia</td>
                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">$ 142.800</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono font-bold text-[#101820]">V-001047</td>
                    <td className="px-4 py-3 text-gray-700">Consumidor Final</td>
                    <td className="px-4 py-3 text-gray-600">Carlos Méndez</td>
                    <td className="px-4 py-3 text-gray-600">Efectivo</td>
                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">$ 28.500</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono font-bold text-[#101820]">V-001046</td>
                    <td className="px-4 py-3 text-gray-700">Comercial Norte</td>
                    <td className="px-4 py-3 text-gray-600">Lucía Fernández</td>
                    <td className="px-4 py-3 text-gray-600">Tarjeta Débito</td>
                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">$ 64.900</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-[#101820]">Buscador Rápido de Productos y Catálogo</h4>
                <span className="text-xs text-gray-500">Código SKU / Barra / Nombre</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { sku: 'BEB-102', name: 'Agua Mineral Sin Gas 2L Pack x6', stock: 42, price: '$ 7.800' },
                  { sku: 'ALM-205', name: 'Aceite de Oliva Extra Virgen 500ml', stock: 19, price: '$ 11.400' },
                  { sku: 'LMP-044', name: 'Detergente Concentrado Industrial 5L', stock: 8, price: '$ 14.200' },
                  { sku: 'CAF-310', name: 'Café Molido Tostado Natural 1Kg', stock: 25, price: '$ 24.900' },
                ].map((item) => (
                  <div key={item.sku} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-mono text-gray-500">{item.sku} · Stock: {item.stock}</div>
                      <div className="text-xs font-bold text-[#101820] mt-0.5">{item.name}</div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-black font-mono tabular-nums text-[#101820]">{item.price}</span>
                      <span className="text-[11px] font-bold text-emerald-700">+ Agregar</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#101820] text-white p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-sm font-bold">Ticket en Curso #V-1049</span>
                  <span className="text-xs text-[#35D0BA] font-semibold">Descuento automático de stock</span>
                </div>
                <div className="py-3 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-300">2x Café Molido Natural 1Kg</span>
                    <span className="font-mono font-bold tabular-nums">$ 49.800</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">3x Aceite de Oliva 500ml</span>
                    <span className="font-mono font-bold tabular-nums">$ 34.200</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Total a Cobrar</span>
                  <span className="text-2xl font-black font-mono tabular-nums text-[#35D0BA]">$ 84.000</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] text-center">
                  <span className="py-1.5 rounded-lg bg-white/10 font-semibold">Efectivo</span>
                  <span className="py-1.5 rounded-lg bg-[#35D0BA] text-[#101820] font-bold">Transferencia</span>
                  <span className="py-1.5 rounded-lg bg-white/10 font-semibold">Tarjeta</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-extrabold text-[#101820]">Kardex Histórico e Inmutable de Mercadería</h4>
                <p className="text-xs text-gray-500">Cada entrada, venta, merma o anulación queda auditada con usuario, fecha y saldo resultante.</p>
              </div>
              <span className="text-xs font-bold text-[#101820]">Trazabilidad 100%</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <tr>
                    <th className="px-4 py-2.5">Movimiento</th>
                    <th className="px-4 py-2.5">Producto</th>
                    <th className="px-4 py-2.5">Responsable</th>
                    <th className="px-4 py-2.5 text-right">Cantidad</th>
                    <th className="px-4 py-2.5 text-right">Stock Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-emerald-700">Entrada Compra</td>
                    <td className="px-4 py-2.5 font-medium text-[#101820]">Harina 0000 Panadera 25Kg</td>
                    <td className="px-4 py-2.5 text-gray-600">Roberto Rossi</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-700 tabular-nums">+40</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold tabular-nums">62</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-amber-700">Salida Venta</td>
                    <td className="px-4 py-2.5 font-medium text-[#101820]">Aceite Girasol 1.5L</td>
                    <td className="px-4 py-2.5 text-gray-600">Carlos Méndez</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-amber-700 tabular-nums">-12</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold tabular-nums">38</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-rose-700">Ajuste Merma</td>
                    <td className="px-4 py-2.5 font-medium text-[#101820]">Envase Vidrio 750ml</td>
                    <td className="px-4 py-2.5 text-gray-600">Lucía Fernández</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-rose-700 tabular-nums">-2</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold tabular-nums">114</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ocr' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#101820] text-[#35D0BA] flex items-center justify-center">
                  <ScanLine size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#101820]">Escáner Inteligente de Facturas y Listas</h4>
                  <p className="text-[11px] text-gray-500">Excel (.xlsx/.xls) · CSV · PDF · Fotos JPG/PNG/WEBP</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Subí la foto de una factura de proveedor o una planilla de precios. El motor extrae códigos, marcas, precios unitarios, impuestos y cantidades para cargar o actualizar tu inventario en segundos.
              </p>
              <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="font-bold text-[#101820]">Detección de Filas</div>
                  <div className="text-[11px] text-gray-500">Formato numérico local ($ 1.250,50)</div>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="font-bold text-[#101820]">Control Duplicados</div>
                  <div className="text-[11px] text-gray-500">Actualiza costo y suma stock</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2.5 text-xs">
              <div className="font-bold text-[#101820] flex items-center justify-between pb-2 border-b border-gray-100">
                <span>Vista Previa de Extracción</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> 3 ítems listos
                </span>
              </div>
              {[
                { code: 'PRV-8841', name: 'Yerba Mate Suave 1Kg', qty: '24 u.', cost: '$ 3.150,00' },
                { code: 'PRV-8842', name: 'Azúcar Común Tipo A 1Kg', qty: '50 u.', cost: '$ 980,50' },
                { code: 'PRV-8890', name: 'Galletitas Surtidas Pack x12', qty: '15 cajas', cost: '$ 12.400,00' },
              ].map((row) => (
                <div key={row.code} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200/80">
                  <div>
                    <div className="font-mono text-[10px] text-gray-500">{row.code}</div>
                    <div className="font-bold text-[#101820]">{row.name}</div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="font-bold text-[#101820]">{row.cost}</div>
                    <div className="text-[10px] text-emerald-700">+{row.qty}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
