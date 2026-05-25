"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function mapAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login") || normalized.includes("invalid email or password")) {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }
  if (normalized.includes("email not confirmed") || normalized.includes("email not confirmed")) {
    return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ";
  }
  if (normalized.includes("password should be") || normalized.includes("password")) {
    return "รหัสผ่านไม่ผ่านเงื่อนไขขั้นต่ำ";
  }
  if (normalized.includes("already registered") || normalized.includes("user already exists")) {
    return "อีเมลนี้ถูกใช้งานแล้ว";
  }
  return message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
}

export function Login() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    const identifier = loginId.trim();
    if (!identifier) {
      setError("กรุณากรอกอีเมลหรือชื่อผู้ใช้");
      return;
    }

    let emailToUse = identifier;
    if (!identifier.includes("@")) {
      const res = await fetch("/api/auth/resolve-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: identifier }),
      });
      const json = (await res.json().catch(() => ({}))) as { email?: string; error?: string };
      if (!res.ok) {
        setError("อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }
      if (!json.email) {
        setError("อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }
      emailToUse = json.email;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });
    if (authError) {
      setError(mapAuthError(authError.message));
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    const { data: adminRow } = userId
      ? await supabase.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle()
      : { data: null };
    if (adminRow) {
      router.push("/admin/dashboard");
    } else {
      router.push("/");
    }

    // Ensure layouts re-render with the new session.
    router.refresh();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!name.trim()) {
      setError("กรุณากรอกชื่อ");
      return;
    }
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: name.trim(),
        },
      },
    });
    if (authError) {
      setError(mapAuthError(authError.message));
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }
    setNotice("สมัครสำเร็จ กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
  };

  const handleGuest = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#F1F3E0" }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-1 text-sm mb-6" style={{ color: "#778873" }}>
          <ArrowLeft size={15} /> กลับหน้าหลัก
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: "1px solid #D2DCB6" }}>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold mb-3" style={{ backgroundColor: "#778873" }}>
              EP
            </div>
            <h1 className="text-lg font-semibold" style={{ color: "#4a5c44" }}>Everyday-Pairs</h1>
            <p className="text-sm" style={{ color: "#9ca3af" }}>ร้านถุงเท้าออนไลน์</p>
          </div>

          <div className="flex rounded-xl p-1 mb-6" style={{ backgroundColor: "#F1F3E0" }}>
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className="flex-1 py-2 text-sm rounded-lg transition-all"
                style={{
                  backgroundColor: tab === t ? "#778873" : "transparent",
                  color: tab === t ? "white" : "#6b7280",
                  fontWeight: tab === t ? 500 : 400,
                }}
              >
                {t === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </button>
            ))}
          </div>

          <form onSubmit={tab === "login" ? handleLogin : handleRegister} className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="block text-sm mb-1.5" style={{ color: "#4a5c44" }}>ชื่อผู้ใช้</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors"
                  style={{ borderColor: "#D2DCB6" }}
                  placeholder="กรอกชื่อผู้ใช้"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            {tab === "login" ? (
              <div>
                <label className="block text-sm mb-1.5" style={{ color: "#4a5c44" }}>อีเมล หรือชื่อผู้ใช้</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors"
                  style={{ borderColor: "#D2DCB6" }}
                  placeholder="example@email.com หรือ username"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm mb-1.5" style={{ color: "#4a5c44" }}>อีเมล</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors"
                  style={{ borderColor: "#D2DCB6" }}
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#4a5c44" }}>รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm outline-none border transition-colors"
                  style={{ borderColor: "#D2DCB6" }}
                  placeholder="รหัสผ่านอย่างน้อย 4 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
            {notice && <p className="text-xs" style={{ color: "#6b7280" }}>{notice}</p>}

            {tab === "login" && (
              <p className="text-xs" style={{ color: "#9ca3af" }}>
                แอดมินจะถูกพาไปหน้าแอดมินอัตโนมัติ
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 text-white"
              style={{ backgroundColor: "#778873" }}
            >
              {tab === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: "#D2DCB6" }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs bg-white" style={{ color: "#9ca3af" }}>หรือ</span>
            </div>
          </div>

          <button
            onClick={handleGuest}
            className="w-full py-2.5 rounded-xl text-sm transition-all border"
            style={{ borderColor: "#D2DCB6", color: "#6b7280" }}
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
}
