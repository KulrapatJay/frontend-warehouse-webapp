"use client";

import { useRef, useState, useMemo, useEffect } from "react";
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
import axios from "axios";

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

export default function TotalSalesChart() {
  const { theme } = useTheme();
  const chartRef = useRef<ChartJS<"line">>(null);
  
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  
  // เพิ่ม state สำหรับเก็บข้อมูลจาก API
  const [apiChartData, setApiChartData] = useState({
    week: {
      labels: ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."],
      rawData: [17500, 28000, 22750, 42000, 31500, 52500, 45500],
      total: "฿239,750",
      change: "↑ 5.2%",
      changeColor: "text-success",
    },
    month: {
      labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
      rawData: [12000, 9500, 18500, 11000, 25000, 0, 0, 0, 0, 0, 0, 0],
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
  });

  // คำนวณเปอร์เซ็นต์การเปลี่ยนแปลง
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return { change: "0.0%", isPositive: true };
    const changePercent = ((current - previous) / previous) * 100;
    const sign = changePercent >= 0 ? "↑" : "↓";
    return { 
      change: `${sign} ${Math.abs(changePercent).toFixed(1)}%`, 
      isPositive: changePercent >= 0 
    };
  };

  // ดึงข้อมูลจาก API เมื่อเปลี่ยน timeRange
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        if (timeRange === 'month') {
          const currentYear = new Date().getFullYear();
          const lastYear = currentYear - 1;
          
          // ดึงข้อมูลปีปัจจุบันและปีที่แล้ว
          const [currentResponse, lastResponse] = await Promise.all([
            axios.get(`/api/reports?type=yearly&year=${currentYear}`),
            axios.get(`/api/reports?type=yearly&year=${lastYear}`)
          ]);
          
          const currentData = currentResponse.data;
          const lastData = lastResponse.data;
          
          if (currentData.salesByMonth) {
            const monthlyLabels = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
            const currentTotal = currentData.salesByMonth.reduce((sum: number, val: number) => sum + val, 0);
            const lastTotal = lastData.salesByMonth ? lastData.salesByMonth.reduce((sum: number, val: number) => sum + val, 0) : 0;
            
            const percentageChange = calculatePercentageChange(currentTotal, lastTotal);
            
            setApiChartData(prev => ({
              ...prev,
              month: {
                labels: monthlyLabels,
                rawData: currentData.salesByMonth,
                total: `฿${currentTotal.toLocaleString('th-TH')}`,
                change: percentageChange.change,
                changeColor: percentageChange.isPositive ? "text-success" : "text-error",
              }
            }));
          }
        } else if (timeRange === 'week') {
          const endDate = new Date();
          const startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 6);
          
          // คำนวณสัปดาห์ที่แล้ว
          const lastWeekEndDate = new Date(startDate);
          lastWeekEndDate.setDate(startDate.getDate() - 1);
          const lastWeekStartDate = new Date(lastWeekEndDate);
          lastWeekStartDate.setDate(lastWeekEndDate.getDate() - 6);
          
          // ดึงข้อมูลสัปดาห์ปัจจุบันและสัปดาห์ที่แล้ว
          const [currentResponse, lastResponse] = await Promise.all([
            axios.get(`/api/reports?type=weekly&endDate=${endDate.toISOString()}`),
            axios.get(`/api/reports?type=weekly&endDate=${lastWeekEndDate.toISOString()}`)
          ]);
          
          const currentData = currentResponse.data;
          const lastData = lastResponse.data;
          
          if (currentData.salesByWeek) {
            const currentTotal = currentData.salesByWeek.reduce((sum: number, val: number) => sum + val, 0);
            const lastTotal = lastData.salesByWeek ? lastData.salesByWeek.reduce((sum: number, val: number) => sum + val, 0) : 0;
            
            const percentageChange = calculatePercentageChange(currentTotal, lastTotal);
            
            setApiChartData(prev => ({
              ...prev,
              week: {
                ...prev.week,
                rawData: currentData.salesByWeek,
                total: `฿${currentTotal.toLocaleString('th-TH')}`,
                change: percentageChange.change,
                changeColor: percentageChange.isPositive ? "text-success" : "text-error",
              }
            }));
          }
        } else if (timeRange === 'year') {
          try {
            // ดึงข้อมูลหลายปีสำหรับเปรียบเทียบ
            const currentYear = new Date().getFullYear();
            const years = Array.from({length: 5}, (_, i) => currentYear - i).reverse();
            
            const responses = await Promise.all(
              years.map(year => axios.get(`/api/reports?type=yearly&year=${year}`))
            );
            
            const yearlyData = responses.map((response, index) => {
              const total = response.data.salesByMonth ? 
                response.data.salesByMonth.reduce((sum: number, val: number) => sum + val, 0) : 0;
              return total;
            });
            
            const currentYearTotal = yearlyData[yearlyData.length - 1];
            const lastYearTotal = yearlyData[yearlyData.length - 2] || 0;
            
            const percentageChange = calculatePercentageChange(currentYearTotal, lastYearTotal);
            
            setApiChartData(prev => ({
              ...prev,
              year: {
                labels: years.map(year => (year + 543).toString()),
                rawData: yearlyData,
                total: `฿${yearlyData.reduce((sum, val) => sum + val, 0).toLocaleString('th-TH')}`,
                change: percentageChange.change,
                changeColor: percentageChange.isPositive ? "text-success" : "text-error",
              }
            }));
          } catch (error) {
            console.error('Failed to fetch yearly data:', error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      }
    };

    fetchChartData();
  }, [timeRange]);

  const currentData = useMemo(() => apiChartData[timeRange], [apiChartData, timeRange]);

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
          callback: (value: number | string) => `฿${Number(value) / 1000}k`,
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