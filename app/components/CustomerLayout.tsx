"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { AIChatPopup } from "./AIChatPopup";

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { cartCount, user, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F1F3E0" }}>
      <header className="sticky top-0 z-40 shadow-sm" style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #D2DCB6" }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "#778873" }}>
              EP
            </div>
            <span className="font-semibold text-lg" style={{ color: "#4a5c44" }}>Everyday-Pairs</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm transition-colors hover:text-[#778873] ${pathname === "/" ? "font-medium" : ""}`}
              style={{ color: pathname === "/" ? "#778873" : "#6b7280" }}
            >
              หน้าหลัก
            </Link>
            <Link
              href="/products"
              className="text-sm transition-colors hover:text-[#778873]"
              style={{ color: pathname === "/products" ? "#778873" : "#6b7280" }}
            >
              สินค้าทั้งหมด
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative p-2 rounded-full hover:bg-[#F1F3E0] transition-colors">
              <ShoppingCart size={22} style={{ color: "#778873" }} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#778873" }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm" style={{ color: "#6b7280" }}>สวัสดี, {user.name}</span>
                {user.role === "admin" && (
                  <Link href="/admin/dashboard" className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "#D2DCB6", color: "#4a5c44" }}>
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="p-1.5 rounded-full hover:bg-[#F1F3E0]">
                  <LogOut size={18} style={{ color: "#9ca3af" }} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:flex items-center gap-1 text-sm px-4 py-1.5 rounded-full transition-all" style={{ backgroundColor: "#778873", color: "white" }}>
                <User size={15} /> เข้าสู่ระบบ
              </Link>
            )}

            <button className="md:hidden p-1.5" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 border-t border-[#D2DCB6] bg-white space-y-2 pt-3">
            <Link href="/" className="block py-2 text-sm" style={{ color: "#4a5c44" }} onClick={() => setMobileMenuOpen(false)}>
              หน้าหลัก
            </Link>
            <Link href="/products" className="block py-2 text-sm" style={{ color: "#4a5c44" }} onClick={() => setMobileMenuOpen(false)}>
              สินค้าทั้งหมด
            </Link>
            {!user && (
              <Link href="/login" className="block py-2 text-sm" style={{ color: "#778873" }} onClick={() => setMobileMenuOpen(false)}>
                เข้าสู่ระบบ
              </Link>
            )}
            {user && (
              <button onClick={handleLogout} className="block py-2 text-sm text-left w-full" style={{ color: "#9ca3af" }}>
                ออกจากระบบ
              </button>
            )}
          </div>
        )}
      </header>

      <div className="py-1.5 text-center text-xs" style={{ backgroundColor: "#D2DCB6", color: "#4a5c44" }}>
        🕘 ร้านเปิดให้บริการ 09:00 – 18:00 น. ทุกวัน | ส่งทั่วประเทศ ฟรีค่าส่งเมื่อสั่งซื้อ 3 คู่ขึ้นไป
      </div>

      <main>{children}</main>

      <footer className="mt-16 py-8 text-center text-sm" style={{ backgroundColor: "#778873", color: "white" }}>
        <p className="font-medium mb-1">Everyday-Pairs</p>
        <p className="opacity-80 text-xs">ร้านถุงเท้าออนไลน์ เปิด 09:00-18:00 น. ทุกวัน</p>
        <p className="opacity-60 text-xs mt-1">© 2026 Everyday-Pairs. All rights reserved.</p>
      </footer>

      <AIChatPopup mode="customer" />
    </div>
  );
}
