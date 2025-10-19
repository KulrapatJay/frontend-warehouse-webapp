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
          <span className="font-semibold">{monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}</span>
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
  
  const now = new Date();
  const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // --- State สำหรับข้อมูลรายเดือน ---
  const [salesSelectedMonth, setSalesSelectedMonth] = useState(currentMonthValue);
  const [monthlySalesData, setMonthlySalesData] = useState<number[]>([]);
  const [ordersSelectedMonth, setOrdersSelectedMonth] = useState(currentMonthValue);
  const [monthlyOrdersData, setMonthlyOrdersData] = useState<number[]>([]);
  const [topProductsSelectedMonth, setTopProductsSelectedMonth] = useState(currentMonthValue);
  const [topProductsMonthData, setTopProductsMonthData] = useState<TopProduct[]>([]);

  // --- State สำหรับข้อมูลรายสัปดาห์ (แยกกัน) ---
  const [weeklySalesSelectedDate, setWeeklySalesSelectedDate] = useState(new Date());
  const [weeklySalesData, setWeeklySalesData] = useState<number[]>([]);
  const [weeklyOrdersSelectedDate, setWeeklyOrdersSelectedDate] = useState(new Date());
  const [weeklyOrdersData, setWeeklyOrdersData] = useState<number[]>([]);
  const [weeklyTopProductsSelectedDate, setWeeklyTopProductsSelectedDate] = useState(new Date());
  const [weeklyTopProductsData, setWeeklyTopProductsData] = useState<TopProduct[]>(topDay);

  const monthOptions = useMemo(() => {
    const options = [];
    const currentYear = new Date().getFullYear();
    const monthNames = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",];
    for (let i = 0; i < 12; i++) {
      options.push({ label: monthNames[i], value: `${currentYear}-${String(i + 1).padStart(2, "0")}`, });
    }
    return options;
  }, []);
  
  // --- useEffects สำหรับข้อมูลรายเดือน ---
  useEffect(() => {
    setMonthlySalesData(Array.from({ length: 13 }, () => Math.floor(Math.random() * 30000) + 20000));
  }, [salesSelectedMonth]);
  useEffect(() => {
    setMonthlyOrdersData(Array.from({ length: 13 }, () => Math.floor(Math.random() * 250) + 300));
  }, [ordersSelectedMonth]);
  useEffect(() => {
    setTopProductsMonthData([...topMonth].sort(() => 0.5 - Math.random()).map(p => ({ ...p, qty: Math.floor(Math.random() * 300) + 50 })));
  }, [topProductsSelectedMonth]);

  // --- useEffects สำหรับข้อมูลรายสัปดาห์ (แยกกัน) ---
  useEffect(() => {
    setWeeklySalesData(Array.from({ length: 7 }, () => Math.floor(Math.random() * 1500) + 1500));
  }, [weeklySalesSelectedDate]);
  useEffect(() => {
    setWeeklyOrdersData(Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 15));
  }, [weeklyOrdersSelectedDate]);
  useEffect(() => {
    setWeeklyTopProductsData([...topDay].sort(() => 0.5 - Math.random()).map(p => ({...p, qty: Math.floor(Math.random() * 50) + 10})));
  }, [weeklyTopProductsSelectedDate]);

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
  
  const createDynamicChartLabels = (selectedValue: string) => {
    if (!selectedValue) return [];
    const labels = [];
    const shortMonthNames = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค.",];
    const [year, month] = selectedValue.split('-').map(Number);
    const currentDate = new Date(year, month - 1, 1);
    for (let i = 0; i < 13; i++) {
        const monthIndex = currentDate.getMonth();
        const yearBE = (currentDate.getFullYear() % 100) + 43;
        labels.push(`${shortMonthNames[monthIndex]} ${yearBE}`);
        currentDate.setMonth(currentDate.getMonth() - 1);
    }
    return labels.reverse();
  };

  const salesChartLabels = useMemo(() => createDynamicChartLabels(salesSelectedMonth), [salesSelectedMonth]);
  const ordersChartLabels = useMemo(() => createDynamicChartLabels(ordersSelectedMonth), [ordersSelectedMonth]);

  const totalSalesInTopMonth = topProductsMonthData.reduce((sum, item) => sum + item.price, 0);
  const totalSalesInTopDay = weeklyTopProductsData.reduce((sum, item) => sum + item.price, 0);
  
  const MonthDropdown = ({ selectedValue, onValueChange }: { selectedValue: string; onValueChange: (value: string) => void; }) => ( <div className="dropdown dropdown-end"> <div tabIndex={0} role="button" className="btn btn-ghost btn-sm"> {monthOptions.find(opt => opt.value === selectedValue)?.label || "เลือกเดือน"} <svg width="12px" height="12px" className="h-2 w-2 fill-current opacity-60 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path></svg> </div> <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"> {monthOptions.map((month) => ( <li key={month.value}> <a className={selectedValue === month.value ? "active" : ""} onClick={() => onValueChange(month.value)}> {month.label} </a> </li> ))} </ul> </div> );
  
  const createDynamicSubtitle = (selectedValue: string) => {
    if (!selectedValue) return "";
    const shortMonthNames = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค.",];
    const [endYear, endMonth] = selectedValue.split('-').map(Number);
    const endDate = new Date(endYear, endMonth - 1, 1);
    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - 1);
    const startYearBE = (startDate.getFullYear() % 100) + 43;
    const endYearBE = (endDate.getFullYear() % 100) + 43;
    return `${shortMonthNames[startDate.getMonth()]} ${startYearBE} - ${shortMonthNames[endDate.getMonth()]} ${endYearBE}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="ยอดขายรวม" value={`฿${totalMonthTHB.toLocaleString("th-TH")}`} subtitle={dateRange30Days} change="+12.5%"/>
        <KpiCard title="ยอดคำสั่งซื้อวันนี้" value={ordersToday.toLocaleString("th-TH")} subtitle={todayFormatted} change="+5.1%"/>
        <KpiCard title="ยอดขายวันนี้" value={`฿${salesTodayTHB.toLocaleString("th-TH")}`} subtitle={todayFormatted} change="-2.3%" down={true}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="ยอดขายรวม" amount={`฿${(monthlySalesData[monthlySalesData.length - 1] || 0).toLocaleString()}`} headerRightContent={<MonthDropdown selectedValue={salesSelectedMonth} onValueChange={setSalesSelectedMonth} />} change="15.2%" subtitle={createDynamicSubtitle(salesSelectedMonth)}>
          <BarChart data={monthlySalesData} labels={salesChartLabels} />
        </ChartCard>
        
        {/* START: แก้ไข: ลบ subtitle ออก */}
        <ChartCard title="ยอดขายรวม" amount={`฿${(weeklySalesData[weeklySalesData.length - 1] || 0).toLocaleString()}`} headerRightContent={<CalendarDropdown selectedValue={weeklySalesSelectedDate} onValueChange={setWeeklySalesSelectedDate} />} change="1.8%" down>
          <BarChart data={weeklySalesData} labels={createLast7DaysLabels(weeklySalesSelectedDate)} />
        </ChartCard>
        {/* END: แก้ไข */}

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="ยอดคำสั่งซื้อ" amount={(monthlyOrdersData[monthlyOrdersData.length - 1] || 0).toLocaleString()} headerRightContent={<MonthDropdown selectedValue={ordersSelectedMonth} onValueChange={setOrdersSelectedMonth} />} change="7.1%" subtitle={createDynamicSubtitle(ordersSelectedMonth)}>
          <BarChart data={monthlyOrdersData} labels={ordersChartLabels} />
        </ChartCard>

        {/* START: แก้ไข: ลบ subtitle ออก */}
        <ChartCard title="ยอดคำสั่งซื้อ" amount={`${(weeklyOrdersData[weeklyOrdersData.length - 1] || 0).toLocaleString()}`} headerRightContent={<CalendarDropdown selectedValue={weeklyOrdersSelectedDate} onValueChange={setWeeklyOrdersSelectedDate} />} change="3.4%">
          <BarChart data={weeklyOrdersData} labels={createLast7DaysLabels(weeklyOrdersSelectedDate)}/>
        </ChartCard>
        {/* END: แก้ไข */}

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableCard title="สินค้าขายดีที่สุด" amount={`฿${totalSalesInTopMonth.toLocaleString()}`} headerRightContent={<MonthDropdown selectedValue={topProductsSelectedMonth} onValueChange={setTopProductsSelectedMonth} />} change="+5.8%" subtitle={createDynamicSubtitle(topProductsSelectedMonth)}>
          <div className="mt-3 overflow-x-auto">
            <table className="table table-sm">
              <thead><tr><th>สินค้า</th><th className="text-right">จำนวน</th><th className="text-right">ยอดขาย</th></tr></thead>
              <tbody>{topProductsMonthData.map((p, i) => (<tr key={i}><td>{p.name}</td><td className="text-right">{p.qty.toLocaleString()}</td><td className="text-right">{`฿${p.price.toLocaleString()}`}</td></tr>))}</tbody>
            </table>
          </div>
        </TableCard>

        {/* START: แก้ไข: ลบ subtitle ออก */}
        <TableCard title="สินค้าขายดีที่สุด" amount={`฿${totalSalesInTopDay.toLocaleString()}`} headerRightContent={<CalendarDropdown selectedValue={weeklyTopProductsSelectedDate} onValueChange={setWeeklyTopProductsSelectedDate} />} change="-0.5%" down>
          <div className="mt-3 overflow-x-auto">
            <table className="table table-sm">
              <thead><tr><th>สินค้า</th><th className="text-right">จำนวน</th><th className="text-right">ยอดขาย</th></tr></thead>
              <tbody>{weeklyTopProductsData.map((p, i) => (<tr key={i}><td>{p.name}</td><td className="text-right">{p.qty.toLocaleString()}</td><td className="text-right">{`฿${p.price.toLocaleString()}`}</td></tr>))}</tbody>
            </table>
          </div>
        </TableCard>
        {/* END: แก้ไข */}

      </div>
    </div>
  );
}