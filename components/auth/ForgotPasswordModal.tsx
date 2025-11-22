import React, { useState } from 'react';
import { useStore } from '../../store/store';
import BaseModal from '../shared/BaseModal';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import { KeyIcon } from '../icons/KeyIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

type Stage = 'request' | 'reset' | 'success';

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
  const { requestPasswordReset, resetPassword, isSubmitting, error, clearError } = useStore(state => ({
    requestPasswordReset: state.requestPasswordReset,
    resetPassword: state.resetPassword,
    isSubmitting: state.isSubmitting,
    error: state.error,
    clearError: state.clearError,
  }));

  const [stage, setStage] = useState<Stage>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleClose = () => {
    clearError();
    onClose();
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    if (!email) {
      setLocalError('البريد الإلكتروني مطلوب.');
      return;
    }
    const success = await requestPasswordReset(email);
    if (success) {
      setStage('reset');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    if (newPassword.length < 3) { // Simplified for demo
      setLocalError('كلمة المرور يجب أن تكون 3 أحرف على الأقل.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('كلمتا المرور غير متطابقتين.');
      return;
    }
    const success = await resetPassword(email, code, newPassword);
    if (success) {
      setStage('success');
      setTimeout(() => {
        handleClose();
      }, 3000);
    }
  };

  const renderContent = () => {
    switch (stage) {
      case 'request':
        return (
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <p className="text-sm text-slate-400">
              أدخل بريدك الإلكتروني المسجل وسنرسل لك رمزًا لإعادة تعيين كلمة المرور. (ملاحظة: سيظهر الرمز في إشعارات التطبيق لأغراض العرض).
            </p>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md pr-10 pl-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
                  required
                  placeholder="you@example.com"
                />
              </div>
            </div>
             {(localError || error) && <p className="text-red-400 text-sm">{localError || error}</p>}
            <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={handleClose} className="btn btn-secondary" disabled={isSubmitting}>إلغاء</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'جارٍ الإرسال...' : 'إرسال الرمز'}
                </button>
            </div>
          </form>
        );
      case 'reset':
        return (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <p className="text-sm text-slate-400">
                تم إرسال رمز إلى <span className="font-bold text-slate-200">{email}</span>. يرجى إدخاله أدناه مع كلمة المرور الجديدة. (لأغراض العرض، تحقق من الإشعارات داخل التطبيق لرؤية الرمز).
            </p>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-300 mb-1">رمز التحقق</label>
              <input type="text" id="code" value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]" required />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-1">كلمة المرور الجديدة</label>
              <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]" required />
            </div>
             <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">تأكيد كلمة المرور</label>
              <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]" required />
            </div>
            {(localError || error) && <p className="text-red-400 text-sm">{localError || error}</p>}
             <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={handleClose} className="btn btn-secondary" disabled={isSubmitting}>إلغاء</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'جارٍ التعيين...' : 'إعادة تعيين'}
                </button>
            </div>
          </form>
        );
      case 'success':
        return (
            <div className="text-center py-8">
                <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-100">تم بنجاح!</h3>
                <p className="text-slate-400 mt-2">
                    تم إعادة تعيين كلمة المرور الخاصة بك. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
                </p>
            </div>
        );
    }
  };

  return (
    <BaseModal isOpen={true} onClose={stage !== 'success' ? handleClose : () => {}} title="إعادة تعيين كلمة المرور" maxWidth="max-w-md">
      {renderContent()}
    </BaseModal>
  );
};

export default ForgotPasswordModal;