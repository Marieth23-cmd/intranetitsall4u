"use client";

import { useState, useEffect } from "react";
import { FiEdit2, FiLock, FiUsers, FiCheck, FiTrash2, FiX, FiSquare } from "react-icons/fi";
import { createClient } from "../../../../lib/supabase/client";
import { toast } from "sonner";

type ColaboradorAcesso = {
  id_colaborador: string;
  nome: string;
  cargo: string | null;
  usuario_id: string;
  role: "admin" | "gestor" | "colaborador";
};

const permissoesPadrao = {
  admin: [
    "Gerir colaboradores e cargos",
    "Publicar e remover comunicados",
    "Gerir carteira de clientes",
    "Aprovar férias e marcar faltas",
    "Gerir acessos e permissões da equipa",
    "Alterar definições corporativas",
  ],
  gestor: [
    "Consultar e editar colaboradores",
    "Criar novos comunicados",
    "Consultar dados de clientes",
  ],
  colaborador: [
    "Consultar comunicados internos",
    "Acompanhar dados de clientes",
    "Solicitar períodos de férias",
    "Consultar faltas e assiduidade"
  ]
};

export default function AcessosAdminPage() {
  const [contadores, setContadores] = useState({ admin: 1, gestor: 0, colaborador: 0 });
  const [loading, setLoading] = useState(true);
  const [modalGestoresAberto, setModalGestoresAberto] = useState(false);
  const [listaColaboradores, setListaColaboradores] = useState<ColaboradorAcesso[]>([]);
  const [carregandoColabs, setCarregandoColabs] = useState(false);
  const [atualizandoAcesso, setAtualizandoAcesso] = useState<string | null>(null);

  // 🟢 NOVA FUNÇÃO CENTRALIZADA: Atualiza os dados da tela principal sem dar ecrã branco
  async function carregarContagensReais() {
    try {
      const supabase = createClient();

      const { count: qtdAdmins } = await supabase
        .from("usuarios")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      const { count: qtdGestores } = await supabase
        .from("usuarios")
        .select("*", { count: "exact", head: true })
        .eq("role", "gestor")
       
     const { count: qtdColabs, error } = await supabase
        .from("colaboradores")
        .select("*", { count: "exact", head: true })
        .eq("estado", "ACTIVO");

        console.log("qtdColabs:", qtdColabs);
        console.log("error:", error);


      setContadores({
        admin: qtdAdmins || 1,
        gestor: qtdGestores || 0,
        colaborador: qtdColabs || 0
      });
    } catch (error) {
      console.error("Erro ao carregar contadores de permissões:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarContagensReais();
  }, []);

  async function carregarListaAcessos() {
    try {
      setCarregandoColabs(true);
      const res = await fetch("/api/permissoes", { cache: "no-store" });
      const dados = await res.json();
      if (res.ok) setListaColaboradores(dados.colaboradores || []);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregandoColabs(false);
    }
  }

  function gerirPerfilGestor() {
    carregarListaAcessos();
    setModalGestoresAberto(true);
  }

  async function alterarNivelAcesso(usuarioId: string, novaRole: 'gestor' | 'colaborador') {
    if (atualizandoAcesso === usuarioId) return;

    try {
      setAtualizandoAcesso(usuarioId);
      const res = await fetch("/api/permissoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: usuarioId, nova_role: novaRole })
      });
      if (res.ok) {
        toast.success(novaRole === 'gestor' ? "Colaborador promovido a Gestor!" : "Acesso de Gestor revogado!");
        await carregarListaAcessos();
        await carregarContagensReais();
      } else {
        const dados = await res.json();
        toast.error(dados.error || "Não foi possível atualizar o acesso.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível atualizar o acesso.");
    } finally {
      setAtualizandoAcesso(null);
    }
  }

  const perfisSistemas = [
    {
      nome: "Administrador",
      utilizadores: contadores.admin,
      tipo: "Acesso total",
      editavel: false,
      permissoes: permissoesPadrao.admin,
    },
    {
      nome: "Gestor",
      utilizadores: contadores.gestor,
      tipo: "Acesso limitado",
      editavel: true,
      permissoes: permissoesPadrao.gestor,
    },
    {
      nome: "Colaborador",
      utilizadores: contadores.colaborador,
      tipo: "Acesso básico",
      editavel: false,
      permissoes: permissoesPadrao.colaborador,
    },
  ];

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-sm text-gray-500">A carregar permissões...</div>;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Acessos e permissões</h1>
        <p className="mt-1 text-sm text-gray-500">Gerencie perfis e visualize quem tem acesso às ferramentas.</p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 max-w-2xl">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FiUsers size={19} /></div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Perfis definidos</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{perfisSistemas.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FiUsers size={19} /></div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Utilizadores abrangidos</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{contadores.admin + contadores.gestor + contadores.colaborador}</p>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-gray-800 sm:text-lg">Níveis de Acesso</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {perfisSistemas.map((perfil) => (
            <article key={perfil.nome} className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-800 sm:text-lg">{perfil.nome}</h3>
                  <p className="mt-1 text-xs text-gray-400">
                    {perfil.utilizadores} {perfil.utilizadores === 1 ? "utilizador ativo" : "utilizadores ativos"}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{perfil.tipo}</span>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4 flex-1">
                <p className="text-xs font-semibold text-gray-400">Permissões atribuídas</p>
                <ul className="mt-3 space-y-2.5">
                  {perfil.permissoes.map((permissao) => (
                    <li key={permissao} className="text-sm text-gray-600 flex items-start gap-2 leading-relaxed">
                      <FiCheck className="text-blue-600 mt-0.5 shrink-0" size={14} />
                      <span>{permissao}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-4">
                {perfil.editavel ? (
                  <button
                    type="button"
                    onClick={gerirPerfilGestor}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-800 cursor-pointer"
                  >
                    <FiEdit2 size={14} />
                    Ajustar permissões
                  </button>
                ) : (
                  <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 text-xs font-medium text-gray-400 cursor-not-allowed">
                    <FiLock size={13} />
                    Configuração base padrão
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>


    
      {/* MODAL DE AJUSTAR GESTORES (TOTALMENTE CORRIGIDO E INTEGRAL) */}
  {modalGestoresAberto && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Atribuir Perfil de Gestor</h2>
            <p className="text-xs text-gray-500 mt-0.5">Ative ou remova colaboradores com acesso intermédio.</p>
          </div>
          <button 
            onClick={() => setModalGestoresAberto(false)} 
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Lista com rolagem interna */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1 min-h-[200px]">
          {carregandoColabs ? (
            <p className="text-xs text-gray-400 text-center py-8">A sincronizar com a base de dados...</p>
          ) : listaColaboradores.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">Nenhum funcionário ativo cadastrado.</p>
          ) : (
            listaColaboradores
              .filter(c => c.role !== 'admin') // Oculta o Administrador Máximo para proteção
              .map((colab) => {
                const isGestor = colab.role === 'gestor';
                const estaAtualizando = atualizandoAcesso === colab.usuario_id;
                
                return (
                  <div key={colab.id_colaborador} className="flex items-center justify-between border-b border-gray-50 pb-2.5 transition hover:bg-gray-50/40 px-1 rounded">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{colab.nome}</p>
                      <p className="text-xs text-gray-400 truncate">{colab.cargo || "Colaborador"}</p>
                    </div>

                    {/* Ações interativas baseadas no estado atual da role */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isGestor ? (
                        <>
                          {/* Marcação Visual de Ativo */}
                          <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full mr-1">
                            Gestor Ativo
                          </span>
                          {/* Botão de Remover Acesso Vermelho */}
                          <button
                            type="button"
                            onClick={() => alterarNivelAcesso(colab.usuario_id, 'colaborador')}
                            disabled={estaAtualizando}
                            className="rounded border border-red-100 bg-red-50 p-1.5 text-red-600 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-50"
                            title="Revogar acesso de Gestor"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </>
                      ) : (
                        // Botão Azul com Seta/Check para Promover a Gestor
                        <button
                          type="button"
                          onClick={() => alterarNivelAcesso(colab.usuario_id, 'gestor')}
                          disabled={estaAtualizando}
                          className="rounded border border-gray-200 bg-white p-1.5 text-gray-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-wait disabled:opacity-50"
                          title="Ativar como Gestor"
                        >
                          <FiSquare size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* Rodapé do Modal - CORRIGIDO SEM WINDOW.LOCATION.RELOAD */}
        <div className="mt-5 border-t border-gray-100 pt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setModalGestoresAberto(false)} // 🟢 Apenas fecha o modal, mantendo a tela intacta
            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800 transition cursor-pointer"
          >
            Concluir Ajustes
          </button>
        </div>

      </div>
    </div>
  )}


    </main>
  );
}
