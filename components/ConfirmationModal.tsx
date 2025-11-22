import React, { useState } from 'react';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import BaseModal from './shared/BaseModal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'تأكيد',
  cancelButtonText = 'إلغاء',
  confirmButtonClass = 'btn-danger',
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      // The onClose is now called by the action that opened the modal, after the promise resolves.
      // This allows for better control flow. We can close it here as a fallback.
      if (isOpen) {
        onClose();
      }
    } catch (error) {
      console.error("Confirmation action failed:", error);
      // Don't close the modal on error, so the user knows something went wrong.
    } finally {
       if (isOpen) { // Check if component is still mounted
        setIsConfirming(false);
      }
    }
  };

  const footer = (
    <>
      <button
        type="button"
        className="btn btn-secondary w-full sm:w-auto"
        onClick={onClose}
        disabled={isConfirming}
      >
        {cancelButtonText}
      </button>
      <button
        type="button"
        className={`btn ${confirmButtonClass} w-full sm:w-auto`}
        onClick={handleConfirm}
        disabled={isConfirming}
      >
        {isConfirming ? 'جارٍ التأكيد...' : confirmButtonText}
      </button>
    </>
  );

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} footer={footer} maxWidth="max-w-md">
       <div className="flex items-start gap-4">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
            </div>
            <div className="mt-0 text-right">
              <h3 className="text-lg font-semibold leading-6 text-slate-100" id="confirmation-modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <div className="text-sm text-slate-400">
                  {message}
                </div>
              </div>
            </div>
          </div>
    </BaseModal>
  );
};

export default ConfirmationModal;