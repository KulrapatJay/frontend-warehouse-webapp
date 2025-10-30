"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import axios from "axios";
import { addItemSchema, type TAddItemSchema } from "@/lib/validators";

// --- Types ---
type Product = {
  id: number;
  product_name: string;
  sku: string;
  category: {
    category_name: string;
  };
  unit: {
    unit_name: string;
  };
};

type Category = {
  id: number;
  category_name: string;
};

type Unit = {
  id: number;
  unit_name: string;
};

type Warehouse = {
  id: number;
  name: string;
};

export default function AddItemPage() {
  const router = useRouter();

  // --- States ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // เพิ่ม state สำหรับ modal
  const [pendingData, setPendingData] = useState<TAddItemSchema | null>(null); // เพิ่ม state สำหรับเก็บข้อมูลที่รอบันทึก

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TAddItemSchema>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      product_id: 0,
      sku: "",
      warehouse_id: 0,
      quantity: 1, // เปลี่ยนจาก 0 เป็น 1
      production_date: new Date().toISOString().split("T")[0],
      expiry_date: "",
    },
  });

  const watchedProductId = watch("product_id");
  const watchedSku = watch("sku");

  // --- Fetch initial data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes, unitsRes, warehousesRes] =
          await Promise.all([
            axios.get("/api/products"),
            axios.get("/api/products/categories"),
            axios.get("/api/products/units"),
            axios.get("/api/products/warehouses"),
          ]);

        setProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
        setUnits(unitsRes.data || []);
        setWarehouses(warehousesRes.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("ไม่สามารถดึงข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Handle product selection ---
  useEffect(() => {
    if (watchedProductId && watchedProductId !== 0) {
      const product = products.find((p) => p.id === Number(watchedProductId));
      if (product) {
        setSelectedProduct(product);
        setValue("sku", product.sku);
      }
    } else if (watchedProductId === 0) {
      setSelectedProduct(null);
      setValue("sku", "");
    }
  }, [watchedProductId, products, setValue]);

  // --- Handle SKU input ---
  useEffect(() => {
    if (watchedSku && !watchedProductId) {
      const product = products.find((p) => p.sku === watchedSku);
      if (product) {
        setSelectedProduct(product);
        setValue("product_id", product.id);
      } else {
        setSelectedProduct(null);
      }
    } else if (!watchedSku && !watchedProductId) {
      setSelectedProduct(null);
    }
  }, [watchedSku, products, setValue, watchedProductId]);

  // --- Helper functions สำหรับหา ID จาก name ---
  const getCategoryIdByName = (categoryName: string) => {
    const category = categories.find(c => c.category_name === categoryName);
    return category?.id || 0;
  };

  const getUnitIdByName = (unitName: string) => {
    const unit = units.find(u => u.unit_name === unitName);
    return unit?.id || 0;
  };

  // --- Handle form submission (แสดง modal confirmation) ---
  const onSubmit = async (data: TAddItemSchema) => {
    setPendingData(data);
    setShowConfirmModal(true);
  };

  // --- Handle actual save (หลังจากยืนยันใน modal) ---
  const handleConfirmSave = async () => {
    if (!pendingData) return;

    try {
      const payload = {
        product_id: selectedProduct?.id || pendingData.product_id,
        warehouse_id: pendingData.warehouse_id,
        quantity: pendingData.quantity,
        production_date: pendingData.production_date,
        expiry_date: pendingData.expiry_date,
      };

      await axios.post("/api/products-warehouse", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("เพิ่มรายการสินค้าสำเร็จ!");
      setShowConfirmModal(false);
      setPendingData(null);
      router.push("/staff");
    } catch (err: unknown) {
      let errorMessage = "บันทึกไม่สำเร็จ";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      toast.error(errorMessage);
      console.error(err);
      setShowConfirmModal(false);
      setPendingData(null);
    }
  };

  // --- Handle cancel confirmation ---
  const handleCancelSave = () => {
    setShowConfirmModal(false);
    setPendingData(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-base-100 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          เพิ่มรายการสินค้าใหม่
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Product Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text font-medium mb-1">เลือกสินค้า</span>
              <select
                className="select select-bordered w-full"
                {...register("product_id")}
              >
                <option value={0}>-- เลือกสินค้า --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.product_name}
                  </option>
                ))}
              </select>
              <div className="h-4 mt-1">
                {errors.product_id && (
                  <span className="text-error text-xs">
                    {errors.product_id.message}
                  </span>
                )}
              </div>
            </label>

            <label className="form-control">
              <span className="label-text font-medium mb-1">หรือกรอก SKU</span>
              <input
                className="input input-bordered w-full"
                {...register("sku")}
                placeholder="กรอก SKU หรือ Barcode"
              />
              <div className="h-4 mt-1">
                {errors.sku && (
                  <span className="text-error text-xs">
                    {errors.sku.message}
                  </span>
                )}
              </div>
            </label>
          </div>

          {/* Product Info Section - Category and Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text font-medium mb-1">หมวดหมู่</span>
              <select
                key={`category-${selectedProduct?.id || "none"}`}
                className="select select-bordered w-full"
                value={selectedProduct ? getCategoryIdByName(selectedProduct.category.category_name) : 0}
                disabled={true}
              >
                <option value={0}>-- เลือกหมวดหมู่ --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control">
              <span className="label-text font-medium mb-1">หน่วยนับ</span>
              <select
                key={`unit-${selectedProduct?.id || "none"}`}
                className="select select-bordered w-full"
                value={selectedProduct ? getUnitIdByName(selectedProduct.unit.unit_name) : 0}
                disabled={true}
              >
                <option value={0}>-- เลือกหน่วยนับ --</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.unit_name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Warehouse Selection */}
          <label className="form-control">
            <span className="label-text font-medium mb-1">คลังสินค้า</span>
            <select
              className="select select-bordered w-full"
              {...register("warehouse_id")}
            >
              <option value={0}>-- เลือกคลังสินค้า --</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
            <div className="h-4 mt-1">
              {errors.warehouse_id && (
                <span className="text-error text-xs">
                  {errors.warehouse_id.message}
                </span>
              )}
            </div>
          </label>

          {/* Quantity */}
          <label className="form-control">
            <span className="label-text font-medium mb-1">
              จำนวน {selectedProduct && `(${selectedProduct.unit.unit_name})`}
            </span>
            <input
              type="number"
              className="input input-bordered w-full"
              {...register("quantity")}
              min={1} // เปลี่ยนจาก min={0} เป็น min={1}
            />
            <div className="h-4 mt-1">
              {errors.quantity && (
                <span className="text-error text-xs">
                  {errors.quantity.message}
                </span>
              )}
            </div>
          </label>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text font-medium mb-1">วันที่ผลิต</span>
              <input
                type="date"
                className="input input-bordered w-full"
                {...register("production_date")}
              />
              <div className="h-4 mt-1">
                {errors.production_date && (
                  <span className="text-error text-xs">
                    {errors.production_date.message}
                  </span>
                )}
              </div>
            </label>
            <label className="form-control">
              <span className="label-text font-medium mb-1">วันหมดอายุ</span>
              <input
                type="date"
                className="input input-bordered w-full"
                {...register("expiry_date")}
              />
              <div className="h-4 mt-1">
                {errors.expiry_date && (
                  <span className="text-error text-xs">
                    {errors.expiry_date.message}
                  </span>
                )}
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push("/staff")}
            >
              ยกเลิก
            </button>
            <button
              className="btn btn-primary"
              disabled={isSubmitting || !selectedProduct || watchedProductId === 0}
              type="submit"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner" />
              ) : (
                "บันทึก"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && pendingData && selectedProduct && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">ยืนยันการเพิ่มสินค้า</h3>
            
            <div className="space-y-2 mb-6">
              <p><span className="font-medium">สินค้า:</span> {selectedProduct.product_name}</p>
              <p><span className="font-medium">SKU:</span> {selectedProduct.sku}</p>
              <p><span className="font-medium">หมวดหมู่:</span> {selectedProduct.category.category_name}</p>
              <p><span className="font-medium">หน่วยนับ:</span> {selectedProduct.unit.unit_name}</p>
              <p><span className="font-medium">คลังสินค้า:</span> {warehouses.find(w => w.id === pendingData.warehouse_id)?.name}</p>
              <p><span className="font-medium">จำนวน:</span> {pendingData.quantity} {selectedProduct.unit.unit_name}</p>
              <p><span className="font-medium">วันที่ผลิต:</span> {new Date(pendingData.production_date).toLocaleDateString('th-TH')}</p>
              <p><span className="font-medium">วันหมดอายุ:</span> {new Date(pendingData.expiry_date).toLocaleDateString('th-TH')}</p>
            </div>

            <p className="text-center mb-6">ต้องการเพิ่มสินค้านี้หรือไม่?</p>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCancelSave}
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "ยืนยัน"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}