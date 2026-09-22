import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '../../../../lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const departamentosPermitidos = ['Audiovisual', 'Informática /Ti', 'Area Administrativa'] as const;

function dataHojeLocal() {
  const hoje = new Date();
  return [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, '0'),
    String(hoje.getDate()).padStart(2, '0'),
  ].join('-');
}

function dataValida(data: unknown) {
  if (typeof data !== 'string') return false;
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  if (!partes) return false;

  const dataConvertida = new Date(Date.UTC(
    Number(partes[1]),
    Number(partes[2]) - 1,
    Number(partes[3]),
  ));

  return dataConvertida.getUTCFullYear() === Number(partes[1])
    && dataConvertida.getUTCMonth() === Number(partes[2]) - 1
    && dataConvertida.getUTCDate() === Number(partes[3]);
}

// Inicializa o cliente mestre para criar usuários no Auth
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabaseComum = await createClient(cookieStore);

  // 1. Protege a área de colaboradores para administradores e gestores.
  const { data: { user } } = await supabaseComum.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: perfilAdmin } = await supabaseComum
    .from('usuarios')
    .select('role')
    .eq('id_usuario', user.id)
    .single();

  if (perfilAdmin?.role !== 'admin' && perfilAdmin?.role !== 'gestor') {
    return NextResponse.json({ error: 'Acesso restrito para administradores e gestores' }, { status: 403 });
  }

  // 2. CAPTURA DOS DADOS COMPLETOS DO FORMULÁRIO
  const body = await request.json();
  const { 
    email, 
    senha, 
    nome, 
    role,
    cargo,          
    departamento,
    data_nascimento,
    data_entrada    
  } = body;
  
  const roleFormatada = (role || 'colaborador').toLowerCase();

  if (perfilAdmin.role === 'gestor' && roleFormatada !== 'colaborador') {
    return NextResponse.json({ error: 'Gestores só podem criar colaboradores' }, { status: 403 });
  }

  if (!departamentosPermitidos.includes(departamento)) {
    return NextResponse.json({ error: 'Selecione um departamento válido' }, { status: 400 });
  }

  if (data_nascimento && !dataValida(data_nascimento)) {
    return NextResponse.json({ error: 'A data de nascimento é inválida' }, { status: 400 });
  }

  if (data_entrada && !dataValida(data_entrada)) {
    return NextResponse.json({ error: 'A data de entrada é inválida' }, { status: 400 });
  }

  const hoje = dataHojeLocal();
  if (data_nascimento > hoje) {
    return NextResponse.json({ error: 'A data de nascimento não pode ser futura' }, { status: 400 });
  }

  if (data_entrada > hoje) {
    return NextResponse.json({ error: 'A data de entrada não pode ser futura' }, { status: 400 });
  }

  if (data_nascimento && data_entrada && data_entrada < data_nascimento) {
    return NextResponse.json({ error: 'A data de entrada não pode ser anterior à data de nascimento' }, { status: 400 });
  }

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

    // 5. PASSO 3: Gestores também são colaboradores para férias, faltas e perfil.
    if (roleFormatada === 'colaborador' || roleFormatada === 'gestor') {
      const { error: colabTableError } = await supabaseAdmin
        .from('colaboradores')
        .insert([
          {
            usuario_id: novoUserId,
            nome: nome || 'Novo Funcionário',
            cargo: cargo || null,                     
            departamento,
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

  const { data: perfil } = await supabaseComum
    .from('usuarios')
    .select('role')
    .eq('id_usuario', user.id)
    .single();

  if (perfil?.role !== 'admin' && perfil?.role !== 'gestor') {
    return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 });
  }

  const { data: colaboradores, error } = await supabaseComum
    .from('colaboradores')
    .select(`
      id_colaborador,
      nome,
      cargo,
      departamento,
      estado,
      data_nascimento,
      usuarios ( email )
    `)
    .eq('estado' , 'ACTIVO');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ colaboradores }, { status: 200 });
}
