import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listRewards } from '@/lib/services/rewards';

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const result = await listRewards(supabase, user.id);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ rewards: result.data });
}