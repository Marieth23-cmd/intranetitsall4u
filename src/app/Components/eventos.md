
      {/* PRÓXIMOS EVENTOS */}
      <section className="mt-6">

        <article className="rounded-xl bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <FiCalendar
                size={19}
                className="text-gray-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Próximos eventos
              </h2>

              <p className="text-sm text-gray-700">
                Eventos e atividades da empresa
              </p>
            </div>

          </div>


          <div className="mt-5 grid gap-3 md:grid-cols-2">

            {eventos.map((evento) => (
              <div
                key={`${evento.mes}-${evento.dia}-${evento.titulo}`}
                className="flex items-center gap-4 rounded-lg border border-gray-100 p-4"
              >

                {/* Data */}
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-gray-50 text-center">

                  <span className="text-[10px] font-medium text-gray-500">
                    {evento.mes}
                  </span>

                  <span className="text-xl font-semibold text-gray-700">
                    {evento.dia}
                  </span>

                </div>


                {/* Informação */}
                <div>

                  <h3 className="text-sm font-medium text-gray-700">
                    {evento.titulo}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {evento.data}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {evento.local}
                  </p>

                </div>

              </div>
            ))}

          </div>

        </article>

      </section>



      async function marcarComoLido(id_comunicado: number) {
  try {
    const supabase = createClient();
    
    // 1. Descobre quem é o utilizador logado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 2. Busca o id_colaborador da tabela colaboradores usando o id do Auth
    const { data: colab } = await supabase
      .from("colaboradores")
      .select("id_colaborador")
      .eq("usuario_id", user.id)
      .single();

    if (!colab) return;

    // 3. Insere o registo de leitura (se já existir, o ON CONFLICT ignora e não duplica)
    await supabase
      .from("visualizacoes_comunicados")
      .upsert({
        comunicado_id: id_comunicado,
        colaborador_id: colab.id_colaborador
      }, { onConflict: 'comunicado_id,colaborador_id' });

  } catch (error) {
    console.error("Erro ao registar visualização:", error);
  }
}
const [leitores, setLeitores] = useState<any[]>([]);
const [modalLeitoresAberto, setModalLeitoresAberto] = useState(false);

async function verQuemViu(id_comunicado: number) {
  try {
    const supabase = createClient();

    // Faz o JOIN: Entra em visualizacoes, puxa os colaboradores e traz a data
    const { data, error } = await supabase
      .from("visualizacoes_comunicados")
      .select(`
        data_visualizacao,
        colaboradores (
          nome,
          cargo
        )
      `)
      .eq("comunicado_id", id_comunicado);

    if (!error) {
      setLeitores(data || []);
      setModalLeitoresAberto(true);
    }
  } catch (error) {
    console.error("Erro ao buscar leitores:", error);
  }
}
{modalLeitoresAberto && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
      <h2 className="text-lg font-semibold text-gray-900">Confirmados de Leitura</h2>
      <p className="text-xs text-gray-500 mt-1">Colaboradores que abriram este comunicado.</p>

      <div className="mt-4 max-h-60 overflow-y-auto space-y-3 pr-1">
        {leitores.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum colaborador viu ainda. 👁️</p>
        ) : (
          leitores.map((leitor, index) => (
            <div key={index} className="flex items-center justify-between border-b border-gray-50 pb-2 text-sm">
              <div>
                <p className="font-medium text-gray-800">{leitor.colaboradores?.nome}</p>
                <p className="text-xs text-gray-400">{leitor.colaboradores?.cargo}</p>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">
                {new Date(leitor.data_visualizacao).toLocaleDateString("pt-PT")}
              </span>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setModalLeitoresAberto(false)}
        className="mt-6 w-full rounded-md border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
      >
        Fechar Janela
      </button>
    </div>
  </div>
)}
CREATE TABLE public.visualizacoes_comunicados (
  id_visualizacao UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunicado_id INT REFERENCES public.comunicados(id_comunicados) ON DELETE CASCADE,
  colaborador_id UUID REFERENCES public.colaboradores(id_colaborador) ON DELETE CASCADE,
  data_visualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garante que o mesmo colaborador não crie linhas duplicadas se ler o mesmo comunicado 10 vezes
  CONSTRAINT colaborador_comunicado_unico UNIQUE (comunicado_id, colaborador_id)
);

-- Desativar RLS para desenvolvimento local
ALTER TABLE public.visualizacoes_comunicados DISABLE ROW LEVEL SECURITY;

