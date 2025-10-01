import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.picaos.com/v1/vault/connections', {
      headers: {
        'x-pica-secret': process.env.PICA_SECRET_KEY as string,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch connections');
    }

    const data = await response.json();

    return NextResponse.json({
      connections: data.rows || [],
      total: data.total || 0,
    });
  } catch (error) {
    console.error('[API] Error fetching Pica connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections', connections: [], total: 0 },
      { status: 500 }
    );
  }
}
