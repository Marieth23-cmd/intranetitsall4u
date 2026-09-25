"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { toast } from "sonner";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [senhaNova, setSenhaNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [processando, setProcessando] = useState(false);
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [sessaoValida, setSessaoValida] = useState(false);
  const [mostrarSenha , setmostrarSenha]= useState(false)

  useEffect(() => {
    const supabase = createClient();

    async function verificarSessao() {
      const { data } = await supabase.auth.getSession();
      setSessaoValida(Boolean(data.session));
      setVerificandoSessao(false);
    }

    void verificarSessao();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setSessaoValida(true);
      }
      setVerificandoSessao(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function atualizarSenhaFinal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (senhaNova.length < 6) {
      toast.error("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senhaNova !== confirmacao) {
      toast.error("As palavras-passe não coincidem.");
      return;
    }

    try {
      setProcessando(true);
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: senhaNova });

      if (error) {
        toast.error(error.message);
        return;
      }

      await supabase.auth.signOut();
      toast.success("Palavra-passe atualizada. Inicie sessão novamente.");
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao atualizar palavra-passe:", error);
      toast.error("Não foi possível atualizar a palavra-passe.");
    } finally {
      setProcessando(false);
    }
  }

  if (verificandoSessao) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-gray-500">A validar o link...</main>;
  }

  if (!sessaoValida) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 text-center text-gray-700">
        <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
          <h1 className="text-lg font-bold text-gray-900">Link inválido ou expirado</h1>
          <p className="mt-2 text-sm text-gray-500">Peça um novo link de recuperação na página de login.</p>
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-5 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Voltar ao login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 text-gray-700">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h1 className="text-lg font-bold text-gray-900">Nova palavra-passe</h1>
        <p className="mt-1 text-xs text-gray-500">Escolha uma palavra-passe com pelo menos 6 caracteres.</p>

        <form onSubmit={atualizarSenhaFinal} className="mt-5 space-y-4">
          <div className="relative">
          <input

            type={mostrarSenha? "text" :"password"}
            required
            minLength={6}
            value={senhaNova}
            onChange={(event) => setSenhaNova(event.target.value)}
            placeholder="Nova palavra-passe"
            autoComplete="new-password"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
          />
          <button
                type="button"
                onClick={() =>setmostrarSenha(!mostrarSenha)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {mostrarSenha ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
          </div>

           <div className="relative">
          <input
            type={mostrarSenha? "text" :"password"}
            required
            minLength={6}
            value={confirmacao}
            onChange={(event) => setConfirmacao(event.target.value)}
            placeholder="Confirmar palavra-passe"
            autoComplete="new-password"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-600"
          />
            <button
                type="button"
                onClick={() => setmostrarSenha(!mostrarSenha)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {mostrarSenha ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
          </div> 
          <button
            type="submit"
            disabled={processando}
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {processando ? "A gravar..." : "Gravar nova palavra-passe"}
          </button>
        </form>
      </div>
    </main>
  );
}
