// เพิ่ม 'use client' ไว้ด้านบนสุดของไฟล์ เป็น best practice สำหรับ component ที่อาจมี interaction
'use client';

import React, { useState, useEffect } from 'react';

// ========== START: ส่วนที่แก้ไข (1. แก้ไข Type) ==========
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
  productionDate: string; // << เพิ่ม: วันที่ผลิต
  expirationDate: string; // << เพิ่ม: วันหมดอายุ
};
// ========== END: ส่วนที่แก้ไข (1. แก้ไข Type) ==========


type WarehouseData = {
  name: string;
  stats: {
    totalInbound: number;
    totalOutbound: number;
    dailyInbound: number;
  };
  products: Product[];
};

// ========== START: ส่วนที่แก้ไข (2. อัปเดตข้อมูลตัวอย่าง) ==========
const allWarehouseData: { [key: string]: WarehouseData } = {
  '1': {
    name: 'Warehouse 1',
    stats: { totalInbound: 850, totalOutbound: 620, dailyInbound: 55 },
    products: [
      { id: 1, productCode: 'BK-CRO', skuCode: 'BK-CRO-01', name: 'ครัวซองต์เนยสด', category: 'Pastry', quantity: 150, unit: 'ชิ้น', status: 'มีสินค้า', responsible: 'สมชาย', lastUpdated: '2568-09-01', productionDate: '2568-08-30', expirationDate: '2568-09-05' },
      { id: 2, productCode: 'BK-WWB', skuCode: 'BK-WWB-01', name: 'ขนมปังโฮลวีท', category: 'Bread', quantity: 75, unit: 'ชิ้น', status: 'มีสินค้า', responsible: 'สมศรี', lastUpdated: '2568-09-02', productionDate: '2568-09-01', expirationDate: '2568-09-08' },
      { id: 3, productCode: 'BK-DAN', skuCode: 'BK-DAN-01', name: 'เดนิชผลไม้รวม', category: 'Pastry', quantity: 9, unit: 'ชิ้น', status: 'สินค้าใกล้หมด', responsible: 'สมชาย', lastUpdated: '2568-09-03', productionDate: '2568-09-02', expirationDate: '2568-09-06' },
    ],
  },
  '2': {
    name: 'Warehouse 2',
    stats: { totalInbound: 210, totalOutbound: 185, dailyInbound: 15 },
    products: [
      { id: 4, productCode: 'CK-CHF', skuCode: 'CK-CHF-01', name: 'เค้กช็อกโกแลตฟัดจ์', category: 'Cake', quantity: 12, unit: 'ชิ้น', status: 'มีสินค้า', responsible: 'วิชัย', lastUpdated: '2568-09-01', productionDate: '2568-08-28', expirationDate: '2568-09-12' },
      { id: 5, productCode: 'PI-APL', skuCode: 'PI-APL-01', name: 'พายแอปเปิ้ล', category: 'Pie', quantity: 5, unit: 'ชิ้น', status: 'สินค้าใกล้หมด', responsible: 'วิชัย', lastUpdated: '2568-08-28', productionDate: '2568-08-25', expirationDate: '2568-09-05' },
      { id: 6, productCode: 'CK-BCC', skuCode: 'CK-BCC-01', name: 'บลูเบอร์รีชีสเค้ก', category: 'Cake', quantity: 20, unit: 'ชิ้น', status: 'มีสินค้า', responsible: 'สมศรี', lastUpdated: '2568-09-04', productionDate: '2568-09-01', expirationDate: '2568-09-15' },
      { id: 7, productCode: 'CK-CAR', skuCode: 'CK-CAR-01', name: 'เค้กแครอท', category: 'Cake', quantity: 0, unit: 'ชิ้น', status: 'สินค้าหมด', responsible: 'สมศรี', lastUpdated: '2568-08-20', productionDate: '2568-08-15', expirationDate: '2568-08-25' },
    ],
  },
  '3': {
    name: 'Warehouse 3',
    stats: { totalInbound: 5500, totalOutbound: 4800, dailyInbound: 320 },
    products: [
      { id: 8, productCode: 'RM-BFL', skuCode: 'RM-BFL-01', name: 'แป้งขนมปัง', category: 'Flour', quantity: 350, unit: 'ถุง', status: 'มีสินค้า', responsible: 'ประวิทย์', lastUpdated: '2568-09-05', productionDate: '2568-06-01', expirationDate: '2569-06-01' },
      { id: 9, productCode: 'RM-YST', skuCode: 'RM-YST-01', name: 'ยีสต์', category: 'Ingredient', quantity: 1500, unit: 'ซอง', status: 'มีสินค้า', responsible: 'ประวิทย์', lastUpdated: '2568-09-05', productionDate: '2568-07-10', expirationDate: '2570-07-10' },
      { id: 10, productCode: 'RM-CCH', skuCode: 'RM-CCH-01', name: 'ครีมชีส', category: 'Dairy', quantity: 45, unit: 'kg', status: 'มีสินค้า', responsible: 'มานี', lastUpdated: '2568-09-03', productionDate: '2568-08-20', expirationDate: '2568-11-20' },
      { id: 11, productCode: 'RM-BLB', skuCode: 'RM-BLB-01', name: 'บลูเบอร์รีแช่แข็ง', category: 'Fruit', quantity: 15, unit: 'kg', status: 'สินค้าใกล้หมด', responsible: 'มานี', lastUpdated: '2568-09-02', productionDate: '2568-03-01', expirationDate: '2569-03-01' },
    ],
  },
};
// ========== END: ส่วนที่แก้ไข (2. อัปเดตข้อมูลตัวอย่าง) ==========


