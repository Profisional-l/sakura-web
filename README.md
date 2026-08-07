# Sakura Web

Next.js 15 rebuild of the Sakura Web Studio site with an admin CMS.

## Stack

- **Next.js 15** App Router with TypeScript
- **Tailwind CSS v4** with Sakura design tokens
- **Prisma** + SQLite for local development
- **NextAuth v5** credentials auth for admin
- **Framer Motion** page transitions and mask loader
- **@dnd-kit** drag-and-drop feed builder
- **Zod** form validations

## Getting Started

```bash
cd sakura-web
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Or from repo root:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.

If port 3000 is busy, Next.js will pick another port (check terminal output).

### Windows EPERM on `.next/trace`

If `npm run dev` fails with `EPERM ... .next\trace`:
1. Stop all Node processes (close other `npm run dev` / `npm run build` terminals).
2. Run `npm run dev` again — scripts auto-clean `.next` before start.

Admin panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Default credentials (from seed):
- Email: `admin@sakura.global`
- Password: `sakura-admin`

## Project Structure

```
sakura-web/
├── prisma/           # Schema + seed
├── public/
│   ├── fonts/        # SF UI Display
│   ├── media/        # Static media assets
│   └── uploads/      # Admin uploads (local storage)
└── src/
    ├── app/          # Pages (public + admin)
    ├── components/   # UI components
    ├── content/      # Static JSON (services, about)
    ├── lib/          # Auth, prisma, storage, validations
    └── actions/      # Server actions
```

## Admin Features

- **Dashboard** — overview stats
- **Projects** — CRUD with tabs (general, card, home, case study, SEO)
- **Feed Builder** — drag-reorder portfolio feed items per category
- **Media Library** — upload images/videos to local storage

## Storage

Local uploads go to `public/uploads/`. Set `STORAGE_ADAPTER=r2` in `.env` for Cloudflare R2 (stub in `src/lib/storage.ts`).

## Contact Form

Works without Resend — logs to console. Set `RESEND_API_KEY` and `CONTACT_EMAIL` for email delivery.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Push Prisma schema |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Prisma Studio GUI |
