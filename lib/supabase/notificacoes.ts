import { createClient as createServiceClient } from "@supabase/supabase-js";

type ClienteSupabase = {
  from: (tabela: string) => {
    insert: (registos: Array<Record<string, unknown>>) => PromiseLike<{ error: { message: string } | null }>;
  };
};

export async function criarNotificacoes(
  supabase: ClienteSupabase,
  destinatarios: string[],
  titulo: string,
  mensagem: string,
) {
  if (destinatarios.length === 0) return;

  const clienteNotificacoes = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
    : supabase;

  const { error } = await clienteNotificacoes.from("notificacoes").insert(
    destinatarios.map((usuarioId) => ({
      usuario_id: usuarioId,
      titulo,
      mensagem,
      lida: false,
    })),
  );

  if (error) {
    console.error("Erro ao criar notificações:", error.message);
  }
}