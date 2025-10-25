import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// เพิ่ม Type definitions
interface SalesOrder {
  id: number;
  order_date: string;
  total_amount: string;
  status: {
    status_name: string;
  };
  items: Array<{
    quantity: number;
    unit_price: string;
    product: {
      product_name: string;
    };
  }>;
}

interface ReportOptions {
  year?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface TopProduct {
  name: string;
  qty: number;
  price: number;
}

interface KPIData {
  totalMonthSales: number;
  todayOrdersCount: number;
  todaySales: number;
}

interface YearlyData {
  salesByMonth: number[];
  ordersByMonth: number[];
  topProducts: TopProduct[];
}

interface WeeklyData {
  salesByWeek: number[];
  ordersByWeek: number[];
  topProducts: TopProduct[];
}

type ReportData = KPIData | YearlyData | WeeklyData | { error: string };

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); 
    const year = searchParams.get('year');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // เรียกข้อมูลจาก sales-orders API ที่มีอยู่แล้ว
    const backendApiUrl = `${process.env.BACKEND_API_URL}/api/sales-orders`;
    const apiResponse = await fetch(backendApiUrl, {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
      },
    });

    if (!apiResponse.ok) {
      throw new Error('Failed to fetch sales orders');
    }

    const salesOrders: SalesOrder[] = await apiResponse.json();

    // ประมวลผลข้อมูลตามประเภทที่ต้องการ
    const processedData = processReportData(salesOrders, type, { year, startDate, endDate });

    return NextResponse.json(processedData);
  } catch (error) {
    console.error("Reports API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ฟังก์ชันประมวลผลข้อมูล
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
    default:
      return { error: 'Invalid type parameter' };
  }
}

function processKPIData(salesOrders: SalesOrder[], today: Date): KPIData {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  // กรองข้อมูล 30 วันที่ผ่านมา
  const monthlyOrders = salesOrders.filter(order => {
    const orderDate = new Date(order.order_date);
    return orderDate >= thirtyDaysAgo && orderDate <= today && order.status.status_name !== 'ยกเลิก';
  });
  
  // กรองข้อมูลวันนี้
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

function processYearlyData(salesOrders: SalesOrder[], year: number): YearlyData {
  const monthlyData = Array(12).fill(0) as number[];
  const monthlyOrdersCount = Array(12).fill(0) as number[];
  const productSales: { [key: string]: { qty: number; price: number } } = {};
  
  salesOrders.forEach(order => {
    const orderDate = new Date(order.order_date);
    if (orderDate.getFullYear() === year && order.status.status_name !== 'ยกเลิก') {
      const month = orderDate.getMonth();
      monthlyData[month] += parseFloat(order.total_amount);
      monthlyOrdersCount[month] += 1;
      
      // รวมข้อมูลสินค้า
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
  
  // จัดเรียงสินค้าขายดี
  const topProducts: TopProduct[] = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);
  
  return {
    salesByMonth: monthlyData,
    ordersByMonth: monthlyOrdersCount,
    topProducts
  };
}

function processWeeklyData(salesOrders: SalesOrder[], endDate: Date): WeeklyData {
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6);
  
  const dailyData = Array(7).fill(0) as number[];
  const dailyOrdersCount = Array(7).fill(0) as number[];
  const productSales: { [key: string]: { qty: number; price: number } } = {};
  
  salesOrders.forEach(order => {
    const orderDate = new Date(order.order_date);
    if (orderDate >= startDate && orderDate <= endDate && order.status.status_name !== 'ยกเลิก') {
      const dayIndex = Math.floor((orderDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < 7) {
        dailyData[dayIndex] += parseFloat(order.total_amount);
        dailyOrdersCount[dayIndex] += 1;
        
        // รวมข้อมูลสินค้า
        order.items.forEach((item) => {
          const productName = item.product.product_name;
          if (!productSales[productName]) {
            productSales[productName] = { qty: 0, price: 0 };
          }
          productSales[productName].qty += item.quantity;
          productSales[productName].price += item.quantity * parseFloat(item.unit_price);
        });
      }
    }
  });
  
  // จัดเรียงสินค้าขายดี
  const topProducts: TopProduct[] = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);
  
  return {
    salesByWeek: dailyData,
    ordersByWeek: dailyOrdersCount,
    topProducts
  };
}