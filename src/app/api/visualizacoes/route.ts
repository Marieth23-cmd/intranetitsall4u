import { createClient } from "../../../../lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

async function verificarAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };

  const { data: perfil, error } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id_usuario", user.id)
    .maybeSingle();

  if (error || (perfil?.role !== "admin" && perfil?.role !== "gestor")) {
    return { user: null, error: NextResponse.json({ error: "Acesso restrito para administradores e gestores" }, { status: 403 }) };
  }

  return { user, error: null };
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const acesso = await verificarAdmin(supabase);
  if (acesso.error) return acesso.error;

  const idComunicado = new URL(request.url).searchParams.get("id_comunicado");
  if (!idComunicado) {
    return NextResponse.json({ error: "O id do comunicado é obrigatório" }, { status: 400 });
  }

  const { data: leitores, error } = await supabase
    .from("visualizacoes_comunicados")
    .select("data_visualizacao, colaboradores(nome, cargo)")
    .eq("comunicado_id", idComunicado)
    .order("data_visualizacao", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leitores: leitores || [] });
}



export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore); 

    // 1. Descobre quem é o utilizador logado no servidor
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("role")
      .eq("id_usuario", user.id)
      .maybeSingle();

    // O admin não deve ser contado como leitor de comunicados.
    const role = perfil?.role || user.user_metadata?.role;
    if (role === "admin") {
      return NextResponse.json({ message: "Admin visualizou (ignorado registo em tabela)" }, { status: 200 });
    }

    // Captura o id do comunicado enviado pelo front-end
    const body = await request.json();
    const { id_comunicado } = body; 

    if (!id_comunicado) {
      return NextResponse.json({ error: "O id do comunicado é obrigatório" }, { status: 400 });
    }

    // O perfil pode faltar em contas antigas criadas diretamente no Auth.
    let colab;
    const { data: colabInicial, error: colabError } = await supabase
      .from("colaboradores")
      .select("id_colaborador")
      .eq("usuario_id", user.id)
      .maybeSingle();

    colab = colabInicial;

    if (colabError) {
      console.error("Erro ao buscar perfil de colaborador:", colabError);
      return NextResponse.json({ error: colabError.message }, { status: 500 });
    }

    if (!colab) {
      const { data: novoColaborador, error: criarColaboradorError } = await supabase
        .from("colaboradores")
        .insert({
          usuario_id: user.id,
          nome: user.user_metadata?.nome || user.email || "Colaborador",
          estado: "ACTIVO",
        })
        .select("id_colaborador")
        .single();

      if (criarColaboradorError) {
        if (criarColaboradorError.code === "23505") {
          const { data: colaboradorExistente, error: buscarColaboradorError } = await supabase
            .from("colaboradores")
            .select("id_colaborador")
            .eq("usuario_id", user.id)
            .single();

          if (!buscarColaboradorError && colaboradorExistente) {
            colab = colaboradorExistente;
          } else {
            console.error("Erro ao recuperar perfil de colaborador após conflito:", buscarColaboradorError);
            return NextResponse.json(
              { error: "Perfil de colaborador não encontrado no sistema" },
              { status: 422 }
            );
          }
        } else {
          console.error("Erro ao criar perfil de colaborador:", criarColaboradorError);
          return NextResponse.json(
            { error: `Perfil de colaborador não encontrado: ${criarColaboradorError.message}` },
            { status: 422 }
          );
        }
      }

      if (novoColaborador) {
        colab = novoColaborador;
      }
    }

    if (!colab) {
      return NextResponse.json(
        { error: "Perfil de colaborador não encontrado no sistema" },
        { status: 422 }
      );
    }

    // 3. Insere o registo de leitura do colaborador real
    const { error: upsertError } = await supabase
      .from("visualizacoes_comunicados")
      .upsert({
        comunicado_id: id_comunicado,
        colaborador_id: colab.id_colaborador
      }, { onConflict: 'comunicado_id,colaborador_id' });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Visualização registada com sucesso!" }, { status: 200 });

  } catch (error) {
    console.error("Erro ao registar visualização:", error);
    return NextResponse.json({ error: `Erro interno` }, { status: 500 });
  }
}
