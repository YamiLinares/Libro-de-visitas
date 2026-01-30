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
};

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

export default function Home() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarMensajes = async () => {
    try {
      const res = await fetch("/api/mensajes");
      if (res.ok) {
        const data = await res.json();
        setMensajes(Array.isArray(data) ? data : []);
      }
    } catch {
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
          ) : mensajes.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 py-12 text-center text-zinc-500 dark:text-zinc-400">
              No hay mensajes aún. ¡Sé el primero en escribir!
            </p>
          ) : (
            <ul className="space-y-4">
              {mensajes
                .slice()
                .reverse()
                .map((m) => (
                  <Card key={m.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <CardTitle className="text-base">{m.nombre}</CardTitle>
                        <CardDescription className="text-xs">
                          {formatFecha(m.fecha)}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-zinc-700 dark:text-zinc-300">
                        {m.mensaje}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
