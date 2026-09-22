import { createClient } from '../../../../lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type PermissoesBody = {
  usuario_id?: string;
  nova_role?: 'gestor' | 'colaborador';
};

function obterMensagemErro(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}

// 🟢 GET: Traz todos os colaboradores e cruza com a role real deles na tabela usuarios
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('role')
      .eq('id_usuario', user.id)
      .single();

    if (perfil?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito para administradores' }, { status: 403 });
    }

    const { data: lista, error } = await supabase
      .from('colaboradores')
      .select(`
        id_colaborador,
        nome,
        cargo,
        usuario_id
      `)
      .eq('estado', 'ACTIVO')
      .order('nome', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const usuarioIds = (lista ?? [])
      .map((item) => item.usuario_id)
      .filter((id): id is string => Boolean(id));

    const { data: usuarios, error: usuariosError } = usuarioIds.length > 0
      ? await supabase
        .from('usuarios')
        .select('id_usuario, role')
        .in('id_usuario', usuarioIds)
      : { data: [], error: null };

    if (usuariosError) return NextResponse.json({ error: usuariosError.message }, { status: 500 });

    const rolesPorUsuario = new Map(
      (usuarios ?? []).map((usuario) => [usuario.id_usuario, usuario.role])
    );
    
    // Formata a resposta para facilitar o mapeamento no front-end
    const colaboradoresFormatados = lista?.map((item) => ({
      id_colaborador: item.id_colaborador,
      nome: item.nome,
      cargo: item.cargo,
      usuario_id: item.usuario_id,
      role: rolesPorUsuario.get(item.usuario_id) === 'gestor' ? 'gestor' : 'colaborador'
    })) || [];

    return NextResponse.json({ colaboradores: colaboradoresFormatados }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: obterMensagemErro(error) }, { status: 500 });
  }
}

// 🟢 PATCH: Atualiza a role do usuário (Torna gestor ou remove para colaborador)
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('role')
      .eq('id_usuario', user.id)
      .single();

    if (perfil?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito para administradores' }, { status: 403 });
    }

    const body: PermissoesBody = await request.json();
    const { usuario_id, nova_role } = body; // nova_role deve ser 'gestor' ou 'colaborador'

    if (!usuario_id || (nova_role !== 'gestor' && nova_role !== 'colaborador')) {
      return NextResponse.json({ error: 'Dados em falta' }, { status: 400 });
    }

    const { error } = await supabase
      .from('usuarios')
      .update({ role: nova_role })
      .eq('id_usuario', usuario_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    
    return NextResponse.json({ message: 'Acesso atualizado com sucesso!' }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: obterMensagemErro(error) }, { status: 500 });
  }
}
