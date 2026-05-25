# Everyday-Pairs

Everyday-Pairs คือเว็บแอปพลิเคชันสำหรับร้านขายถุงเท้าออนไลน์ มีทั้งหน้าร้านสำหรับลูกค้าและระบบหลังบ้านสำหรับผู้ดูแลร้าน จุดประสงค์ของระบบคือช่วยให้การขายสินค้า การจัดการออเดอร์ การดูสต็อก และการตอบคำถามลูกค้าทำได้เป็นระบบมากขึ้น

Live demo: https://everyday-pairs.milkbor.me/

เอกสารแนวคิด Pivot: [PIVOT.md](PIVOT.md)

## ภาพรวมระบบ

โปรเจกต์นี้พัฒนาจากโจทย์ร้านขายถุงเท้าที่เดิมยังไม่มีระบบจัดการสินค้าอย่างชัดเจน ผู้ขายต้องจำจำนวนสินค้าเองและต้องเดินไปตรวจสอบสต็อกทุกครั้งเมื่อมีออเดอร์เข้ามา ระบบ Everyday-Pairs จึงถูกออกแบบให้ช่วยรวมข้อมูลสินค้า ออเดอร์ ยอดขาย และข้อมูลสำหรับตอบคำถามลูกค้าไว้ในที่เดียว

## ฟีเจอร์หลัก

ฝั่งลูกค้า:

- ดูรายการสินค้า ถุงเท้าใหม่ และสินค้าแนะนำ
- เลือกสินค้า ขนาด และเพิ่มลงตะกร้า
- กรอกข้อมูลจัดส่งและสร้างออเดอร์
- ดูหน้าสรุปหลังสั่งซื้อสำเร็จ
- ใช้ผู้ช่วย AI เพื่อถามข้อมูลเกี่ยวกับสินค้าและร้าน

ฝั่งผู้ดูแลร้าน:

- ดูแดชบอร์ดยอดขาย จำนวนออเดอร์ และรายการขายล่าสุด
- จัดการสินค้า เมนูสินค้า และข้อมูลที่เกี่ยวข้องกับร้าน
- ตรวจสอบและจัดการออเดอร์
- ดูรายงานยอดขาย
- ตั้งค่าข้อมูลร้านและ knowledge base สำหรับ AI
- ใช้ AI ช่วยสร้างคำตอบหรือคำอธิบายสินค้า

## เทคโนโลยีที่ใช้

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase SSR และ Supabase JS
- Google Gemini API
- Recharts
- Lucide React
- Motion
- Docker

## โครงสร้างหน้าเว็บ

```text
/                  หน้าหลักของร้าน
/products          หน้ารายการสินค้า
/cart              หน้าตะกร้าสินค้า
/order-success     หน้าสั่งซื้อสำเร็จ
/login             หน้าเข้าสู่ระบบ
/admin/dashboard   แดชบอร์ดผู้ดูแลร้าน
/admin/menu        จัดการเมนูหรือรายการสินค้า
/admin/orders      จัดการออเดอร์
/admin/reports     รายงานยอดขาย
/admin/settings    ตั้งค่าระบบและข้อมูลร้าน
/admin/users       หน้าผู้ใช้งาน
```

## API ที่สำคัญ

```text
/api/products              ดึงรายการสินค้าสำหรับหน้าร้าน
/api/orders                สร้างออเดอร์จากฝั่งลูกค้า
/api/sales/log             บันทึกข้อมูลยอดขาย
/api/ai/chat               ผู้ช่วย AI สำหรับลูกค้าและผู้ดูแลร้าน
/api/admin/dashboard       ข้อมูลแดชบอร์ดหลังบ้าน
/api/admin/products        จัดการสินค้าหลังบ้าน
/api/admin/orders          จัดการออเดอร์หลังบ้าน
/api/admin/reports         ข้อมูลรายงานยอดขาย
/api/admin/knowledge       จัดการ knowledge base ของ AI
/api/admin/caption         สร้าง caption ด้วย AI
/api/auth/resolve-email    ตรวจสอบข้อมูลอีเมลสำหรับการเข้าสู่ระบบ
```

## การติดตั้งและรันโปรเจกต์

### สิ่งที่ต้องมี

- Node.js 20 ขึ้นไป
- npm
- Supabase project
- Google API key หากต้องการใช้งานฟีเจอร์ AI

### macOS/Linux

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Windows PowerShell

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

หลังจากรันสำเร็จ เปิดเว็บที่ http://localhost:3000

## Environment Variables

