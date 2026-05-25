"use client";

import { Suspense } from "react";
import { CustomerLayout } from "../components/CustomerLayout";
import { OrderSuccess } from "../pages/customer/OrderSuccess";

export default function Page() {
  return (
    <CustomerLayout>
      <Suspense fallback={null}>
        <OrderSuccess />
      </Suspense>
    </CustomerLayout>
  );
}
