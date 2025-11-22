// A simple utility to convert an array of objects to a CSV string and trigger a download.

function convertToCSV(data: any[]): string {
    if (data.length === 0) {
        return '';
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            let cell = row[header] === null || row[header] === undefined ? '' : row[header];
            
            // If the cell data is an array, join it with a semicolon
            if (Array.isArray(cell)) {
                cell = cell.join('; ');
            }

            const stringCell = String(cell);
            
            // Escape double quotes and wrap in double quotes if the cell contains a comma, a double quote, or a newline
            if (stringCell.includes('"') || stringCell.includes(',') || stringCell.includes('\n')) {
                return `"${stringCell.replace(/"/g, '""')}"`;
            }
            return stringCell;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

/**
 * Generates a CSV file from an array of objects and triggers a download.
 * @param filename The name of the file to be downloaded (e.g., 'data.csv').
 * @param data The array of objects to be converted to CSV.
 */
export function downloadCSV(filename: string, data: any[]) {
    if (!data || data.length === 0) {
        console.error("No data provided to export.");
        alert("لا توجد بيانات للتصدير.");
        return;
    }

    const csvString = convertToCSV(data);
    // \uFEFF is the Byte Order Mark (BOM) for UTF-8, which helps Excel open the file with correct Arabic characters.
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) { // Check for browser support
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
