"use client";
import {useState, useEffect, useCallback} from "react";
import { FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { toast } from "sonner";

import {createClient} from "../../../../lib/supabase/client"
import {useRouter} from "next/navigation"
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";



type Comunicado = {
  id_comunicados: string;
  titulo: string;
  descricao: string;
  local: string;
  data_publicacao: string;
  publicado: boolean;
  usuarios: {
    email: string; 
  } | null;
};

type VisualizacaoLeitor = {
  data_visualizacao: string;
  colaboradores: {
    nome: string;
    cargo: string | null;
  } | null;
};



export default function ComunicadosAdminPage() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto , setmodalAberto]= useState(false)
  const [salvando , setSalvando]= useState(false)
  const [autorizado, setAutorizado] = useState(false);
  const [verificandoAcesso, setVerificandoAcesso] = useState(true)
  const [role, setRole] = useState<"admin" | "gestor" | null>(null);
  const router = useRouter()
 const [form, setForm] = useState({
  titulo: "",
  descricao: "",
  local: "",
 })

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [comunicadoSelecionado, setComunicadoSelecionado] = useState({
    id_comunicados: "",
    titulo: "",
    descricao: "",
    local: ""
  });


const [leitores, setLeitores] = useState<VisualizacaoLeitor[]>([]);
const [modalLeitoresAberto, setModalLeitoresAberto] = useState(false);
const [carregandoLeitores, setCarregandoLeitores] = useState(false);
const [comunicadoVisualizado, setComunicadoVisualizado] = useState("");
 const [modalLeituraAberto, setModalLeituraAberto] = useState(false);
  const [comunicadoParaLer, setComunicadoParaLer] = useState<Comunicado | null>(null);


 function abrirLeitorComunicado(comunicado: Comunicado) {
    setComunicadoParaLer(comunicado);
    setModalLeituraAberto(true);
  
  }

