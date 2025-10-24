"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

type Product = {
  id: number;
  product: {
    product_name: string;
    sku: string;
    category: {
      category_name: string;
    };
    unit: {
      unit_name: string;
    };
  };
  warehouse: {
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

type WarehouseData = {
  id: number;
  name: string;
  location: string;
  products: Product[];
};

// ========== Helper Functions ==========
const getStatusBadgeClass = (quantity: number, expiryDate: string) => {
  if (quantity === 0) return "badge-error";

  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry <= 0) return "badge-error";
  if (daysUntilExpiry < 3) return "badge-warning";

  return "badge-success";
};

const getStatus = (quantity: number, expiryDate: string) => {
  if (quantity === 0) return "สินค้าหมด";

  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry <= 0) return "สินค้าหมดอายุ";
  if (daysUntilExpiry < 3) return "ใกล้หมดอายุ";

  return "สินค้าปกติ";
};

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatCreatorName = (creator: Product["creator"]) => {
  return `${creator.prefix.name}${creator.first_name} ${creator.last_name}`;
};

type WarehousePageProps = {
  params: {
    id: string;
  };
};

export default function WarehousePage({ params }: WarehousePageProps) {
  const { id } = params;

  // ========== States ==========
  const [warehouseData, setWarehouseData] = useState<WarehouseData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // ========== Fetch Data from API ==========
  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        setLoading(true);

        // Fetch products in this warehouse first
        const productsResponse = await axios.get(
          `/api/products-warehouse?warehouse_id=${id}`
        );
        const products = productsResponse.data || [];

        if (products.length > 0) {
          // ใช้ข้อมูล warehouse จาก product แรก
          const warehouseInfo = products[0].warehouse;

          setWarehouseData({
            id: parseInt(id),
            name: warehouseInfo.name,
            location: warehouseInfo.location || "",
            products: products,
          });
        } else {
          // ถ้าไม่มีสินค้าในคลัง ลองดึงข้อมูล warehouse
          try {
            const warehouseResponse = await axios.get(
              `/api/products/warehouses/${id}`
            );
            const warehouse = warehouseResponse.data;

            setWarehouseData({
              id: warehouse.id,
              name: warehouse.name,
              location: warehouse.location || "",
              products: [],
            });
          } catch (warehouseError) {
            setWarehouseData({
              id: parseInt(id),
              name: `คลังสินค้า ${id}`,
              location: "",
              products: [],
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch warehouse data:", error);
        toast.error("ไม่สามารถดึงข้อมูลคลังสินค้าได้");
        setWarehouseData(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWarehouseData();
    }
  }, [id]);

  // ========== Filter Products ==========
  useEffect(() => {
    if (warehouseData?.products) {
      const results = warehouseData.products.filter((product) => {
        const term = searchTerm.toLowerCase();
        return (
          product.product.product_name.toLowerCase().includes(term) ||
          product.product.sku.toLowerCase().includes(term) ||
          product.product.category.category_name.toLowerCase().includes(term) ||
          product.product.unit.unit_name.toLowerCase().includes(term) ||
          formatCreatorName(product.creator).toLowerCase().includes(term) ||
          formatDateDisplay(product.production_date).includes(term) ||
          formatDateDisplay(product.expiry_date).includes(term)
        );
      });
      setFilteredProducts(results);
    }
  }, [searchTerm, warehouseData?.products]);

  // ========== Calculate Stats ==========
  const calculateStats = () => {
    if (!warehouseData?.products)
      return {
        totalProducts: 0,
        totalQuantity: 0,
        incomingToday: 0,
        outgoingTotal: 0,
      };

    const products = warehouseData.products;
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD format

    // รวมจำนวนสินค้าทั้งหมดในคลัง
    const totalQuantity = products.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    // จำนวนรายการสินค้า
    const totalProducts = products.length;

    // สินค้าเข้าคลังวันนี้ (นับจำนวนสินค้าที่ created_at เป็นวันนี้)
    const incomingToday = products
      .filter((p) => {
        const createdDate = new Date(p.created_at).toISOString().split("T")[0];
        return createdDate === todayString;
      })
      .reduce((sum, product) => sum + product.quantity, 0);

    const outgoingTotal = 0; // TODO: เพิ่มการคำนวณสินค้าออกจาก API

    return { totalProducts, totalQuantity, incomingToday, outgoingTotal };
  };

  const stats = calculateStats();
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(today);

  // ========== Loading State ==========
  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4">กำลังโหลดข้อมูลคลังสินค้า...</p>
      </main>
    );
  }

  // ========== Error State ==========
  if (!warehouseData) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">ไม่พบข้อมูลคลังสินค้า</h1>
        <p className="text-lg mb-8">
          ขออภัย, เราไม่พบข้อมูลสำหรับคลังสินค้า ID: {id}
        </p>
        <button
          className="btn btn-primary"
          onClick={() => window.history.back()}
        >
          กลับไปหน้าก่อนหน้า
        </button>
      </main>
    );
  }

  return (
    <main>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{warehouseData.name}</h1>
          {warehouseData.location && (
            <p className="text-base-content/70">
              ที่ตั้ง: {warehouseData.location}
            </p>
          )}
        </div>

        {/* Stats - แสดงข้อมูลการเข้า-ออกสินค้า */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stats bg-base-100 shadow">
            <div className="stat">
              <div className="stat-title">สินค้าเข้าวันนี้</div>
              <div className="stat-value text-success">
                {stats.incomingToday}
              </div>
              <div className="stat-desc flex justify-between">
                <span>ชิ้น</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          <div className="stats bg-base-100 shadow">
            <div className="stat">
              <div className="stat-title">สินค้าทั้งหมด</div>
              <div className="stat-value text-info">{stats.totalQuantity}</div>
              <div className="stat-desc flex justify-between">
                <span>ชิ้น</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          <div className="stats bg-base-100 shadow">
            <div className="stat">
              <div className="stat-title">สินค้าออกรวม</div>
              <div className="stat-value text-error">{stats.outgoingTotal}</div>
              <div className="stat-desc flex justify-between">
                <span>ชิ้น</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h2 className="card-title">
                รายการสินค้าทั้งหมด ({stats.totalProducts}) - จำนวนรวม{" "}
                {stats.totalQuantity.toLocaleString()} ชิ้น
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
                <thead className="bg-base-200 text-sm font-semibold uppercase">
                  <tr>
                    <th className="p-4">รหัสสินค้า (SKU)</th>
                    <th className="p-4">ชื่อสินค้า</th>
                    <th className="p-4">หมวดหมู่</th>
                    <th className="p-4 text-right">จำนวน</th>
                    <th className="p-4">หน่วย</th>
                    <th className="p-4 text-center">สถานะ</th>
                    <th className="p-4">ผู้รับผิดชอบ</th>
                    <th className="p-4">วันที่ผลิต</th>
                    <th className="p-4">วันหมดอายุ</th>
                    <th className="p-4">อัปเดตล่าสุด</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover border-b">
                        <td className="p-4 font-mono">{product.product.sku}</td>
                        <td className="p-4">{product.product.product_name}</td>
                        <td className="p-4">
                          {product.product.category.category_name}
                        </td>
                        <td className="p-4 text-right">
                          {product.quantity.toLocaleString()}
                        </td>
                        <td className="p-4">
                          {product.product.unit.unit_name}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`badge w-32 justify-center ${getStatusBadgeClass(
                              product.quantity,
                              product.expiry_date
                            )}`}
                          >
                            {getStatus(product.quantity, product.expiry_date)}
                          </span>
                        </td>
                        <td className="p-4">
                          {formatCreatorName(product.creator)}
                        </td>
                        <td className="p-4">
                          {formatDateDisplay(product.production_date)}
                        </td>
                        <td className="p-4 text-error font-medium">
                          {formatDateDisplay(product.expiry_date)}
                        </td>
                        <td className="p-4">
                          {formatDateDisplay(product.updated_at)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="text-center p-8">
                        <div className="flex flex-col items-center gap-4">
                          <span className="text-base-content/50">
                            {searchTerm
                              ? "ไม่พบผลการค้นหา"
                              : "ไม่มีสินค้าในคลังนี้"}
                          </span>
                          {searchTerm && (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setSearchTerm("")}
                            >
                              ล้างการค้นหา
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
