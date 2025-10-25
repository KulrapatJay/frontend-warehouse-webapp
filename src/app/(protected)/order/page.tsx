'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaEllipsisV, FaFileInvoice } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

// --- Type Definitions ---
type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  itemCount: number;
  status: string;
  creatorName: string; // เพิ่มชื่อผู้รับผิดชอบ
};

type ProductInOrder = {
  name: string;
  qty: number;
  price: number;
};

type OrderDetail = Order & {
  items: ProductInOrder[];
};

// API Response Types
type ApiSalesOrder = {
  id: number;
  order_no: string;
  order_date: string;
  total_amount: string;
  notes: string;
  created_at: string;
  updated_at: string;
  customer: {
    id: number;
    customer_code: string;
    name: string;
    phone: string;
  };
  status: {
    id: number;
    status_name: string;
    description: string;
  };
  creator: {
    id: number;
    first_name: string;
    last_name: string;
    prefix: {
      name: string;
    };
  };
  items: Array<{
    id: number;
    quantity: number;
    unit_price: string;
    product: {
      id: number;
      product_name: string;
      sku: string;
      category: {
        category_name: string;
      };
    };
  }>;
};

type ApiStatus = {
  id: number;
  status_name: string;
  description: string;
};

// สถานะที่อนุญาตให้แสดงในระบบ
const ALLOWED_STATUSES = ['รอดำเนินการ', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ', 'ยกเลิก'];

// สถานะที่ไม่สามารถเปลี่ยนแปลงได้อีก (สถานะสุดท้าย)
const FINAL_STATUSES = ['จัดส่งสำเร็จ', 'ยกเลิก'];

// --- Helper Functions ---
const getStatusBadgeClass = (status: string) => {
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
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Transform API data to internal format
const transformApiOrderToOrder = (apiOrder: ApiSalesOrder): OrderDetail => {
  const items: ProductInOrder[] = apiOrder.items.map(item => ({
    name: item.product.product_name,
    qty: item.quantity,
    price: parseFloat(item.unit_price)
  }));

  return {
    id: apiOrder.id.toString(),
    orderNumber: apiOrder.order_no,
    customerName: apiOrder.customer.name,
    orderDate: apiOrder.order_date,
    totalAmount: parseFloat(apiOrder.total_amount),
    itemCount: apiOrder.items.reduce((sum, item) => sum + item.quantity, 0),
    status: apiOrder.status.status_name,
    creatorName: `${apiOrder.creator.prefix.name}${apiOrder.creator.first_name} ${apiOrder.creator.last_name}`, // สร้างชื่อเต็ม
    items: items
  };
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
      order.orderNumber.toLowerCase().includes(term) ||
      order.creatorName.toLowerCase().includes(term); // เพิ่มการค้นหาจากชื่อผู้รับผิดชอบ
    const matchStatus = status === "all" || order.status === status;
    return matchSearch && matchStatus;
  });
}

