import { url } from "inspector";
import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        url: "/",
        items: [],
      },
    ],
  },
  {
    label: "PROGRAM CSR",
    items: [
      {
        title: "Data Program",
        icon: Icons.Heart,
        url: "/programs",
        items: [
        ],
      },
      {
        title: "Stakeholder",
        icon: Icons.UserGroup,
        url: "/stakeholders",
        items: [
        ],
      },
      {
        title: "Sub Program",
        icon: Icons.FourCircle,
        url: "/sub-programs",
        items: [
        ],
      },
      {
        title: "Aktivitas",
        icon: Icons.Calendar,
        url: "/activities",
        items: [
        ],
      },
      {
        title: "Anggaran",
        icon: Icons.CurrencyDollar,
        url: "/budgets",
        items: [
        ],
      },
    ],
  },
  {
    label: "LAPORAN & ANALISIS",
    items: [
      {
        title: "Laporan Program",
        icon: Icons.DocumentReport,
        url: "/reports",
        items: [
        ],
      },
      {
        title: "Analytics & Insights",
        icon: Icons.ChartBar,
        url: "/analytics",
        items: [
        ],
      },
    ],
  },
  {
    label: "MANAJEMEN AKUN",
    items: [
      {
        title: "Akun Pengguna",
        icon: Icons.UserGroup,
        items: [
          {
            title: "Daftar Pengguna",
            url: "/management/users",
            icon: Icons.More,
          },
        ],
      },
      {
        title: "Role & Permission",
        icon: Icons.Shield,
        items: [
          {
            title: "Daftar Role",
            url: "/management/roles",
            icon: Icons.More,
          },
          {
            title: "Daftar Permission",
            url: "/management/permissions",
            icon: Icons.More,
          },
        ],
      },
    ],
  },
  {
    label: "PENGATURAN",
    items: [
      {
        title: "Pengaturan Sistem",
        icon: Icons.Cog,
        url: "/settings",
        items: [
        ],
      },
    ],
  },
];
