"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";

function hashToOrderNumber(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 900;
  }
  return `EP-${String(hash + 100).padStart(3, "0")}`;
}

export function OrderSuccess() {
  const searchParams = useSearchParams();
  const orderNumberParam = searchParams.get("orderNumber")?.trim();
  const orderNumber = orderNumberParam || hashToOrderNumber("fallback-order");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6"
          style={{ backgroundColor: "#D2DCB6" }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
          >
            <CheckCircle size={52} style={{ color: "#778873" }} />
          </motion.div>
        </motion.div>

        <div className="relative h-8 mb-4 overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="absolute text-xl"
              initial={{ y: 40, opacity: 0, x: `${i * 20}%` }}
              animate={{ y: -30, opacity: [0, 1, 0] }}
              transition={{ delay: 0.4 + i * 0.1, duration: 1.2, ease: "easeOut" }}
            >
              🧦
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="mb-2" style={{ color: "#4a5c44" }}>สั่งซื้อสำเร็จ!</h1>
          <p className="text-sm mb-1" style={{ color: "#9ca3af" }}>หมายเลขออเดอร์</p>
          <p className="text-lg font-semibold mb-4" style={{ color: "#778873" }}>{orderNumber}</p>
          <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
            ขอบคุณที่สั่งซื้อกับร้าน Everyday-Pairs ค่ะ 🙏<br />
            ทีมงานจะดำเนินการจัดส่งให้โดยเร็วที่สุด<br />
            ติดตามสถานะได้ทาง LINE หรือ Telegram ค่ะ
          </p>

          <div className="p-4 rounded-2xl mb-6 text-sm" style={{ backgroundColor: "#F1F3E0", color: "#4a5c44" }}>
            <p className="font-medium mb-1">ขั้นตอนการชำระเงิน</p>
            <p className="text-xs" style={{ color: "#6b7280" }}>กรุณาชำระเงินภายใน 24 ชั่วโมง เพื่อยืนยันออเดอร์ของคุณ</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border transition-all"
              style={{ borderColor: "#D2DCB6", color: "#6b7280" }}
            >
              <Home size={15} /> หน้าหลัก
            </Link>
            <Link
              href="/products"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#778873" }}
            >
              <ShoppingBag size={15} /> ซื้อต่อ
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
