"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// --- Types (กำหนดขึ้นมาเอง ไม่ต้องใช้ Zod) ---
export type ProductForm = {
  code: string;
  name: string;
  category: string;
  price: number;
  qty: number;
  unit: string;
  date: string;
  barcode?: string;
  imageFile?: File;
};
export type Product = Omit<ProductForm, "imageFile"> & { id: string };

// --- Demo Data ---
const DEMO: Record<string, Product> = {
  p01: {
    id: "p01",
    code: "abc1111",
    name: "เค้กช็อกโกแลต",
    category: "Bakery",
    price: 100,
    qty: 300,
    unit: "ชิ้น",
    date: "2025-01-15",
    barcode: "8851234567890",
  },
  p02: {
    id: "p02",
    code: "abc2222",
    name: "ขนมปังกระเทียม",
    category: "Bakery",
    price: 150,
    qty: 200,
    unit: "ชิ้น",
    date: "2025-02-05",
    barcode: "8852345678901",
  },
  p03: {
    id: "p03",
    code: "abc3333",
    name: "ครัวซองต์",
    category: "Pastry",
    price: 150,
    qty: 251,
    unit: "ชิ้น",
    date: "2025-02-17",
    barcode: "8853456789012",
  },
};


async function fetchProductById(id: string): Promise<Product | null> {
  await new Promise((r) => setTimeout(r, 150));
  return DEMO[id] ?? null;
}

async function updateProduct(id: string, payload: ProductForm) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (k === "imageFile") {
      if (v instanceof File) fd.append("image", v);
    } else if (v !== undefined && v !== null) {
      fd.append(k, String(v));
    }
  });
  console.log("SUBMIT", id, [...fd.entries()]);
  await new Promise((r) => setTimeout(r, 200));
  return { ok: true } as const;
}

