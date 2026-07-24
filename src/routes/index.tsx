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
import { NotFound } from '@/pages/NotFound';
import { ModulePlaceholder } from '@/pages/ModulePlaceholder';
import { Finance } from '@/modules/finance/Finance';
import { Products } from '@/pages/Products';
import { Onboarding } from '@/pages/Onboarding';

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
              <Route path="/settings" element={<Account />} />

              {/* Finance Module Route */}
              <Route path="/finance" element={<Finance />} />
              <Route path="/products" element={<Products />} />
              <Route path="/inventory" element={<Products />} />
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
