"use client";

import React from "react";

interface RecentActivitiesProps {
  className?: string;
}

const recentActivities = [
  {
    id: 1,
    title: "Workshop Keterampilan Digital",
    program: "Program Pemberdayaan UMKM",
    status: "completed",
    date: "2024-10-10",
    participants: 45,
    budget: "Rp 25M",
    location: "Surabaya",
  },
  {
    id: 2,
    title: "Pembangunan Fasilitas Kesehatan",
    program: "Program Kesehatan Masyarakat",
    status: "ongoing",
    date: "2024-10-15",
    participants: 1200,
    budget: "Rp 150M",
    location: "Bandung",
  },
  {
    id: 3,
    title: "Pelatihan Petani Organik",
    program: "Program Lingkungan Hidup",
    status: "scheduled",
    date: "2024-10-20",
    participants: 60,
    budget: "Rp 30M",
    location: "Yogyakarta",
  },
  {
    id: 4,
    title: "Beasiswa Mahasiswa Berprestasi",
    program: "Program Pendidikan",
    status: "completed",
    date: "2024-10-08",
    participants: 25,
    budget: "Rp 100M",
    location: "Jakarta",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "ongoing":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "scheduled":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "Selesai";
    case "ongoing":
      return "Berlangsung";
    case "scheduled":
      return "Terjadwal";
    default:
      return status;
  }
};

export function RecentActivities({ className = "" }: RecentActivitiesProps) {
  return (
    <div className={`col-span-12 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-5 ${className}`}>
      <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
        Aktivitas Terbaru
      </h4>

      <div className="flex flex-col">
        {recentActivities.map((activity, index) => (
          <div
            key={activity.id}
            className={`flex items-center gap-4 py-3 ${
              index !== recentActivities.length - 1 ? "border-b border-stroke dark:border-dark-3" : ""
            }`}
          >
            <div className="flex h-12.5 w-12.5 items-center justify-center rounded-full bg-gray-2 dark:bg-dark-3">
              <span className="text-body-sm font-medium text-dark dark:text-white">
                {activity.id}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center justify-between">
                <h5 className="text-body-sm font-medium text-dark dark:text-white">
                  {activity.title}
                </h5>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {getStatusText(activity.status)}
                </span>
              </div>
              
              <p className="text-body-xs text-dark-5 dark:text-dark-6">
                {activity.program}
              </p>
              
              <div className="flex items-center gap-4 text-body-xs text-dark-4 dark:text-dark-6">
                <span>{activity.date}</span>
                <span>{activity.participants} peserta</span>
                <span>{activity.budget}</span>
              </div>
              
              <p className="text-body-xs text-dark-4 dark:text-dark-6">
                📍 {activity.location}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 text-center">
        <button className="text-body-sm font-medium text-primary hover:underline">
          Lihat Semua Aktivitas
        </button>
      </div>
    </div>
  );
}