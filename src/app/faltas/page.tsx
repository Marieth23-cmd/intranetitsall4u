"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { FiAlertCircle, FiCheckCircle, FiClock, FiCalendar } from "react-icons/fi";

type OcorrenciaFalta = {
  id_falta: string;
  data_falta: string;
  tipo: "justificada" | "injustificada";
  justificativa: string | null;
};

export default function FaltasColaboradorPage() {
  const [autorizado, setAutorizado] = useState(false);
  const [verificandoAcesso, setVerificandoAcesso] = useState(true);
  const [faltas, setFaltas] = useState<OcorrenciaFalta[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(false);
  const router = useRouter();

  // 1. Guard de Segurança Estrito para o Colaborador
  useEffect(() => {
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
  }, [router]);

  // 2. Carrega as faltas reais do colaborador logado
  useEffect(() => {
    async function carregarMinhasFaltas() {
      if (!autorizado) return;
      try {
        setCarregandoDados(true);
        const resposta = await fetch("/api/faltas", { cache: "no-store" });
        const dados = await resposta.json();
        if (resposta.ok) {
          setFaltas(dados.faltas || []);
        }
      } catch (error) {
        console.error("Erro ao carregar lista de faltas:", error);
      } finally {
        setCarregandoDados(false);
      }
    }
    carregarMinhasFaltas();
  }, [autorizado]);

  // 3. MATEMÁTICA AVANÇADA AUTOMÁTICA (Faltas do Mês e do Ano)
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth(); // 0 = Janeiro, 8 = Setembro...
  const anoAtual = dataAtual.getFullYear();

  const faltasNoMes = faltas.filter((f) => {
    const dataF = new Date(f.data_falta);
    return dataF.getMonth() === mesAtual && dataF.getFullYear() === anoAtual;
  }).length;

  const totalInjustificadasAno = faltas.filter(
    (f) => f.tipo === "injustificada" && new Date(f.data_falta).getFullYear() === anoAtual
  ).length;

  const totalJustificadasAno = faltas.filter(
    (f) => f.tipo === "justificada" && new Date(f.data_falta).getFullYear() === anoAtual
  ).length;

  if (verificandoAcesso || carregandoDados) {
    return <div className="flex h-screen items-center justify-center text-gray-500">A carregar registos de assiduidade...</div>;
  }

  if (!autorizado) {
    return <div className="flex h-screen items-center justify-center text-blue-700">A redirecionar...</div>;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">
      
      {/* Cabeçalho */}
      <header className="border-b border-gray-100 pb-4">
        <h1 className="page-title">O Meu Registo de Assiduidade</h1>
        <p className="content-description mt-1">Consulte as suas faltas registadas e o balanço anual de assiduidade.</p>
      </header>

      {/* SEÇÃO 1: CARDS INDICADORES DE ESTATÍSTICA */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        
        {/* Faltas no Mês Corrente */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <FiCalendar size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold  tracking-wider text-gray-400">Faltas no Mês Atual</p>
            <p className="mt-1 text-2xl font-bold text-gray-800">{faltasNoMes}</p>
          </div>
        </div>

        {/* Acumulado Injustificadas do Ano */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <FiAlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold  tracking-wider text-gray-400">Injustificadas (Ano)</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{totalInjustificadasAno}</p>
          </div>
        </div>

        {/* Acumulado Justificadas do Ano */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
            <FiCheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-gray-400">Justificadas (Ano)</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{totalJustificadasAno}</p>
          </div>
        </div>

      </section>

      {/* SEÇÃO 2: HISTÓRICO DE OCORRÊNCIAS */}
      <section className="mt-8">
        <article className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-4 flex items-center gap-3 bg-gray-50/50">
            <FiClock className="text-gray-500" size={18} />
            <h2 className="section-title tracking-wider">Histórico Detalhado de Ausências</h2>
          </div>

          {faltas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">Parabéns! Não possui nenhuma falta registada no sistema. </p>
          ) : (
            <>
              {/* Layout Responsivo para Dispositivos Móveis (Mobile) */}
              <div className="space-y-3 p-4 md:hidden">
                {faltas.map((falta) => (
                  <div key={falta.id_falta} className="rounded-lg border border-gray-100 p-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(falta.data_falta).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium  tracking-wider ${
                        falta.tipo === "justificada" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}>
                        {falta.tipo}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 italic border-t border-gray-50 pt-2">
                      {falta.justificativa || "Sem observações anexadas."}
                    </p>
                  </div>
                ))}
              </div>

              {/* Layout Avançado para Desktop (Tabelas) */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold  text-gray-500">
                    <tr>
                      <th className="px-6 py-3.5">Data da Ausência</th>
                      <th className="px-6 py-3.5">Classificação</th>
                      <th className="px-6 py-3.5">Justificativa / Motivo Apresentado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {faltas.map((falta) => (
                      <tr key={falta.id_falta} className="hover:bg-gray-50/40 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {new Date(falta.data_falta).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold  tracking-wider ${
                            falta.tipo === "justificada" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                          }`}>
                            {falta.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 italic max-w-md truncate" title={falta.justificativa || ""}>
                          {falta.justificativa || "Nenhuma justificativa oficial inserida."}
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
    </main>
  );
}
