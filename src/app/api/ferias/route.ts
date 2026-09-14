import { createClient } from "../../../../lib/supabase/server";
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { criarNotificacoes } from '../../../../lib/supabase/notificacoes';

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

  const { data: pedidoOriginal } = await supabase
    .from('ferias')
    .select('colaboradores(usuario_id, nome)')
    .eq('id_ferias', id_ferias)
    .single();

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

  const colaborador = Array.isArray(pedidoOriginal?.colaboradores)
    ? pedidoOriginal.colaboradores[0]
    : pedidoOriginal?.colaboradores;

  if (colaborador?.usuario_id) {
    const estadoFormatado = novo_estado === 'aprovado' ? 'aprovado' : 'rejeitado';
    await criarNotificacoes(
      supabase,
      [colaborador.usuario_id],
      `Pedido de férias ${estadoFormatado}`,
      `O seu pedido de férias foi ${estadoFormatado}.`,
    );
  }

  return NextResponse.json({ message: 'Pedido atualizado!', pedido: atualizado }, { status: 200 });
}




export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // A. Verifica o utilizador logado no navegador através do token
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { data_inicio, data_fim } = body;

    if (!data_inicio || !data_fim) {
      return NextResponse.json({ error: 'As datas de início e fim são obrigatórias' }, { status: 400 });
    }

    // B. Descobre o id_colaborador real baseado no usuario_id da tabela colaboradores
    const { data: colab, error: colabError } = await supabase
      .from('colaboradores')
      .select('id_colaborador')
      .eq('usuario_id', user.id)
      .single();

    if (colabError || !colab) {
      console.error("Erro ao buscar colaborador:", colabError);
      return NextResponse.json({ error: 'Perfil de colaborador não encontrado no sistema' }, { status: 404 });
    }

    // 🟢 CORREÇÃO DEFINITIVA: Extrai apenas a string AAAA-MM-DD pura enviada pelo input HTML,
    // ignorando fusos horários que retrocedem ou avançam o dia do calendário.
    const dataInicioPura = data_inicio.split('T')[0];
    const dataFimPura = data_fim.split('T')[0];

    // C. Insere o pedido na tabela 'ferias' com o estado padrão em minúsculas 'pendente'
    const { data: novoPedido, error: insertError } = await supabase
      .from('ferias')
      .insert([
        {
          colaborador_id: colab.id_colaborador,
          data_inicio: dataInicioPura, 
          data_fim: dataFimPura,       
          estado_ferias: 'pendente'
        }
      ])
      .select()
      .single();

    if (insertError) {
      // Printa o erro exato do banco de dados no seu terminal do VS Code
      console.error("❌ ERRO DO POSTGRESQL NO INSERT DE FÉRIAS:", insertError.message);
      return NextResponse.json({ error: `Erro no banco de dados: ${insertError.message}` }, { status: 400 });
    }

    const { data: administradores } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('role', 'admin');

    await criarNotificacoes(
      supabase,
      (administradores || []).map((administrador) => administrador.id_usuario),
      'Novo pedido de férias',
      'Existe um novo pedido de férias aguardando decisão.',
    );

    return NextResponse.json({ message: 'Pedido enviado com sucesso!', pedido: novoPedido }, { status: 200 });

  } catch (error) {
    console.error("Erro inesperado no POST de férias:", error);
    return NextResponse.json({ error: `Erro ao processar solicitação: ${error}` }, { status: 500 });
  }
}
