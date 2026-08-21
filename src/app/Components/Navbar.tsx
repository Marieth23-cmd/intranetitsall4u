"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CiLogout, CiSearch } from "react-icons/ci";
import { FaBars } from "react-icons/fa";
import { MdOutlineNotificationsNone } from "react-icons/md";

interface NavbarProps {
  isSidebarOpen: boolean;
  onMenuClick: () => void;
}

export default function Navbar({ isSidebarOpen, onMenuClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-30 h-32 border-b bg-white shadow-sm transition-all duration-300 md:h-20 ${
        isSidebarOpen ? "md:left-64" : "md:left-14"
      }`}
    >
      <div className="relative h-full px-4 md:px-8">
        {/* No telemóvel, ações na primeira linha; no desktop, ocupam a única linha. */}
        <div className="flex h-16 items-center justify-between md:h-full">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <FaBars size={20} />
          </button>

          <div className="ml-auto flex items-center gap-3 md:gap-5">
            <button type="button" aria-label="Notificações">
              <MdOutlineNotificationsNone size={24} />
            </button>

            <div ref={boxRef} className="relative">
              <button
                type="button"
                aria-label="Abrir menu de perfil"
                onClick={() => setIsOpen((aberto) => !aberto)}
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

              {isOpen && (
                <div className="absolute right-0 top-12 w-56 rounded-lg border border-gray-200 bg-white p-3 shadow-lg md:-right-6">
                  <p className="font-medium text-gray-800">Marieth Pascoal</p>
                  <p className="mt-1 text-sm text-gray-500">Assistente de Informática</p>
                  <div className="my-3 border-t border-gray-100" />
                  <button type="button" className="flex w-full items-center gap-2 rounded-md p-1 text-sm text-red-600 transition hover:bg-red-600/10 hover:text-red-500">
                    <CiLogout size={20} />
                    Terminar sessão
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pesquisa: segunda linha no mobile, centrada na única linha no desktop. */}
        <div className="absolute inset-x-4 top-16 pb-3 md:inset-x-auto md:left-1/2 md:top-1/2 md:w-auto md:-translate-x-1/2 md:-translate-y-1/2 md:pb-0">
          <CiSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Pesquisar colaboradores, pessoas, documentos..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-11 pr-4 text-sm outline-none transition focus:border-yellow-700 focus:ring-1 focus:ring-yellow-700 md:w-[250px] lg:w-[500px]"
          />
        </div>
      </div>
    </header>
  );
}
