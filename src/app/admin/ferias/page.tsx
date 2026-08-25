"use client";

import {
  FiCalendar,FiCheck, FiClock,FiX} from "react-icons/fi";

const ferias = [
  {
    id: 1,
    colaborador: "João Silva",
    inicio: "15 de julho de 2024",
    fim: "26 de julho de 2024",
    dias: "10 dias",
    estado: "Pendente",
  },
  {
    id: 2,
    colaborador: "Ana Costa",
    inicio: "18 de julho de 2024",
    fim: "22 de julho de 2024",
    dias: "5 dias",
    estado: "Aprovado",
  },
  {
    id: 3,
    colaborador: "Maria Santos",
    inicio: "22 de julho de 2024",
    fim: "02 de agosto de 2024",
    dias: "10 dias",
    estado: "Aprovado",
  },
  {
    id: 4,
    colaborador: "Pedro Manuel",
    inicio: "05 de agosto de 2024",
    fim: "09 de agosto de 2024",
    dias: "5 dias",
    estado: "Reprovado",
  },
];

function EstadoFerias({ estado }: { estado: string }) {
  if (estado === "Aprovado") {
    return (
      <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
        Aprovado
      </span>
    );
  }

  if (estado === "Reprovado") {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        Reprovado
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
      Pendente
    </span>
  );
}

export default function FeriasAdminPage() {
  const pedidosPendentes = ferias.filter(
    (ferias) => ferias.estado === "Pendente"
  ).length;

  const feriasAprovadas = ferias.filter(
    (ferias) => ferias.estado === "Aprovado"
  ).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">

      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Gestão de férias
        </h1>

       
      </header>

      {/* Estatísticas */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                De férias
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-800">
                3
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
              <FiCalendar
                size={19}
                className="text-yellow-700"
              />
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Próximas férias
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-800">
                5
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
              <FiClock
                size={19}
                className="text-gray-600"
              />
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Pedidos pendentes
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-800">
                {pedidosPendentes}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
              <FiClock
                size={19}
                className="text-yellow-700"
              />
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Férias aprovadas
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-800">
                {feriasAprovadas}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <FiCheck
                size={19}
                className="text-green-600"
              />
            </div>
          </div>
        </article>

      </section>

      {/* Quem está de férias */}
      <section className="mt-6">

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

            <h2 className="text-lg font-semibold text-gray-800">
              Colaboradores que estão de férias 
            </h2>

           

          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">

            <article className="rounded-lg border border-gray-100 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50 text-sm font-semibold text-yellow-700">
                  JS
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-800">
                    João Silva
                  </p>

                  <p className="text-xs text-gray-500">
                    15 Jul — 26 Jul
                  </p>
                </div>

              </div>

            </article>

            <article className="rounded-lg border border-gray-100 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50 text-sm font-semibold text-yellow-700">
                  AC
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Ana Costa
                  </p>

                  <p className="text-xs text-gray-500">
                    18 Jul — 22 Jul
                  </p>
                </div>

              </div>

            </article>

          </div>

        </div>

      </section>

      {/* Pedidos */}
      <section className="mt-6">

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

            <h2 className="text-lg font-semibold text-gray-800">
              Pedidos de férias
            </h2>

            

          </div>

          {/* Mobile */}
          <div className="space-y-3 p-4 md:hidden">

            {ferias.map((pedido) => (

              <article
                key={pedido.id}
                className="rounded-lg border border-gray-100 p-4"
              >

                <div className="flex items-start justify-between gap-3">

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {pedido.colaborador}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {pedido.inicio} — {pedido.fim}
                    </p>
                  </div>

                  <EstadoFerias estado={pedido.estado} />

                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <div>
                    <p className="text-xs text-gray-400">
                      Duração
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {pedido.dias}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Estado
                    </p>

                    <div className="mt-1">
                      <EstadoFerias estado={pedido.estado} />
                    </div>
                  </div>

                </div>

                {pedido.estado === "Pendente" && (
                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">

                    <button
                      type="button"
                      className="
                        inline-flex flex-1 items-center justify-center
                        gap-2 rounded-md bg-green-600
                        px-3 py-2 text-sm font-medium text-white
                        transition hover:bg-green-700
                      "
                    >
                      <FiCheck size={16} />
                      Aprovar
                    </button>

                    <button
                      type="button"
                      className="
                        inline-flex flex-1 items-center justify-center
                        gap-2 rounded-md border border-gray-200
                        px-3 py-2 text-sm font-medium text-gray-600
                        transition hover:bg-gray-50
                      "
                    >
                      <FiX size={16} />
                      Reprovar
                    </button>

                  </div>
                )}

              </article>

            ))}

          </div>

          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">

            <table className="w-full min-w-[800px] text-left">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-5 py-3 text-sm font-medium text-gray-700">
                    Colaborador
                  </th>

                  <th className="px-5 py-3 text-sm font-medium text-gray-700">
                    Período
                  </th>

                  <th className="px-5 py-3 text-sm font-medium text-gray-700">
                    Duração
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

                {ferias.map((pedido) => (

                  <tr
                    key={pedido.id}
                    className="border-t border-gray-100"
                  >

                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      {pedido.colaborador}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {pedido.inicio} — {pedido.fim}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {pedido.dias}
                    </td>

                    <td className="px-5 py-4">
                      <EstadoFerias estado={pedido.estado} />
                    </td>

                    <td className="px-5 py-4">

                      {pedido.estado === "Pendente" ? (
                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            title="Aprovar pedido"
                            className="
                              inline-flex items-center gap-1.5
                              rounded-md bg-green-600
                              px-3 py-2 text-xs font-medium
                              text-white transition
                              hover:bg-green-700
                            "
                          >
                            <FiCheck size={15} />
                            Aprovar
                          </button>

                          <button
                            type="button"
                            title="Reprovar pedido"
                            className="
                              inline-flex items-center gap-1.5
                              rounded-md border border-gray-200
                              px-3 py-2 text-xs font-medium
                              text-gray-600 transition
                              hover:bg-gray-50
                            "
                          >
                            <FiX size={15} />
                            Reprovar
                          </button>

                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          —
                        </span>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </section>

    </main>
  );
}