import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { amiriFont } from '../assets/Amiri-Regular-Base64';
import { Quote, Deal } from '../types';

// Helper to process Arabic text for jspdf (though autoTable handles it well with the right font)
function processArabic(text: string): string {
    return text.split(' ').reverse().join(' ');
}

export function generateQuotePDF(quote: Quote, deal: Deal) {
    const doc = new jsPDF('p', 'mm', 'a4');

    // 1. Add Amiri font for Arabic support
    doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.setFont("Amiri");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // --- Header ---
    const logoUrl = 'https://l.top4top.io/p_356010hdb1.png'; // Saqqr logo URL
    // Note: To use images from external URLs in jsPDF, they must be converted to a data URL, often via a canvas.
    // This is an advanced topic. For simplicity, we'll place text where the logo would go. If the image was local and base64, it would be easier.
    // doc.addImage(logoUrl, 'PNG', margin, 10, 40, 15);
    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42); // slate-900 (for contrast on white)
    doc.text(processArabic("شركة صقر"), margin, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(processArabic("للتسويق الرقمي والبرمجة"), margin, 26);
    
    doc.setFontSize(28);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(processArabic("عرض سعر"), pageWidth - margin, 25, { align: 'right' });


    // --- Quote Details ---
    const quoteDetailsY = 40;
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(processArabic(`رقم العرض: ${quote.quoteNumber}`), pageWidth - margin, quoteDetailsY, { align: 'right' });
    doc.text(processArabic(`تاريخ الإصدار: ${quote.issueDate}`), pageWidth - margin, quoteDetailsY + 6, { align: 'right' });
    doc.text(processArabic(`صالح حتى: ${quote.expiryDate}`), pageWidth - margin, quoteDetailsY + 12, { align: 'right' });

    // --- Client Info ---
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(processArabic("مقدم إلى:"), margin, quoteDetailsY);
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(processArabic(deal.companyName), margin, quoteDetailsY + 6);
    doc.text(processArabic(deal.contactPerson), margin, quoteDetailsY + 12);
    if(deal.contactEmail) doc.text(deal.contactEmail, margin, quoteDetailsY + 18, { align: 'left' });


    // --- Items Table ---
    const tableHeaders = ['الإجمالي', 'سعر الوحدة', 'الكمية', 'البند/الوصف'].reverse();
    const tableBody = quote.items.map(item => [
        (item.quantity * item.unitPrice).toLocaleString('ar-SA'),
        item.unitPrice.toLocaleString('ar-SA'),
        item.quantity.toLocaleString('ar-SA'),
        processArabic(item.description)
    ]).map(row => row.reverse());

    autoTable(doc, {
        head: [tableHeaders],
        body: tableBody,
        startY: quoteDetailsY + 28,
        theme: 'grid',
        styles: {
            font: "Amiri",
            halign: 'right',
            cellPadding: 2.5,
            fontSize: 10
        },
        headStyles: {
            fillColor: [30, 41, 59],
            textColor: 255,
            halign: 'center'
        },
        columnStyles: {
            0: { halign: 'right', cellWidth: 90 },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' },
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // --- Totals Section ---
    const totalsX = pageWidth / 2;
    const totalsY = finalY + 10;
    doc.setFontSize(11);

    const totals = [
        ["المجموع الفرعي:", `${quote.subtotal.toLocaleString('ar-SA')} SAR`],
        ["الخصم:", `${quote.discount.toLocaleString('ar-SA')} SAR`],
        [`الضريبة (${quote.tax}%):`, `${((quote.subtotal - quote.discount) * (quote.tax / 100)).toLocaleString('ar-SA')} SAR`],
    ];

    totals.forEach((row, i) => {
        doc.setTextColor(30, 41, 59);
        doc.text(processArabic(row[0]), pageWidth - margin, totalsY + (i * 7), { align: 'right' });
        doc.setTextColor(100, 116, 139);
        doc.text(row[1], totalsX, totalsY + (i * 7), { align: 'right' });
    });
    
    const grandTotalY = totalsY + (totals.length * 7);
    doc.setDrawColor(30, 41, 59);
    doc.line(totalsX - 10, grandTotalY, pageWidth - margin, grandTotalY);

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text(processArabic("الإجمالي:"), pageWidth - margin, grandTotalY + 8, { align: 'right' });
    doc.text(`${quote.total.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}`, totalsX, grandTotalY + 8, { align: 'right' });

    // --- Terms & Footer ---
    const termsY = grandTotalY + 20;
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(processArabic("الشروط والأحكام"), margin, termsY);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const termsLines = doc.splitTextToSize(processArabic(quote.terms), pageWidth - (margin * 2));
    doc.text(termsLines, margin, termsY + 6);
    
    // Footer line
    doc.setDrawColor(200);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    doc.setFontSize(8);
    doc.text(processArabic("شكراً لثقتكم بنا."), pageWidth / 2, pageHeight - 10, { align: 'center' });


    doc.save(`${quote.quoteNumber}_${deal.companyName}.pdf`);
}