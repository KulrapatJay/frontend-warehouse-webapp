import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const backendApiUrl = `${process.env.BACKEND_API_URL}/api/products`;

    const apiResponse = await fetch(backendApiUrl, {
      method: 'GET',
      headers: { 'Cookie': `token=${token}` },
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json({ message: data.message || 'Failed to fetch products' }, { status: apiResponse.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    const incoming = await request.formData()

    const backendApiUrl = `${process.env.BACKEND_API_URL}/api/products`
    const apiResponse = await fetch(backendApiUrl, {
      method: 'POST',
      headers: { Cookie: `token=${token}` },
      body: incoming,
    })

    const data = await apiResponse.json()
    if (!apiResponse.ok) {
      return NextResponse.json({ message: data.message || 'Failed to create product' }, { status: apiResponse.status })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}