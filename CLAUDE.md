# FinTrack

## Descripcion

App de finanzas personales con entrada de transacciones asistida por IA. Diseno inspirado en Nothing/cosmico. Incluye dashboard, transacciones, categorias, presupuestos, calendario y configuracion.

## Stack

- **Framework:** React 19 + Vite 8 (JSX, no TypeScript)
- **UI:** Tailwind CSS 4, Lucide, Recharts
- **Auth/DB:** Supabase
- **IA:** Google Generative AI (via OpenRouter segun .env.example)
- **Routing:** React Router DOM 7

## Estado actual

App funcional con paginas completas: Login, Dashboard, Transactions, Categories, Budget, Calendar, Settings. Componente de IA (`AIAssistant.jsx`).

## Que falta

1. **node_modules** - No instalados. Ejecutar `npm install`.
2. **Variables de entorno** - Crear `.env` basado en `.env.example`:
   ```
   VITE_SUPABASE_URL=tu_url
   VITE_SUPABASE_ANON_KEY=tu_key
   VITE_OPENROUTER_API_KEY=tu_key
   ```
3. **Base de datos** - Ejecutar `supabase-schema.sql` en Supabase SQL Editor. Crea tablas: categories, transactions, budgets con RLS habilitado.

## Pasos para ejecutar

```bash
cd /home/h19/repos/finance/fintrack
npm install
cp .env.example .env
# Editar .env con credenciales reales
# Ejecutar supabase-schema.sql en Supabase
npm run dev
```

## Problemas conocidos

- Usa JSX puro (sin TypeScript), sin tipos.
- El cliente Supabase en `src/lib/supabase.js` no valida que las env vars existan antes de crear el client (puede dar errores silenciosos).
