'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';

// --- Type Definitions ---
type Product = {
  id: number;
  productCode: string;
  skuCode: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: 'มีสินค้า' | 'สินค้าใกล้หมด' | 'สินค้าหมด';
  responsible: string;
  lastUpdated: string;
  warehouse: string;
};
type BaseProduct = Omit<Product, 'warehouse'>;
type WarehouseData = {
  name: string;
  dailyInbound: number;
  totalOutbound: number;
  products: BaseProduct[];
};

// --- Data ---
const allWarehouseData: Record<string, WarehouseData> = {
  '1': { name: 'Warehouse 1', dailyInbound: 55, totalOutbound: 4200, products: [
    { id: 1, productCode: 'BK-CRO', skuCode: 'BK-CRO-01', name: 'ครัวซองต์เนยสด', category: 'Pastry', quantity: 150, unit: 'ชิ้น', status: 'มีสินค้า', responsible: 'สมชาย', lastUpdated: '2568-09-01' },
    { id: 2, productCode: 'BK-WWB', skuCode: 'BK-WWB-01', name: 'ขนมปังโฮลวีท', category: 'Bread', quantity: 75, unit: 'ชิ้น', status: 'มีสินค้า', responsible: 'สมศรี', lastUpdated: '2568-09-02' },
  ]},
  '2': { name: 'Warehouse 2', dailyInbound: 15, totalOutbound: 600, products: [
    { id: 4, productCode: 'CK-CHF', skuCode: 'CK-CHF-01', name: 'เค้กช็อกโกแลตฟัดจ์', category: 'Cake', quantity: 12, unit: 'ชิ้น', status: 'มีสินค้า', responsible: 'วิชัย', lastUpdated: '2568-09-01' },
    { id: 6, productCode: 'CK-BCC', skuCode: 'CK-BCC-01', name: 'บลูเบอร์รีชีสเค้ก', category: 'Cake', quantity: 20, unit: 'ชิ้น', status: 'มีสินค้า', responsible: 'สมศรี', lastUpdated: '2568-09-04' },
    { id: 7, productCode: 'CK-CAR', skuCode: 'CK-CAR-01', name: 'เค้กแครอท', category: 'Cake', quantity: 0, unit: 'ชิ้น', status: 'สินค้าหมด', responsible: 'สมศรี', lastUpdated: '2568-08-20' },
  ]},
  '3': { name: 'Warehouse 3', dailyInbound: 20, totalOutbound: 0, products: [
    { id: 8, productCode: 'RM-BFL', skuCode: 'RM-BFL-01', name: 'แป้งขนมปัง (ถุง 1kg)', category: 'Flour', quantity: 350, unit: 'ถุง', status: 'มีสินค้า', responsible: 'ประวิทย์', lastUpdated: '2568-09-05' },
    { id: 10, productCode: 'RM-CCH', skuCode: 'RM-CCH-01', name: 'ครีมชีส (kg)', category: 'Dairy', quantity: 15, unit: 'kg', status: 'สินค้าใกล้หมด', responsible: 'มานี', lastUpdated: '2568-09-03' },
  ]},
};

const allProducts: Product[] = Object.values(allWarehouseData).flatMap((data) =>
  data.products.map((product) => ({
    ...product,
    warehouse: data.name,
  }))
);

// --- Helper Functions ---
const getStatusBadgeClass = (status: Product['status']) => {
  switch (status) {
    case 'มีสินค้า': return 'badge-success';
    case 'สินค้าใกล้หมด': return 'badge-warning';
    case 'สินค้าหมด': return 'badge-error';
    default: return 'badge-ghost';
  }
};

// ========== START: ส่วนที่แก้ไข (1. เพิ่มฟังก์ชันจัดรูปแบบวันที่) ==========
const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};
// ========== END: ส่วนที่แก้ไข (1. เพิ่มฟังก์ชันจัดรูปแบบวันที่) ==========

export function filterProducts(
  list: Product[],
  searchTerm: string,
  category: string,
  warehouse: string
): Product[] {
  const term = searchTerm.trim().toLowerCase();
  return list.filter((product) => {
    const matchSearch =
      product.name.toLowerCase().includes(term) ||
      product.productCode.toLowerCase().includes(term) ||
      product.skuCode.toLowerCase().includes(term);
    const matchCategory = category === "all" || product.category === category;
    const matchWarehouse = warehouse === "all" || product.warehouse === warehouse;
    return matchSearch && matchCategory && matchWarehouse;
  });
}

