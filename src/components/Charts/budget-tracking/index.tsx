"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface BudgetTrackingProps {
  className?: string;
  timeFrame?: string;
}

const budgetData = {
  categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  allocated: [300, 450, 380, 520, 480, 600],
  spent: [280, 420, 360, 480, 440, 550],
  remaining: [20, 30, 20, 40, 40, 50],
};

export function BudgetTracking({ className = "", timeFrame }: BudgetTrackingProps) {
  const chartOptions: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#5750F1", "#0FADCF", "#FF6B35"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    fill: {
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 320,
          },
        },
      },
    ],
    stroke: {
      curve: "smooth",
    },
    markers: {
      size: 0,
    },
    grid: {
      strokeDashArray: 5,
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
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function (seriesName: string) {
            return seriesName === "allocated" 
              ? "Dialokasikan: Rp " 
              : seriesName === "spent" 
              ? "Terpakai: Rp " 
              : "Sisa: Rp ";
          },
        },
        formatter: function (value: number) {
          return value + "M";
        },
      },
      marker: {
        show: false,
      },
    },
    xaxis: {
      type: "category",
      categories: budgetData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
      labels: {
        formatter: function (value: number) {
          return "Rp " + value + "M";
        },
      },
    },
  };

  const series = [
    {
      name: "allocated",
      data: budgetData.allocated,
    },
    {
      name: "spent", 
      data: budgetData.spent,
    },
    {
      name: "remaining",
      data: budgetData.remaining,
    },
  ];

  return (
    <div className={`col-span-12 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7 ${className}`}>
      <div className="mb-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
            Budget Tracking CSR
          </h4>
        </div>
        <div className="flex items-center gap-2.5">
          <p className="font-medium uppercase text-dark dark:text-dark-6">
            Short by:
          </p>
          <div className="relative z-20 inline-block">
            <span className="text-body-sm font-medium">
              {timeFrame || "This Month"}
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
          <div className="flex w-full flex-wrap gap-3 sm:gap-5">
            <div className="flex min-w-47.5">
              <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
                <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
              </span>
              <div className="w-full">
                <p className="font-semibold text-primary">Dialokasikan</p>
                <p className="text-body-sm font-medium">Rp 2.4M Bulan Ini</p>
              </div>
            </div>
            <div className="flex min-w-47.5">
              <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
                <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
              </span>
              <div className="w-full">
                <p className="font-semibold text-secondary">Terpakai</p>
                <p className="text-body-sm font-medium">Rp 1.9M Bulan Ini</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div id="budgetChart" className="-ml-4 -mr-5">
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="area"
            height={310}
          />
        </div>
      </div>
    </div>
  );
}