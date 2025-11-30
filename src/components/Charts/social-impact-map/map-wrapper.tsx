"use client";

import React, { useEffect, useRef } from "react";
import jsVectorMap from "jsvectormap";
import "jsvectormap/dist/maps/world";
import "jsvectormap/dist/jsvectormap.css";
import { MapWrapperData, MapData } from "./types";

interface MapWrapperProps {
  mapData: MapData[];
  onProvinceClick?: (province: MapData) => void;
}

const MapWrapper: React.FC<MapWrapperProps> = ({ mapData, onProvinceClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Aggregate all data for Indonesia
    const totalPrograms = mapData.reduce((sum, d) => sum + d.programCount, 0);
    const totalBeneficiaries = mapData.reduce((sum, d) => sum + d.beneficiaries, 0);
    
    const values: Record<string, number> = {
      ID: totalPrograms, // Indonesia country code
    };
    
    try {
      mapInstance.current = new jsVectorMap({
        selector: mapRef.current,
        map: "world",
        zoomButtons: true,
        zoomOnScroll: true,
        focusOn: {
          region: "ID",
          animate: true,
        },
        regionStyle: {
          initial: {
            fill: "#e8e8e8",
            "fill-opacity": 1,
            stroke: "#ffffff",
            "stroke-width": 1.5,
            "stroke-opacity": 1,
          },
          hover: {
            "fill-opacity": 0.8,
            cursor: "pointer",
          },
          selected: {
            fill: "#3C50E0",
          },
          selectedHover: {},
        },
        series: {
          regions: [
            {
              values: values,
              scale: ["#E8F4F8", "#0FADCF", "#3C50E0"],
              normalizeFunction: "polynomial",
              min: 0,
              max: totalPrograms,
            },
          ],
        },
        onRegionTooltipShow: function (event: any, tooltip: any, code: string) {
          if (code === "ID") {
            tooltip.html(
              `<div class="p-3 bg-white dark:bg-gray-dark rounded shadow-lg">
                <div class="font-bold text-dark dark:text-white mb-2">Indonesia</div>
                <div class="text-sm text-dark-4 dark:text-dark-6">
                  <div>Total Program: <span class="font-semibold text-primary">${totalPrograms}</span></div>
                  <div>Total Penerima Manfaat: <span class="font-semibold text-success">${totalBeneficiaries.toLocaleString("id-ID")}</span></div>
                  <div>Provinsi: <span class="font-semibold text-meta-5">${mapData.length}</span></div>
                </div>
              </div>`
            );
          }
        },
        onRegionClick: function (event: any, code: string) {
          if (code === "ID" && mapData.length > 0 && onProvinceClick) {
            // Show first province data as sample
            onProvinceClick(mapData[0]);
          }
        },
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.destroy();
          mapInstance.current = null;
        } catch (error) {
          console.error("Error destroying map:", error);
        }
      }
    };
  }, [mapData, onProvinceClick]);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-96 rounded-lg overflow-hidden" />
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-body-xs text-dark-4 dark:text-dark-6">Rendah</span>
        <div className="flex items-center gap-1">
          <div className="w-8 h-3 rounded" style={{ backgroundColor: "#E8F4F8" }}></div>
          <div className="w-8 h-3 rounded" style={{ backgroundColor: "#0FADCF" }}></div>
          <div className="w-8 h-3 rounded" style={{ backgroundColor: "#3C50E0" }}></div>
        </div>
        <span className="text-body-xs text-dark-4 dark:text-dark-6">Tinggi</span>
      </div>
    </div>
  );
};

export default MapWrapper;
