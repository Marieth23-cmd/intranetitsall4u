import { FiDownload, FiFileText, FiSearch } from "react-icons/fi";

const documentos = [
  {
    fileName: "Alvara Comercial",
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

export default function DocumentosPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8 text-gray-700">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Documentos
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Consulte os documentos disponíveis para si.
        </p>
      </div>

      {/* Pesquisa */}
      <div className="mt-6 flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-sm max-w-md">
        <FiSearch className="text-gray-400" size={18} />

        <input
          type="search"
          placeholder="Pesquisar documentos..."
          className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Lista */}
      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white">

        {/* Cabeçalho da tabela */}
        <div className="hidden grid-cols-12 border-b bg-gray-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 md:grid">

          <div className="col-span-5">
            Documento
          </div>

          <div className="col-span-2">
            Tipo
          </div>

          <div className="col-span-2">
            Data
          </div>

          <div className="col-span-2">
            Acesso
          </div>

          <div className="col-span-1">
          </div>

        </div>

        {/* Documentos */}
        {documentos.map((documento, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-3 border-b border-gray-100 px-5 py-4 last:border-b-0 md:grid-cols-12 md:items-center md:gap-0"
          >

            {/* Nome */}
            <div className="col-span-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
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
            <div className="col-span-2 text-sm text-gray-500">
              {documento.fileType}
            </div>

            {/* Data */}
            <div className="col-span-2 text-sm text-gray-500">
              {documento.uploadDate}
            </div>

            {/* Acesso */}
            <div className="col-span-2">

              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  documento.acesso === "Restrito"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-yellow-50/50 text-yellow-700"
                }`}
              >
                {documento.acesso}
              </span>

            </div>

            {/* Download */}
            <div className="col-span-1 md:text-right">

              <a
                href={documento.downloadLink}
                download
                title="Baixar documento"
                className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                <FiDownload size={18} />
              </a>

            </div>

          </div>
        ))}

      </div>

    </main>
  );
}
