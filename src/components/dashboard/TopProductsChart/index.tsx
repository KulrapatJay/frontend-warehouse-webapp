"use client";

import { useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import axios from "axios";

// --- Type Definitions ---
type Product = {
  name: string;
  color: string;
  pct: number;
};

type MonthlyDisplayData = {
  total: string;
  change: string;
  products: Product[];
};

interface TopProductAPI {
  name: string;
  qty: number;
  price: number;
}

interface MonthlyApiResponse {
  totalMonthSales: number;
  topProducts: TopProductAPI[];
}

const thaiMonths = [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม" ];

const generateMonthlyData = (): MonthlyDisplayData => {
    const products = [
      { name: "คุกกี้", color: "bg-blue-500" }, { name: "ครัวซอง", color: "bg-green-500" }, { name: "พาย", color: "bg-yellow-500" },
    ];
    const pct1 = Math.floor(Math.random() * 60) + 20;
    const pct2 = Math.floor(Math.random() * (100 - pct1));
    const pct3 = 100 - pct1 - pct2;
    const shuffledPcts = [pct1, pct2, pct3].sort(() => Math.random() - 0.5);
    return {
      total: `฿${(Math.floor(Math.random() * 20000) + 10000).toLocaleString()}`,
      change: `+${(Math.random() * 20 + 5).toFixed(1)}%`,
      products: products.map((p, index) => ({ ...p, pct: shuffledPcts[index] })).sort((a,b) => b.pct - a.pct),
    };
};

export default function TopProductsChart() {
  const [selectedMonth, setSelectedMonth] = useState<string>(thaiMonths[new Date().getMonth()]);
  const [allMonthsData, setAllMonthsData] = useState<{ [key: string]: MonthlyDisplayData }>({});
  const [displayData, setDisplayData] = useState<MonthlyDisplayData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllMonthsData = async () => {
      setIsLoading(true);
      const year = new Date().getFullYear();
      
      const requests = thaiMonths.map((_, monthIndex) => {
        const startDate = new Date(year, monthIndex, 1).toISOString();
        const endDate = new Date(year, monthIndex + 1, 0).toISOString();
        return axios.get<MonthlyApiResponse>(`/api/reports?type=monthly&startDate=${startDate}&endDate=${endDate}`);
      });

      try {
        const responses = await Promise.all(requests);
        const dataByMonth: { [key: string]: MonthlyDisplayData } = {};
        const monthlyTotalsFromApi: number[] = responses.map(res => res.data.totalMonthSales || 0);

        responses.forEach((response, index) => {
          const monthName = thaiMonths[index];
          const apiData = response.data;
          
          // ถ้าเดือนนั้นไม่มีข้อมูลสินค้าขายดี ให้ใช้ mock data
          if (!apiData.topProducts || apiData.topProducts.length === 0) {
            dataByMonth[monthName] = generateMonthlyData();
            return;
          }
          
          // ---  แก้ไขจุดนี้ ---
          // 1. คำนวณยอดรวมจาก "สินค้าขายดี" เท่านั้น 
          const totalTopProductSales = apiData.topProducts.reduce((sum, p) => sum + p.price, 0);

          // 2. คำนวณ % change โดยใช้ยอดขาย "ทั้งหมด" ของเดือน (เพื่อให้ % ถูกต้อง)
          const totalMonthSales = monthlyTotalsFromApi[index];
          const prevMonthSales = index > 0 ? monthlyTotalsFromApi[index - 1] : 0;
          
          let changePctString = "N/A";
          if (prevMonthSales > 0) {
            const percentage = ((totalMonthSales - prevMonthSales) / prevMonthSales) * 100;
            changePctString = `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
          } else if (totalMonthSales > 0) {
            changePctString = "+100.0%";
          }
          
          // 3. คำนวณ % ของแต่ละสินค้า เทียบกับยอดรวมของ "สินค้าขายดี"
          const colors = ["bg-green-500", "bg-blue-500", "bg-yellow-500"];
          const productsWithPct = apiData.topProducts.map((p, i) => ({
            name: p.name,
            color: colors[i] || "bg-gray-500",
            pct: totalTopProductSales > 0 ? Math.round((p.price / totalTopProductSales) * 100) : 0
          })).sort((a,b) => b.pct - a.pct);

          dataByMonth[monthName] = {
            total: `฿${totalTopProductSales.toLocaleString('th-TH')}`, // << ใช้ยอดรวมจากสินค้าขายดี
            change: changePctString,
            products: productsWithPct,
          };
        });

        setAllMonthsData(dataByMonth);
      } catch (error) {
        console.error("Failed to fetch monthly data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllMonthsData();
  }, []);

  useEffect(() => {
    if (allMonthsData[selectedMonth]) {
      setDisplayData(allMonthsData[selectedMonth]);
    }
  }, [selectedMonth, allMonthsData]);

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    if (document.activeElement instanceof HTMLElement) { document.activeElement.blur(); }
  };
  
  if (isLoading) {
    return <div className="card bg-base-100 border border-base-300"><div className="card-body p-5 flex justify-center items-center h-72"><span className="loading loading-spinner"></span></div></div>;
  }
  
  if (!displayData) {
    return <div className="card bg-base-100 border border-base-300"><div className="card-body p-5 text-center">ไม่พบข้อมูล</div></div>;
  }

  // --- (ส่วน JSX เหมือนเดิมทุกประการ) ---
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-5">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">สินค้าขายดีที่สุด</h3>
          <div className="dropdown dropdown-end">
            <summary tabIndex={0} role="button" className="btn btn-ghost btn-xs">
              {selectedMonth} <FiChevronDown />
            </summary>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
              {thaiMonths.map((month) => (
                <li key={month}>
                  <a className={selectedMonth === month ? 'active' : ''} onClick={() => handleMonthSelect(month)}>{month}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-2xl font-bold">{displayData.total}</p>
          {displayData.change !== 'N/A' && (
             <span className={`text-xs font-semibold ${displayData.change.startsWith('-') ? 'text-error' : 'text-success'}`}>
               {displayData.change}
             </span>
          )}
        </div>

        <div className="mt-4 flex justify-around items-start gap-4">
          {displayData.products.length > 0 ? (
            displayData.products.map((p: Product) => (
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
            ))
           ) : (
            <p className="w-full text-center opacity-70 mt-8">ไม่มีข้อมูลยอดขายในเดือนนี้</p>
           )}
        </div>
      </div>
    </div>
  );
}