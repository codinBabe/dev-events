import DashboardTable from "./dashboard-table";
import { getEventsDashboardData } from "@/lib/actions/dashboard.action";

const Dashboard = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const params = await searchParams;
  const parsedPage = parseInt(params.page || "1", 10);
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  const dashboardData = await getEventsDashboardData({
    page: currentPage,
    limit: 10,
  });
  const { events, totalPages } = dashboardData;
  return (
    <DashboardTable
      events={events}
      totalPages={totalPages}
      page={currentPage}
    />
  );
};

export default Dashboard;
