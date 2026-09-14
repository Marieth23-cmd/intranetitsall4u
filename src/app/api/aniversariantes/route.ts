import { createClient } from "../../../../lib/supabase/server";
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // A foto e opcional: a lista de aniversarios nao pode deixar de carregar
    // caso a coluna ainda nao exista no schema do Supabase.
    const { data: colaboradores, error } = await supabase
      .from('colaboradores')
      .select('id_colaborador, nome, data_nascimento, foto_url')
      .eq('estado', 'ACTIVO');

    if (error) {
      const { data: colaboradoresSemFoto, error: erroFallback } = await supabase
        .from('colaboradores')
        .select('id_colaborador, nome, data_nascimento')
        .eq('estado', 'ACTIVO');

      if (erroFallback) {
        return NextResponse.json({ error: erroFallback.message }, { status: 500 });
      }

      return NextResponse.json({ aniversariantes: colaboradoresSemFoto || [] }, { status: 200 });
    }

    return NextResponse.json({ aniversariantes: colaboradores || [] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
