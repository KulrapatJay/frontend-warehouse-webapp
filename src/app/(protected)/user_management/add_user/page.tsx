"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";

import { addUserSchema } from "@/lib/validators";

interface Prefix {
  id: number;
  name: string;
}

interface Role {
  id: number;
  role_name: string;
}
type TAddUserInput = z.input<typeof addUserSchema>;

export default function AddUserPage() {
  const router = useRouter();
  const [prefixes, setPrefixes] = useState<Prefix[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<TAddUserInput>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      is_active: true,
    },
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setIsLoading(true);
        // ดึงข้อมูลทั้ง Prefixes และ Roles พร้อมกันเพื่อความรวดเร็ว
        const [prefixesRes, rolesRes] = await Promise.all([
          axios.get("/api/user-management/prefixes"),
          axios.get("/api/user-management/roles"),
        ]);

        console.log("API Response for Prefixes:", prefixesRes.data);
        console.log("API Response for Roles:", rolesRes.data);

        const fetchedPrefixes = prefixesRes.data.data || prefixesRes.data || [];
        const fetchedRoles = rolesRes.data.data || rolesRes.data || [];

        setPrefixes(fetchedPrefixes);
        setRoles(fetchedRoles);

        // โค้ดส่วนที่เหลือจะทำงานได้ปกติ เพราะ fetchedPrefixes จะเป็น Array เสมอ
        if (fetchedPrefixes.length > 0) {
          setValue("prefix_id", fetchedPrefixes[0].id);
        }
        if (fetchedRoles.length > 0) {
          setValue("role_id", fetchedRoles[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch dropdown data:", err);
        toast.error("ไม่สามารถโหลดข้อมูลคำนำหน้าและตำแหน่งได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDropdownData();
  }, [setValue]);

  const onSubmit = async (data: TAddUserInput) => {
    const parsed = addUserSchema.parse(data);
    try {
      await axios.post("/api/auth/register", parsed);
      toast.success("เพิ่มผู้ใช้ใหม่สำเร็จ!");
      router.push("/user_management");
    } catch (error) {
      let errorMessage = "บันทึกข้อมูลไม่สำเร็จ";
      if (error instanceof AxiosError) {
        errorMessage =
          error.response?.data?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์";
      }
      toast.error(errorMessage);
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-lg loading-spinner text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-base-100 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">เพิ่มผู้ใช้ใหม่</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Prefix Dropdown */}
          <label className="form-control">
            <span className="label-text font-medium">คำนำหน้า</span>
            <select
              className="select select-bordered w-full"
              {...register("prefix_id")}
            >
              {prefixes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control">
            <span className="label-text font-medium">รหัสพนักงาน</span>
            <input
              className="input input-bordered w-full"
              {...register("employee_id")}
            />
            {errors.employee_id && (
              <span className="text-error text-xs mt-1">
                {errors.employee_id.message}
              </span>
            )}
          </label>

          {/* First & Last name Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="form-control">
              <span className="label-text font-medium">ชื่อ</span>
              <input
                className="input input-bordered w-full"
                {...register("first_name")}
              />
              {errors.first_name && (
                <span className="text-error text-xs mt-1">
                  {errors.first_name.message}
                </span>
              )}
            </label>
            <label className="form-control">
              <span className="label-text font-medium">นามสกุล</span>
              <input
                className="input input-bordered w-full"
                {...register("last_name")}
              />
              {errors.last_name && (
                <span className="text-error text-xs mt-1">
                  {errors.last_name.message}
                </span>
              )}
            </label>
          </div>

          {/* Role Dropdown */}
          <label className="form-control">
            <span className="label-text font-medium">ตำเเหน่ง</span>
            <select
              className="select select-bordered w-full"
              {...register("role_id")}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.role_name}
                </option>
              ))}
            </select>
          </label>

          {/* Username & Password Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="form-control">
              <span className="label-text font-medium">ชื่อผู้ใช้</span>
              <input
                className="input input-bordered w-full"
                {...register("username")}
              />
              {errors.username && (
                <span className="text-error text-xs mt-1">
                  {errors.username.message}
                </span>
              )}
            </label>
            <label className="form-control">
              <span className="label-text font-medium">รหัสผ่าน</span>
              <input
                type="password"
                className="input input-bordered w-full"
                {...register("password")}
              />
              {errors.password && (
                <span className="text-error text-xs mt-1">
                  {errors.password.message}
                </span>
              )}
            </label>
          </div>

          {/* Active Checkbox */}
          <div>
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                {...register("is_active")}
              />
              <span className="label-text text-base">กำลังใช้งาน</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push("/user_management")}
            >
              ยกเลิก
            </button>
            <button className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="loading loading-spinner" />
              ) : (
                "บันทึก"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
