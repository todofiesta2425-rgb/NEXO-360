import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  ShoppingBag,
  DollarSign,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { Client } from '../types';
import { storageService } from '../services/storageService';

export const ClientsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const clients = storageService.getClients();
  const sales = storageService.getSales();
  const currentEmp = storageService.getCurrentEmployee();
  const canEdit = currentEmp.role === 'propietario' || currentEmp.role === 'administrador';

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      return (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.taxId && c.taxId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [clients, searchTerm]);

  const handleOpenCreate = () => {
    setEditingClient({
      id: `cli-${Date.now()}`,
      name: '',
      taxId: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      createdAt: new Date().toISOString(),
      totalPurchases: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Client) => {
    setEditingClient({ ...c });
    setIsModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    if (!editingClient.name.trim()) {
      alert('El nombre o razón social es obligatorio.');
      return;
    }
    if (!editingClient.phone.trim()) {
      alert('El teléfono es obligatorio.');
      return;
    }

    storageService.saveClient(editingClient);
    setIsModalOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#101820]">
            Cartera de Clientes
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gestión de cuentas corrientes, historial de compras y contactos comerciales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => storageService.exportTableToCsv('clientes')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
          >
            <Download size={15} />
            <span>Exportar Clientes CSV</span>
          </button>

          {canEdit && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101820] text-[#35D0BA] font-bold text-xs hover:bg-[#101820]/90 transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Nuevo Cliente</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, CUIT/DNI, teléfono o email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => {
          const clientSalesCount = sales.filter(s => s.clientId === client.id && s.status === 'completada').length;

          return (
            <div
              key={client.id}
              className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 leading-snug">
                      {client.name}
                    </h3>
                    {client.taxId && (
                      <span className="text-[11px] font-mono text-gray-400">
                        CUIT: {client.taxId}
                      </span>
                    )}
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => handleOpenEdit(client)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit3 size={15} />
                    </button>
                  )}
                </div>

                <div className="my-3 space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-[#35D0BA] shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 truncate">
                      <MapPin size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>

                {client.notes && (
                  <div className="bg-gray-50 p-2.5 rounded-xl text-[11px] text-gray-500 italic mb-3">
                    «{client.notes}»
                  </div>
                )}
              </div>

              {/* Purchase stats */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Total Compras</span>
                  <span className="font-black text-sm text-[#101820]">
                    ${client.totalPurchases.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-[10px]">Operaciones</span>
                  <span className="font-bold text-gray-700">
                    {clientSalesCount} tickets
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client Modal Form */}
      {isModalOpen && editingClient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#101820]">
                {editingClient.id.startsWith('cli-') && !clients.some(c => c.id === editingClient.id)
                  ? 'Nuevo Cliente'
                  : `Editar: ${editingClient.name}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Nombre o Razón Social *</label>
                <input
                  type="text"
                  required
                  value={editingClient.name}
                  onChange={e => setEditingClient({ ...editingClient, name: e.target.value })}
                  placeholder="Ej. Distribuidora Santa Fe S.R.L."
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">CUIT / DNI / RUT</label>
                  <input
                    type="text"
                    value={editingClient.taxId || ''}
                    onChange={e => setEditingClient({ ...editingClient, taxId: e.target.value })}
                    placeholder="30-71999999-9"
                    className="w-full px-3 py-2 border rounded-xl font-mono focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Teléfono Móvil / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={editingClient.phone}
                    onChange={e => setEditingClient({ ...editingClient, phone: e.target.value })}
                    placeholder="+54 11 5590-1122"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editingClient.email || ''}
                    onChange={e => setEditingClient({ ...editingClient, email: e.target.value })}
                    placeholder="contacto@empresa.com"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Dirección de Entrega</label>
                  <input
                    type="text"
                    value={editingClient.address || ''}
                    onChange={e => setEditingClient({ ...editingClient, address: e.target.value })}
                    placeholder="Av. Rivadavia 1200"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Observaciones / Condiciones Comerciales</label>
                <textarea
                  rows={2}
                  value={editingClient.notes || ''}
                  onChange={e => setEditingClient({ ...editingClient, notes: e.target.value })}
                  placeholder="Condiciones de pago, horarios de recepción de mercadería..."
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                />
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
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
