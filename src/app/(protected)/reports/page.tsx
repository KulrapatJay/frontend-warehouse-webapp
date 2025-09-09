"use client";

import React, { useMemo } from "react";

import KpiCard from "@/components/reports/KpiCard"; 
import ChartCard from "@/components/reports/ChartCard";
import BarChart from "@/components/reports/BarChart"; 

/** ========= Mock Data ========= */
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

/** ========= UI primitives ========= */
const tileBase = "rounded-xl bg-base-100 shadow";

// TableCard remains in this file as requested
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
  badge: "Month" | "Day";
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
             <span className={`flex items-center text-sm font-medium ${down ? "text-error" : "text-success"}`}>
               {down ? '↓' : '↑'} {change}
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
function niceStep(rawStep: number) {
  const exp = Math.floor(Math.log10(rawStep));
  const frac = rawStep / Math.pow(10, exp);
  let niceFrac = 1;
  if (frac <= 1) niceFrac = 1;
  else if (frac <= 2) niceFrac = 2;
  else if (frac <= 2.5) niceFrac = 2.5;
  else if (frac <= 5) niceFrac = 5;
  else niceFrac = 10;
  return niceFrac * Math.pow(10, exp);
}
function getNiceScale(maxVal: number, ticks = 6) {
  const rawStep = maxVal / ticks;
  const step = niceStep(rawStep);
  const yMax = Math.ceil(maxVal / step) * step;
  return { yMax, yStep: step };
}

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
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
    const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const currentYear = new Date().getFullYear();
    const startYearBE = (currentYear - 1) % 100 + 43;
    const currentYearBE = currentYear % 100 + 43;

    for (let i = 8; i < 12; i++) {
      labels.push(`${monthNames[i]} ${startYearBE}`);
    }
    for (let i = 0; i <= 8; i++) {
      labels.push(`${monthNames[i]} ${currentYearBE}`);
    }
    return labels;
  }, []);
  
  const salesData13Months = [22000, 25000, 23000, 28000, 32000, 29000, 31000, 35000, 33000, 38000, 42000, 40000, 45000];
  const ordersData13Months = [330, 350, 340, 380, 420, 390, 410, 450, 430, 480, 520, 500, 550];

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

  const totalSalesInTopMonth = topMonth.reduce((sum, item) => sum + item.price, 0);
  const totalSalesInTopDay = topDay.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="flex min-h-screen bg-base-200/40">
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full px-6 lg:px-8 py-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
              <KpiCard
                title="Total Sales"
                value={`฿${totalMonthTHB.toLocaleString("th-TH")}`}
                subtitle={dateRange30Days}
                change="+12.5%"
              />
              <KpiCard
                title="Total Orders Today"
                value={ordersToday.toLocaleString("th-TH")}
                subtitle={todayFormatted}
                change="+5.1%"
              />
              <KpiCard
                title="Total Sales Today"
                value={`฿${salesTodayTHB.toLocaleString("th-TH")}`}
                subtitle={todayFormatted}
                change="-2.3%"
                down={true}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
              <ChartCard 
                title="Total Sales" 
                amount={`฿${salesData13Months[salesData13Months.length - 1].toLocaleString()}`} 
                badge="Month"
                change="15.2%"
                subtitle="ก.ย. 67 - ก.ย. 68"
              >
                <BarChart
                  data={salesData13Months}
                  labels={salesLabels13Months}
                />
              </ChartCard>
              
              <ChartCard 
                title="Total Sales" 
                amount={`฿${mockDailyBar[mockDailyBar.length - 1].toLocaleString()}`} 
                badge="Day"
                change="1.8%"
                down
                subtitle={dateRange7Days}
              >
                <BarChart
                  data={mockDailyBar}
                  labels={last7DaysLabels}
                />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
              <ChartCard 
                title="Total Order" 
                amount={ordersData13Months[ordersData13Months.length - 1].toLocaleString()} 
                badge="Month"
                change="7.1%"
                subtitle="ก.ย. 67 - ก.ย. 68"
              >
                <BarChart
                  data={ordersData13Months}
                  labels={salesLabels13Months}
                />
              </ChartCard>
              
              <ChartCard 
                title="Total Order" 
                amount={`${Math.round(mockDailyBar[mockDailyBar.length-1] / 100)}`}
                badge="Day"
                change="3.4%"
                subtitle={dateRange7Days}
              >
                <BarChart
                  data={mockDailyBar.map((v) => Math.round(v / 100))}
                  labels={last7DaysLabels}
                />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <TableCard
                title="Top Selling Products"
                amount={`฿${totalSalesInTopMonth.toLocaleString()}`}
                badge="Month"
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
                title="Top Selling Products"
                amount={`฿${totalSalesInTopDay.toLocaleString()}`}
                badge="Day"
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
          <div className="h-4" />
        </main>
      </div>
    </div>
  );
}