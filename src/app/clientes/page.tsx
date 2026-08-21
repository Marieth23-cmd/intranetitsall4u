const clientes = [
  { nome: "Aliança Seguros", area: "Seguros", projetos: "10", estado: "Ativo" },
  { nome: "ZON", area: "Telecomunicações", projetos: "10", estado: "Ativo" },
  { nome: "Bwizer", area: "Saúde", projetos: "10", estado: "Inativo" },
];

function EstadoCliente({ estado }: { estado: string }) {
  const ativo = estado === "Ativo";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        ativo ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}
    >
      {estado}
    </span>
  );
}

export default function ClientesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Clientes</h1>
        <p className="mt-1 text-sm text-gray-500">Pesquise clientes e informações autorizadas.</p>
      </header>

      <form role="search" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="pesquisa-clientes" className="sr-only">Pesquisar clientes</label>
        <input
          id="pesquisa-clientes"
          type="search"
          placeholder="Pesquisar clientes"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-yellow-700 focus:ring-1 focus:ring-yellow-700 sm:max-w-md"
        />
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-md bg-yellow-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:ring-offset-2 sm:w-auto"
        >
          Pesquisar
        </button>
      </form>

      {/* Cartões no telemóvel: evitam uma tabela comprimida ou com scroll lateral. */}
      <div className="mt-6 space-y-3 md:hidden">
        {clientes.map((cliente) => (
          <article key={cliente.nome} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-800">{cliente.nome}</h2>
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
