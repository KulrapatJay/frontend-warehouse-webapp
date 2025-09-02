"use client";

import React, { useMemo } from "react";
import Sidebar from "@/components/common/Sidebar";
import Navbar from "@/components/common/Navbar";

/** ========= Mock Data ========= */
const mockDailyBar = [1500, 1600, 1550, 1800, 2200, 2500, 2400];
const mockMonthlyBar = [18, 19, 21, 25, 22, 26, 28, 27, 29, 30, 31, 33];

type TopProduct = { name: string; qty: number; price: number };
const topMonth: TopProduct[] = [
  { name: "คุกกี้", qty: 0, price: 0 },
  { name: "ครัวซองต์", qty: 0, price: 0 },
  { name: "เค้ก", qty: 0, price: 0 },
];
const topDay: TopProduct[] = [
  { name: "ขนมปัง", qty: 0, price: 0 },
  { name: "ครัวซองต์", qty: 0, price: 0 },
  { name: "พาย", qty: 0, price: 0 },
];

/** ========= UI primitives ========= */
const tileBase = "rounded-xl bg-base-100 shadow border border-base-200/60";

// ✅ ปรับ InfoTile เป็นแบบตัวเลขเด่น
function InfoTile({
  title,
  value,
  caption,
}: {
  title: string;
  value: string;
  caption: string;
}) {
  return (
    <div className={`${tileBase} p-4`}>
      <div className="text-sm font-semibold text-base-content/80">{title}</div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight text-primary">
        {value}
      </div>
      <div className="mt-3 h-px w-full bg-base-300/70" />
      <div className="mt-2 text-sm text-base-content/70">{caption}</div>
    </div>
  );
}

