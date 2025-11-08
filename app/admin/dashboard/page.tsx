import { Suspense } from "react";
import { getEventsDashboardData } from "@/lib/actions/dashboard.action";
import Dashboard from "@/components/dashboard";

const AdminDashboardPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const params = await searchParams;
  const parsedPage = parseInt(params.page || "1", 10);
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  const dashboardData = await getEventsDashboardData({ page, limit: 10 });
  const { events, totalPages } = dashboardData;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard events={events} totalPages={totalPages} page={page} />
    </Suspense>
  );
};

export default AdminDashboardPage;
