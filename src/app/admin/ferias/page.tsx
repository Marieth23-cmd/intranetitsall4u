"use client";
import { useState , useEffect} from "react";
import { createClient } from "../../../../lib/supabase/client";
import {useRouter} from "next/navigation"
import { FiCalendar, FiCheck, FiClock, FiX} from "react-icons/fi";
import { toast } from "sonner";

type PedidoFerias = {
  id_ferias: string;
  data_inicio: string;
  data_fim: string;
  estado_ferias: "pendente" | "aprovado" | "reprovado";
  data_solicitacao: string;
  colaboradores: {
    id_colaborador: string;
    nome: string;
  } | null;
};

// Lógica de Férias (Lei Geral): Conta apenas dias úteis e inclui o dia inicial e final
function calcularDiasUteis(dataStrInicio: string, dataStrFim: string): number {
  const inicio = new Date(dataStrInicio.replace(/-/g, '\/'));
  const fim = new Date(dataStrFim.replace(/-/g, '\/'));
  
  let contagemDias = 0;
  const dataAtual = new Date(inicio);

  while (dataAtual <= fim) {
    const diaDaSemana = dataAtual.getDay();
    if (diaDaSemana !== 0 && diaDaSemana !== 6) {
      contagemDias++;
    }
    dataAtual.setDate(dataAtual.getDate() + 1);
  }
  
  return contagemDias;
}

function EstadoFerias({ estado }: { estado: string }) {
  const estadoFormatado = estado.toLowerCase();

  if (estadoFormatado === "aprovado") {
    return (
      <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
        Aprovado
      </span>
    );
  }

  if (estadoFormatado === "reprovado") {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        Reprovado
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
      Pendente
    </span>
  );
}

