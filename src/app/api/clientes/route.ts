 import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { cookies } from "next/headers";


export const dynamic = 'force-dynamic';
export async function  POST(request:Request) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const{data:{user}}= await supabase.auth.getUser();

    if(!user){
        return NextResponse.json(
            {error:"Não autorizado"},
            {status:401})
    }


    const {data:perfilAdmin,error:perfilError}= await supabase
    .from("usuarios")
    .select("role")
    .eq("id_usuario",user.id)
    .single();


    if(perfilError){
        return NextResponse.json(
            {error:perfilError.message},
            {status:500}
        )
    }

    if(perfilAdmin?.role !== "admin"){
        return NextResponse.json(
            {error:"Acesso restrito para administradores"},
            {status:403}
        )
    }


    try{
        const body = await request.json();
        const {nome,area,projetos,estado}=body;
    

        const {data:novoCliente,error:authError}= await supabase.from("clientes").insert({
        usuario_id:user.id,
        nome:nome,
        area:area,
        projetos:projetos,
        estado:estado
       }).select()
       .single();

       if(authError){
        return NextResponse.json(
            {error:authError.message},
            {status:500}
        )
       }

        return NextResponse.json({cliente :novoCliente, message:"Cliente criado com sucesso"}, {status:200});
    
    
    }catch(error){ 
        console.log("Erro inesperado no banco de dados" , error)
        return NextResponse.json(
            {error:"Erro ao processar a requisição"},
            {status:500}
        )
       
    }



}


export async function GET() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {data:clientes,error}= await supabase
    .from("clientes")
    .select(`
        id_cliente,
        nome,
        area,
        projetos,
        estado
        `)
    .order("data_criacao",{ascending:false});

    if(error){
        return NextResponse.json(
            {error:error.message},
            {status:500}
        )
    }

    return NextResponse.json({clientes:clientes},{status:200});




}