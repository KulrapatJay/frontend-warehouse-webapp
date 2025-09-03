import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart.js parts
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

// ฟังก์ชันสำหรับเปลี่ยนสีตามประสิทธิภาพเทียบกับค่าเฉลี่ย
const getPerformanceColor = (value: number, average: number) => {
  if (average === 0) return { bg: 'rgba(156, 163, 175, 0.7)', border: 'rgba(156, 163, 175, 1)' };

  const tolerance = 0.15;
  const lowerBound = average * (1 - tolerance);
  const upperBound = average * (1 + tolerance);

  if (value > upperBound) {
    return { bg: 'rgba(34, 197, 94, 0.8)', border: 'rgba(34, 197, 94, 1)' };
  }
  if (value < lowerBound) {
    return { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)' };
  }
  return { bg: 'rgba(250, 204, 21, 0.8)', border: 'rgba(250, 204, 21, 1)' };
};


function BarChart({
  data,
  labels,
}: {
  data: number[];
  labels: string[];
}) {
  const average = data.reduce((sum, value) => sum + value, 0) / data.length;
  const colors = data.map(value => getPerformanceColor(value, average));
  
  // ✅ ตรวจสอบค่าสูงสุดของข้อมูลในกราฟ
  const maxDataValue = Math.max(...data);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors.map(c => c.bg),
        borderColor: colors.map(c => c.border),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options: import('chart.js').ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
          color: '#9CA3AF',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0,0,0,0.08)",
          tickBorderDash: [4, 6],
        },
        ticks: {
          // ✅ ปรับแก้ Logic การแสดงผลตัวเลขที่นี่
          callback: (val: number | string) => {
            if (typeof val !== 'number') return val;

            // ถ้าค่าสูงสุดในข้อมูลมากกว่า 1,000 ให้ใช้ 'K'
            if (maxDataValue >= 1000) {
              return (val / 1000) + 'K';
            }
            
            // ถ้าเป็นจำนวนเต็ม ให้แสดงเป็นตัวเลขปกติ
            if (Number.isInteger(val)) {
              return val;
            }

            // กรณีอื่นๆ ไม่ต้องแสดง label
            return null;
          },
          font: {
            size: 10,
          },
          color: '#9CA3AF',
        },
      },
    },
  };

  return (
    <div className="w-full" style={{ height: "180px" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default BarChart;