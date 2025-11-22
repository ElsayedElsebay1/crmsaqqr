import React from 'react';
import { XIcon } from '../icons/XIcon';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  header, 
  footer, 
  maxWidth = 'max-w-2xl' 
}) => {
  if (!isOpen) return null;

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-[#1A2B4D] rounded-xl shadow-2xl w-full ${maxWidth} text-white flex flex-col modal-content`}
        onClick={handleModalContentClick}
      >
        {header ? (
          header
        ) : title ? (
          <div className="p-6 border-b border-[#2C3E5F] bg-gradient-to-b from-[#1A2B4D] to-[#1A2B4D]/50 rounded-t-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{title}</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        ) : null}
        
        <div className="overflow-y-auto max-h-[80vh] p-6">
          {children}
        </div>

        {footer && (
          <div className="p-6 border-t border-[#2C3E5F] flex justify-end gap-4 bg-[#1A2B4D]/80 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseModal;
