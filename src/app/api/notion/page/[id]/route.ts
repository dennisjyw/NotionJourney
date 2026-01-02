import { NextRequest, NextResponse } from 'next/server';
import { getPageBlocks } from '@/lib/notion';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const blocks = await getPageBlocks(id);
        return NextResponse.json({ blocks });
    } catch (error: any) {
        console.error('Page API Route Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch page blocks' },
            { status: 500 }
        );
    }
}
