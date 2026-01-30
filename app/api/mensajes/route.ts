import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Mensaje = {
  id: string;
  nombre: string;
  mensaje: string;
  fecha: string;
};

export async function GET() {
  const { data, error } = await supabase
    .from("mensajes")
    .select("*")
    .order("fecha", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Error al cargar los mensajes" },
      { status: 500 }
    );
  }

  return NextResponse.json((data ?? []) as Mensaje[]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, mensaje } = body;

    if (!nombre?.trim() || !mensaje?.trim()) {
      return NextResponse.json(
        { error: "Nombre y mensaje son requeridos" },
        { status: 400 }
      );
    }

    const { data: nuevoMensaje, error } = await supabase
      .from("mensajes")
      .insert({ nombre: nombre.trim(), mensaje: mensaje.trim() })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Error al guardar el mensaje" },
        { status: 500 }
      );
    }

    return NextResponse.json(nuevoMensaje as Mensaje, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al guardar el mensaje" },
      { status: 500 }
    );
  }
}
