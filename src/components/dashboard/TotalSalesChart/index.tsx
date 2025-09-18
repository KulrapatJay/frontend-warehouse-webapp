"use client";

import { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
  type ChartOptions,
  type ChartData,
  type ScriptableContext,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext"; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title
);

const labels = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม"];
const rawData = [12000, 9500, 18500, 11000, 25000];

export default function TotalSalesChart() {

  const { theme } = useTheme();
  const chartRef = useRef<ChartJS<"line">>(null);

  // 2. สร้าง Config สำหรับข้อมูลในกราฟ (lineData) แบบไดนามิกตาม Theme
  const lineData: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "Sales",
        data: rawData,
        borderColor: theme === 'dark' ? '#3b82f6' : '#4b5563',
        backgroundColor: (context: ScriptableContext<"line">) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return undefined;
          }
          if (theme === 'dark') {
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.4)');
            return gradient;
          } else {
            return 'rgba(243, 244, 246, 0.8)';
          }
        },
        fill: true,
        tension: 0.45,
        pointBackgroundColor: theme === 'dark' ? '#3b82f6' : '#ffffff',
        pointBorderColor: theme === 'dark' ? '#ffffff' : '#4b5563',
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBorderWidth: 2,
      },
    ],
  };

  // 3. สร้าง Config สำหรับตัวเลือกของกราฟ (lineOptions) แบบไดนามิกตาม Theme
  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        intersect: false,
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        titleColor: theme === 'dark' ? '#ffffff' : '#1f2937',
        bodyColor: theme === 'dark' ? '#d1d5db' : '#4b5563',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        borderWidth: 1,
      },
      title: { display: false },
    },
    scales: {
      x: {
        type: "category",
        grid: { display: false },
        ticks: { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }
      },
      y: {
        type: "linear",
        grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          callback: (value: number | string) => `$${Number(value) / 1000}k`,
        },
      },
    },
  };
  
  return (
    <div className="card bg-base-100 border border-base-300 h-full">
      <div className="card-body p-5 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">ยอดขายรวม</h3>
          <div className="join">
            <button className="btn btn-xs join-item">สัปดาห์</button>
            <button className="btn btn-xs join-item btn-active">เดือน</button>
            <button className="btn btn-xs join-item">ปี</button>
          </div>
        </div>
        <div className="mt-2 text-sm">
          <span className="font-semibold">$25,000</span>
          <span className="ml-2 text-success">↑ 36.6%</span>
        </div>
        <div className="flex-grow mt-4">
          <Line ref={chartRef} data={lineData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
}