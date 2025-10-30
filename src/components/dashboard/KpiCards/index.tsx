"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function KpiCards() {
  // ---  ส่วนที่ 1: แก้ไขค่าเริ่มต้น  ---
  const [apiData, setApiData] = useState({
    totalMonthSales: 0,
    todayOrdersCount: 0,
    todaySales: 0,
    stockCount: 10, // สมมติว่าค่านี้ยังคงเดิม
    lastMonthSales: 0,
    yesterdayOrdersCount: 0,
    yesterdaySales: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const kpiResponse = await axios.get('/api/reports?type=kpi');
        const kpiData = kpiResponse.data;

        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const [lastMonthResponse, yesterdayResponse] = await Promise.all([
          axios.get(`/api/reports?type=monthly&startDate=${lastMonthStart.toISOString()}&endDate=${lastMonthEnd.toISOString()}`),
          axios.get(`/api/reports?type=daily&startDate=${yesterday.toISOString()}&endDate=${yesterday.toISOString()}`)
        ]);

        // ---  ส่วนที่ 2: แก้ไข Key  ---
        setApiData({
          totalMonthSales: kpiData.totalMonthSales || 0,
          todayOrdersCount: kpiData.todayOrdersCount || 0,
          todaySales: kpiData.todaySales || 0,
          stockCount: 10,
          lastMonthSales: lastMonthResponse.data.totalMonthSales || 0,
          // เปลี่ยนเป็น .ordersCount
          yesterdayOrdersCount: yesterdayResponse.data.ordersCount || 0,
          // เปลี่ยนเป็น .totalSales
          yesterdaySales: yesterdayResponse.data.totalSales || 0
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

  // ---  ส่วนที่ 3 (แนะนำ): ปรับปรุงการคำนวณ %  ---
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) {
      // ถ้าค่าก่อนหน้าเป็น 0 และค่าปัจจุบันมากกว่า 0 ให้แสดงเป็น +100%
      return current > 0 ? "+100.0%" : "+0.0%";
    }
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  const monthlyChange = calculatePercentageChange(apiData.totalMonthSales, apiData.lastMonthSales);
  const ordersChange = calculatePercentageChange(apiData.todayOrdersCount, apiData.yesterdayOrdersCount);
  const salesChange = calculatePercentageChange(apiData.todaySales, apiData.yesterdaySales);

  const isMonthlyDown = monthlyChange.startsWith("-");
  const isOrdersDown = ordersChange.startsWith("-");
  const isSalesDown = salesChange.startsWith("-");

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