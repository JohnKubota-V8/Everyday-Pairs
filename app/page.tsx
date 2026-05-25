"use client";

import { CustomerLayout } from "./components/CustomerLayout";
import { Home } from "./pages/customer/Home";

export default function Page() {
  return (
    <CustomerLayout>
      <Home />
    </CustomerLayout>
  );
}
