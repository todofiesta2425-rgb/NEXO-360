import React, { useState, useMemo } from 'react';
import { 
  Store, 
  Search, 
  Package, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  PhoneCall,
  Clock,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Product } from '../types';
import { NexoLogo } from '../components/common/NexoLogo';

export const CatalogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [selectedForInquiry, setSelectedForInquiry] = useState<Product[]>([]);

  const products = storageService.getProducts();
  const config = storageService.getConfig();

  // Active products only (never show inactive items or internal costs)
  const publicProducts = useMemo(() => {
    return products.filter(p => p.status === 'activo');
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    publicProducts.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [publicProducts]);

  const filteredProducts = useMemo(() => {
    return publicProducts.filter(p => {
      const matchSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'todas' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [publicProducts, searchTerm, selectedCategory]);

  const handleToggleInquiry = (product: Product) => {
    setSelectedForInquiry(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleSendWhatsAppOrder = () => {
    if (selectedForInquiry.length === 0) {
      alert('Seleccioná al menos un producto para consultar por WhatsApp.');
      return;
    }

    const itemsText = selectedForInquiry
      .map(p => `• ${p.name} ($${p.salePrice.toLocaleString('es-AR')})`)
      .join('\n');

    const totalEstimate = selectedForInquiry.reduce((sum, p) => sum + p.salePrice, 0);

    const message = `Hola ${config.name}! Quisiera consultar disponibilidad para comprar:\n\n${itemsText}\n\nTotal estimado: $${totalEstimate.toLocaleString('es-AR')}\n¿Tienen stock y entrega disponible?`;

    const encoded = encodeURIComponent(message);
    const cleanPhone = config.phone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone || '5491148209900'}?text=${encoded}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Public Catalog Hero Header */}
      <div className="bg-[#101820] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#35D0BA]/20 text-[#35D0BA] text-xs font-bold uppercase tracking-wider">
              <Store size={14} />
              <span>Catálogo Comercial Digital</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {config.name}
            </h1>
            <p className="text-sm text-gray-300 max-w-xl">
              Consultá nuestra disponibilidad de productos y realizá tu pedido directamente por WhatsApp.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 pt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[#F5A623]" /> {config.address}
              </span>
              <span className="flex items-center gap-1.5">
                <PhoneCall size={14} className="text-[#35D0BA]" /> {config.phone}
              </span>
            </div>
          </div>

          {/* WhatsApp Floating Inquiry Quick Action */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0 text-center space-y-2">
            <div className="text-xs text-gray-300 font-medium">
              Artículos seleccionados: <strong className="text-white">{selectedForInquiry.length}</strong>
            </div>
            <button
              onClick={handleSendWhatsAppOrder}
              disabled={selectedForInquiry.length === 0}
              className={`w-full px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                selectedForInquiry.length > 0
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg active:scale-95'
                  : 'bg-white/10 text-gray-400 cursor-not-allowed'
              }`}
            >
              <MessageCircle size={16} />
              <span>Consultar Pedido por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'todas'
                ? 'bg-[#101820] text-[#35D0BA]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas ({publicProducts.length})
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c
                  ? 'bg-[#101820] text-[#35D0BA]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(p => {
          const isSelected = selectedForInquiry.some(i => i.id === p.id);
          const hasStock = p.stock > 0;

          return (
            <div
              key={p.id}
              className={`bg-white rounded-3xl p-4 border transition-all flex flex-col justify-between ${
                isSelected 
                  ? 'border-[#35D0BA] ring-2 ring-[#35D0BA]/30 shadow-md' 
                  : 'border-gray-200/80 shadow-2xs hover:shadow-md'
              }`}
            >
              <div>
                {/* Product Image */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-gray-100 mb-3 border border-gray-100">
                  {p.imageUrl ? (
                    <img 
                      src={p.imageUrl} 
                      alt={p.name} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={36} />
                    </div>
                  )}

                  <span className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    hasStock 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-rose-600 text-white'
                  }`}>
                    {hasStock ? 'En Stock' : 'Sin Stock'}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  {p.category}
                </div>
                <h3 className="font-bold text-sm text-gray-900 leading-snug">
                  {p.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {p.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-base font-black text-[#101820]">
                    ${p.salePrice.toLocaleString('es-AR')}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    por {p.unit}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleInquiry(p)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#101820] text-[#35D0BA]'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 size={14} className="text-[#35D0BA]" />
                      <span>Agregado</span>
                    </>
                  ) : (
                    <span>+ Agregar</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Security Notice */}
      <div className="text-center py-6 text-xs text-gray-400 flex items-center justify-center gap-2">
        <ShieldCheck size={16} className="text-emerald-500" />
        <span>Catálogo público seguro generado por NEXO 360. Los datos de clientes y costos están protegidos.</span>
      </div>
    </div>
  );
};
