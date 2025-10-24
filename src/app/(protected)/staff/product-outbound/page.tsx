'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { FaBarcode, FaPlus, FaMinus } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

// --- Type Definitions ---
type Product = {
  id: number;
  product: {
    product_name: string;
    sku: string;
    price: string | number; // รองรับทั้ง string และ number
    category: {
      category_name: string;
    };
    unit: {
      unit_name: string;
    };
  };
  warehouse: {
    id: number;
    name: string;
    location: string;
  };
  creator: {
    id: number;
    first_name: string;
    last_name: string;
    prefix: {
      name: string;
    };
  };
  quantity: number;
  production_date: string;
  expiry_date: string;
  created_at: string;
  updated_at: string;
};

type Customer = {
  id: number;
  customer_code: string;
  name: string;
  address: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

type Warehouse = {
  id: number;
  name: string;
  location: string;
};

type ScannedItem = {
  id: number;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  maxQuantity: number;
  price: number; // เก็บเป็น number
};

export default function ProductOutboundPage() {
  // --- States ---
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [scannedItems, setScannedItems] = useState<Map<number, ScannedItem>>(new Map());
  const [skuInput, setSkuInput] = useState('');
  const [isScanningMode, setIsScanningMode] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // คำนวณยอดรวมและจำนวนรวม
  const { totalItems, totalPrice } = useMemo(() => {
    let items = 0;
    let price = 0;
    scannedItems.forEach(item => {
      items += item.quantity;
      price += item.quantity * (item.price || 0); // เพิ่มการตรวจสอบ
    });
    return { totalItems: items, totalPrice: price };
  }, [scannedItems]);

  // --- Fetch initial data ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        const [warehousesRes, customersRes] = await Promise.all([
          axios.get('/api/products/warehouses'),
          axios.get('/api/customers')
        ]);

        setWarehouses(warehousesRes.data || []);
        setCustomers(customersRes.data || []);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        toast.error('ไม่สามารถดึงข้อมูลเริ่มต้นได้');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // --- Fetch products when warehouse changes ---
  useEffect(() => {
    const fetchWarehouseProducts = async () => {
      if (!selectedWarehouse) {
        setProducts([]);
        return;
      }

      try {
        const response = await axios.get(`/api/products-warehouse?warehouse_id=${selectedWarehouse}`);
        console.log('Products response:', response.data); // Debug log
        setProducts(response.data || []);
      } catch (error) {
        console.error('Failed to fetch warehouse products:', error);
        toast.error('ไม่สามารถดึงข้อมูลสินค้าได้');
        setProducts([]);
      }
    };

    fetchWarehouseProducts();
  }, [selectedWarehouse]);

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWarehouse(e.target.value);
    setSelectedCustomer('');
    setScannedItems(new Map());
    setIsScanningMode(false);
    setNotes('');
  };

  const updateItemQuantity = (productId: number, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newItems = new Map(scannedItems);
    
    if (newQuantity > 0 && newQuantity <= product.quantity) {
      // แปลง price เป็น number และจัดการกรณีที่เป็น string หรือ undefined
      const price = typeof product.product.price === 'string' 
        ? parseFloat(product.product.price) 
        : (product.product.price || 0);

      newItems.set(productId, {
        id: product.id,
        name: product.product.product_name,
        sku: product.product.sku,
        unit: product.product.unit.unit_name,
        quantity: newQuantity,
        maxQuantity: product.quantity,
        price: price, // ใช้ราคาที่แปลงแล้ว
      });

      console.log('Product price:', product.product.price, 'Converted price:', price); // Debug log
    } else if (newQuantity === 0) {
      newItems.delete(productId);
    }
    setScannedItems(newItems);
  };

  const handleSkuScan = (sku: string) => {
    if (!selectedWarehouse || !sku.trim()) return;
    
    const product = products.find(p => 
      p.product.sku.toLowerCase() === sku.trim().toLowerCase()
    );

    if (!product) {
      toast.error(`ไม่พบสินค้าที่มี SKU Code: ${sku}`);
      setSkuInput('');
      return;
    }

    if (product.quantity === 0) {
      toast.error(`สินค้า "${product.product.product_name}" หมดสต็อก ไม่สามารถเบิกได้`);
      setSkuInput('');
      return;
    }

    const existingItem = scannedItems.get(product.id);
    const currentQty = existingItem?.quantity || 0;
    
    if (currentQty < product.quantity) {
      updateItemQuantity(product.id, currentQty + 1);
      toast.success(`เพิ่ม ${product.product.product_name} แล้ว`);
    } else {
      toast.error(`ไม่สามารถเพิ่ม "${product.product.product_name}" ได้อีก เนื่องจากมีในคลังเพียง ${product.quantity} ชิ้น`);
    }
    setSkuInput('');
  };
  
  const handleInitialScanClick = () => {
    setIsScanningMode(true);

    if (!selectedWarehouse || products.length === 0) {
      toast.error('ไม่มีสินค้าที่พร้อมเบิกในคลังนี้');
      return;
    }

    const availableProducts = products.filter(p => p.quantity > 0);
    if (availableProducts.length === 0) {
      toast.error('ไม่มีสินค้าที่พร้อมเบิกในคลังนี้');
      return;
    }

    const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    const existingItem = scannedItems.get(randomProduct.id);
    const currentQty = existingItem?.quantity || 0;
    
    if (currentQty < randomProduct.quantity) {
      updateItemQuantity(randomProduct.id, currentQty + 1);
      toast.success(`เพิ่ม ${randomProduct.product.product_name} แล้ว`);
    }
  };

  const handleSubmit = async () => {
    if (!selectedWarehouse || !selectedCustomer || scannedItems.size === 0) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      setIsSubmitting(true);

      // สร้าง payload ตาม API format
      const items = Array.from(scannedItems.values()).map(item => ({
        sku: item.sku,
        quantity: item.quantity
      }));

      const payload = {
        customer_id: parseInt(selectedCustomer),
        warehouse_id: parseInt(selectedWarehouse),
        notes: notes.trim() || '', // ค่าว่างถ้าไม่มี notes
        items: items
      };

      const response = await axios.post('/api/sales-orders', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success('บันทึกการเบิกสินค้าสำเร็จ!');
      handleReset();
      
    } catch (error: unknown) {
      let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: unknown } | undefined;
        const message = data?.message;
        if (typeof message === 'string') {
          errorMessage = message;
        } else if (typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedWarehouse('');
    setSelectedCustomer('');
    setScannedItems(new Map());
    setSkuInput('');
    setIsScanningMode(false);
    setNotes('');
  };

  // --- Loading state ---
  if (loading) {
    return (
      <main className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </main>
    );
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
                <th>SKU</th>
                <th>ชื่อสินค้า</th>
                <th>หน่วย</th>
                <th className="text-center">จำนวน</th>
                <th className="text-right">ราคา/หน่วย</th>
                <th className="text-right">รวม</th>
                <th className="text-center">คงเหลือ</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(scannedItems.values()).map(item => (
                <tr key={item.id}>
                  <td>
                    <span className='font-mono bg-base-200 px-2 py-1 rounded-md'>
                      {item.sku}
                    </span>
                  </td>
                  <td>{item.name}</td>
                  <td>{item.unit}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        className="btn btn-xs btn-outline" 
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                      >
                        <FaMinus/>
                      </button>
                      <span className="font-semibold w-8 text-center">{item.quantity}</span>
                      <button 
                        className="btn btn-xs btn-outline" 
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)} 
                        disabled={item.quantity >= item.maxQuantity}
                      >
                        <FaPlus/>
                      </button>
                    </div>
                  </td>
                  <td className="text-right">฿{(item.price || 0).toLocaleString()}</td>
                  <td className="text-right font-semibold">฿{(item.quantity * (item.price || 0)).toLocaleString()}</td>
                  <td className="text-center">{item.maxQuantity}</td>
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
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>

              {selectedWarehouse && (
                <select 
                  className="select select-bordered w-full max-w-xs"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  <option disabled value="">เลือกผู้รับสินค้า</option>
                  {customers.length === 0 ? (
                    <option disabled>กำลังโหลด...</option>
                  ) : (
                    customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.customer_code} - {customer.name}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
            
            {scannedItems.size > 0 && (
              <div className="text-left sm:text-right">
                <div className="flex flex-col gap-1">
                  <span className="text-lg">
                    จำนวนรวม: <span className="font-bold text-info">{totalItems.toLocaleString()}</span> ชิ้น
                  </span>
                  <span className="text-xl">
                    ยอดรวม: <span className="font-bold text-success">฿{totalPrice.toLocaleString()}</span>
                  </span>
                </div>
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

          {/* หมายเหตุ */}
          {scannedItems.size > 0 && (
            <div className="mb-4">
              <label className="label">
                <span className="label-text">หมายเหตุ (ไม่บังคับ)</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="เพิ่มหมายเหตุสำหรับการเบิกสินค้านี้..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
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

      {/* Confirmation Modal */}
      <input type="checkbox" id="confirm-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">ยืนยันการเบิกสินค้า</h3>
          <div className="py-4">
            <p>คุณต้องการยืนยันการเบิกสินค้าจำนวน {totalItems} ชิ้น</p>
            <p className="font-semibold text-lg mt-2">ยอดรวม: ฿{totalPrice.toLocaleString()}</p>
            {notes.trim() && (
              <div className="mt-2 p-2 bg-base-200 rounded">
                <p className="text-sm"><strong>หมายเหตุ:</strong> {notes}</p>
              </div>
            )}
          </div>
          <div className="modal-action">
            <label htmlFor="confirm-modal" className="btn btn-ghost">ยกเลิก</label>
            <label 
              htmlFor={isSubmitting ? undefined : "confirm-modal"} 
              className={`btn btn-success text-white ${isSubmitting ? 'btn-disabled pointer-events-none' : ''}`} 
              onClick={isSubmitting ? undefined : handleSubmit}
              aria-disabled={isSubmitting}
              role="button"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                'ยืนยัน'
              )}
            </label>
          </div>
        </div>
      </div>
      
      {/* Cancel Modal */}
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