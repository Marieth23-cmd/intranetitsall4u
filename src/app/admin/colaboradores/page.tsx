"use client";

import {
  FiPlus,
  FiMail,
  FiCalendar,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

const colaboradores = [
  {
    id: 1,
    iniciais: "MP",
    nome: "Marieth Pascoal",
    cargo: "Desenvolvedora Web",
    email: "marieth@empresa.com",
    aniversario: "15 de Agosto",
    departamento: "Tecnologia",
  },
  {
    id: 2,
    iniciais: "NS",
    nome: "Nicolas Silva",
    cargo: "Responsável Técnico",
    email: "nicolas@empresa.com",
    aniversario: "20 de Setembro",
    departamento: "Tecnologia",
  },
  {
    id: 3,
    iniciais: "RF",
    nome: "Rafaela Ferreira",
    cargo: "Account Manager",
    email: "rafaela@empresa.com",
    aniversario: "8 de Outubro",
    departamento: "Contas",
  },
];

export default function ColaboradoresAdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">

      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl">
            Gestão de colaboradores
          </h1>

          
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
          Adicionar colaborador
        </button>

      </header>

      {/* Lista de colaboradores */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {colaboradores.map((colaborador) => (

          <article
            key={colaborador.id}
            className="
              rounded-xl border border-gray-200
              bg-white p-5 shadow-sm
              transition hover:border-gray-200
            "
          >

            {/* Perfil */}
            <div className="flex items-center gap-3">

              <span
                className="
                  flex h-12 w-12 shrink-0
                  items-center justify-center
                  rounded-full border border-yellow-700/40
                  text-sm font-semibold
                  text-yellow-700
                "
              >
                {colaborador.iniciais}
              </span>

              <div className="min-w-0 leading-tight">

                <p className="truncate text-sm font-semibold text-gray-800">
                  {colaborador.nome}
                </p>

                <p className="mt-1 truncate text-xs text-gray-500">
                  {colaborador.cargo}
                </p>

              </div>

            </div>

            {/* Informações */}
            <div
              className="
                mt-4 space-y-2
                border-t border-gray-100
                pt-4
              "
            >

              <p className="flex items-center gap-2 text-xs text-gray-500">

                <FiMail
                  size={14}
                  className="shrink-0 text-yellow-700"
                />

                <span className="truncate">
                  {colaborador.email}
                </span>

              </p>

              <p className="flex items-center gap-2 text-xs text-gray-500">

                <FiCalendar
                  size={14}
                  className="shrink-0 text-yellow-700"
                />

                {colaborador.aniversario}

              </p>

              <p className="pt-1 text-[11px] font-medium uppercase tracking-[0.15em] text-yellow-700">
                {colaborador.departamento}
              </p>

            </div>

            {/* Ações */}
            <div
              className="
                mt-4 flex items-center justify-end
                gap-2 border-t border-gray-100 pt-4
              "
            >

             

              {/* Editar */}
              <button
                type="button"
                title="Editar colaborador"
                className="
                  rounded-lg border border-gray-200
                  p-2 text-gray-500
                  transition hover:bg-gray-50
                  hover:text-gray-800
                "
              >
                <FiEdit2 size={17} />
              </button>

              {/* Eliminar */}
              <button
                type="button"
                title="Eliminar colaborador"
                className="
                  rounded-lg border border-red-100
                  p-2 text-red-500
                  transition hover:bg-red-50
                "
              >
                <FiTrash2 size={17} />
              </button>

            </div>

          </article>

        ))}

      </div>

    </main>
  );
}