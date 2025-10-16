// app/api/user-management/[id]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendApiUrl = `${process.env.BACKEND_API_URL}/api/products/${id}`;

    const apiResponse = await fetch(backendApiUrl, {
      method: "GET",
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    });

    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      return NextResponse.json(
        { message: data.message || "Product not found" },
        { status: apiResponse.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error (GET):", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendApiUrl = `${process.env.BACKEND_API_URL}/api/products/${id}`;

    let bodyToSend: BodyInit;
    let headers: HeadersInit = { Cookie: request.headers.get("cookie") || "" };

    try {
      const fd = await request.formData(); 
      bodyToSend = fd;
    } catch {
      const json = await request.json();
      bodyToSend = JSON.stringify(json);
      headers = {
        ...headers,
        "Content-Type": "application/json",
      };
    }

    const apiResponse = await fetch(backendApiUrl, {
      method: "PUT",
      headers,
      body: bodyToSend,
    });

    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to update product" },
        { status: apiResponse.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error (PUT):", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }   
) {
  try {
    const { id } = await params;                     
    const backendApiUrl =
      `${process.env.BACKEND_API_URL}/api/products/${id}`;

    const apiResponse = await fetch(backendApiUrl, {
      method: "DELETE",
      headers: { Cookie: request.headers.get("cookie") || "" },
    });

    if (!apiResponse.ok) {
      const data = await apiResponse.json();
      return NextResponse.json(
        { message: data.message || "Failed to delete product" },
        { status: apiResponse.status }
      );
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("API Route Error (DELETE):", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
