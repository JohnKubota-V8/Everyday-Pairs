export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: "student" | "white" | "black" | "other";
  description: string;
  material: string;
  isNew: boolean;
  isFeatured: boolean;
  bgColor: string;
  sockColor: string;
  stock: number;
  sizes: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  phone: string;
  items: { productId: string; name: string; quantity: number; price: number; size: string }[];
  total: number;
  shippingFee: number;
  address: string;
  note: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  time: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "ถุงเท้านักเรียนขาว ข้อยาว",
    price: 35,
    category: "student",
    description: "ถุงเท้านักเรียนขาวข้อยาว ผ้าคอตตอน 100% ใส่สบาย ทนทาน ไม่ยืด",
    material: "Cotton 100%",
    isNew: false,
    isFeatured: true,
    bgColor: "#F1F3E0",
    sockColor: "#f5f5f5",
    stock: 150,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "2",
    name: "ถุงเท้านักเรียนขาว ข้อสั้น",
    price: 30,
    category: "student",
    description: "ถุงเท้านักเรียนขาวข้อสั้น เบาสบาย ไม่ร้อน เหมาะทุกฤดูกาล",
    material: "Cotton 95%, Spandex 5%",
    isNew: true,
    isFeatured: true,
    bgColor: "#EEF0DC",
    sockColor: "#eeeeee",
    stock: 200,
    sizes: ["S", "M", "L"],
  },
  {
    id: "3",
    name: "ถุงเท้านักเรียนกรมท่า ข้อยาว",
    price: 35,
    category: "student",
    description: "ถุงเท้านักเรียนสีกรมท่า ข้อยาว เหมาะสำหรับนักเรียนมัธยม",
    material: "Cotton 100%",
    isNew: false,
    isFeatured: false,
    bgColor: "#e8eaf6",
    sockColor: "#3949ab",
    stock: 80,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "4",
    name: "ถุงเท้าขาว สปอร์ต",
    price: 45,
    originalPrice: 60,
    category: "white",
    description: "ถุงเท้าขาวสไตล์สปอร์ต มีแถบสีเขียว กันลื่น นุ่มนวล",
    material: "Cotton 80%, Polyester 20%",
    isNew: true,
    isFeatured: true,
    bgColor: "#F1F3E0",
    sockColor: "#ffffff",
    stock: 120,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "5",
    name: "ถุงเท้าขาว ลูกไม้",
    price: 55,
    category: "white",
    description: "ถุงเท้าขาวตกแต่งลายลูกไม้ น่ารัก หวาน เหมาะสำหรับทุกโอกาส",
    material: "Cotton 90%, Lace 10%",
    isNew: false,
    isFeatured: true,
    bgColor: "#fff9f9",
    sockColor: "#fce4ec",
    stock: 60,
    sizes: ["Free Size"],
  },
  {
    id: "6",
    name: "ถุงเท้าดำ ข้อยาว",
    price: 40,
    category: "black",
    description: "ถุงเท้าดำข้อยาว คลาสสิก ใส่ได้ทุกโอกาส ทนทาน",
    material: "Cotton 95%, Spandex 5%",
    isNew: false,
    isFeatured: true,
    bgColor: "#fafafa",
    sockColor: "#212121",
    stock: 180,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "7",
    name: "ถุงเท้าดำ ข้อสั้น",
    price: 35,
    category: "black",
    description: "ถุงเท้าดำข้อสั้น เรียบหรู สวมใส่สบาย",
    material: "Cotton 95%, Spandex 5%",
    isNew: false,
    isFeatured: false,
    bgColor: "#f5f5f5",
    sockColor: "#1a1a1a",
    stock: 200,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "8",
    name: "ถุงเท้าลายดอกไม้",
    price: 65,
    category: "other",
    description: "ถุงเท้าลายดอกไม้น่ารัก สดใส มีหลายลาย เหมาะเป็นของขวัญ",
    material: "Cotton 85%, Polyester 15%",
    isNew: true,
    isFeatured: true,
    bgColor: "#fce4ec",
    sockColor: "#f06292",
    stock: 45,
    sizes: ["Free Size"],
  },
  {
    id: "9",
    name: "ถุงเท้าขาว คอตตอนหนา",
    price: 50,
    category: "white",
    description: "ถุงเท้าขาวผ้าหนา นุ่มสบาย เหมาะสำหรับสวมในบ้านและออกนอกบ้าน",
    material: "Cotton 100%",
    isNew: false,
    isFeatured: false,
    bgColor: "#f9f9f9",
    sockColor: "#f0f0f0",
    stock: 90,
    sizes: ["S", "M", "L"],
  },
  {
    id: "10",
    name: "ถุงเท้าดำ สปอร์ต",
    price: 50,
    originalPrice: 65,
    category: "black",
    description: "ถุงเท้าดำสไตล์สปอร์ต นุ่ม กันกระแทก เหมาะสำหรับออกกำลังกาย",
    material: "Cotton 75%, Polyester 25%",
    isNew: true,
    isFeatured: false,
    bgColor: "#f5f5f5",
    sockColor: "#333333",
    stock: 110,
    sizes: ["S", "M", "L", "XL"],
  },
];

