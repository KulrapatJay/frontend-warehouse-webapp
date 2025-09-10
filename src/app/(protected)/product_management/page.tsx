"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CiBarcode } from "react-icons/ci";
import { FaPlus, FaRegEye } from "react-icons/fa";
import { MdOutlineModeEditOutline, MdOutlineDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";

export type Product = {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  qty: number;
  unit: "ชิ้น" | "กล่อง" | "lot" | "ชุด" | string;
  date: string;
  imageUrl?: string | null;
  barcode?: string;
};

const DEMO_DATA: Product[] = [
  {
    id: "p01",
    code: "abc1111",
    name: "เค้กช็อกโกแลต",
    category: "Bakery",
    price: 100,
    qty: 300,
    unit: "ชิ้น",
    date: "2025-01-15",
    imageUrl: "https://picsum.photos/seed/cake/64/64",
    barcode: "8851234567890",
  },
  {
    id: "p02",
    code: "abc2222",
    name: "ขนมปังกระเทียม",
    category: "Bakery",
    price: 150,
    qty: 200,
    unit: "ชิ้น",
    date: "2025-02-05",
    imageUrl: "https://picsum.photos/seed/garlic/64/64",
    barcode: "8852345678901",
  },
  {
    id: "p03",
    code: "abc3333",
    name: "ครัวซองต์",
    category: "Pastry",
    price: 150,
    qty: 251,
    unit: "ชิ้น",
    date: "2025-02-17",
    imageUrl: "https://picsum.photos/seed/croissant/64/64",
    barcode: "8853456789012",
  },
];

// Utility: THB formatting
const fPrice = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(
    n
  );

// Pure filter for testing
export function filterProducts(
  list: Product[],
  search: string,
  category: string
): Product[] {
  const s = search.trim().toLowerCase();
  return list.filter((p) => {
    const matchText =
      p.name.toLowerCase().includes(s) ||
      p.code.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s);
    const matchCat = category === "all" || p.category === category;
    return matchText && matchCat;
  });
}

export default function ProductManagement() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const { theme } = useTheme();

  // Derived lists
  const filteredList = useMemo(
    () => filterProducts(DEMO_DATA, search, category),
    [search, category]
  );

  // pagination calculation (match user_management style)
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  useEffect(() => {
    setPage(1);
  }, [search, pageSize, category]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paged = filteredList.slice(startIdx, endIdx);

  // Modals
  const [viewing, setViewing] = useState<Product | null>(null);
  const [removing, setRemoving] = useState<Product | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>(["all"]);
    DEMO_DATA.forEach((d) => set.add(d.category));
    return Array.from(set);
  }, []);

  const goto = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="space-y-4">
      {/* Card wrapper (layout mirrored from user_management) */}
      <div className="bg-base-100 rounded-lg shadow-md p-6">
        {/* Header row: left count, right controls */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm opacity-70">
            All products{" "}
            <span className="font-semibold opacity-100">
              {filteredList.length}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by name...."
              className="input input-bordered w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="select select-bordered"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All categories" : c}
                </option>
              ))}
            </select>
            <Link href="/product_management/add_product">
              <button
                className={`btn btn-primary rounded-md text-white transition ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-black hover:bg-gray-800"
                }`}
              >
                <FaPlus />
                Add New Product
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
              {paged.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-base-200 border-t border-base-300"
                >
                  <td className="p-3">
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
                        <CiBarcode className="mr-1 text-xl" /> Barcode
                      </button>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() =>
                          router.push(
                            `/product_management/edit_product/${p.id}`
                          )
                        }
                      >
                        <MdOutlineModeEditOutline className="mr-1" /> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => setRemoving(p)}
                      >
                        <MdOutlineDelete className="mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center opacity-70">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer (pagination + rows-per-page) */}
        <div className="mt-6 flex items-center justify-between gap-4 text-sm">
          <div className="opacity-70">
            Showing{" "}
            <span className="font-semibold">
              {filteredList.length ? startIdx + 1 : 0}
            </span>
            –
            <span className="font-semibold">
              {Math.min(endIdx, filteredList.length)}
            </span>
            &nbsp;of&nbsp;
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
            <label className="opacity-70">Rows per page</label>
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
              className="btn btn-error"
              onClick={() => {
                if (!removing) return;
                console.log("DELETE", removing.id);
                setRemoving(null);
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