export default function StaffAllProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const { theme } = useTheme();

  // --- Pagination State ---
  const [page, setPage] = useState(1);
  const pageSizeOptions = [5, 10, 15, 20];
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);

  // --- Calculations ---
  const dailyInbound = Object.values(allWarehouseData).reduce((sum, wh) => sum + wh.dailyInbound, 0);
  const totalProducts = Object.values(allWarehouseData).reduce((sum, wh) => sum + wh.products.length, 0);
  const totalOutbound = Object.values(allWarehouseData).reduce((sum, wh) => sum + wh.totalOutbound, 0);

  const categories = useMemo(() => {
    const set = new Set<string>(['all']);
    allProducts.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, []);
  const warehouseOptions = ['all', 'Warehouse 1', 'Warehouse 2', 'Warehouse 3'];
  const filteredProducts = useMemo(
    () => filterProducts(allProducts, searchTerm, selectedCategory, selectedWarehouse),
    [searchTerm, selectedCategory, selectedWarehouse]
  );

  // --- Pagination Logic ---
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, selectedWarehouse, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);
  
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedProducts = filteredProducts.slice(startIdx, endIdx);

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
            <div className="stats bg-base-100 shadow"><div className="stat"><div className="stat-title">สินค้าเข้า</div><div className="stat-value text-info">{dailyInbound.toLocaleString()}</div><div className="stat-desc flex justify-between"><span>ชิ้น</span><span>{formattedDate}</span></div></div></div>
            <div className="stats bg-base-100 shadow"><div className="stat"><div className="stat-title">สินค้าทั้งหมด</div><div className="stat-value text-success">{totalProducts.toLocaleString()}</div><div className="stat-desc flex justify-between"><span>ชิ้น</span><span>{formattedDate}</span></div></div></div>
            <div className="stats bg-base-100 shadow"><div className="stat"><div className="stat-title">สินค้าออก</div><div className="stat-value text-error">{totalOutbound.toLocaleString()}</div><div className="stat-desc flex justify-between"><span>ชิ้น</span><span>{formattedDate}</span></div></div></div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Control Header */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm opacity-70">
                สินค้าทั้งหมด{" "}
                <span className="font-semibold opacity-100">
                  {filteredProducts.length}
                </span>
              </span>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="ค้นหา..." className="input input-bordered w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <select className="select select-bordered" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  {categories.map((c) => (<option key={c} value={c}>{c === "all" ? "หมวดหมู่ทั้งหมด" : c}</option>))}
                </select>
                <select className="select select-bordered" value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}>
                   {warehouseOptions.map((w) => (<option key={w} value={w}>{w === "all" ? "คลังทั้งหมด" : w}</option>))}
                </select>
                
                <Link href="/staff/warehouse_management" className={`btn rounded-md text-white transition whitespace-nowrap ${ theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800' }`}>
                    <FaPlus className="h-4 w-4" />
                    เพิ่มรายการ
                </Link>

              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200 text-sm font-semibold uppercase">
                  <tr>
                    <th className="p-4">รหัสสินค้า</th><th className="p-4">ชื่อสินค้า</th><th className="p-4">หมวดหมู่</th><th className="p-4 text-right">จำนวน</th><th className="p-4">หน่วย</th><th className="p-4">คลังสินค้า</th><th className="p-4 text-center">สถานะ</th><th className="p-4">อัปเดตล่าสุด</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((p) => (
                    <tr key={p.id} className="hover border-b">
                      <td className="p-4 font-mono">{p.productCode}</td>
                      <td className="p-4">{p.name}</td>
                      <td className="p-4">{p.category}</td>
                      <td className="p-4 text-right">{p.quantity.toLocaleString()}</td>
                      <td className="p-4">{p.unit}</td>
                      <td className="p-4">{p.warehouse}</td>
                      <td className="p-4 text-center"><span className={`badge w-28 justify-center ${getStatusBadgeClass(p.status)}`}>{p.status}</span></td>
                      {/* ========== START: ส่วนที่แก้ไข (2. เรียกใช้ฟังก์ชัน) ========== */}
                      <td className="p-4">{formatDateDisplay(p.lastUpdated)}</td>
                      {/* ========== END: ส่วนที่แก้ไข (2. เรียกใช้ฟังก์ชัน) ========== */}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <p className="text-center p-8 text-base-content text-opacity-60">
                    ไม่พบข้อมูลสินค้าที่ตรงกับเงื่อนไข
                </p>
              )}
            </div>

            {/* Footer Section */}
            {filteredProducts.length > 0 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="opacity-70">
                    กำลังเเสดง <span className="font-semibold">{startIdx + 1}</span>–<span className="font-semibold">{Math.min(endIdx, filteredProducts.length)}</span> จาก <span className="font-semibold">{filteredProducts.length}</span>
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