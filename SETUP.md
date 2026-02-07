# Setup Instructions

## Prerequisites
1. PostgreSQL installed and running
2. Docker installed and running
3. Node.js 20+ installed

## Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to https://supabase.com and sign up/login
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `collab-platform`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to your location
4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning

### 2. Get Database Connection String
1. In Supabase dashboard, go to **Project Settings** (gear icon)
2. Click **Database** in the left sidebar
3. Scroll to **Connection String** section
4. Copy the **Connection pooling** string (recommended for serverless)
5. Replace `[YOUR-PASSWORD]` with your database password from step 1

### 3. Update Environment Variables
Edit `collab-platform-v2/.env.local`:
```bash
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

### 4. Generate NextAuth Secret
Run one of these commands:
```bash
# Option 1: Using openssl
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Copy the output and update `NEXTAUTH_SECRET` in `.env.local`

### 5. Run Prisma Migrations
```bash
cd collab-platform-v2
npx prisma migrate dev --name init
npx prisma generate
```

## Running the Application

### 1. Start Backend Services

**Terminal 1 - Yjs Server:**
```bash
cd collab-yjs-server
npm start
```

**Terminal 2 - Session Manager:**
```bash
cd collab-session-manager
npm start
```

### 2. Build Runtime Docker Image
```bash
cd collab-runtime
docker build -t collab-runtime .
```

### 3. Start Frontend
```bash
cd collab-platform-v2
npm run dev
```

## Access the Application
- Frontend: http://localhost:3000
- Create an account and start collaborating!

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `pg_ctl status`
- Check credentials in `.env.local`
- Test connection: `psql -U YOUR_USER collab_platform`

### Docker Issues
- Ensure Docker is running
- Check runtime image exists: `docker images | grep collab-runtime`
- View container logs: `docker logs CONTAINER_NAME`

### Port Conflicts
- Frontend (3000): Next.js
- Session Manager (4000): Express
- Yjs Server (1234): Collaboration
- Runtime (dynamic): Docker-mapped ports
