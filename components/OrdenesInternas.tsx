'use client';
import React, { useEffect, useMemo, useState } from "react";

const uid = () => Math.random().toString(36).slice(2);

// ===== Tipos =====
interface Item {
  id: string;
  unidades: number | "";
  codInterno: string;
  descripcion: string;
  /** Precio base (neto, sin IVA) almacenado en estado */
  precio: number | "";
}
interface OrderData {
  numero: string;
  cliente: string;
  fechaPedido: string;
  fechaEntrega: string;
  items: Item[];
  notas: string;
}

// ===== Utilidades =====
const emptyItem = (): Item => ({
  id: uid(),
  unidades: "",
  codInterno: "",
  descripcion: "",
  precio: "",
});
const today = () => new Date().toISOString().slice(0, 10);

// IVA
type IvaMode = "sin" | "medio" | "con";
const IVA_RATES = { sin: 0, medio: 0.105, con: 0.21 } as const;
const getRate = (mode: IvaMode) => IVA_RATES[mode];
const ivaShort = (mode: IvaMode) =>
  mode === "sin" ? "sin IVA" : `c/IVA ${mode === "medio" ? "10,5%" : "21%"}`;
const ivaLong = (mode: IvaMode) =>
  mode === "sin" ? "Sin IVA" : `Con IVA ${mode === "medio" ? "10,5%" : "21%"}`;

