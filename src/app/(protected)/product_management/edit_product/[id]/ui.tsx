"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type Option = { id: number; name: string };

export type ProductForm = {
  code: string; // sku
  name: string; // product_name
  category: number; // category_id
  price: number; // price
  qty: number; // quantity
  unit: number; // unit_id
  imageFile?: FileList;
};

type ProductAPI = {
  id: number;
  product_name: string;
  sku: string;
  category_id: number;
  unit_id: number;
  price: number;
  quantity: number;
  image_url?: string | null;
  created_at?: string;
};

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    console.error("Fetch error:", res.status, text);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export default function EditProductClient({ id }: { id: string }) {
  const router = useRouter();

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [categories, setCategories] = useState<Option[]>([]);
  const [units, setUnits] = useState<Option[]>([]);

  const form = useForm<ProductForm>({
    defaultValues: {
      code: "",
      name: "",
      category: 0,
      price: 0,
      qty: 0,
      unit: 0,
      imageFile: undefined,
    },
    mode: "onTouched",
  });

  // โหลดหมวดหมู่/หน่วย
  useEffect(() => {
    (async () => {
      try {
        const [cats, uns] = await Promise.all([
          fetchJSON<Array<{ id: number; category_name: string }>>(
            "/api/products/categories"
          ),
          fetchJSON<Array<{ id: number; unit_name: string }>>(
            "/api/products/units"
          ),
        ]);
        setCategories(cats.map((c) => ({ id: c.id, name: c.category_name })));
        setUnits(uns.map((u) => ({ id: u.id, name: u.unit_name })));
      } catch (e) {
        console.error(e);
        toast.error("โหลดหมวดหมู่/หน่วยไม่สำเร็จ");
      }
    })();
  }, []);

  const imageFile = form.watch("imageFile");

  // โหลดข้อมูลสินค้าจริง
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchJSON<ProductAPI>(`/api/products/${id}`);

        // เติมค่าเริ่มต้นให้ฟอร์ม (RHF จะคุมค่า select ให้ตรงกับ id ที่ตั้งไว้)
        form.reset({
          code: data.sku,
          name: data.product_name,
          category: data.category_id,
          price: data.price,
          qty: data.quantity,
          unit: data.unit_id,
          imageFile: undefined,
        });

        // พรีวิวรูปจาก backend
        if (data.image_url) {
          const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
          setPreview(`${base}${data.image_url}`);
        } else {
          setPreview(null);
        }

        setLoading(false);
      } catch (e) {
        console.error(e);
        setNotFound(true);
        setLoading(false);
      }
    })();
  }, [id, form]);

  // preview รูปใหม่เมื่อเลือกไฟล์
  useEffect(() => {
    const file = imageFile && imageFile.length > 0 ? imageFile[0] : null;
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function onValidSubmit() {
    setIsModalOpen(true);
  }

  // ส่งอัปเดต (รองรับรูป) → PUT /api/products/:id
  async function handleConfirmSubmit() {
    const toastId = toast.loading("กำลังบันทึกข้อมูล...");
    try {
      const values = form.getValues();

      const fd = new FormData();
      fd.append("product_name", values.name);
      fd.append("sku", values.code);
      fd.append("category_id", String(values.category));
      fd.append("unit_id", String(values.unit));
      fd.append("price", String(values.price));
      fd.append("quantity", String(values.qty));
      if (values.imageFile && values.imageFile.length > 0) {
        fd.append("image", values.imageFile[0]);
      }

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: fd, // อย่าตั้ง Content-Type เอง ให้ browser ใส่ boundary ให้
      });

      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (data as { message: unknown }).message === "string"
            ? (data as { message: string }).message
            : "อัปเดตสินค้าไม่สำเร็จ";

        throw new Error(msg);
      }

      toast.success("บันทึกสำเร็จ!", { id: toastId });
      router.push("/product_management");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึก";
      toast.error(msg, { id: toastId });
    } finally {
      setIsModalOpen(false);
    }
  }

  return (
    <div className="bg-base-100 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="mb-6 pb-4 border-b">
        <h1 className="text-2xl font-bold">แก้ไขสินค้า</h1>
        <p className="text-sm opacity-70">รหัสสินค้า: {id}</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-56 bg-base-300 rounded" />
          <div className="h-40 bg-base-300 rounded" />
        </div>
      ) : notFound ? (
        <p className="text-error">ไม่พบสินค้า id: {id}</p>
      ) : (
        <>
          <form onSubmit={form.handleSubmit(onValidSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              {/* ซ้าย: รูปภาพ */}
              <div className="md:col-span-1">
                <div className="flex flex-col items-start gap-3">
                  <label className="label-text font-medium mb-1">
                    รูปภาพสินค้า
                  </label>
                  <div className="avatar">
                    <div className="mask mask-squircle w-40 h-40 bg-base-200">
                      <img src={preview || "/placeholder.png"} alt="preview" />
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input file-input-bordered w-full max-w-xs"
                    {...form.register("imageFile", {
                      validate: {
                        lessThan5MB: (files) =>
                          !files ||
                          files.length === 0 ||
                          files[0].size <= 5 * 1024 * 1024 ||
                          "ไฟล์ต้องไม่เกิน 5MB",
                        acceptedFormats: (files) =>
                          !files ||
                          files.length === 0 ||
                          ["image/jpeg", "image/png", "image/webp"].includes(
                            files[0].type
                          ) ||
                          "รองรับเฉพาะ JPG/PNG/WebP",
                      },
                    })}
                  />
                  <span className="text-error text-sm h-5">
                    {form.formState.errors.imageFile?.message?.toString()}
                  </span>
                </div>
              </div>

              {/* ขวา: ฟอร์มข้อมูล */}
              <div className="md:col-span-2 space-y-6">
                {/* ข้อมูลหลัก */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
                  <h3 className="md:col-span-2 text-lg font-semibold mb-2">
                    ข้อมูลหลัก
                  </h3>

                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">ชื่อสินค้า</span>
                    </div>
                    <input
                      className="input input-bordered"
                      {...form.register("name", {
                        required: "กรุณากรอกชื่อสินค้า",
                      })}
                    />
                    <span className="text-error text-sm h-5">
                      {form.formState.errors.name?.message}
                    </span>
                  </label>

                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">SKU</span>
                    </div>
                    <input
                      className="input input-bordered"
                      {...form.register("code", { required: "กรุณากรอก SKU" })}
                    />
                    <span className="text-error text-sm h-5">
                      {form.formState.errors.code?.message}
                    </span>
                  </label>

                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">หมวดหมู่</span>
                    </div>
                    <select
                      className="select select-bordered"
                      {...form.register("category", {
                        valueAsNumber: true,
                        required: "กรุณาเลือกหมวดหมู่",
                      })}
                    >
                      <option disabled value={0}>
                        -- เลือกหมวดหมู่ --
                      </option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-error text-sm h-5">
                      {form.formState.errors.category?.message}
                    </span>
                  </label>
                </div>

                {/* สต็อกและราคา */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
                  <h3 className="md:col-span-3 text-lg font-semibold mb-2">
                    สต็อกและราคา
                  </h3>

                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">ราคา</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      className="input input-bordered"
                      {...form.register("price", {
                        valueAsNumber: true,
                        required: "กรุณากรอกราคา",
                        min: { value: 0, message: "ราคา ≥ 0" },
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
                        valueAsNumber: true,
                        required: "กรุณากรอกจำนวน",
                        min: { value: 0, message: "จำนวน ≥ 0" },
                        validate: (v) =>
                          Number.isInteger(v) || "ต้องเป็นจำนวนเต็ม",
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
                      {...form.register("unit", {
                        valueAsNumber: true,
                        required: "กรุณาเลือกหน่วย",
                      })}
                    >
                      <option disabled value={0}>
                        -- เลือกหน่วย --
                      </option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-error text-sm h-5">
                      {form.formState.errors.unit?.message}
                    </span>
                  </label>
                </div>
              </div>
            </div>

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
                disabled={form.formState.isSubmitting}
              >
                บันทึก
              </button>
            </div>
          </form>

          {/* Modal ยืนยัน */}
          <dialog className={`modal ${isModalOpen ? "modal-open" : ""}`}>
            <div className="modal-box">
              <h3 className="font-bold text-lg">ยืนยันการแก้ไข</h3>
              <p className="py-4">
                คุณต้องการบันทึกการเปลี่ยนแปลงนี้ใช่หรือไม่?
              </p>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmSubmit}
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <span className="loading loading-spinner" />
                  )}
                  ยืนยัน
                </button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => setIsModalOpen(false)}>close</button>
            </form>
          </dialog>
        </>
      )}
    </div>
  );
}
