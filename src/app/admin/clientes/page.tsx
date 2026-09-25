"use client";
import {useState, useEffect} from "react";
import { FiPlus,FiEdit2, FiSearch} from "react-icons/fi";
import { createClient } from "../../../../lib/supabase/client";
import { FiTrash2 } from "react-icons/fi";
import {toast} from "sonner"

type clientes = {
  id_cliente: number;
  nome: string;
  area: string;
  projetos: number;
  estado: "ativo" | "inativo";
  data_criacao: string;
  usuarios: {
    email: string; 
  } | null; 

}

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

export default function ClientesAdminPage() {
 const [clientes, setClientes] = useState<clientes[]>([]);
 const [loading, setLoading] = useState(true);
 const [role, setRole] = useState<"admin" | "gestor" | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<clientes | null>(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
 const [termoPesquisa, setTermoPesquisa] = useState("");
 const [novoCliente, setNovoCliente] = useState({
  nome: "",
  area: "",
  projetos: 0,
  estado: "ativo" as "ativo" | "inativo",
 });

 const fetchClientes = async () => {
  try {
    setLoading(true);
    const response = await fetch("/api/clientes", {
      cache: "no-store", 
    });
    const data = await response.json();
    setClientes(data.clientes);

    if (!response.ok) {
      throw new Error(data.error || "Erro ao buscar clientes.");
    }else{
      setClientes(data.clientes);
    }


  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    setError("Erro ao buscar clientes. Tente novamente mais tarde.");
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  fetchClientes();
}, []);

useEffect(() => {
  async function carregarRole() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: perfil } = user
      ? await supabase
          .from("usuarios")
          .select("role")
          .eq("id_usuario", user.id)
          .maybeSingle()
      : { data: null };
    const roleAtual = perfil?.role;
    if (roleAtual === "admin" || roleAtual === "gestor") {
      setRole(roleAtual);
    }
  }

  void carregarRole();
}, []);

const clientesFiltrados = clientes.filter((cliente) => {
  const termo = termoPesquisa.trim().toLocaleLowerCase();
  if (!termo) return true;

  return [cliente.nome, cliente.area, cliente.estado]
    .filter(Boolean)
    .some((valor) => valor.toLocaleLowerCase().includes(termo));
});



function confirmarEliminacao(id_cliente: number) {
  toast("Tem a certeza que deseja eliminar este cliente?", {
    duration: 5000,
    action: {
      label: "Confirmar",
      onClick: () => {
        void eliminarCliente(id_cliente);
      },
    },
    cancel: {
      label: "Cancelar",
      onClick: () => {},
    },
  });
}


async function eliminarCliente(id_cliente: number) {
  try {
    const resposta = await fetch("/api/clientes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_cliente }),
    });

    const textoResposta = await resposta.text();
    const dados = textoResposta ? JSON.parse(textoResposta) : {};

    if (resposta.ok) {
      toast.success("Cliente removido com sucesso!");
      await fetchClientes();
    } else {
      toast.error(`Erro ao eliminar: ${dados.error || "Resposta vazia do servidor"}`);
    }
  } catch (error) {
    console.error("Erro ao apagar:", error);
    toast.error("Erro interno ao tentar eliminar");
  }
}


const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  try {
    const response = await fetch("/api/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(novoCliente),
    });
    const data = await response.json();

    if (response.ok) {
      setClientes((prevClientes) => [...prevClientes, data.cliente]);
      setModalAberto(false);
      setNovoCliente({
        nome: "",
        area: "",
        projetos: 0,
        estado: "ativo",
      });
    } else {
      throw new Error(data.error || "Erro ao criar cliente.");
    }
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    setError("Erro ao criar cliente. Tente novamente mais tarde.");
  }
}

const abrirEdicao = (cliente: clientes) => {
  setError(null);
  setClienteEditando(cliente);
};

