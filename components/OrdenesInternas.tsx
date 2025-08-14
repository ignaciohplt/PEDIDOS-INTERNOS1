import React, { useEffect, useMemo, useState } from "react";

// ————————————————
// Órdenes Internas de Trabajo
// - Doble copia: "INTERNAS" y "PLANTA" (la de planta oculta precios)
// - Campos pedidos: unidades, código interno, descripción, precio
// - También: N° de pedido, fecha de pedido, fecha de entrega
// - Imprimir / Guardar en PDF con window.print()
// ————————————————

// Si tu proyecto usa Next.js 13/14 con app router, exportá este componente en una ruta
// (por ejemplo: app/ordenes-internas/page.tsx) y hacé `export default Page`.
// Si usás pages router, guardalo como pages/ordenes-internas.tsx.

// Utilidad simple para generar IDs
const uid = () => Math.random().toString(36).slice(2);

interface Item {
  id: string;
  unidades: number | "";
  codInterno: string;
  descripcion: string;
  precio: number | ""; // sólo visible en copia interna
}

interface OrderData {
  numero: string;
  fechaPedido: string; // yyyy-mm-dd
  fechaEntrega: string; // yyyy-mm-dd
  items: Item[];
  notas: string;
}

const emptyItem = (): Item => ({
  id: uid(),
  unidades: "",
  codInterno: "",
  descripcion: "",
  precio: "",
});

const today = () => new Date().toISOString().slice(0, 10);

