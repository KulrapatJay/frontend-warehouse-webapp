"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import { Prefix } from "@/mock/prefixs";
import { Role } from "@/mock/roles";
import { addUserSchema } from "@/lib/validators";

type TAddUserInput = z.input<typeof addUserSchema>;

export default function AddUserPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TAddUserInput>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      prefix_id: Prefix?.[0]?.id ?? 0,
      role_id: Role?.[0]?.id ?? 1,
      is_active: true,
    },
  });

  const onSubmit = async (data: TAddUserInput) => {
    const parsed = addUserSchema.parse(data);
    try {
      // TODO: POST /api/users ด้วย parsed
      toast.success("เพิ่มผู้ใช้สำเร็จ");
      router.push("/user_management");
    } catch (err) {
      toast.error("บันทึกไม่สำเร็จ");
      console.error(err);
    }
  };

  // *** ไม่มี Sidebar / Navbar ที่นี่แล้ว ***
  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-base-100 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Add new user</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Prefix */}
          <label className="form-control">
            <span className="label-text font-medium">Prefix</span>
            <select className="select select-bordered w-full" {...register("prefix_id")}>
              {Prefix.map((p: { id: number; name?: string; prefix_name?: string }) => (
                <option key={p.id} value={p.id}>{p.name ?? p.prefix_name}</option>
              ))}
            </select>
          </label>

          {/* First & Last name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="form-control">
              <span className="label-text font-medium">First name</span>
              <input className="input input-bordered w-full" {...register("first_name")} />
              {errors.first_name && <span className="text-error text-xs mt-1">{errors.first_name.message}</span>}
            </label>
            <label className="form-control">
              <span className="label-text font-medium">Last name</span>
              <input className="input input-bordered w-full" {...register("last_name")} />
              {errors.last_name && <span className="text-error text-xs mt-1">{errors.last_name.message}</span>}
            </label>
          </div>

          {/* Role */}
          <label className="form-control">
            <span className="label-text font-medium">Role</span>
            <select className="select select-bordered w-full" {...register("role_id")}>
              {Role.map((r: { id: number; role_name: string }) => (
                <option key={r.id} value={r.id}>{r.role_name}</option>
              ))}
            </select>
          </label>

          {/* Username & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="form-control">
              <span className="label-text font-medium">Username</span>
              <input className="input input-bordered w-full" {...register("username")} />
              {errors.username && <span className="text-error text-xs mt-1">{errors.username.message}</span>}
            </label>
            <label className="form-control">
              <span className="label-text font-medium">Password</span>
              <input type="password" className="input input-bordered w-full" {...register("password")} />
              {errors.password && <span className="text-error text-xs mt-1">{errors.password.message}</span>}
            </label>
          </div>

          {/* Active */}
          <div>
            <label className="label cursor-pointer justify-start gap-3">
              <input type="checkbox" className="checkbox checkbox-primary" {...register("is_active")} />
              <span className="label-text text-base">Active</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="btn btn-ghost" onClick={() => router.push("/user_management")}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner" /> : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
