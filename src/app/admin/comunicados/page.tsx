"use client";
import {useState, useEffect, useCallback} from "react";
import { FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { toast } from "sonner";
import {createClient} from "../../../../lib/supabase/client"
import {useRouter} from "next/navigation"



type Comunicado = {
  id_comunicados: number;
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
  const [modalAberto , setmodalAberto]= useState(false)
  const [salvando , setSalvando]= useState(false)
  const [autorizado, setAutorizado] = useState(false);
  const [verificandoAcesso, setVerificandoAcesso] = useState(true)
  const router = useRouter()
  
 const [form, setForm] = useState({
  titulo: "",
  descricao: "",
  local: "",
 })


   // 🟢 ESTADOS EXCLUSIVOS PARA EDIÇÃO DE COMUNICADOS
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [comunicadoSelecionado, setComunicadoSelecionado] = useState({
    id_comunicados: 0,
    titulo: "",
    descricao: "",
    local: ""
  });




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


    
function confirmarEliminacao(idComunicado: number) {
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

async function eliminarComunicado(idComunicado: number) {
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
          <h1 className="text-2xl font-semibold text-gray-700 sm:text-3xl">
            Gestão de comunicados
          </h1>

         
        </div>

        <button
        onClick={()=>setmodalAberto(true)}
          className="
            inline-flex items-center justify-center gap-2
            rounded-lg bg-blue-700 px-4 py-2.5
            text-sm font-medium text-white
            hover:bg-blue-600
          "
        >
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
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {comunicado.titulo}
              </h2>

              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                {comunicado.usuarios?.email || "Sistema"}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {comunicado.descricao}
            </p>

            <p className="mt-4 text-xs text-gray-400">
              {dataFormatada} · {comunicado.local || "Geral"}
            </p>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
              title="Visualizar"
            >
              <FiEye size={18} />
            </button>

            <button
            onClick={() => abrirModalEditar(comunicado)}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
              title="Editar"
            >
              <FiEdit2 size={18} />
            </button>

            <button
            onClick={() => confirmarEliminacao(comunicado.id_comunicados)}
              className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
              title="Eliminar"
            >
              <FiTrash2 size={18} />
            </button>
          </div>

        </div>
      </article>
    ); 
  })}

</div>



  {modalAberto && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <h2 className="text-xl font-semibold text-gray-800">Criar Comunicado</h2>


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
            rows={3}
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
      
      <h2 className="text-xl font-semibold text-gray-800">Editar Comunicado</h2>
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
            required
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





    </main>
  );
}