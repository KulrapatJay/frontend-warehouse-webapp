import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// --- (ส่วน Interface ไม่มีการเปลี่ยนแปลง) ---
interface SalesOrder {
  id: number;
  order_date: string;
  total_amount: string;
  status: { status_name: string; };
  items: Array<{
    quantity: number;
    unit_price: string;
    product: { product_name: string; };
  }>;
}
interface ReportOptions { year?: string | null; startDate?: string | null; endDate?: string | null; }
interface TopProduct { name: string; qty: number; price: number; }
interface KPIData { totalMonthSales: number; todayOrdersCount: number; todaySales: number; }
interface YearlyData {
  salesByMonth: number[];
  ordersByMonth: number[];
  topProducts: TopProduct[];
  previousYearTotalSales: number;
  previousYearTotalOrders: number;
}
interface WeeklyData {
  salesByWeek: number[];
  ordersByWeek: number[];
  topProducts: TopProduct[];
  previousWeekTotalSales: number;
  previousWeekTotalOrders: number;
}
interface MonthlyData { totalMonthSales: number; topProducts: TopProduct[]; }
interface DailyData { ordersCount: number; totalSales: number; }
type ReportData = KPIData | YearlyData | WeeklyData | MonthlyData | DailyData | { error: string };


// --- ส่วนที่ 1: เพิ่มโค้ดสำหรับ Caching  ---
interface Cache<T> {
  data: T;
  timestamp: number;
}
// สร้างที่เก็บ Cache แบบง่ายๆ (ข้อมูลจะหายไปเมื่อเซิร์ฟเวอร์รีสตาร์ท)
const cacheStore: { [key: string]: Cache<any> } = {};
// กำหนดอายุของ Cache เป็น 60 วินาที (1 นาที)
const CACHE_TTL_SECONDS = 60;


export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); 
    const year = searchParams.get('year');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // ---  ส่วนที่ 2: แก้ไข Logic การ Fetch ข้อมูลให้ใช้ Cache  ---
    const cacheKey = `salesOrders:${token}`;
    const now = Date.now();
    let salesOrders: SalesOrder[];

    // ตรวจสอบว่ามี Cache อยู่และยังไม่หมดอายุหรือไม่
    if (cacheStore[cacheKey] && (now - cacheStore[cacheKey].timestamp) / 1000 < CACHE_TTL_SECONDS) {
      // ถ้ามี ให้ใช้ข้อมูลจาก Cache โดยไม่ต้องยิง API ใหม่
      console.log("Using cached sales orders.");
      salesOrders = cacheStore[cacheKey].data;
    } else {
      // ถ้าไม่มี หรือ Cache หมดอายุ ให้ไปดึงข้อมูลใหม่จาก Backend หลัก
      console.log("Fetching new sales orders from backend.");
      const backendApiUrl = `${process.env.BACKEND_API_URL}/api/sales-orders`;
      const apiResponse = await fetch(backendApiUrl, {
        method: "GET",
        headers: { Cookie: `token=${token}` },
      });

      if (!apiResponse.ok) {
          console.error('Backend API Error:', {
              status: apiResponse.status,
              statusText: apiResponse.statusText,
          });
          throw new Error('Failed to fetch sales orders');
      }

      salesOrders = await apiResponse.json();
      
      // เก็บข้อมูลใหม่ที่เพิ่งดึงมาลงใน Cache
      cacheStore[cacheKey] = {
        data: salesOrders,
        timestamp: now,
      };
    }

    const processedData = processReportData(salesOrders, type, { year, startDate, endDate });
    return NextResponse.json(processedData);
    
  } catch (error) {
    console.error("Reports API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// --- (ฟังก์ชัน processReportData และ processKPIData) ---
function processReportData(salesOrders: SalesOrder[], type: string | null, options: ReportOptions): ReportData {
  const today = new Date();
  
  switch (type) {
    case 'kpi':
      return processKPIData(salesOrders, today);
    case 'yearly':
      const yearValue = options.year ? parseInt(options.year) : today.getFullYear();
      return processYearlyData(salesOrders, yearValue || today.getFullYear());
    case 'weekly':
      const endDateValue = options.endDate ? new Date(options.endDate) : today;
      return processWeeklyData(salesOrders, endDateValue);
    case 'monthly':
      return processMonthlyData(salesOrders, options.startDate, options.endDate);
    case 'daily':
      return processDailyData(salesOrders, options.startDate);
    default:
      return { error: 'Invalid type parameter' };
  }
}
function processKPIData(salesOrders: SalesOrder[], today: Date): KPIData {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const monthlyOrders = salesOrders.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate >= thirtyDaysAgo && orderDate <= today && order.status.status_name !== 'ยกเลิก';
    });
    
    const todayOrders = salesOrders.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate.toDateString() === today.toDateString() && order.status.status_name !== 'ยกเลิก';
    });
    
    const totalMonthSales = monthlyOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    const todayOrdersCount = todayOrders.length;
    const todaySales = todayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    
    return {
      totalMonthSales,
      todayOrdersCount,
      todaySales
    };
}
  
