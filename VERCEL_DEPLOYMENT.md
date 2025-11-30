# Environment Variables untuk Vercel

Tambahkan environment variables berikut di Vercel Dashboard (Project Settings → Environment Variables):

## Required Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (generate dengan: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET="your-super-secret-jwt-key-here"

# NextAuth (optional jika pakai Google OAuth)
NEXTAUTH_URL="https://your-vercel-app.vercel.app"
NEXTAUTH_SECRET="your-nextauth-secret"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Database Setup

Untuk production, ganti SQLite dengan PostgreSQL atau MySQL:

### PostgreSQL (Recommended for Vercel)
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

### MySQL
```env
DATABASE_URL="mysql://user:password@host:3306/database"
```

Jangan lupa update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // atau "mysql"
  url      = env("DATABASE_URL")
}
```

## Build Commands

Vercel otomatis mendeteksi Next.js. Build command sudah include `prisma generate`:

```json
"build": "prisma generate && next build"
```

## Notes

- SQLite tidak disarankan untuk production di Vercel (read-only filesystem)
- Gunakan Vercel Postgres, Supabase, PlanetScale, atau Neon untuk database
- Run `prisma migrate deploy` setelah database production ready
