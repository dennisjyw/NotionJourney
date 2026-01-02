import { NextResponse } from 'next/server';
import { getTripData } from '@/lib/notion';

export async function GET() {
    // Debugging Notion Client (Removed for production)

    try {
        const data = await getTripData();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('API Route Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch Notion data' },
            { status: 500 }
        );
    }
}
