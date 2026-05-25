"use client";

import { AdminLayout } from "../../components/AdminLayout";
import { Orders } from "../../pages/admin/Orders";

export default function Page() {
  return (
    <AdminLayout>
      <Orders />
    </AdminLayout>
  );
}
