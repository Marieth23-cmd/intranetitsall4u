"use client"
import {useState , useEffect} from "react"
import Image from "next/image";
import { PiMegaphone } from "react-icons/pi";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Link from "next/link"
import { createClient } from "../../lib/supabase/client";
import {useRouter} from "next/navigation"

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


const aniversariantes = [
  {
    nome: "Marieth",
    data: "23 Dez",
    imagem:
      "https://res.cloudinary.com/dhpa1juyr/image/upload/v1772111593/Alicia_zzjgz2.jpg",
  },
  {
    nome: "João",
    data: "22 Mai",
    imagem:
      "https://res.cloudinary.com/dhpa1juyr/image/upload/v1772111593/Alicia_zzjgz2.jpg",
  },
  {
    nome: "Ana",
    data: "25 Mai",
    imagem:
      "https://res.cloudinary.com/dhpa1juyr/image/upload/v1772111593/Alicia_zzjgz2.jpg",
  },
];

const eventos = [
  {
    mes: "MAI",
    dia: "15",
    titulo: "Reunião de equipa",
    data: "10:00 – 11:00",
    local: "Sala de Conferência A",
  },
  {
    mes: "MAI",
    dia: "28",
    titulo: "Formação de segurança",
    data: "09:30 – 12:00",
    local: "Auditório principal",
  },
   {
    mes: "MAI",
    dia: "28",
    titulo: "Formação de segurança",
    data: "09:30 – 12:00",
    local: "Auditório principal",
  },
];

type eventos={
  mes: number;
  local:string;
  dia:number;
  titulo:string;
  data:number;

  
}

type ComunicadoHome = {
  id_comunicados: number;
  titulo: string;
  descricao: string;
  local: string;
  data_publicacao: string;
};

