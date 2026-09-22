import { createClient } from '../../../../lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 🟢 1. GET: Listar as faltas (Se for Admin vê tudo, se for Colaborador vê apenas as dele)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const role = user.user_metadata?.role || 'colaborador';

    if (role === 'admin') {
      // Admin puxa todas as faltas cruzando com o nome do colaborador
      const { data: todasFaltas, error } = await supabase
        .from('faltas')
        .select(` 
          id_falta,
          data_falta,
          tipo,
          justificativa,
          colaboradores (nome, cargo)
        `)
        .order('data_falta', { ascending: false });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ faltas: todasFaltas }, { status: 200 });
    } else {
      // Colaborador descobre o seu ID público
      const { data: colab } = await supabase
        .from('colaboradores')
        .select('id_colaborador')
        .eq('usuario_id', user.id)
        .single();

      if (!colab) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

      // Busca apenas as faltas dele
      const { data: minhasFaltas, error } = await supabase
        .from('faltas')
        .select('*')
        .eq('colaborador_id', colab.id_colaborador)
        .order('data_falta', { ascending: false });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ faltas: minhasFaltas }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: error}, { status: 500 });
  }
}

// 🟢 2. POST: Admin regista uma nova falta
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const body = await request.json();
    const { colaborador_id, data_falta, tipo, justificativa } = body;

    const { data: novaFalta, error } = await supabase
      .from('faltas')
      .insert([{ colaborador_id, data_falta, tipo, justificativa }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ message: 'Falta marcada!', falta: novaFalta }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

// 🟢 3. DELETE: Admin remove uma falta marcada por engano
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const body = await request.json();
    const { id_falta } = body;

    const { error } = await supabase
      .from('faltas')
      .delete()
      .eq('id_falta', id_falta);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ message: 'Falta removida com sucesso!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
