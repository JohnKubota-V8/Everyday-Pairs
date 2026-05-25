"use client";

import { CustomerLayout } from "../components/CustomerLayout";
import { Cart } from "../pages/customer/Cart";

export default function Page() {
  return (
    <CustomerLayout>
      <Cart />
    </CustomerLayout>
  );
}
