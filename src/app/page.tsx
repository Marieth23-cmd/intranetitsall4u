"use client"
import {useState , useEffect} from "react"
import Image from "next/image";
import { PiMegaphone } from "react-icons/pi";
import {useRouter} from "next/navigation"
import Link from "next/link"
import { createClient } from "../../lib/supabase/client";
import AniversariantesCard from "./Components/AniversariantesCard";

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



type ComunicadoHome = {
  id_comunicados: number;
  titulo: string;
  descricao: string;
  local: string;
  data_publicacao: string;
};

export const dynamic = 'force-dynamic';

export default function Home() {
  const [slideAtual, setSlideAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [comunicados, setComunicados] = useState<ComunicadoHome[]>([]);
  const [primeiroNome , setPrimeiroNome] = useState("Admin")
  const router = useRouter()



  useEffect(() => {
    async function verificarAcessoAdmin() {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const role = user?.user_metadata?.role;

        if (role === "colaborador") {
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
        <h1 className="text-2xl font-semibold text-black sm:text-3xl">
          {saudacao}, {primeiroNome}
        </h1>

        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          Bem-vinda à intranet Itsall4u.
        </p>
      </header>


      {/* HERO */}
      <section className="mt-8 overflow-hidden rounded-2xl bg-black shadow-sm">
        <div className="grid min-h-[320px] grid-cols-1 md:grid-cols-3">

          {/* Texto */}
          <div className="flex flex-col justify-center p-8 text-white sm:p-10 md:col-span-1 lg:p-12">
            
            <span className="mb-4 text-xs font-medium uppercase tracking-widest text-white/70">
              Comunicação interna
            </span>

            <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
              {tituloBanner}
            </h2>

            <p className="mt-4 text-sm leading-6 text-white/90">
              {descricaoBanner}
            </p>

            <span className="mt-6 text-xs text-white/60">
              Publicado recentemente
            </span>
          </div>


          {/* Imagem */}
         <div className="relative min-h-[260px] md:col-span-2 overflow-hidden">

            <Image
              src={heroSlides[slideAtual].imagem}
              alt={heroSlides[slideAtual].alt}
              fill
              className="object-cover transition-opacity duration-500"
              sizes="(max-width: 768px) 100vw, 66vw"
            />

            <div className="absolute inset-0 bg-black/10" />

            </div>

        </div>
      </section>


        {/* COMUNICADOS + ANIVERSARIANTES */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">


        {/* Comunicados */}
        <article className="rounded-xl bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
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
                <p className="text-sm text-gray-500">
                  {limitarTexto(comunicado.descricao, 50)}
                </p>

                  <p className="mt-1 text-xs text-gray-700">
                    {dataFormatada}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {comunicado.local}
                  </p>

                </div>

                </div>
              );
            })}

          </div>

        </article>

        <AniversariantesCard />

      </section>


    </main>
  );
}