const getStatusBadgeClass = (status: Product['status']) => {
  switch (status) {
    case 'มีสินค้า':
      return 'badge-success';
    case 'สินค้าใกล้หมด':
      return 'badge-warning';
    case 'สินค้าหมด':
      return 'badge-error';
    default:
      return 'badge-ghost';
  }
};

const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${parseInt(year, 10)}`;
};

type WarehousePageProps = {
  params: {
    id: string;
  };
};

export default function WarehousePage({ params }: WarehousePageProps) {
  const { id } = (params);
  const data = allWarehouseData[id];

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(today);

  useEffect(() => {
    if (data?.products) {
      const results = data.products.filter(product => {
        const term = searchTerm.toLowerCase();
        // ========== START: ส่วนที่แก้ไข (3. เพิ่มเงื่อนไขการค้นหา) ==========
        return (
          product.name.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term) ||
          product.responsible.toLowerCase().includes(term) ||
          product.productCode.toLowerCase().includes(term) ||
          product.skuCode.toLowerCase().includes(term) ||
          formatDateDisplay(product.productionDate).includes(term) || // ค้นหาจากวันที่ผลิต
          formatDateDisplay(product.expirationDate).includes(term)    // ค้นหาจากวันหมดอายุ
        );
        // ========== END: ส่วนที่แก้ไข (3. เพิ่มเงื่อนไขการค้นหา) ==========
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
    <main>
      <div>
        {/* --- (ส่วนของ Stats ไม่มีการเปลี่ยนแปลง) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stats bg-base-100 shadow">
            <div className="stat">
              <div className="stat-title">สินค้าเข้าวันนี้</div>
              <div className="stat-value text-info">{data.stats.dailyInbound.toLocaleString()}</div>
              <div className="stat-desc flex justify-between">
                <span>ชิ้น</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          <div className="stats bg-base-100 shadow">
            <div className="stat">
              <div className="stat-title">สินค้าเข้ารวม </div>
              <div className="stat-value text-success">{data.stats.totalInbound.toLocaleString()}</div>
              <div className="stat-desc flex justify-between">
                <span>ชิ้น</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          <div className="stats bg-base-100 shadow">
            <div className="stat">
              <div className="stat-title">สินค้าออกรวม </div>
              <div className="stat-value text-error">{data.stats.totalOutbound.toLocaleString()}</div>
              <div className="stat-desc flex justify-between">
                <span>ชิ้น</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h2 className="card-title">
                รายการสินค้าทั้งหมด ({filteredProducts.length})
              </h2>
              <input
                type="text"
                placeholder="ค้นหาด้วยรหัส, ชื่อ, วันที่..."
                className="input input-bordered w-full max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="table w-full">
                {/* ========== START: ส่วนที่แก้ไข (4. เพิ่มคอลัมน์ในตาราง) ========== */}
                <thead className="bg-base-200 text-sm font-semibold uppercase">
                  <tr>
                    <th className="p-4">รหัสสินค้า</th>
                    <th className="p-4">รหัส SKU</th>
                    <th className="p-4">ชื่อสินค้า</th>
                    <th className="p-4">ประเภท</th>
                    <th className="p-4 text-right">จำนวน</th>
                    <th className="p-4">หน่วยนับ</th>
                    <th className="p-4 text-center">สถานะ</th>
                    <th className="p-4">ผู้รับผิดชอบ</th>
                    <th className="p-4">วันที่ผลิต</th>
                    <th className="p-4">วันหมดอายุ</th>
                    <th className="p-4">อัปเดตล่าสุด</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover border-b">
                      <td className="p-4 font-mono">{product.productCode}</td>
                      <td className="p-4 font-mono">{product.skuCode}</td>
                      <td className="p-4">{product.name}</td>
                      <td className="p-4">{product.category}</td>
                      <td className="p-4 text-right">{product.quantity.toLocaleString()}</td>
                      <td className="p-4">{product.unit}</td>
                      <td className="p-4 text-center">
                        <span className={`badge w-28 justify-center ${getStatusBadgeClass(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="p-4">{product.responsible}</td>
                      <td className="p-4">{formatDateDisplay(product.productionDate)}</td>
                      <td className="p-4 text-error font-medium">{formatDateDisplay(product.expirationDate)}</td>
                      <td className="p-4">{formatDateDisplay(product.lastUpdated)}</td>
                    </tr>
                  ))}
                </tbody>
                {/* ========== END: ส่วนที่แก้ไข (4. เพิ่มคอลัมน์ในตาราง) ========== */}
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}