// ===== Componente =====
export default function OrdenesInternas() {
  const [tab, setTab] = useState<"inicio"|"ordenes"|"planta">("inicio");
  const [ivaMode, setIvaMode] = useState<IvaMode>("sin");

  const [data, setData] = useState<OrderData>(() => ({
    numero: `OI-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${String(Math.floor(Math.random()*900+100))}`,
    cliente: "",
    fechaPedido: today(),
    fechaEntrega: today(),
    items: [emptyItem()],
    notas: "",
  }));

  // Persistencia local
  useEffect(() => {
    const saved = localStorage.getItem("ordenInternaDraft");
    if (saved) { try { setData(JSON.parse(saved)); } catch {} }
    const savedIva = localStorage.getItem("ordenInternaIvaMode");
    if (savedIva === "sin" || savedIva === "medio" || savedIva === "con") {
      setIvaMode(savedIva as IvaMode);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("ordenInternaDraft", JSON.stringify(data));
  }, [data]);
  useEffect(() => {
    localStorage.setItem("ordenInternaIvaMode", ivaMode);
  }, [ivaMode]);

  // Helpers IVA: guardamos NETO en estado; mostramos según modo
  const displayPrice = (netOrEmpty: number | "") =>
    netOrEmpty === "" ? "" : Number(netOrEmpty) * (1 + getRate(ivaMode));

  const parseInputToNet = (typed: string) => {
    if (typed === "") return "";
    const val = Number(typed);
    if (!isFinite(val)) return "";
    const rate = getRate(ivaMode);
    return rate > 0 ? Number((val / (1 + rate)).toFixed(4)) : val;
  };

  const netSubtotal = useMemo(() =>
    data.items.reduce((a, i) =>
      a + (Number(i.precio) || 0) * (Number(i.unidades) || 0), 0
    ), [data.items]);

  const subtotalMostrar = netSubtotal * (1 + getRate(ivaMode));

  // Acciones
  const addRow = () => setData(d => ({...d, items:[...d.items, emptyItem()]}));
  const removeRow = (id: string) => setData(d => ({...d, items: d.items.filter(i=>i.id!==id)}));
  const updateRow = (id: string, p: Partial<Item>) =>
    setData(d => ({...d, items: d.items.map(i => i.id===id? {...i, ...p}: i)}));
  const clearForm = () => {
    if (!confirm("¿Vaciar todos los campos?")) return;
    setData({
      numero:"", cliente:"",
      fechaPedido: today(),
      fechaEntrega: today(),
      items:[emptyItem()],
      notas:""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-white text-neutral-900">
      {/* Barra superior */}
      <header className="no-print sticky top-0 z-30 bg-gradient-to-r from-blue-900 via-blue-700 to-sky-600 shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-white/10 ring-1 ring-white/20" />
            <h1 className="text-white/90 text-lg font-semibold tracking-wide">HIMETAL S.A.</h1>
          </div>
          <nav className="flex items-center gap-1 rounded-2xl bg-white/10 p-1 ring-1 ring-white/20 backdrop-blur">
            {[
              { id: "inicio", label: "Inicio" },
              { id: "ordenes", label: "Órdenes Internas" },
              { id: "planta",  label: "Planta" },
            ].map(t => (
              <button key={t.id}
                onClick={()=>setTab(t.id as any)}
                className={"px-4 py-2 text-sm font-medium rounded-xl transition-all " + (tab===t.id ? "bg-white text-blue-800 shadow" : "text-white/85 hover:text-white")}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          {/* INICIO */}
          {tab==="inicio" && (
            <section className="text-center">
              <div className="flex flex-col items-center justify-center py-10">
                <img src="/logo-himetal.png" alt="HIMETAL S.A." className="max-h-40 w-auto drop-shadow-md" />
                <p className="mt-6 max-w-prose text-center text-neutral-600">
                  Bienvenido a la aplicación de Órdenes Internas y Gestión de Planta.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <a onClick={()=>setTab("ordenes")}
                   className="cursor-pointer rounded-2xl border border-blue-100 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm transition-transform hover:scale-[1.01] hover:shadow">
                  <h3 className="text-lg font-semibold text-blue-900">Ir a Órdenes Internas</h3>
                  <p className="mt-1 text-sm text-neutral-600">Cargá, imprimí y gestioná tus OIs.</p>
                </a>
                <a onClick={()=>setTab("planta")}
                   className="cursor-pointer rounded-2xl border border-blue-100 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm transition-transform hover:scale-[1.01] hover:shadow">
                  <h3 className="text-lg font-semibold text-blue-900">Ir a Planta</h3>
                  <p className="mt-1 text-sm text-neutral-600">Seguimiento y visual de trabajos en planta.</p>
                </a>
              </div>
            </section>
          )}

          {/* ÓRDENES (título verde) */}
          {tab==="ordenes" && (
            <section>
              {/* Todo el editor NO se imprime */}
              <div className="no-print">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold tracking-tight text-green-600">Órdenes internas de trabajo</h2>
                  <div className="flex gap-2">
                    <button onClick={addRow} className="px-3 py-2 rounded-xl border border-blue-200 text-blue-800 hover:bg-blue-50">+ Ítem</button>
                    <button onClick={clearForm} className="px-3 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50">Vaciar</button>
                    <button onClick={()=>window.print()} className="px-3 py-2 rounded-xl bg-blue-900 text-white hover:bg-blue-800">Imprimir / PDF</button>
                  </div>
                </div>

                {/* Cabecera de datos: ahora con Cliente */}
                <div className="grid md:grid-cols-4 gap-4 mb-4 mt-4">
                  <Field label="N° de pedido">
                    <input className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                      value={data.numero} onChange={e=>setData(d=>({...d, numero:e.target.value}))}/>
                  </Field>
                  <Field label="Cliente">
                    <input className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                      value={data.cliente} onChange={e=>setData(d=>({...d, cliente:e.target.value}))}
                      placeholder="Nombre del cliente" />
                  </Field>
                  <Field label="Fecha de pedido">
                    <input type="date" className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                      value={data.fechaPedido} onChange={e=>setData(d=>({...d, fechaPedido:e.target.value}))}/>
                  </Field>
                  <Field label="Fecha de entrega">
                    <input type="date" className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                      value={data.fechaEntrega} onChange={e=>setData(d=>({...d, fechaEntrega:e.target.value}))}/>
                  </Field>
                </div>

                {/* Toggle IVA (Sin / 10,5% / 21%) */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-neutral-600">
                    Modo precios: <strong>{ivaLong(ivaMode)}</strong>
                  </div>
                  <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-50 p-1">
                    <button
                      onClick={()=>setIvaMode("sin")}
                      className={"px-3 py-1.5 rounded-lg text-sm " + (ivaMode==="sin" ? "bg-white shadow ring-1 ring-neutral-300" : "hover:bg-white/60")}
                    >Sin IVA</button>
                    <button
                      onClick={()=>setIvaMode("medio")}
                      className={"px-3 py-1.5 rounded-lg text-sm " + (ivaMode==="medio" ? "bg-white shadow ring-1 ring-neutral-300" : "hover:bg-white/60")}
                    >10,5%</button>
                    <button
                      onClick={()=>setIvaMode("con")}
                      className={"px-3 py-1.5 rounded-lg text-sm " + (ivaMode==="con" ? "bg-white shadow ring-1 ring-neutral-300" : "hover:bg-white/60")}
                    >21%</button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-neutral-200 rounded-xl overflow-hidden">
                    <thead className="bg-neutral-100 text-neutral-700">
                      <tr>
                        <th className="p-2 w-24 text-left">Unidades</th>
                        <th className="p-2 w-40 text-left">Código interno</th>
                        <th className="p-2 text-left">Descripción</th>
                        <th className="p-2 w-40 text-left">
                          Precio (u) {ivaMode === "sin" ? "(sin IVA)" : `(con IVA ${ivaMode==="medio" ? "10,5%" : "21%"})`}
                        </th>
                        <th className="p-2 w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map(it=>(
                        <tr key={it.id} className="border-t border-neutral-200">
                          <td className="p-2">
                            <input
                              type="number" min={0}
                              className="w-24 rounded-lg border border-neutral-300 px-2 py-1"
                              value={it.unidades}
                              onChange={(e)=>updateRow(it.id,{unidades: e.target.value===""? "": Number(e.target.value)})}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              className="w-40 rounded-lg border border-neutral-300 px-2 py-1"
                              value={it.codInterno}
                              onChange={(e)=>updateRow(it.id,{codInterno: e.target.value})}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              className="w-full rounded-lg border border-neutral-300 px-2 py-1"
                              value={it.descripcion}
                              onChange={(e)=>updateRow(it.id,{descripcion: e.target.value})}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number" min={0} step={0.01}
                              className="w-40 rounded-lg border border-neutral-300 px-2 py-1"
                              value={displayPrice(it.precio) as number | ""}
                              onChange={(e)=>updateRow(it.id,{precio: parseInputToNet(e.target.value)})}
                              placeholder={ivaMode==="sin" ? "precio sin IVA" : `precio con IVA ${ivaMode==="medio" ? "10,5%" : "21%"}`}
                            />
                          </td>
                          <td className="p-2 text-right">
                            <button onClick={()=>removeRow(it.id)} className="px-2 py-1 rounded-lg border border-neutral-300 hover:bg-neutral-100">×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <Field label="Notas internas">
                    <textarea
                      className="w-full min-h-[90px] rounded-xl border border-neutral-300 px-3 py-2"
                      value={data.notas}
                      onChange={(e)=>setData(d=>({...d, notas: e.target.value}))}
                      placeholder="Detalles técnicos, tolerancias, material, etc."
                    />
                  </Field>
                  <div className="flex items-end justify-end">
                    <div className="text-right bg-white border border-neutral-200 rounded-xl p-4 min-w-[260px]">
                      <div className="text-sm text-neutral-600">
                        Subtotal {ivaMode==="sin" ? "(sin IVA)" : `(con IVA ${ivaMode==="medio" ? "10,5%" : "21%"})`}
                      </div>
                      <div className="text-2xl font-semibold tracking-tight">
                        ${" "}
                        {subtotalMostrar.toLocaleString("es-AR",{
                          minimumFractionDigits: 2, maximumFractionDigits: 2
                        })}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {ivaLong(ivaMode)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ Sólo esto se imprime */}
              <section className="mt-8 space-y-6">
                <WorkOrderPrint
                  titulo="COPIA INTERNA"
                  data={data}
                  ivaMode={ivaMode}
                  subtotalNet={netSubtotal}
                  showPrices
                  badgeClass="bg-green-50 text-green-700 ring-1 ring-green-200"
                />
                <div className="page-break" />
                <WorkOrderPrint
                  titulo="COPIA PLANTA"
                  data={data}
                  ivaMode={ivaMode}
                  subtotalNet={netSubtotal}
                  showPrices={false}
                  badgeClass="bg-red-50 text-red-700 ring-1 ring-red-200"
                />
              </section>
            </section>
          )}

          {/* PLANTA */}
          {tab==="planta" && (
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-red-600">Planta</h2>
              <p className="mt-1 text-sm text-neutral-600">(Integrar tablero real aquí)</p>
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/40 p-4">
                Vista de <strong>Planta</strong> — pendiente.
              </div>
            </section>
          )}
        </div>

        <footer className="no-print mt-6 flex items-center justify-between text-xs text-neutral-500">
          <span>© {new Date().getFullYear()} HIMETAL S.A.</span>
          <span>Tema azules/celestes — títulos: verde (OIs) / rojo (Planta)</span>
        </footer>
      </main>
    </div>
  );
}

// ===== Subcomponentes =====
function Field({label, children}:{label:string; children:React.ReactNode}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-neutral-600">{label}</label>
      {children}
    </div>
  );
}

function WorkOrderPrint({
  titulo, data, ivaMode, subtotalNet, showPrices, badgeClass,
}: {
  titulo: string;
  data: OrderData;
  ivaMode: IvaMode;
  subtotalNet: number;
  showPrices: boolean;
  badgeClass: string;
}) {
  const rate = getRate(ivaMode);
  const unit = (netOrEmpty: number | "") =>
    netOrEmpty === "" ? "" : Number(netOrEmpty) * (1 + rate);
  const subtotalMostrar = subtotalNet * (1 + rate);

  return (
    <div className="print-card bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Orden interna de trabajo</h2>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs mt-1 ${badgeClass}`}>{titulo}</div>
          <div className="text-xs text-neutral-500 mt-1">{ivaLong(ivaMode)}</div>
        </div>
        <div className="text-sm">
          <Row k="N°:" v={data.numero || "—"} />
          <Row k="Cliente:" v={data.cliente || "—"} />
          <Row k="Fecha pedido:" v={fmtDate(data.fechaPedido)} />
          <Row k="Fecha entrega:" v={fmtDate(data.fechaEntrega)} />
        </div>
      </header>

      <table className="w-full mt-4 text-sm">
        <thead>
          <tr className="border-b border-neutral-300 text-neutral-700">
            <th className="py-2 text-left w-24">Unidades</th>
            <th className="py-2 text-left w-40">Código interno</th>
            <th className="py-2 text-left">Descripción</th>
            {showPrices && (
              <th className="py-2 text-left w-32">
                Precio (u) {ivaMode==="sin" ? "(s/IVA)" : `(c/IVA ${ivaMode==="medio" ? "10,5%" : "21%"})`}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.items.map(it=>(
            <tr key={it.id} className="border-b border-neutral-200">
              <td className="py-2 align-top">{it.unidades || ""}</td>
              <td className="py-2 align-top">{it.codInterno}</td>
              <td className="py-2 align-top">{it.descripcion}</td>
              {showPrices && (
                <td className="py-2 align-top">
                  {unit(it.precio) !== "" ? Number(unit(it.precio)).toLocaleString("es-AR",{minimumFractionDigits:2, maximumFractionDigits:2}) : ""}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-6 mt-4">
        <div>
          <div className="text-sm text-neutral-600 mb-1">Notas</div>
          <div className="min-h-[80px] p-3 border border-neutral-200 rounded-xl whitespace-pre-wrap">{data.notas}</div>
        </div>
        <div className="flex items-end justify-end">
          {showPrices ? (
            <div className="text-right border border-neutral-200 rounded-xl p-3 min-w-[220px]">
              <div className="text-sm text-neutral-600">
                Subtotal {ivaMode==="sin" ? "(s/IVA)" : `(c/IVA ${ivaMode==="medio" ? "10,5%" : "21%"})`}
              </div>
              <div className="text-xl font-semibold">
                ${" "}{subtotalMostrar.toLocaleString("es-AR",{minimumFractionDigits:2, maximumFractionDigits:2})}
              </div>
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

function Row({k, v}:{k:string; v:string}) {
  return <div className="flex gap-3"><span className="text-neutral-600">{k}</span><span className="font-medium">{v}</span></div>;
}
function Firma({ label }: { label: string }) {
  return <div className="h-20 border-t border-neutral-300 pt-2 text-sm text-neutral-700">{label}</div>;
}
function fmtDate(yyyyMmDd: string) {
  if (!yyyyMmDd) return "—";
  const [y,m,d] = yyyyMmDd.split("-");
  try {
    return new Date(Number(y), Number(m)-1, Number(d)).toLocaleDateString("es-AR",{year:"numeric",month:"2-digit",day:"2-digit"});
  } catch { return yyyyMmDd; }
}
