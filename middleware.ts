import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Inicializa o Supabase no Middleware para intercetar os cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options }))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set({ name, value, ...options }))
        },
      },
    }
  )

  // 2. Recupera o utilizador autenticado a partir dos cookies
  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()
  const solicitandoLogin = url.pathname.startsWith('/login')

  // REGRA 1: Se NÃO está logado e tenta navegar nas páginas -> Expulsa para o /login
  if (!user) {
    if (!solicitandoLogin) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return response
  }

  // 3. 🟢 CORREÇÃO DA SEGURANÇA: Lê a role direto dos metadados do token (Sem bater no banco!)
  const usuarioRole = user.user_metadata?.role || 'colaborador'
  const acessandoAreaAdmin = url.pathname.startsWith('/admin')

  // REGRA 2: Se já ESTÁ LOGADO e tenta aceder à página de login -> Redireciona para a sua Home correta
  if (solicitandoLogin) {
    url.pathname = usuarioRole === 'admin' ? '/admin' : '/'
    return NextResponse.redirect(url)
  }

  // REGRA 3: Se for COLABORADOR e tentar forçar a URL escrevendo /admin -> Expulsa de volta para o /
  if (usuarioRole === 'colaborador' && acessandoAreaAdmin) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // REGRA 4: Se for ADMIN e tentar aceder à raiz / -> Força a ficar na área administrativa
  if (usuarioRole === 'admin' && !acessandoAreaAdmin) {
    // Permite que o admin faça chamadas à API, caso contrário bloquearia o carregamento de dados
    if (!url.pathname.startsWith('/api') && url.pathname !== '/favicon.ico') {
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  // Configura cabeçalhos rígidos anti-cache para as setas do navegador
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  return response
}

// Monitoriza todas as páginas internas da sua intranet
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
