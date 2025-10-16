'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- Type Definitions & Data ---
type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  itemCount: number;
  status: 'รอดำเนินการ' | 'กำลังจัดส่ง' | 'จัดส่งสำเร็จ' | 'ยกเลิก';
};

const DEMO_ORDERS: Order[] = [
  { id: 'o01', orderNumber: 'ORD-2568001', customerName: 'สมชาย ใจดี', orderDate: '2568-10-15', totalAmount: 2500, itemCount: 3, status: 'จัดส่งสำเร็จ' },
  { id: 'o02', orderNumber: 'ORD-2568002', customerName: 'สมหญิง มุ่งมั่น', orderDate: '2568-10-16', totalAmount: 1200, itemCount: 2, status: 'กำลังจัดส่ง' },
  { id: 'o03', orderNumber: 'ORD-2568003', customerName: 'กวินทร์ ตั้งใจ', orderDate: '2568-10-16', totalAmount: 850, itemCount: 1, status: 'รอดำเนินการ' },
  { id: 'o04', orderNumber: 'ORD-2568004', customerName: 'มานี มีนา', orderDate: '2568-10-14', totalAmount: 3100, itemCount: 5, status: 'ยกเลิก' },
  { id: 'o05', orderNumber: 'ORD-2568005', customerName: 'ปิติ ยินดี', orderDate: '2568-10-17', totalAmount: 990, itemCount: 2, status: 'รอดำเนินการ' },
  { id: 'o06', orderNumber: 'ORD-2568006', customerName: 'วีระ มานะ', orderDate: '2568-10-17', totalAmount: 5250, itemCount: 8, status: 'จัดส่งสำเร็จ' },
];

// --- Helper Functions ---
const getStatusBadgeClass = (status: Order['status']) => {
  switch (status) {
    case 'จัดส่งสำเร็จ': return 'badge-success';
    case 'กำลังจัดส่ง': return 'badge-info';
    case 'รอดำเนินการ': return 'badge-warning';
    case 'ยกเลิก': return 'badge-error';
    default: return 'badge-ghost';
  }
};

const fPrice = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(n);

// ========== START: ส่วนที่แก้ไข (1. เพิ่มฟังก์ชันจัดรูปแบบวันที่) ==========
const formatDateDisplay = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};
// ========== END: ส่วนที่แก้ไข (1. เพิ่มฟังก์ชันจัดรูปแบบวันที่) ==========

export function filterOrders(
  list: Order[],
  searchTerm: string,
  status: string
): Order[] {
  const term = searchTerm.trim().toLowerCase();
  return list.filter((order) => {
    const matchSearch =
      order.customerName.toLowerCase().includes(term) ||
      order.orderNumber.toLowerCase().includes(term);
    const matchStatus = status === "all" || order.status === status;
    return matchSearch && matchStatus;
  });
}

