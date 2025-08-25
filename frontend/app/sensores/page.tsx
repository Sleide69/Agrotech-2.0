"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

const GW = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8088";

type Sensor = { id: number; nombre?: string; tipo?: string };

async function fetchSensores(): Promise<Sensor[]> {
  const r = await fetch(`${GW}/sensores`, { cache: "no-store" });
  if (!r.ok) throw new Error("Error al cargar sensores");
  return r.json();
}

export default function SensoresPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["sensores"],
    queryFn: fetchSensores,
  });

  if (isLoading) return <p className="p-6">Cargando…</p>;
  if (error) return <p className="p-6 text-red-600">{String(error)}</p>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sensores</h1>
      <ul className="divide-y divide-gray-200">
        {(data || []).map((s) => (
          <li key={s.id} className="py-3">
            <Link className="text-blue-600 hover:underline" href={`/sensores/${s.id}`}>Sensor #{s.id} {s.nombre ? `- ${s.nombre}` : ""}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
