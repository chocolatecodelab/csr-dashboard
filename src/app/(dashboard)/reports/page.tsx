'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { DataTable, Column } from '@/components/shared/DataTable';
import { CrudForm } from '@/components/shared/CrudForm';
import { useCrud } from '@/hooks/useCrud';
import { useFormHandlers } from '@/hooks/useFormHandlers';
import { createCrudActions } from '@/components/shared/CrudAction';
import { 
  FileText, TrendingUp, Download, Eye, CheckCircle, Clock, 
  AlertCircle, Send, FileBarChart, Calendar, Filter, Plus,
  BarChart3, PieChart, LineChart, Sparkles, FileSpreadsheet, FileDown
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportReportToPDF } from '@/lib/export-utils';

export const dynamic = 'force-dynamic';

interface Report {
  id: string;
  title: string;
  name: string; // Alias for title to satisfy useFormHandlers constraint
  description?: string;
  type: string;
  status: string;
  period: string;
  programId?: string;
  departmentId?: string;
  template?: string;
  version: number;
  viewCount: number;
  downloadCount: number;
  submittedAt?: string;
  approvedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  program?: { name: string };
  department?: { name: string };
  metrics_records?: any[];
}

export default function ReportsPage() {
  const {
    data: reports = [],
    pagination,
    loading: isLoading,
    error,
    setPage,
    setFilters,
    setSort,
    setSearch,
    deleteItem,
    refetch: refreshData,
  } = useCrud<Report>({
    endpoint: '/api/reports',
  });

  const {
    showForm: isFormOpen,
    editingItem: editingReport,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    closeForm,
  } = useFormHandlers<Report>({
    endpoint: '/api/reports',
    entityName: 'Report',
    refetch: refreshData,
  });

  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPeriod, setFilterPeriod] = useState<string>('');
  const [programs, setPrograms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [reportTemplates] = useState([
    { value: 'executive', label: 'Executive Summary' },
    { value: 'detailed', label: 'Detailed Report' },
    { value: 'financial', label: 'Financial Analysis' },
    { value: 'impact', label: 'Impact Assessment' },
    { value: 'quarterly', label: 'Quarterly Review' },
    { value: 'annual', label: 'Annual Report' },
  ]);

  useEffect(() => {
    Promise.all([
      fetch('/api/master/programs').then((res) => res.json()),
      fetch('/api/master/departments').then((res) => res.json()),
    ])
      .then(([programsData, departmentsData]) => {
        setPrograms(programsData.data || []);
        setDepartments(departmentsData.data || []);
      })
      .catch((error) => console.error('Error loading master data:', error));
  }, []);

  // Create actions using the reusable function
  const actions = createCrudActions<Report>({
    onEdit: handleEdit,
    onDelete: (report) => handleDelete(report, deleteItem),
  });

  // Export functions
  const handleExportCSV = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/export?format=csv`);
      const result = await response.json();
      if (result.success && result.data) {
        const report = reports.find(r => r.id === reportId);
        exportToCSV(
          result.data.programs || [],
          `${report?.title || 'report'}-programs`,
          ['name', 'department', 'status', 'budget', 'progress']
        );
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const handleExportExcel = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/export?format=excel`);
      const result = await response.json();
      if (result.success && result.data?.sheets) {
        const report = reports.find(r => r.id === reportId);
        exportToExcel(
          result.data.sheets[0].data,
          `${report?.title || 'report'}`,
          'Report Data'
        );
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  const handleExportPDF = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      const result = await response.json();
      if (result.success && result.data) {
        exportReportToPDF(result.data, result.data.title || 'report');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const reportTypes = [
    { value: 'program', label: 'Laporan Program', icon: FileBarChart },
    { value: 'quarterly', label: 'Laporan Kuartalan', icon: Calendar },
    { value: 'annual', label: 'Laporan Tahunan', icon: TrendingUp },
    { value: 'impact', label: 'Laporan Dampak', icon: Sparkles },
    { value: 'financial', label: 'Laporan Keuangan', icon: BarChart3 },
    { value: 'custom', label: 'Laporan Custom', icon: FileText },
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'review', label: 'Review', color: 'blue' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'published', label: 'Published', color: 'purple' },
  ];

  const periodOptions = [
    { value: 'Q1-2024', label: 'Q1 2024' },
    { value: 'Q2-2024', label: 'Q2 2024' },
    { value: 'Q3-2024', label: 'Q3 2024' },
    { value: 'Q4-2024', label: 'Q4 2024' },
    { value: '2024', label: 'Tahun 2024' },
    { value: 'Q1-2025', label: 'Q1 2025' },
    { value: 'Q2-2025', label: 'Q2 2025' },
    { value: '2025', label: 'Tahun 2025' },
  ];

  const formFields = [
    {
      name: 'title',
      label: 'Judul Laporan',
      type: 'text' as const,
      required: true,
      placeholder: 'Masukkan judul laporan',
    },
    {
      name: 'description',
      label: 'Deskripsi',
      type: 'textarea' as const,
      placeholder: 'Deskripsi laporan (opsional)',
    },
    {
      name: 'type',
      label: 'Jenis Laporan',
      type: 'select' as const,
      required: true,
      options: reportTypes.map(t => ({ value: t.value, label: t.label })),
    },
    {
      name: 'template',
      label: 'Template',
      type: 'select' as const,
      options: reportTemplates,
    },
    {
      name: 'period',
      label: 'Periode',
      type: 'select' as const,
      required: true,
      options: periodOptions,
    },
    {
      name: 'programId',
      label: 'Program',
      type: 'select' as const,
      options: programs.map((p) => ({ value: p.id, label: p.name })),
    },
    {
      name: 'departmentId',
      label: 'Departemen',
      type: 'select' as const,
      options: departments.map((d) => ({ value: d.id, label: d.name })),
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      options: statusOptions.map(s => ({ value: s.value, label: s.label })),
    },
  ];

  const columns: Column<Report>[] = [
    {
      key: 'title',
      header: 'Judul Laporan',
      sortable: true,
      render: (report: Report) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {report.title}
          </div>
          {report.description && (
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
              {report.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Jenis',
      sortable: true,
      render: (report: Report) => {
        const typeInfo = reportTypes.find(t => t.value === report.type);
        const Icon = typeInfo?.icon || FileText;
        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{typeInfo?.label || report.type}</span>
          </div>
        );
      },
    },
    {
      key: 'period',
      header: 'Periode',
      sortable: true,
      render: (report: Report) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <Calendar className="w-3 h-3" />
          {report.period}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (report: Report) => {
        const statusInfo = statusOptions.find(s => s.value === report.status);
        const colors = {
          gray: 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
          blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        };
        const colorClass = colors[statusInfo?.color as keyof typeof colors] || colors.gray;
        const icons = {
          draft: Clock,
          review: AlertCircle,
          approved: CheckCircle,
          published: Send,
        };
        const Icon = icons[report.status as keyof typeof icons] || Clock;
        
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            <Icon className="w-3 h-3" />
            {statusInfo?.label || report.status}
          </span>
        );
      },
    },
    {
      key: 'program',
      header: 'Program',
      render: (report: Report) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {report.program?.name || '-'}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Departemen',
      render: (report: Report) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {report.department?.name || '-'}
        </span>
      ),
    },
    {
      key: 'engagement',
      header: 'Engagement',
      render: (report: Report) => (
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {report.viewCount}
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5" />
            {report.downloadCount}
          </div>
        </div>
      ),
    },
    {
      key: 'export',
      header: 'Export',
      render: (report: Report) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleExportPDF(report.id); }}
            className="rounded p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Export PDF"
          >
            <FileText className="w-4 h-4 text-red-600" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleExportExcel(report.id); }}
            className="rounded p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Export Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleExportCSV(report.id); }}
            className="rounded p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Export CSV"
          >
            <FileDown className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      ),
    },
    {
      key: 'version',
      header: 'Versi',
      render: (report: Report) => (
        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
          v{report.version}
        </span>
      ),
    },
  ];

  const filters = (
    <div className="flex flex-wrap gap-3">
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
      >
        <option value="">Semua Jenis</option>
        {reportTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
      >
        <option value="">Semua Status</option>
        {statusOptions.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      <select
        value={filterPeriod}
        onChange={(e) => setFilterPeriod(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
      >
        <option value="">Semua Periode</option>
        {periodOptions.map((period) => (
          <option key={period.value} value={period.value}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <>
      <Breadcrumb pageName="Laporan Program" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Laporan Program
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Kelola dan generate laporan CSR dengan berbagai template
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Buat Laporan Baru
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Laporan</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {pagination.totalItems}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-900/30">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {reports.filter(r => r.status === 'published').length}
              </p>
            </div>
            <div className="rounded-full bg-purple-50 p-3 dark:bg-purple-900/30">
              <Send className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dalam Review</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {reports.filter(r => r.status === 'review').length}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-900/30">
              <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Draft</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {reports.filter(r => r.status === 'draft').length}
              </p>
            </div>
            <div className="rounded-full bg-gray-50 p-3 dark:bg-gray-900/30">
              <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <DataTable<Report>
        title="Daftar Laporan CSR"
        description="Kelola dan pantau semua laporan Corporate Social Responsibility"
        data={reports}
        columns={columns}
        actions={actions}
        pagination={pagination}
        loading={isLoading}
        searchPlaceholder="Cari laporan..."
        emptyMessage="Belum ada laporan. Mulai dengan membuat laporan baru."
        onPageChange={setPage}
        onSort={setSort}
        onSearch={setSearch}
        createButton={{
          label: "Buat Laporan Baru",
          onClick: handleCreate,
        }}
      />

      {isFormOpen && (
        <CrudForm
          title={editingReport ? 'Edit Laporan' : 'Buat Laporan Baru'}
          fields={formFields}
          initialData={editingReport || undefined}
          onSubmit={handleFormSubmit}
          onClose={closeForm}
          isLoading={false}
        />
      )}
    </>
  );
}
