"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manterSessao, setManterSessao] = useState(false);
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [aviso, setAviso] = useState("");

  function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const novosErros: { email?: string; senha?: string } = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) novosErros.email = "Introduza um email válido.";
    if (senha.length < 6) novosErros.senha = "A senha deve ter pelo menos 6 caracteres.";

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    const armazenamento = manterSessao ? localStorage : sessionStorage;
    armazenamento.setItem("intranet-teste-autorizado", "true");
    router.replace("/");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[#050505]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-[#202020] [clip-path:polygon(0_38%,100%_0,100%_100%,0_100%)]" />

      <section className="relative w-full max-w-sm rounded-2xl bg-white px-7 py-8 shadow-2xl sm:px-9 sm:py-10">
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

          <div>
            <label htmlFor="senha" className="sr-only">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Senha"
              autoComplete="current-password"
              className={`w-full border-b bg-transparent px-0 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-black ${erros.senha ? "border-red-500" : "border-gray-300"}`}
            />
            {erros.senha && <p className="mt-2 text-xs text-red-600">{erros.senha}</p>}
          </div>

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
            <button type="button" onClick={() => setAviso("Contacte o administrador para repor a sua senha.")} className="font-medium text-gray-900 hover:underline">
              Esqueceu a senha?
            </button>
          </div>

          {aviso && <p role="status" className="rounded-lg bg-gray-100 p-3 text-center text-xs text-gray-600">{aviso}</p>}

          <button type="submit" className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