// --- Component ---
export default function OrderPage() {
  const { theme } = useTheme();
  const router = useRouter();

  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const pageSizeOptions = [5, 10, 15, 20];
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);

  // --- Calculations ---
  const totalOrders = DEMO_ORDERS.length;
  const pendingOrders = DEMO_ORDERS.filter(o => o.status === 'รอดำเนินการ').length;
  const totalRevenue = DEMO_ORDERS.filter(o => o.status !== 'ยกเลิก').reduce((sum, o) => sum + o.totalAmount, 0);

  const statuses = useMemo(() => {
    const set = new Set<string>(['all']);
    DEMO_ORDERS.forEach((o) => set.add(o.status));
    return Array.from(set);
  }, []);

  const filteredOrders = useMemo(
    () => filterOrders(DEMO_ORDERS, searchTerm, selectedStatus),
    [searchTerm, selectedStatus]
  );

  // --- Pagination Logic ---
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedStatus, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);
  
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedOrders = filteredOrders.slice(startIdx, endIdx);

  const goto = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
  };
  
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(today);

  return (
    <main>
      <div>
        {/* KPI Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="stats bg-base-100 shadow"><div className="stat"><div className="stat-title">ออเดอร์ทั้งหมด</div><div className="stat-value text-info">{totalOrders.toLocaleString()}</div><div className="stat-desc flex justify-between"><span>รายการ</span><span>{formattedDate}</span></div></div></div>
            <div className="stats bg-base-100 shadow"><div className="stat"><div className="stat-title">ยอดขายรวม</div><div className="stat-value text-success">{fPrice(totalRevenue)}</div><div className="stat-desc flex justify-between"><span>(ไม่รวมรายการยกเลิก)</span></div></div></div>
            <div className="stats bg-base-100 shadow"><div className="stat"><div className="stat-title">รอดำเนินการ</div><div className="stat-value text-warning">{pendingOrders.toLocaleString()}</div><div className="stat-desc flex justify-between"><span>รายการ</span><span>{formattedDate}</span></div></div></div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Control Header */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm opacity-70">
                ออเดอร์ทั้งหมด{" "}
                <span className="font-semibold opacity-100">
                  {filteredOrders.length}
                </span>
              </span>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="ค้นหาเลขที่, ชื่อลูกค้า..." className="input input-bordered w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <select className="select select-bordered" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  {statuses.map((s) => (<option key={s} value={s}>{s === "all" ? "สถานะทั้งหมด" : s}</option>))}
                </select>
                
                <Link href="/order/add" className={`btn rounded-md text-white transition whitespace-nowrap ${ theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800' }`}>
                    <FaPlus className="h-4 w-4" />
                    สร้างออเดอร์
                </Link>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200 text-sm font-semibold uppercase">
                  <tr>
                    <th className="p-4">เลขที่ออเดอร์</th>
                    <th className="p-4">ชื่อลูกค้า</th>
                    <th className="p-4">วันที่สั่ง</th>
                    <th className="p-4 text-right">จำนวนสินค้า</th>
                    <th className="p-4 text-right">ยอดรวม</th>
                    <th className="p-4 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((o) => (
                    <tr key={o.id} className="hover border-b">
                      <td className="p-4 font-mono">{o.orderNumber}</td>
                      <td className="p-4">{o.customerName}</td>
                      {/* ========== START: ส่วนที่แก้ไข (2. เรียกใช้ฟังก์ชัน) ========== */}
                      <td className="p-4">{formatDateDisplay(o.orderDate)}</td>
                      {/* ========== END: ส่วนที่แก้ไข (2. เรียกใช้ฟังก์ชัน) ========== */}
                      <td className="p-4 text-right">{o.itemCount.toLocaleString()} ชิ้น</td>
                      <td className="p-4 text-right">{fPrice(o.totalAmount)}</td>
                      <td className="p-4 text-center">
                        <span className={`badge w-28 justify-center ${getStatusBadgeClass(o.status)}`}>
                            {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <p className="text-center p-8 text-base-content text-opacity-60">
                    ไม่พบข้อมูลออเดอร์ที่ตรงกับเงื่อนไข
                </p>
              )}
            </div>

            {/* Footer Section */}
            {filteredOrders.length > 0 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="opacity-70">
                    กำลังเเสดง <span className="font-semibold">{startIdx + 1}</span>–<span className="font-semibold">{Math.min(endIdx, filteredOrders.length)}</span> จาก <span className="font-semibold">{filteredOrders.length}</span>
                </div>
                
                <div className="flex items-center gap-1">
                    <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => goto(page - 1)}>&lt;</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button key={p} className={`btn btn-sm ${page === p ? 'btn-neutral' : 'btn-ghost'}`} onClick={() => goto(p)}>{p}</button>
                    ))}
                    <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => goto(page + 1)}>&gt;</button>
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap opacity-70">จำนวนแถวต่อหน้า</span>
                    <select className="select select-bordered select-sm" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}