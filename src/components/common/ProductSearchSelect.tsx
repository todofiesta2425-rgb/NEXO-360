import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Package, Check, ChevronDown, Barcode, Tag } from 'lucide-react';
import { Product } from '../../types';
import { storageService } from '../../services/storageService';

interface ProductSearchSelectProps {
  selectedProductId?: string;
  onSelect: (product: Product) => void;
  priceMode?: 'venta' | 'compra';
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
}

export const ProductSearchSelect: React.FC<ProductSearchSelectProps> = ({
  selectedProductId,
  onSelect,
  priceMode = 'venta',
  placeholder = 'Buscar por nombre, SKU, código de barras o marca...',
  label,
  disabled = false,
  required = false,
  autoFocus = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const products = storageService.getProducts().filter(p => p.status === 'activo');
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products by name, SKU, barcode, brand, or presentation
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products.slice(0, 15);
    const q = query.toLowerCase().trim();
    return products.filter(p => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchBarcode = p.barcode ? p.barcode.toLowerCase().includes(q) : false;
      const matchBrand = p.brand ? p.brand.toLowerCase().includes(q) : false;
      const matchPres = p.presentation ? p.presentation.toLowerCase().includes(q) : false;
      const matchCat = p.category ? p.category.toLowerCase().includes(q) : false;
      return matchName || matchSku || matchBarcode || matchBrand || matchPres || matchCat;
    }).slice(0, 20);
  }, [products, query]);

  const handleSelectProduct = (prod: Product) => {
    onSelect(prod);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % Math.max(1, filteredProducts.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + filteredProducts.length) % Math.max(1, filteredProducts.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts[highlightedIndex]) {
        handleSelectProduct(filteredProducts[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full text-xs" ref={containerRef}>
      {label && (
        <label className="block text-gray-700 font-bold mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Main Trigger Bar */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`w-full px-3 py-2.5 rounded-xl border bg-white flex items-center justify-between gap-2 transition-all cursor-pointer ${
          isOpen ? 'ring-2 ring-[#35D0BA] border-[#35D0BA]' : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Package size={16} className={selectedProduct ? 'text-[#35D0BA]' : 'text-gray-400'} />
          {selectedProduct ? (
            <div className="truncate flex items-center gap-2">
              <span className="font-bold text-gray-900 truncate">
                {selectedProduct.name}
              </span>
              <span className="font-mono text-[10px] text-gray-400 font-semibold bg-gray-100 px-1.5 py-0.5 rounded">
                {selectedProduct.sku}
              </span>
              {selectedProduct.presentation && (
                <span className="text-[10px] text-gray-500">
                  ({selectedProduct.presentation})
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedProduct && (
            <span className="font-black text-xs text-[#101820]">
              ${(priceMode === 'compra' ? selectedProduct.unitCost : selectedProduct.salePrice).toLocaleString('es-AR')}
            </span>
          )}
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>

      {/* Floating Dropdown Panel with Search Input */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 max-h-80 flex flex-col">
          {/* Search box inside dropdown */}
          <div className="px-3 pb-2 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                autoFocus={autoFocus}
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Escribí código, nombre o marca..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#35D0BA] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50 py-1 scrollbar-thin">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-xs">
                No se encontraron productos que coincidan con «{query}».
              </div>
            ) : (
              filteredProducts.map((prod, index) => {
                const isSelected = selectedProduct?.id === prod.id;
                const isHighlighted = highlightedIndex === index;
                const relevantPrice = priceMode === 'compra' ? prod.unitCost : prod.salePrice;

                return (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isHighlighted ? 'bg-gray-50' : ''
                    } ${isSelected ? 'bg-[#35D0BA]/10 font-bold' : ''}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 truncate">
                          {prod.name}
                        </span>
                        {prod.brand && (
                          <span className="text-[10px] text-gray-500 font-semibold">
                            • {prod.brand}
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{prod.sku}</span>
                        {prod.barcode && (
                          <span className="flex items-center gap-0.5 font-mono text-gray-400">
                            <Barcode size={10} /> {prod.barcode}
                          </span>
                        )}
                        <span>• Stock: {prod.stock} {prod.unit}s</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-xs text-[#101820]">
                        ${relevantPrice.toLocaleString('es-AR')}
                      </div>
                      <div className="text-[10px] text-gray-400 capitalize">
                        {priceMode === 'compra' ? 'Costo unit.' : 'P. venta'}
                      </div>
                    </div>

                    {isSelected && (
                      <Check size={14} className="text-[#35D0BA] shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
