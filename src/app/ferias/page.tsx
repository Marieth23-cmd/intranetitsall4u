"use client";

import {
  FiCalendar,
  FiClock,
  FiPlus,
} from "react-icons/fi";

const proximasFerias = {
  inicio: "15 de julho de 2024",
  fim: "26 de julho de 2024",
  dias: "10 dias",
  estado: "Aprovado",
};

const historico = [
  {
    inicio: "02 de janeiro de 2024",
    fim: "12 de janeiro de 2024",
    dias: "10 dias",
    estado: "Aprovado",
  },
  {
    inicio: "15 de agosto de 2023",
    fim: "20 de agosto de 2023",
    dias: "5 dias",
    estado: "Aprovado",
  },
];

function EstadoFerias({ estado }: { estado: string }) {
  const aprovado = estado === "Aprovado";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        aprovado
          ? "bg-green-50 text-green-700"
          : "bg-yellow-50 text-yellow-700"
      }`}
    >
      {estado}
    </span>
  );
}

export default function FeriasPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">

      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl">
            Férias
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Consulte as suas férias e acompanhe os seus pedidos.
          </p>
        </div>

        <button
          type="button"
          className="
            inline-flex items-center justify-center
            gap-2 rounded-md bg-yellow-700
            px-4 py-2.5 text-sm font-medium
            text-white shadow-sm transition
            hover:bg-yellow-600
            focus:outline-none focus:ring-2
            focus:ring-yellow-700 focus:ring-offset-2
          "
        >
          <FiPlus size={17} />
          Solicitar férias
        </button>

      </header>

      {/* Próximas férias */}
      <section className="mt-6">

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
              <FiCalendar
                size={19}
                className="text-yellow-700"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Próximas férias
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                O seu próximo período de férias.
              </p>
            </div>

          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            <div>
              <p className="text-xs text-gray-400">
                Início
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                {proximasFerias.inicio}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Fim
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                {proximasFerias.fim}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Duração
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                {proximasFerias.dias}
              </p>
            </div>

          </div>

          <div className="mt-5 border-t border-gray-100 pt-4">

            <div className="flex items-center gap-2">

             

              <span className="text-xs text-gray-500">
                Estado
              </span>

              <EstadoFerias estado={proximasFerias.estado} />

            </div>

          </div>

        </article>

      </section>

      {/* Histórico */}
      <section className="mt-6">

        <article className="rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                <FiClock
                  size={19}
                  className="text-gray-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Histórico de férias
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Consulte os períodos de férias anteriores.
                </p>
              </div>

            </div>

          </div>

          {/* Mobile */}
          <div className="space-y-3 p-4 md:hidden">

            {historico.map((ferias, index) => (

              <div
                key={index}
                className="rounded-lg border border-gray-100 p-4"
              >

                <div className="flex items-start justify-between gap-3">

                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {ferias.inicio}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      até {ferias.fim}
                    </p>
                  </div>

                  <EstadoFerias estado={ferias.estado} />

                </div>

                <p className="mt-3 text-xs text-gray-500">
                  Duração:{" "}
                  <span className="font-medium text-gray-700">
                    {ferias.dias}
                  </span>
                </p>

              </div>

            ))}

          </div>

          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">

            <table className="w-full text-left">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-6 py-3 text-sm font-medium text-gray-700">
                    Início
                  </th>

                  <th className="px-6 py-3 text-sm font-medium text-gray-700">
                    Fim
                  </th>

                  <th className="px-6 py-3 text-sm font-medium text-gray-700">
                    Duração
                  </th>

                  <th className="px-6 py-3 text-sm font-medium text-gray-700">
                    Estado
                  </th>

                </tr>

              </thead>

              <tbody>

                {historico.map((ferias, index) => (

                  <tr
                    key={index}
                    className="border-t border-gray-100"
                  >

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ferias.inicio}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ferias.fim}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ferias.dias}
                    </td>

                    <td className="px-6 py-4">
                      <EstadoFerias estado={ferias.estado} />
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </article>

      </section>

    </main>
  );
}