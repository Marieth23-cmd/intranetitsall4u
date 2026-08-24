"use client";

import {
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit2,
} from "react-icons/fi";

const clientes = [
  {
    nome: "Aliança Seguros",
    area: "Seguros",
    projetos: "10",
    estado: "Ativo",
  },
  {
    nome: "ZON",
    area: "Telecomunicações",
    projetos: "10",
    estado: "Ativo",
  },
  {
    nome: "Bwizer",
    area: "Saúde",
    projetos: "10",
    estado: "Inativo",
  },
];

function EstadoCliente({ estado }: { estado: string }) {
  const ativo = estado === "Ativo";

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
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">

      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            Gestão de clientes
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Consulte e faça a gestão dos clientes da empresa.
          </p>
        </div>

        <button
          type="button"
          className="
            inline-flex items-center justify-center gap-2
            rounded-md bg-yellow-700 px-4 py-2.5
            text-sm font-medium text-white shadow-sm
            transition hover:bg-yellow-600
            focus:outline-none focus:ring-2
            focus:ring-yellow-700 focus:ring-offset-2
          "
        >
          <FiPlus size={18} />
          Novo cliente
        </button>

      </header>

      {/* Pesquisa */}
      <form
        role="search"
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <label
          htmlFor="pesquisa-clientes"
          className="sr-only"
        >
          Pesquisar clientes
        </label>

        <input
          id="pesquisa-clientes"
          type="search"
          placeholder="Pesquisar clientes"
          className="
            w-full rounded-lg border border-gray-300
            px-4 py-2.5 text-sm outline-none transition
            focus:border-yellow-700
            focus:ring-1 focus:ring-yellow-700
            sm:max-w-md
          "
        />

        <button
          type="submit"
          className="
            inline-flex w-full items-center justify-center gap-2
            rounded-md bg-yellow-700 px-4 py-2.5
            text-sm font-medium text-white shadow-sm
            transition hover:bg-yellow-600
            focus:outline-none focus:ring-2
            focus:ring-yellow-700 focus:ring-offset-2
            sm:w-auto
          "
        >
          <FiSearch size={17} />
          Pesquisar
        </button>
      </form>

      {/* Mobile */}
      <div className="mt-6 space-y-3 md:hidden">

        {clientes.map((cliente) => (
          <article
            key={cliente.nome}
            className="
              rounded-xl border border-gray-200
              bg-white p-4 shadow-sm
            "
          >
            <div className="flex items-start justify-between gap-3">

              <h2 className="text-base font-semibold text-gray-800">
                {cliente.nome}
              </h2>

              <EstadoCliente estado={cliente.estado} />

            </div>

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

            <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">

              <button
                type="button"
                className="
                  inline-flex flex-1 items-center justify-center
                  gap-2 rounded-md border border-gray-200
                  px-3 py-2 text-sm text-gray-600
                  hover:bg-gray-50
                "
              >
                <FiEye size={16} />
                Ver
              </button>

              <button
                type="button"
                className="
                  inline-flex flex-1 items-center justify-center
                  gap-2 rounded-md border border-gray-200
                  px-3 py-2 text-sm text-gray-600
                  hover:bg-gray-50
                "
              >
                <FiEdit2 size={16} />
                Editar
              </button>

            </div>

          </article>
        ))}

      </div>

      {/* Desktop */}
      <div
        className="
          mt-6 hidden overflow-x-auto rounded-xl
          border border-gray-200 bg-white shadow-sm md:block
        "
      >
        <table className="w-full min-w-[760px] text-left">

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
                Ações
              </th>

            </tr>
          </thead>

          <tbody>

            {clientes.map((cliente) => (

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

                  <div className="flex justify-end gap-2">

                    <button
                      type="button"
                      title="Visualizar cliente"
                      className="
                        rounded-md border border-gray-200
                        p-2 text-gray-500
                        hover:bg-gray-50
                      "
                    >
                      <FiEye size={17} />
                    </button>

                    <button
                      type="button"
                      title="Editar cliente"
                      className="
                        rounded-md border border-gray-200
                        p-2 text-gray-500
                        hover:bg-gray-50
                      "
                    >
                      <FiEdit2 size={17} />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>
      </div>

    </div>
  );
}