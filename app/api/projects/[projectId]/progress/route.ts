import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateProgressLog } from '@/lib/ai/project';

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

    const result = await generateProgressLog(supabase, {
      projectId,
      activity: body.activity,
    });

    if ('error' in result) {
      console.error('[progress]', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('[progress] catch:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
