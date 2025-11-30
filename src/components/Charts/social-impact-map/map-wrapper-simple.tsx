"use client";

import React from "react";

interface MapData {
  province: string;
  code: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  programCount: number;
  beneficiaries: number;
  programs: Array<{
    id: string;
    name: string;
    category: string;
    beneficiaries: number;
    status: string;
  }>;
  categories: Array<{
    name: string;
    count: number;
  }>;
}

interface MapWrapperProps {
  mapData: MapData[];
  onProvinceClick?: (province: MapData) => void;
}

const MapWrapperSimple: React.FC<MapWrapperProps> = ({ mapData, onProvinceClick }) => {
  // Calculate totals
  const totalPrograms = mapData.reduce((sum, d) => sum + d.programCount, 0);
  const totalBeneficiaries = mapData.reduce((sum, d) => sum + d.beneficiaries, 0);
  
  // Get max for scaling
  const maxPrograms = Math.max(...mapData.map(d => d.programCount), 1);

  // Color scale function
  const getColor = (count: number) => {
    const intensity = count / maxPrograms;
    if (intensity > 0.7) return "bg-primary";
    if (intensity > 0.4) return "bg-secondary";
    if (intensity > 0.2) return "bg-warning";
    return "bg-gray-300 dark:bg-gray-600";
  };

  return (
    <div className="relative">
      {/* Indonesia Map Visualization with Grid */}
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-6">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-bold text-dark dark:text-white mb-2">
            Sebaran Program CSR di Indonesia
          </h3>
          <p className="text-sm text-dark-4 dark:text-dark-6">
            Total {totalPrograms} program | {totalBeneficiaries.toLocaleString("id-ID")} penerima manfaat
          </p>
        </div>

        {/* Province Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-2">
          {mapData
            .sort((a, b) => b.programCount - a.programCount)
            .map((province) => (
              <button
                key={province.code}
                onClick={() => onProvinceClick?.(province)}
                className={`${getColor(province.programCount)} 
                  p-4 rounded-lg shadow-sm hover:shadow-md transition-all
                  text-white hover:scale-105 active:scale-95
                  flex flex-col items-start text-left`}
              >
                <div className="font-semibold text-sm mb-1 line-clamp-2">
                  {province.province}
                </div>
                <div className="text-xs opacity-90">
                  {province.programCount} program
                </div>
                <div className="text-xs opacity-75">
                  {province.beneficiaries.toLocaleString("id-ID")} orang
                </div>
              </button>
            ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-4 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary"></div>
              <span className="text-dark-4 dark:text-dark-6">Tinggi (70%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-secondary"></div>
              <span className="text-dark-4 dark:text-dark-6">Sedang (40-70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-warning"></div>
              <span className="text-dark-4 dark:text-dark-6">Rendah (20-40%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600"></div>
              <span className="text-dark-4 dark:text-dark-6">Minimal (&lt;20%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapWrapperSimple;
