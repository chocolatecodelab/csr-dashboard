'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import {
  TrendingUp, TrendingDown, DollarSign, Target, Users, Activity,
  Calendar, Filter, Download, RefreshCw, BarChart3, PieChart,
  LineChart, ArrowUpRight, ArrowDownRight, Sparkles, Award,
  CheckCircle, Clock, AlertTriangle, FileText, FileSpreadsheet
} from 'lucide-react';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import { exportToCSV, exportToExcel, exportAnalyticsToPDF } from '@/lib/export-utils';

// Dynamically import charts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
});

interface AnalyticsData {
  overview: {
    totalBudget: number;
    budgetUsed: number;
    budgetGrowth: number;
    totalPrograms: number;
    programGrowth: number;
    totalActivities: number;
    activityGrowth: number;
    totalBeneficiaries: number;
    beneficiaryGrowth: number;
  };
  budgetTrend: Array<{ period: string; planned: number; realized: number }>;
  programDistribution: Array<{ name: string; count: number; budget: number }>;
  activityStatus: Array<{ status: string; count: number }>;
  departmentPerformance: Array<{ name: string; completion: number; budget: number }>;
  monthlyImpact: Array<{ month: string; social: number; economic: number; environmental: number }>;
  topPrograms: Array<{ name: string; completion: number; budget: number; impact: number }>;
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<string>('2024');
  const [compareMode, setCompareMode] = useState(false);
  const [comparePeriod, setComparePeriod] = useState<string>('2023');

