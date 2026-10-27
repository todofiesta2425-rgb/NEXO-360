import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  ArrowDownRight, 
  ArrowUpRight, 
  Download, 
  RefreshCcw, 
  AlertTriangle,
  FileText,
  User,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { googleSheetsService } from '../services/sheetsService';
import { InventoryMovement, MovementType, Product } from '../types';
import { ProductSearchSelect } from '../components/common/ProductSearchSelect';

interface InventoryPageProps {
  onOpenRestockModal: (product?: Product) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ onOpenRestockModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Adjustment form state
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustType, setAdjustType] = useState<MovementType>('entrada');
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustObservation, setAdjustObservation] = useState('');
  const [adjustDocRef, setAdjustDocRef] = useState('');

  const movements = storageService.getMovements();
  const products = storageService.getProducts();
  const currentEmp = storageService.getCurrentEmployee();

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const matchSearch = 
        m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.observation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === 'todos' || m.type === typeFilter;

      return matchSearch && matchType;
    });
  }, [movements, searchTerm, typeFilter]);

  const handleExecuteAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId) {
      alert('Seleccione un producto.');
      return;
    }
    if (adjustQty <= 0) {
      alert('La cantidad debe ser mayor a 0.');
      return;
    }
    if (!adjustObservation.trim()) {
      alert('La observación es obligatoria para la auditoría de inventario.');
      return;
    }

    try {
      storageService.recordManualMovement({
        productId: adjustProductId,
        type: adjustType,
        quantity: adjustQty,
        observation: adjustObservation,
        referenceDoc: adjustDocRef || undefined
      });

      setIsAdjustModalOpen(false);
      setAdjustProductId('');
      setAdjustQty(1);
      setAdjustObservation('');
      setAdjustDocRef('');

      // Auto sync
      googleSheetsService.syncPendingQueue();
    } catch (err: any) {
      alert(err?.message || 'Error al registrar el movimiento.');
    }
  };

  const getMovementBadge = (type: MovementType) => {
    switch (type) {
      case 'entrada':
        return { label: 'Entrada Mercadería', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'salida_venta':
        return { label: 'Salida por Venta', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'salida_merma':
        return { label: 'Merma / Rotura', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'ajuste_positivo':
        return { label: 'Ajuste Físico (+)', bg: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'ajuste_negativo':
        return { label: 'Ajuste Físico (-)', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'anulacion_venta':
        return { label: 'Reintegro por Anulación', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#101820]">
            Inventario y Libro Mayor (Kardex)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Registro cronológico inmutable de entradas, salidas, mermas y auditoría de existencias.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => storageService.exportTableToCsv('inventario')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
          >
            <Download size={15} />
            <span>Exportar Kardex CSV</span>
          </button>

          <button
            onClick={() => {
              setAdjustType('entrada');
              setIsAdjustModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101820] text-[#35D0BA] font-bold text-xs hover:bg-[#101820]/90 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por producto, SKU, responsable u observación..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-hidden"
          >
            <option value="todos">Todos los tipos de movimiento</option>
            <option value="entrada">Entradas de mercadería</option>
            <option value="salida_venta">Salidas por venta</option>
            <option value="salida_merma">Mermas y roturas</option>
            <option value="ajuste_positivo">Ajustes físicos (+)</option>
            <option value="ajuste_negativo">Ajustes físicos (-)</option>
            <option value="anulacion_venta">Reintegros por anulación</option>
          </select>
        </div>
      </div>

      {/* Movements Ledger Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Fecha / Hora</th>
                <th className="py-3 px-4">Producto & SKU</th>
                <th className="py-3 px-4">Tipo Movimiento</th>
                <th className="py-3 px-4 text-center">Cantidad</th>
                <th className="py-3 px-4 text-center">Stock Anterior</th>
                <th className="py-3 px-4 text-center">Saldo Resultante</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4">Observación / Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMovements.map(mov => {
                const badge = getMovementBadge(mov.type);
                const isPositive = mov.type === 'entrada' || mov.type === 'ajuste_positivo' || mov.type === 'anulacion_venta';

                return (
                  <tr key={mov.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(mov.date).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900 leading-tight">
                        {mov.productName}
                      </div>
                      <div className="text-[10px] font-mono text-gray-400">
                        {mov.productSku}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`font-black text-xs ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isPositive ? `+${mov.quantity}` : `-${mov.quantity}`}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center text-gray-500 font-semibold">
                      {mov.previousStock}
                    </td>

                    <td className="py-3 px-4 text-center font-black text-gray-900">
                      {mov.resultingStock}
                    </td>

                    <td className="py-3 px-4 text-gray-700 font-medium">
                      {mov.employeeName}
                    </td>

                    <td className="py-3 px-4 text-gray-600 max-w-xs">
                      <div>{mov.observation}</div>
                      {mov.referenceDoc && (
                        <span className="text-[10px] text-gray-400 font-mono">
                          Doc: {mov.referenceDoc}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Movement / Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#101820]">
                Registrar Movimiento de Inventario
              </h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteAdjustment} className="space-y-4 mt-4 text-xs">
              <div>
                <ProductSearchSelect
                  label="Producto a Afectar *"
                  selectedProductId={adjustProductId}
                  onSelect={(p) => setAdjustProductId(p.id)}
                  required
                  placeholder="Buscar por nombre, SKU o código de barras..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Tipo de Movimiento *
                  </label>
                  <select
                    value={adjustType}
                    onChange={e => setAdjustType(e.target.value as MovementType)}
                    className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  >
                    <option value="entrada">Entrada de Mercadería (+)</option>
                    <option value="salida_merma">Merma / Rotura (-)</option>
                    <option value="ajuste_positivo">Ajuste Físico Positivo (+)</option>
                    <option value="ajuste_negativo">Ajuste Físico Negativo (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustQty}
                    onChange={e => setAdjustQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  N° Comprobante / Remito (Opcional)
                </label>
                <input
                  type="text"
                  value={adjustDocRef}
                  onChange={e => setAdjustDocRef(e.target.value)}
                  placeholder="Ej. REM-48201 / Factura A-102"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Observación / Justificación *
                </label>
                <textarea
                  required
                  rows={2}
                  value={adjustObservation}
                  onChange={e => setAdjustObservation(e.target.value)}
                  placeholder="Motivo del ingreso o ajuste de auditoría física..."
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-gray-500">
                Responsable del registro: <strong>{currentEmp.name}</strong> ({currentEmp.role})
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#101820] text-[#35D0BA] font-bold shadow-md hover:bg-[#101820]/90 transition-colors"
                >
                  Guardar en Kardex
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
