import { Suspense } from "react";
import Dashboard from "@/components/dashboard";

const AdminDashboardPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
};

export default AdminDashboardPage;
