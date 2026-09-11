import { createServerClient } from "@supabase/ssr";
import {cookies} from "next/headers"



const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKEY= process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;


export const createClient = (cookieStore:Awaited <ReturnType<typeof cookies>>)=>{
    return createServerClient (
        supabaseUrl!,
        supabaseKEY!,
        {
            cookies:{
                getAll(){
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet){
                    cookiesToSet.forEach(({name , value ,options}) => cookieStore.set(name,value,options))
                    try {
                        
                    } catch {
                        // The `setAll` method was called from a Server Component.
                         // This can be ignored if you have middleware refreshing
                       // user sessions.
                        
                    }
                }
            }
        }
    )
}