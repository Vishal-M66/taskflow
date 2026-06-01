# TaskFlow — Task Manager

A full-stack task management application with JWT authentication, built as part of a frontend assignment submission.

🔗 **Live Frontend:** [https://your-app.netlify.app](https://your-app.netlify.app) ← replace after deploying  
🔗 **Live Backend:** [https://your-api.railway.app](https://your-api.railway.app) ← replace after deploying  
📁 **GitHub:** [https://github.com/YOUR_USERNAME/taskflow](https://github.com/YOUR_USERNAME/taskflow)

---

## Features

### Authentication
- Register with name, email, and password
- Login with JWT token (7-day expiry)
- Session persists across page refreshes via localStorage
- Passwords hashed with bcryptjs (never stored in plain text)

### Task Management
- Create, edit, and delete tasks
- Three stages: **To Do**, **In Progress**, **Done**
- Each task has a title, description, stage, and timestamp
- Tasks are scoped per user — no data leakage between accounts

### UI
- Kanban board layout with three columns
- Stats bar showing task counts and completion percentage
- Loading states on all async actions (login, save, delete)
- Error messages displayed inline
- Responsive design — works on mobile and desktop
- Offline/backend-down banner if API is unreachable

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Vanilla HTML, CSS, JavaScript       |
| Backend    | Node.js + Express.js                |
| Database   | SQLite via better-sqlite3           |
| Auth       | JWT (jsonwebtoken) + bcryptjs       |
| Hosting    | Netlify (frontend) + Railway (backend) |

---

## Project Structure

```
taskflow/
├── public/
│   └── index.html        ← Full frontend (single HTML file)
├── src/
│   ├── server.js         ← Express app entry point
│   ├── db.js             ← SQLite setup + schema creation
│   ├── config.js         ← Port, JWT secret config
│   ├── middleware.js     ← JWT auth middleware
│   ├── authRoutes.js     ← POST /api/auth/register, /login, GET /me
│   └── taskRoutes.js     ← Full CRUD /api/tasks + stats
├── .env.example          ← Environment variable template
├── .gitignore
└── package.json
```

---

## API Endpoints

Base URL: `http://localhost:4000/api`

All task routes require: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET  | `/api/auth/me` | Get current user info |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/tasks` | Get all tasks for logged-in user |
| POST   | `/api/tasks` | Create a new task |
| PUT    | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET    | `/api/tasks/stats/summary` | Task counts by stage |

### Example Request — Create Task
```bash
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"title": "Design homepage", "description": "Wireframes first", "stage": "todo"}'
```

### Example Response
```json
{
  "message": "Task created.",
  "task": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Design homepage",
    "description": "Wireframes first",
    "stage": "todo",
    "created_at": 1717200000000,
    "updated_at": 1717200000000
  }
}
```

---

## Database Schema

```sql
CREATE TABLE users (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,        -- bcrypt hashed
  created_at INTEGER
);

CREATE TABLE tasks (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  stage       TEXT CHECK(stage IN ('todo','progress','done')),
  created_at  INTEGER,
  updated_at  INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Run Locally

### Requirements
- [Node.js](https://nodejs.org) v16+

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow

# 2. Install dependencies
npm install

# 3. (Optional) Set environment variables
cp .env.example .env
# Edit .env and set JWT_SECRET

# 4. Start the server
npm start
```

Open **http://localhost:4000** in your browser.

---

## Deployment

### Frontend → Netlify (Free)
The `public/index.html` is a standalone file that can be deployed independently.

1. Go to [netlify.com](https://netlify.com) → sign up
2. Drag and drop the `public/` folder onto the Netlify dashboard
3. Done — you get a live URL instantly

> After deploying the backend, update `API_BASE` in `index.html` to point to your backend URL.

### Backend → Railway (Free)
1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select this repo
4. Set environment variable: `JWT_SECRET=your-secret-key`
5. Railway auto-detects Node.js and runs `npm start`

---

## Assumptions

- **Single user scope** — tasks are private per user; there is no shared/team workspace.
- **No email verification** — registration is immediate with no email confirmation step, keeping the flow simple for this submission.
- **SQLite over PostgreSQL** — chosen for zero-config local setup. For production scale, this would be swapped to PostgreSQL.
- **No pagination** — tasks are returned in full. Acceptable for a task manager with typical personal workloads (< a few hundred tasks).
- **JWT stored in localStorage** — simpler for a single-page app. A production app would use httpOnly cookies to prevent XSS access to the token.

---

## Tradeoffs

| Decision | Chosen | Alternative | Reason |
|----------|--------|-------------|--------|
| Database | SQLite | PostgreSQL | Zero setup for local dev; easy to run without Docker |
| Frontend | Vanilla JS | React / Vue | No build step, single HTML file, easier to deploy anywhere |
| Token storage | localStorage | httpOnly cookie | Simpler for SPA; cookies would need extra CSRF handling |
| Password hashing | bcryptjs | argon2 | bcryptjs has no native dependencies, works on all platforms |
| ORM | Raw SQL (better-sqlite3) | Prisma / Sequelize | Fewer dependencies, faster queries, simpler mental model |

---

## Technical Decisions

- **Single HTML file frontend** — the entire frontend is one `index.html` with no build tools, bundlers, or frameworks. This makes it trivially deployable to any static host (Netlify, GitHub Pages, Cloudflare Pages) by just dragging a file.
- **Express serves the frontend** — the backend serves `public/index.html` as a static file, so both run from one `npm start` command. This simplifies local development and deployment.
- **UUID primary keys** — tasks and users use `crypto.randomUUID()` instead of auto-increment integers to avoid exposing sequential IDs in the API.
- **Foreign key cascade** — deleting a user cascades to delete all their tasks, keeping the database clean.
- **WAL mode for SQLite** — Write-Ahead Logging is enabled for better concurrent read performance.

---

## AI Tools Used

This project was built with **Claude (Anthropic)** as an AI coding assistant.  
As per the assignment requirements, the backend is implemented and included.

---

## License

MIT
