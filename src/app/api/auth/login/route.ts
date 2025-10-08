import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const backendApiUrl = 'http://localhost:8000/api/auth/login';

    const payloadForBackend = {
      identifier: username,
      password: password,
    };

    const apiResponse = await fetch(backendApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadForBackend),
    });

    const data = await apiResponse.json();

    // ถ้า Backend ส่ง error กลับมา ก็ส่งต่อไปยัง Frontend เลย
    if (!apiResponse.ok) {
        return NextResponse.json(data, { status: apiResponse.status });
    }

    // สร้าง Response ใหม่เพื่อส่งกลับไปให้ Browser
    const response = NextResponse.json(data, { status: apiResponse.status });

    // ดึงค่า 'set-cookie' header จาก Response ของ Backend
    const setCookieHeader = apiResponse.headers.get('set-cookie');

    // ถ้ามี header 'set-cookie' อยู่ ให้เพิ่มเข้าไปใน Response ที่จะส่งให้ Browser
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader);
    }

    return response;

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}