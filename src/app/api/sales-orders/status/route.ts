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

    const backendApiUrl = `${process.env.BACKEND_API_URL}/api/sales-orders/status`;

    const apiResponse = await fetch(backendApiUrl, {
      method: "GET",
      headers: { Cookie: `token=${token}` },
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch sales orders status" },
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