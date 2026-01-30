import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Mensaje = {
  id: string;
  nombre: string;
  mensaje: string;
  fecha: string;
  parent_id?: string | null;
};

// #region agent log
const logIngest = (msg: string, d: Record<string, unknown>) => {
  fetch("http://127.0.0.1:7242/ingest/9917d2e5-4158-4a1f-9549-b4380ba2dc19", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "api/mensajes/[id]/route.ts", message: msg, data: d, timestamp: Date.now(), sessionId: "debug-session" }) }).catch(() => {});
};
// #endregion

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    logIngest("PATCH entry", { id });
    const body = await _request.json();
    const { nombre, mensaje } = body;

    const updates: Partial<Pick<Mensaje, "nombre" | "mensaje">> = {};
    if (typeof nombre === "string" && nombre.trim()) updates.nombre = nombre.trim();
    if (typeof mensaje === "string" && mensaje.trim()) updates.mensaje = mensaje.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Se requiere nombre o mensaje para editar" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("mensajes")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    logIngest("PATCH after supabase", { hasError: !!error, errorMessage: error?.message ?? null, dataNull: data === null });
    if (error) {
      return NextResponse.json(
        { error: error.message || "Error al actualizar el mensaje" },
        { status: 500 }
      );
    }
    if (data === null) {
      return NextResponse.json(
        { error: "Mensaje no encontrado o sin permiso para editarlo. ¿Tienes SUPABASE_SERVICE_ROLE_KEY en .env.local?" },
        { status: 404 }
      );
    }

    return NextResponse.json(data as Mensaje);
  } catch (e) {
    logIngest("PATCH catch", { err: String(e) });
    return NextResponse.json(
      { error: "Error al actualizar el mensaje" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    logIngest("DELETE entry", { id });

    // Eliminar primero las respuestas (si existe la columna parent_id)
    try {
      await supabase.from("mensajes").delete().eq("parent_id", id);
    } catch {
      // Ignorar si la tabla no tiene parent_id
    }

    const { error } = await supabase.from("mensajes").delete().eq("id", id);
    logIngest("DELETE after supabase", { hasError: !!error, errorMessage: error?.message ?? null, errorCode: error?.code ?? null });
    if (error) {
      return NextResponse.json(
        { error: error.message || "Error al eliminar el mensaje" },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    logIngest("DELETE catch", { err: String(e) });
    return NextResponse.json(
      { error: "Error al eliminar el mensaje" },
      { status: 500 }
    );
  }
}
