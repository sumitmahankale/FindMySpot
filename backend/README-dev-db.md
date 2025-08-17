# Development DB Setup

You can run locally in two modes:

## 1. SQLite (Zero Config)
Already configured via `.env.development`:
```
DB_DIALECT=sqlite
DB_STORAGE=database.sqlite
```
Migrations will create the file automatically.

## 2. MySQL / Railway
Set either discrete vars or a single URL:
```
DB_DIALECT=mysql
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
# or
MYSQL_URL=mysql://user:pass@host:port/dbname
```
If using SSL set `DB_SSL=true`.

### Railway Automatic Variables
Railway typically injects:
```
MYSQLHOST
MYSQLUSER
MYSQLPASSWORD
MYSQLDATABASE
MYSQLPORT
```
The config now auto-detects these if standard `DB_` vars are absent, so no manual mapping needed.

### Real-Time Checks
- Basic: `GET /api/health/db`
- Extended (dev only): `GET /api/health/db/extended` returns latency and a ping query result.
Add uptime / metrics collection by scraping the extended endpoint in a dev or staging environment (never expose externally in production).

## Health Check Behavior
In development, if DB auth fails `/api/health/db` returns status `200` with `status: degraded` so other smoke tests pass. In production it returns `500` on failure.

## Common Tasks
Recreate schema:
```
npm run db:migrate:undo:all && npm run db:migrate
```

Switch to MySQL: remove / comment SQLite lines and provide MySQL vars, then re-run migrations.
