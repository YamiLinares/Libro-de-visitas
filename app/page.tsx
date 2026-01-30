"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Mensaje = {
  id: string;
  nombre: string;
  mensaje: string;
  fecha: string;
  parent_id?: string | null;
};

type MensajeConRespuestas = Mensaje & { respuestas: MensajeConRespuestas[] };

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function armarArbol(mensajes: Mensaje[]): MensajeConRespuestas[] {
  const map = new Map<string, MensajeConRespuestas>();
  mensajes.forEach((m) => map.set(m.id, { ...m, respuestas: [] }));
  const raices: MensajeConRespuestas[] = [];
  mensajes.forEach((m) => {
    const nodo = map.get(m.id)!;
    if (!m.parent_id) {
      raices.push(nodo);
    } else {
      const padre = map.get(m.parent_id);
      if (padre) padre.respuestas.push(nodo);
      else raices.push(nodo);
    }
  });
  raices.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  raices.forEach((r) => r.respuestas.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()));
  return raices;
}

type AccionMensaje = "editar" | "responder" | null;

function TarjetaMensaje({
  m,
  nivel = 0,
  onRecargar,
  nombreDefault,
}: {
  m: MensajeConRespuestas;
  nivel?: number;
  onRecargar: () => void;
  nombreDefault: string;
}) {
  const [accion, setAccion] = useState<AccionMensaje>(null);
  const [editNombre, setEditNombre] = useState(m.nombre);
  const [editMensaje, setEditMensaje] = useState(m.mensaje);
  const [replyNombre, setReplyNombre] = useState(nombreDefault);
  const [replyMensaje, setReplyMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRespuesta = nivel > 0;

  const handleGuardarEdicion = async () => {
    if (!editNombre.trim() || !editMensaje.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`/api/mensajes/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: editNombre.trim(), mensaje: editMensaje.trim() }),
      });
      if (res.ok) {
        setAccion(null);
        onRecargar();
      } else {
        const data = await res.json();
        setError(data.error || "Error al guardar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setEnviando(false);
    }
  };

  const handleEnviarRespuesta = async () => {
    if (!replyNombre.trim() || !replyMensaje.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: replyNombre.trim(),
          mensaje: replyMensaje.trim(),
          parent_id: m.id,
        }),
      });
      if (res.ok) {
        setReplyMensaje("");
        setAccion(null);
        onRecargar();
      } else {
        const data = await res.json();
        setError(data.error || "Error al enviar respuesta");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirm("¿Eliminar este mensaje?")) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`/api/mensajes/${m.id}`, { method: "DELETE" });
      if (res.ok) {
        onRecargar();
      } else {
        const data = await res.json();
        setError(data.error || "Error al eliminar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Card className={esRespuesta ? "ml-6 border-l-4 border-l-zinc-300 dark:border-l-zinc-600" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <CardTitle className="text-base">{m.nombre}</CardTitle>
          <CardDescription className="text-xs">{formatFecha(m.fecha)}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {accion === "editar" ? (
          <div className="space-y-2">
            <Input
              placeholder="Nombre"
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
              disabled={enviando}
            />
            <Input
              placeholder="Mensaje"
              value={editMensaje}
              onChange={(e) => setEditMensaje(e.target.value)}
              disabled={enviando}
            />
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleGuardarEdicion} disabled={enviando}>
                {enviando ? "Guardando..." : "Guardar"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setAccion(null); setError(null); }}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-zinc-700 dark:text-zinc-300">{m.mensaje}</p>
        )}

        {accion !== "editar" && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-1">Acciones:</span>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => setAccion("editar")}
              disabled={enviando}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => setAccion(accion === "responder" ? null : "responder")}
              disabled={enviando}
            >
              Responder
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50"
              onClick={handleEliminar}
              disabled={enviando}
            >
              Eliminar
            </Button>
          </div>
        )}

        {accion === "responder" && (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 space-y-2">
            <Label className="text-xs">Responder a {m.nombre}</Label>
            <Input
              placeholder="Tu nombre"
              value={replyNombre}
              onChange={(e) => setReplyNombre(e.target.value)}
              disabled={enviando}
            />
            <Input
              placeholder="Tu respuesta..."
              value={replyMensaje}
              onChange={(e) => setReplyMensaje(e.target.value)}
              disabled={enviando}
            />
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEnviarRespuesta} disabled={enviando || !replyMensaje.trim()}>
                {enviando ? "Enviando..." : "Enviar respuesta"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setAccion(null); setError(null); setReplyMensaje(""); }}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {m.respuestas.length > 0 && (
          <ul className="space-y-3 mt-3">
            {m.respuestas.map((r) => (
              <li key={r.id}>
                <TarjetaMensaje
                  m={r}
                  nivel={nivel + 1}
                  onRecargar={onRecargar}
                  nombreDefault={nombreDefault}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [arbol, setArbol] = useState<MensajeConRespuestas[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarMensajes = async () => {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/9917d2e5-4158-4a1f-9549-b4380ba2dc19",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({location:"page.tsx:cargarMensajes",message:"cargarMensajes entry",data:{},timestamp:Date.now(),sessionId:"debug-session",hypothesisId:"H1"})}).catch(()=>{});
    // #endregion
    try {
      const res = await fetch("/api/mensajes");
      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/9917d2e5-4158-4a1f-9549-b4380ba2dc19",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({location:"page.tsx:after fetch",message:"GET /api/mensajes response",data:{status:res.status,ok:res.ok},timestamp:Date.now(),sessionId:"debug-session",hypothesisId:"H2"})}).catch(()=>{});
      // #endregion
      if (res.ok) {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : [];
        const arbolResult = armarArbol(lista);
        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/9917d2e5-4158-4a1f-9549-b4380ba2dc19",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({location:"page.tsx:before setArbol",message:"parsed data",data:{isArray:Array.isArray(data),listaLength:lista.length,arbolRootsLength:arbolResult.length},timestamp:Date.now(),sessionId:"debug-session",hypothesisId:"H4,H5"})}).catch(()=>{});
        // #endregion
        setArbol(arbolResult);
      } else {
        // #region agent log
        const errBody = await res.text();
        fetch("http://127.0.0.1:7242/ingest/9917d2e5-4158-4a1f-9549-b4380ba2dc19",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({location:"page.tsx:res not ok",message:"API error response",data:{status:res.status,body:errBody?.slice(0,200)},timestamp:Date.now(),sessionId:"debug-session",hypothesisId:"H2"})}).catch(()=>{});
        // #endregion
      }
    } catch (e) {
      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/9917d2e5-4158-4a1f-9549-b4380ba2dc19",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({location:"page.tsx:cargarMensajes catch",message:"fetch threw",data:{err:String(e)},timestamp:Date.now(),sessionId:"debug-session",hypothesisId:"H1"})}).catch(()=>{});
      // #endregion
      setError("No se pudieron cargar los mensajes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMensajes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !mensaje.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), mensaje: mensaje.trim() }),
      });
      if (res.ok) {
        setNombre("");
        setMensaje("");
        await cargarMensajes();
      } else {
        const data = await res.json();
        setError(data.error || "Error al enviar el mensaje");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Libro de visitas
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Deja tu mensaje para los visitantes
          </p>
        </div>

        <Card className="mb-10">
          <CardHeader>
            <CardTitle>Nuevo mensaje</CardTitle>
            <CardDescription>
              Escribe tu nombre y un mensaje para el libro de visitas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={enviando}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mensaje">Mensaje</Label>
                <Input
                  id="mensaje"
                  placeholder="Tu mensaje..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  disabled={enviando}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              <Button type="submit" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar mensaje"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Mensajes
          </h2>
          {loading ? (
            <p className="text-zinc-500 dark:text-zinc-400">
              Cargando mensajes...
            </p>
          ) : arbol.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 py-12 text-center text-zinc-500 dark:text-zinc-400">
              No hay mensajes aún. ¡Sé el primero en escribir!
            </p>
          ) : (
            <ul className="space-y-4">
              {arbol.map((m) => (
                <li key={m.id}>
                  <TarjetaMensaje
                    m={m}
                    onRecargar={cargarMensajes}
                    nombreDefault={nombre}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
