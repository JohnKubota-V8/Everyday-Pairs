"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, MessageSquare } from "lucide-react";
import styles from "./AIChatPopup.module.css";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

interface AIChatPopupProps {
  mode: "customer" | "admin";
}

export function AIChatPopup({ mode }: AIChatPopupProps) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "bot",
      text:
        mode === "customer"
          ? "สวัสดีครับ ยินดีต้อนรับสู่ร้าน Everyday-Pairs ครับ 😊 มีอะไรให้ผมช่วยเหลือเรื่องสินค้า เวลาจัดส่ง หรือการสั่งซื้อ สอบถามได้เลยนะครับ"
          : "สวัสดีครับแอดมิน พิมพ์คำสั่งบันทึกยอดขายเป็นภาษาไทยได้เลย เดี๋ยวผมแปลงเป็น JSON action ให้ครับ",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const id = globalThis.crypto?.randomUUID?.() ?? Date.now().toString();
    const userMsg: Message = { id, role: "user", text };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode, history }),
      });
      const data = (await res.json().catch(() => null)) as null | { text?: unknown; error?: unknown; message?: unknown };

      if (!res.ok) {
        const msg = typeof data?.message === "string" ? data.message : "เกิดข้อผิดพลาดจากระบบ AI";
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "bot", text: `❌ ${msg}` }]);
        return;
      }

      const aiText = typeof data?.text === "string" && data.text.trim() ? data.text : "❌ ขออภัยด้วยครับ ไม่สามารถดึงข้อมูลคำตอบได้ในขณะนี้";
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "bot", text: aiText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "bot", text: "❌ เชื่อมต่อระบบช่วยเหลือไม่สำเร็จ" },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Elegant, Friendly Trigger Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-40 px-5 py-3 rounded-full shadow-[0_8px_25px_rgba(119,136,115,0.3)] flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 group overflow-hidden ${styles.triggerButton}`}
        title="ติดต่อสอบถาม"
      >
        {/* Subtle breathing glow */}
        <span className="absolute -inset-1 rounded-full bg-[#A1BC98] opacity-15 blur-[2px] animate-pulse" />
        
        <div className="relative flex items-center gap-2">
          <MessageSquare size={16} className="text-white transition-transform group-hover:-translate-y-0.5 duration-300" />
          <span className="text-white text-sm font-medium tracking-wide select-none font-sans">
            คุยกับ John
          </span>
        </div>
      </button>

      <div
        className={`fixed bottom-24 right-6 z-40 w-[21rem] sm:w-[25rem] md:w-[27rem] rounded-[1.25rem] shadow-[0_15px_40px_rgba(74,92,68,0.12)] flex flex-col overflow-hidden border border-[#D2DCB6] transition-all duration-300 ease-in-out origin-bottom-right ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        } ${styles.popupPanel}`}
      >
        {/* Soft, Minimalist Gradient Header */}
        <div 
          className={`flex items-center justify-between px-4 py-3.5 shadow-sm ${styles.popupHeader}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              {/* Clean initials circle representing Everyday-Pairs or John */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/15 text-white font-sans text-xs font-semibold tracking-wider backdrop-blur-sm shadow-inner select-none">
                EP
              </div>
              {/* Pulsing Active Status Dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#778873]" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75 pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-sm font-medium tracking-wide font-sans">
                {mode === "customer" ? "บริการลูกค้า Everyday-Pairs" : "ระบบคำสั่งแอดมิน (John)"}
              </span>
              <span className="text-white/80 text-[10px] flex items-center gap-1 font-light font-sans">
                ดูแลโดยผู้ช่วยออนไลน์ (John) • พร้อมบริการคุณ
              </span>
            </div>
          </div>
          <button 
            onClick={() => setOpen(false)} 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* Clean Chat Messages Body (Spacious without distracting avatars next to bubbles) */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-3.5 font-sans ${styles.chatBody}`}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${styles.animateMessage} ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] px-4 py-2.5 rounded-[1.25rem] text-sm whitespace-pre-wrap leading-relaxed shadow-sm transition-all hover:shadow-md ${
                  msg.role === "user"
                    ? `text-white rounded-br-sm border border-[#778873] ${styles.userBubble}`
                    : "text-[#4a5c44] rounded-bl-sm bg-white border border-[#D2DCB6]"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {/* Pulsing 3-Dot Typing Loader */}
          {sending && (
            <div className={`flex justify-start ${styles.animateMessage}`}>
              <div className="px-4 py-3 rounded-[1.25rem] rounded-bl-sm bg-white border border-[#D2DCB6] shadow-sm flex items-center gap-1">
                <div className={`w-1.5 h-1.5 bg-[#A1BC98] rounded-full ${styles.animateBounceDot}`} style={{ animationDelay: "0ms" }} />
                <div className={`w-1.5 h-1.5 bg-[#A1BC98] rounded-full ${styles.animateBounceDot}`} style={{ animationDelay: "150ms" }} />
                <div className={`w-1.5 h-1.5 bg-[#A1BC98] rounded-full ${styles.animateBounceDot}`} style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Minimalist Message Input Bar */}
        <div className="flex items-center gap-2.5 p-3.5 border-t border-[#D2DCB6] bg-white">
          <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full border border-[#D2DCB6] bg-[#F1F3E0]/30 focus-within:bg-white focus-within:border-[#778873] focus-within:ring-2 focus-within:ring-[#A1BC98]/40 transition-all duration-200">
            <input
              type="text"
              className="flex-1 text-sm bg-transparent outline-none text-[#4a5c44] placeholder-[#4a5c44]/50"
              placeholder="พิมพ์คำถามของคุณที่นี่..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={sending}
            />
          </div>
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
              input.trim() && !sending
                ? "bg-[#778873] text-white hover:scale-105 active:scale-95 shadow-md shadow-[#778873]/20 cursor-pointer"
                : "bg-[#778873]/30 text-white/50 cursor-not-allowed"
            }`}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
