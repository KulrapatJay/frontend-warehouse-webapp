import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: "กรุณาใส่ชื่อผู้ใช้ หรือ รหัสประจำตัวพนักงาน" }),
  password: z.string().min(1, { message: "กรุณาใส่รหัสผ่าน" }),
});
export type TLoginSchema = z.infer<typeof loginSchema>;

export const addUserSchema = z.object({
  prefix_id: z.coerce.number(),
  first_name: z.string().min(1, "กรอกชื่อ"),
  last_name: z.string().min(1, "กรอกนามสกุล"),
  username: z.string().min(3, "อย่างน้อย 3 ตัวอักษร"),
  password: z.string().min(6, "อย่างน้อย 6 ตัวอักษร"),
  role_id: z.coerce.number(),
  is_active: z.boolean().default(true),
});
export type TAddUserSchema = z.infer<typeof addUserSchema>;

export const addProductSchema = z.object({
  code: z.string().min(1, "กรุณากรอกรหัสสินค้า"),
  name: z.string().min(1, "กรุณากรอกชื่อสินค้า"),
  category: z.string().min(1, "กรุณาเลือกประเภท"),
  
  price: z.coerce.number().min(0, "ราคาต้องไม่ติดลบ"),
  qty: z.coerce
    .number()
    .int("จำนวนต้องเป็นจำนวนเต็ม")
    .min(0, "จำนวนต้องไม่ติดลบ"),
  unit: z.string().min(1, "กรุณาเลือกหน่วย"),
  // date: z.string().min(1, "กรุณาเลือกวันที่"),
  barcode: z.string().optional().or(z.literal("")),
  imageFile: z.any().optional(),

});
export type TAddProduct = z.infer<typeof addProductSchema>;
