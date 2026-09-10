"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { toast } from "sonner";
import {useRouter}  from  "next/navigation"
import { FiBell, FiGlobe, FiMail, FiMapPin,  FiSave,  FiLock,  FiUser, FiFileText} from "react-icons/fi";

export default function DefinicoesAdminPage() {
  const [loading, setLoading] = useState(true);
  const [salvandoEmpresa, setSalvandoEmpresa] = useState(false);
  const [salvandoConta, setSalvandoConta] = useState(false);
  const [autorizado, setAutorizado] = useState(false);
  const [verificandoAcesso, setVerificandoAcesso] = useState(true)
  const router = useRouter()
  
  
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






  // 1. ESTADO INSTITUCIONAL: Alinhado com a sua nova tabela configuracoes
  const [formEmpresa, setFormEmpresa] = useState({
    nome_empresa: "",
    email_corporativo: "",
    localizacao: "",
    nif_empresa: "",
    idioma: "Português",
    fuso_horario: "Africa/Luanda" as "Africa/Luanda" | "Europa/Portugal" | "América/Brasil"
  });

  // ESTADO PESSOAL: Para gerenciar o Administrador logado
  const [formConta, setFormConta] = useState({
    nomeAdmin: "",
    emailAdmin: "",
    novaSenha: ""
  });

  // Carrega os dados reais do banco e do Auth ao abrir a tela
  async function carregarDefinicoes() {
    try {
      setLoading(true);
      const supabase = createClient();

      // A. Puxa os dados do Administrador logado na sessão
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormConta({
          nomeAdmin: user.user_metadata?.nome || "Administrador",
          emailAdmin: user.email || "",
          novaSenha: "" // Começa vazia por segurança
        });
      }

      // B. Carrega as configurações da empresa pela nossa API
      const resposta = await fetch("/api/definicoes", { cache: "no-store" });
      const dados = await resposta.json();
      
      if (resposta.ok && dados) {
        setFormEmpresa({
          nome_empresa: dados.nome_empresa || "",
          email_corporativo: dados.email_corporativo || "",
          localizacao: dados.localizacao || "",
          nif_empresa: dados.nif_empresa || "",
          idioma: dados.idioma || "Português",
          fuso_horario: dados.fuso_horario || "Africa/Luanda"
        });
      }
    } catch (error) {
      console.error("Erro ao carregar definições:", error);
    } finally {
      setLoading(false);
    }
  }

  // Envia as alterações da Empresa para a API (POST/Upsert)
  async function salvarDadosEmpresa() {
    try {
      setSalvandoEmpresa(true);
      const resposta = await fetch("/api/definicoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formEmpresa)
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        toast.success("Definições da empresa atualizadas com sucesso!");
      } else {
        toast.error(`Erro ao salvar: ${dados.error}`);
      }
    } catch (error) {
      console.error("Erro ao salvar dados da empresa:", error);
    } finally {
      setSalvandoEmpresa(false);
    }
  }

  // Atualiza as credenciais de login do Admin direto no Supabase Auth
  async function salvarDadosConta(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSalvandoConta(true);
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        email: formConta.emailAdmin,
        password: formConta.novaSenha || undefined,
        data: { nome: formConta.nomeAdmin }
      });

      if (updateError) {
        toast.error(`Erro ao atualizar conta: ${updateError.message}`);
      } else {
        toast.success("Dados pessoais atualizados com sucesso!");
        setFormConta((prev) => ({ ...prev, novaSenha: "" }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSalvandoConta(false);
    }
  }

  useEffect(() => {
    carregarDefinicoes();
  }, []);

  

  if (verificandoAcesso || loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">A carregar ...</div>;
  }

  if (!autorizado) {
    return <div className="flex h-screen items-center justify-center text-blue-700">A redirecionar para o painel administrativo...</div>;
  }


  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8 space-y-6">
      
      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl">Definições</h1>
      </header>

      {/* SEÇÃO: CONTA PESSOAL DO ADMIN */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-800">A minha conta pessoal</h2>
          <p className="mt-1 text-xs text-gray-500">Gerencie as suas credenciais de acesso ao painel de administração.</p>
        </div>

        <form onSubmit={salvarDadosConta} className="p-5 space-y-4">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Nome do Administrador</label>
              <div className="mt-2 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                <FiUser size={16} className="text-gray-400" />
                <input
                  type="text"
                  required
                  value={formConta.nomeAdmin}
                  onChange={(e) => setFormConta({ ...formConta, nomeAdmin: e.target.value })}
                  className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Email de Login</label>
              <div className="mt-2 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                <FiMail size={16} className="text-gray-400" />
                <input
                  type="email"
                  required
                  value={formConta.emailAdmin}
                  onChange={(e) => setFormConta({ ...formConta, emailAdmin: e.target.value })}
                  className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Alterar Senha (Opcional)</label>
              <div className="mt-2 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                <FiLock size={16} className="text-gray-400" />
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formConta.novaSenha}
                  onChange={(e) => setFormConta({ ...formConta, novaSenha: e.target.value })}
                  className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={salvandoConta}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
            >
              <FiSave size={17} />
              {salvandoConta ? "A atualizar..." : "Atualizar Dados Pessoais"}
            </button>
          </div>
        </form>
      </section>

      {/* SEÇÃO: INFORMAÇÕES DA EMPRESA */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-800">Informações da empresa</h2>
          <p className="mt-1 text-xs text-gray-500">Informações institucionais apresentadas na intranet.</p>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-gray-600">Nome da empresa</label>
            <div className="mt-2 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <FiGlobe size={16} className="text-gray-400" />
              <input
                type="text"
                value={formEmpresa.nome_empresa}
                onChange={(e) => setFormEmpresa({ ...formEmpresa, nome_empresa: e.target.value })}
                className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Email corporativo</label>
            <div className="mt-2 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <FiMail size={16} className="text-gray-400" />
              <input
                type="email"
                value={formEmpresa.email_corporativo}
                onChange={(e) => setFormEmpresa({ ...formEmpresa, email_corporativo: e.target.value })}
                className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">NIF da empresa (10 dígitos)</label>
            <div className="mt-2 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <FiFileText size={16} className="text-gray-400" />
              <input
                type="text"
                maxLength={10}
                value={formEmpresa.nif_empresa}
                onChange={(e) => setFormEmpresa({ ...formEmpresa, nif_empresa: e.target.value })}
                className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Localização</label>
            <div className="mt-2 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                            <FiMapPin size={16} className="text-gray-400" />
              <input
                type="text"
                value={formEmpresa.localizacao}
                onChange={(e) => setFormEmpresa({ ...formEmpresa, localizacao: e.target.value })}
                className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={salvarDadosEmpresa}
            disabled={salvandoEmpresa}
            className="
              inline-flex items-center justify-center
              gap-2 rounded-md bg-blue-700 cursor-pointer
              px-4 py-2.5 text-sm font-medium
              text-white shadow-sm transition
              hover:bg-blue-600
              focus:outline-none focus:ring-2
              focus:ring-blue-700 focus:ring-offset-2
              disabled:opacity-50
            "
          >
            <FiSave size={17} />
            {salvandoEmpresa ? "A gravar..." : "Guardar alterações"}
          </button>
        </div>
      </section>

      {/* SEÇÃO: PREFERÊNCIAS E ENUMS */}
      <section className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-800">Preferências</h2>
          <p className="mt-1 text-xs text-gray-500">Defina algumas preferências gerais da plataforma.</p>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Idioma */}
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Idioma</p>
              <p className="mt-1 text-xs text-gray-400">Idioma utilizado na interface da intranet.</p>
            </div>
            <select
              value={formEmpresa.idioma}
              onChange={(e) => setFormEmpresa({ ...formEmpresa, idioma: e.target.value })}
              className="
                rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600
                outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 cursor-pointer
              "
            >
              <option value="Português">Português</option>
              <option value="English">English</option>
            </select>
          </div>

          {/* Fuso horário - Alinhado estritamente com os valores do seu ENUM tipos_fusohorarios */}
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Fuso horário</p>
              <p className="mt-1 text-xs text-gray-400">Utilizado para datas e horários apresentados na plataforma.</p>
            </div>
            <select
              value={formEmpresa.fuso_horario}
              onChange={(e) => setFormEmpresa({ 
                ...formEmpresa, 
                fuso_horario: e.target.value as "Africa/Luanda" | "Europa/Portugal" | "América/Brasil" 
              })}
              className="
                rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600
                outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 cursor-pointer
              "
            >
              <option value="Africa/Luanda">Africa/Luanda</option>
              <option value="Europa/Portugal">Europa/Portugal</option>
              <option value="América/Brasil">América/Brasil</option>
            </select>
          </div>
        </div>
      </section>

      {/* SEÇÃO: NOTIFICAÇÕES (Layout Estático Preservado) */}
      <section className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <FiBell size={17} className="text-blue-700" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Notificações</h2>
              <p className="mt-1 text-xs text-gray-500">Controle quais acontecimentos devem gerar notificações.</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Férias */}
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Pedidos de férias </p>
              <p className="mt-1 text-xs text-gray-400">Receber notificações sobre novos pedidos de férias .</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-blue-700 peer-checked:after:translate-x-full peer-checked:after:border-white" />
            </label>
          </div>


          {/* Comunicados */}
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Novos comunicados</p>
              <p className="mt-1 text-xs text-gray-400">Notificar colaboradores quando um novo comunicado for publicado.</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-blue-700 peer-checked:after:translate-x-full peer-checked:after:border-white" />
            </label>
          </div>
        </div>
      </section>

    </main>
  );
}

