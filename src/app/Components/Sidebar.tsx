"use client";

import Link from "next/link";
import Image from "next/image";
import {FiHome,FiBriefcase,FiFolder,FiCalendar} from "react-icons/fi";
import {usePathname} from "next/navigation"
import { FaBars } from "react-icons/fa";
import { PiMegaphone } from "react-icons/pi";
import { CiLogout } from "react-icons/ci";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 h-screen w-64 -translate-x-full bg-white border-r
        transition-all duration-300 ease-in-out
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
      <nav className="p-4 space-y-2">

        <Link
          href="/"
          className={`flex items-center gap-3 rounded-lg border-l-4 p-3 hover:bg-gray-100 ${
            isActive("/")
              ? "border-black bg-gray-100 font-medium"
              : "border-transparent"
          }`}
        >
          <FiHome size={20} />

          {isOpen && <span>Principal</span>}
        </Link>


        


        <Link
          href="/comunicados"
          className={`flex items-center gap-3 p-3 rounded-lg border-l-4 hover:bg-gray-100
            ${isActive("/comunicados")?"border-black bg-gray-100 font-medium":"border-transparent"}`}
        >
          <PiMegaphone size={20} />

          {isOpen && <span> Comunicados </span>}
        </Link>


       


        <Link
          href="/clientes"
          className={`flex items-center gap-3 p-3 rounded-lg border-l-4 hover:bg-gray-100
            ${isActive("/clientes")? "border-black bg-gray-100 font-medium" :"border-transparent"}`}
        >
          <FiBriefcase size={20} />

          {isOpen && <span>Clientes</span>}
        </Link>


        <Link
          href="/documentos"
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 border-l-4
            ${isActive("/documentos")? "border-black bg-gray-100 font-medium":"border-transparent"}`}
        >
          <FiFolder size={20} />

          {isOpen && <span>Documentos</span>}
        </Link>


        <Link
          href="/ferias"
          className=
          {`flex items-center gap-3 p-3 rounded-lg border-l-4 hover:bg-gray-100
            ${isActive("/ferias")? "border-black bg-gray-100 font-medium" :"border-transparent"}`}
        >
          <FiCalendar size={20} />

          {isOpen && <span>Férias e ausências</span>}
        </Link>



      </nav>


      {/* Sair */}
      <div className="absolute bottom-0 w-full border-t">

        <button
          className="
            w-full p-4 flex items-center justify-center gap-2 text-red-600
            hover:bg-red-600/10 hover:text-red-500
          "
        >

          {isOpen && <span>Sair</span>}

          <CiLogout size={20} />

        </button>

      </div>

    </aside>
  );
}
