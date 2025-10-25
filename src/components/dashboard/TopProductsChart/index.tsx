"use client";

import { useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import axios from "axios";

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

// เพิ่ม interface สำหรับ API response
interface TopProductAPI {
  name: string;
  qty: number;
  price: number;
}

interface ApiResponse {
  topProducts: TopProductAPI[];
}

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

const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
    "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
    "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

export default function TopProductsChart() {
  const [selectedMonth, setSelectedMonth] = useState<string>(thaiMonths[0]);
  const [MOCK_PRODUCT_DATA, setMockProductData] = useState<{ [key: string]: MonthlyData }>({});
  const [productData, setProductData] = useState<MonthlyData>({
    total: "฿15,183",
    change: "+22.5%",
    products: [
      { name: "ครัวซอง", color: "bg-green-500", pct: 57 },
      { name: "คุกกี้", color: "bg-blue-500", pct: 24 },
      { name: "พาย", color: "bg-yellow-500", pct: 19 },
    ]
  });

  // ดึงข้อมูลจาก API และสร้าง mock data
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await axios.get(`/api/reports?type=yearly&year=${new Date().getFullYear()}`);
        const data: ApiResponse = response.data;
        
        if (data.topProducts && data.topProducts.length > 0) {
          // แปลงข้อมูลจาก API เป็นรูปแบบที่ใช้แสดงผล
          const totalSales = data.topProducts.reduce((sum: number, p: TopProductAPI) => sum + p.price, 0);
          const colors = ["bg-green-500", "bg-blue-500", "bg-yellow-500"];
          
          const productsWithPct = data.topProducts.map((p: TopProductAPI, index: number) => ({
            name: p.name,
            color: colors[index] || "bg-gray-500",
            pct: totalSales > 0 ? Math.round((p.price / totalSales) * 100) : 0
          }));

          const apiProductData = {
            total: `฿${totalSales.toLocaleString('th-TH')}`,
            change: "+22.5%",
            products: productsWithPct
          };

          // สร้าง mock data สำหรับเดือนอื่นๆ และใช้ข้อมูลจาก API สำหรับเดือนปัจจุบัน
          const newMockData: { [key: string]: MonthlyData } = {};
          thaiMonths.forEach((month, index) => {
            if (index === new Date().getMonth()) {
              newMockData[month] = apiProductData;
            } else {
              newMockData[month] = generateMonthlyData();
            }
          });

          setMockProductData(newMockData);
          setProductData(newMockData[selectedMonth]);
        } else {
          // ถ้าไม่มีข้อมูลจาก API ให้ใช้ mock data
          const fallbackData: { [key: string]: MonthlyData } = {};
          thaiMonths.forEach(month => {
            fallbackData[month] = generateMonthlyData();
          });
          setMockProductData(fallbackData);
          setProductData(fallbackData[selectedMonth]);
        }
      } catch (error) {
        console.error('Failed to fetch top products:', error);
        // ใช้ mock data เมื่อเกิด error
        const fallbackData: { [key: string]: MonthlyData } = {};
        thaiMonths.forEach(month => {
          fallbackData[month] = generateMonthlyData();
        });
        setMockProductData(fallbackData);
        setProductData(fallbackData[selectedMonth]);
      }
    };

    fetchTopProducts();
  }, []);

  useEffect(() => {
    if (MOCK_PRODUCT_DATA[selectedMonth]) {
      setProductData(MOCK_PRODUCT_DATA[selectedMonth]);
    }
  }, [selectedMonth, MOCK_PRODUCT_DATA]);
  
  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

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
              {Object.keys(MOCK_PRODUCT_DATA).map((month) => (
                <li key={month}>
                  <a onClick={() => handleMonthSelect(month)}>{month}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-2xl font-bold">{productData.total}</p>
          <span className="text-xs text-success font-semibold">{productData.change}</span>
        </div>

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