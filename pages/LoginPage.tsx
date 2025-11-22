import React, { useState } from 'react';
import { LockClosedIcon } from '../components/icons/LockClosedIcon';
import { useStore } from '../store/store';

interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = () => {
  const { login, isSubmitting, error, openForgotPasswordModal } = useStore(state => ({
    login: state.login,
    isSubmitting: state.isSubmitting,
    error: state.error,
    openForgotPasswordModal: state.openForgotPasswordModal,
  }));

  const [email, setEmail] = useState('admin@saqqr.com');
  const [password, setPassword] = useState('123');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <img src="https://l.top4top.io/p_356010hdb1.png" alt="Saqqr CRM Logo" className="w-32 h-20 mx-auto mb-4 object-cover object-right" />
            <h1 className="text-3xl font-bold text-white">مرحباً بك في <span className="gradient-text">صقر CRM</span></h1>
            <p className="text-slate-400 mt-2">قم بتسجيل الدخول للمتابعة إلى لوحة التحكم الخاصة بك.</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  كلمة المرور
                </label>
                <button
                  type="button"
                  onClick={openForgotPasswordModal}
                  className="text-sm font-semibold text-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn btn-primary justify-center !py-3 !text-base"
              >
                {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <>
                        <LockClosedIcon className="w-5 h-5 -ml-1" />
                        <span>تسجيل الدخول</span>
                    </>
                )}
              </button>
            </div>
          </form>

            <div className="text-center mt-6 border-t border-slate-700 pt-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">بيانات الدخول التجريبية</h3>
                <div className="text-xs text-slate-400 space-y-1">
                    <p><strong>البريد الإلكتروني:</strong> <span className="font-mono text-[var(--color-primary-light)]">admin@saqqr.com</span> (مدير)</p>
                    <p><strong>البريد الإلكتروني:</strong> <span className="font-mono text-[var(--color-primary-light)]">sales@saqqr.com</span> (مبيعات)</p>
                    <p><strong>كلمة المرور (للجميع):</strong> <span className="font-mono text-[var(--color-primary-light)]">123</span></p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
