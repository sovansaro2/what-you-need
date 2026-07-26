import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Camera,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Tag,
  Layers,
  DollarSign,
  AlertTriangle,
  FileText,
  Barcode,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  InventoryProduct,
  CreateInventoryProductInput,
  UpdateInventoryProductInput,
} from '../types';
import { DEFAULT_MIN_STOCK_ALERT, KHMER_PRODUCT_MESSAGES } from '../constants';
import { productValidator, ProductValidationError } from '../validators/productValidator';
import { ProductCategorySelect } from '@/modules/inventory/categories/components/ProductCategorySelect';
import { ProductUnitSelect } from '@/modules/inventory/units/components/ProductUnitSelect';
import { useInventoryProducts } from '../hooks/useProducts';

interface ProductFormProps {
  initialData?: InventoryProduct | null;
  isEdit?: boolean;
  onSuccess?: (product: InventoryProduct) => void;
  onCancel?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  isEdit = false,
  onSuccess,
  onCancel,
}) => {
  const navigate = useNavigate();
  const { createProduct, updateProduct, checkSkuDuplicate } = useInventoryProducts();

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [barcode, setBarcode] = useState(initialData?.barcode || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [categoryId, setCategoryId] = useState<string | undefined>(initialData?.category_id || undefined);
  const [unit, setUnit] = useState(initialData?.unit || '');
  const [unitId, setUnitId] = useState<string | undefined>(initialData?.unit_id || undefined);
  const [costPrice, setCostPrice] = useState<string>(
    initialData?.cost_price !== undefined ? String(initialData.cost_price) : ''
  );
  const [sellingPrice, setSellingPrice] = useState<string>(
    initialData?.selling_price !== undefined ? String(initialData.selling_price) : ''
  );
  const [initialStock, setInitialStock] = useState<string>(
    initialData?.current_stock !== undefined ? String(initialData.current_stock) : '0'
  );
  const [minStockAlert, setMinStockAlert] = useState<string>(
    initialData?.min_stock_alert !== undefined
      ? String(initialData.min_stock_alert)
      : String(DEFAULT_MIN_STOCK_ALERT)
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.image_url || null);

  // Status & Feedback States
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Field Refs for focusing first error
  const nameRef = useRef<HTMLInputElement>(null);
  const costPriceRef = useRef<HTMLInputElement>(null);
  const sellingPriceRef = useRef<HTMLInputElement>(null);
  const skuRef = useRef<HTMLInputElement>(null);

  // File Input Refs for Camera and Gallery
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Textarea Ref for Auto-Expansion
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Track initial state changes for dirty flag
  useEffect(() => {
    if (
      name !== (initialData?.name || '') ||
      sku !== (initialData?.sku || '') ||
      barcode !== (initialData?.barcode || '') ||
      category !== (initialData?.category || '') ||
      unit !== (initialData?.unit || '') ||
      costPrice !== (initialData?.cost_price !== undefined ? String(initialData.cost_price) : '') ||
      sellingPrice !== (initialData?.selling_price !== undefined ? String(initialData.selling_price) : '') ||
      description !== (initialData?.description || '') ||
      imageUrl !== (initialData?.image_url || null)
    ) {
      setIsDirty(true);
    }
  }, [name, sku, barcode, category, unit, costPrice, sellingPrice, description, imageUrl, initialData]);

  // Dynamic textarea expansion
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  };

  // Image File Handling (Camera & Gallery)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToastMessage({ type: 'error', text: 'ទំហំរូបភាពមិនអាចធំជាង 5MB បានឡើយ' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Category & Unit Select Handlers
  const handleCategoryChange = (val: string, catId?: string) => {
    setCategory(val);
    if (catId) setCategoryId(catId);
    if (formErrors.category) {
      setFormErrors((prev) => ({ ...prev, category: '' }));
    }
  };

  const handleUnitChange = (uId: string, uObj: any) => {
    if (uObj) {
      setUnit(uObj.name);
      setUnitId(uObj.id);
    } else {
      setUnit(uId);
      setUnitId(undefined);
    }
    if (formErrors.unit) {
      setFormErrors((prev) => ({ ...prev, unit: '' }));
    }
  };

  // Unsaved Guard Back/Cancel
  const handleRequestClose = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      if (onCancel) onCancel();
      else navigate('/products');
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    if (onCancel) onCancel();
    else navigate('/products');
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setToastMessage(null);

    const costVal = parseFloat(costPrice);
    const sellVal = parseFloat(sellingPrice);
    const minAlertVal = parseFloat(minStockAlert);
    const initStockVal = parseFloat(initialStock);

    // Prepare input payload
    const inputPayload = {
      name: name.trim(),
      sku: sku.trim() || undefined,
      barcode: barcode.trim() || undefined,
      category: category.trim(),
      category_id: categoryId,
      unit: unit.trim(),
      unit_id: unitId,
      cost_price: isNaN(costVal) ? -1 : costVal,
      selling_price: isNaN(sellVal) ? -1 : sellVal,
      initial_stock: isNaN(initStockVal) ? 0 : initStockVal,
      min_stock_alert: isNaN(minAlertVal) ? DEFAULT_MIN_STOCK_ALERT : minAlertVal,
      description: description.trim() || undefined,
      image_url: imageUrl || undefined,
    };

    // Client Validator
    const errors: ProductValidationError[] = isEdit
      ? productValidator.validateUpdate(inputPayload)
      : productValidator.validateCreate(inputPayload);

    const errMap: Record<string, string> = {};
    errors.forEach((err) => {
      errMap[err.field] = err.message;
    });

    // Additional SKU uniqueness check
    if (sku.trim()) {
      const isSkuDup = await checkSkuDuplicate(sku.trim(), initialData?.id);
      if (isSkuDup) {
        errMap.sku = KHMER_PRODUCT_MESSAGES.SKU_DUPLICATE;
      }
    }

    if (Object.keys(errMap).length > 0) {
      setFormErrors(errMap);
      setToastMessage({ type: 'error', text: 'សូមពិនិត្យមើលព័ត៌មានដែលបានបញ្ចូលឡើងវិញ' });

      // Focus first errored field
      if (errMap.name && nameRef.current) nameRef.current.focus();
      else if (errMap.sku && skuRef.current) skuRef.current.focus();
      else if (errMap.cost_price && costPriceRef.current) costPriceRef.current.focus();
      else if (errMap.selling_price && sellingPriceRef.current) sellingPriceRef.current.focus();
      return;
    }

    setSubmitting(true);

    try {
      let savedProduct: InventoryProduct;

      if (isEdit && initialData) {
        const updatePayload: UpdateInventoryProductInput = {
          name: inputPayload.name,
          sku: inputPayload.sku,
          barcode: inputPayload.barcode,
          category: inputPayload.category,
          category_id: inputPayload.category_id,
          unit: inputPayload.unit,
          unit_id: inputPayload.unit_id,
          cost_price: inputPayload.cost_price,
          selling_price: inputPayload.selling_price,
          min_stock_alert: inputPayload.min_stock_alert,
          description: inputPayload.description,
          image_url: inputPayload.image_url,
        };
        savedProduct = await updateProduct(initialData.id, updatePayload);
        setToastMessage({ type: 'success', text: KHMER_PRODUCT_MESSAGES.UPDATE_SUCCESS });
      } else {

        const createPayload: CreateInventoryProductInput = {
          name: inputPayload.name,
          sku: inputPayload.sku,
          barcode: inputPayload.barcode,
          category: inputPayload.category,
          category_id: inputPayload.category_id,
          unit: inputPayload.unit,
          unit_id: inputPayload.unit_id,
          cost_price: inputPayload.cost_price,
          selling_price: inputPayload.selling_price,
          initial_stock: inputPayload.initial_stock,
          min_stock_alert: inputPayload.min_stock_alert,
          description: inputPayload.description,
          image_url: inputPayload.image_url,
        };
        savedProduct = await createProduct(createPayload);
        setToastMessage({ type: 'success', text: KHMER_PRODUCT_MESSAGES.CREATE_SUCCESS });
      }

      setIsDirty(false);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(savedProduct);
        } else {
          navigate('/products');
        }
      }, 600);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setToastMessage({
        type: 'error',
        text: err?.message || 'មានបញ្ហាក្នុងការរក្សាទុកទំនិញ សូមព្យាយាមម្តងទៀត',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="product-form-container" className="max-w-4xl mx-auto space-y-5 pb-24">
      {/* Hidden inputs for camera & gallery photo capture */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Header Bar */}
      <div id="product-form-header" className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRequestClose}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200/80"
            title="ត្រឡប់ក្រោយ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              {isEdit ? 'កែប្រែព័ត៌មានទំនិញ' : 'បន្ថែមទំនិញថ្មី'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit
                ? 'កែប្រែឈ្មោះ តម្លៃ ប្រភេទទំនិញ និងព័ត៌មានលម្អិត'
                : 'បញ្ចូលព័ត៌មានទំនិញថ្មីចូលក្នុងកាតាឡុកអាជីវកម្ម'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Toast Notification Banner */}
      {toastMessage && (
        <div
          id="product-form-toast"
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-bold shadow-2xs transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form Content Grid */}
      <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Product Image */}
        <div id="section-product-image" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              រូបភាពទំនិញ (Product Image)
            </label>
            <span className="text-[11px] text-slate-400 font-medium">ជម្រើសបន្ថែម</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Image Preview Box */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl shrink-0 overflow-hidden relative flex items-center justify-center group">
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="Product Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="p-2 bg-white text-slate-800 rounded-xl hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                      title="ផ្លាស់ប្តូររូបភាព"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-xs font-bold transition-colors cursor-pointer"
                      title="លុបរូបភាព"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-3 space-y-1">
                  <Package className="w-8 h-8 text-slate-400 mx-auto" />
                  <span className="text-[11px] text-slate-400 block font-medium">គ្មានរូបភាព</span>
                </div>
              )}
            </div>

            {/* Action Buttons for Image */}
            <div className="space-y-2 text-center sm:text-left flex-1 w-full">
              <p className="text-xs text-slate-500 leading-relaxed">
                លោកអ្នកអាចថតរូបផ្ទាល់ ឬជ្រើសរើសរូបភាពចេញពីរូបថតក្នុងទូរស័ព្ទ (អតិបរមា 5MB)
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-1">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-2.5 px-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Camera className="w-4 h-4" />
                  <span>ថតរូប (Camera)</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>ជ្រើសរើសរូបភាព (Gallery)</span>
                </button>

                {imageUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="py-2.5 px-3.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>លុបរូបភាព</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Basic Information */}
        <div id="section-basic-info" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
            ព័ត៌មានទូទៅរបស់ទំនិញ (Basic Details)
          </h2>

          {/* Product Name Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              ឈ្មោះទំនិញ (Product Name) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="ឧទាហរណ៍៖ កាហ្វេទឹកដោះគោទឹកកក"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
                  formErrors.name
                    ? 'border-red-300 ring-2 ring-red-500/10 focus:border-red-500'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20'
                }`}
              />
            </div>
            {formErrors.name && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formErrors.name}</span>
              </p>
            )}
          </div>

          {/* SKU & Barcode Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* SKU Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                កូដសម្គាល់ (SKU)
              </label>
              <div className="relative">
                <input
                  ref={skuRef}
                  type="text"
                  value={sku}
                  onChange={(e) => {
                    setSku(e.target.value);
                    if (formErrors.sku) setFormErrors((prev) => ({ ...prev, sku: '' }));
                  }}
                  placeholder="ឧទាហរណ៍៖ COF-001"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
                    formErrors.sku
                      ? 'border-red-300 ring-2 ring-red-500/10 focus:border-red-500'
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {formErrors.sku && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.sku}</span>
                </p>
              )}
            </div>

            {/* Barcode Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                កូដបារ (Barcode)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ 8850012345678"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Category & Unit Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category Select */}
            <ProductCategorySelect
              label="ប្រភេទទំនិញ (Category)"
              value={category}
              onChange={handleCategoryChange}
              required
              error={formErrors.category}
            />

            {/* Unit Select */}
            <ProductUnitSelect
              label="ខ្នាតទំនិញ (Unit)"
              value={unit}
              onChange={handleUnitChange}
              required
              error={formErrors.unit}
            />
          </div>
        </div>

        {/* Section 3: Pricing & Stock Parameters */}
        <div id="section-pricing-stock" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
            តម្លៃ និងដែនកំណត់ស្តុក (Pricing & Stock Levels)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Cost Price */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                តម្លៃដើម / ទិញចូល ($ USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={costPriceRef}
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => {
                    setCostPrice(e.target.value);
                    if (formErrors.cost_price) setFormErrors((prev) => ({ ...prev, cost_price: '' }));
                  }}
                  placeholder="0.00"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
                    formErrors.cost_price
                      ? 'border-red-300 ring-2 ring-red-500/10 focus:border-red-500'
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {formErrors.cost_price && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.cost_price}</span>
                </p>
              )}
            </div>

            {/* Selling Price */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                តម្លៃលក់ចេញ ($ USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={sellingPriceRef}
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => {
                    setSellingPrice(e.target.value);
                    if (formErrors.selling_price) setFormErrors((prev) => ({ ...prev, selling_price: '' }));
                  }}
                  placeholder="0.00"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
                    formErrors.selling_price
                      ? 'border-red-300 ring-2 ring-red-500/10 focus:border-red-500'
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {formErrors.selling_price && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.selling_price}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Initial Stock (Only in Add mode, or read-only info in Edit mode) */}
            {!isEdit ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ចំនួនស្តុកចាប់ផ្តើម (Initial Stock)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all min-h-[44px]"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  ចំនួនស្តុកដំបូងពេលបង្កើតទំនិញ
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">
                  ចំនួនស្តុកបច្ចុប្បន្ន (Current Stock)
                </label>
                <div className="px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 min-h-[44px] flex items-center">
                  {initialData?.current_stock ?? 0} {initialData?.unit || unit}
                </div>
                <p className="text-[11px] text-amber-600 font-medium">
                  * ចំនួនស្តុកអាចកែប្រែបានតែតាមរយៈប្រតិបត្តិការស្តុកប៉ុណ្ណោះ
                </p>
              </div>
            )}

            {/* Minimum Stock Alert Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                កម្រិតស្តុកទាបបំផុតដើម្បីជូនដំណឹង (Min Alert)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={minStockAlert}
                  onChange={(e) => {
                    setMinStockAlert(e.target.value);
                    if (formErrors.min_stock_alert)
                      setFormErrors((prev) => ({ ...prev, min_stock_alert: '' }));
                  }}
                  placeholder="5"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
                    formErrors.min_stock_alert
                      ? 'border-red-300 ring-2 ring-red-500/10 focus:border-red-500'
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {formErrors.min_stock_alert && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.min_stock_alert}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Description (Dynamic Auto-expanding Textarea) */}
        <div id="section-description" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            ការពិពណ៌នាបន្ថែម (Description)
          </label>
          <textarea
            ref={descriptionRef}
            rows={3}
            value={description}
            onChange={handleDescriptionChange}
            placeholder="ព័ត៌មានលម្អិតបន្ថែមអំពីទំនិញ របៀបរក្សាទុក ឬកំណត់ចំណាំផ្សេងៗ..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none min-h-[90px]"
          />
        </div>

        {/* Keyboard-Safe Sticky Footer */}
        <div
          id="product-form-sticky-footer"
          className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-3 sm:p-4 shadow-lg pb-safe"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleRequestClose}
              disabled={submitting}
              className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer min-h-[44px] border border-slate-200/80"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>កំពុងរក្សាទុក...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'រក្សាទុកការកែប្រែ' : 'រក្សាទុកទំនិញ'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Discard / Unsaved Changes Confirmation Modal */}
      {showDiscardModal && (
        <div id="discard-modal-backdrop" className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">មានការផ្លាស់ប្តូរមិនទាន់បានរក្សាទុក</h3>
                <p className="text-xs text-slate-500">តើអ្នកពិតជាចង់ចាកចេញដោយមិនរក្សាទុកមែនទេ?</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ទិន្នន័យដែលអ្នកបានបញ្ចូលនៅលើទម្រង់បែបបទនេះនឹងត្រូវបាត់បង់ប្រសិនបើអ្នកចាកចេញឥឡូវនេះ។
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors min-h-[40px] cursor-pointer"
              >
                បន្តកែប្រែ
              </button>

              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="py-2 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors min-h-[40px] cursor-pointer"
              >
                ចាកចេញដោយមិនរក្សាទុក
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
