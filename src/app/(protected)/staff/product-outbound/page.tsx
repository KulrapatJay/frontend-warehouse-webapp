'use client';

import React, { useState, useMemo } from 'react';
import { FaBarcode, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { Customers } from '@/mock/customers';

// --- Type Definitions ---
type Product = {
  id: number;
  productCode: string;
  skuCode: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  status: 'มีสินค้า' | 'สินค้าใกล้หมด' | 'สินค้าหมด';
  responsible: string;
  lastUpdated: string;
};

type WarehouseData = {
  name: string;
  products: Product[];
};

type ScannedItem = {
  id: number;
  name: string;
  skuCode: string;
  price: number;
  unit: string;
  quantity: number;
  maxQuantity: number;
};


// --- Data ---
const warehouseDataSource: Record<string, WarehouseData> = {
  '1': { name: 'Warehouse 1', products: [
    { id: 1, productCode: 'BK-CRO', skuCode: 'BK-CRO-01', name: 'ครัวซองต์เนยสด', category: 'Pastry', quantity: 150, price: 75, unit: 'ชิ้น', status: 'มีสินค้า', responsible: 'สมชาย', lastUpdated: '2025-09-01' },
    { id: 2, productCode: 'BK-WWB', skuCode: 'BK-WWB-01', name: 'ขนมปังโฮลวีท', category: 'Bread', quantity: 75, price: 55, unit: 'ชิ้น', status: 'มีสินค้า', responsible: 'สมศรี', lastUpdated: '2025-09-02' },
  ]},
  '2': { name: 'Warehouse 2', products: [
    { id: 4, productCode: 'CK-CHF', skuCode: 'CK-CHF-01', name: 'เค้กช็อกโกแลตฟัดจ์', category: 'Cake', quantity: 12, price: 120, unit: 'ชิ้น', status: 'มีสินค้า', responsible: 'วิชัย', lastUpdated: '2025-09-01' },
    { id: 6, productCode: 'CK-BCC', skuCode: 'CK-BCC-01', name: 'บลูเบอร์รีชีสเค้ก', category: 'Cake', quantity: 20, price: 95, unit: 'ชิ้น', status: 'มีสินค้า', responsible: 'สมศรี', lastUpdated: '2025-09-04' },
    { id: 7, productCode: 'CK-CAR', skuCode: 'CK-CAR-01', name: 'เค้กแครอท', category: 'Cake', quantity: 0, price: 90, unit: 'ชิ้น', status: 'สินค้าหมด', responsible: 'สมศรี', lastUpdated: '2025-08-20' },
  ]},
  '3': { name: 'Warehouse 3', products: [
    { id: 8, productCode: 'RM-BFL', skuCode: 'RM-BFL-01', name: 'แป้งขนมปัง (ถุง 1kg)', category: 'Flour', quantity: 350, price: 150, unit: 'ถุง', status: 'มีสินค้า', responsible: 'ประวิทย์', lastUpdated: '2025-09-05' },
    { id: 10, productCode: 'RM-CCH', skuCode: 'RM-CCH-01', name: 'ครีมชีส (kg)', category: 'Dairy', quantity: 15, price: 350, unit: 'kg', status: 'สินค้าใกล้หมด', responsible: 'มานี', lastUpdated: '2025-09-03' },
  ]},
};

export default function ProductOutboundPage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [scannedItems, setScannedItems] = useState<Map<number, ScannedItem>>(new Map());
  const [skuInput, setSkuInput] = useState('');
  const [isScanningMode, setIsScanningMode] = useState(false);

  const { totalItems, totalPrice } = useMemo(() => {
    let items = 0;
    let price = 0;
    scannedItems.forEach(item => {
      items += item.quantity;
      price += item.quantity * item.price;
    });
    return { totalItems: items, totalPrice: price };
  }, [scannedItems]);

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWarehouse(e.target.value);
    setSelectedCustomer('');
    setScannedItems(new Map());
    setIsScanningMode(false);
  };

  const updateItemQuantity = (productId: number, newQuantity: number) => {
    const product = warehouseDataSource[selectedWarehouse]?.products.find(p => p.id === productId);
    if (!product) return;
    
    const newItems = new Map(scannedItems);
    
    if (newQuantity > 0 && newQuantity <= product.quantity) {
      newItems.set(productId, {
        id: product.id,
        name: product.name,
        skuCode: product.skuCode,
        price: product.price,
        unit: product.unit,
        quantity: newQuantity,
        maxQuantity: product.quantity,
      });
    } else if (newQuantity === 0) {
      newItems.delete(productId);
    }
    setScannedItems(newItems);
  };

  const handleSkuScan = (sku: string) => {
    if (!selectedWarehouse || !sku.trim()) return;
    const product = warehouseDataSource[selectedWarehouse]?.products.find(p => p.skuCode.toLowerCase() === sku.trim().toLowerCase());

    if (!product) {
      alert(`ไม่พบสินค้าที่มี SKU Code: ${sku}`);
      setSkuInput('');
      return;
    }
    if (product.quantity === 0) {
      alert(`สินค้า "${product.name}" หมดสต็อก ไม่สามารถเบิกได้`);
      setSkuInput('');
      return;
    }
    const existingItem = scannedItems.get(product.id);
    const currentQty = existingItem?.quantity || 0;
    if (currentQty < product.quantity) {
      updateItemQuantity(product.id, currentQty + 1);
    } else {
      alert(`ไม่สามารถเพิ่ม "${product.name}" ได้อีก เนื่องจากมีในคลังเพียง ${product.quantity} ชิ้น`);
    }
    setSkuInput('');
  };
  
  // ✅ ฟังก์ชันใหม่: สำหรับจัดการปุ่มสแกนเริ่มต้น
  const handleInitialScanClick = () => {
    // เปิดโหมดสแกนเพื่อให้แถบค้นหาแสดง
    setIsScanningMode(true);

    // เพิ่มสินค้าแบบสุ่ม 1 ชิ้น
    if (!selectedWarehouse) return;
    const availableProducts = warehouseDataSource[selectedWarehouse]?.products.filter(p => p.quantity > 0);
    if (!availableProducts || availableProducts.length === 0) {
      alert('ไม่มีสินค้าที่พร้อมเบิกในคลังนี้');
      return;
    }
    const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    const existingItem = scannedItems.get(randomProduct.id);
    const currentQty = existingItem?.quantity || 0;
    if (currentQty < randomProduct.quantity) {
      updateItemQuantity(randomProduct.id, currentQty + 1);
    }
  };

  const handleReset = () => {
    setSelectedWarehouse('');
    setSelectedCustomer('');
    setScannedItems(new Map());
    setSkuInput('');
    setIsScanningMode(false);
  }

  // --- ส่วนแสดงผล (Render) ---
  const renderContent = () => {
    // State 1: ยังไม่ได้เลือกคลัง
    if (!selectedWarehouse) {
      return (
        <div className="text-center py-16 flex flex-col items-center">
          <h2 className="text-xl text-base-content text-opacity-60">กรุณาเลือกคลังสินค้าเพื่อเริ่มต้น</h2>
        </div>
      );
    }

    // State 2: มีรายการสินค้าแล้ว ให้แสดงตารางเสมอ
    if (scannedItems.size > 0) {
      return (
        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ชื่อสินค้า</th>
                <th className="text-right">ราคา</th>
                <th className="text-center">จำนวน</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(scannedItems.values()).map(item => (
                <tr key={item.id}>
                  <td>
                    <span className='font-mono bg-base-200 px-2 py-1 rounded-md mr-3'>{item.skuCode}</span>
                    {item.name}
                  </td>
                  <td className="text-right">{item.price.toLocaleString()}</td>
                  <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                          <button className="btn btn-xs btn-outline" onClick={() => updateItemQuantity(item.id, item.quantity - 1)}><FaMinus/></button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <button className="btn btn-xs btn-outline" onClick={() => updateItemQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.maxQuantity}><FaPlus/></button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // State 3: ยังไม่มีสินค้า แต่เข้าโหมดสแกนแล้ว
    if (isScanningMode) {
      return (
        <div className="text-center py-16">
            <p className="text-gray-500">กรุณาใช้ช่องสแกนด้านบนเพื่อเพิ่มสินค้า</p>
        </div>
      );
    }

    // State 4: สถานะเริ่มต้น (ยังไม่มีสินค้า และยังไม่เข้าโหมดสแกน)
    return (
      <div className="text-center py-16">
        <button onClick={handleInitialScanClick} className="btn btn-primary btn-lg">
          <FaBarcode className="h-6 w-6 mr-2" />
          คลิกเพื่อสแกน Barcode
        </button>
      </div>
    );
  };

  return (
    <main>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {/* --- ส่วนหัว --- */}
          <div className="flex justify-between items-end mb-6 min-h-[48px]">
            <div className="flex items-center gap-4">
                <select 
                  className="select select-bordered w-full max-w-xs"
                  value={selectedWarehouse}
                  onChange={handleWarehouseChange}
                >
                  <option disabled value="">เลือกคลังสินค้า</option>
                  {Object.entries(warehouseDataSource).map(([id, data]) => (
                    <option key={id} value={id}>{data.name}</option>
                  ))}
                </select>

                {selectedWarehouse && (
                  <select 
                    className="select select-bordered w-full max-w-xs"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                  >
                    <option disabled value="">เลือกผู้รับสินค้า</option>
                    {Customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name}
                      </option>
                    ))}
                  </select>
                )}
            </div>
            {scannedItems.size > 0 && (
              <div className="text-left sm:text-right">
                <span className="text-md text-gray-500">
                  จำนวนสินค้าทั้งหมด: <span className="font-bold text-info">{totalItems.toLocaleString()}</span> ชิ้น
                </span>
                <span className="block sm:inline sm:ml-4 text-lg">
                  ราคารวมทั้งหมด: <span className="font-bold text-success">{totalPrice.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                </span>
              </div>
            )}
          </div>
          
          {/* แถบเครื่องมือสแกนจะแสดงเมื่อเข้าสู่ "โหมดสแกน" หรือเมื่อมีของแล้ว */}
          {selectedWarehouse && (isScanningMode || scannedItems.size > 0) && (
            <div className="flex items-center gap-2 my-4 p-4 bg-base-200 rounded-lg">
                <input
                    type="text"
                    placeholder="สแกนหรือพิมพ์ SKU Code..."
                    className="input input-bordered w-full max-w-xs"
                    value={skuInput}
                    onChange={(e) => setSkuInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSkuScan(skuInput); }}
                    autoFocus
                />
                <button
                    className="btn btn-primary"
                    onClick={() => handleSkuScan(skuInput)}
                    disabled={!skuInput.trim()}
                >
                    <FaBarcode className="mr-2" />
                    เพิ่มสินค้า
                </button>
            </div>
           )}

          {/* --- ส่วนเนื้อหา --- */}
          <div className="border-2 border-base-300 rounded-lg min-h-[300px] flex flex-col justify-start p-4">
            {renderContent()}
          </div>

          <div className="card-actions justify-end mt-6">
            <label htmlFor="cancel-modal" className="btn btn-ghost">ยกเลิก</label>
            <label 
              htmlFor="confirm-modal" 
              className={`btn btn-primary ${scannedItems.size === 0 || !selectedCustomer ? 'btn-disabled' : ''}`}
            >
              บันทึก
            </label>
          </div>
        </div>
      </div>

      {/* Modals */}
      <input type="checkbox" id="confirm-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">ยืนยันการเบิกสินค้า</h3>
          <p className="py-4">คุณต้องการยืนยันการเบิกสินค้าจำนวน {totalItems} ชิ้น รวมเป็นเงิน {totalPrice.toLocaleString()} บาท หรือไม่?</p>
          <div className="modal-action">
            <label htmlFor="confirm-modal" className="btn btn-ghost">ยกเลิก</label>
            <label htmlFor="confirm-modal" className="btn btn-success text-white" onClick={handleReset}>ยืนยัน</label>
          </div>
        </div>
      </div>
      
      <input type="checkbox" id="cancel-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">ยืนยันการยกเลิก</h3>
          <p className="py-4">ข้อมูลที่สแกนไว้จะถูกลบทั้งหมด คุณต้องการยกเลิกหรือไม่?</p>
          <div className="modal-action">
            <label htmlFor="cancel-modal" className="btn btn-ghost">ยกเลิก</label>
            <label htmlFor="cancel-modal" className="btn btn-error text-white" onClick={handleReset}>ใช่</label>
          </div>
        </div>
      </div>
    </main>
  );
}