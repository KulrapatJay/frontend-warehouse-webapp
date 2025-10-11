import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. รับข้อมูลทั้งหมดที่ส่งมาจากฟอร์มลงทะเบียนฝั่ง Frontend
    const body = await request.json();
    // 2. กำหนด URL ของ Backend API สำหรับการลงทะเบียน
    const backendApiUrl = `${process.env.BACKEND_API_URL}/api/auth/register`;
    // 3. ส่ง Request ต่อไปยัง Backend API โดยแนบข้อมูลทั้งหมด (body) ไปด้วย
    const apiResponse = await fetch(backendApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body), 
    });
    // 4. ดึงข้อมูลที่ Backend ตอบกลับมา
    const data = await apiResponse.json();
    // 5. ตรวจสอบว่า Backend ตอบกลับมาว่าสำเร็จหรือไม่
    if (!apiResponse.ok) {
      console.error('Backend Error:', data);
      return NextResponse.json(
        { message: data.message || 'An error occurred during registration' },
        { status: apiResponse.status }
      );
    }
    return NextResponse.json(data, { status: 201 }); 
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}