async function verQuemViu(comunicado: Comunicado) {
  setComunicadoVisualizado(comunicado.titulo);
  setLeitores([]);
  setModalLeitoresAberto(true);
  setCarregandoLeitores(true);

  try {
    const resposta = await fetch(`/api/visualizacoes?id_comunicado=${encodeURIComponent(comunicado.id_comunicados)}`, {
      cache: "no-store",
    });
    const dados = await resposta.json();

    if (resposta.ok) {
      setLeitores(dados.leitores || []);
    } else {
      toast.error(dados.error || "Não foi possível carregar os leitores.");
    }
  } catch (error) {
    console.error("Erro ao buscar leitores:", error);
    toast.error("Não foi possível carregar os leitores.");
  } finally {
    setCarregandoLeitores(false);
  }
}


  useEffect(() => {
    async function verificarAcessoAdmin() {
      try {
        setLoading(true);
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

        if (role === "admin" || role === "gestor") {
          setRole(role);
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


  const fetchComunicados = useCallback(async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/comunicados", {
          cache: "no-store", 
        });
        const data = await response.json();

        if (response.ok) {
          setComunicados(Array.isArray(data.comunicados)? data.comunicados : []);
        } else {
          console.error("Erro ao buscar comunicados:", data.error);
        }
       
      } catch (error) {
        console.error("Erro ao buscar comunicados:", error);
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchComunicados();
  }, [fetchComunicados]);


    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      setSalvando(true);
      try {
        const response = await fetch("/api/comunicados", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

      const data = await response.json();

      if (response.ok) {
        toast.success("Comunicado criado com sucesso!");
        setComunicados((prev) => [...prev, data.comunicado]);
        setmodalAberto(false);
        setForm({ titulo: "", descricao: "", local: "" });
      } else {
        console.error("Erro ao criar comunicado:", data.error);
      }

      } catch (error) {
        console.error("Erro ao criar comunicado:", error);
      } finally {
        setSalvando(false);
      }
    }


    
function confirmarEliminacao(idComunicado: string) {
  toast("Tem a certeza que deseja eliminar este comunicado?", {
    duration: 5000,
    action: {
      label: "Confirmar",
      onClick: () => {
        void eliminarComunicado(idComunicado);
      },
    },
    cancel: {
      label: "Cancelar",
      onClick: () => {},
    },
  });
}

async function eliminarComunicado(idComunicado: string) {
  try {
    const resposta = await fetch("/api/comunicados", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_comunicados: idComunicado }),
    });
    const dados = await resposta.json();

    if (resposta.ok) {
      toast.success("Comunicado removido com sucesso!");
      await fetchComunicados();
    } else {
      toast.error(`Erro ao eliminar: ${dados.error}`);
    }
  } catch (error) {
    console.error("Erro ao apagar:", error);
    toast.error("Erro interno ao tentar eliminar");
  }
}

  // 1. Função para carregar os dados antigos do comunicado clicado no Modal
  function abrirModalEditar(comunicado: Comunicado) {
    setComunicadoSelecionado({
      id_comunicados: comunicado.id_comunicados,
      titulo: comunicado.titulo || "",
      descricao: comunicado.descricao || "",
      local: comunicado.local || ""
    });
    setModalEditarAberto(true);
  }

  async function salvarEdicaoComunicado(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSalvando(true);
      const resposta = await fetch("/api/comunicados", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comunicadoSelecionado),
      });
      const dados = await resposta.json();

      if (resposta.ok) {
        toast.success("Comunicado atualizado com sucesso!");
        setModalEditarAberto(false);
        await fetchComunicados();
      } else {
        toast.error(`Erro ao atualizar comunicado: ${dados.error}`);
      }
    } catch (error) {
      console.error("Erro ao editar comunicado:", error);
      toast.error("Erro interno ao salvar alterações");
    } finally {
      setSalvando(false);
    }
  }


      
  if (verificandoAcesso || loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">A carregar ...</div>;
  }

  if (!autorizado) {
    return <div className="flex h-screen items-center justify-center text-blue-700">A redirecionar para o painel administrativo...</div>;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="page-title">
            Gestão de comunicados
          </h1>
        </div>

        <button
        onClick={()=>setmodalAberto(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5
            text-sm font-medium text-white hover:bg-blue-600 " >
          <FiPlus size={18} />
          Novo comunicado
        </button>

      </div>
{/* Lista de comunicados */}
<div className="mt-6 space-y-4">

  {comunicados.map((comunicado, index) => { 
    const dataPublicacao = new Date(comunicado.data_publicacao);
    const dataFormatada = dataPublicacao.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });


    const textoGrande= comunicado.descricao.length> 220
    const descricaoExibida= textoGrande
    ? `${comunicado.descricao.substring(0,200)} ...`
    : comunicado.descricao;

    return (
      <article
        key={comunicado.id_comunicados || index} 
        className="
          rounded-lg border border-gray-200
          bg-white p-5 shadow-sm
        "
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div className="max-w-3xl">
             <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
          <h2 className="section-title mb-2">
            {comunicado.titulo}
          </h2>

          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {comunicado.usuarios?.email || "Sistema"}
          </span>
        </div>
            <div className="content-description prose prose-sm mt-3 max-w-none whitespace-pre-line">
              <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                {descricaoExibida}
                </ReactMarkdown>
            </div>

            {textoGrande && (
              <button
                type="button"
                onClick={() => abrirLeitorComunicado(comunicado)}
                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1"
              >
                Ler comunicado completo 
              </button>
            )}


            <p className="mt-4 text-xs text-gray-400">
              {dataFormatada} · {comunicado.local || "Geral"}
            </p>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "gestor") && <button
              onClick={() => void verQuemViu(comunicado)}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
              title="Ver leitores"
              aria-label={`Ver quem leu ${comunicado.titulo}`}
            >
              <FiEye size={18} />
            </button>}

            {(role === "admin" || role === "gestor") && <button
            onClick={() => abrirModalEditar(comunicado)}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
              title="Editar"
            >
              <FiEdit2 size={18} />
            </button>}

            {(role === "admin" || role === "gestor") && <button
            onClick={() => confirmarEliminacao(comunicado.id_comunicados)}
              className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
              title="Eliminar"
            >
              <FiTrash2 size={18} />
            </button>}
          </div>

        </div>
      </article>
    ); 
  })}

