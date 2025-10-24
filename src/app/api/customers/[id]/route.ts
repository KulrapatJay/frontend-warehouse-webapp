import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendApiUrl = `${process.env.BACKEND_API_URL}/api/customers/${id}`;

    const apiResponse = await fetch(backendApiUrl, {
      method: "GET",
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    });

    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      return NextResponse.json(
        { message: data.message || "Customer not found" },
        { status: apiResponse.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error (GET):", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}