// --- Component ---
export default function OrderPage() {
  const { theme } = useTheme();
  const router = useRouter();

  // --- State ---
  const [allOrders, setAllOrders] = useState<{ [key: string]: OrderDetail }>({});
  const [availableStatuses, setAvailableStatuses] = useState<ApiStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const pageSizeOptions = [5, 10, 15, 20];
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [viewingOrder, setViewingOrder] = useState<OrderDetail | null>(null);
  
  // ========== START: ส่วนที่เพิ่มเข้ามาสำหรับ Popup ยืนยัน ==========
  const [statusUpdateInfo, setStatusUpdateInfo] = useState<{ orderId: string; newStatus: string; statusId: number } | null>(null);

  const openConfirmationModal = (orderId: string, newStatus: string, statusId: number) => {
    // ไม่ต้องเปิด modal ถ้าสถานะเป็นสถานะปัจจุบันอยู่แล้ว
    if (allOrders[orderId]?.status === newStatus) return;
    setStatusUpdateInfo({ orderId, newStatus, statusId });
  };

  const closeConfirmationModal = () => {
    setStatusUpdateInfo(null);
  };

  const handleConfirmUpdate = async () => {
    if (statusUpdateInfo) {
      await handleUpdateStatus(statusUpdateInfo.orderId, statusUpdateInfo.newStatus, statusUpdateInfo.statusId);
      closeConfirmationModal();
    }
  };

  // Fetch orders from API
// Fetch orders from API
const fetchOrders = async () => {
  try {
    setLoading(true);
    const [ordersResponse, statusResponse] = await Promise.all([
      axios.get('/api/sales-orders'),
      axios.get('/api/sales-orders/status')
    ]);
    const apiOrders: ApiSalesOrder[] = ordersResponse.data;
    const statusData: { data: ApiStatus[] } = statusResponse.data;
    const sortedApiOrders = apiOrders.sort((a, b) => {
      const dateA = new Date(a.order_date).getTime();
      const dateB = new Date(b.order_date).getTime();
      return dateB - dateA; 
    });
    
    const transformedOrders: { [key: string]: OrderDetail } = {};
    sortedApiOrders.forEach(apiOrder => {
      const order = transformApiOrderToOrder(apiOrder);
      transformedOrders[order.id] = order;
    });
    
    setAllOrders(transformedOrders);
    const filteredStatuses = statusData.data.filter(status => 
      ALLOWED_STATUSES.includes(status.status_name)
    );
    setAvailableStatuses(filteredStatuses);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    toast.error('ไม่สามารถดึงข้อมูลได้');
  } finally {
    setLoading(false);
  }
};

  // Update order status via API
  const handleUpdateStatus = async (orderId: string, newStatus: string, statusId: number) => {
    try {
      await axios.put(`/api/sales-orders/${orderId}`, {
        status_id: statusId
      });

      // Update local state
      setAllOrders(prevAllOrders => ({
        ...prevAllOrders,
        [orderId]: {
          ...prevAllOrders[orderId],
          status: newStatus,
        }
      }));

      toast.success('อัปเดตสถานะออเดอร์สำเร็จ');
    } catch (error) {
      console.error('Failed to update order status:', error);
      
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message;
        
        if (statusCode === 400) {
          // ข้อความที่เข้าใจง่ายสำหรับ business logic error
          toast.error('ไม่สามารถเปลี่ยนสถานะได้ เนื่องจากออเดอร์อยู่ในสถานะสุดท้ายแล้ว');
        } else {
          toast.error(`เกิดข้อผิดพลาด: ${errorMessage}`);
        }
      } else {
        toast.error('ไม่สามารถอัปเดตสถานะออเดอร์ได้');
      }
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // --- Calculations ---
    const orders = useMemo(() => {
    const orderList = Object.values(allOrders).map(({ items, ...order }) => order);
    return orderList.sort((a, b) => {
      const dateA = new Date(a.orderDate).getTime();
      const dateB = new Date(b.orderDate).getTime();
      return dateB - dateA; 
    });
  }, [allOrders]);

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

  // Loading state
  if (loading) {
    return (
      <main className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </main>
    );
  }

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
                <input type="text" placeholder="ค้นหาเลขที่, ชื่อลูกค้า, ผู้รับผิดชอบ..." className="input input-bordered w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                    <th className="p-4">ผู้รับผิดชอบ</th>
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
                      <td className="p-4 font-mono text-sm">{o.orderNumber}</td>
                      <td className="p-4">{o.customerName}</td>
                      <td className="p-4">{o.creatorName}</td>
                      <td className="p-4">{formatDateDisplay(o.orderDate)}</td>
                      <td className="p-4 text-right">{o.itemCount.toLocaleString()} ชิ้น</td>
                      <td className="p-4 text-right">{fPrice(o.totalAmount)}</td>
                      <td className="p-4 text-center">
                        <span className={`badge w-28 justify-center ${getStatusBadgeClass(o.status)}`}>
                            {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {FINAL_STATUSES.includes(o.status) ? (
                          <div className="tooltip" data-tip="ออเดอร์อยู่ในสถานะสุดท้าย ไม่สามารถเปลี่ยนแปลงได้">
                            <span className="text-gray-400 cursor-help text-xs">
                              🔒 สิ้นสุด
                            </span>
                          </div>
                        ) : (
                          <div className="dropdown dropdown-left">
                            <label tabIndex={0} className="btn btn-ghost btn-xs m-1"><FaEllipsisV /></label>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-40">
                              {availableStatuses.map(status => (
                                  <li key={status.id}>
                                      <a onClick={() => openConfirmationModal(o.id, status.status_name, status.id)} className={o.status === status.status_name ? 'font-bold' : ''}>
                                          {status.status_name}
                                      </a>
                                  </li>
                              ))}
                            </ul>
                          </div>
                        )}
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div>
                                <p><span className="font-semibold">ชื่อลูกค้า:</span> {viewingOrder.customerName}</p>
                                <p><span className="font-semibold">วันที่สั่ง:</span> {formatDateDisplay(viewingOrder.orderDate)}</p>
                            </div>
                            <div>
                                <p><span className="font-semibold">ผู้รับผิดชอบ:</span> {viewingOrder.creatorName}</p>
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

        {/* Modal สำหรับยืนยันการเปลี่ยนสถานะ */}
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
    </main>
  );
}