"use client";
import {createClient} from "../../../../lib/supabase/client"
import { useEffect, useState } from "react";
import {useRouter} from "next/navigation"
import Image from "next/image"
import {FiPlus,FiMail,FiCalendar,FiEdit2,FiTrash2,} from "react-icons/fi";
import { toast } from "sonner";

type colaborador ={
  id_colaborador: string;
  nome:string;
  cargo: string | null;
  departamento: string | null ;
  foto_url: string |null;
  estado: "ACTIVO" | "DESACTIVADO";
  data_nascimento : string;
  data_entrada :string;
  usuarios: {
    email: string
  } |null
}


export default function ColaboradoresAdminPage() {

 const [colaboradores , setColaboradores] = useState<colaborador[]>([])
 const [carregando , setcarregando]= useState(false)
 const [modalAberto , setmodalAberto]= useState(false)
 const [salvando , setSalvando]= useState(false)
  const [autorizado, setAutorizado] = useState(false);
  const [verificandoAcesso, setVerificandoAcesso] = useState(true)
  const router = useRouter()
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState({
    id_colaborador: "",
    nome: "",
    cargo: "",
    data_nascimento: "",
    data_entrada: ""
  });



  
  useEffect(() => {
    async function verificarAcessoAdmin() {
      try {
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
        
        setVerificandoAcesso(false)
      }
    }

    verificarAcessoAdmin();
  }, [router]);




 const [form , setForm]= useState({
  nome:"",
  email:"",
  role:"colaborador",
  senha:"",
  foto_url:"",
   cargo: "",          
    data_nascimento: "",
    data_entrada: ""    
 })

 async function  carregarColaboradores() {

  try {
    setcarregando(true)

    const resposta= await fetch("/api/usuarios" ,{cache:"no-store"})
    const dados = await resposta.json()

    if(resposta.ok){
      setColaboradores(dados.colaboradores || [])
    }else{
      console.error("Erro da api" , dados.error)
    }
    
  } catch (erro) {
    console.error("Erro ao conectar a api", erro)
    
  }finally{
    setcarregando(false)
  }
  
 }


  async function cadastrarColaborador(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSalvando(true);

      const resposta = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const dados = await resposta.json();
      
      if (resposta.ok) {
        toast.success("Colaborador cadastrado com sucesso");
        setmodalAberto(false);
        
      
        setForm({
          nome: "",
          email: "",
          senha: "",
          role: "colaborador",
          cargo: "",
          foto_url:"",
          data_nascimento: "",
          data_entrada: ""
        });
        carregarColaboradores();
      } else {
        toast.error(`Erro: ${dados.error}`);
      }
    } catch (erro) {
      console.error("Erro ao cadastrar colaborador", erro);
      toast.error("Erro ao cadastrar colaborador");
    } finally {
      setSalvando(false);
      setmodalAberto(false);
    }
  }

  useEffect(() => {
    carregarColaboradores();
  }, []);
 if(carregando)return 


