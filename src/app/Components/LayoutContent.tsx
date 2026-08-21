"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [acessoVerificado, setAcessoVerificado] = useState(false);
  // No telemóvel começa fechada; em ecrãs md (768 px) ou maiores, abre por padrão.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setIsSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    if (pathname === "/login") return;

    const autorizado =
      localStorage.getItem("intranet-teste-autorizado") === "true" ||
      sessionStorage.getItem("intranet-teste-autorizado") === "true";

    if (!autorizado) {
      router.replace("/login");
      return;
    }

    setAcessoVerificado(true);
  }, [pathname, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!acessoVerificado) return null;

  return (
    <div>

      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <Navbar
        isSidebarOpen={isSidebarOpen}
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <main
        className={`
          pt-20 transition-all duration-300
          ml-0 ${isSidebarOpen ? "md:ml-64" : "md:ml-14"}
        `}
      >
        {children}
      </main>

    </div>
  );
}
