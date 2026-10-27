import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  Download, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  User, 
  FileSpreadsheet,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod } from '../types';
import { storageService } from '../services/storageService';
import { googleSheetsService } from '../services/sheetsService';

export const ExpensesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New expense form
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('servicios');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');

  const expenses = storageService.getExpenses();
  const currentEmp = storageService.getCurrentEmployee();
  const canCreate = currentEmp.role !== 'solo_lectura';

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = 
        e.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.receiptNumber && e.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        e.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'todas' || e.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) {
      alert('El concepto del gasto es obligatorio.');
      return;
    }
    if (amount <= 0) {
      alert('El monto del gasto debe ser mayor a 0.');
      return;
    }

    try {
      storageService.createExpense({
        concept,
        category,
        amount,
        paymentMethod,
        receiptNumber: receiptNumber || undefined,
        notes: notes || undefined
      });

      setIsModalOpen(false);
      setConcept('');
      setAmount(0);
      setReceiptNumber('');
      setNotes('');

      // Auto sync
      googleSheetsService.syncPendingQueue();
    } catch (err: any) {
      alert(err?.message || 'Error al registrar el gasto.');
    }
  };

  const getCategoryColor = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'proveedores':
        return 'bg-blue-100 text-blue-800';
      case 'alquiler':
        return 'bg-purple-100 text-purple-800';
      case 'servicios':
        return 'bg-amber-100 text-amber-800';
      case 'sueldos':
        return 'bg-teal-100 text-teal-800';
      case 'impuestos':
        return 'bg-rose-100 text-rose-800';
      case 'mantenimiento':
        return 'bg-orange-100 text-orange-800';
      case 'marketing':
        return 'bg-pink-100 text-pink-800';
      case 'logistica':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#101820]">
            Gastos y Egresos Operativos
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Control de egresos de caja, pago de servicios, logística y proveedores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => storageService.exportTableToCsv('gastos')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
          >
            <Download size={15} />
            <span>Exportar Gastos CSV</span>
          </button>

          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101820] text-[#35D0BA] font-bold text-xs hover:bg-[#101820]/90 transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Cargar Nuevo Gasto</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Metrics & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total en este listado</span>
          <div className="text-2xl font-black text-rose-700 mt-1">
            ${totalFilteredAmount.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">
            {filteredExpenses.length} comprobantes registrados
          </span>
        </div>

        <div className="sm:col-span-2 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar concepto, N° de ticket o responsable..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-hidden"
          >
            <option value="todas">Todas las categorías</option>
            <option value="proveedores">Proveedores</option>
            <option value="alquiler">Alquiler</option>
            <option value="servicios">Servicios (Luz/Internet/Gas)</option>
            <option value="sueldos">Sueldos y Adelantos</option>
            <option value="impuestos">Impuestos y Tasas</option>
            <option value="mantenimiento">Mantenimiento y Limpieza</option>
            <option value="marketing">Marketing y Publicidad</option>
            <option value="logistica">Logística y Envíos</option>
            <option value="otros">Otros</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Concepto / Comprobante</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Medio de Pago</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4 text-center">Sheets Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                    {new Date(expense.date).toLocaleString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-gray-900 leading-tight">
                      {expense.concept}
                    </div>
                    {expense.receiptNumber && (
                      <span className="text-[10px] text-gray-400 font-mono">
                        Comp: {expense.receiptNumber}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 capitalize text-gray-600">
                    {expense.paymentMethod.replace('_', ' ')}
                  </td>

                  <td className="py-3 px-4 text-right font-black text-sm text-rose-700">
                    ${expense.amount.toLocaleString('es-AR')}
                  </td>

                  <td className="py-3 px-4 text-gray-700 font-medium">
                    {expense.employeeName}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      expense.syncStatus === 'sincronizado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {expense.syncStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#101820]">
                Cargar Nuevo Gasto de Caja
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Concepto del Gasto *</label>
                <input
                  type="text"
                  required
                  value={concept}
                  onChange={e => setConcept(e.target.value)}
                  placeholder="Ej. Pago Servicio Eléctrico Local / Reposición Papelería"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Monto ($) *</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={amount || ''}
                    onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-xl font-black text-sm text-rose-700 focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Categoría *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  >
                    <option value="proveedores">Proveedores</option>
                    <option value="alquiler">Alquiler</option>
                    <option value="servicios">Servicios (Luz/Internet/Gas)</option>
                    <option value="sueldos">Sueldos y Adelantos</option>
                    <option value="impuestos">Impuestos</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="marketing">Marketing</option>
                    <option value="logistica">Logística</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Medio de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border rounded-xl bg-white capitalize focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta_debito">Tarjeta Débito</option>
                    <option value="tarjeta_credito">Tarjeta Crédito</option>
                    <option value="cuenta_corriente">Cuenta Corriente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">N° Comprobante / Factura</label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={e => setReceiptNumber(e.target.value)}
                    placeholder="FAC-B 0012-901"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Observaciones / Notas</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Detalle de imputación contable..."
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-gray-500">
                Responsable del gasto: <strong>{currentEmp.name}</strong> ({currentEmp.role})
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#101820] text-[#35D0BA] font-bold shadow-md hover:bg-[#101820]/90 transition-colors"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
