import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('communities')
    .select('*, community_members(id)')
    .eq('id', slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Communauté introuvable' }, { status: 404 });
  }

  return NextResponse.json({ community: data });
}
