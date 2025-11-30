"use client";

import { Heart, UserGroup, CurrencyDollar, ChartBar } from "@/components/Layouts/sidebar/icons";
import React, { useEffect, useState } from "react";

interface CSROverviewProps {
  className?: string;
}

interface OverviewData {
  totalPrograms: {
    count: number;
    change: number;
    isPositive: boolean;
  };
  activeBeneficiaries: {
    count: number;
    change: number;
    isPositive: boolean;
  };
  budgetAllocated: {
    amount: number;
    change: number;
    isPositive: boolean;
  };
  impactScore: {
    score: number;
    change: number;
    isPositive: boolean;
  };
}

export function CSROverview({ className = "" }: CSROverviewProps) {
  const [data, setData] = useState<OverviewData | null>(null);
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
        setData(result.data.overview);
      } catch (error) {
        console.error("Error fetching dashboard overview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency to M (million) or B (billion)
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return { value: (amount / 1000000000).toFixed(1), unit: "M" };
    } else if (amount >= 1000000) {
      return { value: (amount / 1000000).toFixed(1), unit: "Jt" };
    } else {
      return { value: amount.toLocaleString("id-ID"), unit: "" };
    }
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card animate-pulse">
            <div className="h-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const budget = formatCurrency(data.budgetAllocated.amount);

  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {/* Total Program Aktif */}
      <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="mb-1.5 text-body-2xlg font-bold text-dark dark:text-white">
              {data.totalPrograms.count}
            </h4>
            <span className="text-body-sm font-medium">Program Aktif</span>
          </div>
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-[5px] bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className={`flex items-center gap-1 text-body-xs font-medium ${
            data.totalPrograms.isPositive ? 'text-green' : 'text-red'
          }`}>
            <span>{data.totalPrograms.isPositive ? '↗' : '↘'}</span>
            {Math.abs(data.totalPrograms.change)}%
          </span>
          <span className="text-body-xs font-medium">Dari bulan lalu</span>
        </div>
      </div>

      {/* Total Penerima Manfaat */}
      <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="mb-1.5 text-body-2xlg font-bold text-dark dark:text-white">
              {data.activeBeneficiaries.count.toLocaleString('id-ID')}
            </h4>
            <span className="text-body-sm font-medium">Penerima Manfaat</span>
          </div>
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-[5px] bg-secondary/10">
            <UserGroup className="h-5 w-5 text-secondary" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className={`flex items-center gap-1 text-body-xs font-medium ${
            data.activeBeneficiaries.isPositive ? 'text-green' : 'text-red'
          }`}>
            <span>{data.activeBeneficiaries.isPositive ? '↗' : '↘'}</span>
            {Math.abs(data.activeBeneficiaries.change)}%
          </span>
          <span className="text-body-xs font-medium">Dari bulan lalu</span>
        </div>
      </div>

      {/* Budget Teralokasi */}
      <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="mb-1.5 text-body-2xlg font-bold text-dark dark:text-white">
              Rp {budget.value}{budget.unit}
            </h4>
            <span className="text-body-sm font-medium">Budget Teralokasi</span>
          </div>
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-[5px] bg-success/10">
            <CurrencyDollar className="h-5 w-5 text-success" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className={`flex items-center gap-1 text-body-xs font-medium ${
            data.budgetAllocated.isPositive ? 'text-green' : 'text-red'
          }`}>
            <span>{data.budgetAllocated.isPositive ? '↗' : '↘'}</span>
            {Math.abs(data.budgetAllocated.change)}%
          </span>
          <span className="text-body-xs font-medium">Dari bulan lalu</span>
        </div>
      </div>

      {/* Impact Score */}
      <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="mb-1.5 text-body-2xlg font-bold text-dark dark:text-white">
              {data.impactScore.score}/10
            </h4>
            <span className="text-body-sm font-medium">Impact Score</span>
          </div>
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-[5px] bg-warning/10">
            <ChartBar className="h-5 w-5 text-warning" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className={`flex items-center gap-1 text-body-xs font-medium ${
            data.impactScore.isPositive ? 'text-green' : 'text-red'
          }`}>
            <span>{data.impactScore.isPositive ? '↗' : '↘'}</span>
            +{data.impactScore.change}
          </span>
          <span className="text-body-xs font-medium">Dari bulan lalu</span>
        </div>
      </div>
    </div>
  );
}