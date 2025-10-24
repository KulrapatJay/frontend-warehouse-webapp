"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { FaPlus } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

// ========== Updated Type Definitions ==========
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

type ApiResponse = {
  success: boolean;
  data: Product[];
  message?: string;
};

// --- Helper Functions ---
const getStatusBadgeClass = (quantity: number, expiryDate: string) => {
  // เช็คจำนวนสินค้าก่อน
  if (quantity === 0) return "badge-error"; // สินค้าหมด

  // เช็ควันหมดอายุ
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // ถ้าหมดอายุแล้วหรือใกล้หมดอายุ (< 3 วัน)
  if (daysUntilExpiry <= 0) return "badge-error"; // หมดอายุแล้ว
  if (daysUntilExpiry < 3) return "badge-warning"; // ใกล้หมดอายุ (น้อยกว่า 3 วัน)
  
  return "badge-success"; // สินค้ายังไม่หมดอายุ (มากกว่า 3 วัน)
};

const getStatus = (quantity: number, expiryDate: string) => {
  if (quantity === 0) return "สินค้าหมด";

  // เช็ควันหมดอายุ
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // ถ้าหมดอายุแล้วหรือใกล้หมดอายุ
  if (daysUntilExpiry <= 0) return "สินค้าหมดอายุ";
  if (daysUntilExpiry < 3) return "ใกล้หมดอายุ"; // น้อยกว่า 3 วัน
  
  return "สินค้าปกติ"; // มากกว่าหรือเท่ากับ 3 วัน
};

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH");
};

const formatCreatorName = (creator: Product["creator"]) => {
  return `${creator.prefix.name}${creator.first_name} ${creator.last_name}`;
};

// ========== Filter Function ==========
export function filterProducts(
  list: Product[],
  searchTerm: string,
  category: string,
  warehouse: string
): Product[] {
  const term = searchTerm.trim().toLowerCase();
  return list.filter((product) => {
    const matchSearch =
      product.product.product_name.toLowerCase().includes(term) ||
      product.product.sku.toLowerCase().includes(term) ||
      formatDateDisplay(product.production_date).includes(term) ||
      formatDateDisplay(product.expiry_date).includes(term);

    const matchCategory =
      category === "all" || product.product.category.category_name === category;
    const matchWarehouse =
      warehouse === "all" || product.warehouse.name === warehouse;

    return matchSearch && matchCategory && matchWarehouse;
  });
}

