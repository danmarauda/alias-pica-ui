import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform');

  if (!platform) {
    return NextResponse.json({ error: 'Platform parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.picaos.com/v1/available-actions/${platform}`, {
      headers: {
        'x-pica-secret': process.env.PICA_SECRET_KEY as string,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch actions for ${platform}`);
    }

    const data = await response.json();

    return NextResponse.json({
      platform,
      actions: data.rows || [],
      count: data.total || data.rows?.length || 0,
    });
  } catch (error) {
    console.error(`[API] Error fetching actions for ${platform}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch actions for ${platform}`, actions: [], count: 0 },
      { status: 500 }
    );
  }
}
