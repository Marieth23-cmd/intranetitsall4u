"use client";

import { useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiPlus,
  FiX,
} from "react-icons/fi";

const pedidos = [
  { tipo: "Férias", periodo: "04 Ago — 15 Ago 2026", estado: "Aprovado" },
  { tipo: "Dispensa", periodo: "22 Jul 2026", estado: "Aprovado" },
  { tipo: "Ausência", periodo: "10 Jul 2026", estado: "Rejeitado" },
];

const diasSemana = ["D", "S", "T", "Q", "Q", "S", "S"];
const meses = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function paraChave(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function formatarData(valor: string) {
  if (!valor) return "Selecionar data";

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${valor}T00:00:00`));
}

function Calendario({
  valorSelecionado,
  aoSelecionar,
}: {
  valorSelecionado: string;
  aoSelecionar: (valor: string) => void;
}) {
  const [mesVisivel, setMesVisivel] = useState(() => {
    const data = valorSelecionado ? new Date(`${valorSelecionado}T00:00:00`) : new Date();
    return new Date(data.getFullYear(), data.getMonth(), 1);
  });

  const ano = mesVisivel.getFullYear();
  const mes = mesVisivel.getMonth();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const celulas = Array.from({ length: primeiroDia + diasNoMes }, (_, indice) =>
    indice < primeiroDia ? null : indice - primeiroDia + 1,
  );

  function mudarMes(diferenca: number) {
    setMesVisivel(new Date(ano, mes + diferenca, 1));
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Mês anterior"
          onClick={() => mudarMes(-1)}
          className="rounded-md p-2 hover:bg-gray-100"
        >
          <FiChevronLeft size={18} />
        </button>

        <p className="text-sm font-semibold capitalize text-gray-800">
          {meses[mes]} de {ano}
        </p>

        <button
          type="button"
          aria-label="Mês seguinte"
          onClick={() => mudarMes(1)}
          className="rounded-md p-2 hover:bg-gray-100"
        >
          <FiChevronRight size={18} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
        {diasSemana.map((dia, indice) => (
          <span key={`${dia}-${indice}`} className="py-2 font-medium text-gray-400">
            {dia}
          </span>
        ))}

        {celulas.map((dia, indice) => {
          if (!dia) return <span key={`vazio-${indice}`} />;

          const data = new Date(ano, mes, dia);
          const chave = paraChave(data);
          const selecionado = chave === valorSelecionado;

          return (
            <button
              key={chave}
              type="button"
              onClick={() => aoSelecionar(chave)}
              className={`aspect-square rounded-md transition ${
                selecionado
                  ? "bg-yellow-700 font-semibold text-white"
                  : "text-gray-700 hover:bg-yellow-50"
              }`}
            >
              {dia}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FeriasPage() {
  const [modalAberto, setModalAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"ferias" | "dispensas">("ferias");
  const [campoFerias, setCampoFerias] = useState<"inicio" | "fim">("inicio");
  const [inicioFerias, setInicioFerias] = useState("");
  const [fimFerias, setFimFerias] = useState("");
  const [dataDispensa, setDataDispensa] = useState("");
  const [motivo, setMotivo] = useState("");
  const [mensagem, setMensagem] = useState("");

  function fecharModal() {
    setModalAberto(false);
    setMensagem("");
  }

  function marcarFerias() {
    if (!inicioFerias || !fimFerias) {
      setMensagem("Selecione a data de início e a data de fim das férias.");
      return;
    }

    if (fimFerias < inicioFerias) {
      setMensagem("A data de fim deve ser igual ou posterior à data de início.");
      return;
    }

    setMensagem("Pedido de férias registado com sucesso.");
  }

  function enviarDispensa() {
    if (!dataDispensa || !motivo.trim()) {
      setMensagem("Selecione a data e explique o motivo da ausência.");
      return;
    }

    setMensagem("Pedido de dispensa enviado com sucesso.");
  }

  const dataDoCalendario = campoFerias === "inicio" ? inicioFerias : fimFerias;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 text-gray-700 sm:px-6 sm:py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Férias e Ausências</h1>
          <p className="mt-1 text-sm text-gray-500">
            Consulte os seus períodos e acompanhe os seus pedidos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-yellow-600"
        >
          <FiPlus size={18} /> 
          Novo pedido
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Resumo icone={<FiCalendar size={20} />} titulo="Próximas férias" valor="04 — 15 Agosto" cor="bg-yellow-50 text-yellow-700" />
        <Resumo icone={<FiClock size={20} />} titulo="Pedidos pendentes" valor="1 pedido" cor="bg-gray-100 text-gray-600" />
        <Resumo icone={<FiCheckCircle size={20} />} titulo="Pedidos aprovados" valor="2 pedidos" cor="bg-green-50 text-green-600" />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Meus pedidos</h2>
            <p className="mt-1 text-sm text-gray-500">Histórico dos seus pedidos de férias e ausências.</p>
          </div>
          <button type="button" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
            Ver histórico <FiChevronRight size={16} />
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {pedidos.map((pedido) => (
            <div key={`${pedido.tipo}-${pedido.periodo}`} className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50"><FiCalendar size={18} className="text-gray-500" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{pedido.tipo}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{pedido.periodo}</p>
                </div>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${pedido.estado === "Aprovado" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {pedido.estado}
              </span>
            </div>
          ))}
        </div>
      </section>

      {modalAberto && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/40 p-0 sm:items-center sm:justify-center sm:p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="titulo-novo-pedido" className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="titulo-novo-pedido" className="text-xl font-semibold text-gray-900">Novo pedido</h2>
                <p className="mt-1 text-sm text-gray-500">Escolha o tipo de pedido e preencha os dados.</p>
              </div>
              <button type="button" aria-label="Fechar" onClick={fecharModal} className="rounded-md p-2 hover:bg-gray-100"><FiX size={20} /></button>
            </div>

            <div className="mt-5 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
              <button type="button" onClick={() => { setAbaAtiva("ferias"); setMensagem(""); }} className={`rounded-md px-3 py-2 text-sm font-medium ${abaAtiva === "ferias" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>Férias</button>
              <button type="button" onClick={() => { setAbaAtiva("dispensas"); setMensagem(""); }} className={`rounded-md px-3 py-2 text-sm font-medium ${abaAtiva === "dispensas" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>Dispensas</button>
            </div>

            {abaAtiva === "ferias" ? (
              <div className="mt-5">
                <p className="mb-3 text-sm font-medium text-gray-700">Selecione o período de férias</p>
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setCampoFerias("inicio")} className={`rounded-lg border p-3 text-left text-sm ${campoFerias === "inicio" ? "border-yellow-700 ring-1 ring-yellow-700" : "border-gray-200"}`}>
                    <span className="block text-xs text-gray-500">Início</span><span className="mt-1 block font-medium text-gray-800">{formatarData(inicioFerias)}</span>
                  </button>
                  <button type="button" onClick={() => setCampoFerias("fim")} className={`rounded-lg border p-3 text-left text-sm ${campoFerias === "fim" ? "border-yellow-700 ring-1 ring-yellow-700" : "border-gray-200"}`}>
                    <span className="block text-xs text-gray-500">Fim</span><span className="mt-1 block font-medium text-gray-800">{formatarData(fimFerias)}</span>
                  </button>
                </div>
                <Calendario valorSelecionado={dataDoCalendario} aoSelecionar={(data) => campoFerias === "inicio" ? setInicioFerias(data) : setFimFerias(data)} />
                <button type="button" onClick={marcarFerias} className="mt-5 w-full rounded-lg bg-yellow-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-yellow-600">Marcar férias</button>
              </div>
            ) : (
              <div className="mt-5">
                <p className="mb-3 text-sm font-medium text-gray-700">Selecione o dia da ausência</p>
                <Calendario valorSelecionado={dataDispensa} aoSelecionar={setDataDispensa} />
                <label className="mt-4 block text-sm font-medium text-gray-700" htmlFor="motivo-ausencia">Motivo da ausência</label>
                <textarea id="motivo-ausencia" value={motivo} onChange={(event) => setMotivo(event.target.value)} placeholder="Explique o motivo do pedido de dispensa..." className="mt-2 min-h-28 w-full resize-y rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-yellow-700 focus:ring-1 focus:ring-yellow-700" />
                <button type="button" onClick={enviarDispensa} className="mt-5 w-full rounded-lg bg-yellow-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-yellow-600">Enviar pedido</button>
              </div>
            )}

            {mensagem && <p role="status" className="mt-4 rounded-lg bg-gray-100 p-3 text-center text-sm text-gray-700">{mensagem}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function Resumo({ icone, titulo, valor, cor }: { icone: React.ReactNode; titulo: string; valor: string; cor: string }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-5"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cor}`}>{icone}</div><p className="mt-4 text-sm text-gray-500">{titulo}</p><p className="mt-1 text-lg font-semibold text-gray-800">{valor}</p></div>;
}
