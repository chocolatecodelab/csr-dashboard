import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/dashboard/map - Get map data for social impact visualization
export async function GET(request: NextRequest) {
  try {
    // Get programs with location data
    const programs = await prisma.program.findMany({
      where: {
        status: {
          in: ["active", "completed"],
        },
        targetArea: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        status: true,
        targetArea: true,
        targetBeneficiary: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        startDate: true,
        endDate: true,
        _count: {
          select: {
            projects: true,
            stakeholders: true,
          },
        },
      },
    });

    // Parse targetArea to extract province/city information
    // targetArea format could be: "Jakarta", "Jawa Barat", "Surabaya, Jawa Timur", etc.
    const provinceMap = new Map<string, {
      province: string;
      programCount: number;
      beneficiaries: number;
      programs: Array<{
        id: string;
        name: string;
        category: string;
        beneficiaries: number;
        status: string;
      }>;
      categories: Map<string, number>;
    }>();

    programs.forEach((program) => {
      if (!program.targetArea) return;

      // Extract province from targetArea
      // Simple parsing: if contains comma, take the part after comma, otherwise take as is
      const parts = program.targetArea.split(",").map(s => s.trim());
      const province = parts.length > 1 ? parts[parts.length - 1] : parts[0];

      if (!provinceMap.has(province)) {
        provinceMap.set(province, {
          province,
          programCount: 0,
          beneficiaries: 0,
          programs: [],
          categories: new Map(),
        });
      }

      const data = provinceMap.get(province)!;
      data.programCount++;
      data.beneficiaries += program.targetBeneficiary || 0;
      data.programs.push({
        id: program.id,
        name: program.name,
        category: program.category?.name || "Lainnya",
        beneficiaries: program.targetBeneficiary || 0,
        status: program.status,
      });

      // Count programs by category
      const categoryName = program.category?.name || "Lainnya";
      data.categories.set(
        categoryName,
        (data.categories.get(categoryName) || 0) + 1
      );
    });

    // Convert Map to Array and add coordinates for Indonesian provinces
    const indonesiaProvinces: Record<string, { lat: number; lng: number; code: string }> = {
      "Aceh": { lat: 4.695135, lng: 96.749397, code: "ID-AC" },
      "Sumatera Utara": { lat: 2.115, lng: 99.545, code: "ID-SU" },
      "Sumatera Barat": { lat: -0.7399, lng: 100.8, code: "ID-SB" },
      "Riau": { lat: 0.2933, lng: 101.7068, code: "ID-RI" },
      "Jambi": { lat: -1.6101, lng: 103.6131, code: "ID-JA" },
      "Sumatera Selatan": { lat: -3.3194, lng: 104.9147, code: "ID-SS" },
      "Bengkulu": { lat: -3.5952, lng: 102.2508, code: "ID-BE" },
      "Lampung": { lat: -4.5585, lng: 105.4068, code: "ID-LA" },
      "Kepulauan Bangka Belitung": { lat: -2.7411, lng: 106.4406, code: "ID-BB" },
      "Kepulauan Riau": { lat: 3.9457, lng: 108.1429, code: "ID-KR" },
      "DKI Jakarta": { lat: -6.2088, lng: 106.8456, code: "ID-JK" },
      "Jakarta": { lat: -6.2088, lng: 106.8456, code: "ID-JK" },
      "Jawa Barat": { lat: -7.0909, lng: 107.6689, code: "ID-JB" },
      "Jawa Tengah": { lat: -7.1508, lng: 110.1403, code: "ID-JT" },
      "DI Yogyakarta": { lat: -7.7956, lng: 110.3695, code: "ID-YO" },
      "Yogyakarta": { lat: -7.7956, lng: 110.3695, code: "ID-YO" },
      "Jawa Timur": { lat: -7.5361, lng: 112.2384, code: "ID-JI" },
      "Banten": { lat: -6.4058, lng: 106.0640, code: "ID-BT" },
      "Bali": { lat: -8.4095, lng: 115.1889, code: "ID-BA" },
      "Nusa Tenggara Barat": { lat: -8.6529, lng: 117.3616, code: "ID-NB" },
      "Nusa Tenggara Timur": { lat: -8.6574, lng: 121.0794, code: "ID-NT" },
      "Kalimantan Barat": { lat: -0.2787, lng: 111.4752, code: "ID-KB" },
      "Kalimantan Tengah": { lat: -1.6815, lng: 113.3824, code: "ID-KT" },
      "Kalimantan Selatan": { lat: -3.0926, lng: 115.2838, code: "ID-KS" },
      "Kalimantan Timur": { lat: 0.5387, lng: 116.4194, code: "ID-KI" },
      "Kalimantan Utara": { lat: 3.0731, lng: 116.0413, code: "ID-KU" },
      "Sulawesi Utara": { lat: 0.6246, lng: 123.9750, code: "ID-SA" },
      "Sulawesi Tengah": { lat: -1.4300, lng: 121.4456, code: "ID-ST" },
      "Sulawesi Selatan": { lat: -3.6687, lng: 119.9740, code: "ID-SN" },
      "Sulawesi Tenggara": { lat: -4.1448, lng: 122.1746, code: "ID-SG" },
      "Gorontalo": { lat: 0.6999, lng: 122.4467, code: "ID-GO" },
      "Sulawesi Barat": { lat: -2.8441, lng: 119.2320, code: "ID-SR" },
      "Maluku": { lat: -3.2385, lng: 130.1453, code: "ID-MA" },
      "Maluku Utara": { lat: 1.5709, lng: 127.8087, code: "ID-MU" },
      "Papua Barat": { lat: -1.3361, lng: 133.1747, code: "ID-PB" },
      "Papua": { lat: -4.2699, lng: 138.0804, code: "ID-PA" },
    };

    const mapData = Array.from(provinceMap.entries()).map(([province, data]) => {
      const coordinates = indonesiaProvinces[province] || { lat: 0, lng: 0, code: "ID-XX" };
      
      return {
        province,
        code: coordinates.code,
        coordinates: {
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
        programCount: data.programCount,
        beneficiaries: data.beneficiaries,
        programs: data.programs,
        categories: Array.from(data.categories.entries()).map(([name, count]) => ({
          name,
          count,
        })),
      };
    });

    // Sort by program count (descending)
    mapData.sort((a, b) => b.programCount - a.programCount);

    // Calculate totals
    const totals = {
      provinces: mapData.length,
      programs: mapData.reduce((sum, item) => sum + item.programCount, 0),
      beneficiaries: mapData.reduce((sum, item) => sum + item.beneficiaries, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        mapData,
        totals,
        metadata: {
          totalProvinces: Object.keys(indonesiaProvinces).length,
          coveredProvinces: mapData.length,
          coveragePercentage: ((mapData.length / Object.keys(indonesiaProvinces).length) * 100).toFixed(1),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching map data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch map data" },
      { status: 500 }
    );
  }
}
