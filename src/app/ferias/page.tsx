"use client";
import {useState , useEffect} from "react"
import {useRouter} from "next/navigation"
import { createClient } from "../../../lib/supabase/client";
import {FiCalendar,FiClock,FiPlus,} from "react-icons/fi";
import { toast } from "sonner";



type PedidoFerias ={
  id_ferias: string ,
  data_inicio:string , 
  data_fim: string,
  estado_ferias: "pendente"|"aprovado" | "reprovado",
  data_solicitacao:string
}

type DadosPerfilFerias = {
  dias_totais: number;
  dias_gozados: number;
  dias_pendentes: number;
  dias_disponiveis: number;
  elegivel: boolean;
  meses_trabalhados: number;
  mensagem: string;
};



function  EstadoFerias({estado } : {estado:string}){
  const est =(estado ||  "pendente").toLocaleLowerCase()
   if (est === "aprovado") {
    return <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">Aprovado</span>;
  }
  if (est === "reprovado") {
    return <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">Reprovado</span>;
  }
  return <span className="inline-flex rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">Pendente</span>;
}





export default function FeriasPage() {
const [autorizado , setAutorizado] =useState(false)
const [verificandoAcesso, setVerificandoAcesso] = useState(true)
const [carregandoDados, setCarregandoDados] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();
 

  const [saldo, setSaldo] = useState<DadosPerfilFerias>({
    dias_totais: 0,
    dias_gozados: 0,
    dias_pendentes: 0,
    dias_disponiveis: 0,
    elegivel: false,
    meses_trabalhados: 0,
    mensagem: "A calcular...",
  });

  const [listaPedidos, setListaPedidos] = useState<PedidoFerias[]>([]);
  const [form, setForm] = useState({ data_inicio: "", data_fim: "" });



useEffect(()=>{
 async function verificarAcessoColaborador() {
try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const { data: perfil } = user
          ? await supabase
            .from("usuarios")
            .select("role")
            .eq("id_usuario", user.id)
            .maybeSingle()
          : { data: null };
        const role = perfil?.role;

        if (role === "colaborador" || role === "gestor") {
          setAutorizado(true);
          
        } else if (role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.log("Erro ao verificar utilizador logado", error);
        router.replace("/login");
      } finally {
        setVerificandoAcesso(false);
      }
    }

    verificarAcessoColaborador();



 }, [router])


 async function carregarMinhasFerias() {
  try {
    setCarregandoDados(true);
    
    // Puxa as férias
    const resposta = await fetch("/api/ferias", { cache: "no-store" });
    const dados = await resposta.json();
    if (resposta.ok) {
      setListaPedidos(dados.pedidos || []);
      if (dados.saldo) setSaldo(dados.saldo);
    } else {
      toast.error(dados.error || "Não foi possível carregar os dados de férias.");
    }
  } catch (error) {
    console.error("Erro ao ler dados de férias:", error);
  } finally {
    setCarregandoDados(false);
  }
}

useEffect(()=>{
  if (!autorizado) return;
  void carregarMinhasFerias();
}, [autorizado])

async function lidarSolicitacaoFerias(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const hojeLocal = new Date();
  const hojeFormatado = [
    hojeLocal.getFullYear(),
    String(hojeLocal.getMonth() + 1).padStart(2, "0"),
    String(hojeLocal.getDate()).padStart(2, "0"),
  ].join("-");

  if (!form.data_inicio || !form.data_fim) {
    toast.error("Selecione as datas de início e fim.");
    return;
  }

  if (form.data_fim < form.data_inicio) {
    toast.error("A data de fim não pode ser anterior à data de início.");
    return;
  }

  if (form.data_inicio < hojeFormatado || form.data_fim < hojeFormatado) {
    toast.error("Não é possível solicitar férias em datas passadas.");
    return;
  }

  try {
    setSalvando(true);
    const resposta = await fetch("/api/ferias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const dados = await resposta.json();

    if (!resposta.ok) {
      toast.error(dados.error || "Não foi possível submeter o pedido.");
      return;
    }

    toast.success("Pedido de férias enviado com sucesso.");
    setForm({ data_inicio: "", data_fim: "" });
    setModalAberto(false);
    await carregarMinhasFerias();
  } catch (error) {
    console.error("Erro ao submeter pedido de férias:", error);
    toast.error("Não foi possível submeter o pedido.");
  } finally {
    setSalvando(false);
  }
}


    const proximasFeriasReal= listaPedidos.find(p=> p.estado_ferias === "aprovado")
    const historicoReal = listaPedidos.filter(p=>p.id_ferias !==  proximasFeriasReal?.id_ferias)

    function calcularDias(inicio: string, fim: string) {
      const diffTime = Math.abs(
        new Date(fim).getTime() - new Date(inicio).getTime()
      );
      const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return `${diffDias} ${diffDias === 1 ? "dia" : "dias"}`;
    }

    function formatarData(datastr: string) {
      if (!datastr) return "_";
      return new Date(datastr).toLocaleDateString("pt-PT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    }


 if (verificandoAcesso) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Carregando...</div>;
  }

  if (!autorizado) {
    return <div className="flex h-screen items-center justify-center text-blue-600">A redirecionar para o painel administrativo...</div>;
  }

  if (carregandoDados) {
    return <div className="flex h-screen items-center justify-center text-gray-500">A carregar férias...</div>;
  }



  // Calcula o saldo com base nos campos disponibilizados pelo perfil.
  const diasTotais = saldo.dias_totais;
  const diasDisponiveis = saldo.dias_disponiveis;
  const saldoEsgotado = !saldo.elegivel || diasDisponiveis <= 0;

const hojeData = new Date();
const hoje = [
  hojeData.getFullYear(),
  String(hojeData.getMonth() + 1).padStart(2, "0"),
  String(hojeData.getDate()).padStart(2, "0"),
].join("-");

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">

      {/* Cabeçalho Uniforme */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Férias
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Consulte as suas férias e acompanhe os seus pedidos regulamentares.
          </p>
        </div>
            
        <button
          type="button"
          disabled={saldoEsgotado}
          title={saldoEsgotado ? saldo.mensagem : "Solicitar férias"}
          onClick={() => setModalAberto(true)}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm transition ${
            saldoEsgotado
              ? "bg-gray-400 cursor-not-allowed opacity-60" 
              : "bg-blue-600 hover:bg-blue-500 cursor-pointer"
          }`}
        >
          <FiPlus size={17} />
          {saldoEsgotado
            ? saldo.elegivel ? "Saldo de férias esgotado" : "Ainda não elegível"
            : "Solicitar férias"}
        </button>
      </header>

      {!saldo.elegivel && (
        <p className="mt-3 text-sm text-amber-700" role="status">
          {saldo.mensagem}
        </p>
      )}

      {/* 📊 METRICAS DE SALDO DE FÉRIAS CORRIGIDAS COM A API */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Dias Totais de Direito</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-800">{diasTotais}</span>
            <span className="text-xs text-gray-500">Dias adquiridos</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Dias Disponíveis Restantes</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${diasDisponiveis <= 5 ? 'text-red-600' : 'text-green-600'}`}>
              {diasDisponiveis}
            </span>
            <span className="text-xs text-gray-500">Dias livres para uso</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Gozados: {saldo.dias_gozados} · Pendentes: {saldo.dias_pendentes}
          </p>
        </div>
      </div>

      {/* Próximas férias */}
      <section className="mt-6">
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <FiCalendar size={19} className="text-blue-600" />
            </div>
            <div>
              <h2 className="section-title">Próximas férias</h2>
              <p className="content-description mt-1">O seu próximo período de férias planeado.</p>
            </div>
          </div>

          {!proximasFeriasReal ? (
            <p className="mt-6 text-sm text-gray-400 text-center py-4 border border-dashed border-gray-100 rounded-lg">
              Não tem nenhum período de férias aprovado agendado de momento.
            </p>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-400">Início</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {formatarData(proximasFeriasReal.data_inicio)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Fim</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {formatarData(proximasFeriasReal.data_fim)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Duração</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {calcularDias(proximasFeriasReal.data_inicio, proximasFeriasReal.data_fim)}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Estado</span>
                  <EstadoFerias estado={proximasFeriasReal.estado_ferias} />
                </div>
              </div>
            </>
          )}
        </article>

      </section>

      {/* Histórico */}
       <section className="mt-6">
        <article className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                <FiClock size={19} className="text-gray-600" />
              </div>
              <div>
                <h2 className="section-title">Histórico de pedidos</h2>
                <p className="content-description mt-1">Consulte os períodos de férias anteriores ou solicitações em análise.</p>
              </div>
            </div>
          </div>

          {historicoReal.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nenhum registo no histórico encontrado.</p>
          ) : (
            <>
              {/* Layout Mobile */}
              <div className="space-y-3 p-4 md:hidden">
                {historicoReal.map((ferias) => (
                  <div key={ferias.id_ferias} className="rounded-lg border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{formatarData(ferias.data_inicio)}</p>
                        <p className="mt-1 text-xs text-gray-400">até {formatarData(ferias.data_fim)}</p>
                      </div>
                      <EstadoFerias estado={ferias.estado_ferias} />
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Duração: <span className="font-medium text-gray-700">{calcularDias(ferias.data_inicio, ferias.data_fim)}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Layout Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-sm font-medium text-gray-700">Início</th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-700">Fim</th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-700">Duração</th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicoReal.map((ferias) => (
                      <tr key={ferias.id_ferias} className="border-t border-gray-100 transition hover:bg-gray-50/50">
                        <td className="px-6 py-4 text-sm text-gray-600">{formatarData(ferias.data_inicio)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatarData(ferias.data_fim)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{calcularDias(ferias.data_inicio, ferias.data_fim)}</td>
                        <td className="px-6 py-4">
                          <EstadoFerias estado={ferias.estado_ferias} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </article>
      </section>


      {/* MODAL DE SOLICITAÇÃO DE FÉRIAS */}
{modalAberto && (
  <div
    onMouseDown={(event) => event.target === event.currentTarget && setModalAberto(false)}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150"
  >
    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150">
      <h2 className="section-title">Solicitar Período de Férias</h2>
      <p className="content-caption mt-1">Indique as datas pretendidas para a sua ausência.</p>

      <form onSubmit={lidarSolicitacaoFerias} className="mt-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600">Data de Início</label>
          <input
           type="date"
            required
            min={hoje}
            value={form.data_inicio}
            onChange={(e) =>
              setForm({ ...form, data_inicio: e.target.value })
            }
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600">Data de Fim</label>
          <input
              type="date"
              required
              min={form.data_inicio || hoje}
              value={form.data_fim}
              onChange={(e) =>
                setForm({ ...form, data_fim: e.target.value })
    }
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setModalAberto(false)}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
          >
            {salvando ? "A enviar..." : "Submeter Pedido"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}


    </main>
  );
}