</div>



  {modalAberto && (
    <div
      onMouseDown={(event) => event.target === event.currentTarget && setmodalAberto(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <h2 className="section-title">Criar Comunicado</h2>


      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
         <div>
          <label className="block text-xs font-medium text-gray-600">Título</label>
          <input
            type="text"
            required
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            placeholder="Digite o título do comunicado"
          />
        </div>

    
        <div>
          <label className="block text-xs font-medium text-gray-600">Descrição</label>
          <textarea
            required
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            rows={6}
          />

          <p className="mt-1 text-[11px] text-gray-400">
            Suporta formatação profissional: Usa **texto** para negrito, *texto* para itálico e pressione Enter para criar parágrafos.
         </p>

         
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600">Local/Alvo</label>
          <input
            type="text"
            value={form.local}
            onChange={(e) => setForm({ ...form, local: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            placeholder="Ex.: Toda a empresa"
          />
        </div>

      

        {/* Botões de Ação do Modal */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setmodalAberto(false)}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={salvando}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            {salvando ? "A salvar..." : "Publicar"}
          </button>
        </div>
      </form>
                


            </div>
          </div>
        )}




        {/* MODAL DE EDIÇÃO DE COMUNICADOS */}
{modalEditarAberto && (
  <div
    onMouseDown={(event) => event.target === event.currentTarget && setModalEditarAberto(false)}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
  >
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
      
      <h2 className="section-title">Editar Comunicado</h2>
      <p className="mt-1 text-xs text-gray-500">Altere as informações do aviso institucional.</p>

      <form onSubmit={salvarEdicaoComunicado} className="mt-4 space-y-4">
        
        {/* Título */}
        <div>
          <label className="block text-xs font-medium text-gray-600">Título</label>
          <input
            type="text"
            required
            value={comunicadoSelecionado.titulo}
            onChange={(e) => setComunicadoSelecionado({ ...comunicadoSelecionado, titulo: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-medium text-gray-600">Descrição</label>
          <textarea
            required
            rows={4}
            value={comunicadoSelecionado.descricao}
            onChange={(e) => setComunicadoSelecionado({ ...comunicadoSelecionado, descricao: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Local */}
        <div>
          <label className="block text-xs font-medium text-gray-600">Local / Alvo</label>
          <input
            type="text"
            value={comunicadoSelecionado.local}
            onChange={(e) => setComunicadoSelecionado({ ...comunicadoSelecionado, local: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Botões de Ação */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setModalEditarAberto(false)}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-50 cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={salvando}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
          >
            {salvando ? "A salvar..." : "Salvar Alterações"}
          </button>
        </div>

      </form>
    </div>
  </div>
)}



 {modalLeituraAberto && comunicadoParaLer && (
    <div
   onMouseDown={(event) => event.target === event.currentTarget && setModalLeituraAberto(false)}
     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
        
        {/* Cabeçalho do Leitor */}
        <div className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {comunicadoParaLer.local || "Geral"}
            </span>
            <span className="text-xs text-gray-400">
              Publicado em {new Date(comunicadoParaLer.data_publicacao).toLocaleDateString("pt-PT")}
            </span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {comunicadoParaLer.titulo}
          </h2>
        </div>

        {/* 🌟 CONTEÚDO EM MARKDOWN TOTALMENTE EXPANDIDO E FORMADO */}
        <div className="mt-5 text-sm text-gray-700 leading-relaxed whitespace-pre-line text-left prose max-w-none border-b border-gray-100 pb-6 min-h-[100px]">
          <ReactMarkdown remarkPlugins={[remarkBreaks]}>
            {comunicadoParaLer.descricao}
          </ReactMarkdown>
        </div>

        {/* Rodapé do Modal */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <p>Publicado por: {comunicadoParaLer.usuarios?.email || "Sistema"}</p>
          <button
            type="button"
            onClick={() => setModalLeituraAberto(false)}
            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800 transition cursor-pointer"
          >
            Fechar Leitura
          </button>
        </div>

      </div>
    </div>
  )}



{/* MODAL DE CONFIRMADOS DE LEITURA CORRIGIDO */}
{modalLeitoresAberto && (
  <div
    onMouseDown={(event) => event.target === event.currentTarget && setModalLeitoresAberto(false)}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
  >
    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
      <h2 className="section-title">Lido por</h2>
      <p className="mt-1 truncate text-sm font-medium text-gray-700" title={comunicadoVisualizado}>
        {comunicadoVisualizado}
      </p>
      <p className="content-caption mt-1">Colaboradores que abriram este comunicado.</p>

      <div className="mt-4 max-h-60 overflow-y-auto space-y-3 pr-1">
        {carregandoLeitores ? (
          <p className="py-4 text-center text-sm text-gray-400">A carregar leitores...</p>
        ) : leitores.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum colaborador viu ainda. 👁️</p>
        ) : (
          leitores.map((leitor, index) => {
            
            const colaboradorInfo = leitor.colaboradores;

            return (
              <div key={index} className="flex items-center justify-between border-b border-gray-50 pb-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {colaboradorInfo?.nome || "Funcionário Desconhecido"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {colaboradorInfo?.cargo || "Colaborador"}
                  </p>
                </div>
                
                <span className="text-[11px] text-gray-400 font-medium shrink-0 ml-2">
                  {leitor.data_visualizacao
                    ? new Date(leitor.data_visualizacao).toLocaleDateString("pt-PT")
                    : "—"}
                </span>
              </div>
            );
          })
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






    </main>
  );
}