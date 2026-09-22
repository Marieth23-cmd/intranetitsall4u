import { createClient } from "../../../../lib/supabase/server";
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { criarNotificacoes } from '../../../../lib/supabase/notificacoes';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// Interface explícita para evitar o uso de explicit-any
interface ColaboradorNotificacao {
  usuario_id: string | null;
  nome?: string | null;
}

function dataLocal(data: Date) {
  return [data.getFullYear(), String(data.getMonth() + 1).padStart(2, '0'), String(data.getDate()).padStart(2, '0')].join('-');
}

function diasUteis(inicio: string, fim: string) {
  const atual = new Date(`${inicio}T00:00:00`);
  const limite = new Date(`${fim}T00:00:00`);
  let total = 0;
  while (atual <= limite) {
    if (atual.getDay() !== 0 && atual.getDay() !== 6) total += 1;
    atual.setDate(atual.getDate() + 1);
  }
  return total;
}

function mesesCompletos(dataEntrada: string, hoje = new Date()) {
  const entrada = new Date(`${dataEntrada.slice(0, 10)}T00:00:00`);
  let meses = (hoje.getFullYear() - entrada.getFullYear()) * 12 + hoje.getMonth() - entrada.getMonth();
  if (hoje.getDate() < entrada.getDate()) meses -= 1;
  return Math.max(0, meses);
}

function direitoAnual(meses: number) {
  return meses < 12 ? meses * 2 : 22;
}

// 1. LISTAR PEDIDOS DE FÉRIAS E CALCULAR SALDO DINÂMICO DO COLABORADOR
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { data: perfil } = await supabase.from('usuarios').select('role').eq('id_usuario', user.id).maybeSingle();
    const role = perfil?.role || 'colaborador';

    const { data: perfilColaborador } = await supabase
      .from('colaboradores')
      .select('id_colaborador, data_entrada, dias_ferias_gozados')
      .eq('usuario_id', user.id)
      .maybeSingle();

    let consultaPedidos = supabase
      .from('ferias')
      .select(`
        id_ferias,
        data_inicio,
        data_fim,
        estado_ferias,
        data_solicitacao,
        colaboradores (
          id_colaborador,
          nome,
          data_entrada,
          dias_ferias_gozados
        )
      `)
      .order('data_solicitacao', { ascending: false });

    if (role !== 'admin') {
      if (!perfilColaborador) return NextResponse.json({ error: 'Perfil de colaborador não encontrado no sistema' }, { status: 404 });
      consultaPedidos = consultaPedidos.eq('colaborador_id', perfilColaborador.id_colaborador);
    }

    const { data: pedidos, error: errorPedidos } = await consultaPedidos;

    if (errorPedidos) return NextResponse.json({ error: errorPedidos.message }, { status: 500 });

    let informacaoSaldo = null;
    if (role === 'colaborador' || role === 'gestor') {
      const colab = perfilColaborador;

      if (colab?.data_entrada) {
        const meses = mesesCompletos(colab.data_entrada);
        const diasTotaisDireito = direitoAnual(meses);
        const diasGozados = (pedidos || [])
          .filter((pedido) => pedido.estado_ferias === 'aprovado')
          .reduce((total, pedido) => total + diasUteis(pedido.data_inicio, pedido.data_fim), 0);
        const diasPendentes = (pedidos || [])
          .filter((pedido) => pedido.estado_ferias === 'pendente')
          .reduce((total, pedido) => total + diasUteis(pedido.data_inicio, pedido.data_fim), 0);

        informacaoSaldo = {
          dias_totais: diasTotaisDireito,
          dias_gozados: diasGozados,
          dias_pendentes: diasPendentes,
          dias_disponiveis: Math.max(0, diasTotaisDireito - diasGozados - diasPendentes),
          elegivel: meses >= 6,
          meses_trabalhados: meses,
          mensagem: meses < 6 ? `Ainda não reúne as condições para solicitar férias (${meses} meses completos; mínimo de 6).` : "Regular"
        };
      } else {
        informacaoSaldo = {
          dias_totais: 22,
          dias_gozados: colab?.dias_ferias_gozados || 0,
          dias_disponiveis: Math.max(0, 22 - (colab?.dias_ferias_gozados || 0)),
          elegivel: false,
          meses_trabalhados: 0,
          mensagem: "É necessário informar a data de entrada para calcular o direito a férias."
        };
      }
    }

    return NextResponse.json({ pedidos, saldo: informacaoSaldo }, { status: 200 });
  } catch (error: unknown) {
    const mensagemErro = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagemErro }, { status: 500 });
  }
}

