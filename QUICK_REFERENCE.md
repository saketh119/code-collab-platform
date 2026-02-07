# Quick Reference - Collab Platform

## 🚀 Quick Start

### First Time Setup
```bash
# 1. Setup database
createdb collab_platform
cd collab-platform-v2
# Update .env.local with your PostgreSQL credentials
npx prisma migrate dev --name init
npx prisma generate

# 2. Build Docker image
cd ../collab-runtime
docker build -t collab-runtime .

# 3. Install dependencies (already done)
# All packages are installed!
```

### Running the App
```bash
# Terminal 1 - Yjs Server (port 1234)
cd collab-yjs-server
npm start

# Terminal 2 - Session Manager (port 4000)
cd collab-session-manager
npm start

# Terminal 3 - Frontend (port 3000)
cd collab-platform-v2
npm run dev
```

### Access
- **Frontend**: http://localhost:3000
- **Session Manager API**: http://localhost:4000
- **Yjs Server**: ws://localhost:1234

---

## 📁 Key Files

### Authentication
- `app/api/auth/[...nextauth]/route.ts` - NextAuth config
- `app/api/auth/signup/route.ts` - User registration
- `app/login/page.tsx` - Login UI
- `app/signup/page.tsx` - Signup UI

### Session Management
- `app/dashboard/page.tsx` - Dashboard server component
- `app/dashboard/dashboard-client.tsx` - Dashboard UI
- `collab-session-manager/index.js` - Backend API

### Collaboration
- `app/session/[sessionId]/session.tsx` - Session UI
- `components/editor/Editor.tsx` - Monaco + Yjs
- `components/TerminalTabs.tsx` - Terminal tabs

### Database
- `prisma/schema.prisma` - Database schema
- `lib/prisma.ts` - Prisma client
- `.env.local` - Database URL

---

## 🎯 Features Implemented

### ✅ Authentication
- NextAuth.js with credentials provider
- Secure password hashing (bcrypt)
- JWT sessions
- Login/Signup pages

### ✅ Dashboard
- Create new sessions
- View session history
- Share session links (copy to clipboard)
- Delete sessions
- User profile menu

### ✅ Terminal
- Resizable split view (drag to resize)
- Multiple terminal tabs
- Add/remove tabs
- Each tab = independent terminal

### ✅ Editor
- Real user names (not random)
- Consistent user colors
- XTerm Real-time collaboration with Yjs

### ✅ Database
- PostgreSQL with Prisma
- User accounts
- Session metadata
- Owner tracking

---

## 🔧 Common Commands

### Database
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (DB GUI)
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Docker
```bash
# Build runtime image
docker build -t collab-runtime .

# List running containers
docker ps

# View container logs
docker logs CONTAINER_NAME

# Remove container
docker rm -f CONTAINER_NAME

# List images
docker images
```

### Development
```bash
# Run frontend dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npx tsc --noEmit
```

---

## 🐛 Troubleshooting

### "Failed to start session"
- Check if Docker is running: `docker ps`
- Verify image exists: `docker images | grep collab-runtime`
- Build if missing: `cd collab-runtime && docker build -t collab-runtime .`

### "Database connection failed"
- Check PostgreSQL is running
- Verify credentials in `.env.local`
- Test connection: `psql -U YOUR_USER collab_platform`

### "Session not found in database"
- Ensure Prisma client is generated: `npx prisma generate`
- Check session manager has `@prisma/client` installed
- Restart session manager service

### TypeScript errors
- Most are non-blocking
- Run `npm install` to ensure all types are installed
- Restart TypeScript server in IDE

---

## 📊 Architecture

```
┌─────────────────┐
│   Browser 1     │──┐
└─────────────────┘  │
                     │
┌─────────────────┐  │     ┌──────────────────┐
│   Browser 2     │──┼────▶│  Next.js (3000)  │
└─────────────────┘  │     │   - NextAuth     │
                     │     │   - Dashboard    │
┌─────────────────┐  │     │   - Session UI   │
│   Browser 3     │──┘     └─────────┬────────┘
└─────────────────┘                  │
                                     │
              ┌──────────────────────┼────────────────────────┐
              │                      │                        │
              ▼                      ▼                        ▼
    ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
    │  Yjs Server      │   │  Session Manager │   │   PostgreSQL     │
    │  (1234)          │   │  (4000)          │   │   Database       │
    │  - Collaboration │   │  - Docker API    │   │  - Users         │
    │  - CRDT sync     │   │  - Sessions      │   │  - Sessions      │
 └──────────────────┘   └────────┬─────────┘   └──────────────────┘
                                     │
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │  Docker Containers   │
                          │  - collab_session1   │
                          │  - collab_session2   │
                          │  Each has Terminal   │
                          └──────────────────────┘
```

---

## 🎨 UI Components

### Colors
- **Primary**: Blue gradient (#4F46E5 → #6366F1)
- **Background**: Neutral grays
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **User Colors**: 8 distinct colors for editor cursors

### Icons (Lucide React)
- Plus - Add new item
- Share2 - Share session
- Trash2 - Delete
- LogOut - Sign out
- User - User profile
- ExternalLink - Open session
- X - Close tab

---

## 💡 Tips

### Development
- Use React DevTools to debug components
- Check browser console for errors
- Use Prisma Studio to view database
- Monitor Docker logs for runtime issues

### Production
- Change `NEXTAUTH_SECRET` to strong random string
- Use environment variables for all secrets
- Set up proper database backups
- Configure Docker resource limits
- Use reverse proxy (nginx) for SSL

---

## 📚 Resources

- NextAuth.js Docs: https://next-auth.js.org
- Prisma Docs: https://www.prisma.io/docs
- React Resizable Panels: https://github.com/bvaughn/react-resizable-panels
- Yjs Docs: https://docs.yjs.dev
- Monaco Editor: https://microsoft.github.io/monaco-editor/

---

## ✨ Next Steps

1. Run database migration
2. Build Docker image
3. Start all services
4. Create an account
5. Start coding together!
