"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface ImpactSummaryProps {
  className?: string;
}

interface Metrics {
  completedPrograms: number;
  completedActivities: number;
  totalActivities: number;
  completionRate: string;
}

export function DynamicImpactSummary({ className = "" }: ImpactSummaryProps) {
  const [data, setData] = useState<any>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard");
        
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const result = await response.json();
        setData(result.data);
        setMetrics(result.data.metrics);
      } catch (error) {
        console.error("Error fetching impact summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={`rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || !metrics) return null;

  const totalBeneficiaries = data.overview.activeBeneficiaries.count;
  const provincesCount = data.regionalDistribution.length;
  const impactScore = data.overview.impactScore.score;

  // Calculate targets (mock for now - should come from settings)
  const targetBeneficiaries = 20000;
  const targetProvinces = 50;
  const targetScore = 8.0;

  const beneficiariesPercentage = ((totalBeneficiaries / targetBeneficiaries) * 100).toFixed(1);
  const provincesPercentage = ((provincesCount / targetProvinces) * 100).toFixed(1);
  const scorePercentage = ((impactScore / targetScore) * 100).toFixed(1);

  return (
    <div className={`rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card ${className}`}>
      <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
        Impact Summary
      </h4>
      
      <div className="space-y-4">
        {/* Total Penerima Manfaat */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-1 dark:bg-dark-2">
          <div>
            <p className="text-body-sm font-medium text-dark dark:text-white">
              Total Penerima Manfaat
            </p>
            <p className="text-body-2xlg font-bold text-primary">
              {totalBeneficiaries.toLocaleString("id-ID")} Orang
            </p>
          </div>
          <div className="text-right">
            <p className="text-body-xs text-dark-4 dark:text-dark-6">
              Target: {targetBeneficiaries.toLocaleString("id-ID")}
            </p>
            <p className={`text-body-sm font-medium ${
              Number(beneficiariesPercentage) >= 80 ? "text-green" : 
              Number(beneficiariesPercentage) >= 50 ? "text-warning" : "text-red"
            }`}>
              {beneficiariesPercentage}% Tercapai
            </p>
          </div>
        </div>

        {/* Wilayah Terjangkau */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-1 dark:bg-dark-2">
          <div>
            <p className="text-body-sm font-medium text-dark dark:text-white">
              Wilayah Terjangkau
            </p>
            <p className="text-body-2xlg font-bold text-secondary">
              {provincesCount} Provinsi
            </p>
          </div>
          <div className="text-right">
            <p className="text-body-xs text-dark-4 dark:text-dark-6">
              Target: {targetProvinces} Provinsi
            </p>
            <p className={`text-body-sm font-medium ${
              Number(provincesPercentage) >= 80 ? "text-green" : 
              Number(provincesPercentage) >= 50 ? "text-warning" : "text-red"
            }`}>
              {provincesPercentage}% Tercapai
            </p>
          </div>
        </div>

        {/* Sustainability Index */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-1 dark:bg-dark-2">
          <div>
            <p className="text-body-sm font-medium text-dark dark:text-white">
              Impact Score
            </p>
            <p className="text-body-2xlg font-bold text-success">
              {impactScore}/10
            </p>
          </div>
          <div className="text-right">
            <p className="text-body-xs text-dark-4 dark:text-dark-6">
              Standar: {targetScore}
            </p>
            <p className={`text-body-sm font-medium ${
              impactScore >= targetScore ? "text-green" : "text-warning"
            }`}>
              {impactScore >= targetScore ? "↗" : "→"} {Number(scorePercentage).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-1 dark:bg-dark-2">
          <div>
            <p className="text-body-sm font-medium text-dark dark:text-white">
              Tingkat Penyelesaian
            </p>
            <p className="text-body-2xlg font-bold text-warning">
              {metrics.completionRate}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-body-xs text-dark-4 dark:text-dark-6">
              {metrics.completedActivities} dari {metrics.totalActivities} aktivitas
            </p>
            <p className="text-body-sm font-medium text-dark-4 dark:text-dark-6">
              {metrics.completedPrograms} program selesai
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/reports"
          className="flex w-full items-center justify-center rounded-lg bg-primary py-2.5 text-white font-medium hover:bg-primary/90 transition-colors"
        >
          Lihat Laporan Detail
        </Link>
      </div>
    </div>
  );
}
