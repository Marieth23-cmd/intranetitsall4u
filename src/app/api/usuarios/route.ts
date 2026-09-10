import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '../../../../lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Inicializa o cliente mestre para criar usuários no Auth
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabaseComum = await createClient(cookieStore);

  // 1. PROTEÇÃO DE ROTA - VERIFICA SE QUEM ESTÁ OPERANDO É ADMIN
  const { data: { user } } = await supabaseComum.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: perfilAdmin } = await supabaseComum
    .from('usuarios')
    .select('role')
    .eq('id_usuario', user.id)
    .single();

  if (perfilAdmin?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso restrito para administradores' }, { status: 403 });
  }

  // 2. CAPTURA DOS DADOS COMPLETOS DO FORMULÁRIO
  const body = await request.json();
  const { 
    email, 
    senha, 
    nome, 
    role,
    cargo,          
    data_nascimento,
    data_entrada    
  } = body;
  
  const roleFormatada = (role || 'colaborador').toLowerCase();

  try {
    // 3. PASSO 1: Criar o usuário no Autenticador do Supabase (Guarda os metadados base)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome, role: roleFormatada }
    });

    if (authError) {
      console.error("❌ Erro no Supabase Auth:", authError.message);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const novoUserId = authData.user.id;

    // 4. PASSO 2: Inserir os dados na sua tabela public.usuarios
    const { error: userTableError } = await supabaseAdmin
      .from('usuarios')
      .insert([
        {
          id_usuario: novoUserId,
          email,
          role: roleFormatada,
          ativo: true
        }
      ]);

    if (userTableError) {
      console.error("❌ Erro ao salvar na tabela public.usuarios:", userTableError.message);
      return NextResponse.json({ error: `Erro no perfil público: ${userTableError.message}` }, { status: 500 });
    }

    // 5. PASSO 3: Se for colaborador, criar o perfil COMPLETO com todas as colunas
    if (roleFormatada === 'colaborador') {
      const { error: colabTableError } = await supabaseAdmin
        .from('colaboradores')
        .insert([
          {
            usuario_id: novoUserId,
            nome: nome || 'Novo Funcionário',
            cargo: cargo || null,                     
            data_nascimento: data_nascimento || null, 
            data_entrada: data_entrada || null,       
            estado: 'ACTIVO' 
          }
        ]);

      if (colabTableError) {
        console.error("Erro ao salvar na tabela public.colaboradores:", colabTableError.message);
        return NextResponse.json({ error: `Erro na tabela de colaboradores: ${colabTableError.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Usuário e Perfil criados com sucesso absoluto!' }, { status: 200 });

  } catch (error) {
    console.error("Erro inesperado na API:", error);
    return NextResponse.json({ error: 'Erro interno ao processar cadastro' }, { status: 500 });
  }
}



export async function GET() {
  const cookieStore = await cookies();
  const supabaseComum = await createClient(cookieStore);

  const { data: { user } } = await supabaseComum.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: colaboradores, error } = await supabaseComum
    .from('colaboradores')
    .select(`
      id_colaborador,
      nome,
      cargo,
      estado,
      data_nascimento,
      usuarios ( email )
    `)
    .eq('estado' , 'ACTIVO');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ colaboradores }, { status: 200 });
}
