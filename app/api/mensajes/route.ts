import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Mensaje = {
  id: string;
  nombre: string;
  mensaje: string;
  fecha: string;
  parent_id?: string | null;
};

export async function GET() {
  // #region agent log
  const logIngest = (msg: string, d: Record<string, unknown>) => {
    fetch("http://127.0.0.1:7242/ingest/9917d2e5-4158-4a1f-9549-b4380ba2dc19", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "api/mensajes/route.ts:GET", message: msg, data: d, timestamp: Date.now(), sessionId: "debug-session" }) }).catch(() => {});
  };
  logIngest("GET entry", { hypothesisId: "H3" });
  // #endregion
  const { data, error } = await supabase
    .from("mensajes")
    .select("*")
    .order("fecha", { ascending: true });

  // #region agent log
  logIngest("after supabase", { hypothesisId: "H3", hasError: !!error, errorMessage: error?.message ?? null, dataLength: Array.isArray(data) ? data.length : "not-array" });
  // #endregion
  if (error) {
    return NextResponse.json(
      { error: "Error al cargar los mensajes" },
      { status: 500 }
    );
  }

  const payload = (data ?? []) as Mensaje[];
  // #region agent log
  logIngest("before return", { hypothesisId: "H4", payloadLength: payload.length });
  // #endregion
  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, mensaje, parent_id } = body;

    if (!nombre?.trim() || !mensaje?.trim()) {
      return NextResponse.json(
        { error: "Nombre y mensaje son requeridos" },
        { status: 400 }
      );
    }

    const insert: Record<string, unknown> = {
      nombre: nombre.trim(),
      mensaje: mensaje.trim(),
    };
    if (parent_id && typeof parent_id === "string" && parent_id.trim()) {
      insert.parent_id = parent_id.trim();
    }

    const { data: nuevoMensaje, error } = await supabase
      .from("mensajes")
      .insert(insert)
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
