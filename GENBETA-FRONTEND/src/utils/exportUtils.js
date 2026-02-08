import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Export data to Excel with a blue theme table format
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Name of the file
 * @param {String} sheetName - Name of the worksheet
 */
export const exportToExcel = async (data, fileName = 'export', sheetName = 'Data') => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Get keys from first object for columns
  const columns = Object.keys(data[0]).map(key => ({
    header: key,
    key: key,
    width: Math.max(key.length + 5, 15)
  }));

  worksheet.columns = columns;

  // Add rows
  worksheet.addRows(data);

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3F51B5' } // Blue color (Indigo 500 equivalent)
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' },
      bold: true,
      size: 12
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add borders and alternating row colors to data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Alternating row background
        if (rowNumber % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' } // Light gray
          };
        }
      });
    }
  });

  // Auto-filter
  worksheet.autoFilter = {
    from: 'A1',
    to: {
      row: 1,
      column: columns.length
    }
  };

  // Generate and save file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export a DOM element to PDF (A4 size)
 * @param {HTMLElement} element - The element to capture
 * @param {String} fileName - Name of the file
 */
export const exportElementToPDF = async (element, fileName = 'document') => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;
    
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
  }
};

/**
 * Export data to PDF as a table
 * @param {Array} headers - Table headers
 * @param {Array} body - Table body data
 * @param {String} fileName - Name of the file
 * @param {String} title - Table title
 */
export const exportTableToPDF = (headers, body, fileName = 'export', title = 'Data Export') => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    
    doc.autoTable({
      head: [headers],
      body: body,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { overflow: 'linebreak', cellWidth: 'auto' },
      columnStyles: { text: { cellWidth: 'auto' } }
    });
    
    doc.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error exporting Table PDF:', error);
  }
};