export default function EditProductClient({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<ProductForm>({
    defaultValues: {
      code: "",
      name: "",
      category: "",
      price: 0,
      qty: 0,
      unit: "ชิ้น",
      date: new Date().toISOString().slice(0, 10),
      barcode: "",
      imageFile: undefined,
    },
    mode: "onTouched",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const p = await fetchProductById(id);
      if (!p) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      form.reset({ ...p, imageFile: undefined });
      setLoading(false);
    })();
  }, [id, form]);

  async function onSubmit(values: ProductForm) {
    const res = await updateProduct(id, values);
    if (res.ok) alert("บันทึกสำเร็จ");
  }

  return (
    <div className="bg-base-100 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">แก้ไขสินค้า</h1>
          <p className="text-sm opacity-70">ID: {id}</p>
        </div>
        {/* --- ย้ายปุ่มออกจาก Header --- */}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-56 bg-base-300 rounded" />
          <div className="h-40 bg-base-300 rounded" />
        </div>
      ) : notFound ? (
        <p className="text-error">ไม่พบสินค้า id: {id}</p>
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6" 
          >
            {/* Left: image */}
            <div className="md:col-span-1">
              <div className="flex flex-col items-start gap-3">
                <label className="label-text font-medium mb-1">รูปภาพสินค้า</label>
                <div className="avatar">
                  <div className="mask mask-squircle w-40 h-40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview || "/placeholder.png"} alt="preview" />
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full max-w-xs"
                  {...form.register("imageFile", {
                    validate: {
                      lessThan2MB: (files) =>
                        (files && files.size ? files.size : 0) <=
                          2 * 1024 * 1024 || "ไฟล์ต้องไม่เกิน 2MB",
                      acceptedFormats: (files) =>
                        !files ||
                        !files.type ||
                        ["image/jpeg", "image/png", "image/webp"].includes(
                          files.type
                        ) ||
                        "รองรับเฉพาะ JPG/PNG/WebP",
                    },
                  })}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    form.setValue("imageFile", f, { shouldValidate: true });
                    if (f) {
                      URL.revokeObjectURL(preview || "");
                      setPreview(URL.createObjectURL(f));
                    } else {
                      setPreview(null);
                    }
                  }}
                />
                <span className="text-error text-sm h-5">
                  {form.formState.errors.imageFile?.message}
                </span>
              </div>
            </div>

            {/* Right: fields */}
            <div className="md:col-span-2 space-y-6">
              {/* --- Section: ข้อมูลหลัก --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
                 <h3 className="md:col-span-2 text-lg font-semibold mb-2">ข้อมูลหลัก</h3>
                 <label className="form-control">
                  <div className="label">
                    <span className="label-text">ชื่อสินค้า</span>
                  </div>
                  <input
                    className="input input-bordered"
                    {...form.register("name", { required: "กรุณากรอกชื่อสินค้า" })}
                  />
                  <span className="text-error text-sm h-5">
                    {form.formState.errors.name?.message}
                  </span>
                </label>
                <label className="form-control">
                  <div className="label">
                    <span className="label-text">รหัส (Code)</span>
                  </div>
                  <input
                    className="input input-bordered"
                    {...form.register("code", { required: "กรุณากรอกรหัสสินค้า" })}
                  />
                  <span className="text-error text-sm h-5">
                    {form.formState.errors.code?.message}
                  </span>
                </label>
                {/* --- แก้ไข: ลบ md:col-span-2 ออกจาก ประเภท --- */}
                <label className="form-control">
                  <div className="label">
                    <span className="label-text">ประเภท</span>
                  </div>
                  <select
                    className="select select-bordered"
                    {...form.register("category", { required: "กรุณาเลือกประเภท" })}
                  >
                    {["Bakery", "Pastry", "Beverage", "Snack"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="text-error text-sm h-5">
                    {form.formState.errors.category?.message}
                  </span>
                </label>
              </div>
              
              {/* --- Section: สต็อกและราคา --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
                  <h3 className="md:col-span-3 text-lg font-semibold mb-2">สต็อกและราคา</h3>
                   <label className="form-control">
                      <div className="label">
                          <span className="label-text">ราคา</span>
                      </div>
                      <input
                          type="number"
                          step="0.01"
                          className="input input-bordered"
                          {...form.register("price", {
                          required: "กรุณากรอกราคา",
                          valueAsNumber: true,
                          min: { value: 0, message: "ราคาต้องไม่ติดลบ" },
                          })}
                      />
                      <span className="text-error text-sm h-5">
                          {form.formState.errors.price?.message}
                      </span>
                  </label>
                  <label className="form-control">
                      <div className="label">
                          <span className="label-text">จำนวน</span>
                      </div>
                      <input
                          type="number"
                          className="input input-bordered"
                          {...form.register("qty", {
                          required: "กรุณากรอกจำนวน",
                          valueAsNumber: true,
                          min: { value: 0, message: "จำนวนต้องไม่ติดลบ" },
                          validate: (value) =>
                              Number.isInteger(value) || "จำนวนต้องเป็นจำนวนเต็ม",
                          })}
                      />
                      <span className="text-error text-sm h-5">
                          {form.formState.errors.qty?.message}
                      </span>
                  </label>
                  <label className="form-control">
                      <div className="label">
                          <span className="label-text">หน่วยนับ</span>
                      </div>
                      <select
                          className="select select-bordered"
                          {...form.register("unit", { required: "กรุณาเลือกหน่วย" })}
                      >
                          {["ชิ้น", "กล่อง", "lot", "ชุด"].map((u) => (
                          <option key={u} value={u}>
                              {u}
                          </option>
                          ))}
                      </select>
                       <span className="text-error text-sm h-5">
                          {form.formState.errors.unit?.message}
                      </span>
                  </label>
              </div>
              
              {/* --- Section: ข้อมูลอื่นๆ --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <h3 className="md:col-span-2 text-lg font-semibold mb-2">ข้อมูลอื่นๆ</h3>
                  <label className="form-control">
                      <div className="label">
                          <span className="label-text">Barcode</span>
                      </div>
                      <input
                          className="input input-bordered"
                          {...form.register("barcode")}
                      />
                  </label>
                  <label className="form-control">
                      <div className="label">
                          <span className="label-text">วันที่</span>
                      </div>
                      <input
                          type="date"
                          className="input input-bordered"
                          {...form.register("date", { required: "กรุณาเลือกวันที่" })}
                      />
                       <span className="text-error text-sm h-5">
                          {form.formState.errors.date?.message}
                      </span>
                  </label>
              </div>
            </div>
          </div>
          
          {/* --- เพิ่ม: ส่วนของปุ่มด้านล่าง --- */}
          <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => history.back()}
            >
              ยกเลิก
            </button>
            <button
              className="btn btn-primary text-white"
              type="submit" 
            >
              บันทึก
            </button>
          </div>
        </form>
      )}
    </div>
  );
}