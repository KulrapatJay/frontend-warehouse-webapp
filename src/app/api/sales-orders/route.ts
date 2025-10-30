import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // --- จุดที่แก้ไข ---
    // 1. ดึง query string ทั้งหมด (เช่น "?warehouse_id=1") จาก URL ที่เข้ามา
    const { search } = new URL(request.url);

    // 2. สร้าง URL ไปยัง Backend โดยเอา query string ทั้งหมดต่อไปด้วย
    const backendApiUrl = `${process.env.BACKEND_API_URL}/api/sales-orders${search}`;
    // --- สิ้นสุดการแก้ไข ---

    const apiResponse = await fetch(backendApiUrl, {
      method: "GET",
      headers: { Cookie: `token=${token}` },
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch sales orders" },
        { status: apiResponse.status }
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }
    const requestData = await request.json();
    const backendApiUrl = `${process.env.BACKEND_API_URL}/api/sales-orders`;

    const apiResponse = await fetch(backendApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      body: JSON.stringify(requestData),
    });
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to create sales order" },
        { status: apiResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error (POST):", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
