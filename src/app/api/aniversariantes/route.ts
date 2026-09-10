import { createClient } from "../../../../lib/supabase/server";
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Puxa todos os colaboradores ativos com a sua data de nascimento
    const { data: colaboradores, error } = await supabase
      .from('colaboradores')
      .select('id_colaborador, nome, data_nascimento')
      .eq('estado', 'ACTIVO');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ aniversariantes: colaboradores || [] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
