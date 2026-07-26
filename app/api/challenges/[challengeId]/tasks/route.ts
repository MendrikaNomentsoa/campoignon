import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listTasks, createTask } from '@/lib/services/tasks';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params;
  const supabase = await createClient();

  const result = await listTasks(supabase, { challengeId });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ tasks: result.data });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const { challengeId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const body = await request.json();
  const { assigned_to, title, description, points, deadline } = body;

  if (!assigned_to || !title) {
    return NextResponse.json(
      { error: 'assigned_to et title sont requis' },
      { status: 400 }
    );
  }

  const result = await createTask(supabase, {
    challengeId,
    createdBy: user.id,
    assignedTo: assigned_to,
    title,
    description,
    points,
    deadline,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ task: result.data }, { status: 201 });
}