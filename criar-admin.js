// Usamos a biblioteca comum do supabase para rodar via terminal
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carrega as suas variáveis de ambiente do Next.js
dotenv.config({ path: '.env.local' })
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY 

if (!supabaseServiceKey) {
  console.error("❌ Erro: SUPABASE_SERVICE_ROLE_KEY não encontrada no seu .env.local")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function scriptCriarAdmin() {
  console.log("⏳ Tentando criar o administrador do sistema...")

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@itsall4u.com", 
    password: "itsall4u", 
    email_confirm: true,         
    user_metadata: {
      nome: "Administrador Geral",
      role: "admin"             
    }
  })

  if (error) {
    console.error("❌ Erro ao criar o administrador:", error.message)
  } else {
    console.log("✅ Administrador criado com sucesso absoluto!")
    console.log(`Email: ${data.user.email}`)
    console.log(`ID do Usuário: ${data.user.id}`)
    console.log("Sua TRIGGER do PostgreSQL já deve ter criado o perfil nas tabelas públicas.")
  }
}

scriptCriarAdmin()
