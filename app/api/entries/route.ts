import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createEntrySchema } from '@/lib/validators/schemas';
import { listEntries, createEntry } from '@/lib/services/entries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get('communityId');

  if (!communityId) {
    return NextResponse.json({ error: 'communityId requis' }, { status: 400 });
  }

  const supabase = await createClient();
  const result = await listEntries(supabase, { communityId });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ entries: result.data });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { communityId, content } = parsed.data;

  const result = await createEntry(supabase, {
    communityId,
    userId: user.id,
    content,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ entry: result.data }, { status: 201 });
}