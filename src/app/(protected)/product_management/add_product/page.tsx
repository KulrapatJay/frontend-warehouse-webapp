"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TAddProduct, addProductSchema } from "@/lib/validators";
import { useState, useRef, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"

type Option = { id: number; name: string };
type CategoryDTO = { id: number; category_name: string };
type UnitDTO = { id: number; unit_name: string };

async function fetchOptions<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export default function AddProductPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<TAddProduct | null>(null);
  const [categories, setCategories] = useState<Option[]>([]);
  const [units, setUnits] = useState<Option[]>([]);
  const modalRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TAddProduct>({
    resolver: zodResolver(addProductSchema),
    defaultValues: { price: 0, qty: 0, imageFile: null },
  });

  useEffect(() => {
    (async () => {
      try {
        const [catRes, unitRes] = await Promise.all([
          fetchOptions<CategoryDTO[]>("/api/products/categories"),
          fetchOptions<UnitDTO[]>("/api/products/units"),
        ]);

        setCategories(catRes.map((c) => ({ id: c.id, name: c.category_name })));
        setUnits(unitRes.map((u) => ({ id: u.id, name: u.unit_name })));
      } catch (e) {
        console.error(e);
        toast.error("โหลดหมวดหมู่/หน่วย ไม่สำเร็จ");
      }
    })();
  }, []);

  useEffect(() => {
    if (isModalOpen) modalRef.current?.showModal();
    else modalRef.current?.close();
  }, [isModalOpen]);

  const onValidSubmit = (data: TAddProduct) => {
    setFormData(data);
    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!formData) return;
    const toastId = toast.loading("กำลังบันทึกสินค้า...");

    try {
      const fd = new FormData();
      fd.append("product_name", formData.name);
      fd.append("sku", formData.code);
      fd.append("category_id", String(formData.category));
      fd.append("unit_id", String(formData.unit));
      fd.append("price", String(formData.price));
      fd.append("quantity", String(formData.qty));
      if (formData.imageFile) fd.append("image", formData.imageFile);

      const res = await fetch("/api/products", {
        method: "POST",
        body: fd, // ห้ามใส่ Content-Type เอง
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "สร้างสินค้าไม่สำเร็จ");
      }

      toast.success("เพิ่มสินค้าเรียบร้อย!", { id: toastId });
      setFormData(null);
      setIsModalOpen(false);
      setPreview(null);
      reset();
      router.push("/product_management");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      toast.error(message, { id: toastId });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit(onValidSubmit)}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">เพิ่มสินค้าใหม่</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    ข้อมูลทั่วไป
                  </h3>
                  <div className="form-control">
                    <label className="label block">
                      <span className="label-text mb-2">ชื่อสินค้า</span>
                    </label>
                    <input
                      type="text"
                      {...register("name")}
                      className={`input input-bordered ${
                        errors.name ? "input-error" : ""
                      }`}
                    />
                    {errors.name && (
                      <span className="text-error text-sm mt-1">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label block">
                      <span className="label-text mb-2">รหัสสินค้า (SKU)</span>
                    </label>
                    <input
                      type="text"
                      {...register("code")}
                      className={`input input-bordered w-full md:w-1/2 ${
                        errors.code ? "input-error" : ""
                      }`}
                      placeholder="เช่น 5555 หรือ SKU-001"
                    />
                    {errors.code && (
                      <span className="text-error text-sm mt-1">
                        {errors.code.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    ราคาและสต็อก
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-control">
                      <label className="label mb-1">
                        <span className="label-text">ราคา</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register("price", { valueAsNumber: true })}
                        className={`input input-bordered ${
                          errors.price ? "input-error" : ""
                        }`}
                      />
                      {errors.price && (
                        <span className="text-error text-sm mt-1">
                          {errors.price.message}
                        </span>
                      )}
                    </div>
                    <div className="form-control">
                      <label className="label mb-1">
                        <span className="label-text">จำนวน</span>
                      </label>
                      <input
                        type="number"
                        {...register("qty", { valueAsNumber: true })}
                        className={`input input-bordered ${
                          errors.qty ? "input-error" : ""
                        }`}
                      />
                      {errors.qty && (
                        <span className="text-error text-sm mt-1">
                          {errors.qty.message}
                        </span>
                      )}
                    </div>
                    <div className="form-control">
                      <label className="label mb-1">
                        <span className="label-text">หน่วยนับ</span>
                      </label>
                      <select
                        {...register("unit", { valueAsNumber: true })}
                        className={`select select-bordered ${
                          errors.unit ? "select-error" : ""
                        }`}
                        defaultValue=""
                      >
                        <option disabled value="">
                          -- เลือกหน่วย --
                        </option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                      {errors.unit && (
                        <span className="text-error text-sm mt-1">
                          {errors.unit.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    การจัดหมวดหมู่
                  </h3>
                  <div className="form-control">
                    <label className="label mb-1">
                      <span className="label-text">เลือกหมวดหมู่สินค้า</span>
                    </label>
                    <select
                      {...register("category", { valueAsNumber: true })}
                      className={`select select-bordered w-full md:w-1/2 ${
                        errors.category ? "select-error" : ""
                      }`}
                      defaultValue=""
                    >
                      <option disabled value="">
                        -- เลือกหมวดหมู่ --
                      </option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <span className="text-error text-sm mt-1">
                        {errors.category.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* อัปโหลดรูป */}
              <div className="lg:col-span-1">
                <div className="card bg-base-200 p-4 h-full">
                  <h3 className="card-title mb-2">รูปภาพสินค้า</h3>
                  <div className="form-control">
                    <div className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-center p-4 bg-base-100">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <>
                          <FaUpload className="text-4xl opacity-50 mb-2" />
                          <p className="text-sm opacity-70">
                            ลากและวางไฟล์ที่นี่
                          </p>
                          <p className="text-xs opacity-50">หรือ</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="file-input file-input-bordered w-full mt-4"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setValue("imageFile", file);
                        setPreview(file ? URL.createObjectURL(file) : null);
                      }}
                    />
                    {errors.imageFile && (
                      <span className="text-error text-sm mt-1">
                        {String(errors.imageFile.message)}
                      </span>
                    )}
                    <p className="text-xs opacity-60 mt-2">
                      ขนาดไฟล์ไม่เกิน 5MB (JPG, PNG, WebP)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => history.back()}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                บันทึกสินค้า
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal ยืนยัน */}
      <dialog
        ref={modalRef}
        className={`modal ${isModalOpen ? "modal-open" : ""}`}
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg">ยืนยันการบันทึก</h3>
          <p className="py-4">คุณต้องการบันทึกสินค้านี้ใช่หรือไม่?</p>
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
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span className="loading loading-spinner"></span>
              )}
              ยืนยัน
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsModalOpen(false)}>close</button>
        </form>
      </dialog>
    </div>
  );
}
