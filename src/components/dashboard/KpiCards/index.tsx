"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function KpiCards() {
  // เพิ่ม state สำหรับเก็บข้อมูลจาก API
  const [apiData, setApiData] = useState({
    totalMonthSales: 687.08,
    todayOrdersCount: 3,
    todaySales: 611.42,
    stockCount: 10,
    // เพิ่มข้อมูลสำหรับคำนวณเปอร์เซ็นต์
    lastMonthSales: 0,
    yesterdayOrdersCount: 0,
    yesterdaySales: 0
  });

  // ดึงข้อมูลจาก API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงข้อมูล KPI หลัก
        const kpiResponse = await axios.get('/api/reports?type=kpi');
        const kpiData = kpiResponse.data;

        // ดึงข้อมูลเดือนที่แล้วสำหรับเปรียบเทียบ Card 1
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

        // ดึงข้อมูลเมื่อวานสำหรับเปรียบเทียบ Card 2 และ 3
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        // เรียก API เพื่อดึงข้อมูลเปรียบเทียบ
        const [lastMonthResponse, yesterdayResponse] = await Promise.all([
          axios.get(`/api/reports?type=monthly&startDate=${lastMonthStart.toISOString()}&endDate=${lastMonthEnd.toISOString()}`),
          axios.get(`/api/reports?type=daily&startDate=${yesterday.toISOString()}&endDate=${yesterday.toISOString()}`)
        ]);

        setApiData({
          totalMonthSales: kpiData.totalMonthSales || 687.08,
          todayOrdersCount: kpiData.todayOrdersCount || 3,
          todaySales: kpiData.todaySales || 611.42,
          stockCount: 10,
          lastMonthSales: lastMonthResponse.data.totalMonthSales || 0,
          yesterdayOrdersCount: yesterdayResponse.data.todayOrdersCount || 0,
          yesterdaySales: yesterdayResponse.data.todaySales || 0
        });
      } catch (error) {
        console.error('Failed to fetch KPI data:', error);
      }
    };

    fetchData();
  }, []);

  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  const todayFormatted = formatDate(today);
  const dateRange = `${formatDate(thirtyDaysAgo)} - ${todayFormatted}`;

  // คำนวณเปอร์เซ็นต์การเปลี่ยนแปลง
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return "+0.0%";
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  // คำนวณเปอร์เซ็นต์สำหรับแต่ละ card
  const monthlyChange = calculatePercentageChange(apiData.totalMonthSales, apiData.lastMonthSales);
  const ordersChange = calculatePercentageChange(apiData.todayOrdersCount, apiData.yesterdayOrdersCount);
  const salesChange = calculatePercentageChange(apiData.todaySales, apiData.yesterdaySales);

  // ตรวจสอบว่าเป็นค่าลบหรือไม่
  const isMonthlyDown = monthlyChange.startsWith("-");
  const isOrdersDown = ordersChange.startsWith("-");
  const isSalesDown = salesChange.startsWith("-");

  // ใช้ข้อมูลจาก API แทน hard-coded values
  const kpiData = [
    {
      title: "ยอดขายรวม",
      subtitle: dateRange,
      value: `฿${apiData.totalMonthSales.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
      change: monthlyChange,
      down: isMonthlyDown,
    },
    {
      title: "ยอดคำสั่งซื้อวันนี้",
      subtitle: todayFormatted,
      value: apiData.todayOrdersCount.toLocaleString('th-TH'),
      change: ordersChange,
      down: isOrdersDown,
    },
    {
      title: "ยอดขายวันนี้",
      subtitle: todayFormatted,
      value: `฿${apiData.todaySales.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
      change: salesChange,
      down: isSalesDown,
    },
    {
      title: "สต๊อกทั้งหมด",
      subtitle: dateRange,
      value: apiData.stockCount.toLocaleString('th-TH'),
      // ไม่แสดงเปอร์เซ็นต์สำหรับ card 4
      change: undefined,
      down: false,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
      {kpiData.map((kpi) => (
        <div
          key={kpi.title}
          className="card bg-base-100 border border-base-300"
        >
          <div className="card-body p-5">
            <h3 className="text-sm opacity-70">{kpi.title}</h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{kpi.value}</p>
              {kpi.change && (
                <span
                  className={`text-xs ${
                    kpi.down ? "text-error" : "text-success"
                  }`}
                >
                  {kpi.change}
                </span>
              )}
            </div>
            <p className="text-xs opacity-50 mt-1">{kpi.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}