// src/app/dashboard/components/TopProductsChart.tsx

"use client";

import { useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

const MOCK_PRODUCT_DATA = {
  "เดือนนี้": {
    total: "฿21,000",
    change: "+25.2%",
    products: [
      { name: "คุกกี้", pct: 56, color: "bg-blue-500" },
      { name: "ครัวซอง", pct: 28, color: "bg-green-500" },
      { name: "พาย", pct: 16, color: "bg-yellow-500" },
    ],
  },
  "เดือนล่าสุด": {
    total: "฿18,500",
    change: "+15.8%",
    products: [
      { name: "คุกกี้", pct: 45, color: "bg-blue-500" },
      { name: "พาย", pct: 35, color: "bg-yellow-500" },
      { name: "ครัวซอง", pct: 20, color: "bg-green-500" },
    ],
  },
  "มิถุนายน": {
    total: "฿15,200",
    change: "+11.1%",
    products: [
        { name: "ครัวซอง", pct: 60, color: "bg-green-500" },
        { name: "คุกกี้", pct: 25, color: "bg-blue-500" },
        { name: "พาย", pct: 15, color: "bg-yellow-500" },
    ],
  },
};

export default function TopProductsChart() {
  const [selectedMonth, setSelectedMonth] = useState<keyof typeof MOCK_PRODUCT_DATA>("เดือนนี้");
  const [productData, setProductData] = useState(MOCK_PRODUCT_DATA[selectedMonth]);

  useEffect(() => {
    setProductData(MOCK_PRODUCT_DATA[selectedMonth]);
  }, [selectedMonth]);

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
                  <a onClick={() => setSelectedMonth(month as keyof typeof MOCK_PRODUCT_DATA)}>{month}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Total Value and Change */}
        <div className="mt-2">
          <p className="text-2xl font-bold">{productData.total}</p>
          <span className="text-xs text-success font-semibold">{productData.change}</span>
        </div>

        {/* Bar Chart */}
        <div className="mt-4 flex justify-around items-start gap-4">
          {productData.products.map((p) => (
            <div key={p.name} className="flex flex-col-reverse items-center text-center w-1/3">
              <div className="mt-2">
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs opacity-70">{p.pct}%</p>
              </div>
              <div className="w-full h-32 bg-base-200/50 rounded-md flex items-end">
                <div
                  className={`w-full rounded-md transition-all duration-500 ฿{p.color}`}
                  style={{ height: `฿{p.pct}%` }}
                  title={`฿{p.name}: ฿{p.pct}%`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}