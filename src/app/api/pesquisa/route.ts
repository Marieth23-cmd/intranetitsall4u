import { createClient } from "../../../../lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ResultadoPesquisa = {
  id: string | number;
  titulo: string;
  tipo: "Colaborador" | "Cliente" | "Comunicado";
  detalhe: string;
  caminho: string;
};

type Role = "admin" | "colaborador";

export async function GET(request: Request) {
  const termo = new URL(request.url).searchParams.get("termo")?.trim();

  if (!termo) {
    return NextResponse.json({ resultados: [] }, { status: 200 });
  }

  try {
    const supabase = await createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const role: Role = user.user_metadata?.role === "admin"
      ? "admin"
      : "colaborador";
    const pesquisa = `%${termo}%`;

    const [clientes, comunicados] = await Promise.all([
        supabase
        .from("clientes")
        .select("id_cliente, nome, area")
        .or(`nome.ilike.${pesquisa},area.ilike.${pesquisa}`)
        .limit(5),
      supabase
        .from("comunicados")
        .select("id_comunicados, titulo, local")
        .or(`titulo.ilike.${pesquisa},descricao.ilike.${pesquisa}`)
        .limit(5),
    ]);

    let colaboradores = { data: null as { id_colaborador: string; nome: string; cargo: string | null }[] | null, error: null as { message: string } | null };

    if (role === "admin") {
      colaboradores = await supabase
        .from("colaboradores")
        .select("id_colaborador, nome, cargo")
        .or(`nome.ilike.${pesquisa},cargo.ilike.${pesquisa}`)
        .eq("estado", "ACTIVO")
        .limit(5);
    }

    const erro = colaboradores.error || clientes.error || comunicados.error;
    if (erro) {
      return NextResponse.json({ error: erro.message }, { status: 500 });
    }

    const resultados: ResultadoPesquisa[] = [
      ...(colaboradores.data || []).map((item) => ({
        id: item.id_colaborador,
        titulo: item.nome,
        tipo: "Colaborador" as const,
        detalhe: item.cargo || "Sem cargo definido",
        caminho: "/admin/colaboradores",
      })),
      ...(clientes.data || []).map((item) => ({
        id: item.id_cliente,
        titulo: item.nome,
        tipo: "Cliente" as const,
        detalhe: item.area || "Sem área definida",
        caminho: role === "admin" ? "/admin/clientes" : "/clientes",
      })),
      ...(comunicados.data || []).map((item) => ({
        id: item.id_comunicados,
        titulo: item.titulo,
        tipo: "Comunicado" as const,
        detalhe: item.local || "Geral",
        caminho: role === "admin" ? "/admin/comunicados" : "/comunicados",
      })),
    ];

    return NextResponse.json({ resultados }, { status: 200 });
  } catch (error) {
    console.error("Erro na pesquisa geral:", error);
    return NextResponse.json({ error: "Erro interno na pesquisa" }, { status: 500 });
  }
}
