"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const GW = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8088";

type Lectura = { ts: string; metric: string; value: number; metadata?: any };

async function fetchLecturas(id: string): Promise<Lectura[]> {
  const url = `${GW}/sensores/${id}/ultimas-lecturas?metric=humedad&limit=50`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error("Error al cargar lecturas");
  return r.json();
}

export default function SensorDetallePage() {
  const params = useParams();
  const id = String(params?.id || "");
  const { data, isLoading, error } = useQuery({
    queryKey: ["lecturas", id],
    queryFn: () => fetchLecturas(id),
    enabled: !!id,
  });

  if (!id) return <p className="p-6">Sin id</p>;
  if (isLoading) return <p className="p-6">Cargando…</p>;
  if (error) return <p className="p-6 text-red-600">{String(error)}</p>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sensor #{id} - Últimas lecturas</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Fecha</th>
              <th className="py-2 pr-4">Métrica</th>
              <th className="py-2 pr-4">Valor</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((row, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2 pr-4">{new Date(row.ts).toLocaleString()}</td>
                <td className="py-2 pr-4">{row.metric}</td>
                <td className="py-2 pr-4">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
