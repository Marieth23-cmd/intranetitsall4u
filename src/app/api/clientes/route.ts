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

    if(perfilAdmin?.role !== "admin" && perfilAdmin?.role !== "gestor"){
        return NextResponse.json(
            {error:"Acesso restrito para administradores e gestores"},
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

export async function PATCH(request: Request) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: perfilAdmin, error: perfilError } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id_usuario", user.id)
        .single();

    if (perfilError) {
        return NextResponse.json({ error: perfilError.message }, { status: 500 });
    }

    if (perfilAdmin?.role !== "admin" && perfilAdmin?.role !== "gestor") {
        return NextResponse.json(
            { error: "Acesso restrito para administradores e gestores" },
            { status: 403 }
        );
    }

    try {
        const { id_cliente, nome, area, projetos, estado } = await request.json();

        if (!id_cliente || !nome || !area || !Number.isInteger(projetos) || projetos < 0 || !["ativo", "inativo"].includes(estado)) {
            return NextResponse.json(
                { error: "Dados do cliente inválidos" },
                { status: 400 }
            );
        }

        const { data: cliente, error } = await supabase
            .from("clientes")
            .update({ nome, area, projetos, estado })
            .eq("id_cliente", id_cliente)
            .select("id_cliente, nome, area, projetos, estado")
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { cliente, message: "Cliente atualizado com sucesso" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        return NextResponse.json(
            { error: "Erro ao processar a requisição" },
            { status: 500 }
        );
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