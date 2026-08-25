"use client";

import {
  FiBell,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSave,
} from "react-icons/fi";

export default function DefinicoesAdminPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">

      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl">
          Definições
        </h1>

        
      </header>

      {/* Informações da empresa */}
      <section className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            Informações da empresa
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Informações institucionais apresentadas na intranet.
          </p>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">

          {/* Nome */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Nome da empresa
            </label>

            <div className="mt-2 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <FiGlobe
                size={16}
                className="text-gray-400"
              />

              <input
                type="text"
                defaultValue="itsall4u"
                className="
                  ml-3 w-full bg-transparent
                  text-sm text-gray-700
                  outline-none
                "
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Email corporativo
            </label>

            <div className="mt-2 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <FiMail
                size={16}
                className="text-gray-400"
              />

              <input
                type="email"
                defaultValue="geral@itsall4u.com"
                className="
                  ml-3 w-full bg-transparent
                  text-sm text-gray-700
                  outline-none
                "
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Telefone
            </label>

            <div className="mt-2 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <FiPhone
                size={16}
                className="text-gray-400"
              />

              <input
                type="text"
                defaultValue="+244 000 000 000"
                className="
                  ml-3 w-full bg-transparent
                  text-sm text-gray-700
                  outline-none
                "
              />
            </div>
          </div>

          {/* Localização */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Localização
            </label>

            <div className="mt-2 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <FiMapPin
                size={16}
                className="text-gray-400"
              />

              <input
                type="text"
                defaultValue="Luanda, Angola"
                className="
                  ml-3 w-full bg-transparent
                  text-sm text-gray-700
                  outline-none
                "
              />
            </div>
          </div>

        </div>

        <div className="flex justify-end border-t border-gray-100 px-5 py-4">

          <button
            type="button"
            className="
              inline-flex items-center justify-center
              gap-2 rounded-md bg-yellow-700
              px-4 py-2.5 text-sm font-medium
              text-white shadow-sm transition
              hover:bg-yellow-600
              focus:outline-none focus:ring-2
              focus:ring-yellow-700 focus:ring-offset-2
            "
          >
            <FiSave size={17} />
            Guardar alterações
          </button>

        </div>

      </section>

      {/* Preferências */}
      <section className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            Preferências
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Defina algumas preferências gerais da plataforma.
          </p>
        </div>

        <div className="divide-y divide-gray-100">

          {/* Idioma */}
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-medium text-gray-700">
                Idioma
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Idioma utilizado na interface da intranet.
              </p>
            </div>

            <select
              defaultValue="Português"
              className="
                rounded-lg border border-gray-200
                bg-white px-3 py-2
                text-sm text-gray-600
                outline-none
                focus:border-yellow-700
                focus:ring-1 focus:ring-yellow-700
              "
            >
              <option>Português</option>
              <option>English</option>
            </select>

          </div>

          {/* Fuso horário */}
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-medium text-gray-700">
                Fuso horário
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Utilizado para datas e horários apresentados na plataforma.
              </p>
            </div>

            <select
              defaultValue="Africa/Luanda"
              className="
                rounded-lg border border-gray-200
                bg-white px-3 py-2
                text-sm text-gray-600
                outline-none
                focus:border-yellow-700
                focus:ring-1 focus:ring-yellow-700
              "
            >
              <option value="Africa/Luanda">
                Africa/Luanda
              </option>

              <option value="Europe/Lisbon">
                Europe/Lisbon
              </option>
            </select>

          </div>

        </div>

      </section>

      {/* Notificações */}
      <section className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50">
              <FiBell
                size={17}
                className="text-yellow-700"
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Notificações
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Controle quais acontecimentos devem gerar notificações.
              </p>
            </div>

          </div>

        </div>

        <div className="divide-y divide-gray-100">

          {/* Férias */}
          <div className="flex items-center justify-between gap-4 px-5 py-4">

            <div>
              <p className="text-sm font-medium text-gray-700">
                Pedidos de férias e ausências
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Notificar administradores quando um novo pedido for criado.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">

              <input
                type="checkbox"
                defaultChecked
                className="peer sr-only"
              />

              <div
                className="
                  h-6 w-11 rounded-full
                  bg-gray-200
                  after:absolute after:left-[2px]
                  after:top-[2px] after:h-5
                  after:w-5 after:rounded-full
                  after:border after:border-gray-300
                  after:bg-white after:transition-all
                  peer-checked:bg-yellow-700
                  peer-checked:after:translate-x-full
                  peer-checked:after:border-white
                "
              />

            </label>

          </div>

          {/* Novos colaboradores */}
          <div className="flex items-center justify-between gap-4 px-5 py-4">

            <div>
              <p className="text-sm font-medium text-gray-700">
                Novos colaboradores
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Notificar administradores quando um colaborador for registado.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">

              <input
                type="checkbox"
                defaultChecked
                className="peer sr-only"
              />

              <div
                className="
                  h-6 w-11 rounded-full
                  bg-gray-200
                  after:absolute after:left-[2px]
                  after:top-[2px] after:h-5
                  after:w-5 after:rounded-full
                  after:border after:border-gray-300
                  after:bg-white after:transition-all
                  peer-checked:bg-yellow-700
                  peer-checked:after:translate-x-full
                  peer-checked:after:border-white
                "
              />

            </label>

          </div>

          {/* Comunicados */}
          <div className="flex items-center justify-between gap-4 px-5 py-4">

            <div>
              <p className="text-sm font-medium text-gray-700">
                Novos comunicados
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Notificar colaboradores quando um novo comunicado for publicado.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">

              <input
                type="checkbox"
                defaultChecked
                className="peer sr-only"
              />

              <div
                className="
                  h-6 w-11 rounded-full
                  bg-gray-200
                  after:absolute after:left-[2px]
                  after:top-[2px] after:h-5
                  after:w-5 after:rounded-full
                  after:border after:border-gray-300
                  after:bg-white after:transition-all
                  peer-checked:bg-yellow-700
                  peer-checked:after:translate-x-full
                  peer-checked:after:border-white
                "
              />

            </label>

          </div>

        </div>

      </section>

    </main>
  );
}