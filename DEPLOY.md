# Deploy Sakura to Vercel

This app lives in `sakura-web/`. Point Vercel **Root Directory** at that folder.

## Architecture on Vercel

| Piece | Service |
|--------|---------|
| Next.js app | Vercel |
| Postgres | Neon (or any Postgres; Neon integrates with Vercel) |
| Admin uploads | Cloudflare R2 (S3-compatible) |
| Static media in `public/media` | Bundled with the deployment |

SQLite is **not** used in production. Local and prod both use PostgreSQL.

---

## 1. Neon Postgres

1. Create a Neon project (or use the Vercel Neon integration).
2. Copy two connection strings:
   - **Pooled** → `DATABASE_URL` (add `?sslmode=require` if missing)
   - **Direct / non-pooled** → `DIRECT_URL` (used by `prisma migrate deploy`)
3. Example:

```env
DATABASE_URL="postgresql://USER:PASS@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASS@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

Migrations run automatically on every Vercel build via `npm run vercel-build`.

---

## 2. Vercel project settings

1. Import the Git repo in Vercel.
2. **Root Directory:** `sakura-web`
3. Framework: Next.js (auto)
4. Build command: `npm run vercel-build` (also set in `vercel.json`)
5. Install command: `npm install`
6. Output: leave default (`.next`)

---

## 3. Environment variables (Vercel → Settings → Environment Variables)

Set for **Production** (and Preview if you want previews to work):

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | yes | Neon pooled URL |
| `DIRECT_URL` | yes | Neon direct URL |
| `AUTH_SECRET` | yes | `openssl rand -base64 32` |
| `AUTH_URL` | yes | `https://your-domain.vercel.app` (or custom domain) |
| `NEXT_PUBLIC_SITE_URL` | yes | Same public origin as above |
| `ADMIN_EMAIL` | for seed | Admin login email |
| `ADMIN_PASSWORD` | for seed | Strong password; change after first login |
| `STORAGE_ADAPTER` | for uploads | `r2` |
| `R2_ACCOUNT_ID` | for uploads | Cloudflare account id |
| `R2_ACCESS_KEY_ID` | for uploads | R2 API token |
| `R2_SECRET_ACCESS_KEY` | for uploads | R2 API secret |
| `R2_BUCKET_NAME` | for uploads | Bucket name |
| `R2_PUBLIC_URL` | for uploads | Public base URL (custom domain or `*.r2.dev`) |
| `RESEND_API_KEY` | optional | Contact form email |
| `CONTACT_EMAIL` | optional | Inbox for contact form |

Without R2, the **public site still works** (static media + DB content). Admin **file uploads** will fail on Vercel until R2 is configured.

---

## 4. Cloudflare R2 (admin media uploads)

Vercel Functions reject request bodies over **4.5MB**. The admin media library therefore uploads **directly to R2** via a short-lived presigned URL (images and videos up to the app limits).

1. Cloudflare Dashboard → R2 → Create bucket.
2. Enable public access (custom domain or R2.dev public URL).
3. Create an API token with Object Read & Write on that bucket.
4. Set the env vars above. Example public URL: `https://pub-xxxxx.r2.dev` (no trailing slash).
5. Configure **CORS** on the bucket (Settings → CORS policy), e.g.:

```json
[
  {
    "AllowedOrigins": [
      "https://your-domain.vercel.app",
      "https://sakura.global",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

6. Redeploy.

Uploaded objects are stored under `uploads/<uuid>.<ext>` and the DB stores the full public URL.

---

## 5. First deploy + seed

1. Push the repo and deploy once (migrations create empty tables).
2. Seed portfolio + admin user **once** against production:

```bash
cd sakura-web
# Use Production DATABASE_URL / DIRECT_URL / ADMIN_* from Vercel
npx dotenv -e .env.production -- npx prisma db seed
```

Or temporarily:

```bash
set DATABASE_URL=...   # Windows PowerShell: $env:DATABASE_URL="..."
set DIRECT_URL=...
set ADMIN_EMAIL=admin@sakura.global
set ADMIN_PASSWORD=your-strong-password
npx prisma db seed
```

3. Open `/admin/login` and sign in with those credentials.
4. Change the admin password after first login (re-seed or update hash in DB).

Seed **wipes** projects/media/feed/admin and recreates demo content — do not re-run on a live CMS with real edits.

---

## 6. Custom domain

1. Vercel → Domains → add `sakura.global` (or your domain).
2. Update `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin.
3. Redeploy.

---

## Local development (Postgres)

**Option A — Docker** (if installed):

```bash
cd sakura-web
cp .env.example .env
docker compose up -d          # Postgres on localhost:5432
npm install
npm run db:setup              # migrate + seed
npm run dev
```

**Option B — Neon free DB** (no Docker): create a Neon project, put pooled/direct URLs into `.env`, then:

```bash
cd sakura-web
npm install
npm run db:setup
npm run dev
```

Default admin after seed: `admin@sakura.global` / `sakura-admin`.

---

## Checklist before go-live

- [ ] Root Directory = `sakura-web`
- [ ] Neon `DATABASE_URL` + `DIRECT_URL`
- [ ] `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL`
- [ ] First deploy succeeded (`prisma migrate deploy` in build logs)
- [ ] Production seed ran once
- [ ] `/` and `/portfolio` show projects
- [ ] `/admin/login` works
- [ ] R2 configured if you need media uploads
- [ ] Optional: Resend for contact emails
