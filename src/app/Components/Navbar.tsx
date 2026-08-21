"use client";

import { MdOutlineNotificationsNone } from "react-icons/md";
import Image from "next/image";
import { CiLogout, CiSearch } from "react-icons/ci";
import { FaBars } from "react-icons/fa";
import { useState, useCallback, useRef, useEffect } from "react";

interface NavbarProps {
  isSidebarOpen: boolean;
  onMenuClick: () => void;
}

export default function Navbar({
  isSidebarOpen,
  onMenuClick,
}: NavbarProps) {

  const [isOpen, setIsOpen] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      boxRef.current &&
      !boxRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-30 h-20 bg-white border-b shadow-sm transition-all duration-300 ${
        isSidebarOpen ? "md:left-64" : "md:left-14"
      }`}
    >

      <div className="relative h-full flex items-center justify-between gap-3 px-4 md:px-8">

        <button
          type="button"
          aria-label="Abrir menu"
          onClick={onMenuClick}
          className="shrink-0 md:hidden"
        >
          <FaBars size={20} />
        </button>

        {/* Pesquisa */}
        <div className="relative flex-1 md:absolute md:left-1/2 md:-translate-x-1/2">

          <CiSearch
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            placeholder="Pesquisar colaboradores, pessoas, documentos..."
            className="w-full min-w-0 sm:w-[250px] lg:w-[500px] rounded-lg border border-gray-300 py-2 pl-11 pr-4 outline-none"
          />

        </div>

        {/* Ações */}
        <div className="ml-auto flex shrink-0 items-center gap-3 md:gap-5">

          <button>
            <MdOutlineNotificationsNone size={24} />
          </button>

          {/* Perfil */}
          <div ref={boxRef} className="relative">

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
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

            {/* Caixa do perfil */}
            {isOpen && (
              <div className="absolute -right-6 top-12 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">

                <p className="font-medium text-gray-800">
                  Marieth Pascoal
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Assistente de Informática
                </p>

                <div className="my-3 border-t border-gray-100 flex flex-row" />

                <div className="flex items-center gap-2 p-1 hover:bg-red-600/10">
                <button
                  type="button"
                  className="text-sm text-red-600  transition hover:text-red-500" >
                  Terminar sessão
                  </button>
                  
                
                <CiLogout size={20} className="text-sm text-red-600 transition hover:text-red-500"
                />
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </header>
  );
}
