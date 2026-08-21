

const Clientes=[
    {
        Nome_Cliente: "Aliança Seguros",
        Area: "Seguros",
        Projectos: "10",
        Estado: "Activo",
    },
     {
        Nome_Cliente: "ZON",
        Area: "Telecomunicações",
        Projectos: "10",
        Estado: "Activo",

    },
    {
        Nome_Cliente: "Bwizer",
        Area: "Saúde",
        Projectos: "10",
        Estado: "Inactivo",
        
    }
]




export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 text-gray-700 sm:px-6 lg:px-8">
      
      <div> 
       
        <h1 className="text-2xl font-semibold text-gray-700 sm:text-3xl"> Clientes
             </h1>
             <p>Pesquisar clientes e informações autorizadas.</p>



               {/*Pesquisae clientes */} 
               <div className="mt-6 flex items-center gap-2">
              < label htmlFor="search" className="block text-sm font-medium text-gray-700"></label>
            <input 
                type="search" name="search" 
                placeholder="Pesquisar clientes" 
                className="w-full min-w-0 sm:w-[250px] lg:w-[500px] rounded-lg border border-gray-300 py-2 pl-11 pr-4 outline-none"/>
                
            <button className="ml-2 inline-flex items-center rounded-md border border-transparent bg-yellow-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:ring-offset-2">
              Pesquisar
            </button>
            </div>



<table className="mt-6 w-full border border-gray-200 shadow-sm">
  <thead className="bg-gray-100">
    <tr>
      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
        Nome do Cliente
      </th>

      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
        Área
      </th>

      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
        Projectos
      </th>

      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
        Estado
      </th>
    </tr>
  </thead>

  <tbody>
    {Clientes.map((cliente, index) => (
      <tr
        key={index}
        className="border-t border-gray-200"
      >
        <td className="px-4 py-2 text-sm text-gray-700">
          {cliente.Nome_Cliente}
        </td>

        <td className="px-4 py-2 text-sm text-gray-700">
          {cliente.Area}
        </td>

        <td className="px-4 py-2 text-sm text-gray-700">
          {cliente.Projectos}
        </td>



        
        <td className="px-4 py-2 text-sm text-gray-700">
           {cliente.Estado === "Activo" ? (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-green-100 bg-green-500 rounded-full">Ativo</span>
            ) : (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full">Inativo</span>
            )} 
        </td>
      </tr>
    ))}
  </tbody>
</table>




        
           


        </div>   
      
      
      
      </div>
  );
}
