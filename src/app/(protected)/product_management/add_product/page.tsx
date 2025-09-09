"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TAddProduct, addProductSchema } from "@/lib/validators";
import { useState } from "react";
import { FaUpload } from "react-icons/fa";

// Mock function for submission
async function addProduct(data: TAddProduct) {
  console.log("Submitting new product:", data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  alert("สินค้าถูกเพิ่มเรียบร้อยแล้ว!");
}

export default function AddProductPage() {
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<TAddProduct>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      price: 0,
      qty: 0,
      imageFile: null,
    },
  });

  const onSubmit = async (data: TAddProduct) => {
    await addProduct(data);
  };
  
  // Dummy data for dropdowns
  const categories = ["Bakery", "Pastry", "Beverage", "Snack"];
  const units = ["ชิ้น", "กล่อง", "lot", "ชุด"];

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">เพิ่มสินค้าใหม่</h1>
          {/* อาจจะมีปุ่มอื่นๆ ตรงนี้ได้ในอนาคต */}
        </div>

        {/* Main Layout Grid (2 columns on large screens) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Left Column: Main product info --- */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body space-y-6">
                
                {/* Section: General Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">ข้อมูลทั่วไป</h3>
                  <div className="form-control">
                    <label className="label"><span className="label-text">ชื่อสินค้า</span></label>
                    <input type="text" {...register("name")} className={`input input-bordered ${errors.name ? 'input-error' : ''}`} />
                    {errors.name && <span className="text-error text-sm mt-1">{errors.name.message}</span>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label"><span className="label-text">รหัสสินค้า (Code)</span></label>
                      <input type="text" {...register("code")} className={`input input-bordered ${errors.code ? 'input-error' : ''}`} />
                      {errors.code && <span className="text-error text-sm mt-1">{errors.code.message}</span>}
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text">บาร์โค้ด (Barcode)</span></label>
                      <input type="text" {...register("barcode")} className="input input-bordered" />
                    </div>
                  </div>
                </div>

                {/* Section: Stock and Pricing */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">สต็อกและราคา</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-control">
                      <label className="label"><span className="label-text">ราคา</span></label>
                      <input type="number" step="0.01" {...register("price")} className={`input input-bordered ${errors.price ? 'input-error' : ''}`} />
                      {errors.price && <span className="text-error text-sm mt-1">{errors.price.message}</span>}
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text">จำนวน</span></label>
                      <input type="number" {...register("qty")} className={`input input-bordered ${errors.qty ? 'input-error' : ''}`} />
                      {errors.qty && <span className="text-error text-sm mt-1">{errors.qty.message}</span>}
                    </div>
                     <div className="form-control">
                      <label className="label"><span className="label-text">หน่วยนับ</span></label>
                       <select {...register("unit")} className={`select select-bordered ${errors.unit ? 'select-error' : ''}`}>
                         <option disabled selected value="">-- เลือกหน่วย --</option>
                         {units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      {errors.unit && <span className="text-error text-sm mt-1">{errors.unit.message}</span>}
                    </div>
                  </div>
                </div>
                 <div className="form-control w-full md:w-1/3">
                    <label className="label"><span className="label-text">วันที่</span></label>
                    <input type="date" {...register("date")} className={`input input-bordered ${errors.date ? 'input-error' : ''}`} />
                    {errors.date && <span className="text-error text-sm mt-1">{errors.date.message}</span>}
                 </div>

              </div>
            </div>
          </div>

          {/* --- Right Column: Image and Category --- */}
          <div className="lg:col-span-1 space-y-8">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">รูปภาพสินค้า</h3>
                <div className="form-control">
                   <div className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-center p-4">
                      {preview ? (
                        <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <>
                          <FaUpload className="text-4xl opacity-50 mb-2"/>
                          <p className="text-sm opacity-70">ลากและวางไฟล์ที่นี่</p>
                          <p className="text-xs opacity-50">หรือ</p>
                        </>
                      )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input file-input-bordered w-full mt-4"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setValue("imageFile", file);
                        setPreview(URL.createObjectURL(file));
                      } else {
                        setValue("imageFile", null);
                        setPreview(null);
                      }
                    }}
                  />
                  {errors.imageFile && <span className="text-error text-sm mt-1">{errors.imageFile.message as string}</span>}
                  <p className="text-xs opacity-60 mt-2">ขนาดไฟล์ไม่เกิน 2MB (JPG, PNG, WebP)</p>
                </div>
              </div>
            </div>
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">หมวดหมู่</h3>
                <div className="form-control">
                  <label className="label"><span className="label-text">เลือกหมวดหมู่สินค้า</span></label>
                  <select {...register("category")} className={`select select-bordered ${errors.category ? 'select-error' : ''}`}>
                    <option disabled selected value="">-- เลือกหมวดหมู่ --</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  {errors.category && <span className="text-error text-sm mt-1">{errors.category.message}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
           <button type="button" className="btn btn-ghost" onClick={() => history.back()}>ยกเลิก</button>
           <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
             {isSubmitting && <span className="loading loading-spinner"></span>}
             บันทึกสินค้า
           </button>
        </div>
      </form>
    </div>
  );
}