function ChartCard({
  title,
  amount,
  badge,
  children,
}: {
  title: string;
  amount: string;
  badge: "เดือน" | "วัน";
  children: React.ReactNode;
}) {
  return (
    <div className={`${tileBase} p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-base-content/80">{title}</div>
          <div className="text-sm text-base-content/70">{amount}</div>
        </div>
        <span className="badge badge-ghost">{badge}</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** ========= helpers สำหรับสเกลแกน Y ========= */
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

/** ========= BarChart ========= */
function BarChart({
  data,
  labels,
  height = 200,
  title,
  fixedScale,
}: {
  data: number[];
  labels: string[];
  height?: number;
  title?: string;
  fixedScale?: { yMax: number; yStep: number };
}) {
  const width = 460;
  const padding = { top: 30, right: 12, bottom: 28, left: 46 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const gap = 10;
  const barW = Math.max(8, Math.floor((chartW - gap * (data.length - 1)) / data.length));

  const maxVal = Math.max(...data);
  const { yMax, yStep } = fixedScale ?? getNiceScale(maxVal, 6);

  return (
    <div className="overflow-x-auto">
      <svg
        width={width}
        height={height}
        className="
          rounded-lg bg-base-200/50 dark:bg-slate-800/60
          text-base-content
          dark:text-blue-400
          [data-theme=dark]:text-blue-400
        "
      >
        {title && (
          <text
            x={width / 2}
            y={18}
            textAnchor="middle"
            fontSize="13"
            fontWeight={600}
            fill="currentColor"
          >
            {title}
          </text>
        )}

        {Array.from({ length: Math.floor(yMax / yStep) + 1 }).map((_, i) => {
          const v = i * yStep;
          const y = padding.top + chartH - (v / yMax) * chartH;
          return (
            <g key={v}>
              <line
                x1={padding.left}
                x2={padding.left + chartW}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-base-300 dark:text-white/25 [data-theme=dark]:text-white/25"
                strokeDasharray="4 6"
              />
              <text
                x={padding.left - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill="currentColor"
              >
                {v.toLocaleString()}
              </text>
            </g>
          );
        })}

        {data.map((val, i) => {
          const x = padding.left + i * (barW + gap);
          const h = Math.max(2, (val / yMax) * chartH);
          const y = padding.top + chartH - h;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={h}
              rx="6"
              fill="currentColor"
              className="text-primary/80 dark:text-blue-400 [data-theme=dark]:text-blue-400"
            />
          );
        })}

        {labels.map((lb, i) => {
          const x = padding.left + i * (barW + gap) + barW / 2;
          return (
            <text
              key={i}
              x={x}
              y={height - 6}
              textAnchor="middle"
              fontSize="10"
              fill="currentColor"
            >
              {lb}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/** ========= Page ========= */
export default function ReportPage() {
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const weekdayFull = ["จันทร์", "อังคาร", "พุธ", "พฤหัสฯ", "ศุกร์", "เสาร์", "อาทิตย์"];

  const totalMonthTHB = useMemo(() => 15000, []);
  const ordersToday = 320;
  const salesTodayTHB = 2800;

  const ordersMonthly = mockMonthlyBar;
  const salesMonthlyTHB = mockMonthlyBar.map((v) => v * 800);

  const dailySalesScale = { yMax: 3000, yStep: 500 };
  const monthlyOrderScale = getNiceScale(Math.max(...ordersMonthly), 6);
  const monthlySalesScale = getNiceScale(Math.max(...salesMonthlyTHB), 6);

  return (
    <div className="flex min-h-screen bg-base-200/40">
      <aside>
        <Sidebar />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 bg-base-100/80 border-b backdrop-blur">
          <Navbar />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold mb-6">Report</h1>

            {/* ✅ Tiles with numbers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
              <InfoTile
                title="Total Sales"
                value={`฿${totalMonthTHB.toLocaleString("th-TH")}`}
                caption="ข้อมูลตั้งแต่ 30 วันก่อน - ปัจจุบัน"
              />
              <InfoTile
                title="Total Orders Today"
                value={ordersToday.toLocaleString("th-TH")}
                caption="วันนี้"
              />
              <InfoTile
                title="Total Sales Today"
                value={`฿${salesTodayTHB.toLocaleString("th-TH")}`}
                caption="วันนี้"
              />
            </div>

            {/* charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
              <ChartCard title="total sales" amount={`${totalMonthTHB.toLocaleString()} บาท`} badge="เดือน">
                <BarChart
                  data={salesMonthlyTHB}
                  labels={months}
                  title="ยอดขายรวม (บาท) — รายเดือน"
                  fixedScale={monthlySalesScale}
                />
              </ChartCard>

              <ChartCard title="total sales" amount={`${totalMonthTHB.toLocaleString()} บาท`} badge="วัน">
                <BarChart
                  data={mockDailyBar}
                  labels={weekdayFull}
                  title="ยอดขายเค้ก (บาท)"
                  fixedScale={dailySalesScale}
                />
              </ChartCard>
            </div>

            {/* charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
              <ChartCard title="total order" amount={`${totalMonthTHB.toLocaleString()} บาท`} badge="เดือน">
                <BarChart
                  data={ordersMonthly}
                  labels={months}
                  title="จำนวนออเดอร์ — รายเดือน"
                  fixedScale={monthlyOrderScale}
                />
              </ChartCard>

              <ChartCard title="total order" amount={`${totalMonthTHB.toLocaleString()} บาท`} badge="วัน">
                <BarChart
                  data={mockDailyBar.map((v) => Math.round(v / 100))}
                  labels={weekdayFull}
                  title="จำนวนออเดอร์ — รายวัน"
                  fixedScale={getNiceScale(Math.max(...mockDailyBar.map((v) => Math.round(v / 100))), 6)}
                />
              </ChartCard>
            </div>

            {/* tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className={`${tileBase} p-4`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-base-content/80">Top Selling Products</div>
                    <div className="text-sm text-base-content/80">ยอดขายทั้งหมด 10,000 บาท</div>
                  </div>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>สินค้า</th>
                        <th className="text-right">จำนวน</th>
                        <th className="text-right">ราคา</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topMonth.map((p, i) => (
                        <tr key={i}>
                          <td>{p.name}</td>
                          <td className="text-right">{p.qty || "-"}</td>
                          <td className="text-right">{p.price ? `฿${p.price.toFixed(2)}` : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`${tileBase} p-4`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-base-content/80">Top Selling Products</div>
                    <div className="text-sm text-base-content/80">ยอดขายทั้งหมด 10,000 บาท</div>
                  </div>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>สินค้า</th>
                        <th className="text-right">จำนวน</th>
                        <th className="text-right">ราคา</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topDay.map((p, i) => (
                        <tr key={i}>
                          <td>{p.name}</td>
                          <td className="text-right">{p.qty || "-"}</td>
                          <td className="text-right">{p.price ? `฿${p.price.toFixed(2)}` : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="h-4" />
        </main>
      </div>
    </div>
  );
}
