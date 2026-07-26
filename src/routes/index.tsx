import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from '@/context/AuthContext';
import { PublicRoute } from '@/components/routes/PublicRoute';
import { ProtectedRoute } from '@/components/routes/ProtectedRoute';
import { AppLayout } from '@/layouts/AppLayout';
import { Splash } from '@/pages/Splash';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ResetPassword } from '@/pages/ResetPassword';
import { Home } from '@/pages/Home';
import { Features } from '@/pages/Features';
import { Chat } from '@/pages/Chat';
import { Account } from '@/pages/Account';
import { Profile } from '@/pages/Profile';
import { EditProfile } from '@/pages/EditProfile';
import { Settings } from '@/pages/Settings';
import { Help } from '@/pages/Help';
import { SupportPage } from '@/pages/SupportPage';
import { BusinessInfoPage } from '@/pages/settings/BusinessInfoPage';
import { GeneralSettingsPage } from '@/pages/settings/GeneralSettingsPage';
import { CurrencyPage } from '@/pages/settings/CurrencyPage';
import { SecurityPage } from '@/pages/settings/SecurityPage';
import { VersionPage } from '@/pages/about/VersionPage';
import { DeveloperPage } from '@/pages/about/DeveloperPage';
import { NotFound } from '@/pages/NotFound';
import { ModulePlaceholder } from '@/pages/ModulePlaceholder';
import { Finance } from '@/modules/finance/Finance';
import { Products } from '@/pages/Products';
import { Onboarding } from '@/pages/Onboarding';
import { ProductUnitsPage } from '@/modules/inventory/units';
import { ProductCategoriesPage } from '@/modules/inventory/categories';
import { ProductFormPage, ProductDetailPage } from '@/modules/inventory/products';
import { StockMovementPage } from '@/modules/inventory/stock-movements';

export const AppRoutes: React.FC = () => {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes for Guests */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Protected Routes for Authenticated Users */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/features" element={<Features />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/account" element={<Account />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              {/* Settings Routes */}
              <Route path="/settings" element={<Navigate to="/settings/business" replace />} />
              <Route path="/settings/business" element={<BusinessInfoPage />} />
              <Route path="/settings/general" element={<GeneralSettingsPage />} />
              <Route path="/settings/currency" element={<CurrencyPage />} />
              <Route path="/settings/security" element={<SecurityPage />} />

              {/* Help & Support Routes */}
              <Route path="/help" element={<Help />} />
              <Route path="/support" element={<SupportPage />} />

              {/* About Routes */}
              <Route path="/about" element={<Navigate to="/about/version" replace />} />
              <Route path="/about/version" element={<VersionPage />} />
              <Route path="/about/developer" element={<DeveloperPage />} />

              {/* Finance Module Route */}
              <Route path="/finance" element={<Finance />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProductFormPage mode="add" />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/products/:id/edit" element={<ProductFormPage mode="edit" />} />
              <Route path="/products/:id/stock-update" element={<StockMovementPage />} />
              <Route path="/inventory/stock-update/:id" element={<StockMovementPage />} />
              <Route path="/inventory" element={<Products />} />
              <Route path="/inventory/units" element={<ProductUnitsPage />} />
              <Route path="/products/units" element={<ProductUnitsPage />} />
              <Route path="/inventory/categories" element={<ProductCategoriesPage />} />
              <Route path="/products/categories" element={<ProductCategoriesPage />} />
              <Route
                path="/sales"
                element={
                  <ModulePlaceholder
                    title="Sales Management Module"
                    description="Point-of-sale receipt recording and order tracking interface prepared for database linkage."
                  />
                }
              />
              <Route
                path="/reports"
                element={
                  <ModulePlaceholder
                    title="Reports & Analytics Module"
                    description="Financial analytics charts and export capabilities prepared for future release."
                  />
                }
              />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
};