const handleEditar = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (!clienteEditando) return;

  try {
    setSalvandoEdicao(true);
    setError(null);

    const response = await fetch("/api/clientes", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_cliente: clienteEditando.id_cliente,
        nome: clienteEditando.nome,
        area: clienteEditando.area,
        projetos: clienteEditando.projetos,
        estado: clienteEditando.estado,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao atualizar cliente.");
    }

    setClientes((prevClientes) =>
      prevClientes.map((cliente) =>
        cliente.id_cliente === data.cliente.id_cliente ? data.cliente : cliente
      )
    );
    setClienteEditando(null);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    setError(error instanceof Error ? error.message : "Erro ao atualizar cliente.");
  } finally {
    setSalvandoEdicao(false);
  }
};







if(loading){
  return (
    <div className="flex items-center justify-center h-screen"> carregando...</div>
  )
}


  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">

      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="page-title">
            Gestão de clientes
          </h1>

        
        </div>

        {(role === "admin" || role === "gestor") && <button
        onClick={()=>setModalAberto(true)}
          type="button"
          className="
            inline-flex items-center justify-center gap-2
            rounded-md bg-blue-700 px-4 py-2.5
            text-sm font-medium text-white shadow-sm
            transition hover:bg-blue-600
            focus:outline-none focus:ring-2
            focus:ring-blue-700 focus:ring-offset-2
          "
        >
          <FiPlus size={18} />
          Novo cliente
        </button>}

      </header>

      <div className="relative mt-6 max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
        <input
          type="search"
          value={termoPesquisa}
          onChange={(event) => setTermoPesquisa(event.target.value)}
          placeholder="Filtrar clientes por nome ou área"
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />
      </div>

      {/* Mobile */}
      <div className="mt-6 space-y-3 md:hidden">

        {clientesFiltrados.map((cliente) => (

          <article
            key={cliente.nome}
            className="
              rounded-xl border border-gray-200
              bg-white p-4 shadow-sm
            "
          >

            {/* Nome + estado */}
            <div className="flex items-start justify-between gap-3">

              <h2 className="section-title">
                {cliente.nome}
              </h2>

              <EstadoCliente estado={cliente.estado} />

            </div>

            {/* Informações */}
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">

              <div>
                <dt className="text-xs text-gray-400">
                  Área
                </dt>

                <dd className="mt-1 font-medium text-gray-700">
                  {cliente.area}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-gray-400">
                  Projetos
                </dt>

                <dd className="mt-1 font-medium text-gray-700">
                  {cliente.projetos}
                </dd>
              </div>

            </dl>

            {/* Ação */}
            <div className=" flex gap-4 mt-4 border-t border-gray-100 pt-4">



              {(role === "admin" || role === "gestor") && <button
                type="button"
                onClick={() => abrirEdicao(cliente)}
                className="
                  inline-flex w-full items-center
                  justify-center gap-2
                  rounded-md border border-gray-200
                  px-3 py-2 text-sm text-gray-600
                  transition hover:bg-gray-50
                  hover:text-gray-800
                "
              >
                <FiEdit2 size={16} />
                Editar cliente
              </button>}

              {(role === "admin" || role === "gestor") && <button
                type="button"
                onClick={() => confirmarEliminacao(cliente.id_cliente)}
                className="
                  inline-flex w-full items-center
                  justify-center gap-2
                  rounded-md border border-gray-200
                  px-3 py-2 text-sm text-gray-600
                  transition hover:bg-gray-50
                  hover:text-gray-800
                "
              >
                <FiEdit2 size={16} />
                Elimina Cliente
              </button>}


            </div>

          </article>

        ))}

      </div>

      {/* Desktop */}
      <div
        className="
          mt-6 hidden overflow-x-auto
          rounded-xl border border-gray-200
          bg-white shadow-sm md:block
        "
      >

        <table className="w-full text-left">

          <thead className="bg-gray-50">

            <tr>

              <th className="px-5 py-3 text-sm font-medium text-gray-700">
                Nome do cliente
              </th>

              <th className="px-5 py-3 text-sm font-medium text-gray-700">
                Área
              </th>

              <th className="px-5 py-3 text-sm font-medium text-gray-700">
                Projetos
              </th>

              <th className="px-5 py-3 text-sm font-medium text-gray-700">
                Estado
              </th>

              <th className="px-5 py-3 text-right text-sm font-medium text-gray-700">
                Ação
              </th>

            </tr>

          </thead>

          <tbody>

            {clientesFiltrados.map((cliente) => (

              <tr
                key={cliente.nome}
                className="border-t border-gray-100"
              >

                <td className="px-5 py-4 text-sm font-medium text-gray-800">
                  {cliente.nome}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {cliente.area}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {cliente.projetos}
                </td>

                <td className="px-5 py-4">
                  <EstadoCliente estado={cliente.estado} />
                </td>

                <td className="px-5 py-4">

                  <div className="flex gap-1 justify-end">

                     {(role === "admin" || role === "gestor") && <button
                      type="button"
                      onClick={() => abrirEdicao(cliente)}
                      title="Editar cliente"
                      className="
                        rounded-md border border-gray-200
                        p-2 text-gray-500
                        transition hover:bg-gray-50
                        hover:text-gray-800
                      "
                    >
                      <FiEdit2 size={17} />
                    </button>}

                    {(role === "admin" || role === "gestor") && <button
                      type="button"
                      onClick={() => confirmarEliminacao(cliente.id_cliente)}
                      title="Eliminar cliente"
                      className="
                         rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50
                       
                        transition 
                        hover:text-red-800
                      "
                    >
                      <FiTrash2 size={17} />
                    </button>}

                    

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {modalAberto && (
        <div
          onMouseDown={(event) => event.target === event.currentTarget && setModalAberto(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h2 className="section-title">Cadastrar Novo Cliente</h2>

            <form 
            className="mt-4 space-y-4"
            onSubmit={handleSubmit}
            >
              <div>
                <label className="block text-xs font-medium text-gray-600">Nome</label>
                <input
                  type="text"
                  required
                  value={novoCliente.nome}
                  onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="Digite o nome do cliente"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Área</label>
                <input
                  type="text"
                  required
                  value={novoCliente.area}
                  onChange={(e) => setNovoCliente({ ...novoCliente, area: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="Digite a área do cliente"
                />
              </div>
              <div>
              <label className="block text-xs font-medium text-gray-600">Projetos</label>
              <input
              type="number"
              required
              min={1}
              value={novoCliente.projetos}
              onChange={(e) => {
                const valor = parseInt(e.target.value);

                if (valor >= 1) {
                  setNovoCliente({
                    ...novoCliente,
                    projetos: valor
                  });
                }
              }}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Digite o número de projetos"
/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Estado</label>
                <select
                  required
                  value={novoCliente.estado}
                  onChange={(e) => setNovoCliente({ ...novoCliente, estado: e.target.value as "ativo" | "inativo" })}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}



              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Adicionar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {clienteEditando && (
        <div
          onMouseDown={(event) => event.target === event.currentTarget && setClienteEditando(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="section-title">Editar cliente</h2>

            <form className="mt-4 space-y-4" onSubmit={handleEditar}>
              <div>
                <label className="block text-xs font-medium text-gray-600">Nome</label>
                <input
                  type="text"
                  required
                  value={clienteEditando.nome}
                  onChange={(event) => setClienteEditando({ ...clienteEditando, nome: event.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Área</label>
                <input
                  type="text"
                  required
                  value={clienteEditando.area}
                  onChange={(event) =>
                     setClienteEditando({ ...clienteEditando, area: event.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Projetos</label>
                <input
                  type="number"
                  min="1"
                  step={1}
                  required
                  value={clienteEditando.projetos}
                  onChange={(event) => setClienteEditando({ ...clienteEditando, projetos: Number(event.target.value) })}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Estado</label>
                <select
                  required
                  value={clienteEditando.estado}
                  onChange={(event) => setClienteEditando({ ...clienteEditando, estado: event.target.value as "ativo" | "inativo" })}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClienteEditando(null)}
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoEdicao}
                  className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {salvandoEdicao ? "A guardar..." : "Guardar alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </main>
  )}