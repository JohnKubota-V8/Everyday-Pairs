import { cookies } from "next/headers";
import { AdminLayout } from "@/app/components/AdminLayout";
import { createClient } from "@/utils/supabase/server";
import { UpdateUsernameForm } from "@/app/admin/users/update-username-form";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, username, email, created_at")
    .order("created_at", { ascending: false });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 style={{ color: "#4a5c44" }}>ผู้ใช้</h1>
          <p className="text-sm" style={{ color: "#9ca3af" }}>รายชื่อผู้ใช้ในระบบ</p>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EED4" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#F1F3E0" }}>
                  {["ชื่อผู้ใช้", "อีเมล", "วันที่สร้าง", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: "#6b7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#E8EED4" }}>
                {profiles?.map((profile) => (
                  <tr key={profile.id} className="hover:bg-[#fafafa]">
                    <td className="px-5 py-3 text-sm" style={{ color: "#4a5c44" }}>{profile.username}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: "#6b7280" }}>{profile.email}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: "#9ca3af" }}>
                      {new Date(profile.created_at).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-5 py-3">
                      <UpdateUsernameForm userId={profile.id} currentUsername={profile.username} />
                    </td>
                  </tr>
                ))}
                {!profiles?.length && (
                  <tr>
                    <td className="px-5 py-6 text-sm" style={{ color: "#9ca3af" }} colSpan={4}>
                      {error ? "โหลดข้อมูลไม่สำเร็จ" : "ยังไม่มีผู้ใช้"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
