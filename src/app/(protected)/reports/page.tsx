"use client";

import React, { useMemo, useState, useEffect } from "react";

import KpiCard from "@/components/reports/KpiCard";
import ChartCard from "@/components/reports/ChartCard";
import BarChart from "@/components/reports/BarChart";

/** ========= Mock Data (ไม่เปลี่ยนแปลง) ========= */
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
type TopProduct = { name: string; qty: number; price: number };

/** ========= UI primitives (ไม่เปลี่ยนแปลง) ========= */
const tileBase = "rounded-xl bg-base-100 shadow";
function TableCard({ title, amount, children, change, down = false, subtitle, headerRightContent, }: { title: string; amount: string; children: React.ReactNode; change?: string; down?: boolean; subtitle?: string; headerRightContent?: React.ReactNode; }) {
  return (
    <div className={`${tileBase} p-4`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base-content/90">{title}</h3>
        {headerRightContent}
      </div>
      <div className="flex items-end justify-between mt-2">
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">{amount}</p>
          {change && (<span className={`flex items-center text-sm font-medium ${down ? "text-error" : "text-success"}`}>{down ? "↓" : "↑"} {change}</span>)}
        </div>
        {subtitle && <p className="text-xs text-base-content/50">{subtitle}</p>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/** ========= helpers (ไม่เปลี่ยนแปลง) ========= */
const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear() + 543;
  return `${day}/${month}/${year}`;
};

/** ========= CalendarDropdown Component (ไม่เปลี่ยนแปลง) ========= */
function CalendarDropdown({ selectedValue, onValueChange }: { selectedValue: Date; onValueChange: (date: Date) => void; }) {
  const [displayDate, setDisplayDate] = useState(selectedValue);
  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const daysInMonth = useMemo(() => new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0).getDate(), [displayDate]);
  const startOfMonth = useMemo(() => new Date(displayDate.getFullYear(), displayDate.getMonth(), 1).getDay(), [displayDate]);
  
  const handlePrevMonth = () => setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  
  const handleDayClick = (day: number) => {
    const newDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
    onValueChange(newDate);
    const elem = document.activeElement as HTMLElement;
    if(elem) elem.blur();
  };
  
  const sevenDaysAgo = new Date(selectedValue);
  sevenDaysAgo.setDate(selectedValue.getDate() - 6);
  const dateRangeLabel = `${formatDate(sevenDaysAgo)} - ${formatDate(selectedValue)}`;

  return (
    <div className={`dropdown dropdown-end`}>
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
        {dateRangeLabel}
        <svg width="12px" height="12px" className="h-2 w-2 fill-current opacity-60 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path></svg>
      </div>
      <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-72 mt-2">
        <div className="flex items-center justify-between p-2">
          <button className="btn btn-xs btn-ghost" onClick={handlePrevMonth}>&lt;</button>
          <span className="font-semibold">{monthNames[displayDate.getMonth()]} {displayDate.getFullYear() + 543}</span>
          <button className="btn btn-xs btn-ghost" onClick={handleNextMonth}>&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mt-2">
          {dayNames.map(day => <div key={day} className="font-semibold text-base-content/60">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-1">
          {Array.from({ length: startOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = selectedValue.getDate() === day && selectedValue.getMonth() === displayDate.getMonth() && selectedValue.getFullYear() === displayDate.getFullYear();
            return (
              <button key={day} onClick={() => handleDayClick(day)} className={`btn btn-xs btn-ghost ${isSelected ? 'btn-active' : ''}`}>
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


/** ========= Page Component ========= */
export default function ReportPage() {
  const totalMonthTHB = useMemo(() => 15000, []);
  const ordersToday = 320;
  const salesTodayTHB = 2800;
  
  const currentYear = new Date().getFullYear();

  // --- State สำหรับข้อมูลรายปี ---
  const [salesSelectedYear, setSalesSelectedYear] = useState(currentYear);
  const [yearlySalesData, setYearlySalesData] = useState<number[]>([]);
  const [ordersSelectedYear, setOrdersSelectedYear] = useState(currentYear);
  const [yearlyOrdersData, setYearlyOrdersData] = useState<number[]>([]);
  const [topProductsSelectedYear, setTopProductsSelectedYear] = useState(currentYear);
  const [topProductsYearData, setTopProductsYearData] = useState<TopProduct[]>([]);

  // --- State สำหรับข้อมูลรายสัปดาห์ ---
  const [weeklySalesSelectedDate, setWeeklySalesSelectedDate] = useState(new Date());
  const [weeklySalesData, setWeeklySalesData] = useState<number[]>([]);
  const [weeklyOrdersSelectedDate, setWeeklyOrdersSelectedDate] = useState(new Date());
  const [weeklyOrdersData, setWeeklyOrdersData] = useState<number[]>([]);
  const [weeklyTopProductsSelectedDate, setWeeklyTopProductsSelectedDate] = useState(new Date());
  const [weeklyTopProductsData, setWeeklyTopProductsData] = useState<TopProduct[]>(topDay);

  const yearOptions = useMemo(() => {
    const options = [];
    const year = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      const targetYear = year - i;
      options.push({ label: `พ.ศ. ${targetYear + 543}`, value: targetYear });
    }
    return options.reverse();
  }, []);
  
  // --- useEffects สำหรับข้อมูลรายปี ---
  useEffect(() => {
    setYearlySalesData(Array.from({ length: 12 }, () => Math.floor(Math.random() * 30000) + 20000));
  }, [salesSelectedYear]);
  useEffect(() => {
    setYearlyOrdersData(Array.from({ length: 12 }, () => Math.floor(Math.random() * 250) + 300));
  }, [ordersSelectedYear]);

  // START: แก้ไขส่วนนี้
  useEffect(() => {
    const newData = [...topMonth].sort(() => 0.5 - Math.random()).map(product => {
        const unitPrice = product.price / product.qty;
        const newQty = Math.floor(Math.random() * 300) + 50;
        const newTotalPrice = unitPrice * newQty;
        return { ...product, qty: newQty, price: newTotalPrice, };
      });
    setTopProductsYearData(newData);
  }, [topProductsSelectedYear]);
  // END: แก้ไข

  // --- useEffects สำหรับข้อมูลรายสัปดาห์ ---
  useEffect(() => {
    setWeeklySalesData(Array.from({ length: 7 }, () => Math.floor(Math.random() * 1500) + 1500));
  }, [weeklySalesSelectedDate]);
  useEffect(() => {
    setWeeklyOrdersData(Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 15));
  }, [weeklyOrdersSelectedDate]);

  // START: แก้ไขส่วนนี้
  useEffect(() => {
    const newData = [...topDay].sort(() => 0.5 - Math.random()).map(product => {
        const unitPrice = product.price / product.qty;
        const newQty = Math.floor(Math.random() * 50) + 10;
        const newTotalPrice = unitPrice * newQty;
        return { ...product, qty: newQty, price: newTotalPrice };
    });
    setWeeklyTopProductsData(newData);
  }, [weeklyTopProductsSelectedDate]);
  // END: แก้ไข

  const createLast7DaysLabels = (endDate: Date) => {
    const labels = [];
    const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(endDate.getDate() - i);
        labels.push(dayNames[d.getDay()]);
    }
    return labels;
  };
  
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const todayFormatted = formatDate(today);
  const dateRange30Days = `${formatDate(thirtyDaysAgo)} - ${todayFormatted}`;
  
  const yearlyChartLabels = useMemo(() => ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."], []);

  const totalSalesInTopYear = topProductsYearData.reduce((sum, item) => sum + item.price, 0);
  const totalSalesInTopDay = weeklyTopProductsData.reduce((sum, item) => sum + item.price, 0);
  
  const YearDropdown = ({ selectedValue, onValueChange }: { selectedValue: number; onValueChange: (value: number) => void; }) => (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
        {yearOptions.find(opt => opt.value === selectedValue)?.label || "เลือกปี"}
        <svg width="12px" height="12px" className="h-2 w-2 fill-current opacity-60 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path></svg>
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        {yearOptions.map((year) => (
          <li key={year.value}>
            <a className={selectedValue === year.value ? "active" : ""} onClick={() => onValueChange(year.value)}>
              {year.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
  
  const createSubtitleForYear = (selectedYear: number) => {
    if (!selectedYear) return "";
    return `มกราคม - ธันวาคม ${selectedYear + 543}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="ยอดขายรวม" value={`฿${totalMonthTHB.toLocaleString("th-TH")}`} subtitle={dateRange30Days} change="+12.5%"/>
        <KpiCard title="ยอดคำสั่งซื้อวันนี้" value={ordersToday.toLocaleString("th-TH")} subtitle={todayFormatted} change="+5.1%"/>
        <KpiCard title="ยอดขายวันนี้" value={`฿${salesTodayTHB.toLocaleString("th-TH")}`} subtitle={todayFormatted} change="-2.3%" down={true}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="ยอดขายรวม" amount={`฿${(yearlySalesData.reduce((a, b) => a + b, 0) || 0).toLocaleString()}`} headerRightContent={<YearDropdown selectedValue={salesSelectedYear} onValueChange={setSalesSelectedYear} />} change="15.2%" subtitle={createSubtitleForYear(salesSelectedYear)}>
          <BarChart data={yearlySalesData} labels={yearlyChartLabels} />
        </ChartCard>
        
        <ChartCard title="ยอดขายรวม (7 วัน)" amount={`฿${(weeklySalesData.reduce((a, b) => a + b, 0) || 0).toLocaleString()}`} headerRightContent={<CalendarDropdown selectedValue={weeklySalesSelectedDate} onValueChange={setWeeklySalesSelectedDate} />} change="1.8%" down>
          <BarChart data={weeklySalesData} labels={createLast7DaysLabels(weeklySalesSelectedDate)} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="ยอดคำสั่งซื้อ" amount={(yearlyOrdersData.reduce((a, b) => a + b, 0) || 0).toLocaleString()} headerRightContent={<YearDropdown selectedValue={ordersSelectedYear} onValueChange={setOrdersSelectedYear} />} change="7.1%" subtitle={createSubtitleForYear(ordersSelectedYear)}>
          <BarChart data={yearlyOrdersData} labels={yearlyChartLabels} />
        </ChartCard>

        <ChartCard title="ยอดคำสั่งซื้อ (7 วัน)" amount={`${(weeklyOrdersData.reduce((a, b) => a + b, 0) || 0).toLocaleString()}`} headerRightContent={<CalendarDropdown selectedValue={weeklyOrdersSelectedDate} onValueChange={setWeeklyOrdersSelectedDate} />} change="3.4%">
          <BarChart data={weeklyOrdersData} labels={createLast7DaysLabels(weeklyOrdersSelectedDate)}/>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableCard title="สินค้าขายดีที่สุด" amount={`฿${totalSalesInTopYear.toLocaleString()}`} headerRightContent={<YearDropdown selectedValue={topProductsSelectedYear} onValueChange={setTopProductsSelectedYear} />} change="+5.8%" subtitle={createSubtitleForYear(topProductsSelectedYear)}>
          <div className="mt-3 overflow-x-auto">
            <table className="table table-sm">
              <thead><tr><th>สินค้า</th><th className="text-right">จำนวน</th><th className="text-right">ยอดขาย</th></tr></thead>
              <tbody>{topProductsYearData.map((p, i) => (<tr key={i}><td>{p.name}</td><td className="text-right">{p.qty.toLocaleString()}</td><td className="text-right">{`฿${p.price.toLocaleString()}`}</td></tr>))}</tbody>
            </table>
          </div>
        </TableCard>

        <TableCard title="สินค้าขายดีที่สุด (7 วัน)" amount={`฿${totalSalesInTopDay.toLocaleString()}`} headerRightContent={<CalendarDropdown selectedValue={weeklyTopProductsSelectedDate} onValueChange={setWeeklyTopProductsSelectedDate} />} change="-0.5%" down>
          <div className="mt-3 overflow-x-auto">
            <table className="table table-sm">
              <thead><tr><th>สินค้า</th><th className="text-right">จำนวน</th><th className="text-right">ยอดขาย</th></tr></thead>
              <tbody>{weeklyTopProductsData.map((p, i) => (<tr key={i}><td>{p.name}</td><td className="text-right">{p.qty.toLocaleString()}</td><td className="text-right">{`฿${p.price.toLocaleString()}`}</td></tr>))}</tbody>
            </table>
          </div>
        </TableCard>
      </div>
    </div>
  );
}