export default function StaffAllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [warehouses, setWarehouses] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const { theme } = useTheme();

  // --- Pagination State ---
  const [page, setPage] = useState(1);
  const pageSizeOptions = [5, 10, 15, 20];
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [productsResponse, categoriesResponse, warehousesResponse] = await Promise.all([
        axios.get('/api/products-warehouse'),
        axios.get('/api/products/categories'),
        axios.get('/api/products/warehouses'),
      ]);

      // Set products data
      const rawProducts = (productsResponse.data ?? []) as Product[];
      setProducts(rawProducts);

      // Set categories from dedicated API
      const categoriesData = categoriesResponse.data || [];
      const categoryNames = categoriesData.map((cat: { category_name?: string; name?: string }) => cat.category_name || cat.name);
      setCategories(['all', ...categoryNames]);

      // Set warehouses from dedicated API
      const warehousesData = warehousesResponse.data || [];
      const warehouseNames = warehousesData.map((warehouse: { name: string }) => warehouse.name);
      setWarehouses(['all', ...warehouseNames]);

      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      
      // Fallback: If APIs fail, extract from products data
      try {
        const productsResponse = await axios.get('/api/products-warehouse');
        const rawProducts = (productsResponse.data ?? []) as Product[];
        setProducts(rawProducts);

        // Fallback: Extract unique categories from products
        const uniqueCategories: string[] = Array.from(
          new Set(rawProducts.map((p) => p.product.category.category_name))
        );
        setCategories(['all', ...uniqueCategories]);

        // Fallback: Extract unique warehouses from products
        const uniqueWarehouses: string[] = Array.from(
          new Set(rawProducts.map((p) => p.warehouse.name))
        );
        setWarehouses(['all', ...uniqueWarehouses]);

        setError(null);
        toast('ใช้ข้อมูลจากสินค้าแทนการดึงจาก API แยก');
      } catch (fallbackErr) {
        setError(
          fallbackErr instanceof Error ? fallbackErr.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        );
        toast.error('ไม่สามารถดึงข้อมูลสินค้าได้');
      }
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  // --- Calculations ---
  const totalProducts = products.reduce((sum, p) => sum + p.quantity, 0);
  const dailyInbound = products
    .filter((p) => {
      const today = new Date();
      const createdAt = new Date(p.created_at);
      return createdAt.toDateString() === today.toDateString();
    })
    .reduce((sum, p) => sum + p.quantity, 0);

  const totalOutbound = 0; // This would need to come from a different API endpoint

  const filteredProducts = useMemo(
    () =>
      filterProducts(products, searchTerm, selectedCategory, selectedWarehouse),
    [products, searchTerm, selectedCategory, selectedWarehouse]
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
  const formattedDate = new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(today);

  if (loading) {
    return (
      <main>
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div className="alert alert-error">
          <span>เกิดข้อผิดพลาด: {error}</span>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div>
        {/* KPI Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stats bg-base-100 shadow">
            <div className="stat">
              <div className="stat-title">สินค้าเข้า</div>
              <div className="stat-value text-info">
                {dailyInbound.toLocaleString()}
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
              <div className="stat-value text-success">
                {totalProducts.toLocaleString()}
              </div>
              <div className="stat-desc flex justify-between">
                <span>ชิ้น</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          <div className="stats bg-base-100 shadow">
            <div className="stat">
              <div className="stat-title">สินค้าออก</div>
              <div className="stat-value text-error">
                {totalOutbound.toLocaleString()}
              </div>
              <div className="stat-desc flex justify-between">
                <span>ชิ้น</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
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
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  className="input input-bordered w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="select select-bordered"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "หมวดหมู่ทั้งหมด" : c}
                    </option>
                  ))}
                </select>
                <select
                  className="select select-bordered"
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                >
                  {warehouses.map((w) => (
                    <option key={w} value={w}>
                      {w === "all" ? "คลังทั้งหมด" : w}
                    </option>
                  ))}
                </select>

                <Link
                  href="/staff/warehouse_management"
                  className={`btn rounded-md text-white transition whitespace-nowrap ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-black hover:bg-gray-800"
                  }`}
                >
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
                    <th className="p-4">รหัสสินค้า (SKU)</th>
                    <th className="p-4">ชื่อสินค้า</th>
                    <th className="p-4">หมวดหมู่</th>
                    <th className="p-4 text-right">จำนวน</th>
                    <th className="p-4">หน่วย</th>
                    <th className="p-4">คลังสินค้า</th>
                    <th className="p-4 text-center">สถานะ</th>
                    <th className="p-4">วันที่ผลิต</th>
                    <th className="p-4">วันหมดอายุ</th>
                    <th className="p-4">ผู้รับผิดชอบ</th>
                    <th className="p-4">อัปเดตล่าสุด</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((p) => (
                    <tr key={p.id} className="hover border-b">
                      <td className="p-4 font-mono">{p.product.sku}</td>
                      <td className="p-4">{p.product.product_name}</td>
                      <td className="p-4">
                        {p.product.category.category_name}
                      </td>
                      <td className="p-4 text-right">
                        {p.quantity.toLocaleString()}
                      </td>
                      <td className="p-4">{p.product.unit.unit_name}</td>
                      <td className="p-4">{p.warehouse.name}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`badge w-28 justify-center ${getStatusBadgeClass(
                            p.quantity,
                            p.expiry_date
                          )}`}
                        >
                          {getStatus(p.quantity, p.expiry_date)}
                        </span>
                      </td>
                      <td className="p-4">
                        {formatDateDisplay(p.production_date)}
                      </td>
                      <td className="p-4 text-error font-medium">
                        {formatDateDisplay(p.expiry_date)}
                      </td>
                      <td className="p-4">{formatCreatorName(p.creator)}</td>
                      <td className="p-4">{formatDateDisplay(p.updated_at)}</td>
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
                  กำลังแสดง{" "}
                  <span className="font-semibold">{startIdx + 1}</span>–
                  <span className="font-semibold">
                    {Math.min(endIdx, filteredProducts.length)}
                  </span>{" "}
                  จาก{" "}
                  <span className="font-semibold">
                    {filteredProducts.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={page <= 1}
                    onClick={() => goto(page - 1)}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        className={`btn btn-sm ${
                          page === p ? "btn-neutral" : "btn-ghost"
                        }`}
                        onClick={() => goto(p)}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={page >= totalPages}
                    onClick={() => goto(page + 1)}
                  >
                    &gt;
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap opacity-70">
                    จำนวนแถวต่อหน้า
                  </span>
                  <select
                    className="select select-bordered select-sm"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
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
