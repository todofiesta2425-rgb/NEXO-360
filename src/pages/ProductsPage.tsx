import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Edit3, 
  Power, 
  Download, 
  Boxes, 
  ArrowUpDown, 
  History,
  CheckCircle2,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Product, ProductUnit } from '../types';
import { storageService } from '../services/storageService';

interface ProductsPageProps {
  onOpenRestockModal: (product?: Product) => void;
  onOpenMovementHistoryModal: (product: Product) => void;
  onNavigateToImport?: () => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  onOpenRestockModal,
  onOpenMovementHistoryModal,
  onNavigateToImport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [stockFilter, setStockFilter] = useState<'todos' | 'critico' | 'positivo'>('todos');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const products = storageService.getProducts();
  const currentEmp = storageService.getCurrentEmployee();
  const canEdit = currentEmp.role === 'propietario' || currentEmp.role === 'administrador';

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.supplier && p.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCat = categoryFilter === 'todas' || p.category === categoryFilter;

      const matchStock = 
        stockFilter === 'todos' ? true :
        stockFilter === 'critico' ? (p.stock <= p.minStock && p.status === 'activo') :
        (p.stock > p.minStock && p.status === 'activo');

      return matchSearch && matchCat && matchStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const handleOpenCreate = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      description: '',
      category: categories[0] || 'General',
      salePrice: 0,
      unitCost: 0,
      stock: 0,
      minStock: 5,
      unit: 'unidad',
      supplier: '',
      imageUrl: '',
      status: 'activo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name.trim()) {
      alert('El nombre del producto es obligatorio');
      return;
    }
    if (editingProduct.salePrice < 0) {
      alert('El precio de venta no puede ser negativo');
      return;
    }

    storageService.saveProduct(editingProduct);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleToggleStatus = (p: Product) => {
    if (p.status === 'activo') {
      const confirmDeact = window.confirm(`¿Desactivar el producto "${p.name}"? Seguirá registrado en el historial de ventas.`);
      if (!confirmDeact) return;
      storageService.deleteOrDeactivateProduct(p.id);
    } else {
      storageService.saveProduct({ ...p, status: 'activo' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#101820]">
              Productos y Mercadería
            </h1>
            <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {products.length} artículos
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Administración del catálogo maestro, costos, márgenes y existencias comerciales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => storageService.exportTableToCsv('productos')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
          >
            <Download size={15} />
            <span>Exportar CSV</span>
          </button>

          {onNavigateToImport && (
            <button
              onClick={onNavigateToImport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#35D0BA]/15 hover:bg-[#35D0BA]/25 text-[#101820] border border-[#35D0BA]/40 font-bold text-xs transition-colors"
            >
              <FileSpreadsheet size={15} className="text-[#35D0BA]" />
              <span>Importar Facturas / Excel</span>
            </button>
          )}

          <button
            onClick={() => onOpenRestockModal()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-colors"
          >
            <Boxes size={15} className="text-amber-600" />
            <span>Ingreso de Stock</span>
          </button>

          {canEdit && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101820] hover:bg-[#101820]/90 text-[#35D0BA] font-bold text-xs transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Nuevo Producto</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o proveedor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#35D0BA] focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-hidden"
          >
            <option value="todas">Todas las categorías</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Stock Condition */}
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as any)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-hidden"
          >
            <option value="todos">Todos los stocks</option>
            <option value="critico">⚠️ Stock Crítico / Bajo</option>
            <option value="positivo">Stock Óptimo</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Artículo</th>
                <th className="py-3 px-4">SKU / Categoría</th>
                <th className="py-3 px-4 text-right">Precio Venta</th>
                <th className="py-3 px-4 text-right">Costo / Margen</th>
                <th className="py-3 px-4 text-center">Stock Actual</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(prod => {
                const isLow = prod.stock <= prod.minStock && prod.status === 'activo';
                const margin = prod.unitCost > 0 
                  ? Math.round(((prod.salePrice - prod.unitCost) / prod.salePrice) * 100)
                  : 0;

                return (
                  <tr key={prod.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Name & Image */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          {prod.imageUrl ? (
                            <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 leading-tight">
                            {prod.name}
                          </div>
                          {prod.supplier && (
                            <div className="text-[10px] text-gray-400 truncate max-w-[180px]">
                              Prov: {prod.supplier}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SKU & Category */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#101820]">
                        {prod.sku}
                      </div>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {prod.category}
                      </span>
                    </td>

                    {/* Sale Price */}
                    <td className="py-3 px-4 text-right font-black text-sm text-[#101820]">
                      ${prod.salePrice.toLocaleString('es-AR')}
                    </td>

                    {/* Cost & Margin */}
                    <td className="py-3 px-4 text-right">
                      <div className="text-gray-500">
                        ${prod.unitCost ? prod.unitCost.toLocaleString('es-AR') : '0'}
                      </div>
                      {margin > 0 && (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          +{margin}% margen
                        </span>
                      )}
                    </td>

                    {/* Stock & Warning */}
                    <td className="py-3 px-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold ${
                        isLow
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : prod.stock === 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {isLow && <AlertTriangle size={13} className="text-amber-700" />}
                        <span>
                          {prod.stock} {prod.unit}s
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Mín: {prod.minStock}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.status === 'activo'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {prod.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenMovementHistoryModal(prod)}
                          title="Historial de movimientos"
                          className="p-1.5 text-gray-500 hover:text-[#101820] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <History size={16} />
                        </button>

                        <button
                          onClick={() => onOpenRestockModal(prod)}
                          title="Ingreso de mercadería rápido"
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Boxes size={16} />
                        </button>

                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              title="Editar producto"
                              className="p-1.5 text-gray-500 hover:text-[#101820] hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(prod)}
                              title={prod.status === 'activo' ? 'Desactivar' : 'Activar'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                prod.status === 'activo' 
                                  ? 'text-gray-400 hover:text-rose-600 hover:bg-rose-50' 
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              <Power size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#101820]">
                {editingProduct.id.startsWith('prod-') && !products.some(p => p.id === editingProduct.id)
                  ? 'Nuevo Producto'
                  : `Editar: ${editingProduct.name}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                    placeholder="Ej. Café Colombia Huila 1kg"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Código SKU *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                    placeholder="Ej. BEV-001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  placeholder="Detalles sobre presentación, sabor o especificaciones..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Categoría</label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                    placeholder="Cafetería, Pastelería..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Unidad de Medida</label>
                  <select
                    value={editingProduct.unit}
                    onChange={e => setEditingProduct({ ...editingProduct, unit: e.target.value as ProductUnit })}
                    className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  >
                    <option value="unidad">Unidad</option>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="litro">Litro</option>
                    <option value="caja">Caja</option>
                    <option value="pack">Pack</option>
                    <option value="metro">Metro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Proveedor Habitual</label>
                  <input
                    type="text"
                    value={editingProduct.supplier || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, supplier: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                    placeholder="Ej. Distribuidora Andina"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div>
                  <label className="block text-[#101820] font-bold mb-1">Precio Venta ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={editingProduct.salePrice || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, salePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl font-bold bg-white text-base focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Costo Unitario ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editingProduct.unitCost || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, unitCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Stock Actual</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stock || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl bg-white font-bold focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-amber-900 font-bold mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.minStock || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">URL de Imagen</label>
                <input
                  type="url"
                  value={editingProduct.imageUrl || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
