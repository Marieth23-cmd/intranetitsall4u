"use client";
import { createClient } from "../../../lib/supabase/client";
import Image from "next/image";
import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { toast } from "sonner";

// Definimos os modos possíveis para o ecrã único
type ModoTela = "login" | "verificar-email" | "redefinir";

export default function LoginPage() {
  const router = useRouter();
  
  // Estados do Login Original
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manterSessao, setManterSessao] = useState(false);
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // 🟢 Novos Estados para o Fluxo Unificado de Redefinição Direta
  const [modo, setModo] = useState<ModoTela>("login");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);

  // 1. Função Original de Login Adaptada
  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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

      const { data: colab } = await supabase
        .from("colaboradores")
        .select("estado")
        .eq("usuario_id", usuarioAutenticado.id)
        .maybeSingle();

      if (colab && String(colab.estado).toUpperCase() === "DESACTIVADO") {
        setAviso("A sua conta foi desativada pelo administrador. Contacte os Recursos Humanos.");
        await supabase.auth.signOut();
        return;
      }

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

  // 🟢 2. Nova Função: Valida se o email existe na tabela corporativa
  async function validarEmailExistente(e: React.FormEvent) {
    e.preventDefault();
    setAviso("");
    
    if (!email.trim()) {
      setErros({ email: "Introduza o seu e-mail de adesão." });
      return;
    }

    try {
      setCarregando(true);
      const supabase = createClient();

      // Procura na tabela pública de utilizadores para validar a existência
      const { data, error } = await supabase
        .from("usuarios")
        .select("id_usuario")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (error || !data) {
        setAviso("O e-mail introduzido não corresponde a nenhuma conta de colaborador.");
        return;
      }

      // Se existir, avança o formulário para o modo de digitação de senha
      setModo("redefinir");
    } catch (err) {
      console.log(err)
      setAviso("Erro ao processar validação. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  // 🟢 3. Nova Função: Envia as novas senhas para a API administrativa encriptada
  async function submeterNovaSenha(e: React.FormEvent) {
    e.preventDefault();
    setAviso("");

    if (novaSenha.length < 6) {
      setAviso("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setAviso("As senhas introduzidas não coincidem.");
      return;
    }

    try {
      setCarregando(true);

      // Chamada cirúrgica para a rota privada API que criámos (Sem usar e-mail!)
      const resposta = await fetch("/api/auth/reset-direto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          novaSenha: novaSenha
        })
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        setAviso(resultado.erro || "Erro interno ao atualizar credenciais.");
        return;
      }

      toast.success("Senha redefinida com sucesso! Inicie sessão agora.");
      
      // Reseta a tela de volta para o login limpo
      setModo("login");
      setSenha("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err) {
      console.log(err)
      setAviso("Erro de conexão ao servidor.");
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
          {/* Título Dinâmico */}
          <h2 className="text-base font-bold text-gray-900">
           
            {modo === "verificar-email" && "Recuperação de Senha"}
            {modo === "redefinir" && "Definir Nova Senha"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {modo === "login" && "Entre para aceder à intranet."}
            {modo === "verificar-email" && "Introduza o seu email de adesão para validar."}
            {modo === "redefinir" && "Escolha as suas novas credenciais de acesso."}
          </p>
        </div>

        {/* ---------------- CASO 1: MODO LOGIN TRADICIONAL ---------------- */}
        {modo === "login" && (
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
              <button 
                type="button" 
                onClick={() => { setModo("verificar-email"); setAviso(""); setErros({}); }} 
                className="font-medium text-gray-900 hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>

            {aviso && <p role="status" className="rounded-lg bg-gray-100 p-3 text-center text-xs text-red-600">{aviso}</p>}
        
            <div className="flex flex-col gap-2">
              <button 
                disabled={carregando}
                type="submit"
                className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
              >
                {carregando ? "A autenticar..." : "Entrar"}
              </button>
            </div>


            <div className="mt-6 border-t border-gray-100 pt-4 text-center text-xs text-gray-500">
              <p>
                Deseja aceder à its4work?{" "}
                <a 
                  href="https://its4work.itsall4u.ao/
"
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-semibold text-gray-900 underline hover:text-gray-700 transition"
                >
                  its4work?
                </a>
              </p>
            </div>

          </form>
        )}

        {/* ---------------- CASO 2: MODO VERIFICAR SE EMAIL EXISTE ---------------- */}
        {modo === "verificar-email" && (
          <form className="mt-8 space-y-6" onSubmit={validarEmailExistente}>
            <div>
              <label htmlFor="emailRecuperar" className="sr-only">Email de Registo</label>
              <input
                id="emailRecuperar"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email de registo corporativo"
                className="w-full border-b border-gray-300 bg-transparent px-0 py-3 text-sm text-gray-800 outline-none transition focus:border-black"
              />
              {erros.email && <p className="mt-2 text-xs text-red-600">{erros.email}</p>}
            </div>

            {aviso && <p role="status" className="rounded-lg bg-gray-100 p-3 text-center text-xs text-red-600">{aviso}</p>}

            <div className="flex flex-col gap-2">
              <button
                disabled={carregando}
                type="submit"
                className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
              >
                {carregando ? "A validar conta..." : "Validar Conta"}
              </button>

              <button
                type="button"
                onClick={() => { setModo("login"); setAviso(""); setErros({}); }}
                className="text-xs text-gray-500 hover:underline pt-1 text-center"
              >
                Voltar para o Login
              </button>
            </div>
          </form>
        )}

        {/* ---------------- CASO 3: MODO INTRODUZIR NOVA SENHA ---------------- */}
        {modo === "redefinir" && (
          <form className="mt-8 space-y-6" onSubmit={submeterNovaSenha}>
            <div>
              <input
                type="email"
                disabled
                value={email}
                className="w-full border-b border-gray-200 bg-transparent px-0 py-3 text-sm text-gray-400 outline-none cursor-not-allowed italic"
              />
            </div>

            <div className="relative">
              <input
                type={mostrarNovaSenha ? "text" : "password"}
                required
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Nova senha"
                className="w-full border-b border-gray-300 bg-transparent px-0 py-3 text-sm text-gray-800 outline-none transition focus:border-black"
              />
              <button
                type="button"
                onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {mostrarNovaSenha ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <div>
              <input
                type={mostrarNovaSenha ? "text" : "password"}
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Confirmar nova senha"
                className="w-full border-b border-gray-300 bg-transparent px-0 py-3 text-sm text-gray-800 outline-none transition focus:border-black"
              />
            </div>

            {aviso && <p role="status" className="rounded-lg bg-gray-100 p-3 text-center text-xs text-red-600">{aviso}</p>}

            <div className="flex flex-col gap-2">
              <button
                disabled={carregando}
                type="submit"
                className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
              >
                {carregando ? "A gravar nova senha..." : "Confirmar Nova Senha"}
              </button>

              <button
                type="button"
                onClick={() => { setModo("login"); setAviso(""); setNovaSenha(""); setConfirmarSenha(""); }}
                className="text-xs text-gray-500 hover:underline pt-1 text-center"
              >
                Cancelar redefinição
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
