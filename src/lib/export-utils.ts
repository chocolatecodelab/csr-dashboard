/**
 * Export Utilities - PDF, Excel, CSV Export Functions
 * Handles data export with custom templates and formatting
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// =====================================================
// CSV EXPORT
// =====================================================

export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  // Convert data to CSV format
  const csvContent = convertToCSV(data, headers);
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${filename}.csv`);
}

function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return '';
  
  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV rows
  const rows = data.map(item => {
    return csvHeaders.map(header => {
      const value = item[header];
      // Handle values with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });
  
  // Combine headers and rows
  return [csvHeaders.join(','), ...rows].join('\n');
}

// =====================================================
// EXCEL EXPORT
// =====================================================

export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Auto-size columns
  const maxWidth = 50;
  const colWidths: { wch: number }[] = [];
  
  if (data.length > 0) {
    Object.keys(data[0]).forEach((key, i) => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      );
      colWidths[i] = { wch: Math.min(maxLength + 2, maxWidth) };
    });
    worksheet['!cols'] = colWidths;
  }
  
  // Write file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportMultiSheetExcel(
  sheets: { name: string; data: any[] }[],
  filename: string
) {
  const workbook = XLSX.utils.book_new();
  
  sheets.forEach(({ name, data }) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Auto-size columns
    if (data.length > 0) {
      const colWidths: { wch: number }[] = [];
      Object.keys(data[0]).forEach((key, i) => {
        const maxLength = Math.max(
          key.length,
          ...data.map(row => String(row[key] || '').length)
        );
        colWidths[i] = { wch: Math.min(maxLength + 2, 50) };
      });
      worksheet['!cols'] = colWidths;
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  });
  
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// =====================================================
// PDF EXPORT
// =====================================================

export function exportToPDF(
  title: string,
  data: any[],
  columns: { header: string; dataKey: string }[],
  filename: string,
  options?: {
    orientation?: 'portrait' | 'landscape';
    metadata?: Record<string, string>;
    footer?: string;
  }
) {
  const doc = new jsPDF({
    orientation: options?.orientation || 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Add metadata
  if (options?.metadata) {
    Object.entries(options.metadata).forEach(([key, value]) => {
      doc.setProperties({ [key]: value });
    });
  }
  
  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 20);
  
  // Add generation date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Generated: ${dateStr}`, 14, 28);
  
  // Add table
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map(item => columns.map(col => item[col.dataKey] ?? '-')),
    startY: 35,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { top: 35, right: 14, bottom: 20, left: 14 },
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    
    if (options?.footer) {
      doc.text(options.footer, 14, doc.internal.pageSize.height - 10);
    }
    
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Save PDF
  doc.save(`${filename}.pdf`);
}

export function exportReportToPDF(
  report: any,
  filename: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  let yPos = 20;
  
  // ===== COVER PAGE =====
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, doc.internal.pageSize.width, 80, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(report.title, doc.internal.pageSize.width / 2, 40, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(report.type.toUpperCase(), doc.internal.pageSize.width / 2, 50, { align: 'center' });
  doc.text(`Periode: ${report.period}`, doc.internal.pageSize.width / 2, 58, { align: 'center' });
  
  // Status badge
  doc.setFontSize(12);
  const statusColors: Record<string, [number, number, number]> = {
    draft: [156, 163, 175],
    review: [59, 130, 246],
    approved: [34, 197, 94],
    published: [168, 85, 247],
  };
  const color = statusColors[report.status] || [156, 163, 175];
  doc.setFillColor(...color);
  doc.roundedRect(doc.internal.pageSize.width / 2 - 20, 65, 40, 8, 2, 2, 'F');
  doc.text(report.status.toUpperCase(), doc.internal.pageSize.width / 2, 70, { align: 'center' });
  
  // Reset colors
  doc.setTextColor(0, 0, 0);
  yPos = 100;
  
  // ===== EXECUTIVE SUMMARY =====
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 14, yPos);
  yPos += 10;
  
  const content = JSON.parse(report.content);
  const metrics = content.summary?.keyMetrics;
  
  if (metrics) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Metrics grid
    const metricsData = [
      ['Total Anggaran', formatCurrency(metrics.totalBudget)],
      ['Realisasi Anggaran', `${metrics.budgetPercentage.toFixed(1)}%`],
      ['Total Program', metrics.totalPrograms],
      ['Program Aktif', metrics.activePrograms],
      ['Total Kegiatan', metrics.totalActivities],
      ['Kegiatan Selesai', metrics.completedActivities],
      ['Penerima Manfaat', metrics.totalBeneficiaries.toLocaleString('id-ID')],
      ['Tingkat Kepuasan', `${metrics.averageSatisfaction}%`],
    ];
    
    autoTable(doc, {
      body: metricsData,
      startY: yPos,
      theme: 'grid',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 70 },
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // ===== PROGRAMS SECTION =====
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Program Details', 14, yPos);
  yPos += 10;
  
  if (content.programs?.list && content.programs.list.length > 0) {
    const programsData = content.programs.list.map((p: any) => [
      p.name,
      p.department || '-',
      p.status,
      formatCurrency(p.budget),
      `${p.progress || 0}%`,
    ]);
    
    autoTable(doc, {
      head: [['Program', 'Departemen', 'Status', 'Anggaran', 'Progress']],
      body: programsData,
      startY: yPos,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'center' },
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // ===== ACTIVITIES SECTION =====
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Activity Summary', 14, yPos);
  yPos += 10;
  
  if (content.activities?.list && content.activities.list.length > 0) {
    const activitiesData = content.activities.list.slice(0, 20).map((a: any) => [
      a.name,
      a.type,
      a.status,
      a.participants || 0,
    ]);
    
    autoTable(doc, {
      head: [['Kegiatan', 'Tipe', 'Status', 'Peserta']],
      body: activitiesData,
      startY: yPos,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        3: { halign: 'center' },
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // ===== IMPACT ANALYSIS =====
  if (content.impact) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Impact Analysis', 14, yPos);
    yPos += 10;
    
    const impactData = [
      ['Social Impact', `${content.impact.social.toFixed(1)}%`],
      ['Environmental Impact', `${content.impact.environmental.toFixed(1)}%`],
      ['Economic Impact', `${content.impact.economic.toFixed(1)}%`],
      ['Overall Impact Score', `${content.impact.overall.toFixed(1)}%`],
    ];
    
    autoTable(doc, {
      body: impactData,
      startY: yPos,
      theme: 'grid',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 50, halign: 'right' },
      },
    });
  }
  
  // ===== FOOTER =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    
    const footer = `${report.department?.name || 'CSR Dashboard'} - Generated on ${new Date().toLocaleDateString('id-ID')}`;
    doc.text(footer, 14, doc.internal.pageSize.height - 10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
  }
  
  doc.save(`${filename}.pdf`);
}

// =====================================================
// ANALYTICS EXPORT
// =====================================================

export function exportAnalyticsToPDF(
  analyticsData: any,
  period: string,
  filename: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });
  
  let yPos = 20;
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CSR Analytics Report', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${period}`, 14, yPos);
  yPos += 10;
  
  // Overview Metrics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Overview', 14, yPos);
  yPos += 8;
  
  const overview = analyticsData.overview;
  const overviewData = [
    ['Total Anggaran', formatCurrency(overview.totalBudget), `${overview.budgetGrowth >= 0 ? '+' : ''}${overview.budgetGrowth.toFixed(1)}%`],
    ['Anggaran Terpakai', formatCurrency(overview.budgetUsed), '-'],
    ['Total Program', overview.totalPrograms, `+${overview.programGrowth}%`],
    ['Total Kegiatan', overview.totalActivities, `+${overview.activityGrowth}%`],
    ['Penerima Manfaat', overview.totalBeneficiaries.toLocaleString('id-ID'), `+${overview.beneficiaryGrowth}%`],
  ];
  
  autoTable(doc, {
    body: overviewData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 70 },
      2: { cellWidth: 40, halign: 'right' },
    },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Program Distribution
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Program Distribution', 14, yPos);
  yPos += 8;
  
  const programData = analyticsData.programDistribution.map((p: any) => [
    p.name,
    p.count,
    formatCurrency(p.budget),
  ]);
  
  autoTable(doc, {
    head: [['Kategori', 'Jumlah Program', 'Total Anggaran']],
    body: programData,
    startY: yPos,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
    },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Top Programs
  if (yPos > 150) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Performing Programs', 14, yPos);
  yPos += 8;
  
  const topProgramsData = analyticsData.topPrograms.map((p: any) => [
    p.name,
    `${p.completion}%`,
    formatCurrency(p.budget),
    `${p.impact}/100`,
  ]);
  
  autoTable(doc, {
    head: [['Program', 'Completion', 'Budget', 'Impact Score']],
    body: topProgramsData,
    startY: yPos,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center' },
    },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Generated on ${new Date().toLocaleDateString('id-ID')}`,
      14,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
  }
  
  doc.save(`${filename}.pdf`);
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function downloadFile(blob: Blob, filename: string) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
