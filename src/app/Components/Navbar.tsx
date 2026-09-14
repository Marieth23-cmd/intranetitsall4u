"use client";
import { createClient } from "../../../lib/supabase/client";
import {useRouter} from "next/navigation";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CiLogout, CiSearch } from "react-icons/ci";
import { FaBars, FaImage } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { toast } from "sonner";

interface NavbarProps {
  isSidebarOpen: boolean;
  onMenuClick: () => void;
}

type Notificacao = {
  id_notificacao: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data_criacao: string;
};

type ResultadoPesquisa = {
  id: string | number;
  titulo: string;
  tipo: "Colaborador" | "Cliente" | "Comunicado";
  detalhe: string;
  caminho: string;
};

type Role = "admin" | "colaborador";

export default function Navbar({ isSidebarOpen, onMenuClick }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const globalSearchRef = useRef<HTMLDivElement>(null);
  const [saindo, setSaindo] = useState(false);
  const router = useRouter();
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [resultadosPesquisa, setResultadosPesquisa] = useState<ResultadoPesquisa[]>([]);
  const [role, setRole] = useState<Role>("colaborador");
  const [usuarioLogado, setUsuarioRole] = useState({
    nome: "Carregando...",
    cargo: "A verificar..."
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // 🟢 Função para carregar as notificações da tua nova tabela via API
  async function carregarNotificacoes() {
    try {
      const resposta = await fetch("/api/notificacoes", { cache: "no-store" });
      const dados = await resposta.json();
      if (resposta.ok) {
        setNotificacoes(dados.notifications || []);
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  }

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  
  async function handleLogout() {
    setSaindo(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    } finally {
      setSaindo(false);
    }
  }

  async function CarregarPerfilNavbar() {
    try {
      const supabase = createClient()
      const {data :{user}} = await supabase.auth.getUser()

      if(!user)return

      const role= user.user_metadata?.role || "Colaborador";
      const nomeAuth = user.user_metadata?.nome || "Utilizador da intranet"
      setRole(role === "admin" ? "admin" : "colaborador");
      setFotoUrl(user.user_metadata?.foto_url || null);

      if(role === "admin"){
        setUsuarioRole({
          nome: nomeAuth,
          cargo: "Administrador Geral"
        });
      }else{
        const {data: colaborador} =await supabase 
        .from( "colaboradores")
        .select("nome , cargo")
        .eq("usuario_id" , user.id)
        .single()

        setUsuarioRole({
            nome:colaborador?.nome || nomeAuth,
            cargo:colaborador?.cargo || "Colaborador geral"
          })

      }

     } catch (error) {
      console.log("Erro ao carregar dados do perfil do usuario" , error )
     }
    }
 


  useEffect(()=>{
    CarregarPerfilNavbar()
  }, [])




    const handleClickOutside = useCallback((event: MouseEvent) => {
    if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
      setIsProfileOpen(false);
    }
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setIsMobileSearchOpen(false);
    }
    if (globalSearchRef.current && !globalSearchRef.current.contains(event.target as Node)) {
      setResultadosPesquisa([]);
    }
    // 🟢 Fecha o card de notificações ao clicar fora
    if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
      setIsNotificationsOpen(false);
    }
  }, []);


  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    const termo = termoPesquisa.trim();

    if (!termo) {
      setResultadosPesquisa([]);
      return;
    }

    const temporizador = window.setTimeout(async () => {
      try {
        const resposta = await fetch(`/api/pesquisa?termo=${encodeURIComponent(termo)}`, {
          cache: "no-store",
        });
        const dados = await resposta.json();
        setResultadosPesquisa(resposta.ok ? dados.resultados || [] : []);
      } catch (error) {
        console.error("Erro na pesquisa geral:", error);
        setResultadosPesquisa([]);
      }
    }, 250);

    return () => window.clearTimeout(temporizador);
  }, [termoPesquisa]);

  function abrirResultado(resultado: ResultadoPesquisa) {
    setTermoPesquisa("");
    setResultadosPesquisa([]);
    setIsMobileSearchOpen(false);
    router.push(resultado.caminho);
  }


