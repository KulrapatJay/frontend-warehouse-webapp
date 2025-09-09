// เพิ่ม 'use client' ไว้ด้านบนสุดของไฟล์ เป็น best practice สำหรับ component ที่อาจมี interaction
'use client';

import Link from 'next/link';
import React, { use, useState, useEffect } from 'react';

// --- (ส่วนของข้อมูลจำลอง และ Types) ---
type Product = {
  id: number;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
};

type WarehouseData = {
  name: string;
  stats: {
    totalInbound: number;
    totalOutbound: number;
  };
  products: Product[];
};

const allWarehouseData: { [key: string]: WarehouseData } = {
  '1': {
    name: 'Warehouse 1',
    stats: { totalInbound: 850, totalOutbound: 620 },
    products: [
      { id: 1, sku: 'BK-CRO-01', name: 'ครัวซองต์เนยสด', category: 'Pastry', quantity: 150, status: 'In Stock' },
      { id: 2, sku: 'BK-WWB-01', name: 'ขนมปังโฮลวีท', category: 'Bread', quantity: 75, status: 'In Stock' },
      { id: 3, sku: 'BK-DAN-01', name: 'เดนิชผลไม้รวม', category: 'Pastry', quantity: 9, status: 'Low Stock' },
    ],
  },
  '2': {
    name: 'Warehouse 2',
    stats: { totalInbound: 210, totalOutbound: 185 },
    products: [
      { id: 4, sku: 'CK-CHF-01', name: 'เค้กช็อกโกแลตฟัดจ์', category: 'Cake', quantity: 12, status: 'In Stock' },
      { id: 5, sku: 'PI-APL-01', name: 'พายแอปเปิ้ล', category: 'Pie', quantity: 5, status: 'Low Stock' },
      { id: 6, sku: 'CK-BCC-01', name: 'บลูเบอร์รีชีสเค้ก', category: 'Cake', quantity: 20, status: 'In Stock' },
      { id: 7, sku: 'CK-CAR-01', name: 'เค้กแครอท', category: 'Cake', quantity: 0, status: 'Out of Stock' },
    ],
  },
  '3': {
    name: 'Warehouse 3',
    stats: { totalInbound: 5500, totalOutbound: 4800 },
    products: [
      { id: 8, sku: 'RM-BFL-01', name: 'แป้งขนมปัง (ถุง 1kg)', category: 'Flour', quantity: 350, status: 'In Stock' },
      { id: 9, sku: 'RM-YST-01', name: 'ยีสต์ (ซอง)', category: 'Ingredient', quantity: 1500, status: 'In Stock' },
      { id: 10, sku: 'RM-CCH-01', name: 'ครีมชีส (kg)', category: 'Dairy', quantity: 45, status: 'In Stock' },
      { id: 11, sku: 'RM-BLB-01', name: 'บลูเบอร์รีแช่แข็ง (kg)', category: 'Fruit', quantity: 15, status: 'Low Stock' },
    ],
  },
};

const getStatusBadgeClass = (status: Product['status']) => {
  switch (status) {
    case 'In Stock':
      return 'badge-success';
    case 'Low Stock':
      return 'badge-warning';
    case 'Out of Stock':
      return 'badge-error';
    default:
      return 'badge-ghost';
  }
};

type WarehousePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function WarehousePage({ params }: WarehousePageProps) {
  const { id } = use(params);
  const data = allWarehouseData[id];

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (data?.products) {
      const results = data.products.filter(product => {
        const term = searchTerm.toLowerCase();
        return (
          product.name.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term)
        );
      });
      setFilteredProducts(results);
    }
  }, [searchTerm, data?.products]);


  if (!data) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">ไม่พบข้อมูลคลังสินค้า</h1>
        <p className="text-lg mb-8">ขออภัย, เราไม่พบข้อมูลสำหรับคลังสินค้า ID: {id}</p>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="stats bg-base-100 shadow">
            <div className="stat">
              <div className="stat-title">สินค้าเข้ารวม</div>
              <div className="stat-value text-success">{data.stats.totalInbound.toLocaleString()}</div>
              <div className="stat-desc">ชิ้น</div>
            </div>
          </div>
          <div className="stats bg-base-100 shadow">
            <div className="stat">
              <div className="stat-title">สินค้าออกรวม</div>
              <div className="stat-value text-error">{data.stats.totalOutbound.toLocaleString()}</div>
              <div className="stat-desc">ชิ้น</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">
                รายการสินค้าทั้งหมด {filteredProducts.length} รายการ
              </h2>
              <input 
                type="text" 
                placeholder="ค้นหาด้วยชื่อ หรือ ประเภท..." 
                className="input input-bordered w-full max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200 text-sm font-semibold uppercase">
                  <tr>
                    {/* ลบคอลัมน์ checkbox ออกจากหัวตาราง */}
                    <th className="p-4">รหัสสินค้า (SKU)</th>
                    <th className="p-4">ชื่อสินค้า</th>
                    <th className="p-4">ประเภท</th>
                    <th className="p-4 text-right">จำนวน (ชิ้น)</th>
                    <th className="p-4 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover border-b">
                      <td className="p-4 font-mono">{product.sku}</td>
                      <td className="p-4">{product.name}</td>
                      <td className="p-4">{product.category}</td>
                      <td className="p-4 text-right">{product.quantity.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`badge ${getStatusBadgeClass(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}