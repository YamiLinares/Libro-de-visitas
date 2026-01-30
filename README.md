This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Libro de visitas y Supabase

Los mensajes se guardan en Supabase (tabla `mensajes`). En `.env.local` necesitas:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (para leer mensajes).
- **`SUPABASE_SERVICE_ROLE_KEY`** (clave "service_role" en Supabase → Settings → API): sin ella, **editar y eliminar** fallan por políticas RLS. Añádela solo en el servidor (nunca la expongas en el cliente).  
  **Alternativa:** ejecuta en Supabase (SQL Editor) el archivo `supabase/politicas-mensajes.sql` para permitir edición y eliminación con la clave anon.

Para habilitar **respuestas** a mensajes, añade en la tabla `mensajes` una columna opcional:

- **Nombre:** `parent_id`
- **Tipo:** `uuid` (nullable)
- **Referencia:** opcional, a `mensajes(id)` para respuestas anidadas

Si no añades `parent_id`, la app seguirá funcionando; solo no se podrán guardar respuestas (editar y eliminar sí funcionan).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
