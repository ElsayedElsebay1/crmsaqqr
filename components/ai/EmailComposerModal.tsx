import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store/store';
import { generateFollowUpEmailApi } from '../../services/api';
import { Lead, Deal } from '../../types';
import BaseModal from '../shared/BaseModal';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';

interface EmailComposerModalProps {
  target: Lead | Deal;
  onClose: () => void;
}

const SkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/4"></div>
        <div className="h-10 bg-slate-700 rounded w-full"></div>
        <div className="h-6 bg-slate-700 rounded w-1/4 mt-4"></div>
        <div className="space-y-2">
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        </div>
    </div>
);

const EmailComposerModal: React.FC<EmailComposerModalProps> = ({ target, onClose }) => {
  const { currentUser } = useStore(state => ({
    currentUser: state.currentUser!,
  }));

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const generateEmail = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const emailContent = await generateFollowUpEmailApi(target, currentUser);
      setSubject(emailContent.subject);
      setBody(emailContent.body);
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع.');
    } finally {
      setIsLoading(false);
    }
  }, [target, currentUser]);

  useEffect(() => {
    generateEmail();
  }, [generateEmail]);

  const handleSend = () => {
    const to = 'contactEmail' in target ? target.contactEmail : target.email;
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };
  
  const footer = (
    <>
      <button type="button" onClick={onClose} className="btn btn-secondary">
        إغلاق
      </button>
      <button type="button" onClick={generateEmail} className="btn btn-secondary" disabled={isLoading}>
        <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        <span>إعادة إنشاء</span>
      </button>
      <button type="button" onClick={handleSend} className="btn btn-primary" disabled={isLoading || !!error}>
        <PaperAirplaneIcon className="w-5 h-5" />
        <span>إرسال</span>
      </button>
    </>
  );

  return (
    <BaseModal isOpen={true} onClose={onClose} title="إنشاء بريد إلكتروني بواسطة AI" footer={footer}>
      {isLoading ? (
        <SkeletonLoader />
      ) : error ? (
        <div className="text-center py-8">
            <p className="text-red-400">{error}</p>
            <button onClick={generateEmail} className="btn btn-primary mt-4">حاول مرة أخرى</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="emailTo" className="block text-sm font-medium text-slate-300 mb-1">إلى</label>
            <input
              id="emailTo"
              type="email"
              readOnly
              value={'contactEmail' in target ? target.contactEmail : target.email}
              className="w-full bg-[#0D1C3C] border border-[#2C3E5F] rounded-md px-3 py-2 text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="emailSubject" className="block text-sm font-medium text-slate-300 mb-1">الموضوع</label>
            <input
              id="emailSubject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
            />
          </div>
          <div>
            <label htmlFor="emailBody" className="block text-sm font-medium text-slate-300 mb-1">نص الرسالة</label>
            <textarea
              id="emailBody"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
            />
          </div>
        </div>
      )}
    </BaseModal>
  );
};

export default EmailComposerModal;