async function handleUploadFoto(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const ficheiro = event.target.files?.[0];

  if (!ficheiro) return;

  if (!ficheiro.type.startsWith("image/")) {
    toast.error("Seleciona apenas uma imagem.");
    return;
  }

  if (ficheiro.size > 2 * 1024 * 1024) {
    toast.error("A imagem não pode ultrapassar 2 MB.");
    return;
  }

  try {
    setEnviandoFoto(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Utilizador não autenticado.");
    }

    const extensao = ficheiro.name.split(".").pop();
    const caminho = `${user.id}/avatar.${extensao}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(caminho, ficheiro, {
        upsert: true,
        contentType: ficheiro.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(caminho);

    const urlFoto = data.publicUrl;

    setFotoUrl(urlFoto);

    await supabase.auth.updateUser({
      data: {
        foto_url: urlFoto,
      },
    });

    toast.success("Foto atualizada com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar foto:", error);
    toast.error("Não foi possível enviar a foto.");
  } finally {
    setEnviandoFoto(false);
  }
}


  return (
    <header
      className={`fixed top-0 right-0 left-0 z-30 h-20 border-b bg-white shadow-sm transition-all duration-300 ${
        isSidebarOpen ? "md:left-64" : "md:left-14"
      }`}
    >
      <div className="relative flex h-full items-center justify-between gap-3 px-4 md:px-8">
        <button
          type="button"
          aria-label="Abrir menu"
          onClick={onMenuClick}
          className="shrink-0 md:hidden"
        >
          <FaBars size={20} />
        </button>

        {/* Pesquisa fixa no tablet e desktop. */}
        <div ref={globalSearchRef} className="hidden md:absolute md:left-1/2 md:block md:-translate-x-1/2">
          <CiSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder={role === "admin" ? "Pesquisar colaboradores, clientes e comunicados..." : "Pesquisar clientes e comunicados..."}
            value={termoPesquisa}
            onChange={(event) => setTermoPesquisa(event.target.value)}
            className="w-[250px] rounded-lg border border-gray-300 py-2 pl-11 pr-4 text-sm outline-none transition focus:border-blue-700 focus:ring-1 focus:ring-blue-700 lg:w-[500px]"
          />
          {termoPesquisa && (
            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
              {resultadosPesquisa.length === 0 ? (
                <p className="px-4 py-3 text-xs text-gray-500">Nenhum resultado encontrado.</p>
              ) : (
                resultadosPesquisa.map((resultado) => (
                  <button
                    key={`${resultado.tipo}-${resultado.id}`}
                    type="button"
                    onClick={() => abrirResultado(resultado)}
                    className="block w-full border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:bg-gray-50"
                  >
                    <span className="block text-sm font-medium text-gray-800">{resultado.titulo}</span>
                    <span className="block text-xs text-gray-500">{resultado.tipo} · {resultado.detalhe}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3 md:gap-5">
          {/* No mobile, o campo só aparece quando este ícone é clicado. */}
          <div ref={searchRef} className="relative md:hidden">
            <button
              type="button"
              aria-label="Pesquisar"
              aria-expanded={isMobileSearchOpen}
              onClick={() => setIsMobileSearchOpen((aberta) => !aberta)}
              className="rounded-md p-1"
            >
              <CiSearch size={24} />
            </button>

            {isMobileSearchOpen && (
              <div className="fixed top-24 right-4 left-4 z-40 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
                <div className="relative">
                  <CiSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    autoFocus
                    placeholder={role === "admin" ? "Pesquisar colaboradores, clientes e comunicados..." : "Pesquisar clientes e comunicados..."}
                    value={termoPesquisa}
                    onChange={(event) => setTermoPesquisa(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                  />
                  <button
                    type="button"
                    aria-label="Fechar pesquisa"
                    onClick={() => setIsMobileSearchOpen(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
                  >
                    <FiX size={18} />
                  </button>
                </div>
                {termoPesquisa && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    {resultadosPesquisa.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-gray-500">Nenhum resultado encontrado.</p>
                    ) : (
                      resultadosPesquisa.map((resultado) => (
                        <button
                          key={`${resultado.tipo}-${resultado.id}`}
                          type="button"
                          onClick={() => abrirResultado(resultado)}
                          className="block w-full border-b border-gray-100 px-3 py-2 text-left last:border-0 hover:bg-gray-50"
                        >
                          <span className="block text-sm font-medium text-gray-800">{resultado.titulo}</span>
                          <span className="block text-xs text-gray-500">{resultado.tipo} · {resultado.detalhe}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

                    {/* SEÇÃO DE NOTIFICAÇÕES */}
          <div ref={notificationsRef} className="relative">
            <button 
              type="button" 
              aria-label="Notificações"
              onClick={() => setIsNotificationsOpen((antigo) => !antigo)}
              className="rounded-full p-1 text-gray-600 hover:bg-gray-100 relative cursor-pointer"
            >
              <MdOutlineNotificationsNone size={24} />
              {notificacoes.filter(n => !n.lida).length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600" />
              )}
            </button>

            {/* CARD DE NOTIFICAÇÕES SUSPENSO */}
            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl md:-right-12 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="font-semibold text-sm text-gray-800">Notificações</h3>
                  <span className="text-[11px] bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                    {notificacoes.filter(n => !n.lida).length} Novas
                  </span>
                </div>

                <div className="mt-2 max-h-64 overflow-y-auto divide-y divide-gray-50">
                  {notificacoes.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">Nenhuma notificação por aqui. </p>
                  ) : (
                    notificacoes.map((item) => (
                      <div key={item.id_notificacao} className={`py-2.5 text-xs ${!item.lida ? 'bg-blue-50/30 -mx-2 px-2 rounded' : ''}`}>
                        <p className="font-semibold text-gray-800">{item.titulo}</p>
                        <p className="text-gray-500 mt-0.5 leading-normal">{item.mensagem}</p>
                        <span className="text-[10px] text-gray-400 block mt-1">
                          {new Date(item.data_criacao).toLocaleDateString("pt-PT")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PERFIL E INPUT DE AVATAR ESTILIZADO */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              aria-label="Abrir menu de perfil"
              onClick={() => setIsProfileOpen((aberto) => !aberto)}
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 cursor-pointer"
            >
              {fotoUrl ? (
                <Image
                  src={fotoUrl}
                  alt="Avatar"
                  className="h-9 w-8 rounded-full object-cover border border-gray-200 shadow-sm"
                />
              ) : (
                <Image
                  src="https://res.cloudinary.com/dhpa1juyr/image/upload/v1772111593/Alicia_zzjgz2.jpg"
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="h-9 w-9 rounded-full object-cover border border-gray-200 shadow-sm"
                />
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-12 w-60 rounded-xl border border-gray-200 bg-white p-4 shadow-xl md:-right-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <p className="font-semibold text-sm text-gray-800 truncate" title={usuarioLogado.nome}>
                  {usuarioLogado.nome}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5" title={usuarioLogado.cargo}>
                  {usuarioLogado.cargo}
                </p>

                {/* 🟢 INPUT DE FOTO TOTALMENTE CUSTOMIZADO E SEGURO */}
                <div className="mt-3">
                  <label 
                    htmlFor="imagem" 
                    className="flex w-full items-start justify-start gap-2 rounded-md border border-gray-50  px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                  >
                    <span className="flex  gap-1 text-start"><FaImage size={15}/> {enviandoFoto ? "A carregar..." : "Carregar imagem "}</span>
                    <input
                      name="imagem"
                      id="imagem"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleUploadFoto}
                      disabled={enviandoFoto}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="my-3 border-t border-gray-100" />
                <button 
                  disabled={saindo}
                  onClick={handleLogout}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md p-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                >
                  <CiLogout size={18} />
                  {saindo ? "A fechar sessão..." : "Terminar sessão"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
