import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Tag, Hash, Barcode, AlertTriangle, Layers } from 'lucide-react';
import { InventoryProduct, CreateInventoryProductInput } from '../../inventory/products/types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInventoryProductInput) => Promise<boolean>;
  initialData?: InventoryProduct | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('ទំនិញទូទៅ');
  const [unit, setUnit] = useState('កញ្ចប់');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRandomSku = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `SKU-${randomNum}`;
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSku(initialData.sku || generateRandomSku());
      setBarcode(initialData.barcode || '');
      setCategory(initialData.category || 'ទំនិញទូទៅ');
      setUnit(initialData.unit || 'កញ្ចប់');
      setCostPrice(initialData.cost_price ? String(initialData.cost_price) : '0');
      setSellingPrice(initialData.selling_price ? String(initialData.selling_price) : '0');
      setCurrentStock(initialData.current_stock ? String(initialData.current_stock) : '0');
      setMinStockAlert(initialData.min_stock_alert ? String(initialData.min_stock_alert) : '5');
      setDescription(initialData.description || '');
    } else {
      setName('');
      setSku(generateRandomSku());
      setBarcode('');
      setCategory('ទំនិញទូទៅ');
      setUnit('កញ្ចប់');
      setCostPrice('');
      setSellingPrice('');
      setCurrentStock('');
      setMinStockAlert('5');
      setDescription('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('សូមបញ្ចូលឈ្មោះទំនិញ');
      return;
    }

    const cPrice = Number(costPrice) || 0;
    const sPrice = Number(sellingPrice) || 0;
    const stock = Number(currentStock) || 0;
    const minAlert = Number(minStockAlert) || 5;

    if (sPrice < 0 || cPrice < 0) {
      setError('តម្លៃមិនអាចអវិជ្ជមានបានទេ');
      return;
    }

    setSubmitting(true);
    setError(null);

    const success = await onSubmit({
      name: name.trim(),
      unit: unit.trim() || 'កញ្ចប់',
      cost_price: cPrice,
      selling_price: sPrice,
      current_stock: stock,
      description: description.trim(),
      sku: sku.trim(),
      barcode: barcode.trim(),
      category: category.trim(),
      min_stock_alert: minAlert,
    });

    setSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? 'កែប្រែព័ត៌មានទំនិញ' : 'បន្ថែមទំនិញថ្មី'}
              </h3>
              <p className="text-[11px] text-slate-400">ព័ត៌មានលម្អិតកាតាឡុកទំនិញ និងស្តុក</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ឈ្មោះទំនិញ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ឧ. កាហ្វេទឹកដោះគោ, អាវយឺត..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>កូដ SKU (Auto)</span>
                <button
                  type="button"
                  onClick={() => setSku(generateRandomSku())}
                  className="text-[10px] text-indigo-600 hover:underline"
                >
                  បង្កើតថ្មី
                </button>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU-123456"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                បាកូដ / Barcode (ជម្រើស)
              </label>
              <div className="relative">
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="ឧ. 8850100200..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ប្រភេទទំនិញ
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
                >
                  <option value="ទំនិញទូទៅ">ទំនិញទូទៅ</option>
                  <option value="ភេសជ្ជៈ">ភេសជ្ជៈ</option>
                  <option value="អាហារ">អាហារ</option>
                  <option value="គ្រឿងទេស">គ្រឿងទេស</option>
                  <option value="សំលៀកបំពាក់">សំលៀកបំពាក់</option>
                  <option value="គ្រឿងអេឡិចត្រូនិក">គ្រឿងអេឡិចត្រូនិក</option>
                  <option value="ផ្សេងៗ">ផ្សេងៗ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ខ្នាត / ឯកតា
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="ឧ. កញ្ចប់, ដប, ក្បាល..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ចំនួនស្តុកបច្ចុប្បន្ន
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                កម្រិតរំលឹកស្តុកទាប
              </label>
              <div className="relative">
                <AlertTriangle className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(e.target.value)}
                  placeholder="5"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                តម្លៃដើម ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                តម្លៃលក់ ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ពិពណ៌នាបន្ថែម (ជម្រើស)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ព័ត៌មានលម្អិតអំពីទំនិញ..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all cursor-pointer min-h-[48px]"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer min-h-[48px]"
            >
              {submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
