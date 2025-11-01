import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const backendApiUrl = `${process.env.BACKEND_API_URL}/api/print/sales-order/${id}`;

    const apiResponse = await fetch(backendApiUrl, {
      method: 'GET',
      headers: {
        Cookie: `token=${token}`,
      },
    });

    const contentType = apiResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ message: 'Invalid response from backend' }, { status: apiResponse.status || 502 });
    }

    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      return NextResponse.json({ message: data?.message || 'Failed to fetch receipt data' }, { status: apiResponse.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}