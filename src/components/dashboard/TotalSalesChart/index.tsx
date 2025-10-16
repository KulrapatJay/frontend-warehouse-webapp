"use client";

import { useRef, useState, useMemo } from "react";
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

type TimeRange = 'week' | 'month' | 'year';

// ========== START: ส่วนที่แก้ไข (1. เปลี่ยน $ เป็น ฿) ==========
const allChartData = {
  week: {
    labels: ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."],
    rawData: [17500, 28000, 22750, 42000, 31500, 52500, 45500],
    total: "฿239,750",
    change: "↑ 5.2%",
    changeColor: "text-success",
  },
  month: {
    labels: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม"],
    rawData: [12000, 9500, 18500, 11000, 25000],
    total: "฿76,000",
    change: "↑ 36.6%",
    changeColor: "text-success",
  },
  year: {
    labels: ["2565", "2566", "2567", "2568"],
    rawData: [180000, 165000, 210000, 250000],
    total: "฿805,000",
    change: "↑ 19.0%",
    changeColor: "text-success",
  }
};
// ========== END: ส่วนที่แก้ไข (1. เปลี่ยน $ เป็น ฿) ==========


export default function TotalSalesChart() {
  const { theme } = useTheme();
  const chartRef = useRef<ChartJS<"line">>(null);
  
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const currentData = useMemo(() => allChartData[timeRange], [timeRange]);


  const lineData: ChartData<"line"> = {
    labels: currentData.labels,
    datasets: [
      {
        label: "Sales",
        data: currentData.rawData,
        borderColor: theme === 'dark' ? '#3b82f6' : '#4b5563',
        backgroundColor: (context: ScriptableContext<"line">) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;
          
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
        // ========== START: ส่วนที่แก้ไข (2. เปลี่ยน USD เป็น THB) ==========
        callbacks: {
            label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(context.parsed.y);
                }
                return label;
            }
        }
        // ========== END: ส่วนที่แก้ไข (2. เปลี่ยน USD เป็น THB) ==========
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
          // ========== START: ส่วนที่แก้ไข (3. เปลี่ยน $ เป็น ฿) ==========
          callback: (value: number | string) => `฿${Number(value) / 1000}k`,
          // ========== END: ส่วนที่แก้ไข (3. เปลี่ยน $ เป็น ฿) ==========
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
            <button 
              className={`btn btn-xs join-item ${timeRange === 'week' ? 'btn-active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              สัปดาห์
            </button>
            <button 
              className={`btn btn-xs join-item ${timeRange === 'month' ? 'btn-active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              เดือน
            </button>
            <button 
              className={`btn btn-xs join-item ${timeRange === 'year' ? 'btn-active' : ''}`}
              onClick={() => setTimeRange('year')}
            >
              ปี
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm">
          <span className="font-semibold">{currentData.total}</span>
          <span className={`ml-2 ${currentData.changeColor}`}>{currentData.change}</span>
        </div>
        <div className="flex-grow mt-4">
          <Line ref={chartRef} data={lineData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
}