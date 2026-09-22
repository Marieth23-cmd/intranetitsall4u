"use client";
import { createClient } from "../../../lib/supabase/client";
import {  useState } from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {FiHome,FiBriefcase,FiCalendar,FiUsers,FiLock,FiSettings} from "react-icons/fi";
import { FaBars } from "react-icons/fa";
import { PiMegaphone } from "react-icons/pi";
import { CiLogout } from "react-icons/ci";


interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  role: "admin" | "gestor" | "colaborador";
}

export default function Sidebar({
  isOpen,
  setIsOpen,
  role,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const isAdmin = role === "admin";
  const isGestor = role === "gestor";
  const isAdminTotal = role === "admin";

  const router = useRouter();
  const[saindo , setSaindo]= useState(false)




  async function handleLogout() {
    setSaindo(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh();
      router.replace("/login");
    
    } catch (error) {
      console.error("Erro ao sair:", error);
    } finally {
      setSaindo(false);
    }
  }

  return (
   <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          -translate-x-full bg-white border-r
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isOpen ? "translate-x-0 md:w-64" : "md:w-14 md:translate-x-0"}
        `}
      >
      {/* Cabeçalho */}
      <div className="h-20 flex items-center border-b">
        {isOpen && (
          <div className="flex items-center justify-between w-full px-6">
            <Image
              src="https://res.cloudinary.com/dhpa1juyr/image/upload/v1787046512/logo_oi1w5w.png"
              alt="Logo"
              width={100}
              height={100}
            />

            <button
              onClick={() => setIsOpen((estaAberta) => !estaAberta)}
              className="cursor-pointer"
            >
              <FaBars size={20} />
            </button>
          </div>
        )}

        {!isOpen && (
          <button
            onClick={() => setIsOpen((estaAberta) => !estaAberta)}
            className="w-full flex justify-center cursor-pointer"
          >
            <FaBars size={20} />
          </button>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 pb-24 [&>a]:text-base [&>a]:font-medium [&>a]:text-gray-800 md:[&>a]:text-sm">

        {isAdmin ? (
          <>
            {/* = ADMIN = */}

            {isOpen && (
              <p className="px-3 pt-1 pb-2 text-xs font-semibold text-gray-400 uppercase">
                Visão Geral
              </p>
            )}

            {/* Painel */}
            <Link
              href="/admin"
              className={`
                flex items-center gap-3 rounded-lg border-l-4 p-3
                hover:bg-gray-100
                ${
                  isActive("/admin")
                    ? "border-black bg-gray-100 font-medium"
                    : "border-transparent"
                }
              `}
            >
              <FiHome size={20} />

              {isOpen && <span>Painel</span>}
            </Link>

            {isOpen && (
              <p className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase">
                Gestão
              </p>
            )}

            {/* Colaboradores */}
            <Link
              href="/admin/colaboradores"
              className={`
                flex items-center gap-3 rounded-lg border-l-4 p-3
                hover:bg-gray-100
                ${
                  isActive("/admin/colaboradores")
                    ? "border-black bg-gray-100 font-medium"
                    : "border-transparent"
                }
              `}
            >
              <FiUsers size={20} />

              {isOpen && <span>Colaboradores</span>}
            </Link>

            {/* Comunicados */}
            <Link
              href="/admin/comunicados"
              className={`
                flex items-center gap-3 rounded-lg border-l-4 p-3
                hover:bg-gray-100
                ${
                  isActive("/admin/comunicados")
                    ? "border-black bg-gray-100 font-medium"
                    : "border-transparent"
                }
              `}
            >
              <PiMegaphone size={20} />

              {isOpen && <span>Comunicados</span>}
            </Link>

            {/* Clientes */}
            <Link
              href="/admin/clientes"
              className={`
                flex items-center gap-3 rounded-lg border-l-4 p-3
                hover:bg-gray-100
                ${
                  isActive("/admin/clientes")
                    ? "border-black bg-gray-100 font-medium"
                    : "border-transparent"
                }
              `}
            >
              <FiBriefcase size={20} />

              {isOpen && <span>Clientes</span>}
            </Link>

           

            

            {/* Férias  */}
            <Link
              href="/admin/ferias"
              className={`
                flex items-center gap-3 rounded-lg border-l-4 p-3
                hover:bg-gray-100
                ${
                  isActive("/admin/ferias")
                    ? "border-black bg-gray-100 font-medium"
                    : "border-transparent"
                }
              `}
            >
              <FiCalendar size={20} />

              {isOpen && <span>Férias </span>}
            </Link>

              {/* Férias  */}
            <Link
              href="/admin/faltas"
              className={`
                flex items-center gap-3 rounded-lg border-l-4 p-3
                hover:bg-gray-100
                ${
                  isActive("/admin/faltas")
                    ? "border-black bg-gray-100 font-medium"
                    : "border-transparent"
                }
              `}
            >
              <FiCalendar size={20} />

              {isOpen && <span>Faltas </span>}
            </Link>

            
              {isAdmin && isOpen && (
              <p className="px-3 pt-1 pb-2 text-xs font-semibold text-gray-400 uppercase">
                Sistema
              </p>
            )}



            {isAdminTotal && (
              <>
                {/* Acessos */}
                <Link
                  href="/admin/acessos"
                  className={`
                    flex items-center gap-3 rounded-lg border-l-4 p-3
                    hover:bg-gray-100
                    ${
                      isActive("/admin/acessos")
                        ? "border-black bg-gray-100 font-medium"
                        : "border-transparent"
                    }
                  `}
                >
                  <FiLock size={20} />

                  {isOpen && <span>Acessos e permissões</span>}
                </Link>

                {/* Definições */}
                <Link
                  href="/admin/definicoes"
                  className={`
                    flex items-center gap-3 rounded-lg border-l-4 p-3
                    hover:bg-gray-100
                    ${
                      isActive("/admin/definicoes")
                        ? "border-black bg-gray-100 font-medium"
                        : "border-transparent"
                    }
                  `}
                >
                  <FiSettings size={20} />

                  {isOpen && <span>Definições</span>}
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            {/* ================= COLABORADOR ================= */}

          
            {/* Principal */}
            <Link
              href="/"
              className={`
                flex items-center gap-3 rounded-lg border-l-4 p-3
                hover:bg-gray-100
                ${
                  isActive("/")
                    ? "border-black bg-gray-100 font-medium"
                    : "border-transparent"
                }
              `}
            >
              <FiHome size={20} />

              {isOpen && <span>Principal</span>}
            </Link>

            {/* Comunicados */}
            {!isGestor && (<>
            <Link
              href="/comunicados"
              className={`
                flex items-center gap-3 p-3 rounded-lg border-l-4
                hover:bg-gray-100
                ${
                  isActive("/comunicados")
                    ? "border-black bg-gray-100 font-medium"
                    : "border-transparent"
                }
              `}
            >
              <PiMegaphone size={20} />

              {isOpen && <span>Comunicados</span>}
            </Link>
            
            
            {/* Clientes */}
            <Link
              href="/clientes"
              className={`
                flex items-center gap-3 p-3 rounded-lg border-l-4
                hover:bg-gray-100
                ${
                  isActive("/clientes")
                    ? "border-black bg-gray-100 font-medium"
                    : "border-transparent"
                }
              `}
            >
              <FiBriefcase size={20} />

              {isOpen && <span>Clientes</span>}
            </Link>
          
            </>
          )}

          

           

            {/* Férias */}
            <Link
              href="/ferias"
              className={`
                flex items-center gap-3 p-3 rounded-lg border-l-4
                hover:bg-gray-100
                ${
                  isActive("/ferias")
                    ? "border-black bg-gray-100 font-medium"
                    : "border-transparent"
                }
              `}
            >
              <FiCalendar size={20} />

              {isOpen && <span>Férias</span>}
            </Link>

             <Link
              href="/faltas"
              className={`
                flex items-center gap-3 p-3 rounded-lg border-l-4
                hover:bg-gray-100
                ${
                  isActive("/faltas")
                    ? "border-black bg-gray-100 font-medium"
                    : "border-transparent"
                }
              `}
            >
              <FiCalendar size={20} />

              {isOpen && <span>Faltas</span>}
            </Link>

              {isGestor && isOpen && (
              <p className="px-3 pt-1 pb-2 text-xs font-semibold text-gray-400 uppercase">
                Gestão atribuída
              </p>
            )}

            {isGestor && (
              <>
                <Link
                  href="/admin/colaboradores"
                  className={`flex items-center gap-3 rounded-lg border-l-4 p-3 hover:bg-gray-100 ${isActive("/admin/colaboradores") ? "border-black bg-gray-100 font-medium" : "border-transparent"}`}
                >
                  <FiUsers size={20} />
                  {isOpen && <span>Colaboradores</span>}
                </Link>
                <Link
                  href="/admin/comunicados"
                  className={`flex items-center gap-3 rounded-lg border-l-4 p-3 hover:bg-gray-100 ${isActive("/admin/comunicados") ? "border-black bg-gray-100 font-medium" : "border-transparent"}`}
                >
                  <PiMegaphone size={20} />
                  {isOpen && <span>Comunicados</span>}
                </Link>
                <Link
                  href="/admin/clientes"
                  className={`flex items-center gap-3 rounded-lg border-l-4 p-3 hover:bg-gray-100 ${isActive("/admin/clientes") ? "border-black bg-gray-100 font-medium" : "border-transparent"}`}
                >
                  <FiBriefcase size={20} />
                  {isOpen && <span>Clientes</span>}
                </Link>
              </>
            )}


          </>
        )}
      </nav>

     <div className="shrink-0 w-full border-t bg-white">
      <button
        onClick={handleLogout}
        disabled={saindo}
        className="
          w-full p-4 flex items-center justify-center gap-2 text-red-600
          hover:bg-red-600/10 hover:text-red-500
        ">
        {isOpen && <span>{saindo ? "A sair..." : "Sair"}</span>}
        <CiLogout size={20} />
      </button>
      </div>
    </aside>
  );
}