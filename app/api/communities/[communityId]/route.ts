import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCommunity } from '@/lib/services/communities';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ communityId: string }> }
) {
  const { communityId } = await params;
  const supabase = await createClient();

  const result = await getCommunity(supabase, { communityId });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ community: result.data });
}