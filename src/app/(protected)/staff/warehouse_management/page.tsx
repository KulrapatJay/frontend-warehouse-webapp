"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

// --- Mock Data ---
const Categories = [
    { id: 1, name: "Bakery" },
    { id: 2, name: "Pastry" },
    { id: 3, name: "Beverage" },
    { id: 4, name: "Snack" },
];

const Units = [
    { id: 1, name: "ชิ้น" },
    { id: 2, name: "กล่อง" },
    { id: 3, name: "lot" },
    { id: 4, name: "ชุด" },
];

const Warehouses = [
    { id: 1, name: "Warehouse 1" },
    { id: 2, name: "Warehouse 2" },
    { id: 3, name: "Warehouse 3" },
];

// ========== START: ส่วนที่แก้ไข 1. อัปเดต Zod Schema ==========
const addItemSchema = z.object({
    product_code: z.string().min(3, "ต้องมีอย่างน้อย 3 ตัวอักษร").regex(/^[A-Z0-9]+$/, "ต้องเป็นตัวอักษรพิมพ์ใหญ่หรือตัวเลขเท่านั้น"),
    sku: z.string().nonempty("ห้ามเว้นว่าง"),
    name: z.string().nonempty("กรุณากรอกชื่อสินค้า"),
    category_id: z.coerce.number().int().positive("กรุณาเลือกหมวดหมู่"),
    warehouse_id: z.coerce.number().int().positive("กรุณาเลือกคลังสินค้า"),
    quantity: z.coerce.number().int().min(0, "จำนวนต้องไม่ติดลบ"),
    unit_id: z.coerce.number().int().positive("กรุณาเลือกหน่วยนับ"),
    production_date: z.string().nonempty("กรุณาเลือกวันที่ผลิต"),
    expiration_date: z.string().nonempty("กรุณาเลือกวันหมดอายุ"),
}).refine(data => data.expiration_date >= data.production_date, {
    message: "วันหมดอายุต้องไม่ก่อนวันที่ผลิต",
    path: ["expiration_date"], // กำหนดให้ error แสดงที่ช่องวันหมดอายุ
});
// ========== END: ส่วนที่แก้ไข 1. อัปเดต Zod Schema ==========


type TAddItemInput = z.input<typeof addItemSchema>;

export default function AddItemPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<TAddItemInput>({
        resolver: zodResolver(addItemSchema),
        // ========== START: ส่วนที่แก้ไข 2. อัปเดต Default Values ==========
        defaultValues: {
            quantity: 0,
            category_id: 0,
            warehouse_id: 0,
            unit_id: 0,
            // กำหนดวันที่ผลิตเป็นวันปัจจุบัน
            production_date: new Date().toISOString().split('T')[0],
            expiration_date: '',
        },
        // ========== END: ส่วนที่แก้ไข 2. อัปเดต Default Values ==========
    });

    const onSubmit = async (data: TAddItemInput) => {
        const parsed = addItemSchema.parse(data);
        try {
            console.log("Submitting data:", parsed);
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("เพิ่มรายการสินค้าสำเร็จ!");
            router.push("/staff");
        } catch (err) {
            toast.error("บันทึกไม่สำเร็จ");
            console.error(err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto w-full">
            <div className="bg-base-100 rounded-lg shadow-xl p-8">
                <h1 className="text-3xl font-bold mb-6 text-center">เพิ่มรายการสินค้าใหม่</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Product Code & SKU */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="form-control">
                            <span className="label-text font-medium">รหัสสินค้า</span>
                            <input className="input input-bordered w-full" {...register("product_code")} />
                            <div className="h-5">
                                {errors.product_code && <span className="text-error text-xs mt-1">{errors.product_code.message}</span>}
                            </div>
                        </label>
                        <label className="form-control">
                            <span className="label-text font-medium">บาร์โค้ด(Barcode)</span>
                            <input className="input input-bordered w-full" {...register("sku")} />
                            <div className="h-5">
                                {errors.sku && <span className="text-error text-xs mt-1">{errors.sku.message}</span>}
                            </div>
                        </label>
                    </div>

                    {/* Product Name */}
                    <label className="form-control">
                        <span className="label-text font-medium">ชื่อสินค้า</span>
                        <input className="input input-bordered w-full" {...register("name")} />
                        <div className="h-5">
                            {errors.name && <span className="text-error text-xs mt-1">{errors.name.message}</span>}
                        </div>
                    </label>

                    {/* Category */}
                    <label className="form-control">
                        <span className="label-text font-medium">หมวดหมู่</span>
                        <select className="select select-bordered w-full" {...register("category_id")}>
                            <option value={0} disabled>-- เลือกหมวดหมู่ --</option>
                            {Categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <div className="h-5">
                            {errors.category_id && <span className="text-error text-xs mt-1">{errors.category_id.message}</span>}
                        </div>
                    </label>

                    {/* Warehouse Dropdown */}
                    <label className="form-control">
                        <span className="label-text font-medium">คลังสินค้า</span>
                        <select className="select select-bordered w-full" {...register("warehouse_id")}>
                            <option value={0} disabled>-- เลือกคลังสินค้า --</option>
                            {Warehouses.map((wh) => (
                                <option key={wh.id} value={wh.id}>{wh.name}</option>
                            ))}
                        </select>
                        <div className="h-5">
                            {errors.warehouse_id && <span className="text-error text-xs mt-1">{errors.warehouse_id.message}</span>}
                        </div>
                    </label>

                    {/* Quantity & Unit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="form-control">
                            <span className="label-text font-medium">จำนวน</span>
                            <input type="number" className="input input-bordered w-full" {...register("quantity")} />
                            <div className="h-5">
                                {errors.quantity && <span className="text-error text-xs mt-1">{errors.quantity.message}</span>}
                            </div>
                        </label>
                        <label className="form-control">
                            <span className="label-text font-medium">หน่วยนับ</span>
                            <select className="select select-bordered w-full" {...register("unit_id")}>
                                <option value={0} disabled>-- เลือกหน่วย --</option>
                                {Units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                ))}
                            </select>
                            <div className="h-5">
                                {errors.unit_id && <span className="text-error text-xs mt-1">{errors.unit_id.message}</span>}
                            </div>
                        </label>
                    </div>
                    
                    {/* ========== START: ส่วนที่แก้ไข 3. เพิ่มฟอร์มวันที่ ========== */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="form-control">
                            <span className="label-text font-medium">วันที่ผลิต</span>
                            <input type="date" className="input input-bordered w-full" {...register("production_date")} />
                            <div className="h-5">
                                {errors.production_date && <span className="text-error text-xs mt-1">{errors.production_date.message}</span>}
                            </div>
                        </label>
                        <label className="form-control">
                            <span className="label-text font-medium">วันหมดอายุ</span>
                            <input type="date" className="input input-bordered w-full" {...register("expiration_date")} />
                            <div className="h-5">
                                {errors.expiration_date && <span className="text-error text-xs mt-1">{errors.expiration_date.message}</span>}
                            </div>
                        </label>
                    </div>
                    {/* ========== END: ส่วนที่แก้ไข 3. เพิ่มฟอร์มวันที่ ========== */}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" className="btn btn-ghost" onClick={() => router.push("/staff")}>
                            ยกเลิก
                        </button>
                        <button className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? <span className="loading loading-spinner" /> : "บันทึก"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}