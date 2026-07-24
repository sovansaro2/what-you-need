import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signIn({ email: email.trim(), password });
      navigate('/home', { replace: true });
    } catch (err: any) {
      setErrorMsg(authService.formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="login-page" className="min-h-screen bg-slate-50 flex flex-col justify-center px-6 py-12">
      <div id="login-header" className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h2 id="login-title" className="text-2xl font-bold tracking-tight text-slate-900">
          ចូលប្រើប្រាស់គណនី
        </h2>
        <p id="login-subtitle" className="mt-2 text-sm text-slate-600">
          សូមស្វាគមន៍មកកាន់ <span className="font-bokor text-base font-bold text-slate-900">What You Need?</span>
        </p>
      </div>

      <div id="login-card" className="bg-white py-8 px-6 shadow-xs rounded-2xl border border-slate-200 sm:mx-auto sm:w-full sm:max-w-md">
        {errorMsg && (
          <div id="login-error-alert" className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <form id="login-form" className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label id="login-email-label" htmlFor="login-email" className="block text-xs font-medium text-slate-700 mb-1">
              អាសយដ្ឋានអ៊ីមែល
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label id="login-password-label" htmlFor="login-password" className="block text-xs font-medium text-slate-700">
                ពាក្យសម្ងាត់
              </label>
              <Link id="login-forgot-link" to="/reset-password" className="text-xs text-indigo-600 hover:text-indigo-500">
                ភ្លេចពាក្យសម្ងាត់?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-medium text-sm rounded-lg transition-colors shadow-xs flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                កំពុងចូលប្រើ...
              </span>
            ) : (
              'ចូលប្រើ'
            )}
          </button>
        </form>

        <div id="login-footer" className="mt-6 text-center text-xs text-slate-600">
          មិនទាន់មានគណនីមែនទេ?{' '}
          <Link id="login-register-link" to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            បង្កើតគណនី
          </Link>
        </div>
      </div>
    </div>
  );
};
