# FindMySpot Backend

Production-grade Express + Sequelize backend for FindMySpot. A single representative UI screenshot now lives in the root `README.md` (extra images removed for brevity).

## Quick Start

1. Install dependencies: `npm install`
2. Set up environment variables (see below)
3. Run migrations: `npm run db:migrate`
4. Start server: `npm start`

## Environment Setup

Copy `.env.example` to `.env` and configure:

### For Local Development
```bash
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-local-secret
DB_DIALECT=sqlite
DB_STORAGE=database.sqlite
```

### For Production (Render + Railway)
```bash
PORT=10000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
JWT_SECRET=your-production-secret
MYSQL_URL=mysql://user:password@host:port/database
DB_SSL=true
```

## Deployment on Render

### Prerequisites
1. **Database**: Set up MySQL database on Railway
2. **Repository**: Push code to GitHub
3. **Environment**: Prepare environment variables

### Steps

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder as root directory

2. **Configure Service**
   - **Name**: `findmyspot-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or higher for production)

3. **Environment Variables**
   Set these in Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-secret-key
   MYSQL_URL=your-railway-mysql-url
   CORS_ORIGIN=https://your-frontend-domain.com
   DB_SSL=true
   DB_POOL_MAX=15
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX=120
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy
   - Use the health endpoint: `https://your-app.onrender.com/api/health`

### Railway MySQL Setup

1. Create new project on [Railway](https://railway.app)
2. Add MySQL database service
3. Copy the `MYSQL_URL` from Railway dashboard
4. Add it to Render environment variables

### Important Notes

- **Cold Starts**: Free tier has cold starts after 15 minutes of inactivity
- **Build Time**: Includes running database migrations
- **Health Check**: Endpoint at `/api/health` for monitoring
- **Logs**: Check Render logs for debugging

## Database Migrations

We use Sequelize migrations for schema management:

### Commands
- `npm run db:migrate` - Apply pending migrations
- `npm run db:migrate:undo` - Rollback last migration
- `npm run db:migrate:undo:all` - Rollback all migrations

### Production Workflow
1. Create migration locally
2. Test migration on development database
3. Deploy to Render (migrations run automatically in build step)
4. Verify deployment health

## API Endpoints

### Health & Index
- `GET /` - Root welcome
- `GET /api` - API index (lists groups)
- `GET /api/health` - Basic service health status
- `GET /api/health/db` - Database connectivity (shows degraded info in dev)
- `GET /api/health/db/extended` - Extended diagnostics (development only)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/lister/register` - Lister registration
- `POST /api/auth/lister/login` - Lister login

### Core Features
- `/api/parking-spaces` - Parking space management
- `/api/bookings` - Booking management
- `/api/user-queries` - User support queries
- `/api/admin` - Admin dashboard endpoints

## Security Features

- JWT authentication with role-based access
- Rate limiting (120 requests per minute per IP)
- CORS protection
- Input validation and sanitization
- SQL injection prevention via Sequelize ORM

## Monitoring

- Health endpoint for uptime monitoring
- Structured error logging
- Database connection monitoring
- Request rate limiting

## Development

### Local Setup
```bash
npm install
cp .env.example .env
# Edit .env with local settings
npm run db:migrate
npm run dev
```

### Adding Features
1. Create/modify models in `src/models/`
2. Generate migration: `npx sequelize migration:generate --name feature-name`
3. Implement routes in `src/routes/`
4. Add tests (when test suite is implemented)
5. Deploy to staging/production
