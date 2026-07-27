import React, { useState } from 'react';
import { ShoppingCart, History, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePOS } from '@/modules/sales/hooks/usePOS';
import { ProductCatalog } from '@/modules/sales/components/ProductCatalog';
import { CartDrawer } from '@/modules/sales/components/CartDrawer';
import { CustomerSelector } from '@/modules/sales/components/CustomerSelector';
import { ReceiptModal } from '@/modules/sales/components/ReceiptModal';
import { SalesHistoryTable } from '@/modules/sales/components/SalesHistoryTable';

export const SalesPOS: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || '';

  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');

  const pos = usePOS(userId);

  return (
    <div id="sales-pos-page" className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
      {/* Top Navigation Bar */}
      <div id="pos-top-nav" className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div id="pos-title-area" className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              ប្រព័ន្ធលក់ទំនិញ (Point of Sale)
            </h1>
            <p className="text-[11px] text-slate-400">កត់ត្រាការលក់ ចេញវិក្កយបត្រ និង កាត់ស្តុកស្វ័យប្រវត្តិ</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div id="pos-tab-switcher" className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            id="tab-btn-pos"
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pos'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            ទំព័រលក់ (POS)
            {pos.cart.totals.item_count > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px]">
                {pos.cart.totals.item_count}
              </span>
            )}
          </button>

          <button
            id="tab-btn-history"
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            ប្រវត្តិលក់ (History)
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'pos' ? (
        <div id="pos-view-layout" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left / Main: Product Catalog */}
          <div id="pos-catalog-wrapper" className="flex-1 overflow-hidden">
            <ProductCatalog
              products={pos.filteredProducts}
              categories={pos.categories}
              searchQuery={pos.searchQuery}
              selectedCategory={pos.selectedCategory}
              onSearchChange={pos.setSearchQuery}
              onCategoryChange={pos.setSelectedCategory}
              onAddToCart={(p) => pos.cart.addToCart(p, 1)}
              onBarcodeScan={pos.handleBarcodeScan}
            />
          </div>

          {/* Right Sidebar: Cart & Checkout */}
          <CartDrawer
            cart={pos.cart}
            onOpenCustomerModal={() => pos.setIsCustomerModalOpen(true)}
            onCheckout={pos.handleCheckout}
            processing={pos.processingSale}
          />
        </div>
      ) : (
        <div id="history-view-layout" className="flex-1 overflow-y-auto bg-slate-50">
          <SalesHistoryTable userId={userId} />
        </div>
      )}

      {/* Customer Modal */}
      <CustomerSelector
        customers={pos.customers}
        selectedCustomer={pos.cart.customer}
        isOpen={pos.isCustomerModalOpen}
        onClose={() => pos.setIsCustomerModalOpen(false)}
        onSelectCustomer={pos.cart.setCustomer}
        onCreateCustomer={pos.handleCreateCustomer}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={pos.isReceiptModalOpen}
        onClose={() => pos.setIsReceiptModalOpen(false)}
        saleResult={pos.completedSale}
        items={pos.cart.cartItems}
        customer={pos.cart.customer}
        onNewSale={pos.startNewSale}
      />
    </div>
  );
};
