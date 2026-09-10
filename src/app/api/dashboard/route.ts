import { createClient } from "../../../../lib/supabase/server";
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // 1. Conta o total de colaboradores cadastrados
    const { count: totalColaboradores, error: err1 } = await supabase
      .from('colaboradores')
      .select('*', { count: 'exact', head: true })
      .eq('estado','ACTIVO');

    // 2. Conta o total de clientes cadastrados
    const { count: totalClientes, error: err2 } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });

    // 3. Conta o total de projetos feitos
    const { data: projetos, error: err3 } = await supabase
      .from('clientes')
      .select('projetos');

    const totalProjetos = (projetos || []).reduce(
      (total, cliente) => total + (Number(cliente.projetos) || 0),
      0
    );

    const totalDocumentos = 0; 

    if (err1 || err2 || err3) {
      console.error("Erro nas estatísticas:", { err1, err2, err3 });
      return NextResponse.json({ error: "Erro ao calcular contadores do banco" }, { status: 500 });
    }

    return NextResponse.json({
      colaboradores: totalColaboradores || 0,
      clientes: totalClientes || 0,
      projetos: totalProjetos || 0,
      documentos: totalDocumentos
    }, { status: 200 });

  } catch (error) {
    console.error('Erro no dashboard:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
