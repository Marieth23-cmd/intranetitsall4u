"use client";

import { FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";

const comunicados = [
  {
    titulo: "Novo sistema de gestão de projetos",
    descricao:
      "Estamos a implementar um novo sistema de gestão de projetos para melhorar a colaboração e a eficiência da equipa.",
    data: "10 de junho de 2024",
    local: "Sala de reuniões 1",
    estado: "Publicado",
  },
  {
    titulo: "Reunião geral da equipa",
    descricao:
      "Será realizada uma reunião geral para apresentar as próximas atividades e alinhar os objetivos da equipa.",
    data: "12 de junho de 2024",
    local: "Sala de reuniões 1",
    estado: "Publicado",
  },
];

export default function ComunicadosAdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-semibold text-gray-700 sm:text-3xl">
            Gestão de comunicados
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Crie, edite e acompanhe os comunicados internos da empresa.
          </p>
        </div>

        <button
          className="
            inline-flex items-center justify-center gap-2
            rounded-lg bg-yellow-700 px-4 py-2.5
            text-sm font-medium text-white
            hover:bg-yellow-600
          "
        >
          <FiPlus size={18} />
          Novo comunicado
        </button>

      </div>

      <div className="mt-6 space-y-4">

        {comunicados.map((comunicado, index) => (

          <article
            key={index}
            className="
              rounded-lg border border-gray-200
              bg-white p-5 shadow-sm
            "
          >

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div className="max-w-3xl">

                <div className="flex items-center gap-3">

                  <h2 className="text-lg font-semibold text-gray-800">
                    {comunicado.titulo}
                  </h2>

                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    {comunicado.estado}
                  </span>

                </div>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {comunicado.descricao}
                </p>

                <p className="mt-4 text-xs text-gray-400">
                  {comunicado.data} · {comunicado.local}
                </p>

              </div>

              <div className="flex items-center gap-2">

                <button
                  className="
                    rounded-lg border border-gray-200 p-2
                    text-gray-500 hover:bg-gray-50
                  "
                  title="Visualizar"
                >
                  <FiEye size={18} />
                </button>

                <button
                  className="
                    rounded-lg border border-gray-200 p-2
                    text-gray-500 hover:bg-gray-50
                  "
                  title="Editar"
                >
                  <FiEdit2 size={18} />
                </button>

                <button
                  className="
                    rounded-lg border border-red-100 p-2
                    text-red-500 hover:bg-red-50
                  "
                  title="Eliminar"
                >
                  <FiTrash2 size={18} />
                </button>

              </div>

            </div>

          </article>

        ))}

      </div>

    </main>
  );
}