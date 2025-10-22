'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaEllipsisV, FaFileInvoice } from 'react-icons/fa';
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

type ProductInOrder = {
  name: string;
  qty: number;
  price: number;
};

type OrderDetail = Order & {
  items: ProductInOrder[];
};

const DEMO_ORDER_DETAILS: { [key: string]: OrderDetail } = {
  'o01': { id: 'o01', orderNumber: 'ORD-2568001', customerName: 'สมชาย ใจดี', orderDate: '2568-10-15', totalAmount: 565, itemCount: 3, status: 'จัดส่งสำเร็จ', items: [ { name: 'เค้กช็อกโกแลต', qty: 2, price: 250 }, { name: 'ครัวซองต์', qty: 1, price: 65 } ] },
  'o02': { id: 'o02', orderNumber: 'ORD-2568002', customerName: 'สมหญิง มุ่งมั่น', orderDate: '2568-10-16', totalAmount: 160, itemCount: 2, status: 'กำลังจัดส่ง', items: [ { name: 'ขนมปังกระเทียม', qty: 2, price: 80 } ] },
  'o03': { id: 'o03', orderNumber: 'ORD-2568003', customerName: 'กวินทร์ ตั้งใจ', orderDate: '2568-10-16', totalAmount: 220, itemCount: 1, status: 'รอดำเนินการ', items: [ { name: 'เค้กส้ม', qty: 1, price: 220 } ] },
  'o04': { id: 'o04', orderNumber: 'ORD-2568004', customerName: 'มานี มีนา', orderDate: '2568-10-14', totalAmount: 690, itemCount: 5, status: 'ยกเลิก', items: [ { name: 'มาการองเซ็ต', qty: 3, price: 180 }, { name: 'เอแคลร์', qty: 2, price: 75 } ] },
  'o05': { id: 'o05', orderNumber: 'ORD-2568005', customerName: 'ปิติ ยินดี', orderDate: '2568-10-17', totalAmount: 180, itemCount: 2, status: 'รอดำเนินการ', items: [ { name: 'บราวนี่', qty: 2, price: 90 } ] },
  'o06': { id: 'o06', orderNumber: 'ORD-2568006', customerName: 'วีระ มานะ', orderDate: '2568-10-17', totalAmount: 785, itemCount: 8, status: 'จัดส่งสำเร็จ', items: [ { name: 'คัพเค้ก', qty: 5, price: 85 }, { name: 'ทาร์ตผลไม้', qty: 3, price: 120 } ] },
};

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

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

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
  const [allOrders, setAllOrders] = useState<{ [key: string]: OrderDetail }>(DEMO_ORDER_DETAILS);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const pageSizeOptions = [5, 10, 15, 20];
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [viewingOrder, setViewingOrder] = useState<OrderDetail | null>(null);
  
  // ========== START: ส่วนที่เพิ่มเข้ามาสำหรับ Popup ยืนยัน ==========
  const [statusUpdateInfo, setStatusUpdateInfo] = useState<{ orderId: string; newStatus: Order['status'] } | null>(null);

  const openConfirmationModal = (orderId: string, newStatus: Order['status']) => {
    // ไม่ต้องเปิด modal ถ้าสถานะเป็นสถานะปัจจุบันอยู่แล้ว
    if (allOrders[orderId]?.status === newStatus) return;
    setStatusUpdateInfo({ orderId, newStatus });
  };

  const closeConfirmationModal = () => {
    setStatusUpdateInfo(null);
  };

  const handleConfirmUpdate = () => {
    if (statusUpdateInfo) {
      handleUpdateStatus(statusUpdateInfo.orderId, statusUpdateInfo.newStatus);
      closeConfirmationModal();
    }
  };
  // ========== END: ส่วนที่เพิ่มเข้ามาสำหรับ Popup ยืนยัน ==========

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    setAllOrders(prevAllOrders => ({
      ...prevAllOrders,
      [orderId]: {
        ...prevAllOrders[orderId],
        status: newStatus,
      }
    }));
  };
  
  const ALL_STATUSES: Order['status'][] = ['รอดำเนินการ', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ', 'ยกเลิก'];

  // --- Calculations ---
  const orders = useMemo(() => Object.values(allOrders).map(({ items, ...order }) => order), [allOrders]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'รอดำเนินการ').length;
  const totalRevenue = orders.filter(o => o.status !== 'ยกเลิก').reduce((sum, o) => sum + o.totalAmount, 0);

  const statuses = useMemo(() => {
    const set = new Set<string>(['all']);
    orders.forEach((o) => set.add(o.status));
    return Array.from(set);
  }, [orders]);

  const filteredOrders = useMemo(
    () => filterOrders(orders, searchTerm, selectedStatus),
    [orders, searchTerm, selectedStatus]
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
  
  useEffect(() => {
    if (viewingOrder) {
      setViewingOrder(allOrders[viewingOrder.id]);
    }
  }, [allOrders, viewingOrder]);

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
                    <th className="p-4 text-center">จัดการ</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((o) => (
                    <tr key={o.id} className="hover border-b">
                      <td className="p-4 font-mono">{o.orderNumber}</td>
                      <td className="p-4">{o.customerName}</td>
                      <td className="p-4">{formatDateDisplay(o.orderDate)}</td>
                      <td className="p-4 text-right">{o.itemCount.toLocaleString()} ชิ้น</td>
                      <td className="p-4 text-right">{fPrice(o.totalAmount)}</td>
                      <td className="p-4 text-center">
                        <span className={`badge w-28 justify-center ${getStatusBadgeClass(o.status)}`}>
                            {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="dropdown dropdown-left">
                          <label tabIndex={0} className="btn btn-ghost btn-xs m-1"><FaEllipsisV /></label>
                          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-40">
                            {ALL_STATUSES.map(status => (
                                <li key={status}>
                                    {/* ========== START: ส่วนที่แก้ไข onClick ========== */}
                                    <a onClick={() => openConfirmationModal(o.id, status)} className={o.status === status ? 'font-bold' : ''}>
                                    {/* ========== END: ส่วนที่แก้ไข onClick ========== */}
                                        {status}
                                    </a>
                                </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                            className="btn btn-ghost btn-sm"
                            aria-label={`View details for order ${o.orderNumber}`}
                            onClick={() => setViewingOrder(allOrders[o.id])}
                        >
                            <FaFileInvoice className="h-4 w-4" />
                        </button>
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
                        {pageSizeOptions.map(size => (<option key={size} value={size}>{size}</option>))}
                    </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Modal สำหรับดูรายละเอียด */}
        <dialog className="modal" open={!!viewingOrder}>
            <div className="modal-box max-w-3xl">
                <h3 className="font-bold text-lg mb-1">รายละเอียดออเดอร์</h3>
                <p className="text-sm text-base-content/70 mb-4 font-mono">{viewingOrder?.orderNumber}</p>
                
                {viewingOrder && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div>
                                <p><span className="font-semibold">ชื่อลูกค้า:</span> {viewingOrder.customerName}</p>
                                <p><span className="font-semibold">วันที่สั่ง:</span> {formatDateDisplay(viewingOrder.orderDate)}</p>
                            </div>
                            <div>
                                <p className="flex items-center gap-2">
                                    <span className="font-semibold">สถานะ:</span>
                                    <span className={`badge ${getStatusBadgeClass(viewingOrder.status)}`}>{viewingOrder.status}</span>
                                 </p>
                            </div>
                        </div>

                        <h4 className="font-semibold mb-2">รายการสินค้า</h4>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="table table-zebra w-full">
                                <thead className="bg-base-200">
                                    <tr>
                                        <th>สินค้า</th>
                                        <th className="text-right">จำนวน</th>
                                        <th className="text-right">ราคา/หน่วย</th>
                                        <th className="text-right">ราคารวม</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewingOrder.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.name}</td>
                                            <td className="text-right">{item.qty}</td>
                                            <td className="text-right">{fPrice(item.price)}</td>
                                            <td className="text-right font-medium">{fPrice(item.qty * item.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="font-bold text-lg bg-base-300">
                                        <td colSpan={3} className="text-right">ยอดรวมสุทธิ</td>
                                        <td className="text-right">{fPrice(viewingOrder.totalAmount)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </>
                )}

                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn" onClick={() => setViewingOrder(null)}>ปิด</button>
                    </form>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={() => setViewingOrder(null)}>
                <button>close</button>
            </form>
        </dialog>

        {/* ========== START: Modal สำหรับยืนยันการเปลี่ยนสถานะ ========== */}
        <dialog className="modal" open={!!statusUpdateInfo}>
            <div className="modal-box">
                <h3 className="font-bold text-lg">ยืนยันการเปลี่ยนแปลงสถานะ</h3>
                <p className="py-4">
                    คุณต้องการเปลี่ยนสถานะของออเดอร์ <span className="font-mono">{statusUpdateInfo ? allOrders[statusUpdateInfo.orderId]?.orderNumber : ''}</span> เป็น <span className={`badge ${getStatusBadgeClass(statusUpdateInfo?.newStatus || 'รอดำเนินการ')}`}>{statusUpdateInfo?.newStatus}</span> ใช่หรือไม่?
                </p>
                <div className="modal-action">
                    <button className="btn" onClick={closeConfirmationModal}>ยกเลิก</button>
                    <button className="btn btn-primary" onClick={handleConfirmUpdate}>ยืนยัน</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={closeConfirmationModal}>
                <button>close</button>
            </form>
        </dialog>
        {/* ========== END: Modal สำหรับยืนยันการเปลี่ยนสถานะ ========== */}
    </main>
  );
}