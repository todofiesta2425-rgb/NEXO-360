import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Users, 
  PieChart, 
  Calendar,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { storageService } from '../services/storageService';

export const ReportsPage: React.FC = () => {
  const [periodPreset, setPeriodPreset] = useState<'este_mes' | 'ultimos_30_dias' | 'todo'>('este_mes');

  const sales = storageService.getSales();
  const products = storageService.getProducts();
  const expenses = storageService.getExpenses();
  const movements = storageService.getMovements();
  const employees = storageService.getEmployees();

  // Completed sales
  const completedSales = useMemo(() => {
    return sales.filter(s => s.status === 'completada');
  }, [sales]);

  // Total sales revenue
  const totalRevenue = useMemo(() => {
    return completedSales.reduce((sum, s) => sum + s.total, 0);
  }, [completedSales]);

  // Total operational expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Operational cash difference (Ingresos - Gastos)
  const cashDifference = totalRevenue - totalExpenses;

  // Top Selling Products Ranking
  const topProducts = useMemo(() => {
    const map: Record<string, { id: string; name: string; sku: string; units: number; revenue: number }> = {};

    completedSales.forEach(s => {
      s.items.forEach(it => {
        if (!map[it.productId]) {
          map[it.productId] = {
            id: it.productId,
            name: it.productName,
            sku: it.productSku,
            units: 0,
            revenue: 0
          };
        }
        map[it.productId].units += it.quantity;
        map[it.productId].revenue += it.subtotal;
      });
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [completedSales]);

  // Expenses by Category
  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
      percent: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [expenses, totalExpenses]);

  // Employee Performance Ranking
  const employeePerformance = useMemo(() => {
    const map: Record<string, { name: string; salesCount: number; revenue: number; movementsCount: number }> = {};

    employees.forEach(e => {
      map[e.id] = { name: e.name, salesCount: 0, revenue: 0, movementsCount: 0 };
    });

    completedSales.forEach(s => {
      if (map[s.employeeId]) {
        map[s.employeeId].salesCount += 1;
        map[s.employeeId].revenue += s.total;
      }
    });

    movements.forEach(m => {
      if (map[m.employeeId]) {
        map[m.employeeId].movementsCount += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [employees, completedSales, movements]);

  // Payment methods breakdown
  const paymentMethodsBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    completedSales.forEach(s => {
      if (!map[s.paymentMethod]) {
        map[s.paymentMethod] = { count: 0, total: 0 };
      }
      map[s.paymentMethod].count += 1;
      map[s.paymentMethod].total += s.total;
    });
    return Object.entries(map).map(([method, data]) => ({
      method,
      ...data,
      percent: totalRevenue > 0 ? Math.round((data.total / totalRevenue) * 100) : 0
    })).sort((a, b) => b.total - a.total);
  }, [completedSales, totalRevenue]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#101820]">
            Reportes y Estadísticas Comerciales
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Análisis de rentabilidad, artículos más vendidos, rotación y rendimiento por operador.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => storageService.exportTableToCsv('ventas')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
          >
            <Download size={15} />
            <span>Exportar Ventas CSV</span>
          </button>
          <button
            onClick={() => storageService.exportTableToCsv('gastos')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
          >
            <Download size={15} />
            <span>Exportar Gastos CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Health Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos por Ventas</span>
          <div className="text-2xl font-black text-[#101820] mt-1">
            ${totalRevenue.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">
            {completedSales.length} operaciones aprobadas
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Egresos Operativos Registrados</span>
          <div className="text-2xl font-black text-rose-700 mt-1">
            ${totalExpenses.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">
            {expenses.length} comprobantes de gastos
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diferencia de Caja Operativa</span>
          <div className={`text-2xl font-black mt-1 ${
            cashDifference >= 0 ? 'text-emerald-700' : 'text-rose-700'
          }`}>
            ${cashDifference.toLocaleString('es-AR')}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block leading-tight">
            * Margen operativo de caja. No constituye balance contable o neto si faltan costos indirectos o impositivos.
          </span>
        </div>
      </div>

      {/* Top Products Ranking & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Top Selling Products */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#101820] flex items-center gap-2">
                <Package size={18} className="text-[#35D0BA]" />
                Ranking de Artículos Más Vendidos
              </h3>
              <p className="text-xs text-gray-500">
                Productos con mayor facturación y rotación en el inventario.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {topProducts.slice(0, 6).map((item, idx) => {
              const maxProdRev = topProducts[0]?.revenue || 1;
              const barWidth = Math.round((item.revenue / maxProdRev) * 100);

              return (
                <div key={item.id} className="p-3 rounded-2xl bg-gray-50/70 border border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#101820] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-gray-900 truncate">
                        {item.name}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400">
                        ({item.sku})
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-[#101820]">
                        ${item.revenue.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[10px] text-gray-500 ml-2">
                        ({item.units} un.)
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${barWidth}%` }} 
                      className="bg-gradient-to-r from-[#101820] to-[#35D0BA] h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Payment Methods Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#101820] flex items-center gap-2">
              <PieChart size={18} className="text-[#F5A623]" />
              Participación por Medio de Pago
            </h3>
            <p className="text-xs text-gray-500">
              Distribución de cobranzas en mostrador y canales digitales.
            </p>
          </div>

          <div className="space-y-3">
            {paymentMethodsBreakdown.map(pm => (
              <div key={pm.method} className="p-3 rounded-2xl border border-gray-100 bg-gray-50/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold capitalize text-gray-800">
                    {pm.method.replace('_', ' ')}
                  </span>
                  <div className="text-right font-black text-gray-900">
                    ${pm.total.toLocaleString('es-AR')}
                    <span className="text-[10px] text-gray-400 font-semibold ml-1.5">
                      ({pm.percent}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pm.percent}%` }}
                    className="bg-[#F5A623] h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses by Category & Employee Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#101820]">
              Gastos por Rubro Operativo
            </h3>
            <p className="text-xs text-gray-500">
              Desglose de erogaciones para control presupuestario.
            </p>
          </div>

          <div className="space-y-2.5">
            {expensesByCategory.map(item => (
              <div key={item.category} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                <span className="capitalize font-bold text-gray-800">
                  {item.category}
                </span>
                <div className="text-right">
                  <span className="font-black text-rose-700">
                    ${item.amount.toLocaleString('es-AR')}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-2">
                    {item.percent}% del total
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Audit Table */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#101820]">
              Rendimiento Operativo del Personal
            </h3>
            <p className="text-xs text-gray-500">
              Ventas concretadas y registros de inventario asignados a cada empleado.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase font-bold text-[10px]">
                  <th className="pb-2">Colaborador</th>
                  <th className="pb-2 text-center">Ventas</th>
                  <th className="pb-2 text-center">Mov. Kardex</th>
                  <th className="pb-2 text-right">Facturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employeePerformance.map(emp => (
                  <tr key={emp.name} className="hover:bg-gray-50">
                    <td className="py-2.5 font-bold text-gray-900">
                      {emp.name}
                    </td>
                    <td className="py-2.5 text-center text-gray-600 font-semibold">
                      {emp.salesCount}
                    </td>
                    <td className="py-2.5 text-center text-gray-500">
                      {emp.movementsCount}
                    </td>
                    <td className="py-2.5 text-right font-black text-[#101820]">
                      ${emp.revenue.toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