async function eliminarColaborador(id_colaborador: string) {
  // Cria uma caixa de confirmação nativa do navegador
  const confirmar = window.confirm("Tem a certeza que deseja desactivar colaborador?");
  if (!confirmar) return;

  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("colaboradores")
      .update({estado: "DESACTIVADO"}) 
      .eq("id_colaborador", id_colaborador); 

    if (error) {
      toast.error(`Erro ao eliminar: ${error.message}`);
    } else {
      toast.success("Colaborador removido com sucesso!");
      
      // Atualiza a lista na tela instantaneamente para o card sumir!
      carregarColaboradores(); 
    }
  } catch (error) {
    console.error("Erro ao apagar:", error);
    toast.error("Erro interno ao tentar eliminar");
  }
}

  // Função para abrir o modal e carregar os dados antigos da linha clicada
  function abrirModalEditar(colaborador:colaborador) {
    setColaboradorSelecionado({
      id_colaborador: colaborador.id_colaborador,
      nome: colaborador.nome || "",
      cargo: colaborador.cargo || "",      // Formata a data para o input HTML do tipo date reconhecer (AAAA-MM-DD)
      data_nascimento: colaborador.data_nascimento ? colaborador.data_nascimento.substring(0, 10) : "",
      data_entrada: colaborador.data_entrada ? colaborador.data_entrada.substring(0, 10) : ""
    });
    setModalEditarAberto(true);
  }

  // Função disparada no submit do formulário de edição
  async function salvarEdicaoColaborador(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSalvando(true);
      const supabase = createClient();

      const { error } = await supabase
        .from("colaboradores")
        .update({
          nome: colaboradorSelecionado.nome,
          cargo: colaboradorSelecionado.cargo || null,
          data_nascimento: colaboradorSelecionado.data_nascimento || null,
          data_entrada: colaboradorSelecionado.data_entrada || null
        })
        .eq("id_colaborador", colaboradorSelecionado.id_colaborador);

      if (error) {
        toast.error(`Erro ao atualizar: ${error.message}`);
      } else {
        toast.success("Perfil do colaborador atualizado com sucesso!");
        setModalEditarAberto(false);
        carregarColaboradores(); 
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro interno ao salvar alterações");
    } finally {
      setSalvando(false);
    }
  }



 
  if (verificandoAcesso) {
    return <div className="flex h-screen items-center justify-center text-gray-500">A carregar ...</div>;
  }


  if (!autorizado) {
    return <div className="flex h-screen items-center justify-center text-blue-700">A redirecionar para o painel administrativo...</div>;
  }





  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">

      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl">
            Gestão de colaboradores
          </h1>

          
        </div>

        <button
        onClick={()=> setmodalAberto(true)}
          type="button"
          className="
            inline-flex items-center justify-center gap-2
            rounded-md bg-blue-700 px-4 py-2.5
            text-sm font-medium text-white shadow-sm
            transition hover:bg-blue-600
            focus:outline-none focus:ring-2
            focus:ring-blue-700 focus:ring-offset-2
          "
        >
          <FiPlus size={18} />
          Adicionar colaborador
        </button>

      </header>

      
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        
        {colaboradores.map((colaborador) => {
    
    const minhasIniciais = colaborador.nome 
      ? colaborador.nome.substring(0, 2).toUpperCase() 
      : "CB";

  
    const emailReal = Array.isArray(colaborador.usuarios)
    ?colaborador.usuarios[0]?.email
    :(colaborador.usuarios as { email?: string })?.email || "Não informado";

    const aniversarioReal = colaborador.data_nascimento || "Não informado";

    return (
      <article
  key={colaborador.id_colaborador}
  className="
    rounded-xl border border-gray-200
    bg-white px-5 py-4
    shadow-sm
    transition
    hover:border-gray-300
  "
>
  {/* Cabeçalho do colaborador */}
  <div className="flex items-center justify-between gap-3">

    <div className="flex min-w-0 items-center gap-3">

      {/* Foto ou iniciais */}
      {colaborador.foto_url ? (
        <Image
          src={colaborador.foto_url}
          alt={colaborador.nome}
          className="
            h-11 w-11 shrink-0
            rounded-full object-cover
          "
        />
      ) : (
        <span
          className="
            flex h-11 w-11 shrink-0
            items-center justify-center
            rounded-full
            border border-blue-700/40
            text-sm font-semibold
            text-blue-700
          "
        >
          {minhasIniciais}
        </span>
      )}

      {/* Nome e cargo */}
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold text-gray-800">
          {colaborador.nome}
        </p>

        <p className="mt-1 truncate text-xs text-gray-500">
          {colaborador.cargo || "Sem cargo definido"}
        </p>
      </div>

    </div>

    {/* Ações */}
    <div className="flex shrink-0 items-center gap-1">

      <button
       onClick={() => abrirModalEditar(colaborador)}
        type="button"
        title="Editar colaborador"
        className="
          rounded-lg p-2
          text-gray-400
          transition
          hover:bg-gray-50
          hover:text-gray-700
        "
      >
        <FiEdit2 size={16} />
      </button>

      <button
        onClick={() => eliminarColaborador(colaborador.id_colaborador)}
        type="button"
        title="Desativar colaborador"
        className="
          rounded-lg p-2
          text-gray-400
          transition
          hover:bg-red-50
          hover:text-red-500
        "
      >
        <FiTrash2 size={16} />
      </button>

    </div>

  </div>


  {/* Informações */}
  <div
    className="
      mt-4
      border-t border-gray-100
      pt-3
      flex flex-col gap-2
      sm:flex-row sm:items-center sm:justify-between
    "
  >

    <p className="flex min-w-0 items-center gap-2 text-xs text-gray-500">
      <FiMail
        size={14}
        className="shrink-0 text-blue-700"
      />

      <span className="truncate">
        {emailReal}
      </span>
    </p>

    <p className="flex items-center gap-2 text-xs text-gray-500">
      <FiCalendar
        size={14}
        className="shrink-0 text-blue-700"
      />

      {aniversarioReal}
    </p>

  </div>

</article>
    )
  })} 
