"use client"
import {useState , useEffect} from "react"
import Image from "next/image";
import { PiMegaphone } from "react-icons/pi";
import {useRouter} from "next/navigation"
import Link from "next/link"
import { createClient } from "../../../lib/supabase/client";
import AniversariantesCard from "../Components/AniversariantesCard";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";


const heroSlides = [
  {
    imagem:
      "https://res.cloudinary.com/dhpa1juyr/image/upload/v1773928696/Banner_1_1_yuhrqm.webp",
    alt: "Equipa reunida",
  },
  {
    imagem:
      "https://res.cloudinary.com/dhpa1juyr/image/upload/v1773928696/Banner_2_qk4v9c.webp",
    alt: "Equipa em reunião",
  },
  {
    imagem:
      "https://res.cloudinary.com/dhpa1juyr/image/upload/v1773928695/Banner_3_wghs1h.webp",
    alt: "Equipa a trabalhar",
  },
];

// 🟢 SUBSTITUA O SEU TIPO NO TOPO DO ARQUIVO POR ESTE:
type ComunicadoHome = {
  id_comunicados: string; // 🟢 Corrigido para string para aceitar o UUID e o "banner"
  titulo: string;
  descricao: string;
  local: string | null;
  data_publicacao: string;
  publicado?: boolean;
  usuarios: {
    email: string;
  } | null; // 🟢 Adicionado para resolver o erro da linha 439
};


export const dynamic = 'force-dynamic';

export default function Home() {
  const [slideAtual, setSlideAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [comunicados, setComunicados] = useState<ComunicadoHome[]>([]);
  const [primeiroNome , setPrimeiroNome] = useState("Admin")
   const [modalLeituraAberto, setModalLeituraAberto] = useState(false);
  const [comunicadoParaLer, setComunicadoParaLer] = useState<ComunicadoHome | null>(null);

  const router = useRouter()


  const [contadores , setContadores]=useState(
    {
      colaboradores:0,
      clientes:0,
      projetos:0
    }
  )


 function abrirLeitorComunicado(comunicado: ComunicadoHome) {
    setComunicadoParaLer(comunicado);
    setModalLeituraAberto(true);
  
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
      }
    }

    verificarAcessoAdmin();
  }, [router]);


  // 2. Cálculo dinâmico da Saudação horária
  const horaAtual = new Date().getHours();
  let saudacao: string;

  if (horaAtual >= 5 && horaAtual < 12) {
    saudacao = "Bom dia";
  } else if (horaAtual >= 12 && horaAtual <= 18) {
    saudacao = "Boa tarde";
  } else {
    saudacao = "Boa noite";
  }


