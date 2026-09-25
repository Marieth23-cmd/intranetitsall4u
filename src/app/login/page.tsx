"use client";
import { createClient } from "../../../lib/supabase/client";
import Image from "next/image";
import React, { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEyeOff ,FiEye } from "react-icons/fi";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
 
  const [manterSessao, setManterSessao] = useState(false);
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [aviso, setAviso] = useState("");
  const [carregando ,setCarregando ] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false);
const [emailRecuperacao, setEmailRecuperacao] = useState("");
const [contadorTempo, setContadorTempo] = useState(0);
const [enviandoLink, setEnviandoLink] = useState(false);
const [recuperacaoAberta, setRecuperacaoAberta] = useState(false);

// Controla o cronómetro regressivo de 60 segundos
useEffect(() => {
  if (contadorTempo > 0) {
    const timer = setTimeout(() => setContadorTempo(contadorTempo - 1), 1000);
    return () => clearTimeout(timer);
  }
}, [contadorTempo]);

async function enviarEmailRecuperacao(e: React.FormEvent) {
  e.preventDefault();
  
  if (contadorTempo > 0) return; // Bloqueia se o tempo de espera estiver ativo

  try {
    setEnviandoLink(true);
    const supabase = createClient();

    // 🟢 Dispara o link mágico. O redirectTo é a página especial que vai criar no passo abaixo!
    const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperacao, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      toast.error(`Erro: ${error.message}`);
      return;
    }

    toast.success("Link de recuperação enviado! Verifique a sua caixa de entrada.");
    setContadorTempo(60); // 🔒 ATIVA A TRAVA: Botão fica bloqueado por 60 segundos
  } catch (error) {
    toast.error("Erro inesperado." );
    console.log(error)
  } finally {
    setEnviandoLink(false);
  }
}



 async function entrar(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  // 1. Validação visual básica (Sua lógica excelente original)
  const novosErros: { email?: string; senha?: string } = {};
  const emailNormalizado = email.trim();
  if (!/^\S+@\S+\.\S+$/.test(emailNormalizado)) novosErros.email = "Introduza um email válido.";
  if (senha.length < 6) novosErros.senha = "A senha deve ter pelo menos 6 caracteres.";

  setErros(novosErros);
  if (Object.keys(novosErros).length > 0) return;

  try {
    setCarregando(true);
    setAviso(""); 
    
    const supabase = createClient();

    // 2. Tenta fazer a autenticação no Supabase Auth
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: emailNormalizado,
      password: senha,
    });

    if (error) {
      setAviso(`Erro ao entrar: ${error.message}`);
      return;
    }

    const usuarioAutenticado = authData.user;
    if (!usuarioAutenticado) return;

    // 🔒 3. TRANCA DE SEGURANÇA CIRÚRGICA: Verifica explicitamente se está DESACTIVADO
    const { data: colab } = await supabase
      .from("colaboradores")
      .select("estado")
      .eq("usuario_id", usuarioAutenticado.id)
      .maybeSingle();

    // 🚨 Só bloqueia se o estado do colaborador estiver explicitamente desativado
    if (colab && String(colab.estado).toUpperCase() === "DESACTIVADO") {
      setAviso("A sua conta foi desativada pelo administrador. Contacte os Recursos Humanos.");
      await supabase.auth.signOut();
      return;
    }

    // 4. Se a conta for válida (ou for Admin), descobre a role e redireciona
    const { data: perfil } = await supabase
      .from("usuarios")
      .select("role")
      .eq("id_usuario", usuarioAutenticado.id)
      .maybeSingle();

    router.replace(perfil?.role === "admin" || perfil?.role === "gestor" ? "/admin" : "/");
    router.refresh();

  } catch (erro) {
    console.error("Erro inesperado no login:", erro);
    setAviso("Ocorreu um erro inesperado. Tente novamente.");
  } finally {
    setCarregando(false);
  }
}

  

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[#050505]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-[#202020] [clip-path:polygon(0_38%,100%_0,100%_100%,0_100%)]" />

      <section className="relative w-full max-w-sm rounded-2xl bg-white px-7 py-8 shadow-xl sm:px-9 sm:py-10">
        <div className="flex justify-center">
          <Image
            src="https://res.cloudinary.com/dhpa1juyr/image/upload/v1787046512/logo_oi1w5w.png"
            alt="Itsall4u"
            width={132}
            height={60}
            priority
            className="h-auto w-32 object-contain"
          />
        </div>

        <div className="mt-7 text-center">
         
          <p className="mt-1 text-sm text-gray-500">Entre para aceder à intranet.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={entrar} noValidate>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              autoComplete="email"
              className={`w-full border-b bg-transparent px-0 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-black ${erros.email ? "border-red-500" : "border-gray-300"}`}
            />
            {erros.email && <p className="mt-2 text-xs text-red-600">{erros.email}</p>}
          </div>

         
            <div className="relative">
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Senha"
                autoComplete="current-password"
                className={`w-full border-b bg-transparent px-0 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-black ${erros.senha ? "border-red-500" : "border-gray-300"}`}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {mostrarSenha ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            
            {erros.senha && <p className="mt-2 text-xs text-red-600">{erros.senha}</p>}
          

          <div className="flex items-center justify-between gap-3 text-xs">
            <label className="flex cursor-pointer items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={manterSessao}
                onChange={(event) => setManterSessao(event.target.checked)}
                className="h-4 w-4 accent-black"
              />
              Manter sessão aberta
            </label>
            <button type="button" onClick={() => setRecuperacaoAberta(true)} className="font-medium text-gray-900 hover:underline">
              Esqueceu a senha?
            </button>
          </div>

          {aviso && <p role="status" className="rounded-lg bg-gray-100 p-3 text-center text-xs text-red-600">{aviso}</p>}
      
        <div className="flex flex-col gap-2">
          <button 
          disabled={carregando}
          type="submit"
          className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50">
            {carregando? "A autenticar ...":"Entrar"}
          </button>


          </div>
        </form>

        {recuperacaoAberta && (
          <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Recuperar palavra-passe</h2>
                <p className="mt-1 text-xs text-gray-500">Enviaremos um link para o seu email.</p>
              </div>
              <button
                type="button"
                onClick={() => setRecuperacaoAberta(false)}
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={enviarEmailRecuperacao} className="mt-3 space-y-3">
              <input
                type="email"
                required
                value={emailRecuperacao}
                onChange={(event) => setEmailRecuperacao(event.target.value)}
                placeholder="Email da conta"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
              />
              <button
                type="submit"
                disabled={enviandoLink || contadorTempo > 0}
                className="w-full rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enviandoLink
                  ? "A enviar..."
                  : contadorTempo > 0
                    ? `Aguarde ${contadorTempo}s`
                    : "Enviar link de recuperação"}
              </button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