// --- ส่วนที่ 2: แก้ไข processYearlyData และ processWeeklyData  ---
function processYearlyData(salesOrders: SalesOrder[], year: number): YearlyData {
  const previousYear = year - 1;

  const monthlyData = Array(12).fill(0);
  const monthlyOrdersCount = Array(12).fill(0);
  const productSales: { [key: string]: { qty: number; price: number } } = {};
  
  let previousYearTotalSales = 0;
  let previousYearTotalOrders = 0;
  
  salesOrders.forEach(order => {
    const orderDate = new Date(order.order_date);
    const orderYear = orderDate.getFullYear();

    if (order.status.status_name === 'ยกเลิก') return;

    if (orderYear === year) {
      const month = orderDate.getMonth();
      monthlyData[month] += parseFloat(order.total_amount);
      monthlyOrdersCount[month] += 1;
      
      order.items.forEach((item) => {
        const productName = item.product.product_name;
        if (!productSales[productName]) {
          productSales[productName] = { qty: 0, price: 0 };
        }
        productSales[productName].qty += item.quantity;
        productSales[productName].price += item.quantity * parseFloat(item.unit_price);
      });
    } else if (orderYear === previousYear) {
      previousYearTotalSales += parseFloat(order.total_amount);
      previousYearTotalOrders += 1;
    }
  });
  
  const topProducts: TopProduct[] = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);
  
  return {
    salesByMonth: monthlyData,
    ordersByMonth: monthlyOrdersCount,
    topProducts,
    previousYearTotalSales, // ส่งค่ากลับ
    previousYearTotalOrders, // ส่งค่ากลับ
  };
}
  
function processWeeklyData(salesOrders: SalesOrder[], endDate: Date): WeeklyData {
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6);
  
  const previousWeekEndDate = new Date(startDate);
  previousWeekEndDate.setDate(startDate.getDate() - 1);
  const previousWeekStartDate = new Date(previousWeekEndDate);
  previousWeekStartDate.setDate(previousWeekEndDate.getDate() - 6);

  const dailyData = Array(7).fill(0);
  const dailyOrdersCount = Array(7).fill(0);
  const productSales: { [key: string]: { qty: number; price: number } } = {};
  
  let previousWeekTotalSales = 0;
  let previousWeekTotalOrders = 0;
  
  salesOrders.forEach(order => {
    const orderDate = new Date(order.order_date);
    if (order.status.status_name === 'ยกเลิก') return;

    if (orderDate >= startDate && orderDate <= endDate) {
      const dayIndex = Math.floor((orderDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < 7) {
        dailyData[dayIndex] += parseFloat(order.total_amount);
        dailyOrdersCount[dayIndex] += 1;
        
        order.items.forEach((item) => {
          const productName = item.product.product_name;
          if (!productSales[productName]) { productSales[productName] = { qty: 0, price: 0 }; }
          productSales[productName].qty += item.quantity;
          productSales[productName].price += item.quantity * parseFloat(item.unit_price);
        });
      }
    } else if (orderDate >= previousWeekStartDate && orderDate <= previousWeekEndDate) {
      previousWeekTotalSales += parseFloat(order.total_amount);
      previousWeekTotalOrders += 1;
    }
  });
  
  const topProducts: TopProduct[] = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);
  
  return {
    salesByWeek: dailyData,
    ordersByWeek: dailyOrdersCount,
    topProducts,
    previousWeekTotalSales, // ส่งค่ากลับ
    previousWeekTotalOrders, // ส่งค่ากลับ
  };
}

// --- (ฟังก์ชัน processMonthlyData และ processDailyData ) ---

function processMonthlyData(salesOrders: SalesOrder[], startDate: string | null | undefined, endDate: string | null | undefined): MonthlyData {
  if (!startDate || !endDate) return { totalMonthSales: 0, topProducts: [] };

  const start = new Date(startDate);
  const end = new Date(endDate);
  let totalMonthSales = 0;
  const productSales: { [key: string]: { qty: number; price: number } } = {};

  salesOrders.forEach(order => {
    const orderDate = new Date(order.order_date);
    if (orderDate >= start && orderDate <= end && order.status.status_name !== 'ยกเลิก') {
        totalMonthSales += parseFloat(order.total_amount);

        order.items.forEach((item) => {
          const productName = item.product.product_name;
          if (!productSales[productName]) {
            productSales[productName] = { qty: 0, price: 0 };
          }
          productSales[productName].qty += item.quantity;
          productSales[productName].price += item.quantity * parseFloat(item.unit_price);
        });
    }
  });

  const topProducts: TopProduct[] = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);

  return { totalMonthSales, topProducts };
}
function processDailyData(salesOrders: SalesOrder[], startDate: string | null | undefined): DailyData {
  if (!startDate) return { ordersCount: 0, totalSales: 0 };
  const targetDate = new Date(startDate).toDateString();
  let ordersCount = 0;
  let totalSales = 0;
  salesOrders.forEach(order => {
    const orderDate = new Date(order.order_date).toDateString();
    if (orderDate === targetDate && order.status.status_name !== 'ยกเลิก') {
        ordersCount += 1;
        totalSales += parseFloat(order.total_amount);
    }
  });
  return { ordersCount, totalSales };
}