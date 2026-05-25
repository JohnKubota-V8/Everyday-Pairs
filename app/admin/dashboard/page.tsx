"use client";

import { AdminLayout } from "../../components/AdminLayout";
import { Dashboard } from "../../pages/admin/Dashboard";

export default function Page() {
  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  );
}
