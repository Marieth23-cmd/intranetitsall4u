import { createClient } from "../../../../lib/supabase/server";
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';



export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);


    const { data: config, error } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error('Erro no GET de configurações:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);


    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // B. VERIFICAÇÃO DE PERMISSÃO: Confirma se quem opera é um Admin
    const { data: perfilAdmin } = await supabase
      .from('usuarios')
      .select('role')
      .eq('id_usuario', user.id)
      .single();

    if (perfilAdmin?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito para administradores' }, { status: 403 });
    }

    
    const body = await request.json();
    const { nome_empresa, email_corporativo, idioma, localizacao, fuso_horario, nif_empresa } = body;

    // D. GRAVAÇÃO NO BANCO (Usa upsert travado no id: 1)
    const { data: atualizado, error: upsertError } = await supabase
      .from('configuracoes')
      .upsert({
        id: 1, // Garante que a linha alterada seja estritamente a linha única corporativa
        nome_empresa,
        email_corporativo,
        idioma,
        localizacao,
        fuso_horario, // O Supabase valida automaticamente contra as opções do seu ENUM
        nif_empresa: nif_empresa ? String(nif_empresa).trim() : null // Salva como string pura para respeitar a Regex de 10 dígitos
      })
      .select()
      .single();

    if (upsertError) {
      // Se a Regex falhar (ex: menos de 10 dígitos), o PostgreSQL rejeita e o erro cai aqui
      console.error('Erro ao atualizar configurações:', upsertError.message);
      return NextResponse.json({ error: `Erro no banco: ${upsertError.message}` }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Definições institucionais guardadas com sucesso!', 
      dados: atualizado 
    }, { status: 200 });

  } catch (error) {
    console.error('Erro no POST de configurações:', error);
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
  }
}
