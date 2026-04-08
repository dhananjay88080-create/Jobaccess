import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { isAdminAuthenticated } from "@/lib/auth";

export const metadata = {
  title: "Admin Login"
};

export default function AdminLoginPage() {
  if (isAdminAuthenticated()) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="py-12">
      <AdminLoginForm />
    </div>
  );
}
