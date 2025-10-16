"use client";

import React, { useMemo } from "react";

import KpiCard from "@/components/reports/KpiCard";
import ChartCard from "@/components/reports/ChartCard";
import BarChart from "@/components/reports/BarChart";

/** ========= Mock Data (เหมือนเดิม) ========= */
const mockDailyBar = [1500, 1600, 1550, 1800, 2200, 2500, 2400];

type TopProduct = { name: string; qty: number; price: number };
const topMonth: TopProduct[] = [
  { name: "ครัวซองต์อัลมอนด์", qty: 250, price: 18750 },
  { name: "ชีสเค้กหน้าไหม้", qty: 180, price: 16200 },
  { name: "พาย", qty: 320, price: 22400 },
];
const topDay: TopProduct[] = [
  { name: "ขนมปัง", qty: 35, price: 2275 },
  { name: "เอแคลร์", qty: 50, price: 1750 },
  { name: "ครัวซองต์เนยสด", qty: 25, price: 1625 },
];

/** ========= UI primitives (เหมือนเดิม) ========= */
const tileBase = "rounded-xl bg-base-100 shadow";

function TableCard({
  title,
  amount,
  badge,
  children,
  change,
  down = false,
  subtitle,
}: {
  title: string;
  amount: string;
  badge: "เดือน" | "สัปดาห์";
  children: React.ReactNode;
  change?: string;
  down?: boolean;
  subtitle?: string;
}) {
  return (
    <div className={`${tileBase} p-4`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base-content/90">{title}</h3>
        <span className="badge badge-ghost">{badge}</span>
      </div>
      <div className="flex items-end justify-between mt-2">
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">{amount}</p>
          {change && (
            <span
              className={`flex items-center text-sm font-medium ${
                down ? "text-error" : "text-success"
              }`}
            >
              {down ? "↓" : "↑"} {change}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-base-content/50">{subtitle}</p>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/** ========= helpers ========= */
const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  // ========== START: ส่วนที่แก้ไข ==========
  const year = date.getFullYear() + 543; // บวก 543 เพื่อแปลงเป็น พ.ศ.
  // ========== END: ส่วนที่แก้ไข ==========
  return `${day}/${month}/${year}`;
};

/** ========= Page ========= */
export default function ReportPage() {
  const totalMonthTHB = useMemo(() => 15000, []);
  const ordersToday = 320;
  const salesTodayTHB = 2800;

  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const todayFormatted = formatDate(today);
  const dateRange30Days = `${formatDate(thirtyDaysAgo)} - ${todayFormatted}`;
  const dateRange7Days = `${formatDate(sevenDaysAgo)} - ${todayFormatted}`;

  const salesLabels13Months = useMemo(() => {
    const labels = [];
    const monthNames = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค.",];
    const currentYear = new Date().getFullYear();
    const startYearBE = ((currentYear - 1) % 100) + 43;
    const currentYearBE = (currentYear % 100) + 43;

    for (let i = 8; i < 12; i++) {
      labels.push(`${monthNames[i]} ${startYearBE}`);
    }
    for (let i = 0; i <= 8; i++) {
      labels.push(`${monthNames[i]} ${currentYearBE}`);
    }
    return labels;
  }, []);

  const salesData13Months = [22000,25000,23000,28000,32000,29000,31000,35000,33000,38000,42000,40000,45000,];
  const ordersData13Months = [330,350,340,380,420,390,410,450,430,480,520,500,550,];

  const last7DaysLabels = useMemo(() => {
    const labels = [];
    const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(dayNames[d.getDay()]);
    }
    return labels;
  }, []);

  const totalSalesInTopMonth = topMonth.reduce(
    (sum, item) => sum + item.price,
    0
  );
  const totalSalesInTopDay = topDay.reduce(
    (sum, item) => sum + item.price,
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="ยอดขายรวม"
          value={`฿${totalMonthTHB.toLocaleString("th-TH")}`}
          subtitle={dateRange30Days}
          change="+12.5%"
        />
        <KpiCard
          title="ยอดคำสั่งซื้อสัปดาห์นี้"
          value={ordersToday.toLocaleString("th-TH")}
          subtitle={todayFormatted}
          change="+5.1%"
        />
        <KpiCard
          title="ยอดขายสัปดาห์นี้"
          value={`฿${salesTodayTHB.toLocaleString("th-TH")}`}
          subtitle={todayFormatted}
          change="-2.3%"
          down={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="ยอดขายรวม"
          amount={`฿${
            salesData13Months[salesData13Months.length - 1].toLocaleString()
          }`}
          badge="เดือน"
          change="15.2%"
          subtitle="ก.ย. 67 - ก.ย. 68"
        >
          <BarChart data={salesData13Months} labels={salesLabels13Months} />
        </ChartCard>

        <ChartCard
          title="ยอดขายรวม"
          amount={`฿${
            mockDailyBar[mockDailyBar.length - 1].toLocaleString()
          }`}
          badge="สัปดาห์"
          change="1.8%"
          down
          subtitle={dateRange7Days}
        >
          <BarChart data={mockDailyBar} labels={last7DaysLabels} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="ยอดคำสั่งซื้อ"
          amount={ordersData13Months[
            ordersData13Months.length - 1
          ].toLocaleString()}
          badge="เดือน"
          change="7.1%"
          subtitle="ก.ย. 67 - ก.ย. 68"
        >
          <BarChart data={ordersData13Months} labels={salesLabels13Months} />
        </ChartCard>

        <ChartCard
          title="ยอดคำสั่งซื้อ"
          amount={`${Math.round(
            mockDailyBar[mockDailyBar.length - 1] / 100
          )}`}
          badge="สัปดาห์"
          change="3.4%"
          subtitle={dateRange7Days}
        >
          <BarChart
            data={mockDailyBar.map((v) => Math.round(v / 100))}
            labels={last7DaysLabels}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableCard
          title="สินค้าขายดีที่สุด"
          amount={`฿${totalSalesInTopMonth.toLocaleString()}`}
          badge="เดือน"
          change="+5.8%"
          subtitle={dateRange30Days}
        >
          <div className="mt-3 overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>สินค้า</th>
                  <th className="text-right">จำนวน</th>
                  <th className="text-right">ยอดขาย</th>
                </tr>
              </thead>
              <tbody>
                {topMonth.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td className="text-right">{p.qty.toLocaleString()}</td>
                    <td className="text-right">{`฿${p.price.toLocaleString()}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableCard>

        <TableCard
          title="สินค้าขายดีที่สุด"
          amount={`฿${totalSalesInTopDay.toLocaleString()}`}
          badge="สัปดาห์"
          change="-0.5%"
          down
          subtitle={dateRange7Days}
        >
          <div className="mt-3 overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>สินค้า</th>
                  <th className="text-right">จำนวน</th>
                  <th className="text-right">ยอดขาย</th>
                </tr>
              </thead>
              <tbody>
                {topDay.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td className="text-right">{p.qty.toLocaleString()}</td>
                    <td className="text-right">{`฿${p.price.toLocaleString()}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableCard>
      </div>
    </div>
  );
}