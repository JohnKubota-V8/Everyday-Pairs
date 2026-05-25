"use client";

import { useEffect, useState } from "react";
import { Save, Bell, Store, Clock, Truck, BookOpen } from "lucide-react";

function SettingsSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8EED4" }}>
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid #E8EED4" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F1F3E0" }}>
          <Icon size={16} style={{ color: "#778873" }} />
        </div>
        <h3 style={{ color: "#4a5c44" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SettingsField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs mb-1.5" style={{ color: "#6b7280" }}>{label}</label>
      {children}
    </div>
  );
}

export function Settings() {
  const [isKnowledgeExpanded, setIsKnowledgeExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [storeName, setStoreName] = useState("Everyday-Pairs");
  const [storeDesc, setStoreDesc] = useState("ร้านถุงเท้าออนไลน์ เปิด 09:00-18:00 น. ทุกวัน");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("18:00");
  const [shippingFee, setShippingFee] = useState("50");
  const [freeShippingQty, setFreeShippingQty] = useState("3");
  const [alertTime, setAlertTime] = useState("00:05");
  const [notifyNewOrder, setNotifyNewOrder] = useState(true);
  const [notifyDaily, setNotifyDaily] = useState(true);
  const [notifyLowStock, setNotifyLowStock] = useState(true);

  const [knowledgeText, setKnowledgeText] = useState("");
  const [knowledgeLoading, setKnowledgeLoading] = useState(true);
  const [knowledgeSaving, setKnowledgeSaving] = useState(false);
  const [knowledgeStatus, setKnowledgeStatus] = useState<string | null>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm outline-none border";
  const inputStyle = { borderColor: "#D2DCB6" };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setKnowledgeLoading(true);
        const res = await fetch("/api/admin/knowledge", { method: "GET" });
        const json = (await res.json().catch(() => null)) as null | { text?: unknown };
        if (cancelled) return;
        setKnowledgeText(typeof json?.text === "string" ? json.text : "");
      } catch {
        if (cancelled) return;
        setKnowledgeText("");
      } finally {
        if (!cancelled) setKnowledgeLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveKnowledge = async () => {
    if (knowledgeSaving) return;
    setKnowledgeSaving(true);
    setKnowledgeStatus(null);
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: knowledgeText }),
      });
      if (!res.ok) throw new Error("save_failed");
      setKnowledgeStatus("บันทึก knowledge แล้ว");
      setTimeout(() => setKnowledgeStatus(null), 2000);
    } catch {
      setKnowledgeStatus("บันทึกไม่สำเร็จ");
      setTimeout(() => setKnowledgeStatus(null), 2500);
    } finally {
      setKnowledgeSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div
        className="rounded-2xl p-4 md:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        style={{ border: "1px solid #E8EED4", backgroundColor: "#ffffff" }}
      >
        <div>
          <h1 style={{ color: "#4a5c44" }}>ตั้งค่าร้านค้า</h1>
          <p className="text-sm" style={{ color: "#9ca3af" }}>จัดการการตั้งค่าทั่วไปของร้าน</p>
        </div>
        <button
          onClick={handleSave}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
          style={{ backgroundColor: saved ? "#A1BC98" : "#778873" }}
        >
          <Save size={15} />
          {saved ? "บันทึกแล้ว ✓" : "บันทึก"}
        </button>
      </div>

      <div className="space-y-5">
        <SettingsSection icon={Store} title="ข้อมูลร้านค้า">
          <SettingsField label="ชื่อร้าน">
            <input className={inputClass} style={inputStyle} value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </SettingsField>
          <SettingsField label="คำอธิบายร้าน">
            <textarea
              className={`${inputClass} resize-none`}
              style={inputStyle}
              rows={2}
              value={storeDesc}
              onChange={(e) => setStoreDesc(e.target.value)}
            />
          </SettingsField>
        </SettingsSection>

        <SettingsSection icon={Clock} title="เวลาเปิด-ปิดร้าน">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField label="เวลาเปิด">
              <input type="time" className={inputClass} style={inputStyle} value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
            </SettingsField>
            <SettingsField label="เวลาปิด">
              <input type="time" className={inputClass} style={inputStyle} value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
            </SettingsField>
          </div>
        </SettingsSection>

        <SettingsSection icon={BookOpen} title="Knowledge">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              ใช้เป็นข้อมูลอ้างอิงสำหรับ AI แชทฝั่งลูกค้า
            </p>
            <div className="flex w-full sm:w-auto gap-2">
              <button
                onClick={() => setIsKnowledgeExpanded(true)}
                disabled={knowledgeLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-60"
                style={{ borderColor: "#D2DCB6", color: "#6b7280" }}
              >
                ขยาย
              </button>
              <button
                onClick={saveKnowledge}
                disabled={knowledgeLoading || knowledgeSaving}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60"
                style={{ backgroundColor: knowledgeSaving ? "#A1BC98" : "#778873" }}
              >
                {knowledgeSaving ? "กำลังบันทึก..." : "บันทึก Knowledge"}
              </button>
            </div>
          </div>
          <textarea
            className={`${inputClass} resize-y min-h-[360px]`}
            style={inputStyle}
            rows={14}
            value={knowledgeLoading ? "กำลังโหลด..." : knowledgeText}
            onChange={(e) => setKnowledgeText(e.target.value)}
            disabled={knowledgeLoading}
          />
          {knowledgeStatus && (
            <p className="mt-2 text-xs" style={{ color: knowledgeStatus.includes("ไม่") ? "#b91c1c" : "#4a5c44" }}>
              {knowledgeStatus}
            </p>
          )}
        </SettingsSection>

        <SettingsSection icon={Bell} title="การแจ้งเตือน">
          <SettingsField label="เวลาส่งสรุปยอดรายวัน">
            <input type="time" className={inputClass} style={inputStyle} value={alertTime} onChange={(e) => setAlertTime(e.target.value)} />
          </SettingsField>
          <div className="space-y-3">
            {[
              { label: "แจ้งเตือนเมื่อมีออเดอร์ใหม่", desc: "เปิด/ปิดการแจ้งเตือนออเดอร์ใหม่", value: notifyNewOrder, onChange: setNotifyNewOrder },
              { label: "สรุปยอดประจำวัน", desc: `ส่งรายงานสรุปทุกวันเวลา ${alertTime} น.`, value: notifyDaily, onChange: setNotifyDaily },
              { label: "แจ้งเตือนสินค้าใกล้หมด", desc: "แจ้งเตือนเมื่อสต็อกเหลือน้อยกว่า 20 คู่", value: notifyLowStock, onChange: setNotifyLowStock },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ backgroundColor: "#F1F3E0" }}>
                <div>
                  <p className="text-sm" style={{ color: "#4a5c44" }}>{item.label}</p>
                  <p className="text-xs" style={{ color: "#6b7280" }}>{item.desc}</p>
                </div>
                <button
                  onClick={() => item.onChange(!item.value)}
                  className="w-12 h-6 rounded-full transition-colors relative shrink-0"
                  style={{ backgroundColor: item.value ? "#778873" : "#D2DCB6" }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
                    style={{ left: item.value ? "26px" : "2px" }}
                  />
                </button>
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection icon={Truck} title="การจัดส่ง">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField label="ค่าจัดส่ง (฿)">
              <input type="number" className={inputClass} style={inputStyle} value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} />
            </SettingsField>
            <SettingsField label="ฟรีค่าส่งเมื่อสั่ง (คู่)">
              <input type="number" className={inputClass} style={inputStyle} value={freeShippingQty} onChange={(e) => setFreeShippingQty(e.target.value)} />
            </SettingsField>
          </div>
        </SettingsSection>
      </div>

      {isKnowledgeExpanded && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 sm:p-6" onClick={() => setIsKnowledgeExpanded(false)}>
          <div
            className="mx-auto h-full max-h-[92vh] w-full max-w-5xl rounded-2xl bg-white p-4 md:p-5 flex flex-col"
            style={{ border: "1px solid #E8EED4" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 style={{ color: "#4a5c44" }}>Knowledge Editor</h3>
                <p className="text-xs" style={{ color: "#9ca3af" }}>แก้ไขข้อมูลอ้างอิงสำหรับ AI แชทฝั่งลูกค้า</p>
              </div>
              <button
                onClick={() => setIsKnowledgeExpanded(false)}
                className="px-3 py-1.5 rounded-lg text-sm border"
                style={{ borderColor: "#D2DCB6", color: "#6b7280" }}
              >
                ปิด
              </button>
            </div>

            <textarea
              className={`${inputClass} flex-1 resize-none min-h-0`}
              style={inputStyle}
              value={knowledgeLoading ? "กำลังโหลด..." : knowledgeText}
              onChange={(e) => setKnowledgeText(e.target.value)}
              disabled={knowledgeLoading}
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs" style={{ color: knowledgeStatus?.includes("ไม่") ? "#b91c1c" : "#9ca3af" }}>
                {knowledgeStatus || ""}
              </p>
              <button
                onClick={saveKnowledge}
                disabled={knowledgeLoading || knowledgeSaving}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60"
                style={{ backgroundColor: knowledgeSaving ? "#A1BC98" : "#778873" }}
              >
                {knowledgeSaving ? "กำลังบันทึก..." : "บันทึก Knowledge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
