import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { cookies } from "next/headers";



export const dynamic = "force-dynamic";

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
        const {titulo,local,descricao,publicado}=body;
        
        const {data:novoComunicado,error:authError}= await supabase.from("comunicados").insert({
        usuario_id:user.id,
        titulo:titulo,
        local:local,
        descricao:descricao,
        publicado:publicado
       }).select()
       .single();



       if(authError){
        return NextResponse.json(
            {error:authError.message},
            {status:500}
        )
       }

       return NextResponse.json(
        {
        message:"Comunicado cadastrado com sucesso",
        comunicado:novoComunicado
    },
        {status:200}
       )    

    }catch(error){
        console.error("Erro ao cadastrar comunicado:", error);
        return NextResponse.json(
            {error:"Erro ao cadastrar comunicado"},
            {status:500}
        )
    }

    }


   export async function DELETE(request: Request) {
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

        if (perfilError || perfilAdmin?.role !== "admin") {
            return NextResponse.json(
                { error: "Acesso restrito para administradores" },
                { status: 403 }
            );
        }

        const { id_comunicados } = await request.json();

        if (!id_comunicados) {
            return NextResponse.json(
                { error: "Identificador do comunicado não informado" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("comunicados")
            .delete()
            .eq("id_comunicados", id_comunicados);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Comunicado eliminado com sucesso" },
            { status: 200 }
        );
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

        if (perfilError || perfilAdmin?.role !== "admin") {
            return NextResponse.json(
                { error: "Acesso restrito para administradores" },
                { status: 403 }
            );
        }

        const { id_comunicados, titulo, descricao, local } = await request.json();

        if (!id_comunicados || !titulo) {
            return NextResponse.json(
                { error: "ID e título do comunicado são obrigatórios" },
                { status: 400 }
            );
        }

        const { data: comunicado, error } = await supabase
            .from("comunicados")
            .update({
                titulo,
                descricao: descricao || null,
                local: local || null,
            })
            .eq("id_comunicados", id_comunicados)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Comunicado atualizado com sucesso", comunicado },
            { status: 200 }
        );
    }


   export async function GET() {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data: comunicados, error } = await supabase
            .from("comunicados")
            .select(`
                id_comunicados,
                titulo,
                descricao,
                local,
                data_publicacao,
                publicado,
                usuarios(
                email
                )`)
            .order("data_publicacao", { ascending: false });


            if(error){
                return NextResponse.json(
                    {error:error.message},
                    {status:500}
                )
            }

            return NextResponse.json(
                {comunicados:comunicados},
                {status:200}
            )


    }