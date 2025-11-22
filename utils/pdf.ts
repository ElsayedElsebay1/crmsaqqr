import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { amiriFont } from '../assets/Amiri-Regular-Base64';

// Helper function to reverse strings for RTL display in jspdf
// Note: jspdf-autotable handles RTL well with the 'Amiri' font, but this is useful for manual text placement like titles.
function processArabic(text: string): string {
    return text.split(' ').reverse().join(' ');
}

/**
 * Generates a PDF file from table data and triggers a download.
 * @param title The title of the document.
 * @param headers An array of strings for the table headers.
 * @param data A 2D array of strings for the table body.
 * @param filename The name of the file to be downloaded.
 */
export function downloadPDF(title: string, headers: string[], data: (string | number)[][], filename: string) {
    if (!data || data.length === 0) {
        console.error("No data provided to export to PDF.");
        alert("لا توجد بيانات للتصدير.");
        return;
    }
    
    // Initialize jsPDF. 'p' for portrait, 'mm' for millimeters, 'a4' for page size.
    const doc = new jsPDF('p', 'mm', 'a4');

    // 1. Add the Amiri font that supports Arabic
    // The font is provided as a base64 encoded string.
    doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.setFont("Amiri");

    // 2. Add the title to the document
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(20);
    // Center the title. jspdf's text alignment requires manual calculation for RTL.
    doc.text(processArabic(title), pageWidth / 2, 15, { align: 'center' });
    
    // 3. Use autoTable to generate the table from data
    autoTable(doc, {
        head: [headers.reverse()], // Reverse headers for RTL
        body: data.map(row => row.reverse()), // Reverse each row for RTL
        startY: 25,
        styles: {
            font: "Amiri", // Use the loaded Arabic font
            halign: 'right', // Align text to the right for Arabic
            fontSize: 10,
        },
        headStyles: {
            fillColor: [30, 41, 59], // slate-800
            textColor: [241, 245, 249], // slate-100
            halign: 'center', // Center align header text
        },
        alternateRowStyles: {
            fillColor: [51, 65, 85] // slate-700
        },
        tableLineColor: [71, 85, 105], // slate-600
        tableLineWidth: 0.1,
    });
    
    // 4. Save the PDF
    doc.save(filename);
}