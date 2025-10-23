// app/api/user-management/[id]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  
) {
  try {
    const { id } = await params;                     
    const body = await request.json();

    const backendApiUrl =
      `${process.env.BACKEND_API_URL}/api/user-management/${id}`;

    const apiResponse = await fetch(backendApiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });

    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to update user" },
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
      `${process.env.BACKEND_API_URL}/api/user-management/${id}`;

    const apiResponse = await fetch(backendApiUrl, {
      method: "DELETE",
      headers: { Cookie: request.headers.get("cookie") || "" },
    });

    if (!apiResponse.ok) {
      const data = await apiResponse.json();
      return NextResponse.json(
        { message: data.message || "Failed to delete user" },
        { status: apiResponse.status }
      );
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("API Route Error (DELETE):", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
