import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouse_id');
    
    let backendApiUrl = `${process.env.BACKEND_API_URL}/api/products-warehouse`;
    if (warehouseId) {
      backendApiUrl += `?warehouse_id=${warehouseId}`;
    }

    const apiResponse = await fetch(backendApiUrl, {
      method: 'GET',
      headers: { 
        'Cookie': `token=${token}`,
      },
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch products-warehouse data' }, 
        { status: apiResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    // รับ JSON แทน FormData
    const body = await request.json()
    
    const backendApiUrl = `${process.env.BACKEND_API_URL}/api/products-warehouse`
    const apiResponse = await fetch(backendApiUrl, {
      method: 'POST',
      headers: { 
        Cookie: `token=${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(body), 
    })

    const data = await apiResponse.json()
    if (!apiResponse.ok) {
      return NextResponse.json({ message: data.message || 'Failed to create product warehouse entry' }, { status: apiResponse.status })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}