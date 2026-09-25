"use client";
import {useState, useEffect, useCallback} from "react";
import {useRouter} from "next/navigation"
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { createClient } from "../../../lib/supabase/client";

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


export default function ComunicadosAdminPage() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [verificandoAcesso, setVerificandoAcesso] = useState(true)
  const router = useRouter()
 
 const [modalLeituraAberto, setModalLeituraAberto] = useState(false);
  const [comunicadoParaLer, setComunicadoParaLer] = useState<Comunicado | null>(null);


 async function marcarComoLida(comunicado: Comunicado) {
    if (!comunicado.id_comunicados) return;

    try {
      await fetch("/api/visualizacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_comunicado: comunicado.id_comunicados }),
      });
    } catch (error) {
      console.error("Erro ao registar visualização:", error);
    }
  }

 function abrirLeitorComunicado(comunicado: Comunicado) {
    setComunicadoParaLer(comunicado);
    setModalLeituraAberto(true);
    void marcarComoLida(comunicado);
  }


  useEffect(() => {
    async function verificarColaborador() {
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

        if (role === "colaborador" || role === "gestor") {
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

    verificarColaborador();
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


      
  if (verificandoAcesso || loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">A carregar ...</div>;
  }

  if (!autorizado) {
    return <div className="flex h-screen items-center justify-center text-gray-500">A redirecionar para o painel administrativo...</div>;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="page-title">
            Gestão de comunicados
          </h1>
        </div>

        

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

         
        </div>
      </article>
    ); 
  })}

</div>


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
            Fechar 
          </button>
        </div>

      </div>
    </div>
  )}
    </main>
  );
}