// 2. ATUALIZAR ESTADO (Aprovar / Reprovar) E DEDUZIR DIAS DO SALDO
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { data: perfilDecisor } = await supabase
      .from('usuarios')
      .select('role')
      .eq('id_usuario', user.id)
      .maybeSingle();
    if (perfilDecisor?.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem decidir pedidos de férias' }, { status: 403 });
    }

    const body = await request.json();
    const { id_ferias, novo_estado } = body;

    const { data: pedidoOriginal } = await supabase
      .from('ferias')
      .select('colaborador_id, data_inicio, data_fim, estado_ferias, colaboradores(usuario_id, nome)')
      .eq('id_ferias', id_ferias)
      .single();

    if (!pedidoOriginal) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });

    if (pedidoOriginal.estado_ferias !== 'pendente') {
      return NextResponse.json({ error: 'Este pedido já foi decidido' }, { status: 400 });
    }

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

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    if (novo_estado === 'aprovado') {
      const diasSolicitados = diasUteis(
        pedidoOriginal.data_inicio,
        pedidoOriginal.data_fim,
      );

      const { data: colab } = await supabase
        .from('colaboradores')
        .select('dias_ferias_gozados')
        .eq('id_colaborador', pedidoOriginal.colaborador_id)
        .single();

      if (colab) {
        await supabase
          .from('colaboradores')
          .update({ dias_ferias_gozados: colab.dias_ferias_gozados + diasSolicitados })
          .eq('id_colaborador', pedidoOriginal.colaborador_id);
      }
    }

    // 🟢 CORRIGIDO: Tipagem estrita baseada na Interface criada, livre de explicit-any
    const colaborador = pedidoOriginal.colaboradores as unknown as ColaboradorNotificacao | null;
    if (colaborador?.usuario_id) {
      const estadoFormatado = novo_estado === 'aprovado' ? 'aprovado' : 'rejeitado';
      await criarNotificacoes(
        supabase,
        [colaborador.usuario_id],
        `Pedido de férias ${estadoFormatado}`,
        `O seu pedido de férias foi ${estadoFormatado}.`,
      );
    }

    return NextResponse.json({ message: 'Pedido updated!', pedido: atualizado }, { status: 200 });
  } catch (error: unknown) {
    const mensagemErro = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: mensagemErro }, { status: 500 });
  }
}

