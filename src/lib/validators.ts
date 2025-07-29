import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(0, { message: "กรุณาใส่ชื่อผู้ใช้ หรือ รหัสประจำตัวพนักงาน" }),
  password: z
    .string()
    .min(0, { message: "กรุณาใส่รหัสผ่าน" }),
});

export type TLoginSchema = z.infer<typeof loginSchema>;