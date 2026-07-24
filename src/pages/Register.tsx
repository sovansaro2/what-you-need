import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

export const Register: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });

      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1000);
    } catch (err: any) {
      setErrorMsg(authService.formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="register-page" className="min-h-screen bg-slate-50 flex flex-col justify-center px-6 py-12">
      <div id="register-header" className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h2 id="register-title" className="text-2xl font-bold tracking-tight text-slate-900">
          បង្កើតគណនីថ្មី
        </h2>
        <p id="register-subtitle" className="mt-2 text-sm text-slate-600">
          ចាប់ផ្ដើមជាមួយ <span className="font-bokor text-base font-bold text-slate-900">What You Need?</span>
        </p>
      </div>

      <div id="register-card" className="bg-white py-8 px-6 shadow-xs rounded-2xl border border-slate-200 sm:mx-auto sm:w-full sm:max-w-md">
        {errorMsg && (
          <div id="register-error-alert" className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div id="register-success-alert" className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">
            {successMsg}
          </div>
        )}

        <form id="register-form" className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label id="register-name-label" htmlFor="register-name" className="block text-xs font-medium text-slate-700 mb-1">
              ឈ្មោះពេញ *
            </label>
            <input
              id="register-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="សុខ ចាន់"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label id="register-email-label" htmlFor="register-email" className="block text-xs font-medium text-slate-700 mb-1">
              អាសយដ្ឋានអ៊ីមែល *
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label id="register-phone-label" htmlFor="register-phone" className="block text-xs font-medium text-slate-700 mb-1">
              លេខទូរស័ព្ទ (ជម្រើស)
            </label>
            <input
              id="register-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="012 345 678"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label id="register-password-label" htmlFor="register-password" className="block text-xs font-medium text-slate-700 mb-1">
              ពាក្យសម្ងាត់ *
            </label>
            <input
              id="register-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-medium text-sm rounded-lg transition-colors shadow-xs flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                កំពុងបង្កើតគណនី...
              </span>
            ) : (
              'បង្កើតគណនី'
            )}
          </button>
        </form>

        <div id="register-footer" className="mt-6 text-center text-xs text-slate-600">
          មានគណនីរួចហើយមែនទេ?{' '}
          <Link id="register-login-link" to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            ចូលប្រើ
          </Link>
        </div>
      </div>
    </div>
  );
};
