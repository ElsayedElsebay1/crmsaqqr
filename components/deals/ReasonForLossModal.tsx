import React, { useState } from 'react';
import { Deal, DealStatus, DealLostReason } from '../../types';
import { useStore } from '../../store/store';
import BaseModal from '../shared/BaseModal';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';

interface ReasonForLossModalProps {
  deal: Deal;
  onClose: () => void;
}

const LOST_REASONS: { id: DealLostReason, text: string }[] = [
    { id: 'price', text: 'السعر مرتفع جدًا' },
    { id: 'competitor', text: 'خسارة لصالح منافس' },
    { id: 'timeline', text: 'عدم تطابق الجدول الزمني' },
    { id: 'scope', text: 'عدم تطابق نطاق العمل' },
    { id: 'unresponsive', text: 'العميل لم يعد يستجيب' },
    { id: 'other', text: 'سبب آخر (يرجى التوضيح)' },
];

const ReasonForLossModal: React.FC<ReasonForLossModalProps> = ({ deal, onClose }) => {
  const { saveDeal, isSubmitting } = useStore(state => ({
    saveDeal: state.saveDeal,
    isSubmitting: state.isSubmitting,
  }));

  const [reason, setReason] = useState<DealLostReason | ''>('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!reason) {
      setError('يرجى اختيار سبب الخسارة.');
      return;
    }
    if (reason === 'other' && !details.trim()) {
      setError('يرجى توضيح السبب في حقل التفاصيل.');
      return;
    }
    setError('');

    const updatedDeal: Deal = {
      ...deal,
      status: DealStatus.LOST,
      lostReason: reason,
      lostReasonDetails: reason === 'other' ? details : '',
    };
    
    await saveDeal(updatedDeal, false);
    onClose();
  };

  const footer = (
    <>
      <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
        إلغاء
      </button>
      <button type="button" onClick={handleConfirm} className="btn btn-danger" disabled={isSubmitting}>
        {isSubmitting ? 'جارٍ الحفظ...' : 'تأكيد الخسارة'}
      </button>
    </>
  );

  return (
    <BaseModal isOpen={true} onClose={onClose} footer={footer} maxWidth="max-w-lg">
        <div className="flex items-start gap-4">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
            </div>
            <div className="mt-0 text-right w-full">
              <h3 className="text-lg font-semibold leading-6 text-slate-100">
                تأكيد خسارة الفرصة: {deal.title}
              </h3>
              <div className="mt-4 space-y-4">
                <p className="text-sm text-slate-400">
                  لتسجيل الفرصة كـ "خاسرة"، يرجى تحديد السبب. هذه المعلومات تساعدنا على تحسين أدائنا في المستقبل.
                </p>
                <div>
                  <label htmlFor="lostReason" className="block text-sm font-medium text-slate-300 mb-1">سبب الخسارة</label>
                  <select
                    id="lostReason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value as DealLostReason)}
                    className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
                  >
                    <option value="" disabled>-- اختر سببًا --</option>
                    {LOST_REASONS.map(r => (
                        <option key={r.id} value={r.id}>{r.text}</option>
                    ))}
                  </select>
                </div>
                {reason === 'other' && (
                    <div>
                        <label htmlFor="lostReasonDetails" className="block text-sm font-medium text-slate-300 mb-1">تفاصيل إضافية</label>
                        <textarea
                            id="lostReasonDetails"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            rows={3}
                            className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
                            placeholder="مثال: اختار العميل المنافس (اسم المنافس) بسبب السعر الأقل..."
                        />
                    </div>
                )}
                {error && <p className="text-red-400 text-sm">{error}</p>}
              </div>
            </div>
          </div>
    </BaseModal>
  );
};

export default ReasonForLossModal;