export default function FeriasAdminPage() {
 const [pedidos, setPedidos] = useState<PedidoFerias[]>([]);
 const [loading, setLoading] = useState(true);
 const [autorizado, setAutorizado] = useState(false);
 const [verificandoAcesso, setVerificandoAcesso] = useState(true)
 const router = useRouter()


 
  useEffect(() => {
    async function verificarAcessoAdmin() {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const role = user?.user_metadata?.role;

        if (role === "admin") {
          setAutorizado(true);
        } else {
          router.replace("/");
        }
      } catch (error) {
        console.error("Erro na verificação de segurança:", error);
        router.replace("/login");
      } finally {
        setLoading(false);
        setVerificandoAcesso(false)
      }
    }

    verificarAcessoAdmin();
  }, [router]);

 async function carregarPedidos() {
    try {
      setLoading(true);
      const resposta = await fetch("/api/ferias", { cache: "no-store" });
      const dados = await resposta.json();
      if (resposta.ok) {
        setPedidos(dados.pedidos || []);
      }
    } catch (error) {
      console.error("Erro ao carregar férias:", error);
    } finally {
      setLoading(false);
    }
  }

  async function responderPedido(id_ferias: string, decisao: "aprovado" | "reprovado") {
    try {
      const resposta = await fetch("/api/ferias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_ferias, novo_estado: decisao }),
      });

      if (resposta.ok) {
        toast.success(`Pedido alterado para ${decisao} com sucesso!`);
        carregarPedidos(); 
      } else {
        const dados = await resposta.json();
        toast.error(`Erro: ${dados.error}`);
      }
    } catch (error) {
      console.error("Erro ao processar decisão:", error);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  const pedidosPendentes = pedidos.filter(p => p.estado_ferias.toLowerCase() === "pendente").length;
  const feriasAprovadas = pedidos.filter(p => p.estado_ferias.toLowerCase() === "aprovado").length;

  // Força o "Hoje" a ignorar horas para evitar inconsistências nos filtros de data
  const hoje = new Date();
  hoje.setHours(0,0,0,0);

  // 1. Filtro: Quem está de férias HOJE
  const deFeriasHoje = pedidos.filter((p) => {
    if (p.estado_ferias.toLowerCase() !== "aprovado") return false; 
    const Inicio = new Date(p.data_inicio.replace(/-/g, '\/'));
    const Fim = new Date(p.data_fim.replace(/-/g, '\/'));
    return Inicio <= hoje && hoje <= Fim;
  });

  // 2. Filtro Dinâmico: Colaboradores que ainda NÃO saíram de férias (Férias agendadas para o futuro)
  const colaboradoresComProximasFerias = pedidos.filter((p) => {
    if (p.estado_ferias.toLowerCase() !== "aprovado") return false;
    const Inicio = new Date(p.data_inicio.replace(/-/g, '\/'));
    return Inicio > hoje; // A data de início ainda vai acontecer
  });

  // Remove duplicados para contar apenas o número de COLABORADORES únicos que vão gozar férias
  const idColaboradoresUnicos = new Set(
    colaboradoresComProximasFerias
      .map(p => p.colaboradores?.id_colaborador)
      .filter(Boolean)
  );
  const totalProximasFerias = idColaboradoresUnicos.size;

  if(loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-700">Carregando...</p>
      </div>
    );
  }


  


  if (verificandoAcesso || loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">A carregar portal...</div>;
  }

  if (!autorizado) {
    return <div className="flex h-screen items-center justify-center text-blue-700">A redirecionar para o painel administrativo...</div>;
  }




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
              <p className="text-sm text-gray-500">De férias</p>
              <p className="mt-2 text-2xl font-semibold text-gray-800">{deFeriasHoje.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <FiCalendar size={19} className="text-blue-700" />
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Próximas férias</p>
              <p className="mt-2 text-2xl font-semibold text-gray-800">{totalProximasFerias}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
              <FiClock size={19} className="text-gray-600" />
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pedidos pendentes</p>
              <p className="mt-2 text-2xl font-semibold text-gray-800">{pedidosPendentes}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <FiClock size={19} className="text-blue-700" />
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Férias aprovadas</p>
              <p className="mt-2 text-2xl font-semibold text-gray-800">{feriasAprovadas}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <FiCheck size={19} className="text-green-600" />
            </div>
          </div>
        </article>
      </section>

      {/* Quem está de férias agora */}
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {deFeriasHoje.map((pedido) => {
          const iniciais = pedido.colaboradores?.nome?.substring(0, 2).toUpperCase() || "CB";
          return (
            <article key={pedido.id_ferias} className="rounded-lg border border-gray-100 p-4 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">{iniciais}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{pedido.colaboradores?.nome}</p>
                  <p className="text-xs text-gray-500">Até {new Date(pedido.data_fim.replace(/-/g, '\/')).toLocaleDateString("pt-PT")}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Lista Geral dos Pedidos */}
      <section className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm p-4 grid gap-4">
        {pedidos.map((pedido) => {

           const dataInicio = new Date(pedido.data_inicio);
            const dataFim = new Date(pedido.data_fim);

            
            const inicioFormatado = dataInicio.toLocaleDateString("pt-PT");
            const fimFormatado = dataFim.toLocaleDateString("pt-PT");

           
            const diferencaTempo = Math.abs(dataFim.getTime() - dataInicio.getTime());
            const totalDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24)) + 1;


          const diffDays = calcularDiasUteis(pedido.data_inicio, pedido.data_fim);

          return (
            <article key={pedido.id_ferias} className="rounded-lg border border-gray-100 p-4 bg-gray-50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{pedido.colaboradores?.nome}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {inicioFormatado} — {fimFormatado} ({totalDias} dias corridos)
                  </p>
                  <p className="text-xs text-gray-600 font-medium mt-1">Duração: {diffDays} dias úteis</p>
                </div>
                <EstadoFerias estado={pedido.estado_ferias} />
              </div>

              {/* Ações de aprovação */}
              {pedido.estado_ferias.toLowerCase() === "pendente" && (
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-200 pt-3">
                  <button
                    onClick={() => responderPedido(pedido.id_ferias, "reprovado")}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <FiX /> Recusar
                  </button>
                  <button
                    onClick={() => responderPedido(pedido.id_ferias, "aprovado")}
                    className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    <FiCheck /> Aprovar
                  </button>

                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
