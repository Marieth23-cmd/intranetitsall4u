"use client";
import Image from "next/image"
import { useState, useEffect } from "react";

type ColaboradorAniversario = {
  id_colaborador: string;
  nome: string;
  data_nascimento: string;
  foto_url?: string | null;
};

export default function AniversariantesCard() {
  const [aniversariantes, setAniversariantes] = useState<
    ColaboradorAniversario[]
  >([]);

  const [carregando, setCarregando] = useState(true);

  async function carregarAniversariantes() {
    try {
      setCarregando(true);

      const resposta = await fetch("/api/aniversariantes", {
        cache: "no-store",
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        setAniversariantes(dados.aniversariantes || []);
      }
    } catch (error) {
      console.error(
        "Erro ao carregar aniversariantes no card:",
        error
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAniversariantes();
  }, []);

  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const mesAtual = hoje.getMonth() + 1;

  const aniversariantesOrdenados = [...aniversariantes].sort((a, b) => {
    if (!a.data_nascimento || !b.data_nascimento) return 0;

    const dateA = new Date(a.data_nascimento);
    const dateB = new Date(b.data_nascimento);

    const diaA = dateA.getDate();
    const mesA = dateA.getMonth() + 1;

    const diaB = dateB.getDate();
    const mesB = dateB.getMonth() + 1;

    let mesesAteA = mesA - mesAtual;

    if (
      mesesAteA < 0 ||
      (mesesAteA === 0 && diaA < diaAtual)
    ) {
      mesesAteA += 12;
    }

    let mesesAteB = mesB - mesAtual;

    if (
      mesesAteB < 0 ||
      (mesesAteB === 0 && diaB < diaAtual)
    ) {
      mesesAteB += 12;
    }

    if (mesesAteA !== mesesAteB) {
      return mesesAteA - mesesAteB;
    }

    return diaA - diaB;
  });

  // Apenas os 3 próximos aniversariantes
  const visiveis = aniversariantesOrdenados.slice(0, 3);

  if (carregando) {
    return (
      <article className="flex h-full min-h-[300px] items-center justify-center rounded-xl bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm text-gray-400">
          A carregar aniversariantes...
        </p>
      </article>
    );
  }

  return (
    <article className="flex h-full min-h-[300px] flex-col rounded-xl bg-white p-5 shadow-sm sm:p-6">

      {/* Cabeçalho */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Aniversariantes
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          Próximos aniversários na empresa
        </p>
      </div>

      {/* Aniversariantes */}
      {visiveis.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-400">
            Sem aniversários registados.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid flex-1 grid-cols-3 items-center gap-3">

          {visiveis.map((pessoa) => {
            const iniciais = pessoa.nome
              ? pessoa.nome
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((nome) => nome[0])
                  .join("")
                  .toUpperCase()
              : "CB";

            const dataFormatada = pessoa.data_nascimento
              ? new Date(
                  pessoa.data_nascimento
                ).toLocaleDateString("pt-PT", {
                  day: "numeric",
                  month: "short",
                })
              : "—";

            return (
              <div
                key={pessoa.id_colaborador}
                className="flex min-w-0 flex-col items-center text-center"
              >

                {/* Foto ou iniciais */}
                {pessoa.foto_url ? (
                  <Image
                    src={pessoa.foto_url}
                    alt={pessoa.nome}
                    className="
                      h-16 w-16
                      rounded-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex h-16 w-16
                      items-center justify-center
                      rounded-full
                      border border-blue-700/30
                      bg-blue-50
                      text-base font-semibold
                      text-blue-700
                    "
                  >
                    {iniciais}
                  </div>
                )}

                {/* Nome */}
                <p
                  className="
                    mt-3 w-full
                    truncate px-1
                    text-sm font-semibold
                    text-gray-800
                  "
                  title={pessoa.nome}
                >
                  {pessoa.nome}
                </p>

                {/* Data */}
                <p className="mt-1 text-xs font-medium text-blue-700">
                  {dataFormatada}
                </p>

              </div>
            );
          })}

        </div>
      )}

    </article>
  );
}