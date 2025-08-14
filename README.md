# HiMetal - Órdenes internas (Next.js + Tailwind)

## Cómo correr local
1. `npm install`
2. `npm run dev`
3. Abrí http://localhost:3000/ordenes-internas

> Requiere Node 18+ (o 20+).

## Despliegue a Vercel
- Subí esto a GitHub y conectá el repo en Vercel (framework: Next.js).
- Variables no son necesarias.

## Integrar a tu app existente
- Si ya tenés un proyecto, copiá:
  - `components/OrdenesInternas.tsx`
  - `pages/ordenes-internas.tsx`
  - Asegurate de tener `pages/_app.tsx` importando `../styles/globals.css` y `components/Header` (o añadí el link al menú).
  - Si usás Tailwind, agregá `tailwind.config.js`, `postcss.config.js` y `styles/globals.css`.

