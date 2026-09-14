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

  if (error || perfil?.role !== "admin") {
    return { user: null, error: NextResponse.json({ error: "Acesso restrito para administradores" }, { status: 403 }) };
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
    const supabase = await createClient(cookieStore); // 🟢 CORRIGIDO: Cookies passados corretamente

    // 1. Descobre quem é o utilizador logado no servidor
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Captura o id do comunicado enviado pelo front-end
    const body = await request.json();
    const { id_comunicado } = body; // 🟢 Espera uma string (UUID)

    if (!id_comunicado) {
      return NextResponse.json({ error: "O id do comunicado é obrigatório" }, { status: 400 });
    }

    // 2. Busca o id_colaborador da tabela colaboradores usando o id do Auth
    const { data: colab, error: colabError } = await supabase
      .from("colaboradores")
      .select("id_colaborador")
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (colabError || !colab) {
      console.error("Perfil de colaborador não encontrado:", colabError);
      return NextResponse.json({ error: "Perfil de colaborador não encontrado" }, { status: 422 });
    }

    // 3. Insere o registo de leitura (se já existir, o conflito ignora)
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
