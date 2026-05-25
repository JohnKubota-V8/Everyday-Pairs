"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function UpdateUsernameForm({
  userId,
  currentUsername,
}: {
  userId: string;
  currentUsername: string;
}) {
  const supabase = createClient();
  const [username, setUsername] = useState(currentUsername);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      setError("กรุณากรอกชื่อผู้ใช้");
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: username.trim() })
      .eq("id", userId);

    setSaving(false);
    if (updateError) {
      setError("บันทึกไม่สำเร็จ");
      return;
    }
    setSaved(true);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        className="px-3 py-1.5 rounded-lg text-xs outline-none border"
        style={{ borderColor: "#D2DCB6" }}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-3 py-1.5 rounded-lg text-xs text-white"
        style={{ backgroundColor: "#778873", opacity: saving ? 0.6 : 1 }}
      >
        {saving ? "กำลังบันทึก" : "บันทึก"}
      </button>
      {saved && <span className="text-xs" style={{ color: "#A1BC98" }}>บันทึกแล้ว</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
