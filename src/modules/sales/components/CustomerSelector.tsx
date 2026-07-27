import React, { useState } from 'react';
import { User, UserPlus, Check, Search, X } from 'lucide-react';
import { Customer, CreateCustomerInput } from '../types';

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
  onCreateCustomer: (input: CreateCustomerInput) => Promise<Customer>;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customers,
  selectedCustomer,
  isOpen,
  onClose,
  onSelectCustomer,
  onCreateCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm))
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('សូមបញ្ចូលឈ្មោះអតិថិជន (Customer name is required)');
      return;
    }

    try {
      setSubmitting(true);
      await onCreateCustomer({
        name: name.trim(),
        phone: phone.trim() || undefined,
        type: 'individual',
      });
      setName('');
      setPhone('');
      setIsAddingNew(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="customer-selector-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div id="customer-modal-card" className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
        <div id="customer-modal-header" className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-800 text-base">ជ្រើសរើសអតិថិជន (Select Customer)</h3>
          </div>
          <button
            id="close-customer-modal"
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div id="customer-modal-body" className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {!isAddingNew ? (
            <>
              <div id="customer-search-row" className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="customer-search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ស្វែងរកតាមឈ្មោះ ឬ លេខទូរស័ព្ទ..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <button
                  id="add-customer-btn"
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  ថែមអតិថិជន
                </button>
              </div>

              <div id="customer-list" className="space-y-1">
                {filtered.map((customer) => {
                  const isSelected = selectedCustomer.id === customer.id;
                  return (
                    <button
                      key={customer.id}
                      id={`customer-item-${customer.id}`}
                      type="button"
                      onClick={() => {
                        onSelectCustomer(customer);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 font-medium'
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className="text-sm text-slate-800 block">{customer.name}</span>
                        {customer.phone && (
                          <span className="text-xs text-slate-400 block">{customer.phone}</span>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <form id="new-customer-form" onSubmit={handleCreate} className="space-y-3">
              {error && (
                <div id="new-customer-error" className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  ឈ្មោះអតិថិជន <span className="text-rose-500">*</span>
                </label>
                <input
                  id="new-customer-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ឧ. សុខ ចាន់"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  លេខទូរស័ព្ទ (Phone Number)
                </label>
                <input
                  id="new-customer-phone-input"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ឧ. 012 345 678"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div id="new-customer-actions" className="flex items-center justify-end gap-2 pt-2">
                <button
                  id="cancel-new-customer"
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  id="save-new-customer"
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                >
                  {submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក (Save)'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
