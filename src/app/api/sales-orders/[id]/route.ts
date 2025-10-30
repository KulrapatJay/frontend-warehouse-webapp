import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }
    const backendApiUrl = `${process.env.BACKEND_API_URL}/api/sales-orders/status/${id}`;
    const requestData = await request.json();
    const apiResponse = await fetch(backendApiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      body: JSON.stringify(requestData),
    });

    // ตรวจสอบ Content-Type ก่อนพยายาม parse JSON
    const contentType = apiResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await apiResponse.text();
      console.error("Non-JSON response received:", text);
      return NextResponse.json(
        { message: "Invalid response format from backend server" },
        { status: 500 }
      );
    }
    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to update sales order status" },
        { status: apiResponse.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error (PUT):", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
