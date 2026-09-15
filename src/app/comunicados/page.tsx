"use client";
import { useState, useEffect, useRef } from "react";
import {useRouter} from "next/navigation"
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

export default function ComunicadosPage() {
const [comunicados, setComunicados] = useState<Comunicado[]>([]);
const [loading, setLoading] = useState(true);
const [autorizado , setAutorizado] =useState(false)
 const [verificandoAcesso, setVerificandoAcesso] = useState(true)
 const router = useRouter()
const visualizacoesRegistadas = useRef(new Set<string>());


 const fetchComunicados = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/comunicados", {
        cache: "no-store", // Evita cache para garantir dados atualizados
      });
      const data = await response.json();
      setComunicados(data.comunicados || []);
    } catch (error) {
      console.error("Erro ao buscar comunicados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComunicados();
  }, []);

  useEffect(() => {
    async function registrarVisualizacoes() {
      if (!autorizado || comunicados.length === 0) return;

      await Promise.all(
        comunicados.map(async (comunicado) => {
          if (visualizacoesRegistadas.current.has(comunicado.id_comunicados)) return;
          visualizacoesRegistadas.current.add(comunicado.id_comunicados);

          try {
            const resposta = await fetch("/api/visualizacoes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_comunicado: comunicado.id_comunicados }),
            });

            if (!resposta.ok) {
              visualizacoesRegistadas.current.delete(comunicado.id_comunicados);
              const dados = await resposta.json().catch(() => ({}));
              console.error("Erro ao registar visualização:", dados.error || resposta.statusText);
            }
          } catch (error) {
            visualizacoesRegistadas.current.delete(comunicado.id_comunicados);
            console.error("Erro ao registar visualização:", error);
          }
        })
      );
    }

    void registrarVisualizacoes();
  }, [autorizado, comunicados]);


  
useEffect(()=>{
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



 }, [router])

 if (verificandoAcesso || loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">A carregar portal...</div>;
  }

  if (!autorizado) {
    return <div className="flex h-screen items-center justify-center text-blue-700">A redirecionar para o painel administrativo...</div>;
  }




  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">
      
      <h1 className="text-2xl font-semibold text-gray-700 sm:text-3xl">
        Comunicados
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Informações e comunicados internos da empresa.
      </p>

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
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {comunicado.titulo}
          </h2>

          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {comunicado.usuarios?.email || "Sistema"}
          </span>
        </div>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {comunicado.descricao}
            </p>

            <p className="mt-4 text-xs text-gray-400">
              {dataFormatada} · {comunicado.local || "Geral"}
            </p>
          </div>

       </div>
      </article>
    )})}

      </div>

    </main>
  );
}