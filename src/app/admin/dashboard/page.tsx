import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { isAdminAuthenticated } from "@/lib/auth";

export const metadata = {
  title: "JobAccess India Admin Dashboard"
};

export default function AdminDashboardPage() {
  if (!isAdminAuthenticated()) {
    redirect("/admin/login");
  }

  return (
    <div className="py-8">
      <AdminDashboard />
    </div>
  );
}
