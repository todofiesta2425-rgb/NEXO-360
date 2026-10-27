import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Plus, 
  Shield, 
  Lock, 
  Mail, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert,
  Edit3,
  Trash2,
  Power,
  Sliders,
  Check,
  X,
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';
import { Employee, UserRole, RoleDefinition, RolePermissionSet } from '../types';
import { storageService } from '../services/storageService';

export const EmployeesPage: React.FC = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'colaboradores' | 'roles'>('colaboradores');
  const [searchTerm, setSearchTerm] = useState('');

  // Storage data
  const [employees, setEmployees] = useState<Employee[]>(storageService.getEmployees());
  const [roles, setRoles] = useState<RoleDefinition[]>(storageService.getRoles());
  const [currentEmp, setCurrentEmp] = useState<Employee>(storageService.getCurrentEmployee());

  // Notifications
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Employee Modal state (Add / Edit)
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empRole, setEmpRole] = useState<UserRole>('empleado');
  const [empActive, setEmpActive] = useState(true);
  const [empAvatarColor, setEmpAvatarColor] = useState('#101820');

  // Role Modal state (Add / Edit)
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [roleBadgeBg, setRoleBadgeBg] = useState('bg-indigo-100 text-indigo-900 border border-indigo-200');
  const [rolePermissions, setRolePermissions] = useState<RolePermissionSet>({
    canPos: true,
    canReposition: false,
    canEditProducts: false,
    canAdjustStock: true,
    canViewMargins: false,
    canManageExpenses: true,
    canConfigureIntegrations: false,
    canManageEmployees: false
  });

  // Delete Confirmation Modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'employee' | 'role';
    id: string;
    name: string;
  } | null>(null);

  // Subscribe to storage changes
  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setEmployees(storageService.getEmployees());
      setRoles(storageService.getRoles());
      setCurrentEmp(storageService.getCurrentEmployee());
    });
    return unsub;
  }, []);

  const isOwner = currentEmp.role === 'propietario';
  const canManage = isOwner || currentEmp.role === 'administrador';

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Helper to get role badge info
  const getRoleDetails = (roleId: string) => {
    const found = roles.find(r => r.id === roleId);
    if (found) {
      return {
        label: found.name,
        desc: found.description,
        bg: found.badgeBg || 'bg-gray-100 text-gray-800 border border-gray-300'
      };
    }
    return {
      label: roleId,
      desc: 'Rol operativo personalizado',
      bg: 'bg-gray-100 text-gray-800 border border-gray-300'
    };
  };

  // -------------------------------------------------------------
  // Employee Handlers
  // -------------------------------------------------------------
  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setEmpName('');
    setEmpEmail('');
    setEmpRole('empleado');
    setEmpActive(true);
    const colors = ['#101820', '#35D0BA', '#F5A623', '#2563EB', '#7C3AED', '#DB2777', '#059669'];
    setEmpAvatarColor(colors[Math.floor(Math.random() * colors.length)]);
    setEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpName(emp.name);
    setEmpEmail(emp.email);
    setEmpRole(emp.role);
    setEmpActive(emp.active);
    setEmpAvatarColor(emp.avatarColor || '#101820');
    setEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) {
      showToast('El nombre del colaborador es obligatorio.', 'error');
      return;
    }
    if (!empEmail.trim()) {
      showToast('El correo electrónico es obligatorio.', 'error');
      return;
    }

    if (editingEmployee) {
      // Prevent removing the last owner
      if (editingEmployee.role === 'propietario' && empRole !== 'propietario') {
        const ownerCount = employees.filter(e => e.role === 'propietario').length;
        if (ownerCount <= 1) {
          showToast('No se puede cambiar el rol del único Propietario existente.', 'error');
          return;
        }
      }

      const updated: Employee = {
        ...editingEmployee,
        name: empName.trim(),
        email: empEmail.trim(),
        role: empRole,
        active: empActive,
        avatarColor: empAvatarColor
      };
      storageService.saveEmployee(updated);
      showToast(`Colaborador ${updated.name} actualizado con éxito.`);
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        name: empName.trim(),
        email: empEmail.trim(),
        role: empRole,
        active: empActive,
        avatarColor: empAvatarColor,
        lastActive: 'Recién creado'
      };
      storageService.saveEmployee(newEmp);
      showToast(`Nuevo colaborador ${newEmp.name} creado con éxito.`);
    }

    setEmployeeModalOpen(false);
  };

  // Instant role change right from the card
  const handleDirectRoleChange = (emp: Employee, newRole: UserRole) => {
    if (!canManage) {
      showToast('No tenés permisos para cambiar roles.', 'error');
      return;
    }

    if (emp.role === 'propietario' && newRole !== 'propietario') {
      const ownerCount = employees.filter(e => e.role === 'propietario').length;
      if (ownerCount <= 1) {
        showToast('El sistema debe conservar al menos un Propietario con acceso total.', 'error');
        return;
      }
    }

    storageService.saveEmployee({
      ...emp,
      role: newRole
    });

    const targetRoleName = roles.find(r => r.id === newRole)?.name || newRole;
    showToast(`Rol de ${emp.name} cambiado a "${targetRoleName}".`);
  };

  const handleToggleEmployeeActive = (emp: Employee) => {
    if (!canManage) {
      showToast('Solo administradores o propietarios pueden cambiar el estado.', 'error');
      return;
    }
    if (emp.id === currentEmp.id) {
      showToast('No podés suspender tu propia sesión activa.', 'error');
      return;
    }

    storageService.saveEmployee({
      ...emp,
      active: !emp.active
    });
    showToast(`Acceso de ${emp.name} ${emp.active ? 'suspendido' : 'reactivado'}.`);
  };

  const handleDeleteEmployeeConfirm = () => {
    if (!deleteConfirmation || deleteConfirmation.type !== 'employee') return;
    const res = storageService.deleteEmployee(deleteConfirmation.id);
    if (res.success) {
      showToast(`Colaborador ${deleteConfirmation.name} eliminado.`);
      setDeleteConfirmation(null);
    } else {
      showToast(res.message || 'Error al eliminar colaborador.', 'error');
    }
  };

  // -------------------------------------------------------------
  // Role Handlers (Add, Modify, Delete Roles)
  // -------------------------------------------------------------
  const handleOpenAddRole = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
    setRoleBadgeBg('bg-indigo-100 text-indigo-900 border border-indigo-200');
    setRolePermissions({
      canPos: true,
      canReposition: false,
      canEditProducts: false,
      canAdjustStock: true,
      canViewMargins: false,
      canManageExpenses: true,
      canConfigureIntegrations: false,
      canManageEmployees: false
    });
    setRoleModalOpen(true);
  };

  const handleOpenEditRole = (roleDef: RoleDefinition) => {
    setEditingRole(roleDef);
    setRoleName(roleDef.name);
    setRoleDescription(roleDef.description);
    setRoleBadgeBg(roleDef.badgeBg);
    setRolePermissions({ ...roleDef.permissions });
    setRoleModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      showToast('El nombre del rol es obligatorio.', 'error');
      return;
    }

    if (editingRole) {
      const updated: RoleDefinition = {
        ...editingRole,
        name: roleName.trim(),
        label: roleName.trim(),
        description: roleDescription.trim(),
        badgeBg: roleBadgeBg,
        permissions: rolePermissions
      };
      storageService.saveRole(updated);
      showToast(`Rol "${updated.name}" actualizado.`);
    } else {
      const slugId = roleName
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_') + `_${Date.now().toString().slice(-4)}`;

      const newRole: RoleDefinition = {
        id: slugId,
        name: roleName.trim(),
        label: roleName.trim(),
        description: roleDescription.trim() || 'Rol operativo personalizado',
        badgeBg: roleBadgeBg,
        isSystem: false,
        permissions: rolePermissions
      };
      storageService.saveRole(newRole);
      showToast(`Nuevo rol "${newRole.name}" creado con éxito.`);
    }

    setRoleModalOpen(false);
  };

  const handleDeleteRoleConfirm = () => {
    if (!deleteConfirmation || deleteConfirmation.type !== 'role') return;
    const res = storageService.deleteRole(deleteConfirmation.id);
    if (res.success) {
      showToast(`Rol "${deleteConfirmation.name}" eliminado.`);
      setDeleteConfirmation(null);
    } else {
      showToast(res.message || 'Error al eliminar rol.', 'error');
    }
  };

  // Color options for role badges
  const BADGE_COLOR_PRESETS = [
    { label: 'Índigo', bg: 'bg-indigo-100 text-indigo-900 border border-indigo-200' },
    { label: 'Esmeralda', bg: 'bg-emerald-100 text-emerald-900 border border-emerald-200' },
    { label: 'Ámbar', bg: 'bg-amber-100 text-amber-900 border border-amber-200' },
    { label: 'Turquesa', bg: 'bg-[#35D0BA]/20 text-[#101820] border border-[#35D0BA]/40' },
    { label: 'Púrpura', bg: 'bg-purple-100 text-purple-900 border border-purple-200' },
    { label: 'Rosa', bg: 'bg-rose-100 text-rose-900 border border-rose-200' },
    { label: 'Azul Noche', bg: 'bg-[#101820] text-[#35D0BA] border border-[#35D0BA]/30' },
    { label: 'Gris Neutro', bg: 'bg-gray-200 text-gray-800 border border-gray-300' }
  ];

  const filteredEmployees = employees.filter(emp => {
    const q = searchTerm.toLowerCase();
    const roleDet = getRoleDetails(emp.role);
    return emp.name.toLowerCase().includes(q) || 
           emp.email.toLowerCase().includes(q) ||
           roleDet.label.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold transition-all animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'success' 
            ? 'bg-[#101820] text-[#35D0BA] border border-[#35D0BA]/40' 
            : 'bg-rose-900 text-white border border-rose-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#101820]">
            Equipo, Usuarios y Roles de Acceso
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gestión completa de colaboradores, asignación y cambio inmediato de roles operativos, y configuración de permisos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <>
              {activeTab === 'colaboradores' ? (
                <button
                  onClick={handleOpenAddEmployee}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#101820] text-[#35D0BA] font-bold text-xs hover:bg-[#101820]/90 transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  <span>Agregar Colaborador</span>
                </button>
              ) : (
                <button
                  onClick={handleOpenAddRole}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#101820] text-[#35D0BA] font-bold text-xs hover:bg-[#101820]/90 transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  <span>Crear Nuevo Rol</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200/80 pb-2">
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('colaboradores')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'colaboradores'
                ? 'bg-[#101820] text-[#35D0BA] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User size={15} />
            <span>Colaboradores ({employees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'roles'
                ? 'bg-[#101820] text-[#35D0BA] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield size={15} />
            <span>Roles y Permisos ({roles.length})</span>
          </button>
        </div>

        {activeTab === 'colaboradores' && (
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Buscar por nombre, correo o rol..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* TAB 1: COLABORADORES */}
      {activeTab === 'colaboradores' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployees.map(emp => {
              const roleInfo = getRoleDetails(emp.role);
              const isCurrent = emp.id === currentEmp.id;

              return (
                <div
                  key={emp.id}
                  className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                    isCurrent 
                      ? 'border-[#35D0BA] ring-2 ring-[#35D0BA]/30 shadow-md' 
                      : 'border-gray-200/80 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Header Card: Avatar and Active Status */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-xs"
                        style={{ backgroundColor: emp.avatarColor || '#101820' }}
                      >
                        {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isCurrent ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#35D0BA] text-[#101820]">
                            Sesión Actual
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            emp.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {emp.active ? 'Activo' : 'Suspendido'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">
                      {emp.name}
                    </h3>
                    <div className="text-xs text-gray-400 truncate mt-0.5 font-mono">
                      {emp.email}
                    </div>

                    {/* Rol Operativo Asignado */}
                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Rol Operativo Asignado
                        </label>
                        {canManage && (
                          <span className="text-[9px] text-[#F5A623] font-bold">
                            Modificable
                          </span>
                        )}
                      </div>

                      {/* Dropdown to change role directly */}
                      {canManage ? (
                        <div className="relative">
                          <select
                            value={emp.role}
                            onChange={e => handleDirectRoleChange(emp, e.target.value as UserRole)}
                            className="w-full appearance-none pl-3 pr-8 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden cursor-pointer transition-colors"
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>
                                {r.name} {r.isSystem ? '' : '(Personalizado)'}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      ) : (
                        <div className={`px-2.5 py-1 rounded-xl text-xs font-bold inline-block ${roleInfo.bg}`}>
                          {roleInfo.label}
                        </div>
                      )}

                      <p className="text-[11px] text-gray-500 leading-snug">
                        {roleInfo.desc}
                      </p>
                    </div>
                  </div>

                  {/* Actions footer */}
                  {canManage && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditEmployee(emp)}
                          title="Editar colaborador"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#101820] hover:bg-gray-100 transition-colors"
                        >
                          <Edit3 size={15} />
                        </button>

                        {!isCurrent && (
                          <button
                            onClick={() => handleToggleEmployeeActive(emp)}
                            title={emp.active ? 'Suspender acceso' : 'Reactivar acceso'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              emp.active ? 'text-gray-500 hover:text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Power size={15} />
                          </button>
                        )}
                      </div>

                      {!isCurrent && (
                        <button
                          onClick={() => setDeleteConfirmation({
                            type: 'employee',
                            id: emp.id,
                            name: emp.name
                          })}
                          title="Eliminar colaborador"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
              <User size={36} className="mx-auto text-gray-300 mb-2" />
              <h3 className="font-bold text-gray-700">No se encontraron colaboradores</h3>
              <p className="text-xs text-gray-400 mt-1">Probá con otro término de búsqueda.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROLES Y PERMISOS */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Header Explanation */}
          <div className="bg-amber-50/70 border border-amber-300 rounded-3xl p-5 text-xs text-amber-950 flex flex-col sm:flex-row items-start gap-3">
            <ShieldAlert size={22} className="text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Administración de Roles y Privilegios (RBAC)</div>
              <p className="text-amber-900 leading-relaxed">
                Podés crear nuevos roles operativos a medida de tu negocio (ej. "Encargado de Depósito", "Cajero Nocturno"), modificar los privilegios de cada rol y asignar o cambiar el rol de cualquier colaborador inmediatamente.
              </p>
            </div>
          </div>

          {/* Roles Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map(r => {
              const assignedCount = employees.filter(e => e.role === r.id).length;

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${r.badgeBg}`}>
                        {r.name}
                      </span>
                      {r.isSystem ? (
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Sistema Base
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                          Personalizado
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mt-2 min-h-[36px]">
                      {r.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-[11px] font-bold text-gray-700 mb-1">
                        Colaboradores con este rol: <span className="text-[#101820] font-black">{assignedCount}</span>
                      </div>
                      
                      {/* Active permissions summary */}
                      <div className="space-y-1 mt-2 text-[10px] text-gray-500">
                        <div className="flex items-center gap-1.5">
                          {r.permissions.canPos ? <Check size={12} className="text-emerald-600" /> : <X size={12} className="text-gray-300" />}
                          <span className={r.permissions.canPos ? 'font-medium text-gray-700' : 'text-gray-400'}>Cobro POS y Ventas</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {r.permissions.canEditProducts ? <Check size={12} className="text-emerald-600" /> : <X size={12} className="text-gray-300" />}
                          <span className={r.permissions.canEditProducts ? 'font-medium text-gray-700' : 'text-gray-400'}>Editar Precios / Catálogo</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {r.permissions.canAdjustStock ? <Check size={12} className="text-emerald-600" /> : <X size={12} className="text-gray-300" />}
                          <span className={r.permissions.canAdjustStock ? 'font-medium text-gray-700' : 'text-gray-400'}>Entradas de Inventario / Kardex</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {r.permissions.canViewMargins ? <Check size={12} className="text-emerald-600" /> : <X size={12} className="text-gray-300" />}
                          <span className={r.permissions.canViewMargins ? 'font-medium text-gray-700' : 'text-gray-400'}>Costos y Márgenes</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => handleOpenEditRole(r)}
                        className="text-xs font-bold text-[#101820] hover:text-[#35D0BA] flex items-center gap-1 transition-colors"
                      >
                        <Sliders size={13} />
                        <span>Modificar Rol</span>
                      </button>

                      {!r.isSystem && (
                        <button
                          onClick={() => setDeleteConfirmation({
                            type: 'role',
                            id: r.id,
                            name: r.name
                          })}
                          title="Eliminar rol"
                          className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Matriz Dinámica de Privilegios Operativos */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
            <h3 className="text-base font-bold text-[#101820] mb-2">
              Matriz Comparativa de Privilegios por Rol
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Comprobación estricta de permisos según la política operativa activa en NEXO 360.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] border-b border-gray-200">
                    <th className="py-3 px-4">Capacidad / Acción</th>
                    {roles.map(r => (
                      <th key={r.id} className="py-3 px-4 text-center whitespace-nowrap">
                        {r.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { key: 'canPos', label: 'Cobrar y registrar ventas en POS' },
                    { key: 'canReposition', label: 'Anular ventas y reponer mercadería' },
                    { key: 'canEditProducts', label: 'Alta y edición de precios y productos' },
                    { key: 'canAdjustStock', label: 'Cargar entradas y ajustes de inventario' },
                    { key: 'canViewMargins', label: 'Ver costos y márgenes de ganancia' },
                    { key: 'canManageExpenses', label: 'Cargar gastos operativos de caja' },
                    { key: 'canConfigureIntegrations', label: 'Configurar Google Sheets y Firebase' },
                    { key: 'canManageEmployees', label: 'Administrar colaboradores y roles' }
                  ].map(cap => (
                    <tr key={cap.key} className="hover:bg-gray-50/70">
                      <td className="py-2.5 px-4 font-medium text-gray-800">{cap.label}</td>
                      {roles.map(r => {
                        const allowed = (r.permissions as any)[cap.key];
                        return (
                          <td key={r.id} className="py-2.5 px-4 text-center font-bold">
                            {allowed ? (
                              <span className="text-emerald-600 font-black">✔</span>
                            ) : (
                              <span className="text-gray-300 font-normal">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT EMPLOYEE */}
      {employeeModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#101820]">
                {editingEmployee ? 'Modificar Colaborador' : 'Registrar Nuevo Colaborador'}
              </h3>
              <button
                onClick={() => setEmployeeModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={empName}
                  onChange={e => setEmpName(e.target.value)}
                  placeholder="Ej. Valeria Romero"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={empEmail}
                  onChange={e => setEmpEmail(e.target.value)}
                  placeholder="valeria.r@nexo360.com"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-gray-700 font-bold">Rol Operativo Asignado *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmployeeModalOpen(false);
                      handleOpenAddRole();
                    }}
                    className="text-[11px] text-[#F5A623] hover:underline font-bold"
                  >
                    + Crear otro rol
                  </button>
                </div>
                <select
                  value={empRole}
                  onChange={e => setEmpRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 border rounded-xl bg-white font-semibold text-gray-800 focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.description.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-gray-700 font-bold mb-1.5">Color del Avatar</label>
                <div className="flex items-center gap-2">
                  {['#101820', '#35D0BA', '#F5A623', '#2563EB', '#7C3AED', '#DB2777', '#059669', '#DC2626'].map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setEmpAvatarColor(col)}
                      className={`w-7 h-7 rounded-xl transition-all ${
                        empAvatarColor === col ? 'ring-2 ring-offset-2 ring-[#101820] scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Status active toggle */}
              {editingEmployee && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-700">Estado de Acceso:</span>
                  <button
                    type="button"
                    onClick={() => setEmpActive(!empActive)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      empActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {empActive ? 'Activo' : 'Suspendido'}
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEmployeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#101820] text-[#35D0BA] font-bold shadow-md hover:bg-[#101820]/90 transition-colors"
                >
                  {editingEmployee ? 'Guardar Cambios' : 'Crear Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT ROLE */}
      {roleModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#101820]">
                {editingRole ? `Modificar Rol: ${editingRole.name}` : 'Crear Nuevo Rol Operativo'}
              </h3>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Nombre del Rol *</label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                  placeholder="Ej. Encargado de Depósito / Supervisor"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Descripción Operativa *</label>
                <textarea
                  required
                  rows={2}
                  value={roleDescription}
                  onChange={e => setRoleDescription(e.target.value)}
                  placeholder="Responsabilidades y alcance en el negocio..."
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-[#35D0BA] focus:outline-hidden"
                />
              </div>

              {/* Badge Color Preset */}
              <div>
                <label className="block text-gray-700 font-bold mb-1.5">Color de la Insignia</label>
                <div className="grid grid-cols-4 gap-2">
                  {BADGE_COLOR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRoleBadgeBg(preset.bg)}
                      className={`px-2 py-1.5 rounded-xl text-[10px] font-bold text-center border transition-all ${preset.bg} ${
                        roleBadgeBg === preset.bg ? 'ring-2 ring-black scale-102 shadow-xs' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions Checklist */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Permisos y Capacidades Habilitadas:
                </label>
                <div className="space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                  {[
                    { key: 'canPos', label: 'Cobrar y registrar ventas en terminal POS' },
                    { key: 'canReposition', label: 'Anular ventas y reponer stock' },
                    { key: 'canEditProducts', label: 'Alta y edición de precios y catálogo' },
                    { key: 'canAdjustStock', label: 'Cargar entradas y recepciones de inventario' },
                    { key: 'canViewMargins', label: 'Visualizar costos y márgenes de ganancia' },
                    { key: 'canManageExpenses', label: 'Cargar y gestionar gastos de caja' },
                    { key: 'canConfigureIntegrations', label: 'Configurar Google Sheets y Firebase' },
                    { key: 'canManageEmployees', label: 'Administrar colaboradores y cambiar roles' }
                  ].map(p => {
                    const isChecked = (rolePermissions as any)[p.key];
                    return (
                      <label
                        key={p.key}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-100 hover:border-gray-300 cursor-pointer transition-colors"
                      >
                        <span className="text-gray-800 font-medium">{p.label}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => setRolePermissions(prev => ({
                            ...prev,
                            [p.key]: e.target.checked
                          }))}
                          className="w-4 h-4 rounded text-[#101820] focus:ring-[#35D0BA]"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#101820] text-[#35D0BA] font-bold shadow-md hover:bg-[#101820]/90 transition-colors"
                >
                  {editingRole ? 'Guardar Cambios del Rol' : 'Crear Rol Operativo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle size={26} />
              <h3 className="text-base font-bold text-gray-900">
                ¿Eliminar {deleteConfirmation.type === 'employee' ? 'colaborador' : 'rol'}?
              </h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              ¿Estás seguro de que deseas eliminar permanentemente a <strong>{deleteConfirmation.name}</strong>? Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={deleteConfirmation.type === 'employee' ? handleDeleteEmployeeConfirm : handleDeleteRoleConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
