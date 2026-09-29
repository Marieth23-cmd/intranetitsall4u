"use client";
import { useState, useEffect } from "react";
import { FiPlus, FiTrash2} from "react-icons/fi";
import { toast } from "sonner";
import { createClient } from "../../../../lib/supabase/client";

type FaltaAdmin = {
  id_falta: string;
  data_falta: string;
  tipo: "justificada" | "injustificada";
  justificativa: string | null;
  colaboradores: {
    nome: string;
    cargo: string;
  } | null;
};

type ListaColaboradoresDropdown = {
  id_colaborador: string;
  nome: string;
};

export default function GestaoFaltasAdminPage() {
  const [faltas, setFaltas] = useState<FaltaAdmin[]>([]);
  const [colaboradores, setColaboradores] = useState<ListaColaboradoresDropdown[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  
  const [form, setForm] = useState({
    colaborador_id: "",
    data_falta: "",
    tipo: "injustificada",
    justificativa: ""
  });

  async function carregarDadosControlo() {
    try {
      // 1. Busca histórico de faltas na API
      const resFaltas = await fetch("/api/faltas", { cache: "no-store" });
      const dadosFaltas = await resFaltas.json();
      if (resFaltas.ok) setFaltas(dadosFaltas.faltas || []);

      // 2. Busca lista de colaboradores do dropdown para o Admin escolher a quem marcar falta
      const supabase = createClient();
      const { data } = await supabase.from("colaboradores").select("id_colaborador, nome").eq("estado", "ACTIVO");
      if (data) setColaboradores(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => { carregarDadosControlo(); }, []);

  async function handleGravarFalta(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSalvando(true);
      const res = await fetch("/api/faltas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        toast.success("Falta averbada com sucesso!");
        setModalAberto(false);
        setForm({ colaborador_id: "", data_falta: "", tipo: "injustificada", justificativa: "" });
        carregarDadosControlo();
      } else {
        const err = await res.json();
        toast.error(`Erro: ${err.error}`);
      }
    } catch (error) {
      toast.error("Erro na conexão" );
      console.log(error)
    } finally { setSalvando(false); }
  }

  async function eliminarFaltaMarcada(idFalta: string) {
    if (!confirm("Deseja mesmo anular o registo desta falta?")) return;
    try {
      const res = await fetch("/api/faltas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_falta: idFalta })
      });
      if (res.ok) {
        toast.success("Registo de falta removido!");
        carregarDadosControlo();
      }
    } catch (error) {
      console.error(error);
    }
  }


    
  // 🟢 CORREÇÃO DOS ÍNDICES DAS DATAS (Bypass de Fuso Horário)
  const dataAtual = new Date();
  const mesAtualHumano = dataAtual.getMonth() + 1; // Ex: Setembro é 9
  const anoAtual = dataAtual.getFullYear();

  // 1. Contador do Mês Atual
  const faltasNoMes = faltas.filter((f) => {
    if (!f.data_falta) return false;
    const partes = f.data_falta.split('-');
    const anoFalta = parseInt(partes[0], 10);
    const mesFaltaTexto = parseInt(partes[1], 10); 
    return mesFaltaTexto === mesAtualHumano && anoFalta === anoAtual;
  }).length;

  // 2. Trava para o input de data não permitir selecionar o futuro
  const hojeStr = dataAtual.toISOString().split("T")[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="page-title text-xl font-bold text-gray-900">Controlo de Assiduidade</h1>
          <p className="content-description mt-1 text-sm text-gray-500">
            Registe ausências e controle o histórico de faltas da empresa.
             <span className="font-semibold text-gray-700 ml-1">
              Este mês já foram registadas {faltasNoMes} faltas no total.</span>

            </p>
       
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-red-500 cursor-pointer transition"
        >
          <FiPlus size={18} />
          Marcar falta
        </button>
      </header>

      {/* SEÇÃO DE HISTÓRICO: RESPONSIVA */}
      <section className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {faltas.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">Nenhum funcionário possui faltas.</p>
        ) : (
          <>
            {/* 📱 LAYOUT PARA TELEMÓVEL */}
            <div className="block p-4 space-y-3 md:hidden">
              {faltas.map((falta) => {
                const totalFaltasColaborador = faltas.filter(
                  (f) => f.colaboradores?.nome === falta.colaboradores?.nome
                ).length;

                return (
                  <div key={falta.id_falta} className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {falta.colaboradores?.nome}{" "}
                          <span className="text-xs font-normal text-gray-400">({totalFaltasColaborador}ª falta)</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{new Date(falta.data_falta).toLocaleDateString("pt-PT")}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        falta.tipo === 'justificada' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {falta.tipo}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 italic mt-3 pt-2 border-t border-gray-200">
                      <span className="font-semibold not-italic">Motivo:</span> {falta.justificativa || "Sem observações."}
                    </p>
                    <div className="mt-3 flex justify-end">
                      <button 
                        onClick={() => eliminarFaltaMarcada(falta.id_falta)} 
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                      >
                        <FiTrash2 size={14} /> Anular Registo
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 💻 LAYOUT PARA COMPUTADOR */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Colaborador</th>
                  <th className="px-6 py-3">Data do Incidente</th>
                  <th className="px-6 py-3">Gravidade</th>
                  <th className="px-6 py-3">Observações/Motivo</th>
                  <th className="px-6 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {faltas.map((falta) => {
                  const totalFaltasColaborador = faltas.filter(
                    (f) => f.colaboradores?.nome === falta.colaboradores?.nome
                  ).length;

                  return (
                    <tr key={falta.id_falta} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {falta.colaboradores?.nome}{" "}
                        <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-1">
                          {totalFaltasColaborador}ª falta acumulada
                        </span>
                      </td>
                      <td className="px-6 py-4">{new Date(falta.data_falta).toLocaleDateString("pt-PT")}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          falta.tipo === 'justificada' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {falta.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 italic">{falta.justificativa || "Sem justificativa anexada"}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => eliminarFaltaMarcada(falta.id_falta)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer">
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </section>

      {/* MODAL DO ADMIN MARCAR FALTA */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl animate-fade-in">
            <h2 className="section-title text-base font-bold text-gray-900">Averbar Falta</h2>
            <form onSubmit={handleGravarFalta} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600">Escolha o Colaborador</label>
                <select required value={form.colaborador_id} onChange={(e) => setForm({ ...form, colaborador_id: e.target.value })} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-red-600 bg-white">
                  <option value="">Selecione um funcionário...</option>
                  {colaboradores.map(c => <option key={c.id_colaborador} value={c.id_colaborador}>{c.nome}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600">Data da Ausência</label>
                <input 
                  type="date" 
                  required 
                  max={hojeStr} // 🔒 BLOQUEIO DA DATA FUTURA: Usa a string limpa do topo
                  value={form.data_falta} 
                  onChange={(e) => setForm({ ...form, data_falta: e.target.value })} 
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-red-600" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">Classificação</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-red-600 bg-white">
                  <option value="injustificada">Injustificada</option>
                  <option value="justificada">Justificada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">Justificativa / Comentário</label>
                <input type="text" value={form.justificativa} onChange={(e) => setForm({ ...form, justificativa: e.target.value })} placeholder="Ex: Apresentou atestado médico" className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalAberto(false)} className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition">Cancelar</button>
                <button type="submit" disabled={salvando} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 transition">
                  {salvando ? "A gravar..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
