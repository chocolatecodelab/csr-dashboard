"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { MapData, MapWrapperData } from "./types";

// Use simple version without jsvectormap
const MapComponent = dynamic(() => import("@/components/Charts/social-impact-map/map-wrapper-simple"), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />,
});

interface SocialImpactMapProps {
  className?: string;
}

export function SocialImpactMap({ className = "" }: SocialImpactMapProps) {
  const [mapData, setMapData] = useState<MapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<MapData | null>(null);
  const [totals, setTotals] = useState({
    provinces: 0,
    programs: 0,
    beneficiaries: 0,
  });

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard/map");
        
        if (!response.ok) {
          throw new Error("Failed to fetch map data");
        }

        const result = await response.json();
        setMapData(result.data.mapData || []);
        setTotals(result.data.totals || { provinces: 0, programs: 0, beneficiaries: 0 });
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  const handleProvinceClick = (province: MapData) => {
    setSelectedProvince(province);
  };

  if (loading) {
    return (
      <div className={`rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card ${className}`}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
            Peta Sebaran Dampak Sosial
          </h4>
          <p className="text-body-sm text-dark-4 dark:text-dark-6 mt-1">
            Visualisasi sebaran program CSR di seluruh Indonesia
          </p>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg bg-primary/10 p-4">
          <p className="text-body-sm font-medium text-dark-4 dark:text-dark-6">Provinsi Terjangkau</p>
          <p className="text-body-2xlg font-bold text-primary mt-1">{totals.provinces}</p>
        </div>
        <div className="rounded-lg bg-secondary/10 p-4">
          <p className="text-body-sm font-medium text-dark-4 dark:text-dark-6">Total Program</p>
          <p className="text-body-2xlg font-bold text-secondary mt-1">{totals.programs}</p>
        </div>
        <div className="rounded-lg bg-success/10 p-4">
          <p className="text-body-sm font-medium text-dark-4 dark:text-dark-6">Penerima Manfaat</p>
          <p className="text-body-2xlg font-bold text-success mt-1">
            {totals.beneficiaries.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <MapComponent mapData={mapData} onProvinceClick={handleProvinceClick} />
      </div>

      {/* Province Details */}
      {selectedProvince && (
        <div className="mt-6 rounded-lg border border-stroke bg-gray-1 dark:bg-dark-2 dark:border-dark-3 p-5">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-body-lg font-bold text-dark dark:text-white">
              {selectedProvince.province}
            </h5>
            <button
              onClick={() => setSelectedProvince(null)}
              className="text-dark-4 hover:text-dark dark:text-dark-6 dark:hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-body-xs text-dark-4 dark:text-dark-6">Jumlah Program</p>
              <p className="text-body-lg font-bold text-dark dark:text-white">
                {selectedProvince.programCount}
              </p>
            </div>
            <div>
              <p className="text-body-xs text-dark-4 dark:text-dark-6">Penerima Manfaat</p>
              <p className="text-body-lg font-bold text-dark dark:text-white">
                {selectedProvince.beneficiaries.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* Categories */}
          {selectedProvince.categories.length > 0 && (
            <div className="mb-4">
              <p className="text-body-sm font-medium text-dark dark:text-white mb-2">
                Kategori Program:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedProvince.categories.map((cat) => (
                  <span
                    key={cat.name}
                    className="inline-flex items-center gap-1 rounded bg-primary/10 px-2.5 py-1 text-body-xs font-medium text-primary"
                  >
                    {cat.name} ({cat.count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Programs List */}
          <div>
            <p className="text-body-sm font-medium text-dark dark:text-white mb-2">
              Program Aktif:
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedProvince.programs.slice(0, 5).map((program) => (
                <div
                  key={program.id}
                  className="flex items-center justify-between p-2 rounded bg-white dark:bg-dark-3"
                >
                  <div className="flex-1">
                    <p className="text-body-sm font-medium text-dark dark:text-white">
                      {program.name}
                    </p>
                    <p className="text-body-xs text-dark-4 dark:text-dark-6">
                      {program.category}
                    </p>
                  </div>
                  <span
                    className={`text-body-xs px-2 py-1 rounded ${
                      program.status === "active"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {program.status}
                  </span>
                </div>
              ))}
              {selectedProvince.programs.length > 5 && (
                <p className="text-body-xs text-dark-4 dark:text-dark-6 text-center py-2">
                  +{selectedProvince.programs.length - 5} program lainnya
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Provinces Table */}
      <div className="mt-6">
        <h5 className="text-body-lg font-bold text-dark dark:text-white mb-4">
          Top 10 Provinsi dengan Program Terbanyak
        </h5>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-dark-3">
                <th className="text-left py-3 px-4 text-body-sm font-medium text-dark dark:text-white">
                  Rank
                </th>
                <th className="text-left py-3 px-4 text-body-sm font-medium text-dark dark:text-white">
                  Provinsi
                </th>
                <th className="text-center py-3 px-4 text-body-sm font-medium text-dark dark:text-white">
                  Program
                </th>
                <th className="text-right py-3 px-4 text-body-sm font-medium text-dark dark:text-white">
                  Penerima Manfaat
                </th>
              </tr>
            </thead>
            <tbody>
              {mapData.slice(0, 10).map((item, index) => (
                <tr
                  key={item.province}
                  className="border-b border-stroke dark:border-dark-3 hover:bg-gray-1 dark:hover:bg-dark-2 cursor-pointer"
                  onClick={() => handleProvinceClick(item)}
                >
                  <td className="py-3 px-4 text-body-sm text-dark dark:text-white">
                    #{index + 1}
                  </td>
                  <td className="py-3 px-4 text-body-sm font-medium text-dark dark:text-white">
                    {item.province}
                  </td>
                  <td className="py-3 px-4 text-body-sm text-center text-dark dark:text-white">
                    {item.programCount}
                  </td>
                  <td className="py-3 px-4 text-body-sm text-right text-dark dark:text-white">
                    {item.beneficiaries.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