async function fetchComunicados() {
  try {
    setLoading(true);

    const response = await fetch("/api/comunicados", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) {
      setComunicados(data.comunicados || data || []);
    }
  } catch (error) {
    console.log("Erro ao carregar comunicados:", error);
  }

  try {
    const responseDash = await fetch("/api/dashboard", { cache: "no-store" });
    const dataDash = await responseDash.json();
    if (responseDash.ok) {
      setContadores(dataDash);
    }
  } catch (error) {
    console.log("Erro ao carregar contadores do painel:", error);
  }

  try {
    const supabase = createClient()
    const {data:{user}} = await supabase.auth.getUser()

      if(user && user.user_metadata?.nome){
        const nomeCompleto = user.user_metadata.nome
        const apenasPrimeiro = nomeCompleto.split(" ")[0]
        setPrimeiroNome(apenasPrimeiro)

      }


  } catch (error) {
    console.log("Erro ao carregar o utilizador:", error);
  } finally {
    setLoading(false);
  }
}



  useEffect(() => {
    fetchComunicados();
  }, []);


  useEffect(() => {
    const intervalo = setInterval(() => {
      setSlideAtual((atual) =>
        atual === heroSlides.length - 1 ? 0 : atual + 1
      );
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  // Travas de segurança antes de desenhar o conteúdo do painel.
  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">A verificar credenciais...</div>;
  }

  if (!autorizado) {
    return <div className="flex h-screen items-center justify-center text-red-600 font-medium">Acesso não autorizado! Redirecionando...</div>;
  }

  //  Extração Dinâmica do Comunicado Mais Recente
  const comunicadoMaisRecente = comunicados && comunicados.length > 0 ? comunicados[0] : null;
  const tituloBanner = comunicadoMaisRecente ? comunicadoMaisRecente.titulo : "Bem-vindo à intranet Itsall4u";
  
  // Alterado aqui: Trocado de .local para .descricao para mostrar a notícia de verdade!
  const descricaoBanner = comunicadoMaisRecente ? comunicadoMaisRecente.descricao : "Últimas informações da empresa";



  function limitarTexto (texto:string , limite =50){
    if(texto.length <= limite){
      return texto;
    }
    return `${texto.slice(0, limite).trim()}...`
  }


  // Trava profissional enquanto o banco responde
  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">A carregar portal...</div>;
  }



    if(!primeiroNome){
      return(
        <div>  </div>
      )
    
    }


  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">
      
      {/* Cabeçalho */}
      <header>
        <h1 className="page-title">
          {saudacao}, {primeiroNome}
        </h1>

        <p className="content-description mt-2">
          Bem-vinda à intranet Itsall4u.
        </p>
      </header>


     


{/* HERO BANNER COM TAMANHO FIXO COMPACTO */}
<section className="mt-8 overflow-hidden rounded-2xl bg-black shadow-lg">
  <div className="grid min-h-[420px] max-h-[420px] grid-cols-1 md:grid-cols-3">

    {/* Bloco de Texto - Altura controlada com rolagem interna se necessário */}
    <div className="flex flex-col justify-center p-8 text-white sm:p-10 md:col-span-1 lg:p-12 max-h-[420px] overflow-y-auto">
      
      <span className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/60">
        Comunicação interna
      </span>

      {/* Título: Ocupa no máximo 2 linhas antes de cortar */}
      <h2 className="text-xl font-bold leading-tight sm:text-2xl line-clamp-2" title={tituloBanner}>
        {tituloBanner}
      </h2>

      {/* Descrição: Ocupa no máximo 4 linhas e oculta o resto de forma elegante */}
      <div className="mt-4 text-xs leading-relaxed text-white/80 line-clamp-4 prose prose-invert">
        <ReactMarkdown remarkPlugins={[remarkBreaks]}>
          {descricaoBanner}
        </ReactMarkdown>
      </div>

      {descricaoBanner && descricaoBanner.length > 150 && (
        <button
          type="button"
          // Passamos o objeto do comunicado correspondente ao banner se o tiver, ou montamos um dinâmico
          onClick={() => abrirLeitorComunicado({
            id_comunicados: "banner",
            titulo: tituloBanner,
            descricao: descricaoBanner,
            local: "Destaque",
            data_publicacao: new Date().toISOString(),
            publicado: true,
            usuarios: null
          })}
          className="mt-3 text-left text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
        >
          Ler destaque completo →
        </button>
      )}

      <span className="mt-6 text-[10px] uppercase font-semibold text-white/40 tracking-wider">
        Publicado recentemente
      </span>
    </div>

    {/* Bloco da Imagem - Mantém a proporção exata fixada pelo Grid */}
    <div className="relative min-h-[260px] md:col-span-2 md:h-full overflow-hidden">
      <Image
        src={heroSlides[slideAtual].imagem}
        alt={heroSlides[slideAtual].alt}
        fill
        className="object-cover transition-opacity duration-500"
        sizes="(max-width: 768px) 100vw, 66vw"
        priority // Força o carregamento rápido da primeira imagem do Banner
      />
      <div className="absolute inset-0 bg-black/10" />
    </div>

  </div>
</section>




{/* SEÇÃO DE ESTATÍSTICAS DINÂMICAS CENTRALIZADAS */}
<section className="mt-6 mb-4">
  {/* 🟢 CORRIGIDO: Removido o grid rígido de 4 colunas em telas grandes e adicionado flex/grid flexível centralizado */}
  <div className="flex flex-wrap items-center justify-center gap-4 sm:grid sm:grid-cols-3 lg:max-w-5xl lg:mx-auto">

    {[
      { numero: contadores.colaboradores, titulo: "Colaboradores" },
      { numero: contadores.clientes, titulo: "Clientes" },
      { numero: contadores.projetos, titulo: "Projectos Criados" } 
    ].map((estatistica, chave) => (
      <div 
        key={chave} 
        className="bg-white border border-gray-200 px-3 py-5 shadow-sm rounded-lg text-center flex-1 min-w-[140px] sm:w-auto"
      >
        <h1 className="text-xl md:text-2xl font-semibold text-black">
          {estatistica.numero}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {estatistica.titulo}
        </p>
      </div>
    ))}

  </div>
</section>





        
        {/* COMUNICADOS + ANIVERSARIANTES */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">


        {/* Comunicados */}
        <article className="rounded-xl bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">
                Comunicados recentes
              </h2>

              <p className="mt-1 text-sm text-gray-700">
                Últimas informações da empresa
              </p>
            </div>

           <Link href="/comunicados"  className="cursor-pointer text-sm text-blue-700 hover:text-blue-600">Ver todos</Link>
          </div>


          <div className="mt-5 space-y-3">

            {comunicados.slice(0, 3).map((comunicado) => {
              const dataPublicacao = new Date(comunicado.data_publicacao);
              const dataFormatada = dataPublicacao.toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });

              return (
                <div
                key={comunicado.titulo}
                className="flex items-start gap-4 rounded-lg border border-gray-100 p-4 transition hover:bg-gray-50"
                >

                {/* Ícone */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <PiMegaphone
                    size={19}
                    className="text-gray-600"
                  />
                </div>


                {/* Conteúdo */}
                <div className="min-w-0">

                  <h3 className="text-sm font-medium text-gray-700">
                    {comunicado.titulo }
                  </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {limitarTexto(comunicado.descricao, 50)}
                </p>

                  <div className="flex gap-1 mt-2 ">
                  <p className="mt-1 text-xs text-gray-700">
                    {dataFormatada} .
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {comunicado.local} 
                  </p>
                  </div>

                </div>

                </div>
              );
            })}

          </div>

        </article>

        <AniversariantesCard />

      </section>




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


    </main>
  );
}
