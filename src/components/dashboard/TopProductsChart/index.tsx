// src/app/dashboard/components/TopProductsChart.tsx

"use client";

import { useState, useEffect } from "react"; // ไม่ต้องใช้ useRef แล้ว
import { FiChevronDown } from "react-icons/fi";

// --- TYPE DEFINITIONS (เหมือนเดิม) ---
type Product = {
  name: string;
  color: string;
  pct: number;
};

type MonthlyData = {
  total: string;
  change: string;
  products: Product[];
};

// --- generateMonthlyData function (เหมือนเดิม) ---
const generateMonthlyData = (): MonthlyData => {
    const products = [
      { name: "คุกกี้", color: "bg-blue-500" },
      { name: "ครัวซอง", color: "bg-green-500" },
      { name: "พาย", color: "bg-yellow-500" },
    ];
  
    const pct1 = Math.floor(Math.random() * 60) + 20;
    const pct2 = Math.floor(Math.random() * (100 - pct1));
    const pct3 = 100 - pct1 - pct2;
    const shuffledPcts = [pct1, pct2, pct3].sort(() => Math.random() - 0.5);
  
    return {
      total: `฿${(Math.floor(Math.random() * 20000) + 10000).toLocaleString()}`,
      change: `+${(Math.random() * 20 + 5).toFixed(1)}%`,
      products: products.map((p, index) => ({
        ...p,
        pct: shuffledPcts[index],
      })).sort((a,b) => b.pct - a.pct),
    };
  };

// --- MOCK DATA (เหมือนเดิม) ---
const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
    "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
    "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];
const MOCK_PRODUCT_DATA: { [key: string]: MonthlyData } = {};
thaiMonths.forEach(month => {
    MOCK_PRODUCT_DATA[month] = generateMonthlyData();
});


export default function TopProductsChart() {
  const [selectedMonth, setSelectedMonth] = useState<keyof typeof MOCK_PRODUCT_DATA>(thaiMonths[0]);
  const [productData, setProductData] = useState<MonthlyData>(MOCK_PRODUCT_DATA[selectedMonth]);

  useEffect(() => {
    setProductData(MOCK_PRODUCT_DATA[selectedMonth]);
  }, [selectedMonth]);
  
  // สร้างฟังก์ชันสำหรับจัดการการคลิก
  const handleMonthSelect = (month: keyof typeof MOCK_PRODUCT_DATA) => {
    setSelectedMonth(month);
    
    // --- จุดที่แก้ไข ---
    // ตรวจสอบว่ามี element ที่ focus อยู่หรือไม่ แล้วสั่ง blur
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };


  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-5">
        {/* Header with Dropdown */}
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">สินค้าขายดีที่สุด</h3>
          <div className="dropdown dropdown-end">
            <summary tabIndex={0} role="button" className="btn btn-ghost btn-xs">
              {selectedMonth} <FiChevronDown />
            </summary>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
              {Object.keys(MOCK_PRODUCT_DATA).map((month) => (
                <li key={month}>
                  {/* เรียกใช้ฟังก์ชัน handleMonthSelect เมื่อคลิก */}
                  <a onClick={() => handleMonthSelect(month as keyof typeof MOCK_PRODUCT_DATA)}>{month}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ... ส่วนที่เหลือของ Component เหมือนเดิม ... */}
        {/* Total Value and Change */}
        <div className="mt-2">
          <p className="text-2xl font-bold">{productData.total}</p>
          <span className="text-xs text-success font-semibold">{productData.change}</span>
        </div>

        {/* Bar Chart */}
        <div className="mt-4 flex justify-around items-start gap-4">
          {productData.products.map((p: Product) => (
            <div key={p.name} className="flex flex-col-reverse items-center text-center w-1/3">
              <div className="mt-2">
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs opacity-70">{p.pct}%</p>
              </div>
              <div className="w-full h-32 bg-base-200/50 rounded-md flex items-end">
                <div
                  className={`w-full rounded-md transition-all duration-500 ${p.color}`}
                  style={{ height: `${p.pct}%` }}
                  title={`${p.name}: ${p.pct}%`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}