export default function OrdenesInternasPage() {
  const [data, setData] = useState<OrderData>(() => ({
    numero: `OI-${new Date().toISOString().slice(0,10).replace(/-/g, "")}-${String(
      Math.floor(Math.random() * 900 + 100)
    )}`,
    fechaPedido: today(),
    fechaEntrega: today(),
    items: [emptyItem()],
    notas: "",
  }));

  // Persistencia local simple
  useEffect(() => {
    const saved = localStorage.getItem("ordenInternaDraft");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("ordenInternaDraft", JSON.stringify(data));
  }, [data]);

  const subtotal = useMemo(() => {
    return data.items.reduce((acc, it) => acc + (Number(it.precio) || 0) * (Number(it.unidades) || 0), 0);
  }, [data.items]);

  const addRow = () => setData(d => ({ ...d, items: [...d.items, emptyItem()] }));
  const removeRow = (id: string) => setData(d => ({ ...d, items: d.items.filter(i => i.id !== id) }));
  const updateRow = (id: string, patch: Partial<Item>) =>
    setData(d => ({ ...d, items: d.items.map(i => (i.id === id ? { ...i, ...patch } : i)) }));

  const clearForm = () => {
    if (!confirm("¿Vaciar todos los campos?")) return;
    setData({ numero: "", fechaPedido: today(), fechaEntrega: today(), items: [emptyItem()], notas: "" });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Estilos de impresión para A4, márgenes y duplicación ordenada */}
      <style jsx global>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .print-card { box-shadow: none !important; background: white !important; }
        }
      `}</style>

      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Órdenes internas de trabajo</h1>
          <div className="flex gap-2 no-print">
            <button onClick={addRow} className="px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100">
              + Ítem
            </button>
            <button onClick={clearForm} className="px-3 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50">
              Vaciar
            </button>
            <button onClick={handlePrint} className="px-3 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
              Imprimir / Guardar PDF
            </button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-6xl mx-auto px-4 py-6 print:hidden">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1">
            <label className="text-sm text-neutral-600">N° de pedido</label>
            <input
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              value={data.numero}
              onChange={(e) => setData(d => ({ ...d, numero: e.target.value }))}
              placeholder="OI-YYYYMMDD-###"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-neutral-600">Fecha de pedido</label>
            <input
              type="date"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              value={data.fechaPedido}
              onChange={(e) => setData(d => ({ ...d, fechaPedido: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-neutral-600">Fecha de entrega</label>
            <input
              type="date"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              value={data.fechaEntrega}
              onChange={(e) => setData(d => ({ ...d, fechaEntrega: e.target.value }))}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-neutral-200 rounded-xl overflow-hidden">
            <thead className="bg-neutral-100 text-neutral-700">
              <tr>
                <th className="p-2 w-24 text-left">Unidades</th>
                <th className="p-2 w-40 text-left">Código interno</th>
                <th className="p-2 text-left">Descripción</th>
                <th className="p-2 w-32 text-left">Precio (u)</th>
                <th className="p-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it) => (
                <tr key={it.id} className="border-t border-neutral-200">
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      className="w-24 rounded-lg border border-neutral-300 px-2 py-1"
                      value={it.unidades}
                      onChange={(e) => updateRow(it.id, { unidades: e.target.value === "" ? "" : Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      className="w-40 rounded-lg border border-neutral-300 px-2 py-1"
                      value={it.codInterno}
                      onChange={(e) => updateRow(it.id, { codInterno: e.target.value })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      className="w-full rounded-lg border border-neutral-300 px-2 py-1"
                      value={it.descripcion}
                      onChange={(e) => updateRow(it.id, { descripcion: e.target.value })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className="w-32 rounded-lg border border-neutral-300 px-2 py-1"
                      value={it.precio}
                      onChange={(e) => updateRow(it.id, { precio: e.target.value === "" ? "" : Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => removeRow(it.id)}
                      className="px-2 py-1 rounded-lg border border-neutral-300 hover:bg-neutral-100"
                      title="Eliminar fila"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-neutral-600">Notas internas</label>
            <textarea
              className="w-full min-h-[90px] rounded-xl border border-neutral-300 px-3 py-2"
              value={data.notas}
              onChange={(e) => setData(d => ({ ...d, notas: e.target.value }))}
              placeholder="Detalles técnicos, tolerancias, material, etc."
            />
          </div>
          <div className="flex items-end justify-end">
            <div className="text-right bg-white border border-neutral-200 rounded-xl p-4 min-w-[260px]">
              <div className="text-sm text-neutral-600">Subtotal</div>
              <div className="text-2xl font-semibold tracking-tight">${" "}{subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-xs text-neutral-400 mt-1">(Sólo se imprime en la copia interna)</div>
            </div>
          </div>
        </div>
      </main>

      {/* Documento imprimible: dos copias */}
      <section className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <WorkOrderPrint
          titulo="COPIA INTERNA"
          data={data}
          showPrices
          subtotal={subtotal}
        />
        <div className="page-break" />
        <WorkOrderPrint
          titulo="COPIA PLANTA"
          data={data}
          showPrices={false}
          subtotal={subtotal}
        />
      </section>
    </div>
  );
}

function WorkOrderPrint({
  titulo,
  data,
  showPrices,
  subtotal,
}: {
  titulo: string;
  data: OrderData;
  showPrices: boolean;
  subtotal: number;
}) {
  return (
    <div className="print-card bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Orden interna de trabajo</h2>
          <div className="text-xs text-neutral-500">{titulo}</div>
        </div>
        <div className="text-sm">
          <div className="flex gap-3"><span className="text-neutral-600">N°:</span><span className="font-medium">{data.numero || "—"}</span></div>
          <div className="flex gap-3"><span className="text-neutral-600">Fecha pedido:</span><span className="font-medium">{fmtDate(data.fechaPedido)}</span></div>
          <div className="flex gap-3"><span className="text-neutral-600">Fecha entrega:</span><span className="font-medium">{fmtDate(data.fechaEntrega)}</span></div>
        </div>
      </header>

      <table className="w-full mt-4 text-sm">
        <thead>
          <tr className="border-b border-neutral-300 text-neutral-700">
            <th className="py-2 text-left w-24">Unidades</th>
            <th className="py-2 text-left w-40">Código interno</th>
            <th className="py-2 text-left">Descripción</th>
            {showPrices && <th className="py-2 text-left w-32">Precio (u)</th>}
          </tr>
        </thead>
        <tbody>
          {data.items.map((it) => (
            <tr key={it.id} className="border-b border-neutral-200">
              <td className="py-2 align-top">{it.unidades || ""}</td>
              <td className="py-2 align-top">{it.codInterno}</td>
              <td className="py-2 align-top">{it.descripcion}</td>
              {showPrices && (
                <td className="py-2 align-top">
                  {it.precio !== "" ? Number(it.precio).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-6 mt-4">
        <div>
          <div className="text-sm text-neutral-600 mb-1">Notas</div>
          <div className="min-h-[80px] p-3 border border-neutral-200 rounded-xl whitespace-pre-wrap">
            {data.notas}
          </div>
        </div>
        <div className="flex items-end justify-end">
          {showPrices ? (
            <div className="text-right border border-neutral-200 rounded-xl p-3 min-w-[220px]">
              <div className="text-sm text-neutral-600">Subtotal</div>
              <div className="text-xl font-semibold">${" "}{subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          ) : (
            <div className="text-xs text-neutral-500">(Copia planta: sin precios)</div>
          )}
        </div>
      </div>

      <footer className="mt-8 grid grid-cols-3 gap-6">
        <Firma label="Preparó" />
        <Firma label="Aprobó" />
        <Firma label="Recibió (Planta)" />
      </footer>
    </div>
  );
}

function Firma({ label }: { label: string }) {
  return (
    <div className="h-20 border-t border-neutral-300 pt-2 text-sm text-neutral-700">
      {label}
    </div>
  );
}

function fmtDate(yyyyMmDd: string) {
  if (!yyyyMmDd) return "—";
  const [y, m, d] = yyyyMmDd.split("-");
  try {
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return yyyyMmDd;
  }
}
