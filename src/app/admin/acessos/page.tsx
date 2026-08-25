"use client";

import { FiEdit2, FiLock, FiUsers } from "react-icons/fi";

const perfis = [
  {
    nome: "Administrador",
    utilizadores: 1,
    tipo: "Acesso total",
    permissoes: [
      "Gerir colaboradores",
      "Gerir comunicados",
      "Gerir clientes",
      "Gerir documentos",
      "Gerir férias e ausências",
      "Gerir acessos e permissões",
      "Aceder às definições",
    ],
  },
  {
    nome: "Líder",
    utilizadores: 2,
    tipo: "Acesso limitado",
    permissoes: [
      "Consultar colaboradores",
      "Consultar comunicados",
      "Consultar documentos",
      "Gerir pedidos da equipa",
    ],
  },
  {
    nome: "Colaborador",
    utilizadores: 8,
    tipo: "Acesso básico",
    permissoes: [
      "Consultar comunicados",
      "Consultar documentos",
      "Consultar clientes",
      "Criar pedidos de férias e ausências",
    ],
  },
];

export default function AcessosAdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">

      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl">
          Acessos e permissões
        </h1>

        
      </header>

      {/* Resumo */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
              <FiUsers
                size={19}
                className="text-yellow-700"
              />
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Perfis de acesso
              </p>

              <p className="mt-1 text-2xl font-semibold text-gray-800">
                {perfis.length}
              </p>
            </div>

          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
              <FiLock
                size={19}
                className="text-yellow-700"
              />
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Utilizadores abrangidos
              </p>

              <p className="mt-1 text-2xl font-semibold text-gray-800">
                {perfis.reduce(
                  (total, perfil) => total + perfil.utilizadores,
                  0
                )}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Perfis */}
      <section className="mt-8">

        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Perfis de acesso
          </h2>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">

          {perfis.map((perfil) => (

            <article
              key={perfil.nome}
              className="
              flex flex-col
                rounded-xl border border-gray-200
                bg-white p-5 shadow-sm
              "
            >

              {/* Cabeçalho do cartão */}
              <div className="flex items-start justify-between gap-3">

                <div>
                  <h3 className="text-base font-semibold text-gray-800">
                    {perfil.nome}
                  </h3>

                 
                </div>

                <span
                  className="
                    shrink-0 rounded-full
                    bg-yellow-50 px-2.5 py-1
                    text-[11px] font-medium
                    text-yellow-700
                  "
                >
                  {perfil.tipo}
                </span>

              </div>

              {/* Número de utilizadores */}
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">

                <FiUsers size={14} />

                {perfil.utilizadores}{" "}
                {perfil.utilizadores === 1
                  ? "utilizador"
                  : "utilizadores"}

              </div>

              {/* Permissões */}
              <div className="mt-4 border-t border-gray-100 pt-4">

                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Permissões
                </p>

                <ul className="mt-3 space-y-2">

                  {perfil.permissoes.map((permissao) => (

                    <li
                      key={permissao}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-700" />

                      <span>
                        {permissao}
                      </span>
                    </li>

                  ))}

                </ul>

              </div>

              {/* Ação */}
              <div className="mt-auto border-t border-gray-100 pt-4">

                <button
                  type="button"
                  className="
                    inline-flex w-full
                    items-center justify-center
                    gap-2 rounded-md
                    border border-gray-200
                    px-3 py-2
                    text-sm text-gray-600
                    transition
                    hover:bg-gray-50
                    hover:text-gray-800
                  "
                >
                  <FiEdit2 size={16} />
                  Editar permissões
                </button>

              </div>

            </article>

          ))}

        </div>

      </section>

    </main>
  );
}