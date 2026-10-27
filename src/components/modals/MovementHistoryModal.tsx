import React from 'react';
import { History, X, ArrowDownRight, ArrowUpRight, Boxes } from 'lucide-react';
import { Product, InventoryMovement } from '../../types';
import { storageService } from '../../services/storageService';

interface MovementHistoryModalProps {
  product: Product | null;
  onClose: () => void;
}

export const MovementHistoryModal: React.FC<MovementHistoryModalProps> = ({
  product,
  onClose
}) => {
  if (!product) return null;

  const allMovements = storageService.getMovements();
  const productMovements = allMovements.filter(m => m.productId === product.id);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <History size={20} className="text-[#35D0BA]" />
              <h3 className="text-base font-bold text-[#101820]">
                Historial de Movimientos: {product.name}
              </h3>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              SKU: <span className="font-mono font-bold text-[#101820]">{product.sku}</span> • Stock actual: <strong>{product.stock} {product.unit}s</strong>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Content Table */}
        <div className="overflow-y-auto my-4 flex-1 pr-1 text-xs">
          {productMovements.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Boxes size={32} className="mx-auto mb-2 opacity-50" />
              <p>No hay registros de movimientos específicos para este artículo todavía.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px] pb-2">
                  <th className="pb-2">Fecha</th>
                  <th className="pb-2">Tipo</th>
                  <th className="pb-2 text-center">Cantidad</th>
                  <th className="pb-2 text-center">Saldo</th>
                  <th className="pb-2">Responsable</th>
                  <th className="pb-2">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productMovements.map(m => {
                  const isPositive = m.type === 'entrada' || m.type === 'ajuste_positivo' || m.type === 'anulacion_venta';

                  return (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="py-2.5 text-gray-500 whitespace-nowrap">
                        {new Date(m.date).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {m.type.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-2.5 text-center font-black">
                        <span className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>
                          {isPositive ? `+${m.quantity}` : `-${m.quantity}`}
                        </span>
                      </td>

                      <td className="py-2.5 text-center font-bold text-gray-800">
                        {m.resultingStock}
                      </td>

                      <td className="py-2.5 text-gray-600 font-medium">
                        {m.employeeName}
                      </td>

                      <td className="py-2.5 text-gray-500 max-w-[150px] truncate">
                        {m.observation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#101820] text-[#35D0BA] font-bold text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
