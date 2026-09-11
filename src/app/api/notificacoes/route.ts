import { createClient } from '../../../../lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { data: lista, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', user.id)
      .order('data_criacao', { ascending: false })
      .limit(5); // Traz apenas as 5 mais recentes

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ notifications: lista || [] }, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