</div>

{/* MODAL DE CADASTRO (Aparece apenas se modalAberto for true) */}
{modalAberto && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
      
      {/* Título do Modal */}
      <h2 className="text-xl font-semibold text-gray-800">Cadastrar Novo Colaborador</h2>
      <p className="mt-1 text-xs text-gray-500">Insira as credenciais de acesso e dados do perfil institucional.</p>

      {/* Formulário */}
      <form onSubmit={cadastrarColaborador} className="mt-4 space-y-4">
        
        {/* Nome Completo */}
        <div>
          <label className="block text-xs font-medium text-gray-600">Nome Completo</label>
          <input
            type="text"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            placeholder="Ex: João Silva"
          />
        </div>

        {/* Grelha de Duas Colunas: Credenciais básicas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600">E-mail Institucional</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="joao@empresa.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600">Senha</label>
            <input
              type="password"
              required
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        </div>

        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600">Cargo / Função</label>
            <input
              type="text"
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Ex: Assistente de Informática"
            />
          </div>

          
        </div>

        {/* 🟢 NOVOS CAMPOS: Datas de Nascimento e Entrada */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600">Data de Nascimento</label>
            <input
              type="date"
              lang="pt-PT"
              value={form.data_nascimento}
              onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600">Data de Entrada / Admissão</label>
            <input
              type="date"
              lang="pt-PT"
              value={form.data_entrada}
              onChange={(e) => setForm({ ...form, data_entrada: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

      

        {/* Botões de Ação do Modal */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setmodalAberto(false)}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-50 cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={salvando}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
          >
            {salvando ? "A salvar..." : "Salvar Cadastro"}
          </button>
        </div>

      </form>
    </div>
  </div>
)}



{/* MODAL DE EDIÇÃO */}
{modalEditarAberto && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
      
      <h2 className="text-xl font-semibold text-gray-800">Editar Perfil do Colaborador</h2>
      <p className="mt-1 text-xs text-gray-500">Altere os dados institucionais ou do perfil do funcionário.</p>

      <form onSubmit={salvarEdicaoColaborador} className="mt-4 space-y-4">
        
        <div>
          <label className="block text-xs font-medium text-gray-600">Nome Completo</label>
          <input
            type="text"
            required
            value={colaboradorSelecionado.nome}
            onChange={(e) => setColaboradorSelecionado({ ...colaboradorSelecionado, nome: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600">Cargo / Função</label>
            <input
              type="text"
              value={colaboradorSelecionado.cargo}
              onChange={(e) => setColaboradorSelecionado({ ...colaboradorSelecionado, cargo: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

         
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600">Data de Nascimento</label>
            <input
              type="date"
              value={colaboradorSelecionado.data_nascimento}
              onChange={(e) => setColaboradorSelecionado({ ...colaboradorSelecionado, data_nascimento: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600">Data de Entrada / Admissão</label>
            <input
              type="date"
              value={colaboradorSelecionado.data_entrada}
              onChange={(e) => setColaboradorSelecionado({ ...colaboradorSelecionado, data_entrada: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Botões */}
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