"use client";
import { createClient } from "../../../lib/supabase/client";

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

const [role, setRole] = useState<"admin" | "gestor" | "colaborador" | null>(null);

  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setIsSidebarOpen(true);
    }
  }, []);

useEffect(() => {
  
  if (pathname === "/login") return;

  async function verificarAcessoReal() {
    try {
      const supabase = createClient();

      
      const { data: { session } } = await supabase.auth.getSession();

     
      if (!session) {
        router.replace("/login");
        return;
      }

     
      const { data: perfil, error } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id_usuario", session.user.id)
        .single();

      if (error || !perfil) {
        console.error("Erro ao carregar perfil do usuário:", error);
        router.replace("/login");
        return;
      }

      const roleAtual = perfil.role as "admin" | "gestor" | "colaborador";
      const rotaAdmin = pathname.startsWith("/admin");
      const rotaAdminTotal = pathname === "/admin/acessos" || pathname === "/admin/definicoes";
      const rotaGestorPermitida = [
        "/admin/clientes",
        "/admin/comunicados",
        "/admin/colaboradores",
      ].includes(pathname);

      if (
        rotaAdmin &&
        roleAtual !== "admin" &&
        !(roleAtual === "gestor" && rotaGestorPermitida)
      ) {
        router.replace("/");
        return;
      }

      if (rotaAdminTotal && roleAtual !== "admin") {
        router.replace("/admin");
        return;
      }

      setRole(perfil.role);
      setAcessoVerificado(true);

    } catch (erro) {
      console.error("Erro inesperado na verificação de acesso:", erro);
      router.replace("/login");
    }
  }

  verificarAcessoReal();
}, [pathname, router]);


 if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!acessoVerificado) {
    return null;
  }

  return (
    <div>
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        role={role? role : "colaborador"}
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