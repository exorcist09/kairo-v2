<img width="480" height="180" alt="Kairo" src="https://github.com/user-attachments/assets/f577e106-7dd8-4a63-b360-c67c212e33e3" />

---
Kairo is a visual workflow automation platform and job scheduler.

It enables users to build, configure, and execute automation workflows using an interactive drag-and-drop editor while providing a scalable backend architecture for workflow execution and scheduling.

---

## Features

### Workflow Builder
- Visual drag-and-drop workflow editor
- Interactive node and edge management using React Flow
- Workflow validation before execution
- Real-time workflow updates
- Auto-save functionality

### Authentication
- Secure JWT-based authentication
- Login and signup flows
- Password hashing using bcrypt
- Protected routes and APIs

### Workflow Management
- Create, update, delete workflows
- User-specific workflow ownership
- Workflow version management
- Execution history and logs

### Scheduling & Automation
- Job scheduling
- Background workflow execution
- Retry mechanisms
- Queue-based processing
- Future support for event-driven automations

### Dashboard
- Workflow analytics
- Execution statistics
- Success and failure tracking
- Visual reporting using charts

---

## Tech Stack

### Frontend

- Next.js (TypeScript)
- React Flow
- Zustand
- TanStack Query
- Zod
- Axios
- TailwindCSS
- Recharts

### Backend

- Node.js
- Express.js
- Prisma ORM

### Database

- PostgreSQL (Supabase)

### Authentication & Security

- JWT
- bcrypt

### Infrastructure

- Docker
- Nginx
- AWS
- GitHub Actions

### API Documentation

- Scalar

### Testing

- Unit Testing
- Playwright E2E Testing

---

## Algorithms & Data Structures

Kairo uses several core concepts for workflow management:

- Directed Graphs for workflow representation
- Graph traversal for execution flow
- Binary-tree-inspired execution strategies
- Node and edge management using React Flow
- Queue-based job processing

---

## Project Structure

```bash
kairo/
│
├── apps/
│   ├── web/                # Next.js frontend
│   └── api/                # Express backend
│
├── packages/
│   ├── shared/
│   ├── types/
│   └── utils/
│
├── docs/
│
├── docker/
│
├── .github/
│   └── workflows/
│
├── package.json
└── README.md
```

---

## Local Development

### Clone Repository

```bash
git clone https://github.com/exorcist09/kairo.git
cd kairo
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

#### Backend

```env
PORT=5000

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_secret_key

SENTRY_DSN=your_sentry_dsn
```

#### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### Run Backend

```bash
cd apps/api

npm run dev
```

### Run Frontend

```bash
cd apps/web

npm run dev
```

---

---

## Deployment

The platform is designed for deployment on AWS.

Infrastructure includes:

- Docker
- Nginx
- GitHub Actions
- Supabase PostgreSQL

