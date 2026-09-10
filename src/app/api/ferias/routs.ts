import { createClient } from "../../../../lib/supabase/server";
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 1. LISTAR TODOS OS PEDIDOS DE FÉRIAS (com JOINs)
export async function GET() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: pedidos, error } = await supabase
    .from('ferias')
    .select(`
      id_ferias,
      data_inicio,
      data_fim,
      estado_ferias,
      data_solicitacao,
      colaboradores (
        id_colaborador,
        nome
      )
    `)
    .order('data_solicitacao', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pedidos }, { status: 200 });
}

// 2. ATUALIZAR ESTADO (Aprovar / Reprovar)
export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Proteção para garantir que quem decide é o Admin logado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  const { id_ferias, novo_estado } = body; // novo_estado deve ser 'aprovado' ou 'reprovado'

  const { data: atualizado, error } = await supabase
    .from('ferias')
    .update({
      estado_ferias: novo_estado,
      decidido_por: user.id,
      data_decisao: new Date().toISOString()
    })
    .eq('id_ferias', id_ferias)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Pedido atualizado!', pedido: atualizado }, { status: 200 });
}
