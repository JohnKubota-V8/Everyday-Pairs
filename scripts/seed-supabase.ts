import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type ProductSeed = {
  slug: string;
  name: string;
  price: number;
  original_price?: number | null;
  category: string;
  description: string;
  material: string;
  is_new: boolean;
  is_featured: boolean;
  bg_color: string;
  sock_color: string;
  stock: number;
  sizes: string[];
};

const products: ProductSeed[] = [
  {
    slug: "student-white-long",
    name: "ถุงเท้านักเรียนขาว ข้อยาว",
    price: 35,
    category: "student",
    description: "ถุงเท้านักเรียนขาวข้อยาว ใส่สบาย เรียบง่าย เหมาะกับทุกวัน",
    material: "Cotton 100%",
    is_new: false,
    is_featured: true,
    bg_color: "#F1F3E0",
    sock_color: "#f5f5f5",
    stock: 120,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "white-sport",
    name: "ถุงเท้าขาว สปอร์ต",
    price: 45,
    original_price: 60,
    category: "white",
    description: "ถุงเท้าขาวสไตล์สปอร์ต นุ่ม เบา ใส่ได้ทุกโอกาส",
    material: "Cotton 80%, Polyester 20%",
    is_new: true,
    is_featured: true,
    bg_color: "#EEF0DC",
    sock_color: "#ffffff",
    stock: 90,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "black-long",
    name: "ถุงเท้าดำ ข้อยาว",
    price: 40,
    category: "black",
    description: "ถุงเท้าดำคลาสสิก สวมใส่สบาย ใช้งานได้ทุกวัน",
    material: "Cotton 95%, Spandex 5%",
    is_new: false,
    is_featured: true,
    bg_color: "#fafafa",
    sock_color: "#212121",
    stock: 140,
    sizes: ["S", "M", "L", "XL"],
  },
];

const todos = [
  { id: "00000000-0000-4000-8000-000000000001", name: "ตรวจสต็อกสินค้า" },
  { id: "00000000-0000-4000-8000-000000000002", name: "สรุปรายงานประจำวัน" },
];

const seedUsers = [
  {
    email: "admin@milkbor.local",
    password: "Admin1234!",
    username: "admin",
  },
  {
    email: "customer@milkbor.local",
    password: "Customer1234!",
    username: "customer",
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

async function ensureAuthUser(email: string, password: string, username: string) {
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;

  const existing = usersData.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { username },
    });
    if (error) throw error;
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });
  if (error) throw error;
  return data.user;
}

async function main() {
  const users = await Promise.all(
    seedUsers.map((user) => ensureAuthUser(user.email, user.password, user.username))
  );

  const adminUser = users[0];
  const customerUser = users[1];

  if (!adminUser || !customerUser) {
    throw new Error("Failed to create seed users");
  }

  const profileRows = users.map((user, index) => ({
    id: user.id,
    username: seedUsers[index]?.username ?? slugify(user.email ?? "user"),
    email: user.email ?? "",
  }));

  const { error: profilesError } = await supabase.from("profiles").upsert(profileRows, { onConflict: "id" });
  if (profilesError) throw profilesError;

  const { error: adminUsersError } = await supabase
    .from("admin_users")
    .upsert([{ user_id: adminUser.id }], { onConflict: "user_id" });
  if (adminUsersError) throw adminUsersError;

  const productRows = products.map((product) => ({
    slug: product.slug,
    name: product.name,
    price: product.price,
    original_price: product.original_price ?? null,
    category: product.category,
    description: product.description,
    material: product.material,
    is_new: product.is_new,
    is_featured: product.is_featured,
    bg_color: product.bg_color,
    sock_color: product.sock_color,
    stock: product.stock,
    sizes: product.sizes,
  }));

  const { error: productsError } = await supabase.from("products").upsert(productRows, { onConflict: "slug" });
  if (productsError) throw productsError;

  const { error: todosError } = await supabase.from("todos").upsert(todos, { onConflict: "id" });
  if (todosError) throw todosError;

  console.log(`Seeded ${productRows.length} products`);
  console.log(`Seeded ${profileRows.length} profiles`);
  console.log("Seeded 1 admin user and 1 customer user");
  console.log(`Seeded ${todos.length} todos`);
  console.log("Login demo accounts:");
  console.log("- admin@milkbor.local / Admin1234!");
  console.log("- customer@milkbor.local / Customer1234!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
