import React, { useState, useEffect } from "react";

// --- Type Definitions ---
type User = {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  username: string;
  prefix: { name: string };
  role: { role_name: string };
  last_login: string | null;
  updated_at: string | null;
};
type Prefix = { id: number; name: string };
type Role = { id: number; role_name: string };

// --- 1. อัปเดต Payload ให้รับ password (แบบ optional) ได้ ---
export type UpdateUserPayload = {
  id: number;
  prefix_id: number;
  role_id: number;
  first_name: string;
  last_name: string;
  username: string;
  password?: string; // เพิ่ม ? เพื่อบอกว่า field นี้อาจจะไม่มีก็ได้
};

type EditUserModalProps = {
  user: User | null;
  isOpen: boolean;
  prefixes: Prefix[];
  roles: Role[];
  onClose: () => void;
  onSave: (payload: UpdateUserPayload) => void;
};

// --- 2. อัปเดต FormData ให้มี password ด้วย ---
type FormData = {
  id: number;
  prefix_id: number;
  role_id: number;
  first_name: string;
  last_name: string;
  username: string;
  password: string; 
};

export default function EditUserForm({
  user,
  isOpen,
  prefixes,
  roles,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [formData, setFormData] = useState<FormData | null>(null);
  // --- 3. เพิ่ม State สำหรับ "ยืนยันรหัสผ่าน" และการแจ้งเตือน ---
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      const currentPrefix = prefixes.find((p) => p.name === user.prefix.name);
      const currentRole = roles.find(
        (r) => r.role_name === user.role.role_name
      );

      setFormData({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        prefix_id: currentPrefix?.id || 0,
        role_id: currentRole?.id || 0,
        password: "", // เริ่มต้นให้รหัสผ่านเป็นค่าว่าง
      });
      // รีเซ็ตค่าทุกครั้งที่เปิด Modal ใหม่
      setConfirmPassword("");
      setPasswordError("");
    }
  }, [user, prefixes, roles]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "role_id" || name === "prefix_id" ? Number(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    // --- 4. ตรวจสอบว่ารหัสผ่านที่กรอก 2 ครั้งตรงกันหรือไม่ ---
    if (formData.password && formData.password !== confirmPassword) {
      setPasswordError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setPasswordError("");

    const payload: UpdateUserPayload = {
      id: formData.id,
      prefix_id: formData.prefix_id,
      role_id: formData.role_id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      username: formData.username,
    };

    // --- 5. เพิ่ม password เข้าไปใน payload เฉพาะในกรณีที่มีการกรอกข้อมูล ---
    if (formData.password.trim() !== "") {
      payload.password = formData.password;
    }

    onSave(payload);
  };

  if (!isOpen || !formData) return null;

  return (
    <dialog
      id="edit_user_modal"
      className={`modal ${isOpen ? "modal-open" : ""}`}
    >
      <div className="modal-box">
        <h3 className="font-bold text-lg">เเก้ไขผู้ใช้</h3>
        <p className="py-2 text-sm opacity-70">
          แก้ไขข้อมูลผู้ใช้สำหรับ {user?.first_name} {user?.last_name}.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-control grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">คำนำหน้า</span>
              </div>
              <select
                name="prefix_id"
                className="select select-bordered"
                value={formData.prefix_id}
                onChange={handleChange}
              >
                {prefixes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">ตำเเหน่ง</span>
              </div>
              <select
                name="role_id"
                className="select select-bordered"
                value={formData.role_id}
                onChange={handleChange}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.role_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">ชื่อ</span>
              </div>
              <input
                type="text"
                name="first_name"
                className="input input-bordered w-full"
                value={formData.first_name}
                onChange={handleChange}
              />
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">นามสกุล</span>
              </div>
              <input
                type="text"
                name="last_name"
                className="input input-bordered w-full"
                value={formData.last_name}
                onChange={handleChange}
              />
            </label>

            <label className="form-control w-full md:col-span-2">
              <div className="label">
                <span className="label-text">ชื่อผู้ใช้</span>
              </div>
              <input
                type="text"
                name="username"
                className="input input-bordered w-full"
                value={formData.username}
                onChange={handleChange}
              />
            </label>

            {/* --- 6. เพิ่มส่วนของ Password ที่นี่ --- */}
            <div className="divider md:col-span-2 my-0">
              เปลี่ยนรหัสผ่าน (ไม่บังคับ)
            </div>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">รหัสผ่านใหม่</span>
              </div>
              <input
                type="password"
                name="password"
                placeholder="กรอกเพื่อเปลี่ยน"
                className="input input-bordered w-full"
                value={formData.password}
                onChange={handleChange}
              />
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">ยืนยันรหัสผ่านใหม่</span>
              </div>
              <input
                type="password"
                name="confirm_password"
                placeholder="กรอกเพื่อเปลี่ยน"
                className={`input input-bordered w-full ${
                  passwordError ? "input-error" : ""
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
            {/* แสดงข้อความ Error ถ้ามี */}
            {passwordError && (
              <div className="text-error text-xs md:col-span-2">
                {passwordError}
              </div>
            )}
          </div>

          <div className="modal-action mt-6">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary">
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