  useEffect(() => {
    loadAnalyticsData();
  }, [period]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics?period=${period}`);
      const result = await response.json();
      
      // Check if data exists and has valid structure
      if (result.success && result.data) {
        setAnalyticsData(result.data);
      } else {
        console.warn('No data available, using mock data as fallback');
        setAnalyticsData(null); // Will fall back to mockData
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setAnalyticsData(null); // Will fall back to mockData
    } finally {
      setIsLoading(false);
    }
  };

  // Export functions
  const handleExportPDF = async () => {
    if (!analyticsData) return;
    exportAnalyticsToPDF(analyticsData, period, `analytics-${period}`);
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(`/api/analytics/export?period=${period}&format=excel`);
      const result = await response.json();
      if (result.success && result.data?.sheets) {
        const { exportMultiSheetExcel } = await import('@/lib/export-utils');
        exportMultiSheetExcel(result.data.sheets, `analytics-${period}`);
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  const handleExportCSV = async () => {
    if (!analyticsData || !analyticsData.overview) return;
    const csvData = [
      {
        Period: period,
        'Total Budget': analyticsData.overview.totalBudget,
        'Budget Used': analyticsData.overview.budgetUsed,
        'Total Programs': analyticsData.overview.totalPrograms,
        'Total Activities': analyticsData.overview.totalActivities,
        'Total Beneficiaries': analyticsData.overview.totalBeneficiaries,
      },
    ];
    exportToCSV(csvData, `analytics-overview-${period}`);
  };

  const periodOptions = [
    { value: 'Q1-2024', label: 'Q1 2024' },
    { value: 'Q2-2024', label: 'Q2 2024' },
    { value: 'Q3-2024', label: 'Q3 2024' },
    { value: 'Q4-2024', label: 'Q4 2024' },
    { value: '2024', label: 'Tahun 2024' },
    { value: '2023', label: 'Tahun 2023' },
    { value: '2025', label: 'Tahun 2025' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  // Mock data for demo (akan diganti dengan real data dari API)
  const mockData: AnalyticsData = {
    overview: {
      totalBudget: 5000000000,
      budgetUsed: 3750000000,
      budgetGrowth: 15.5,
      totalPrograms: 12,
      programGrowth: 20,
      totalActivities: 48,
      activityGrowth: 12.5,
      totalBeneficiaries: 15420,
      beneficiaryGrowth: 28.3,
    },
    budgetTrend: [
      { period: 'Jan', planned: 400000000, realized: 350000000 },
      { period: 'Feb', planned: 420000000, realized: 390000000 },
      { period: 'Mar', planned: 450000000, realized: 410000000 },
      { period: 'Apr', planned: 480000000, realized: 440000000 },
      { period: 'May', planned: 500000000, realized: 470000000 },
      { period: 'Jun', planned: 520000000, realized: 490000000 },
    ],
    programDistribution: [
      { name: 'Pendidikan', count: 5, budget: 1500000000 },
      { name: 'Kesehatan', count: 3, budget: 1200000000 },
      { name: 'Lingkungan', count: 2, budget: 800000000 },
      { name: 'Ekonomi', count: 2, budget: 500000000 },
    ],
    activityStatus: [
      { status: 'Completed', count: 28 },
      { status: 'Ongoing', count: 15 },
      { status: 'Planned', count: 5 },
    ],
    departmentPerformance: [
      { name: 'CSR Program', completion: 85, budget: 2000000000 },
      { name: 'Community Dev', completion: 78, budget: 1500000000 },
      { name: 'Sustainability', completion: 92, budget: 1000000000 },
    ],
    monthlyImpact: [
      { month: 'Jan', social: 75, economic: 60, environmental: 80 },
      { month: 'Feb', social: 78, economic: 65, environmental: 82 },
      { month: 'Mar', social: 82, economic: 70, environmental: 85 },
      { month: 'Apr', social: 85, economic: 75, environmental: 88 },
      { month: 'May', social: 88, economic: 78, environmental: 90 },
      { month: 'Jun', social: 92, economic: 82, environmental: 92 },
    ],
    topPrograms: [
      { name: 'Beasiswa Pendidikan', completion: 95, budget: 500000000, impact: 92 },
      { name: 'Pelayanan Kesehatan', completion: 88, budget: 600000000, impact: 88 },
      { name: 'Penghijauan Kota', completion: 92, budget: 400000000, impact: 90 },
      { name: 'UMKM Empowerment', completion: 78, budget: 350000000, impact: 85 },
    ],
  };

  const data = analyticsData || mockData;
  const topProgramsData = (data.topPrograms && data.topPrograms.length > 0 && data.topPrograms[0].name !== 'No Data') 
    ? data.topPrograms 
    : mockData.topPrograms;
  
  // Ensure overview exists with default values
  const overview = (data && data.overview) ? data.overview : mockData.overview;

  // Chart configurations
  const budgetTrendOptions: ApexOptions = {
    chart: {
      type: 'area',
      fontFamily: 'Satoshi, sans-serif',
      height: 310,
      toolbar: { 
        show: false 
      },
    },
    colors: ['#5750F1', '#0FADCF'],
    dataLabels: { 
      enabled: false 
    },
    stroke: { 
      curve: 'smooth', 
      width: 2 
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    xaxis: {
      categories: (data.budgetTrend && data.budgetTrend.length > 0)
        ? data.budgetTrend.map(d => d.period)
        : mockData.budgetTrend.map(d => d.period),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: { 
        style: { 
          colors: '#9CA3AF',
          fontSize: '12px',
        } 
      },
    },
    yaxis: {
      labels: {
        style: { 
          colors: '#9CA3AF',
          fontSize: '12px',
        },
        formatter: (val: number) => {
          if (val >= 1000000000) {
            return (val / 1000000000).toFixed(1) + 'M';
          } else if (val >= 1000000) {
            return (val / 1000000).toFixed(0) + 'jt';
          }
          return val.toString();
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => formatCurrency(val),
      },
    },
    legend: { 
      show: true, 
      position: 'top',
      horizontalAlign: 'left',
      fontFamily: 'Satoshi, sans-serif',
    },
    grid: { 
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  };

  const budgetTrendSeries = [
    { 
      name: 'Anggaran Direncanakan', 
      data: (data.budgetTrend && data.budgetTrend.length > 0)
        ? data.budgetTrend.map(d => d.planned) 
        : mockData.budgetTrend.map(d => d.planned)
    },
    { 
      name: 'Realisasi', 
      data: (data.budgetTrend && data.budgetTrend.length > 0)
        ? data.budgetTrend.map(d => d.realized) 
        : mockData.budgetTrend.map(d => d.realized)
    },
  ];

  const programDistributionOptions: ApexOptions = {
    chart: { 
      type: 'donut',
      fontFamily: 'Satoshi, sans-serif',
    },
    labels: (data.programDistribution && data.programDistribution.length > 0)
      ? data.programDistribution.map(d => d.name)
      : mockData.programDistribution.map(d => d.name),
    colors: ['#5750F1', '#0FADCF', '#F59E0B', '#EF4444'],
    legend: { 
      position: 'bottom',
      fontFamily: 'Satoshi, sans-serif',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          background: 'transparent',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Program',
              fontSize: '16px',
              fontWeight: 600,
              formatter: () => {
                const total = (data.programDistribution && data.programDistribution.length > 0)
                  ? data.programDistribution.reduce((sum, d) => sum + d.count, 0)
                  : mockData.programDistribution.reduce((sum, d) => sum + d.count, 0);
                return total.toString();
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  const programDistributionSeries = (data.programDistribution && data.programDistribution.length > 0)
    ? data.programDistribution.map(d => d.count)
    : mockData.programDistribution.map(d => d.count);

  const activityStatusOptions: ApexOptions = {
    chart: { 
      type: 'pie',
      fontFamily: 'Satoshi, sans-serif',
    },
    labels: (data.activityStatus && data.activityStatus.length > 0)
      ? data.activityStatus.map(d => d.status)
      : mockData.activityStatus.map(d => d.status),
    colors: ['#10B981', '#5750F1', '#F59E0B'],
    legend: { 
      position: 'bottom',
      fontFamily: 'Satoshi, sans-serif',
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number, opts: any) => `${opts.w.globals.series[opts.seriesIndex]}`,
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  const activityStatusSeries = (data.activityStatus && data.activityStatus.length > 0)
    ? data.activityStatus.map(d => d.count)
    : mockData.activityStatus.map(d => d.count);

  const impactRadarOptions: ApexOptions = {
    chart: { 
      type: 'radar',
      fontFamily: 'Satoshi, sans-serif',
      toolbar: { show: false },
      dropShadow: {
        enabled: true,
        blur: 1,
        left: 1,
        top: 1,
      },
    },
    xaxis: {
      categories: (data.monthlyImpact && data.monthlyImpact.length > 0)
        ? data.monthlyImpact.map(d => d.month)
        : mockData.monthlyImpact.map(d => d.month),
    },
    yaxis: { 
      show: false,
      max: 100,
    },
    colors: ['#5750F1', '#0FADCF', '#F59E0B'],
    stroke: { 
      width: 2,
    },
    fill: { 
      opacity: 0.2,
    },
    markers: { 
      size: 4,
      hover: {
        size: 6,
      },
    },
    legend: { 
      position: 'top',
      fontFamily: 'Satoshi, sans-serif',
    },
  };

  const impactRadarSeries = [
    { 
      name: 'Social Impact', 
      data: (data.monthlyImpact && data.monthlyImpact.length > 0)
        ? data.monthlyImpact.map(d => d.social)
        : mockData.monthlyImpact.map(d => d.social)
    },
    { 
      name: 'Economic Impact', 
      data: (data.monthlyImpact && data.monthlyImpact.length > 0)
        ? data.monthlyImpact.map(d => d.economic)
        : mockData.monthlyImpact.map(d => d.economic)
    },
    { 
      name: 'Environmental Impact', 
      data: (data.monthlyImpact && data.monthlyImpact.length > 0)
        ? data.monthlyImpact.map(d => d.environmental)
        : mockData.monthlyImpact.map(d => d.environmental)
    },
  ];

  const departmentBarOptions: ApexOptions = {
    chart: { 
      type: 'bar',
      fontFamily: 'Satoshi, sans-serif',
      height: 250,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      offsetX: 20,
      style: {
        fontSize: '12px',
        colors: ['#fff'],
      },
    },
    colors: ['#5750F1'],
    xaxis: {
      categories: (data.departmentPerformance && data.departmentPerformance.length > 0)
        ? data.departmentPerformance.map(d => d.name)
        : mockData.departmentPerformance.map(d => d.name),
      max: 100,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: { 
        style: { 
          colors: '#9CA3AF',
          fontSize: '12px',
        } 
      },
    },
    yaxis: { 
      labels: { 
        style: { 
          colors: '#9CA3AF',
          fontSize: '12px',
        } 
      } 
    },
    grid: { 
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
  };

  const departmentBarSeries = [
    { 
      name: 'Tingkat Penyelesaian', 
      data: (data.departmentPerformance && data.departmentPerformance.length > 0)
        ? data.departmentPerformance.map(d => d.completion)
        : mockData.departmentPerformance.map(d => d.completion)
    },
  ];

  return (
    <>
      <Breadcrumb pageName="Analytics & Insights" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary" />
            Analytics & Insights
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Analisis mendalam data CSR dengan visualisasi interaktif
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={loadAnalyticsData}
            className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {/* Export Dropdown */}
          <div className="relative group">
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all dark:border-gray-700 dark:bg-gray-800 z-10">
              <button
                onClick={handleExportPDF}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
              >
                <FileText className="w-4 h-4 text-red-600" />
                Export as PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                Export as Excel
              </button>
              <button
                onClick={handleExportCSV}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg"
              >
                <Download className="w-4 h-4 text-blue-600" />
                Export as CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Budget Card */}
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Anggaran</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(overview.totalBudget)}
              </p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                {overview.budgetGrowth >= 0 ? (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-600">+{overview.budgetGrowth}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-600">{overview.budgetGrowth}%</span>
                  </>
                )}
                <span className="text-gray-600 dark:text-gray-400">vs periode lalu</span>
              </div>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/50">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Programs Card */}
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-green-100 p-6 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Total Program</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {overview.totalPrograms}
              </p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600">+{overview.programGrowth}%</span>
                <span className="text-gray-600 dark:text-gray-400">pertumbuhan</span>
              </div>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/50">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Activities Card */}
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 dark:from-amber-900/20 dark:to-amber-800/20 dark:border-amber-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Total Kegiatan</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {overview.totalActivities}
              </p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600">+{overview.activityGrowth}%</span>
                <span className="text-gray-600 dark:text-gray-400">vs periode lalu</span>
              </div>
            </div>
            <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/50">
              <Activity className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        {/* Total Beneficiaries Card */}
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Penerima Manfaat</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(overview.totalBeneficiaries)}
              </p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600">+{overview.beneficiaryGrowth}%</span>
                <span className="text-gray-600 dark:text-gray-400">pertumbuhan</span>
              </div>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/50">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Budget Trend Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tren Anggaran & Realisasi
            </h3>
            <LineChart className="w-5 h-5 text-gray-500" />
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-[310px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ReactApexChart
              key={`budget-trend-${period}`}
              options={budgetTrendOptions}
              series={budgetTrendSeries}
              type="area"
              height={310}
            />
          )}
        </div>

        {/* Program Distribution Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Distribusi Program
            </h3>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-[310px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ReactApexChart
              key={`program-dist-${period}`}
              options={programDistributionOptions}
              series={programDistributionSeries}
              type="donut"
              height={310}
            />
          )}
        </div>

        {/* Activity Status Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Status Kegiatan
            </h3>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-[310px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ReactApexChart
              key={`activity-status-${period}`}
              options={activityStatusOptions}
              series={activityStatusSeries}
              type="pie"
              height={310}
            />
          )}
        </div>

        {/* Impact Radar Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Analisis Dampak
            </h3>
            <Sparkles className="w-5 h-5 text-gray-500" />
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-[310px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ReactApexChart
              key={`impact-radar-${period}`}
              options={impactRadarOptions}
              series={impactRadarSeries}
              type="radar"
              height={310}
            />
          )}
        </div>

        {/* Department Performance Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performa Departemen
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ReactApexChart
              key={`dept-perf-${period}`}
              options={departmentBarOptions}
              series={departmentBarSeries}
              type="bar"
              height={250}
            />
          )}
        </div>
      </div>

      {/* Top Programs Table */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Top Performing Programs
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Program</th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Completion</th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Budget</th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Impact Score</th>
              </tr>
            </thead>
            <tbody>
              {(topProgramsData || []).map((program, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="py-4 text-sm font-medium text-gray-900 dark:text-white">{program.name}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${program.completion}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{program.completion}%</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-700 dark:text-gray-300">
                    {formatCurrency(program.budget)}
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <Sparkles className="w-3 h-3" />
                      {program.impact}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
