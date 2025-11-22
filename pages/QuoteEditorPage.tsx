import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '../store/store';
import { Quote, QuoteItem, QuoteStatus } from '../types';
import { generateQuotePDF } from '../utils/quotePdf';
import { ArrowUturnLeftIcon } from '../components/icons/ArrowUturnLeftIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { PlusIcon } from '../components/icons/PlusIcon';

const BLANK_QUOTE_ITEM: Omit<QuoteItem, 'id'> = {
  description: '',
  quantity: 1,
  unitPrice: 0,
};

const QuoteEditorPage: React.FC = () => {
    const { activeQuote, closeQuoteEditor, saveQuote, isSubmitting, openConfirmationModal, createInvoiceFromQuote } = useStore(state => ({
        activeQuote: state.activeQuote!,
        closeQuoteEditor: state.closeQuoteEditor,
        saveQuote: state.saveQuote,
        isSubmitting: state.isSubmitting,
        openConfirmationModal: state.openConfirmationModal,
        createInvoiceFromQuote: state.createInvoiceFromQuote,
    }));

    const [quoteData, setQuoteData] = useState<Quote | null>(null);

    const calculateTotals = useCallback((items: QuoteItem[], discount: number, tax: number) => {
        const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const taxAmount = (subtotal - discount) * (tax / 100);
        const total = subtotal - discount + taxAmount;
        return { subtotal, total };
    }, []);

    useEffect(() => {
        if (activeQuote.quote) {
            setQuoteData(activeQuote.quote);
        } else {
            const today = new Date();
            const expiry = new Date();
            expiry.setDate(today.getDate() + 30);
            
            const initialItems = activeQuote.deal.services.length > 0
                ? activeQuote.deal.services.map((service, index) => ({
                    id: `item-${Date.now()}-${index}`,
                    description: service,
                    quantity: 1,
                    unitPrice: 0
                  }))
                : [{ ...BLANK_QUOTE_ITEM, id: `item-${Date.now()}` }];
            
            const initialSubtotal = activeQuote.deal.value > 0 && initialItems.length === 1 ? activeQuote.deal.value : 0;
            if(initialItems.length === 1) initialItems[0].unitPrice = initialSubtotal;

            const { subtotal, total } = calculateTotals(initialItems, 0, 15);

            setQuoteData({
                id: '',
                quoteNumber: '', // Will be assigned by API
                dealId: activeQuote.deal.id,
                clientName: activeQuote.deal.companyName,
                issueDate: today.toISOString().split('T')[0],
                expiryDate: expiry.toISOString().split('T')[0],
                status: QuoteStatus.DRAFT,
                items: initialItems,
                terms: '- الدفع: 50% مقدم، 50% عند التسليم.\n- العرض ساري لمدة 30 يومًا من تاريخ الإصدار.',
                subtotal,
                discount: 0,
                tax: 15, // Default 15% tax
                total,
            });
        }
    }, [activeQuote, calculateTotals]);

    const handleItemChange = (index: number, field: keyof QuoteItem, value: string | number) => {
        if (!quoteData) return;
        const newItems = [...quoteData.items];
        const item = { ...newItems[index] };
        if (field === 'description') {
            item.description = value as string;
        } else if (field === 'quantity' || field === 'unitPrice') {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                item[field] = numValue;
            }
        }
        newItems[index] = item;
        
        const { subtotal, total } = calculateTotals(newItems, quoteData.discount, quoteData.tax);
        setQuoteData({ ...quoteData, items: newItems, subtotal, total });
    };

    const handleAddItem = () => {
        if (!quoteData) return;
        const newItems = [...quoteData.items, { ...BLANK_QUOTE_ITEM, id: `item-${Date.now()}` }];
        setQuoteData({ ...quoteData, items: newItems });
    };

    const handleRemoveItem = (index: number) => {
        if (!quoteData || quoteData.items.length <= 1) return;
        const newItems = quoteData.items.filter((_, i) => i !== index);
        const { subtotal, total } = calculateTotals(newItems, quoteData.discount, quoteData.tax);
        setQuoteData({ ...quoteData, items: newItems, subtotal, total });
    };
    
    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!quoteData) return;
        const { name, value } = e.target;
        
        const wasAcceptedBefore = quoteData.status === QuoteStatus.ACCEPTED;
        const isNowAccepted = name === 'status' && value === QuoteStatus.ACCEPTED;
        
        const newQuoteData = { ...quoteData, [name]: (name === 'discount' || name === 'tax') ? Number(value) : value };
        const { subtotal, total } = calculateTotals(newQuoteData.items, newQuoteData.discount, newQuoteData.tax);
        setQuoteData({ ...newQuoteData, subtotal, total });

        if (isNowAccepted && !wasAcceptedBefore) {
            openConfirmationModal(
                'إنشاء فاتورة؟',
                'تم قبول عرض السعر. هل تود إنشاء فاتورة تلقائيًا بناءً على هذا العرض؟',
                () => {
                    // We pass the new data, not the old state
                    createInvoiceFromQuote({ ...newQuoteData, subtotal, total });
                },
                'نعم، أنشئ الفاتورة',
                'لاحقاً'
            );
        }
    };

    const handleSave = async () => {
        if (!quoteData) return;
        await saveQuote(quoteData);
        closeQuoteEditor();
    };
    
    if (!quoteData) {
        return <div className="fixed inset-0 bg-[#0D1C3C] flex justify-center items-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00B7C1]"></div></div>;
    }

    return (
        <div className="fixed inset-0 bg-[#0D1C3C] z-30 flex flex-col page-container">
            {/* Header */}
            <header className="bg-[#1A2B4D]/80 backdrop-blur-sm flex-shrink-0 sticky top-0 z-20 border-b border-[#2C3E5F] p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">
                    {quoteData.id ? `تعديل عرض السعر #${quoteData.quoteNumber}` : 'إنشاء عرض سعر جديد'}
                </h1>
                <div className="flex items-center gap-2">
                    <button onClick={handleSave} className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ وإغلاق'}
                    </button>
                    <button onClick={() => generateQuotePDF(quoteData, activeQuote.deal)} className="btn btn-secondary">
                        <DownloadIcon className="w-5 h-5" />
                        <span>تحميل PDF</span>
                    </button>
                    <button onClick={closeQuoteEditor} className="btn btn-secondary !p-2">
                        <ArrowUturnLeftIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto bg-[#1A2B4D] rounded-xl shadow-lg border border-[#2C3E5F] p-8">
                    {/* Top Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 pb-8 border-b border-[#2C3E5F]">
                        <div className="flex items-center gap-4">
                            <img src="https://l.top4top.io/p_356010hdb1.png" alt="Saqqr Logo" className="h-16 w-28 object-cover object-right" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">شركة صقر</h2>
                                <p className="text-sm text-slate-400">للتسويق الرقمي والبرمجة</p>
                            </div>
                        </div>
                        <div className="text-right space-y-2 w-full md:w-auto">
                           <div className="flex items-center justify-end gap-2">
                                <label htmlFor="quoteNumber" className="text-sm font-medium text-slate-300">عرض سعر #</label>
                                <input type="text" id="quoteNumber" readOnly value={quoteData.quoteNumber || 'سيتم إنشاؤه عند الحفظ'} className="bg-[#0D1C3C] border-none rounded-md px-2 py-1 text-sm text-right text-slate-400 w-48"/>
                            </div>
                             <div className="flex items-center justify-end gap-2">
                                <label htmlFor="issueDate" className="text-sm font-medium text-slate-300">تاريخ الإصدار:</label>
                                <input type="date" id="issueDate" name="issueDate" value={quoteData.issueDate} onChange={handleGeneralChange} className="bg-[#2C3E5F] border border-[#3E527B] rounded-md px-2 py-1 text-sm text-right"/>
                            </div>
                             <div className="flex items-center justify-end gap-2">
                                <label htmlFor="expiryDate" className="text-sm font-medium text-slate-300">تاريخ الانتهاء:</label>
                                <input type="date" id="expiryDate" name="expiryDate" value={quoteData.expiryDate} onChange={handleGeneralChange} className="bg-[#2C3E5F] border border-[#3E527B] rounded-md px-2 py-1 text-sm text-right"/>
                            </div>
                             <div className="flex items-center justify-end gap-2">
                                <label htmlFor="status" className="text-sm font-medium text-slate-300">الحالة:</label>
                                <select id="status" name="status" value={quoteData.status} onChange={handleGeneralChange} className="bg-[#2C3E5F] border border-[#3E527B] rounded-md px-2 py-1 text-sm text-right">
                                    <option value={QuoteStatus.DRAFT}>مسودة</option>
                                    <option value={QuoteStatus.SENT}>مرسل</option>
                                    <option value={QuoteStatus.ACCEPTED}>مقبول</option>
                                    <option value={QuoteStatus.REJECTED}>مرفوض</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Client Info */}
                    <div className="py-8">
                        <p className="text-sm font-semibold text-slate-400 mb-2">مقدم إلى:</p>
                        <h3 className="text-xl font-bold text-slate-100">{activeQuote.deal.companyName}</h3>
                        <p className="text-slate-300">{activeQuote.deal.contactPerson}</p>
                        <p className="text-slate-400">{activeQuote.deal.contactEmail}</p>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2 border-[#3E527B]">
                                <tr>
                                    <th className="p-3 text-sm font-semibold text-slate-400 uppercase w-1/2">البند/الوصف</th>
                                    <th className="p-3 text-sm font-semibold text-slate-400 uppercase">الكمية</th>
                                    <th className="p-3 text-sm font-semibold text-slate-400 uppercase">سعر الوحدة</th>
                                    <th className="p-3 text-sm font-semibold text-slate-400 uppercase">الإجمالي</th>
                                    <th className="p-3 w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {quoteData.items.map((item, index) => (
                                    <tr key={item.id} className="border-b border-[#2C3E5F]">
                                        <td className="p-3"><input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="w-full bg-transparent p-1 focus:bg-[#2C3E5F] rounded-md outline-none" placeholder="وصف الخدمة أو المنتج" /></td>
                                        <td className="p-3"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-20 bg-transparent p-1 focus:bg-[#2C3E5F] rounded-md outline-none" min="0" /></td>
                                        <td className="p-3"><input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className="w-28 bg-transparent p-1 focus:bg-[#2C3E5F] rounded-md outline-none" min="0" /></td>
                                        <td className="p-3 font-mono text-slate-200">{new Intl.NumberFormat('ar-SA').format(item.quantity * item.unitPrice)}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed" disabled={quoteData.items.length <= 1}><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={handleAddItem} className="mt-4 btn btn-secondary !py-1 !px-3 text-sm">
                        <PlusIcon className="w-4 h-4" />
                        <span>إضافة بند جديد</span>
                    </button>

                    {/* Totals Section */}
                    <div className="flex justify-end mt-8">
                        <div className="w-full max-w-sm space-y-3">
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-slate-300">المجموع الفرعي:</span>
                                <span className="font-mono font-semibold text-slate-100">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(quoteData.subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">الخصم (مبلغ ثابت):</span>
                                <input type="number" name="discount" value={quoteData.discount} onChange={handleGeneralChange} className="w-28 bg-[#2C3E5F] border border-[#3E527B] rounded-md p-1 text-sm text-right font-mono" />
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-slate-300">الضريبة (%):</span>
                                <input type="number" name="tax" value={quoteData.tax} onChange={handleGeneralChange} className="w-28 bg-[#2C3E5F] border border-[#3E527B] rounded-md p-1 text-sm text-right font-mono" />
                            </div>
                             <div className="flex justify-between items-center text-2xl font-bold pt-3 border-t-2 border-[#3E527B]">
                                <span className="text-white">الإجمالي:</span>
                                <span className="font-mono text-[#00B7C1]">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(quoteData.total)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Terms & Conditions */}
                    <div className="mt-8 pt-8 border-t border-[#2C3E5F]">
                        <label htmlFor="terms" className="block text-sm font-semibold text-slate-300 mb-2">الشروط والأحكام</label>
                        <textarea id="terms" name="terms" value={quoteData.terms} onChange={handleGeneralChange} rows={4} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"></textarea>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default QuoteEditorPage;