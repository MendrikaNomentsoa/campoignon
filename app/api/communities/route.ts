import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listCommunities } from '@/lib/services/communities';

export async function GET() {
  const supabase = await createClient();
  const result = await listCommunities(supabase);

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}