import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  CreditCard, 
  CheckCircle, 
  Download, 
  Ban, 
  AlertCircle, 
  Receipt, 
  FileSpreadsheet, 
  Printer, 
  Check, 
  ChevronRight,
  Package
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { googleSheetsService } from '../services/sheetsService';
import { Product, Sale, SaleItem, PaymentMethod, Client } from '../types';

export const SalesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  
  // Cart state
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('cli-005'); // Consumidor Final by default
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [saleNotes, setSaleNotes] = useState<string>('');
  
  // Receipt modal
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  
  // Cancellation modal
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // History search
  const [historySearch, setHistorySearch] = useState('');

  const products = storageService.getProducts();
  const clients = storageService.getClients();
  const sales = storageService.getSales();
  const currentEmp = storageService.getCurrentEmployee();

  // Active products for sale
  const availableProducts = useMemo(() => {
    return products.filter(p => p.status === 'activo');
  }, [products]);

  // Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    availableProducts.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [availableProducts]);

  // Filtered products in POS
  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return availableProducts.filter(p => {
      const matchSearch = 
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.presentation && p.presentation.toLowerCase().includes(q)) ||
        (p.supplierCode && p.supplierCode.toLowerCase().includes(q));
      const matchCat = selectedCategory === 'todas' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [availableProducts, searchTerm, selectedCategory]);

  // Cart calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.subtotal, 0);
  }, [cart]);

  const total = Math.max(0, subtotal - discountAmount);

  // Cart actions
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(`No hay stock disponible de "${product.name}".`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`No se puede agregar más cantidad. Stock disponible: ${product.stock} ${product.unit}s.`);
          return prev;
        }
        return prev.map(i => 
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice }
            : i
        );
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            unit: product.unit,
            quantity: 1,
            unitPrice: product.salePrice,
            unitCost: product.unitCost,
            subtotal: product.salePrice
          }
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const prod = products.find(p => p.id === productId);

    setCart(prev => {
      return prev.map(it => {
        if (it.productId === productId) {
          const newQty = it.quantity + delta;
          if (newQty <= 0) return null as any;
          if (prod && newQty > prod.stock) {
            alert(`Stock máximo alcanzado (${prod.stock} ${prod.unit}s).`);
            return it;
          }
          return {
            ...it,
            quantity: newQty,
            subtotal: newQty * it.unitPrice
          };
        }
        return it;
      }).filter(Boolean);
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setSaleNotes('');
  };

  const handleConfirmSale = () => {
    if (cart.length === 0) {
      alert('El carrito se encuentra vacío.');
      return;
    }

    // Role check: solo_lectura cannot sell
    if (currentEmp.role === 'solo_lectura') {
      alert('Tu rol actual es "Solo Lectura". No tenés permisos para confirmar ventas.');
      return;
    }

    const selectedClient = clients.find(c => c.id === selectedClientId);

    try {
      const newSale = storageService.createSale({
        items: cart,
        clientId: selectedClientId,
        clientName: selectedClient?.name || 'Consumidor Final',
        clientPhone: selectedClient?.phone,
        paymentMethod,
        discount: discountAmount,
        notes: saleNotes
      });

      // Clear cart
      handleClearCart();
      setCompletedSale(newSale);

      // Attempt background Google Sheets sync
      googleSheetsService.syncPendingQueue();
    } catch (err: any) {
      alert(err?.message || 'Error al procesar la venta.');
    }
  };

  // Cancellation
  const handleExecuteCancel = () => {
    if (!saleToCancel) return;
    if (!cancelReason.trim()) {
      alert('Por favor especifique el motivo de anulación para el libro mayor.');
      return;
    }

    try {
      storageService.cancelSale(saleToCancel.id, cancelReason);
      setSaleToCancel(null);
      setCancelReason('');
      googleSheetsService.syncPendingQueue();
    } catch (err: any) {
      alert(err?.message || 'Error al anular la venta.');
    }
  };

  // Filtered sales history
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      return (
        s.saleNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
        (s.clientName && s.clientName.toLowerCase().includes(historySearch.toLowerCase())) ||
        s.employeeName.toLowerCase().includes(historySearch.toLowerCase())
      );
    });
  }, [sales, historySearch]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Tab Switcher & Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#101820]">
            Punto de Venta y Facturación
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Cobro en mostrador, emisión de comprobantes, deducción automática de stock y arqueo.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pos'
                ? 'bg-[#101820] text-[#35D0BA] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart size={15} />
            <span>Terminal POS</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-[#101820] text-[#35D0BA] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Receipt size={15} />
            <span>Historial ({sales.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        /* POS Layout: Left Product Catalog Grid, Right Real-time Cart */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Columns: Product Selection */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search and Category Filters */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o SKU para agregar al ticket..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#35D0BA] focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  onClick={() => setSelectedCategory('todas')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === 'todas'
                      ? 'bg-[#101820] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todas ({availableProducts.length})
                </button>
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === c
                        ? 'bg-[#101820] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map(p => {
                const inCart = cart.find(i => i.productId === p.id);
                const isOutOfStock = p.stock <= 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && handleAddToCart(p)}
                    className={`bg-white rounded-2xl p-3 border text-left transition-all relative flex flex-col justify-between group ${
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed border-gray-200'
                        : inCart
                        ? 'border-[#35D0BA] ring-2 ring-[#35D0BA]/30 shadow-sm cursor-pointer hover:shadow-md'
                        : 'border-gray-200 hover:border-gray-300 shadow-2xs hover:shadow-md cursor-pointer'
                    }`}
                  >
                    {/* Item Image & Stock Badge */}
                    <div className="relative w-full h-28 rounded-xl overflow-hidden bg-gray-100 mb-2 border border-gray-100">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={28} />
                        </div>
                      )}

                      <span className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isOutOfStock 
                          ? 'bg-rose-600 text-white' 
                          : p.stock <= p.minStock 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-black/60 text-white backdrop-blur-xs'
                      }`}>
                        {isOutOfStock ? 'Agotado' : `${p.stock} ${p.unit}`}
                      </span>

                      {inCart && (
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#35D0BA] text-[#101820] text-xs font-black shadow-md">
                          En ticket: {inCart.quantity}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="font-bold text-xs text-gray-900 line-clamp-2 leading-tight">
                        {p.name}
                      </div>
                      <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                        {p.sku}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-black text-[#101820]">
                        ${p.salePrice.toLocaleString('es-AR')}
                      </span>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        aria-label={`Agregar ${p.name} al carrito`}
                        className="w-7 h-7 rounded-lg bg-[#101820] text-[#35D0BA] flex items-center justify-center group-hover:bg-[#35D0BA] group-hover:text-[#101820] transition-colors"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 5 Columns: Active Cart & Checkout */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-gray-200/80 shadow-md sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-[#35D0BA]" />
                <h3 className="font-bold text-[#101820] text-sm">Ticket de Venta</h3>
                <span className="bg-[#101820] text-[#35D0BA] text-xs font-bold px-2 py-0.5 rounded-full">
                  {cart.reduce((a, b) => a + b.quantity, 0)} ítems
                </span>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-xs text-gray-400 hover:text-rose-600 font-semibold transition-colors"
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="my-3 max-h-64 overflow-y-auto divide-y divide-gray-100 pr-1 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <ShoppingCart size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">El carrito está vacío</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Seleccioná productos del catálogo para agregar.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-800 truncate">{item.productName}</div>
                      <div className="text-[10px] text-gray-400">
                        ${item.unitPrice.toLocaleString('es-AR')} x {item.unit}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, -1)}
                        className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-7 text-center font-bold text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, 1)}
                        className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="w-20 text-right font-black text-gray-900 shrink-0">
                      ${item.subtotal.toLocaleString('es-AR')}
                    </div>

                    <button
                      onClick={() => handleRemoveFromCart(item.productId)}
                      className="text-gray-300 hover:text-rose-600 p-1 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Form & Details */}
            <div className="pt-3 border-t border-gray-100 space-y-3 text-xs">
              {/* Client Selection */}
              <div>
                <label className="block text-gray-600 font-bold mb-1 flex items-center gap-1">
                  <User size={12} /> Cliente Asociado
                </label>
                <select
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.taxId ? `(${c.taxId})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-gray-600 font-bold mb-1 flex items-center gap-1">
                  <CreditCard size={12} /> Medio de Pago
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito', 'cuenta_corriente', 'otro'] as PaymentMethod[]).map(pm => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold capitalize border transition-colors ${
                        paymentMethod === pm
                          ? 'bg-[#101820] text-[#35D0BA] border-[#101820]'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {pm.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount & Notes */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Descuento ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount || ''}
                    onChange={e => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-xl bg-gray-50 text-xs font-semibold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Observación</label>
                  <input
                    type="text"
                    value={saleNotes}
                    onChange={e => setSaleNotes(e.target.value)}
                    placeholder="Ej. Factura A, remito..."
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-xl bg-gray-50 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Totals Summary Card */}
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-1">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString('es-AR')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Descuento aplicado</span>
                    <span>-${discountAmount.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-200 text-base font-black text-[#101820]">
                  <span>Total a Cobrar</span>
                  <span className="text-xl text-[#101820]">${total.toLocaleString('es-AR')}</span>
                </div>
              </div>

              {/* Submit Sale Button */}
              <button
                type="button"
                onClick={handleConfirmSale}
                disabled={cart.length === 0}
                className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  cart.length > 0
                    ? 'bg-[#35D0BA] hover:bg-[#35D0BA]/90 text-[#101820] hover:scale-[1.01] active:scale-95 shadow-[#35D0BA]/20'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                <CheckCircle size={18} />
                <span>Cobrar y Registrar Venta</span>
              </button>

              <div className="text-[10px] text-gray-400 text-center">
                ✔ Descuenta automáticamente del stock • Encola sincronización a Google Sheets
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History Layout */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por N° de venta, cliente o cajero..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
              />
            </div>

            <button
              onClick={() => storageService.exportTableToCsv('ventas')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors shrink-0"
            >
              <Download size={15} />
              <span>Exportar Ventas CSV</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Operación</th>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Responsable</th>
                    <th className="py-3 px-4">Medio Pago</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-center">Sheets Sync</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSales.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#101820]">
                        {sale.saleNumber}
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(sale.date).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-semibold">
                        {sale.clientName || 'Consumidor Final'}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {sale.employeeName}
                      </td>
                      <td className="py-3 px-4 capitalize text-gray-600">
                        {sale.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-sm text-[#101820]">
                        ${sale.total.toLocaleString('es-AR')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.syncStatus === 'sincronizado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sale.syncStatus === 'pendiente'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sale.syncStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.status === 'completada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sale.status === 'completada' ? 'Completada' : 'Anulada'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setCompletedSale(sale)}
                            title="Ver comprobante"
                            className="p-1.5 text-gray-500 hover:text-[#101820] hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Receipt size={16} />
                          </button>

                          {sale.status === 'completada' && (currentEmp.role === 'propietario' || currentEmp.role === 'administrador') && (
                            <button
                              onClick={() => {
                                setSaleToCancel(sale);
                                setCancelReason('');
                              }}
                              title="Anular venta y reintegrar stock"
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Ban size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sale Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="text-center pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-[#35D0BA]/20 text-[#101820] flex items-center justify-center mx-auto mb-2">
                <Check size={24} className="text-[#101820]" />
              </div>
              <h3 className="text-lg font-black text-[#101820]">Comprobante de Venta</h3>
              <p className="text-xs font-mono font-bold text-gray-500 mt-0.5">
                {completedSale.saleNumber}
              </p>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Fecha:</span>
                <span className="font-semibold text-gray-800">
                  {new Date(completedSale.date).toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Cliente:</span>
                <span className="font-semibold text-gray-800">
                  {completedSale.clientName || 'Consumidor Final'}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Cajero / Operador:</span>
                <span className="font-semibold text-gray-800">
                  {completedSale.employeeName}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Medio de Pago:</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {completedSale.paymentMethod.replace('_', ' ')}
                </span>
              </div>

              {/* Items Table */}
              <div className="pt-2 border-t border-gray-100">
                <div className="font-bold text-gray-700 mb-2">Detalle de Artículos:</div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {completedSale.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="truncate pr-2">
                        {it.quantity}x {it.productName}
                      </span>
                      <span className="font-bold text-gray-800 shrink-0">
                        ${it.subtotal.toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Card */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2 space-y-1">
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Descuento:</span>
                    <span>-${completedSale.discount.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-[#101820]">
                  <span>Total Pagado:</span>
                  <span>${completedSale.total.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold text-xs text-gray-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Printer size={15} />
                <span>Imprimir</span>
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#101820] text-[#35D0BA] font-bold text-xs hover:bg-[#101820]/90 transition-colors shadow-sm"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {saleToCancel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle size={28} />
              <div>
                <h3 className="text-lg font-bold text-[#101820]">
                  ¿Anular Venta {saleToCancel.saleNumber}?
                </h3>
                <p className="text-xs text-gray-500">Monto: ${saleToCancel.total.toLocaleString('es-AR')}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Esta acción reintegrará automáticamente las unidades vendidas al stock de inventario y registrará los movimientos de reversión con su firma digital.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Motivo de la anulación (Obligatorio) *
              </label>
              <input
                type="text"
                required
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Ej. Devolución de cliente / error de tipeo..."
                className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSaleToCancel(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Volver
              </button>
              <button
                onClick={handleExecuteCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-md"
              >
                Confirmar Anulación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
