"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CiBarcode } from "react-icons/ci";
import { FaPlus, FaRegEye } from "react-icons/fa";
import { MdOutlineModeEditOutline, MdOutlineDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import toast from "react-hot-toast";
import Link from "next/link";

// 1. Type ใหม่ให้ตรงกับข้อมูลที่ได้จาก API (มี Object ซ้อน)
export type ApiProduct = {
  id: number;
  product_name: string;
  sku: string;
  price: string; // API อาจส่งตัวเลขมาเป็น string
  quantity: number;
  category: {
    category_name: string;
  };
  unit: {
    unit_name: string;
  };
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

// 2. Type 'Product' สำหรับแสดงผลใน Component (View Model)
export type Product = {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  qty: number;
  unit: string;
  date: string;
  imageUrl?: string | null;
  barcode?: string;
};

// Type สำหรับ Category และ Unit
export type Category = {
  id: number;
  category_name: string;
};

export type Unit = {
  id: number;
  unit_name: string;
};

// --- Utility & Filter Functions ---
const fPrice = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(
    n
  );

export function filterProducts(
  list: Product[],
  search: string,
  category: string
): Product[] {
  const s = search.trim().toLowerCase();
  return list.filter((p) => {
    const matchText =
      p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s);
    const matchCat = category === "all" || p.category === category;
    return matchText && matchCat;
  });
}

// --- Component ---
export default function ProductManagement() {
  const router = useRouter();

  // States for data
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for filtering and pagination
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const { theme } = useTheme();

  // Fetch all initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [productsResponse, unitsResponse, categoriesResponse] =
          await Promise.all([
            fetch("/api/products"),
            fetch("/api/products/units"),
            fetch("/api/products/categories"),
          ]);

        if (!productsResponse.ok) throw new Error("Failed to fetch products");
        if (!unitsResponse.ok) throw new Error("Failed to fetch units");
        if (!categoriesResponse.ok)
          throw new Error("Failed to fetch categories");

        // กำหนด Type ให้ข้อมูลดิบที่รับมาเป็น ApiProduct[]
        const productsData: ApiProduct[] = await productsResponse.json();
        const unitsData: Unit[] = await unitsResponse.json();
        const categoriesData: Category[] = await categoriesResponse.json();

        // แปลงข้อมูลจาก ApiProduct -> Product เพื่อให้ Component นำไปใช้แสดงผล
        const transformedProducts: Product[] = productsData.map((p) => {
          // สร้าง URL รูปภาพที่ถูกต้องสำหรับ Supabase Storage
          let imageUrl = null;
          if (p.image_url) {
            // ตรวจสอบว่าเป็น full URL อยู่แล้วหรือไม่
            if (p.image_url.startsWith("http")) {
              imageUrl = p.image_url;
            } else {
              // ถ้าเป็น path เฉพาะ ให้สร้าง URL ของ Supabase Storage
              const cleanPath = p.image_url.replace(/^\//, "");
              imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${cleanPath}`;
            }
          }

          return {
            id: String(p.id),
            code: p.sku,
            name: p.product_name,
            category: p.category.category_name,
            price: Number(p.price),
            unit: p.unit.unit_name,
            date: p.created_at,
            imageUrl,
            qty: p.quantity,
            barcode: p.sku,
          };
        });

        setProducts(transformedProducts);
        setUnits(unitsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Derived lists for display
  const filteredList = useMemo(
    () => filterProducts(products, search, categoryFilter),
    [products, search, categoryFilter]
  );

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  useEffect(() => {
    setPage(1);
  }, [search, pageSize, categoryFilter]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paged = filteredList.slice(startIdx, endIdx);

  // Modals state
  const [viewing, setViewing] = useState<Product | null>(null);
  const [removing, setRemoving] = useState<Product | null>(null);

  const goto = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="space-y-4">
      <div className="bg-base-100 rounded-lg shadow-md p-6">
        {/* Header row: left count, right controls */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm opacity-70">
            สินค้าทั้งหมด{" "}
            <span className="font-semibold opacity-100">
              {filteredList.length}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหาจากชื่อ...."
              className="input input-bordered w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="select select-bordered"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">หมวดหมู่ทั้งหมด</option>
              {categories.map((c) => (
                <option key={c.id} value={c.category_name}>
                  {c.category_name}
                </option>
              ))}
            </select>
            <Link href="/product_management/add_product">
              <button
                className={`btn btn-primary rounded-md text-white transition whitespace-nowrap ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-black hover:bg-gray-800"
                }`}
              >
                <FaPlus /> เพิ่มสินค้าใหม่
              </button>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table w-full text-sm rounded-lg overflow-hidden bg-base-100">
            <thead className="bg-base-200">
              <tr className="font-semibold">
                <th className="p-3">รูปภาพ</th>
                <th className="p-3">รหัส</th>
                <th className="p-3">ชื่อสินค้า</th>
                <th className="p-3">ประเภท</th>
                <th className="p-3 text-right">ราคา</th>
                <th className="p-3 text-right">จำนวน</th>
                <th className="p-3 text-right">หน่วยนับ</th>
                <th className="p-3">วันที่</th>
                <th className="p-3">จัดการสินค้า</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center">
                    <span className="loading loading-spinner"></span>
                    <p>กำลังโหลดข้อมูลสินค้า...</p>
                  </td>
                </tr>
              ) : paged.length > 0 ? (
                paged.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-base-200 border-t border-base-300"
                  >
                    <td className="p-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img
                            src={p.imageUrl || "/placeholder.png"}
                            alt={p.name}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono">{p.code}</td>
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">{p.category}</td>
                    <td className="p-3 text-right">{fPrice(p.price)}</td>
                    <td className="p-3 text-right">
                      {p.qty.toLocaleString("th-TH")}
                    </td>
                    <td className="p-3 text-right">{p.unit}</td>
                    <td className="p-3">
                      {new Date(p.date).toLocaleDateString("th-TH")}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-sm"
                          onClick={() => setViewing(p)}
                        >
                          <FaRegEye className="mr-1" /> รายละเอียด
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => alert(p.barcode || "ไม่มีบาร์โค้ด")}
                        >
                          <CiBarcode className="mr-1 text-xl" /> บาร์โค้ด
                        </button>
                        <button
                          className="btn btn-sm btn-success text-white"
                          onClick={() =>
                            router.push(
                              `/product_management/edit_product/${p.id}`
                            )
                          }
                        >
                          <MdOutlineModeEditOutline className="mr-1" /> เเก้ไข
                        </button>
                        <button
                          className="btn btn-sm btn-error text-white"
                          onClick={() => setRemoving(p)}
                        >
                          <MdOutlineDelete className="mr-1" /> ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-6 text-center opacity-70">
                    ไม่พบสินค้า
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer (pagination + rows-per-page) */}
        <div className="mt-6 flex items-center justify-between gap-4 text-sm">
          <div className="opacity-70">
            กำลังเเสดง{" "}
            <span className="font-semibold">
              {filteredList.length ? startIdx + 1 : 0}
            </span>
            –
            <span className="font-semibold">
              {Math.min(endIdx, filteredList.length)}
            </span>
            &nbsp;จาก&nbsp;
            <span className="font-semibold">{filteredList.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => goto(page - 1)}
              disabled={page === 1}
            >
              {"<"}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`btn btn-sm ${
                  n === page ? "btn-neutral" : "btn-ghost"
                }`}
                onClick={() => goto(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => goto(page + 1)}
              disabled={page === totalPages}
            >
              {">"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="opacity-70 whitespace-nowrap">
              จำนวนแถวต่อหน้า
            </label>
            <select
              className="select select-bordered select-sm"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <dialog className="modal" open={!!viewing}>
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg">รายละเอียดสินค้า</h3>
          {viewing && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="avatar">
                  <div className="mask mask-squircle h-24 w-24">
                    <img
                      src={viewing.imageUrl || "/placeholder.png"}
                      alt={viewing.name}
                    />
                  </div>
                </div>
                <p>
                  <span className="font-semibold">รหัส:</span> {viewing.code}
                </p>
                <p>
                  <span className="font-semibold">ชื่อสินค้า:</span>{" "}
                  {viewing.name}
                </p>
                <p>
                  <span className="font-semibold">ประเภท:</span>{" "}
                  {viewing.category}
                </p>
              </div>
              <div className="space-y-3">
                <p>
                  <span className="font-semibold">ราคา:</span>{" "}
                  {fPrice(viewing.price)}
                </p>
                <p>
                  <span className="font-semibold">จำนวน:</span> {viewing.qty}{" "}
                  {viewing.unit}
                </p>
                <p>
                  <span className="font-semibold">วันที่:</span>{" "}
                  {new Date(viewing.date).toLocaleDateString("th-TH")}
                </p>
                <p>
                  <span className="font-semibold">Barcode:</span>{" "}
                  {viewing.barcode || "-"}
                </p>
              </div>
            </div>
          )}
          <div className="modal-action">
            <form method="dialog">
              <button className="btn" onClick={() => setViewing(null)}>
                ปิด
              </button>
            </form>
          </div>
        </div>
        <form
          method="dialog"
          className="modal-backdrop"
          onClick={() => setViewing(null)}
        >
          <button>close</button>
        </form>
      </dialog>

      {/* Delete confirm */}
      <dialog className="modal" open={!!removing}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">ลบสินค้า</h3>
          <p className="py-4">
            คุณต้องการลบ <span className="font-semibold">{removing?.name}</span>{" "}
            ใช่หรือไม่?
          </p>
          <div className="modal-action">
            <button className="btn" onClick={() => setRemoving(null)}>
              ยกเลิก
            </button>
            <button
              className="btn btn-error text-white"
              onClick={async () => {
                if (!removing) return;
                const toastId = toast.loading("กำลังลบสินค้า...");

                try {
                  const res = await fetch(`/api/products/${removing.id}`, {
                    method: "DELETE",
                  });

                  if (!res.ok) {
                    const msg =
                      res.status === 404
                        ? "ไม่พบสินค้าในระบบ"
                        : "ลบสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
                    throw new Error(msg);
                  }

                  // อัปเดตรายการสินค้าในหน้า (กรองออก)
                  setProducts((prev) =>
                    prev.filter((p) => p.id !== removing.id)
                  );

                  toast.success("ลบสินค้าเรียบร้อย!", { id: toastId });
                } catch (err) {
                  console.error(err);
                  const msg =
                    err instanceof Error
                      ? err.message
                      : "เกิดข้อผิดพลาดในการลบสินค้า";
                  toast.error(msg, { id: toastId });
                } finally {
                  setRemoving(null);
                }
              }}
            >
              ยืนยันลบ
            </button>
          </div>
        </div>
        <form
          method="dialog"
          className="modal-backdrop"
          onClick={() => setRemoving(null)}
        >
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
