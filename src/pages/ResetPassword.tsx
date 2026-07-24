import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

export const ResetPassword: React.FC = () => {
  const { resetPassword, updatePassword, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is authenticated via email recovery token, show "New Password" form
  const isResetting = Boolean(user);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword(email.trim());
      setSuccessMsg('Password reset instructions have been sent to your email.');
    } catch (err: any) {
      setErrorMsg(authService.formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updatePassword(newPassword);
      setSuccessMsg('Your password has been successfully updated.');
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1500);
    } catch (err: any) {
      setErrorMsg(authService.formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="reset-password-page" className="min-h-screen bg-slate-50 flex flex-col justify-center px-6 py-12">
      <div id="reset-password-header" className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h2 id="reset-password-title" className="text-2xl font-bold tracking-tight text-slate-900">
          {isResetting ? 'កំណត់ពាក្យសម្ងាត់ថ្មី' : 'ភ្លេចពាក្យសម្ងាត់'}
        </h2>
        <p id="reset-password-subtitle" className="mt-2 text-sm text-slate-600">
          {isResetting
            ? 'សូមបញ្ចូលពាក្យសម្ងាត់ថ្មីរបស់អ្នកខាងក្រោម។'
            : 'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលរបស់អ្នក ដើម្បីទទួលតំណកំណត់ពាក្យសម្ងាត់ឡើងវិញ។'}
        </p>
      </div>

      <div id="reset-password-card" className="bg-white py-8 px-6 shadow-xs rounded-2xl border border-slate-200 sm:mx-auto sm:w-full sm:max-w-md">
        {errorMsg && (
          <div id="reset-password-error" className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div id="reset-password-success" className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">
            {successMsg}
          </div>
        )}

        {!isResetting ? (
          <form id="forgot-password-form" className="space-y-4" onSubmit={handleRequestReset}>
            <div>
              <label id="forgot-email-label" htmlFor="forgot-email" className="block text-xs font-medium text-slate-700 mb-1">
                អាសយដ្ឋានអ៊ីមែល
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              id="forgot-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-medium text-sm rounded-lg transition-colors shadow-xs flex items-center justify-center cursor-pointer"
            >
              {isSubmitting ? 'កំពុងផ្ញើ...' : 'ផ្ញើតំណកំណត់ពាក្យសម្ងាត់'}
            </button>
          </form>
        ) : (
          <form id="update-password-form" className="space-y-4" onSubmit={handleUpdatePassword}>
            <div>
              <label id="update-password-label" htmlFor="update-password-input" className="block text-[11px] font-medium text-slate-700 mb-1">
                ពាក្យសម្ងាត់ថ្មី
              </label>
              <input
                id="update-password-input"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              id="update-password-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-medium text-sm rounded-lg transition-colors shadow-xs flex items-center justify-center cursor-pointer"
            >
              {isSubmitting ? 'កំពុងបច្ចុប្បន្នភាព...' : 'បច្ចុប្បន្នភាពពាក្យសម្ងាត់'}
            </button>
          </form>
        )}

        <div id="reset-password-footer" className="mt-6 text-center text-xs text-slate-600">
          ត្រឡប់ទៅ{' '}
          <Link id="reset-back-login-link" to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            ចូលប្រើ
          </Link>
        </div>
      </div>
    </div>
  );
};
