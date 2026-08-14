# 🚀 Code Collab Platform

> **A real-time collaborative coding environment** — write, run, and share code with teammates, all in the browser.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Yjs](https://img.shields.io/badge/Yjs-CRDT-purple)](https://yjs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Runtime-2496ED?logo=docker)](https://www.docker.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [How Real-Time Updates Work](#-how-real-time-updates-work)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)

---

## 🌟 Overview

Code Collab Platform is a **Google Docs-style coding environment** — multiple users can edit the same file simultaneously, see each other's cursors in real time, run code inside isolated Docker containers, and interact with a shared terminal. No conflicts, no overwrites — just seamless collaboration.

Think of it as **VS Code Live Share** but fully browser-based and self-hosted.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🖊️ **Real-time Co-editing** | See every keystroke from collaborators instantly via CRDT sync |
| 🖱️ **Live Cursor Presence** | Each user gets a unique color; cursor positions are shared live |
| 🐳 **Isolated Docker Containers** | Every session gets its own sandboxed Node.js runtime environment |
| 💻 **Integrated Terminal** | Full PTY terminal over WebSocket — run any command |
| 📑 **Multiple Terminal Tabs** | Open and manage multiple terminal sessions per workspace |
| 🔀 **Resizable Panels** | Drag to resize the editor / terminal split |
| 🔗 **One-Click Session Sharing** | Copy a shareable link to invite collaborators |
| 🔐 **Secure Authentication** | NextAuth.js with bcrypt password hashing and JWT sessions |
| 📜 **Session History** | View and reopen all past coding sessions from your dashboard |
| 💾 **Auto-Save** | Code is debounced-saved to the container automatically |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript | App shell, routing, server components |
| **Styling** | Tailwind CSS v4 | Utility-first styling |
| **Code Editor** | Monaco Editor | VS Code engine in the browser |
| **Terminal** | XTerm.js + `node-pty` | Browser-side PTY terminal |
| **Real-time Sync** | **Yjs (CRDT)** + Y-WebSocket | Conflict-free collaborative editing |
| **Auth** | NextAuth.js (Credentials + JWT) | Secure login / session management |
| **Database** | Supabase (PostgreSQL) + Prisma ORM | User accounts, session metadata |
| **Container Runtime** | Docker + `collab-runtime` image | Isolated Node.js execution environments |
| **Session API** | Express.js (`collab-session-manager`) | Docker lifecycle management |
| **State** | Zustand | Client-side state management |

---

## 🏗️ Architecture

The platform is composed of **four independently running services** that communicate over HTTP and WebSocket.

```
┌──────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                                                              │
│   ┌──────────────────┐      ┌──────────────────────────┐    │
│   │  Monaco Editor   │      │   XTerm.js Terminal      │    │
│   │  (y-monaco)      │      │   (WebSocket PTY)        │    │
│   └────────┬─────────┘      └────────────┬─────────────┘    │
│            │ Yjs CRDT                    │ ws://             │
└────────────┼─────────────────────────────┼──────────────────┘
             │                             │
             ▼                             ▼
┌────────────────────┐       ┌─────────────────────────────────┐
│  collab-yjs-server │       │        collab-runtime           │
│  ws://localhost:1234│       │  (Docker Container per session)│
│                    │       │  ws://localhost:<dynamic-port>  │
│  • y-websocket     │       │                                 │
│  • Broadcasts CRDT │       │  • node-pty shell (bash)        │
│    ops to all peers│       │  • Executes user commands       │
│  • Manages rooms   │       │  • Streams output via WS        │
│    by session ID   │       │  • Isolated /workspace dir      │
└────────────────────┘       └────────────────┬────────────────┘
                                              │ docker run/exec
             ┌────────────────────────────────▼────────────────┐
             │           collab-session-manager                 │
             │           http://localhost:4000                  │
             │                                                  │
             │  • POST /start-session  → docker run            │
             │  • POST /save-file     → docker exec write      │
             │  • POST /run-code/:id  → docker exec node       │
             │  • POST /stop-session  → docker rm -f           │
             │  • GET  /sessions/:uid → list user sessions     │
             └──────────────────────┬───────────────────────────┘
                                    │ Prisma ORM
                                    ▼
             ┌──────────────────────────────────────────────────┐
             │           Supabase PostgreSQL                     │
             │                                                  │
             │  Users │ Sessions │ Accounts │ CodeSessions      │
             └──────────────────────────────────────────────────┘
```

### Architecture Diagram (Mermaid)

```mermaid
graph TB
    subgraph Browser["🌐 User Browser"]
        ME["Monaco Editor\n(y-monaco binding)"]
        XT["XTerm.js Terminal"]
        UI["Next.js UI\n(collab-platform-v2)"]
    end

    subgraph YjsServer["⚡ collab-yjs-server\n(ws://localhost:1234)"]
        YWS["y-websocket\nWebSocket Server"]
        ROOM["Session Rooms\n(by sessionId)"]
        YWS --> ROOM
    end

    subgraph SessionMgr["🔧 collab-session-manager\n(http://localhost:4000)"]
        EXPRESS["Express.js API"]
        DOCKER_CTRL["Docker CLI\nController"]
        EXPRESS --> DOCKER_CTRL
    end

    subgraph DockerContainer["🐳 collab-runtime Container\n(per session)"]
        WS_RT["WebSocket Server\n(port 3000)"]
        PTY["node-pty\nPTY Shell"]
        WORKSPACE["/app/workspace\nIsolated Files"]
        WS_RT --> PTY
        PTY --> WORKSPACE
    end

    subgraph DB["🗄️ Supabase PostgreSQL"]
        USERS["Users"]
        CODE_SESSIONS["CodeSessions"]
        AUTH_SESSIONS["Auth Sessions"]
    end

    ME -- "Yjs CRDT ops\n(WebSocket)" --> YWS
    YWS -- "Broadcast to\nall peers" --> ME
    XT -- "PTY I/O\n(WebSocket)" --> WS_RT
    UI -- "REST API\n(start/stop/save)" --> EXPRESS
    DOCKER_CTRL -- "docker run/exec/rm" --> DockerContainer
    EXPRESS -- "Prisma ORM" --> DB
    UI -- "NextAuth.js\n(JWT)" --> AUTH_SESSIONS
```

---

## ⚡ How Real-Time Updates Work

Real-time collaboration is powered by **Yjs** — a battle-tested **CRDT (Conflict-free Replicated Data Type)** library. CRDTs allow multiple users to edit the same document simultaneously without ever producing merge conflicts.

### The Sync Flow

```mermaid
sequenceDiagram
    participant U1 as 👤 User A (Alice)
    participant YJS as ⚡ Yjs WebSocket Server<br/>(ws://localhost:1234)
    participant U2 as 👤 User B (Bob)
    participant U3 as 👤 User C (Charlie)

    Note over U1,U3: All users join the same "room" keyed by sessionId

    U1->>U1: Opens session page<br/>Creates Y.Doc
    U1->>YJS: WebSocket Connect<br/>room = sessionId
    YJS-->>U1: Send current document state

    U2->>U2: Opens same session link<br/>Creates Y.Doc
    U2->>YJS: WebSocket Connect<br/>room = sessionId
    YJS-->>U2: Send current document state (synced with Alice's)

    U3->>YJS: WebSocket Connect<br/>room = sessionId
    YJS-->>U3: Send current document state

    Note over U1: Alice types "hello"
    U1->>U1: Monaco fires onChange event
    U1->>U1: y-monaco converts keystroke<br/>to a Yjs Update (binary delta)
    U1->>YJS: Broadcast Yjs Update (binary)

    YJS->>U2: Forward Yjs Update to Bob
    YJS->>U3: Forward Yjs Update to Charlie

    U2->>U2: Yjs merges update into<br/>local Y.Doc (CRDT merge)
    U2->>U2: y-monaco applies change<br/>to Monaco model

    U3->>U3: Yjs merges update
    U3->>U3: Monaco model updated

    Note over U2: Bob types "world" simultaneously
    U2->>U2: y-monaco converts to Yjs Update
    U2->>YJS: Broadcast Yjs Update (binary)

    YJS->>U1: Forward to Alice
    YJS->>U3: Forward to Charlie

    U1->>U1: CRDT auto-merges<br/>both changes — no conflict!
    Note over U1,U3: All editors show "hello world" ✅
```

### Cursor / Awareness Flow

```mermaid
sequenceDiagram
    participant U1 as 👤 User A
    participant YJS as ⚡ Yjs Server<br/>(Awareness Protocol)
    participant U2 as 👤 User B

    U1->>U1: provider.awareness.setLocalState<br/>{ user: { name, color } }
    U1->>YJS: Awareness update (cursor position)
    YJS->>U2: Forward awareness state

    U2->>U2: y-monaco renders<br/>remote cursor widget<br/>in Alice's color

    Note over U1,U2: Every cursor move triggers awareness update
    U1->>YJS: Cursor moves to line 10, col 5
    YJS->>U2: Awareness update
    U2->>U2: Bob sees Alice's cursor<br/>jump to line 10
```

### Key Concepts

| Concept | Explanation |
|---|---|
| **Y.Doc** | The shared document. Every client holds a local replica. |
| **YText** | A Yjs text type bound to Monaco's editor model via `y-monaco`. |
| **WebsocketProvider** | Connects the local Y.Doc to the Yjs server room identified by `sessionId`. |
| **CRDT Merge** | When two users edit simultaneously, Yjs mathematically merges both changes without conflicts. |
| **Awareness** | A lightweight protocol layered on top of Yjs for sharing ephemeral state (cursor positions, user names, colors). |
| **Room Isolation** | Each session gets its own room on the Yjs server keyed by its UUID — edits from one session never bleed into another. |

### Why No Conflicts?

Traditional operational-transform (OT) approaches require a central server to arbitrate edits. Yjs uses **CRDTs** — a mathematical structure where any two replicas can be merged in any order and always converge to the same result. This means:

- ✅ **No master server** needed for document state
- ✅ **Offline edits** can be merged when reconnecting
- ✅ **Zero merge conflicts** by mathematical guarantee

---

## 📁 Project Structure

```
code-collab-platform/
│
├── collab-platform-v2/          # 🌐 Next.js Frontend
│   ├── app/
│   │   ├── page.tsx             # Landing / home page
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   ├── dashboard/           # Session dashboard
│   │   ├── session/[sessionId]/ # Collaborative coding session
│   │   └── api/
│   │       ├── auth/            # NextAuth.js handler
│   │       └── sessions/        # Session REST endpoints (proxy to manager)
│   ├── components/
│   │   ├── editor/
│   │   │   └── Editor.tsx       # Monaco + Yjs + y-monaco integration
│   │   ├── Terminal.tsx         # XTerm.js terminal component
│   │   └── TerminalTabs.tsx     # Multi-tab terminal manager
│   ├── lib/
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── api.ts               # Client-side API helpers
│   │   ├── prisma.ts            # Prisma client singleton
│   │   └── websockets.ts        # WebSocket connection helpers
│   └── prisma/
│       └── schema.prisma        # Database models
│
├── collab-yjs-server/           # ⚡ Real-Time Collaboration Server
│   └── server.js                # y-websocket server on :1234
│
├── collab-session-manager/      # 🔧 Docker Lifecycle Manager
│   ├── index.js                 # Express API on :4000
│   └── prisma/                  # Prisma schema (copy)
│
└── collab-runtime/              # 🐳 Docker Container Image
    ├── Dockerfile               # Node 20 + bash + node-pty
    ├── server.js                # WebSocket PTY server on :3000
    └── terminal.js              # node-pty shell spawner
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Supabase account](https://supabase.com/) (or any PostgreSQL instance)

### 1. Clone the Repository

```bash
git clone https://github.com/saketh119/code-collab-platform.git
cd code-collab-platform
```

### 2. Build the Docker Runtime Image

> ⚠️ Do this **once** before creating your first session.

```bash
cd collab-runtime
docker build -t collab-runtime .
cd ..
```

### 3. Install Dependencies

```bash
# Frontend
cd collab-platform-v2 && npm install && cd ..

# Session manager
cd collab-session-manager && npm install && cd ..

# Yjs server
cd collab-yjs-server && npm install && cd ..
```

### 4. Configure Environment Variables

See [Environment Variables](#-environment-variables) below.

### 5. Set Up Database

```bash
cd collab-platform-v2
npx prisma migrate dev
npx prisma generate
cd ..

cd collab-session-manager
npx prisma generate
cd ..
```

### 6. Start All Services

Open **3 separate terminals**:

```bash
# Terminal 1 — Yjs real-time server
cd collab-yjs-server && npm start
# → Yjs WebSocket server running on ws://localhost:1234

# Terminal 2 — Session manager (Docker API)
cd collab-session-manager && npm start
# → Session Manager running on http://localhost:4000

# Terminal 3 — Next.js frontend
cd collab-platform-v2 && npm run dev
# → Ready on http://localhost:3000
```

Visit **http://localhost:3000** 🎉

---

## 🧪 Testing Real-Time Collaboration

1. Sign up and create a new session
2. Click the **Share** button to copy the session link
3. Open the link in an **incognito / private window**
4. Sign in as a different user
5. Type in either editor — watch changes appear instantly in both! 🎉

---

## 🔧 Environment Variables

### `collab-platform-v2/.env.local`

```env
# Supabase PostgreSQL (with connection pooling)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Internal service communication
INTERNAL_API_SECRET="your-shared-secret"

# Yjs WebSocket Server
NEXT_PUBLIC_YJS_URL="ws://localhost:1234"

# Session Manager
SESSION_MANAGER_URL="http://localhost:4000"
```

### `collab-session-manager/.env`

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
INTERNAL_API_SECRET="your-shared-secret"
```

---

## 📡 API Reference

### Session Manager (`http://localhost:4000`)

All endpoints require the `x-api-key` header matching `INTERNAL_API_SECRET`.

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/start-session` | `{ userId }` | Spins up a Docker container, returns `sessionId` + `wsUrl` |
| `GET` | `/sessions/:userId` | — | Lists all sessions owned by a user |
| `POST` | `/save-file` | `{ sessionId, content }` | Writes file into the container's workspace |
| `POST` | `/run-code/:sessionId` | — | Executes `node main.js` inside the container |
| `POST` | `/stop-session/:id` | — | Stops and removes the Docker container |

### Next.js API Routes (`/api/sessions/...`)

These are thin proxies that add auth validation before forwarding to the session manager.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/sessions/start` | Start a new session (authenticated) |
| `POST` | `/api/sessions/save-file` | Save file content |
| `POST` | `/api/sessions/run-code/:id` | Run code in container |

---

## 🗄️ Database Schema

```prisma
model User {
  id           String        @id @default(cuid())
  name         String?
  email        String?       @unique
  password     String?       // bcrypt hashed
  accounts     Account[]
  sessions     Session[]
  codeSessions CodeSession[]
  createdAt    DateTime      @default(now())
}

model CodeSession {
  id            String   @id @default(uuid())
  containerName String              // Docker container name
  ownerId       String
  owner         User     @relation(...)
  participants  String[]            // Array of user IDs
  isPublic      Boolean  @default(false)
  lastActive    DateTime @default(now())
  createdAt     DateTime @default(now())
}
```

---

## 🐳 Docker Container Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Idle : User clicks "New Session"
    Idle --> Starting : POST /start-session
    Starting --> Running : docker run collab-runtime
    Running --> Running : User edits code / runs terminal commands
    Running --> Stopped : POST /stop-session
    Stopped --> [*] : docker rm -f container
```

---

## 🛣️ Roadmap

- [ ] Multi-file workspace explorer
- [ ] Support for Python, Go, Rust runtimes
- [ ] Voice/video chat integration
- [ ] GitHub OAuth login
- [ ] Session replay / history
- [ ] Persistent file storage (S3 / Supabase Storage)
- [ ] Kubernetes-based container orchestration

---

## 📄 License

MIT — feel free to fork, extend, and use in your own projects.

---

<p align="center">
  Built with ❤️ using Next.js, Yjs, Monaco Editor, and Docker
</p>
