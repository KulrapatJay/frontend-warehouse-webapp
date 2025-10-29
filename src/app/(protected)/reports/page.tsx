"use client";

import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import KpiCard from "@/components/reports/KpiCard";
import ChartCard from "@/components/reports/ChartCard";
import BarChart from "@/components/reports/BarChart";

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
        <div className="grid grid-cols-7 gap-1 text-center text-xs mt-2">{dayNames.map(day => <div key={day} className="font-semibold text-base-content/60">{day}</div>)}</div>
        <div className="grid grid-cols-7 gap-1 mt-1">
          {Array.from({ length: startOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = selectedValue.getDate() === day && selectedValue.getMonth() === displayDate.getMonth() && selectedValue.getFullYear() === displayDate.getFullYear();
            return (<button key={day} onClick={() => handleDayClick(day)} className={`btn btn-xs btn-ghost ${isSelected ? 'btn-active' : ''}`}>{day}</button>);
          })}
        </div>
      </div>
    </div>
  );
}

/** ========= Page Component (ปรับใช้ข้อมูลจาก API) ========= */
export default function ReportPage() {
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(false);

  // --- ส่วนที่ 1: แยก State ของแต่ละการ์ดออกจากกัน ---
  const [kpiData, setKpiData] = useState({ totalMonthSales: 0, todayOrdersCount: 0, todaySales: 0, lastMonthSales: 0, yesterdayOrdersCount: 0, yesterdaySales: 0 });
  
  // States สำหรับข้อมูลรายปี
  const [yearlySales, setYearlySales] = useState({ data: [] as number[], prevYearTotal: 0 });
  const [yearlyOrders, setYearlyOrders] = useState({ data: [] as number[], prevYearTotal: 0 });
  const [yearlyTopProducts, setYearlyTopProducts] = useState({ data: [] as TopProduct[], prevYearTotal: 0 });

  // States สำหรับข้อมูลรายสัปดาห์
  const [weeklySales, setWeeklySales] = useState({ data: [] as number[], prevWeekTotal: 0 });
  const [weeklyOrders, setWeeklyOrders] = useState({ data: [] as number[], prevWeekTotal: 0 });
  const [weeklyTopProducts, setWeeklyTopProducts] = useState({ data: [] as TopProduct[], prevWeekTotal: 0 });
  
  // State สำหรับควบคุม Dropdown (เหมือนเดิม)
  const [salesSelectedYear, setSalesSelectedYear] = useState(currentYear);
  const [ordersSelectedYear, setOrdersSelectedYear] = useState(currentYear);
  const [topProductsSelectedYear, setTopProductsSelectedYear] = useState(currentYear);
  const [weeklySalesSelectedDate, setWeeklySalesSelectedDate] = useState(new Date());
  const [weeklyOrdersSelectedDate, setWeeklyOrdersSelectedDate] = useState(new Date());
  const [weeklyTopProductsSelectedDate, setWeeklyTopProductsSelectedDate] = useState(new Date());

  // --- (Fetch KPI Data เหมือนเดิม) ---
  const fetchKPIData = async () => {
    try {
      setLoading(true);
      const lastMonth = new Date(); lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      
      const [kpiRes, lastMonthRes, yesterdayRes] = await Promise.all([
        axios.get('/api/reports?type=kpi'),
        axios.get(`/api/reports?type=monthly&startDate=${lastMonthStart.toISOString()}&endDate=${lastMonthEnd.toISOString()}`),
        axios.get(`/api/reports?type=daily&startDate=${yesterday.toISOString()}`)
      ]);
      
      setKpiData({
        totalMonthSales: kpiRes.data.totalMonthSales || 0,
        todayOrdersCount: kpiRes.data.todayOrdersCount || 0,
        todaySales: kpiRes.data.todaySales || 0,
        lastMonthSales: lastMonthRes.data.totalMonthSales || 0,
        yesterdayOrdersCount: yesterdayRes.data.ordersCount || 0,
        yesterdaySales: yesterdayRes.data.totalSales || 0
      });
    } catch (error) { toast.error('ไม่สามารถดึงข้อมูล KPI ได้'); } 
    finally { setLoading(false); }
  };
  
  // --- ส่วนที่ 2: สร้างฟังก์ชัน Fetch แยกสำหรับแต่ละการ์ด  ---
  const fetchYearlyData = async (year: number, dataType: 'sales' | 'orders' | 'topProducts') => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reports?type=yearly&year=${year}`);
      const data = response.data;
      
      if(dataType === 'sales') {
        setYearlySales({ data: data.salesByMonth || Array(12).fill(0), prevYearTotal: data.previousYearTotalSales || 0 });
      } else if (dataType === 'orders') {
        setYearlyOrders({ data: data.ordersByMonth || Array(12).fill(0), prevYearTotal: data.previousYearTotalOrders || 0 });
      } else if (dataType === 'topProducts') {
        setYearlyTopProducts({ data: data.topProducts || [], prevYearTotal: data.previousYearTotalSales || 0 });
      }
    } catch (error) { toast.error(`ไม่สามารถดึงข้อมูลรายปี (${dataType}) ได้`); } 
    finally { setLoading(false); }
  };
  
  const fetchWeeklyData = async (endDate: Date, dataType: 'sales' | 'orders' | 'topProducts') => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reports?type=weekly&endDate=${endDate.toISOString()}`);
      const data = response.data;

      if(dataType === 'sales') {
        setWeeklySales({ data: data.salesByWeek || Array(7).fill(0), prevWeekTotal: data.previousWeekTotalSales || 0 });
      } else if (dataType === 'orders') {
        setWeeklyOrders({ data: data.ordersByWeek || Array(7).fill(0), prevWeekTotal: data.previousWeekTotalOrders || 0 });
      } else if (dataType === 'topProducts') {
        setWeeklyTopProducts({ data: data.topProducts || [], prevWeekTotal: data.previousWeekTotalSales || 0 });
      }
    } catch (error) { toast.error(`ไม่สามารถดึงข้อมูลรายสัปดาห์ (${dataType}) ได้`); }
    finally { setLoading(false); }
  };

  // --- ส่วนที่ 3: แก้ไข useEffect ให้เรียกฟังก์ชันที่แยกไว้  ---
  useEffect(() => { fetchKPIData(); }, []);
  useEffect(() => { fetchYearlyData(salesSelectedYear, 'sales'); }, [salesSelectedYear]);
  useEffect(() => { fetchYearlyData(ordersSelectedYear, 'orders'); }, [ordersSelectedYear]);
  useEffect(() => { fetchYearlyData(topProductsSelectedYear, 'topProducts'); }, [topProductsSelectedYear]);
  useEffect(() => { fetchWeeklyData(weeklySalesSelectedDate, 'sales'); }, [weeklySalesSelectedDate]);
  useEffect(() => { fetchWeeklyData(weeklyOrdersSelectedDate, 'orders'); }, [weeklyOrdersSelectedDate]);
  useEffect(() => { fetchWeeklyData(weeklyTopProductsSelectedDate, 'topProducts'); }, [weeklyTopProductsSelectedDate]);

  // --- (ส่วน helpers และ components ย่อย เหมือนเดิม) ---
  const yearOptions = useMemo(() => {
    const options = []; const year = new Date().getFullYear();
    for (let i = 0; i < 5; i++) { const targetYear = year - i; options.push({ label: `พ.ศ. ${targetYear + 543}`, value: targetYear }); }
    return options.reverse();
  }, []);
  const createLast7DaysLabels = (endDate: Date) => {
    const labels = []; const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
    for (let i = 6; i >= 0; i--) { const d = new Date(endDate); d.setDate(endDate.getDate() - i); labels.push(dayNames[d.getDay()]); }
    return labels;
  };
  const today = new Date();
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(today.getDate() - 30);
  const todayFormatted = formatDate(today);
  const dateRange30Days = `${formatDate(thirtyDaysAgo)} - ${todayFormatted}`;
  const yearlyChartLabels = useMemo(() => ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."], []);
  
  // คำนวณยอดรวมจาก State ที่แยกกัน
  const totalSalesInTopYear = yearlyTopProducts.data.reduce((sum, item) => sum + item.price, 0);
  const totalSalesInTopDay = weeklyTopProducts.data.reduce((sum, item) => sum + item.price, 0);

  const YearDropdown = ({ selectedValue, onValueChange }: { selectedValue: number; onValueChange: (value: number) => void; }) => (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
        {yearOptions.find(opt => opt.value === selectedValue)?.label || "เลือกปี"}
        <svg width="12px" height="12px" className="h-2 w-2 fill-current opacity-60 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path></svg>
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        {yearOptions.map((year) => (<li key={year.value}><a className={selectedValue === year.value ? "active" : ""} onClick={() => onValueChange(year.value)}>{year.label}</a></li>))}
      </ul>
    </div>
  );
  const createSubtitleForYear = (selectedYear: number) => { if (!selectedYear) return ""; return `มกราคม - ธันวาคม ${selectedYear + 543}`; };

  // ---  (ส่วนคำนวณ % เหมือนเดิม)  ---
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100.0%" : "+0.0%";
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  // KPI Changes
  const monthlyChange = calculatePercentageChange(kpiData.totalMonthSales, kpiData.lastMonthSales);
  const ordersChange = calculatePercentageChange(kpiData.todayOrdersCount, kpiData.yesterdayOrdersCount);
  const salesChange = calculatePercentageChange(kpiData.todaySales, kpiData.yesterdaySales);

  // Yearly Changes (คำนวณแยกแต่ละส่วน)
  const currentYearlySales = yearlySales.data.reduce((a, b) => a + b, 0);
  const currentYearlyOrders = yearlyOrders.data.reduce((a, b) => a + b, 0);
  const yearlySalesChange = calculatePercentageChange(currentYearlySales, yearlySales.prevYearTotal);
  const yearlyOrdersChange = calculatePercentageChange(currentYearlyOrders, yearlyOrders.prevYearTotal);
  const yearlyTopProductsChange = calculatePercentageChange(totalSalesInTopYear, yearlyTopProducts.prevYearTotal); // ใช้ prevYearTotalSales สำหรับ TopProduct

  // Weekly Changes (คำนวณแยกแต่ละส่วน)
  const currentWeeklySales = weeklySales.data.reduce((a, b) => a + b, 0);
  const currentWeeklyOrders = weeklyOrders.data.reduce((a, b) => a + b, 0);
  const weeklySalesChange = calculatePercentageChange(currentWeeklySales, weeklySales.prevWeekTotal);
  const weeklyOrdersChange = calculatePercentageChange(currentWeeklyOrders, weeklyOrders.prevWeekTotal);
  const weeklyTopProductsChange = calculatePercentageChange(totalSalesInTopDay, weeklyTopProducts.prevWeekTotal); // ใช้ prevWeekTotalSales สำหรับ TopProduct

  if (loading) {
    return (<div className="flex justify-center items-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>);
  }

  return (
    <div className="space-y-6">
      {/* --- ส่วนที่ 4: เชื่อมต่อ UI กับ State ที่แยกกัน ⬇️ --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="ยอดขายรวม" value={`฿${kpiData.totalMonthSales.toLocaleString("th-TH")}`} subtitle={dateRange30Days} change={monthlyChange} down={monthlyChange.startsWith('-')} />
        <KpiCard title="ยอดคำสั่งซื้อวันนี้" value={kpiData.todayOrdersCount.toLocaleString("th-TH")} subtitle={todayFormatted} change={ordersChange} down={ordersChange.startsWith('-')} />
        <KpiCard title="ยอดขายวันนี้" value={`฿${kpiData.todaySales.toLocaleString("th-TH")}`} subtitle={todayFormatted} change={salesChange} down={salesChange.startsWith('-')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="ยอดขายรวม" amount={`฿${currentYearlySales.toLocaleString()}`} headerRightContent={<YearDropdown selectedValue={salesSelectedYear} onValueChange={setSalesSelectedYear} />} change={yearlySalesChange} down={yearlySalesChange.startsWith('-')} subtitle={createSubtitleForYear(salesSelectedYear)}>
          <BarChart data={yearlySales.data} labels={yearlyChartLabels} />
        </ChartCard>
        <ChartCard title="ยอดขายรวม (7 วัน)" amount={`฿${currentWeeklySales.toLocaleString()}`} headerRightContent={<CalendarDropdown selectedValue={weeklySalesSelectedDate} onValueChange={setWeeklySalesSelectedDate} />} change={weeklySalesChange} down={weeklySalesChange.startsWith('-')}>
          <BarChart data={weeklySales.data} labels={createLast7DaysLabels(weeklySalesSelectedDate)} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="ยอดคำสั่งซื้อ" amount={currentYearlyOrders.toLocaleString()} headerRightContent={<YearDropdown selectedValue={ordersSelectedYear} onValueChange={setOrdersSelectedYear} />} change={yearlyOrdersChange} down={yearlyOrdersChange.startsWith('-')} subtitle={createSubtitleForYear(ordersSelectedYear)}>
          <BarChart data={yearlyOrders.data} labels={yearlyChartLabels} />
        </ChartCard>
        <ChartCard title="ยอดคำสั่งซื้อ (7 วัน)" amount={currentWeeklyOrders.toLocaleString()} headerRightContent={<CalendarDropdown selectedValue={weeklyOrdersSelectedDate} onValueChange={setWeeklyOrdersSelectedDate} />} change={weeklyOrdersChange} down={weeklyOrdersChange.startsWith('-')}>
          <BarChart data={weeklyOrders.data} labels={createLast7DaysLabels(weeklyOrdersSelectedDate)}/>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableCard title="สินค้าขายดีที่สุด" amount={`฿${totalSalesInTopYear.toLocaleString()}`} headerRightContent={<YearDropdown selectedValue={topProductsSelectedYear} onValueChange={setTopProductsSelectedYear} />} change={yearlyTopProductsChange} down={yearlyTopProductsChange.startsWith('-')} subtitle={createSubtitleForYear(topProductsSelectedYear)}>
          <div className="mt-3 overflow-x-auto"><table className="table table-sm"><thead><tr><th>สินค้า</th><th className="text-right">จำนวน</th><th className="text-right">ยอดขาย</th></tr></thead><tbody>{yearlyTopProducts.data.map((p, i) => (<tr key={i}><td>{p.name}</td><td className="text-right">{p.qty.toLocaleString()}</td><td className="text-right">{`฿${p.price.toLocaleString()}`}</td></tr>))}</tbody></table></div>
        </TableCard>
        <TableCard title="สินค้าขายดีที่สุด (7 วัน)" amount={`฿${totalSalesInTopDay.toLocaleString()}`} headerRightContent={<CalendarDropdown selectedValue={weeklyTopProductsSelectedDate} onValueChange={setWeeklyTopProductsSelectedDate} />} change={weeklyTopProductsChange} down={weeklyTopProductsChange.startsWith('-')}>
          <div className="mt-3 overflow-x-auto"><table className="table table-sm"><thead><tr><th>สินค้า</th><th className="text-right">จำนวน</th><th className="text-right">ยอดขาย</th></tr></thead><tbody>{weeklyTopProducts.data.map((p, i) => (<tr key={i}><td>{p.name}</td><td className="text-right">{p.qty.toLocaleString()}</td><td className="text-right">{`฿${p.price.toLocaleString()}`}</td></tr>))}</tbody></table></div>
        </TableCard>
      </div>
    </div>
  );
}