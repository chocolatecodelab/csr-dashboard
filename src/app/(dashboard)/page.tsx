import { BudgetTracking } from "@/components/Charts/budget-tracking";
import { CSROverview } from "@/components/Charts/csr-overview";
import { ProgramDistribution } from "@/components/Charts/program-distribution";
import { RecentActivities } from "@/components/Charts/recent-activities";
import { SocialImpactMap } from "@/components/Charts/social-impact-map";
import { DynamicImpactSummary } from "./_components/impact-summary";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Suspense } from "react";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function CSRDashboard({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-body-2xlg font-bold text-dark dark:text-white">
          Dashboard CSR
        </h1>
        <p className="text-body-sm text-dark-4 dark:text-dark-6">
          Monitor dan kelola program Corporate Social Responsibility Anda
        </p>
      </div>

      {/* Overview Cards */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>}>
        <CSROverview className="mb-6" />
      </Suspense>

      {/* Charts Grid */}
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        
        {/* Budget Tracking Chart */}
        <BudgetTracking
          key={extractTimeFrame("budget_tracking")}
          timeFrame={extractTimeFrame("budget_tracking")?.split(":")[1]}
        />

        {/* Recent Activities */}
        <RecentActivities />

        {/* Program Distribution Chart */}
        <ProgramDistribution className="col-span-12 xl:col-span-6" />

        {/* Dynamic Impact Summary Card */}
        <DynamicImpactSummary className="col-span-12 xl:col-span-6" />

        {/* Social Impact Map - Full Width */}
        <div className="col-span-12">
          <SocialImpactMap />
        </div>

      </div>
    </>
  );
}
