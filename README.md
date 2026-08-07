# Sakura Web

Next.js 15 rebuild of the Sakura Web Studio site with an admin CMS.

**Production deploy:** see [DEPLOY.md](./DEPLOY.md) (Vercel + Neon + R2).

## Stack

- **Next.js 15** App Router with TypeScript
- **Tailwind CSS v4** with Sakura design tokens
- **Prisma** + **PostgreSQL** (Neon in production, Docker locally)
- **NextAuth v5** credentials auth for admin
- **Framer Motion** page transitions and mask loader
- **Cloudflare R2** for admin uploads on Vercel
- **@dnd-kit** drag-and-drop feed builder
- **Zod** form validations

## Getting Started

```bash
cd sakura-web
cp .env.example .env
```

Start Postgres (Docker **or** a free Neon database — put URLs into `.env`), then:

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).  
Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login) — seed: `admin@sakura.global` / `sakura-admin`

See [DEPLOY.md](./DEPLOY.md) for Neon connection strings and Vercel setup.

### Windows EPERM on `.next/trace`

Stop other Node processes, then `npm run dev` again (scripts clean `.next` on start).

## Project Structure

```
sakura-web/
├── prisma/           # Schema + migrations + seed
├── public/media/     # Static media (ships with deploy)
├── public/uploads/   # Local uploads only (dev)
├── vercel.json       # Vercel build command
├── DEPLOY.md         # Production checklist
└── src/
```

## Storage

| Environment | Adapter | Notes |
|-------------|---------|--------|
| Local | `local` | Files under `public/uploads/` |
| Vercel | `r2` | Required for admin uploads (ephemeral FS) |

Set `STORAGE_ADAPTER=r2` and R2 env vars — see DEPLOY.md.

## Contact Form

Works without Resend (logs to console). Set `RESEND_API_KEY` + `CONTACT_EMAIL` for delivery.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Local production build |
| `npm run vercel-build` | Vercel: generate + migrate + build |
| `npm run db:up` | Start local Postgres (Docker) |
| `npm run db:setup` | Migrate + seed |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Prisma Studio |
