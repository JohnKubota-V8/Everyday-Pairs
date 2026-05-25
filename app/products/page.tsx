"use client";

import { CustomerLayout } from "../components/CustomerLayout";
import { Products } from "../pages/customer/Products";

export default function Page() {
  return (
    <CustomerLayout>
      <Products />
    </CustomerLayout>
  );
}