สร้างไฟล์ `.env.local` จาก `.env.example` แล้วใส่ค่าตามโปรเจกต์จริง

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_API_KEY=
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_API_VERSION=v1beta
GEMINI_MODELS=gemini-2.5-flash,gemini-2.0-flash
```

หมายเหตุ: ตัวแปรที่ขึ้นต้นด้วย `NEXT_PUBLIC_` จะถูกส่งไปยังฝั่ง browser ได้ ส่วน `SUPABASE_SERVICE_ROLE_KEY` และ `GOOGLE_API_KEY` ต้องเก็บไว้เฉพาะฝั่ง server เท่านั้น

## คำสั่งที่ใช้บ่อย

```bash
npm run dev            # รัน development server
npm run build          # build โปรเจกต์สำหรับ production
npm run start          # รัน production server
npm run lint           # ตรวจสอบโค้ดด้วย ESLint
npm run seed:supabase  # seed ข้อมูลเริ่มต้นลง Supabase
```

## การตั้งค่าฐานข้อมูล

ไฟล์สำหรับตั้งค่า schema และ migration อยู่ในโฟลเดอร์ `scripts/`

```text
scripts/bootstrap-schema.sql
scripts/migrate-create-orders.sql
scripts/migrate-create-sales-logs.sql
scripts/migrate-create-app-settings.sql
scripts/migrate-products-colors.sql
scripts/migrate-products-uuid-slug.sql
scripts/migrate-align-existing-orders-schema.sql
scripts/seed-supabase.ts
scripts/seed-products.ts
```

ขั้นตอนโดยสรุป:

1. สร้าง Supabase project
2. ตั้งค่า environment variables ใน `.env.local`
3. รัน SQL schema หรือ migration ที่จำเป็นจากโฟลเดอร์ `scripts/`
4. รัน `npm run seed:supabase` เพื่อเพิ่มข้อมูลเริ่มต้น
5. รัน `npm run dev` แล้วตรวจสอบหน้าร้านและระบบหลังบ้าน

## โครงสร้างโปรเจกต์

```text
Everyday-Pairs/
├─ app/
│  ├─ api/                  API routes ของระบบ
│  │  ├─ products/          API รายการสินค้า
│  │  ├─ orders/            API สร้างและจัดการออเดอร์
│  │  ├─ sales/             API บันทึกยอดขาย
│  │  ├─ ai/                API ผู้ช่วย AI
│  │  └─ admin/             API สำหรับระบบหลังบ้าน
│  ├─ admin/                หน้าระบบหลังบ้าน เช่น dashboard, orders, reports
│  ├─ cart/                 หน้าตะกร้าสินค้า
│  ├─ products/             หน้ารายการสินค้า
│  ├─ order-success/        หน้าสั่งซื้อสำเร็จ
│  ├─ login/                หน้าเข้าสู่ระบบ
│  ├─ components/           component และ layout ที่ใช้ร่วมกัน
│  ├─ context/              state หลักของแอป เช่น cart
│  ├─ data/                 mock data และ type ของสินค้า
│  ├─ pages/                component หลักของแต่ละหน้า
│  ├─ globals.css           style หลักของแอป
│  ├─ layout.tsx            root layout
│  └─ page.tsx              หน้าหลักของร้าน
├─ scripts/                 SQL migration, bootstrap และ seed scripts
├─ utils/
│  └─ supabase/             Supabase client สำหรับ browser, server และ middleware
├─ public/                  static assets ถ้ามี
├─ Dockerfile               config สำหรับ build และ run ด้วย Docker
├─ package.json             scripts และ dependencies ของโปรเจกต์
├─ next.config.ts           config ของ Next.js
└─ README.md                เอกสารอธิบายโปรเจกต์
```

## Docker

### macOS/Linux

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your-supabase-url \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key \
  -t everyday-pairs .

docker run --env-file .env.local -p 3000:3000 everyday-pairs
```

### Windows PowerShell

```powershell
docker build `
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your-supabase-url `
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key `
  -t everyday-pairs .

docker run --env-file .env.local -p 3000:3000 everyday-pairs
```

## Checklist ก่อนส่งงาน

- Live demo เปิดใช้งานได้: https://everyday-pairs.milkbor.me/
- README อธิบาย domain ร้านขายถุงเท้า Everyday-Pairs ชัดเจน
- มีลิงก์ไปยัง [PIVOT.md](PIVOT.md)
- ไม่มี `.env.local` หรือ credential จริงถูก commit ขึ้น git
- รัน `npm run lint` เพื่อตรวจสอบโค้ดก่อนส่ง
- ทดสอบ flow หลัก ได้แก่ ดูสินค้า เพิ่มลงตะกร้า สร้างออเดอร์ และเปิดหน้า admin

## หมายเหตุสำหรับการพัฒนา

- ใช้ `.env.local` สำหรับค่า secret ในเครื่องเท่านั้น
- ห้ามเปิดเผย `SUPABASE_SERVICE_ROLE_KEY` หรือ `GOOGLE_API_KEY` ในโค้ดฝั่ง client
- หากมีการเปลี่ยน schema ควรเก็บ SQL ที่ใช้ไว้ใน `scripts/` เพื่อให้ setup ซ้ำได้
- ฟีเจอร์ AI จะทำงานได้เมื่อมี `GOOGLE_API_KEY` และข้อมูล knowledge base ที่เหมาะสม
