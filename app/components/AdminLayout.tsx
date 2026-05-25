"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Package, BarChart3, Settings, LogOut, ChevronRight, Menu, Users } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AIChatPopup } from "./AIChatPopup";

const navItems = [
  { path: "/admin/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { path: "/admin/orders", label: "ออเดอร์", icon: ShoppingBag },
  { path: "/admin/menu", label: "จัดการสินค้า", icon: Package },
  { path: "/admin/reports", label: "รายงาน", icon: BarChart3 },
  { path: "/admin/users", label: "ผู้ใช้", icon: Users },
  { path: "/admin/settings", label: "ตั้งค่า", icon: Settings },
];

function AdminSidebar({
  pathname,
  userName,
  onLogout,
  onNavigate,
}: {
  pathname: string | null;
  userName: string | undefined;
  onLogout: () => void;
  onNavigate: () => void;
}) {
  return (
    <aside className="w-56 shrink-0 flex flex-col min-h-0" style={{ backgroundColor: "#ffffff", borderRight: "1px solid #D2DCB6" }}>
      <div className="px-5 py-5 flex items-center gap-2" style={{ borderBottom: "1px solid #D2DCB6" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "#778873" }}>EP</div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#4a5c44" }}>Everyday-Pairs</p>
          <p className="text-xs" style={{ color: "#9ca3af" }}>Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              href={path}
              onClick={onNavigate}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all"
              style={{
                backgroundColor: active ? "#F1F3E0" : "transparent",
                color: active ? "#4a5c44" : "#6b7280",
                fontWeight: active ? 500 : 400,
              }}
            >
              <div className="flex items-center gap-3">
                <Icon size={17} />
                {label}
              </div>
              {active && <ChevronRight size={14} style={{ color: "#A1BC98" }} />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3" style={{ borderTop: "1px solid #D2DCB6" }}>
        <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ backgroundColor: "#F1F3E0" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "#4a5c44" }}>{userName || "Admin"}</p>
            <p className="text-xs" style={{ color: "#9ca3af" }}>แอดมิน</p>
          </div>
          <button onClick={onLogout} className="p-1.5 rounded-lg hover:bg-[#D2DCB6] transition-colors" title="ออกจากระบบ">
            <LogOut size={15} style={{ color: "#778873" }} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();

  const handleLogout = () => {
    supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F1F3E0" }}>
      <div className="hidden md:flex sticky top-0 h-screen">
        <AdminSidebar
          pathname={pathname}
          userName="Admin"
          onLogout={handleLogout}
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-56">
            <AdminSidebar
              pathname={pathname}
              userName="Admin"
              onLogout={handleLogout}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center px-4 h-14 bg-white border-b border-[#D2DCB6] sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 mr-3">
            <Menu size={22} style={{ color: "#778873" }} />
          </button>
          <span className="font-medium text-sm" style={{ color: "#4a5c44" }}>
            {navItems.find((n) => n.path === pathname)?.label || "Admin"}
          </span>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>

      <AIChatPopup mode="admin" />
    </div>
  );
}