export const hourlySales = [
  { hour: "20:00", sales: 350, orders: 5 },
  { hour: "21:00", sales: 820, orders: 12 },
  { hour: "22:00", sales: 1240, orders: 18 },
  { hour: "23:00", sales: 960, orders: 14 },
  { hour: "00:00", sales: 430, orders: 7 },
];

export const topSelling = [
  { name: "ถุงเท้านักเรียนขาว ข้อยาว", sold: 45, percentage: 90 },
  { name: "ถุงเท้าดำ ข้อยาว", sold: 38, percentage: 76 },
  { name: "ถุงเท้าขาว สปอร์ต", sold: 32, percentage: 64 },
  { name: "ถุงเท้านักเรียนขาว ข้อสั้น", sold: 28, percentage: 56 },
  { name: "ถุงเท้าลายดอกไม้", sold: 22, percentage: 44 },
];

export const recentOrders: Order[] = [
  {
    id: "1",
    orderNumber: "EP-001",
    customer: "คุณสมหญิง ใจดี",
    phone: "081-234-5678",
    items: [
      { productId: "1", name: "ถุงเท้านักเรียนขาว ข้อยาว", quantity: 3, price: 35, size: "M" },
      { productId: "6", name: "ถุงเท้าดำ ข้อยาว", quantity: 2, price: 40, size: "L" },
    ],
    total: 185,
    shippingFee: 50,
    address: "123 ถ.สุขุมวิท กรุงเทพฯ 10110",
    note: "",
    status: "confirmed",
    createdAt: "2026-05-17",
    time: "21:30",
  },
  {
    id: "2",
    orderNumber: "EP-002",
    customer: "คุณมานะ เพียรพยายาม",
    phone: "089-876-5432",
    items: [{ productId: "4", name: "ถุงเท้าขาว สปอร์ต", quantity: 2, price: 45, size: "L" }],
    total: 90,
    shippingFee: 50,
    address: "45/6 ถ.รัชดา กรุงเทพฯ 10400",
    note: "ส่งด่วน",
    status: "shipped",
    createdAt: "2026-05-17",
    time: "22:15",
  },
  {
    id: "3",
    orderNumber: "EP-003",
    customer: "คุณวิภา สวยงาม",
    phone: "062-111-2222",
    items: [
      { productId: "5", name: "ถุงเท้าขาว ลูกไม้", quantity: 1, price: 55, size: "Free Size" },
      { productId: "8", name: "ถุงเท้าลายดอกไม้", quantity: 2, price: 65, size: "Free Size" },
    ],
    total: 185,
    shippingFee: 50,
    address: "78 ซ.ลาดพร้าว 15 กรุงเทพฯ 10310",
    note: "ห่อของขวัญด้วยนะคะ",
    status: "pending",
    createdAt: "2026-05-17",
    time: "23:05",
  },
  {
    id: "4",
    orderNumber: "EP-004",
    customer: "คุณประเสริฐ ดีมาก",
    phone: "093-333-4444",
    items: [{ productId: "2", name: "ถุงเท้านักเรียนขาว ข้อสั้น", quantity: 5, price: 30, size: "M" }],
    total: 150,
    shippingFee: 50,
    address: "99 ถ.พหลโยธิน กรุงเทพฯ 10900",
    note: "",
    status: "delivered",
    createdAt: "2026-05-16",
    time: "20:45",
  },
  {
    id: "5",
    orderNumber: "EP-005",
    customer: "คุณนิดา รักสุขภาพ",
    phone: "085-555-6666",
    items: [
      { productId: "10", name: "ถุงเท้าดำ สปอร์ต", quantity: 2, price: 50, size: "S" },
      { productId: "7", name: "ถุงเท้าดำ ข้อสั้น", quantity: 3, price: 35, size: "S" },
    ],
    total: 205,
    shippingFee: 50,
    address: "12 ถ.พระราม 9 กรุงเทพฯ 10310",
    note: "",
    status: "confirmed",
    createdAt: "2026-05-17",
    time: "21:00",
  },
];

export const monthlySales = [
  { month: "ม.ค.", sales: 12400, orders: 180 },
  { month: "ก.พ.", sales: 15800, orders: 220 },
  { month: "มี.ค.", sales: 11200, orders: 165 },
  { month: "เม.ย.", sales: 18600, orders: 268 },
  { month: "พ.ค.", sales: 14300, orders: 198 },
];