// 3. SUBMETER NOVO PEDIDO COM VALIDAÇÃO RÍGIDA DE ELEGIBILIDADE E SALDO
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await request.json();
    const { data_inicio, data_fim } = body;

    if (!data_inicio || !data_fim) {
      return NextResponse.json({ error: 'As datas de início e fim são obrigatórias' }, { status: 400 });
    }

    const dataInicioPura = String(data_inicio).split('T')[0];
    const dataFimPura = String(data_fim).split('T')[0];
    const formatoData = /^\d{4}-\d{2}-\d{2}$/;
    if (!formatoData.test(dataInicioPura) || !formatoData.test(dataFimPura)) {
      return NextResponse.json({ error: 'Formato de data inválido' }, { status: 400 });
    }

    const hoje = dataLocal(new Date());
    if (dataInicioPura < hoje || dataFimPura < hoje) {
      return NextResponse.json({ error: 'Não é possível solicitar férias em datas passadas' }, { status: 400 });
    }

    if (dataFimPura < dataInicioPura) {
      return NextResponse.json({ error: 'A data de fim não pode ser anterior à data de início' }, { status: 400 });
    }

    const { data: colabEncontrado, error: colabError } = await supabase
      .from('colaboradores')
      .select('id_colaborador, data_entrada, dias_ferias_gozados')
      .eq('usuario_id', user.id)
      .maybeSingle();
    let colab = colabEncontrado;

    if (colabError) {
      return NextResponse.json({ error: `Erro ao procurar o perfil de colaborador: ${colabError.message}` }, { status: 500 });
    }

    if (!colab) {
      const { data: perfilAuth } = await supabase.auth.getUser();
      const { data: novoColaborador, error: criarPerfilError } = await supabaseAdmin
        .from('colaboradores')
        .insert({
          usuario_id: user.id,
          nome: perfilAuth.user?.user_metadata?.nome || user.email || 'Colaborador',
          cargo: null,
          departamento: 'Area Administrativa',
          data_entrada: null,
          estado: 'ACTIVO',
          dias_ferias_gozados: 0,
        })
        .select('id_colaborador, data_entrada, dias_ferias_gozados')
        .single();

      if (criarPerfilError || !novoColaborador) {
        return NextResponse.json({ error: 'Não foi possível criar o perfil de colaborador para este utilizador.' }, { status: 500 });
      }

      colab = novoColaborador;
    }

    if (!colab.data_entrada) {
      return NextResponse.json({ error: 'A data de entrada do colaborador não está preenchida.' }, { status: 400 });
    }

    const meses = mesesCompletos(colab.data_entrada);
    if (meses < 6) {
      return NextResponse.json({ error: `Ainda não reúne as condições para solicitar férias (${meses} meses completos; mínimo de 6).` }, { status: 400 });
    }

    const diasSolicitados = diasUteis(dataInicioPura, dataFimPura);
    if (diasSolicitados <= 0) {
      return NextResponse.json({ error: 'O período selecionado não contém dias úteis.' }, { status: 400 });
    }

    const { data: pedidosExistentes, error: pedidosError } = await supabase
      .from('ferias')
      .select('data_inicio, data_fim, estado_ferias')
      .eq('colaborador_id', colab.id_colaborador)
      .in('estado_ferias', ['aprovado', 'pendente']);

    if (pedidosError) return NextResponse.json({ error: pedidosError.message }, { status: 500 });

    const existeConflito = (pedidosExistentes || []).some((pedido) =>
      pedido.data_inicio <= dataFimPura && pedido.data_fim >= dataInicioPura
    );
    if (existeConflito) {
      return NextResponse.json({ error: 'Já existe um pedido de férias aprovado ou pendente neste período.' }, { status: 400 });
    }

    const diasGozados = (pedidosExistentes || [])
      .filter((pedido) => pedido.estado_ferias === 'aprovado')
      .reduce((total, pedido) => total + diasUteis(pedido.data_inicio, pedido.data_fim), 0);
    const diasPendentes = (pedidosExistentes || [])
      .filter((pedido) => pedido.estado_ferias === 'pendente')
      .reduce((total, pedido) => total + diasUteis(pedido.data_inicio, pedido.data_fim), 0);
    const diasTotaisDireito = direitoAnual(meses);
    const saldoDisponivel = diasTotaisDireito - diasGozados - diasPendentes;

    if (diasSolicitados > saldoDisponivel) {
      return NextResponse.json({ error: `O saldo de férias é insuficiente para este período.` }, { status: 400 });
    }

    // 🟢 CORRIGIDO: Removida a linha duplicada que quebrava o compilador do Supabase
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

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

    const { data: administradores } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('role', 'admin');

    await criarNotificacoes(
      supabase,
      (administradores || []).map((adm) => adm.id_usuario),
      'Novo pedido de férias',
      'Existe um novo pedido de férias aguardando decisão.',
    );

    return NextResponse.json({ message: 'Pedido enviado com sucesso!', pedido: novoPedido }, { status: 200 });

  } catch (error: unknown) {
    const mensagemErro = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: mensagemErro }, { status: 500 });
  }
}
