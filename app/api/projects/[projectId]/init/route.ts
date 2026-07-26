import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initProjectAI } from '@/lib/ai/project';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    const result = await initProjectAI(supabase, {
      projectId,
      description: body.description,
      resources: body.resources,
    });

    if ('error' in result) {
      console.error('[init]', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('[init] catch:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
