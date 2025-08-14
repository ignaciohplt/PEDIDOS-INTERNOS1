import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex gap-4">
        <Link href="/">Inicio</Link>
        <Link href="/ordenes-internas">Órdenes internas</Link>
      </nav>
    </header>
  );
}
