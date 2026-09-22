"use client";
import { useState, useEffect } from "react";
import {useRouter} from "next/navigation"
import { createClient } from "../../../lib/supabase/client";


type clientes = {
  nome: string;
  area: string;
  projetos: number;
  estado: string;
};


function EstadoCliente({ estado }: { estado: string }) {
  const ativo = estado === "ativo";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        ativo
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {estado}
    </span>
  );
}


export default function ClientesPage() {
 const [clientes, setClientes] = useState<clientes[]>([]);
 const [carregando, setCarregando] = useState(true);
 const [autorizado , setAutorizado] =useState(false)
 const [verificandoAcesso, setVerificandoAcesso] = useState(true)
 const router = useRouter()


 useEffect(() => {
    async function fetchClientes() {
      try {
        const response = await fetch("/api/clientes", { cache: "no-store" });
        const data = await response.json();

        if (response.ok) {
          setClientes(data.clientes || []);
        } else {
          console.error("Erro ao buscar clientes:", data.error);
        }
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      } finally {
        setCarregando(false);
      }
    }

    fetchClientes();
  }, []);

  useEffect(() => {
    async function verificarAcessoColaborador() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const { data: perfil } = user
          ? await supabase
            .from("usuarios")
            .select("role")
            .eq("id_usuario", user.id)
            .maybeSingle()
          : { data: null };
        const role = perfil?.role;

        if (role === "colaborador" || role === "gestor") {
          setAutorizado(true);
        } else if (role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.log("Erro ao verificar utilizador logado", error);
        router.replace("/login");
      } finally {
        setVerificandoAcesso(false);
      }
    }

    verificarAcessoColaborador();
  }, [router]);




  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-700">Carregando clientes...</p>
      </div>
    );
  }


  if (clientes.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-700">Nenhum cliente encontrado.</p>
      </div>
    );
  }

  if(!autorizado){
        return <div className="flex h-screen items-center justify-center text-blue-700">A redirecionar para o painel administrativo...</div>;

  }

  
 if (verificandoAcesso) {
    return <div className="flex h-screen items-center justify-center text-gray-500">A carregar portal...</div>;
  }


  return (
    <div className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">
      <header>
        <h1 className="page-title">Clientes</h1>
      
      </header>


      {/* Cartões no telemóvel: evitam uma tabela comprimida ou com scroll lateral. */}
      <div className="mt-6 space-y-3 md:hidden">
        {clientes.map((cliente) => (
          <article key={cliente.nome} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="section-title">{cliente.nome}</h2>
              <EstadoCliente estado={cliente.estado} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Área</dt>
                <dd className="mt-1 font-medium text-gray-700">{cliente.area}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Projetos</dt>
                <dd className="mt-1 font-medium text-gray-700">{cliente.projetos}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      {/* Tabela a partir de md (768px), quando há largura suficiente para as quatro colunas. */}
      <div className="mt-6 hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-sm font-medium text-gray-700">Nome do cliente</th>
              <th className="px-5 py-3 text-sm font-medium text-gray-700">Área</th>
              <th className="px-5 py-3 text-sm font-medium text-gray-700">Projetos</th>
              <th className="px-5 py-3 text-sm font-medium text-gray-700">Estado</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.nome} className="border-t border-gray-100">
                <td className="px-5 py-4 text-sm font-medium text-gray-800">{cliente.nome}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{cliente.area}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{cliente.projetos}</td>
                <td className="px-5 py-4"><EstadoCliente estado={cliente.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
