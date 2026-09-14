import { createClient } from '../../../../lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const clienteNotificacoes = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } },
        )
      : supabase;

    const { data: lista, error } = await clienteNotificacoes
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', user.id)
      .order('data_criacao', { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ notifications: lista || [] }, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const clienteNotificacoes = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } },
        )
      : supabase;

    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids : body.id_notificacao ? [body.id_notificacao] : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Nenhuma notificação informada' }, { status: 400 });
    }

    const { error } = await clienteNotificacoes
      .from('notificacoes')
      .update({ lida: true })
      .eq('usuario_id', user.id)
      .in('id_notificacao', ids);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: 'Notificação atualizada' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao marcar notificação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
