"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ProgramDistributionProps {
  className?: string;
}

interface DistributionData {
  categoryId: string;
  categoryName: string;
  count: number;
  percentage: string;
}

export function ProgramDistribution({ className = "" }: ProgramDistributionProps) {
  const [programData, setProgramData] = useState<DistributionData[]>([]);
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
        setProgramData(result.data.distribution || []);
      } catch (error) {
        console.error("Error fetching program distribution:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartColors = ["#3C50E0", "#6577F3", "#8FD0EF", "#0FADCF", "#80CAEE", "#FF6B6B", "#4ECDC4", "#95E1D3"];

  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Satoshi, sans-serif",
    },
    colors: chartColors,
    labels: programData.map(item => item.categoryName),
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          background: "transparent",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 380,
          },
        },
      },
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

  const series = programData.map(item => item.count);

  if (loading) {
    return (
      <div className={`rounded-[10px] bg-white px-7.5 pb-5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (programData.length === 0) {
    return (
      <div className={`rounded-[10px] bg-white px-7.5 pb-5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card ${className}`}>
        <h4 className="text-body-2xlg font-bold text-dark dark:text-white mb-4">
          Distribusi Program CSR
        </h4>
        <div className="text-center py-12 text-gray-400">
          Belum ada data program
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-[10px] bg-white px-7.5 pb-5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card ${className}`}>
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
            Distribusi Program CSR
          </h4>
        </div>
      </div>

      <div className="mb-2">
        <div id="programChart" className="mx-auto flex justify-center">
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="donut"
          />
        </div>
      </div>

      <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
        {programData.map((item, index) => (
          <div key={item.categoryId} className="w-full px-8 sm:w-1/2">
            <div className="flex w-full items-center">
              <span
                className="mr-2 block h-3 w-full max-w-3 rounded-full"
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              ></span>
              <p className="flex w-full justify-between text-body-sm font-medium text-dark dark:text-dark-6">
                <span>{item.categoryName}</span>
                <span>{item.percentage}%</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}