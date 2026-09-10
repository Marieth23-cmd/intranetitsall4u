"use client";
import { createClient } from "../../../lib/supabase/client";
import {useRouter} from "next/navigation";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CiLogout, CiSearch } from "react-icons/ci";
import { FaBars } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { MdOutlineNotificationsNone } from "react-icons/md";

interface NavbarProps {
  isSidebarOpen: boolean;
  onMenuClick: () => void;
}

export default function Navbar({ isSidebarOpen, onMenuClick }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [saindo, setSaindo] = useState(false);
  const router = useRouter();
  const [usuarioLogado, setUsuarioRole] = useState({
    nome: "Carregando...",
    cargo: "A verificar..."
  });
  
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
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

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
        <div className="hidden md:absolute md:left-1/2 md:block md:-translate-x-1/2">
          <CiSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Pesquisar colaboradores, pessoas, documentos..."
            className="w-[250px] rounded-lg border border-gray-300 py-2 pl-11 pr-4 text-sm outline-none transition focus:border-blue-700 focus:ring-1 focus:ring-blue-700 lg:w-[500px]"
          />
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
                    placeholder="Pesquisar..."
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
              </div>
            )}
          </div>

          <button type="button" aria-label="Notificações">
            <MdOutlineNotificationsNone size={24} />
          </button>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              aria-label="Abrir menu de perfil"
              onClick={() => setIsProfileOpen((aberto) => !aberto)}
              className="rounded-full"
            >
              <Image
                src="https://res.cloudinary.com/dhpa1juyr/image/upload/v1772111593/Alicia_zzjgz2.jpg"
                alt="Avatar"
                width={40}
                height={40}
                className="h-8 w-8 rounded-full"
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-12 w-56 rounded-lg border border-gray-200 bg-white p-3 shadow-lg md:-right-6">
               
                <p className="font-medium text-gray-800" title={usuarioLogado.nome}>{usuarioLogado.nome}</p>
               
                <p className="mt-1 text-sm text-gray-500"  title={usuarioLogado.cargo}>{usuarioLogado.cargo}</p>
                 <label htmlFor="imagem">
                 <input name="imagem" id="imagem" type="file" />
                 </label>
                <div className="my-3 border-t border-gray-100" />
                <button 
                disabled={saindo}
                onClick={handleLogout}
                type="button"
                className="flex w-full items-center gap-2 rounded-md p-1 text-sm text-red-600 transition hover:bg-red-600/10 hover:text-red-500">
                  <CiLogout size={20} />
                  {saindo ? "A sair..." : "Terminar sessão"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
