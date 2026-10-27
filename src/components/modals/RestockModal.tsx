import React, { useState, useEffect } from 'react';
import { Boxes, Plus, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { storageService } from '../../services/storageService';
import { googleSheetsService } from '../../services/sheetsService';
import { ProductSearchSelect } from '../common/ProductSearchSelect';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProduct?: Product | null;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  targetProduct
}) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [docRef, setDocRef] = useState('');
  const [observation, setObservation] = useState('Ingreso regular de mercadería');

  const products = storageService.getProducts();
  const currentEmp = storageService.getCurrentEmployee();

  useEffect(() => {
    if (targetProduct) {
      setSelectedProductId(targetProduct.id);
      setObservation(`Reposición de stock para ${targetProduct.name}`);
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [targetProduct, products]);

  if (!isOpen) return null;

  const currentSelectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('Por favor elija un producto.');
      return;
    }
    if (quantity <= 0) {
      alert('La cantidad a ingresar debe ser mayor a 0.');
      return;
    }

    try {
      storageService.recordManualMovement({
        productId: selectedProductId,
        type: 'entrada',
        quantity,
        observation: observation || 'Ingreso de mercadería',
        referenceDoc: docRef || undefined
      });

      googleSheetsService.syncPendingQueue();
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Error al registrar el ingreso.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-[#101820]">
            <Boxes size={22} className="text-[#F5A623]" />
            <h3 className="text-base font-bold">Ingreso de Mercadería al Depósito</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div>
            <ProductSearchSelect
              label="Producto a Reponer"
              required
              priceMode="compra"
              selectedProductId={selectedProductId}
              onSelect={p => {
                setSelectedProductId(p.id);
                setObservation(`Ingreso de mercadería: ${p.name}`);
              }}
            />
          </div>

          {currentSelectedProduct && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-center justify-between">
              <div>
                <span className="font-semibold block">Existencias actuales:</span>
                <span className="text-xs text-amber-800">
                  {currentSelectedProduct.stock} {currentSelectedProduct.unit}s (Mín: {currentSelectedProduct.minStock})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-700 block uppercase font-bold">Nuevo Saldo:</span>
                <span className="text-sm font-black text-[#101820]">
                  {currentSelectedProduct.stock + (quantity || 0)} {currentSelectedProduct.unit}s
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                Cantidad a Ingresar *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity || ''}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border rounded-xl font-bold text-sm text-[#101820] focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">
                N° Remito / Factura
              </label>
              <input
                type="text"
                value={docRef}
                onChange={e => setDocRef(e.target.value)}
                placeholder="REM-10940"
                className="w-full px-3 py-2 border rounded-xl font-mono focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">
              Observación / Proveedor
            </label>
            <input
              type="text"
              value={observation}
              onChange={e => setObservation(e.target.value)}
              placeholder="Ej. Recepción pedido semanal de fábrica"
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
            />
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-gray-500 text-[11px]">
            Operador responsable: <strong>{currentEmp.name}</strong> ({currentEmp.role})
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#101820] text-[#35D0BA] font-bold shadow-md hover:bg-[#101820]/90 transition-colors"
            >
              Confirmar Entrada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
