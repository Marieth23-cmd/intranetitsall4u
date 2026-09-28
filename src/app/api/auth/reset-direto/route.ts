import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, novaSenha } = await request.json();

    if (!email || !novaSenha) {
      return NextResponse.json({ erro: "Campos obrigatórios em falta." }, { status: 400 });
    }

    // Inicializa o Supabase no Servidor com a chave mestra (Service Role)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 1. Procura o utilizador pelo e-mail na lista interna do Supabase Auth
    const { data: dataUsuarios, error: erroBusca } = await supabaseAdmin.auth.admin.listUsers();
    
    if (erroBusca) {
      return NextResponse.json({ erro: "Erro ao aceder ao controlo de acessos corporativo." }, { status: 500 });
    }

    const usuarioAlvo = dataUsuarios.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!usuarioAlvo) {
      return NextResponse.json({ erro: "Este e-mail não foi encontrado no sistema." }, { status: 404 });
    }

    // 2. Altera a senha do utilizador diretamente usando super-poderes de Admin (sem precisar de e-mail)
    const { error: erroAtualizacao } = await supabaseAdmin.auth.admin.updateUserById(
      usuarioAlvo.id,
      { password: novaSenha }
    );

    if (erroAtualizacao) {
      return NextResponse.json({ erro: erroAtualizacao.message }, { status: 400 });
    }

    return NextResponse.json({ sucesso: true }, { status: 200 });

  } catch (erro) {
    console.error("Erro crítico na API de reset:", erro);
    return NextResponse.json({ erro: "Erro interno no servidor do Next.js." }, { status: 500 });
  }
}
