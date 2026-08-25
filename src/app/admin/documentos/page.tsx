"use client";

import {
  FiDownload, FiFileText, FiSearch, FiPlus, FiEye, FiEdit2, FiTrash2,} from "react-icons/fi";

const documentos = [
  {
    fileName: "Alvará Comercial",
    fileType: "PDF",
    fileSize: "1.2 MB",
    uploadDate: "15 Jun 2023",
    downloadLink: "/documentos/documento1.pdf",
    acesso: "Interno",
  },
  {
    fileName: "Informações da Empresa",
    fileType: "DOCX",
    fileSize: "353 KB",
    uploadDate: "16 Jun 2023",
    downloadLink: "/documentos/documento2.docx",
    acesso: "Interno",
  },
  {
    fileName: "Contrato de Prestação de Serviços",
    fileType: "XLSX",
    fileSize: "1.8 MB",
    uploadDate: "17 Jun 2023",
    downloadLink: "/documentos/documento3.xlsx",
    acesso: "Restrito",
  },
  {
    fileName: "Contrato de Prestação de Serviços",
    fileType: "XLSX",
    fileSize: "1.8 MB",
    uploadDate: "17 Jun 2023",
    downloadLink: "/documentos/documento4.xlsx",
    acesso: "Restrito",
  },
];

function AcessoDocumento({ acesso }: { acesso: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        acesso === "Restrito"
          ? "bg-gray-100 text-gray-700"
          : "bg-yellow-50 text-yellow-700"
      }`}
    >
      {acesso}
    </span>
  );
}

export default function DocumentosAdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">

      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl">
            Gestão de documentos
          </h1>

        
        </div>

        <button
          type="button"
          className="
            inline-flex items-center justify-center gap-2
            rounded-md bg-yellow-700 px-4 py-2.5
            text-sm font-medium text-white shadow-sm
            transition hover:bg-yellow-600
            focus:outline-none focus:ring-2
            focus:ring-yellow-700 focus:ring-offset-2
          "
        >
          <FiPlus size={18} />
          Novo documento
        </button>

      </header>

      {/* Pesquisa */}
      <div
        className="
          mt-6 flex max-w-md items-center
          rounded-lg border border-gray-200
          bg-white px-4 py-2.5 shadow-sm
        "
      >
        <FiSearch
          className="text-gray-400"
          size={18}
        />

        <input
          type="search"
          placeholder="Pesquisar documentos..."
          className="
            ml-3 w-full bg-transparent
            text-sm outline-none
            placeholder:text-gray-400
          "
        />
      </div>

      {/* Lista de documentos */}
      <div
        className="
          mt-8 overflow-hidden rounded-xl
          border border-gray-200 bg-white
          shadow-sm
        "
      >

        {/* Cabeçalho da tabela */}
        <div
          className="
            hidden grid-cols-12 border-b
            bg-gray-50 px-5 py-3
            text-xs font-medium uppercase
            tracking-wide text-gray-500
            md:grid
          "
        >

          <div className="col-span-4">
            Documento
          </div>

          <div className="col-span-1">
            Tipo
          </div>

          <div className="col-span-2">
            Data
          </div>

          <div className="col-span-2">
            Acesso
          </div>

          <div className="col-span-3 text-right">
            Ações
          </div>

        </div>

        {/* Documentos */}
        {documentos.map((documento, index) => (

          <div
            key={index}
            className="
              grid grid-cols-1 gap-4
              border-b border-gray-100
              px-5 py-4 last:border-b-0
              md:grid-cols-12 md:items-center md:gap-0
            "
          >

            {/* Documento */}
            <div className="col-span-4 flex items-center gap-3">

              <div
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-lg bg-yellow-50
                "
              >
                <FiFileText
                  size={19}
                  className="text-yellow-700"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">
                  {documento.fileName}
                </p>

                <p className="text-xs text-gray-400">
                  {documento.fileSize}
                </p>
              </div>

            </div>

            {/* Tipo */}
            <div className="col-span-1 text-sm text-gray-500">

              <span className="md:hidden mr-2 text-xs text-gray-400">
                Tipo:
              </span>

              {documento.fileType}

            </div>

            {/* Data */}
            <div className="col-span-2 text-sm text-gray-500">

              <span className="md:hidden mr-2 text-xs text-gray-400">
                Data:
              </span>

              {documento.uploadDate}

            </div>

            {/* Acesso */}
            <div className="col-span-2">

              <span className="mr-2 text-xs text-gray-400 md:hidden">
                Acesso:
              </span>

              <AcessoDocumento acesso={documento.acesso} />

            </div>

            {/* Ações */}
            <div className="col-span-3 flex items-center justify-end gap-2">

              {/* Visualizar */}
              <button
                type="button"
                title="Visualizar documento"
                className="
                  rounded-lg border border-gray-200
                  p-2 text-gray-500
                  transition hover:bg-gray-50
                  hover:text-gray-800
                "
              >
                <FiEye size={17} />
              </button>

              {/* Baixar */}
              <a
                href={documento.downloadLink}
                download
                title="Baixar documento"
                className="
                  rounded-lg border border-gray-200
                  p-2 text-gray-500
                  transition hover:bg-gray-50
                  hover:text-gray-800
                "
              >
                <FiDownload size={17} />
              </a>

              {/* Editar */}
              <button
                type="button"
                title="Editar documento"
                className="
                  rounded-lg border border-gray-200
                  p-2 text-gray-500
                  transition hover:bg-gray-50
                  hover:text-gray-800
                "
              >
                <FiEdit2 size={17} />
              </button>

              {/* Eliminar */}
              <button
                type="button"
                title="Eliminar documento"
                className="
                  rounded-lg border border-red-100
                  p-2 text-red-500
                  transition hover:bg-red-50
                "
              >
                <FiTrash2 size={17} />
              </button>

            </div>

          </div>

        ))}

      </div>

    </main>
  );
}