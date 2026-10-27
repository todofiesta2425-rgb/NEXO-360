import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  ArrowDownRight, 
  ArrowUpRight, 
  PlusCircle, 
  Boxes, 
  Calendar, 
  ExternalLink, 
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Product, Sale, InventoryMovement, Expense, FilterPeriod } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: any) => void;
  onOpenRestockModal: (product?: Product) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onNavigate,
  onOpenRestockModal
}) => {
  const [period, setPeriod] = useState<FilterPeriod['preset']>('ultimos_7_dias');

  const products = storageService.getProducts();
  const sales = storageService.getSales();
  const movements = storageService.getMovements();
  const expenses = storageService.getExpenses();
  const clients = storageService.getClients();
  const currentEmp = storageService.getCurrentEmployee();

  // Low stock products
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.status === 'activo' && p.stock <= p.minStock);
  }, [products]);

  // Calculations for current date
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  // Sales today
  const salesToday = useMemo(() => {
    return sales
      .filter(s => s.status === 'completada' && s.date.startsWith(todayStr))
      .reduce((sum, s) => sum + s.total, 0);
  }, [sales, todayStr]);

  // Sales this month
  const salesMonth = useMemo(() => {
    return sales
      .filter(s => s.status === 'completada' && s.date.startsWith(currentMonthStr))
      .reduce((sum, s) => sum + s.total, 0);
  }, [sales, currentMonthStr]);

  // Expenses this month
  const expensesMonth = useMemo(() => {
    return expenses
      .filter(e => e.date.startsWith(currentMonthStr))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentMonthStr]);

  // Operating difference
  const netOperatingBalance = salesMonth - expensesMonth;

  // Total completed sales count
  const completedSalesCount = sales.filter(s => s.status === 'completada').length;

  // 7-day sales breakdown for chart
  const last7DaysData = useMemo(() => {
    const days: { date: string; label: string; total: number; count: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().slice(0, 10);
      const weekday = d.toLocaleDateString('es-AR', { weekday: 'short' });
      const dayNum = d.getDate();

      const dayTotal = sales
        .filter(s => s.status === 'completada' && s.date.startsWith(isoDate))
        .reduce((sum, s) => sum + s.total, 0);

      const dayCount = sales.filter(s => s.status === 'completada' && s.date.startsWith(isoDate)).length;

      days.push({
        date: isoDate,
        label: `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${dayNum}`,
        total: dayTotal,
        count: dayCount
      });
    }

    return days;
  }, [sales]);

  const maxDaySale = Math.max(...last7DaysData.map(d => d.total), 10000);

  // Recent 5 sales
  const recentSales = useMemo(() => sales.slice(0, 5), [sales]);

  // Recent 5 inventory movements
  const recentMovements = useMemo(() => movements.slice(0, 5), [movements]);

  // Employee activity summary
  const employeeSalesRank = useMemo(() => {
    const map: Record<string, { name: string; count: number; total: number }> = {};
    sales.filter(s => s.status === 'completada').forEach(s => {
      if (!map[s.employeeId]) {
        map[s.employeeId] = { name: s.employeeName, count: 0, total: 0 };
      }
      map[s.employeeId].count += 1;
      map[s.employeeId].total += s.total;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [sales]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-[#101820] to-[#1e293b] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Abstract decorative connected nodes */}
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full stroke-current">
            <polygon points="100,20 180,60 180,140 100,180 20,140 20,60" fill="none" strokeWidth="4" />
            <line x1="100" y1="20" x2="100" y2="180" strokeWidth="2" />
            <line x1="20" y1="60" x2="180" y2="140" strokeWidth="2" />
            <line x1="20" y1="140" x2="180" y2="60" strokeWidth="2" />
          </svg>
        </div>

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#35D0BA] text-[#101820]">
              Control Operativo 360
            </span>
            <span className="text-xs text-gray-300">
              Sesión activa: <strong className="text-white">{currentEmp.name}</strong> ({currentEmp.role})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Panel de Control Comercial
          </h1>
          <p className="text-sm text-gray-300 max-w-xl">
            Monitoreo en tiempo real de mercadería, ventas de mostrador, pedidos y sincronización de caja.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => onNavigate('sales')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#35D0BA] hover:bg-[#35D0BA]/90 text-[#101820] font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <ShoppingCart size={18} />
            <span>Nueva Venta (POS)</span>
          </button>

          <button
            onClick={() => onNavigate('inventory')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/10"
          >
            <Boxes size={18} className="text-[#F5A623]" />
            <span>Entrada Mercadería</span>
          </button>

          <button
            onClick={() => onNavigate('expenses')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/10"
          >
            <DollarSign size={18} className="text-[#35D0BA]" />
            <span>Cargar Gasto</span>
          </button>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-gray-200 shadow-xs">
          {(['hoy', 'ultimos_7_dias', 'este_mes', 'todo'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-[#101820] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {p === 'hoy' && 'Hoy'}
              {p === 'ultimos_7_dias' && 'Últimos 7 días'}
              {p === 'este_mes' && 'Este Mes'}
              {p === 'todo' && 'Historial Completo'}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-2 font-medium">
          <Clock size={14} className="text-gray-400" />
          <span>Último arqueo de caja automático: hoy {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ventas Hoy */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ventas de Hoy</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#101820]">
            ${salesToday.toLocaleString('es-AR')}
          </div>
          <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-semibold">
            <ArrowUpRight size={14} />
            <span>Operaciones en mostrador activas</span>
          </div>
        </div>

        {/* Card 2: Ventas del Mes */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ventas del Mes</span>
            <div className="w-8 h-8 rounded-xl bg-[#35D0BA]/15 text-[#101820] flex items-center justify-center">
              <TrendingUp size={18} className="text-[#35D0BA]" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#101820]">
            ${salesMonth.toLocaleString('es-AR')}
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <span>{completedSalesCount} pedidos comerciales confirmados</span>
          </div>
        </div>

        {/* Card 3: Stock Bajo / Alerta */}
        <div 
          onClick={() => onNavigate('products')}
          className={`rounded-2xl p-5 border shadow-xs hover:shadow-md transition-all cursor-pointer ${
            lowStockProducts.length > 0
              ? 'bg-amber-50/70 border-amber-300 hover:bg-amber-50'
              : 'bg-white border-gray-200/80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Alerta de Stock
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              lowStockProducts.length > 0 ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-950 flex items-center gap-2">
            {lowStockProducts.length}
            <span className="text-xs font-semibold text-amber-800">artículos críticos</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium">
            {lowStockProducts.length > 0 ? 'Hacé clic para revisar y reponer' : 'Todos los productos con stock óptimo'}
          </div>
        </div>

        {/* Card 4: Balance Operativo (Ingresos - Gastos) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Flujo de Caja (Mes)</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              netOperatingBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className={`text-2xl font-black ${
            netOperatingBalance >= 0 ? 'text-[#101820]' : 'text-rose-600'
          }`}>
            ${netOperatingBalance.toLocaleString('es-AR')}
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <span>Gastos: ${expensesMonth.toLocaleString('es-AR')}</span>
            <span className="text-[10px] text-gray-400 font-medium">(No incluye impuestos)</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 text-center">
          <div className="text-xs text-gray-500 font-medium">Catálogo Activo</div>
          <div className="text-lg font-bold text-[#101820] mt-0.5">
            {products.filter(p => p.status === 'activo').length} productos
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 text-center">
          <div className="text-xs text-gray-500 font-medium">Cartera Clientes</div>
          <div className="text-lg font-bold text-[#101820] mt-0.5">
            {clients.length} registrados
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 text-center">
          <div className="text-xs text-gray-500 font-medium">Movimientos Inventario</div>
          <div className="text-lg font-bold text-[#101820] mt-0.5">
            {movements.length} transacciones
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 text-center">
          <div className="text-xs text-gray-500 font-medium">Gastos Registrados</div>
          <div className="text-lg font-bold text-[#101820] mt-0.5">
            {expenses.length} comprobantes
          </div>
        </div>
      </div>

      {/* Main Content Split: 7-Day Chart & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 7-Day Interactive Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#101820] flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#35D0BA]" />
                  Evolución de Ventas (Últimos 7 días)
                </h3>
                <p className="text-xs text-gray-500">
                  Total facturado día por día en el período comercial corriente.
                </p>
              </div>

              <span className="text-xs font-bold text-[#101820] bg-gray-100 px-2.5 py-1 rounded-lg">
                Total 7d: ${last7DaysData.reduce((a, b) => a + b.total, 0).toLocaleString('es-AR')}
              </span>
            </div>

            {/* Custom Bar Visualization */}
            <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-gray-100">
              {last7DaysData.map((d, idx) => {
                const heightPercent = Math.max(8, Math.round((d.total / maxDaySale) * 100));
                const isToday = idx === last7DaysData.length - 1;

                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Floating Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-[#101820] text-white text-[11px] py-1 px-2 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-20">
                      <div className="font-bold">${d.total.toLocaleString('es-AR')}</div>
                      <div className="text-[10px] text-gray-300">{d.count} ventas</div>
                    </div>

                    <div className="w-full flex items-end justify-center h-40">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 group-hover:brightness-110 ${
                          isToday 
                            ? 'bg-gradient-to-t from-[#35D0BA] to-[#35D0BA]/80 shadow-md shadow-[#35D0BA]/20' 
                            : 'bg-gradient-to-t from-[#101820] to-[#243547]'
                        }`}
                      />
                    </div>

                    <span className={`text-[11px] font-semibold text-center truncate ${
                      isToday ? 'text-[#101820] font-bold underline' : 'text-gray-500'
                    }`}>
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#101820]" /> Días Anteriores
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#35D0BA]" /> Hoy
              </span>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="font-bold text-[#101820] hover:text-[#35D0BA] transition-colors"
            >
              Ver reporte detallado →
            </button>
          </div>
        </div>

        {/* Right Col: Low Stock Alerts & Fast Restock */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[#101820] flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#F5A623]" />
                Alertas de Stock ({lowStockProducts.length})
              </h3>
              <button
                onClick={() => onNavigate('products')}
                className="text-xs text-gray-500 hover:text-[#101820] font-semibold"
              >
                Ver todo
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-gray-700">Inventario en buen nivel</p>
                <p className="text-xs text-gray-400 mt-1">Ningún artículo por debajo del stock mínimo.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 4).map(prod => (
                  <div 
                    key={prod.id} 
                    className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-gray-400">{prod.sku}</span>
                        <span>•</span>
                        <span className="text-amber-800 font-bold">
                          Stock: {prod.stock} {prod.unit}
                        </span>
                        <span className="text-gray-400">(Mín: {prod.minStock})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenRestockModal(prod)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#101820] text-[#35D0BA] hover:bg-[#101820]/90 text-xs font-bold transition-colors shrink-0"
                    >
                      Reponer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => onOpenRestockModal()}
              className="w-full py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle size={15} />
              <span>Registrar Entrada General de Stock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grids: Recent Sales & Recent Inventory Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Table */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#101820]">
                Últimas Ventas Registradas
              </h3>
              <p className="text-xs text-gray-500">
                Operaciones recientes de caja con estado de comprobante.
              </p>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-bold text-[#101820] hover:text-[#35D0BA] transition-colors"
            >
              Ver todas ({sales.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="pb-2">N° Venta</th>
                  <th className="pb-2">Cliente</th>
                  <th className="pb-2">Medio Pago</th>
                  <th className="pb-2 text-right">Total</th>
                  <th className="pb-2 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 font-bold font-mono text-[#101820]">
                      {sale.saleNumber}
                    </td>
                    <td className="py-2.5 text-gray-600 truncate max-w-[120px]">
                      {sale.clientName || 'Consumidor Final'}
                    </td>
                    <td className="py-2.5 capitalize text-gray-500">
                      {sale.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 text-right font-black text-[#101820]">
                      ${sale.total.toLocaleString('es-AR')}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sale.status === 'completada' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sale.status === 'completada' ? 'Pagado' : 'Anulado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Inventory Movements */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#101820]">
                Movimientos Recientes de Mercadería
              </h3>
              <p className="text-xs text-gray-500">
                Kardex de entradas, salidas y ajustes de stock en tiempo real.
              </p>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-bold text-[#101820] hover:text-[#35D0BA] transition-colors"
            >
              Ver Kardex ({movements.length}) →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentMovements.map(mov => {
              const isPositive = mov.type === 'entrada' || mov.type === 'ajuste_positivo' || mov.type === 'anulacion_venta';

              return (
                <div key={mov.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isPositive ? '+' : '-'}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-gray-900 truncate">{mov.productName}</div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {mov.observation} • por {mov.employeeName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`font-black ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isPositive ? `+${mov.quantity}` : `-${mov.quantity}`}
                    </span>
                    <div className="text-[10px] text-gray-400">Saldo: {mov.resultingStock}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Employee Sales Activity Ranking */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
        <h3 className="text-base font-bold text-[#101820] mb-1">
          Rendimiento y Operaciones por Empleado
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Control de caja y ventas registradas por cada miembro del equipo autorizado.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {employeeSalesRank.map((emp, i) => (
            <div key={emp.name} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#101820] text-white flex items-center justify-center text-[10px]">
                    #{i + 1}
                  </span>
                  {emp.name}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  {emp.count} operaciones registradas
                </div>
              </div>
              <div className="text-right font-black text-base text-[#101820]">
                ${emp.total.toLocaleString('es-AR')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
