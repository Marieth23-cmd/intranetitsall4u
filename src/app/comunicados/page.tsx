const comunicados = [
  {
    titulo: "Novo sistema de gestão de projetos",
    descricao:
      "Estamos a implementar um novo sistema de gestão de projetos para melhorar a colaboração e a eficiência da equipa.",
    data: "10 de junho de 2024",
    local: "Sala de reuniões 1",
  },
  {
    titulo: "Reunião geral da equipa",
    descricao:
      "Será realizada uma reunião geral para apresentar as próximas atividades e alinhar os objetivos da equipa.",
    data: "12 de junho de 2024",
    local: "Sala de reuniões 1",
  },
];

export default function ComunicadosPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">
      
      <h1 className="text-2xl font-semibold text-gray-700 sm:text-3xl">
        Comunicados
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Informações e comunicados internos da empresa.
      </p>

      <div className="mt-6 space-y-4">
        {comunicados.map((comunicado, index) => (
          <article
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-800">
              {comunicado.titulo}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              {comunicado.descricao}
            </p>

            <p className="mt-4 text-xs text-gray-400">
              {comunicado.data} · {comunicado.local}
            </p>
          </article>
        ))}
      </div>

    </main>
  );
}