export default function Home() {
const [comunicados , setComunicados]=useState<ComunicadoHome[]>([])
const [loading , setLoading]=useState(true)
const [primeiroNome , setPrimeiroNome]= useState("Colaborador")
const [autorizado , setAutorizado] = useState(false)
const [verificandoAcesso, setVerificandoAcesso] = useState(true)
const router = useRouter()



const horaAtual= new Date().getHours()

let saudacao:string;

if(horaAtual <=5 && horaAtual<12){
   saudacao="Bom dia"
}else if(horaAtual >=12 && horaAtual<=18 ){
  saudacao="Boa tarde"

}else{
  saudacao="Boa noite "

}

  useEffect(() => {
    async function verificarAcessoColaborador() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const role = user?.user_metadata?.role;

        if (role === "colaborador") {
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

async function fetchComunicados() {
  try {
    setLoading(true);

    const response = await fetch("/api/comunicados", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) {
      setComunicados(data.comunicados || data || []);
    }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user && user.user_metadata?.nome) {
          const nomeCompleto = user.user_metadata.nome;
          const apenasPrimeiro = nomeCompleto.split(" ")[0]; 
          setPrimeiroNome(apenasPrimeiro);
        }

    

          } catch (error) {
            console.log("Erro ao carregar dados da Home:", error);
          } finally {
            setLoading(false);
          }
        }


 useEffect(() => {
    fetchComunicados();
  }, []);


const [slideAtual, setSlideAtual] = useState(0);
const [aniversarianteInicial, setAniversarianteInicial] = useState(0);

const aniversariantesVisiveis = Array.from(
  { length: Math.min(3, aniversariantes.length) },
  (_, indice) => aniversariantes[(aniversarianteInicial + indice) % aniversariantes.length],
);

function navegarAniversariantes(direcao: number) {
  setAniversarianteInicial((atual) =>
    (atual + direcao + aniversariantes.length) % aniversariantes.length,
  );
}

useEffect(() => {
  const intervalo = setInterval(() => {
    setSlideAtual((atual) =>
      atual === heroSlides.length - 1
        ? 0
        : atual + 1
    );
  }, 5000);

  return () => clearInterval(intervalo);
}, []);

  function limitarTexto(texto:string , limite =70){
    if(texto.length<= 10){
      return texto
    }
    return `${texto.slice(0, limite ).trim() }...`
  }


  // 🟢 TRAVAS DE SEGURANÇA devem ocorrer somente após todos os hooks.
  if (verificandoAcesso || loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">A carregar portal...</div>;
  }

  if (!autorizado) {
    return <div className="flex h-screen items-center justify-center text-blue-700">A redirecionar para o painel administrativo...</div>;
  }

if(!primeiroNome){
  return(
    <div>`&quot` </div>
  )
}



  const comunicadoMaisRecente = comunicados && comunicados.length > 0 ? comunicados[0] : null;
  const tituloBanner = comunicadoMaisRecente ? comunicadoMaisRecente.titulo : "Bem-vindo à intranet Itsall4u";
  
  // Alterado aqui: Trocado de .local para .descricao para mostrar a notícia de verdade
  const descricaoBanner = comunicadoMaisRecente ? comunicadoMaisRecente.descricao : "Últimas informações da empresa";


  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">
      
      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl font-semibold text-black sm:text-3xl">
          {saudacao} , {primeiroNome}
        </h1>

        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          Bem-vinda à intranet Itsall4u.
        </p>
      </header>


     
           {/* HERO */}

           {!loading &&(  <section className="mt-8 overflow-hidden rounded-2xl bg-black shadow-sm">
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
     
     )}

         
     

      {/* COMUNICADOS + ANIVERSARIANTES */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">


        {/* Comunicados */}
        <article className="rounded-xl bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Comunicados recentes
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Últimas informações da empresa
              </p>
            </div>

           <Link href="/documentos"  className="cursor-pointer text-sm text-blue-700 hover:text-blue-600">Ver todos</Link>
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


        {/* Aniversariantes */}
        <article className="rounded-xl bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Aniversariantes              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Próximos aniversários
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Aniversariantes anteriores"
                onClick={() => navegarAniversariantes(-1)}
                disabled={aniversariantes.length <= 3}
                className="rounded-md p-1 text-blue-700 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                type="button"
                aria-label="Próximos aniversariantes"
                onClick={() => navegarAniversariantes(1)}
                disabled={aniversariantes.length <= 3}
                className="rounded-md p-1 text-blue-700 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronRight size={20} />
              </button>
            </div>

          </div>


          {/* Pessoas */}
          <div className="mt-8 flex justify-around">

            {aniversariantesVisiveis.map((pessoa) => (
              <div
                key={pessoa.nome}
                className="flex flex-col items-center text-center"
              >

                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gray-100">
                  <Image
                    src={pessoa.imagem}
                    alt={pessoa.nome}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                <p className="mt-3 text-sm font-medium text-gray-800">
                  {pessoa.nome}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {pessoa.data}
                </p>

              </div>
            ))}

          </div>

        </article>

      </section>


      {/* PRÓXIMOS EVENTOS */}
      <section className="mt-6">

        <article className="rounded-xl bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <FiCalendar
                size={19}
                className="text-gray-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Próximos eventos
              </h2>

              <p className="text-sm text-gray-400">
                Eventos e atividades da empresa
              </p>
            </div>

          </div>


          <div className="mt-5 grid gap-3 md:grid-cols-2">

            {eventos.map((evento) => (
              <div
                key={`${evento.mes}-${evento.dia}-${evento.titulo}`}
                className="flex items-center gap-4 rounded-lg border border-gray-100 p-4"
              >

                {/* Data */}
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-gray-50 text-center">

                  <span className="text-[10px] font-medium text-gray-400">
                    {evento.mes}
                  </span>

                  <span className="text-xl font-semibold text-gray-800">
                    {evento.dia}
                  </span>

                </div>


                {/* Informação */}
                <div>

                  <h3 className="text-sm font-medium text-gray-800">
                    {evento.titulo}
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    {evento.data}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {evento.local}
                  </p>

                </div>

              </div>
            ))}

          </div>

        </article>

      </section>

    </main>
  );
}
