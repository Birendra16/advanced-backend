# Phase 2 — Multi-Container Full-Stack App

Extends Phase 1 by adding a **Next.js frontend** and a **Redis** service, then tying all three together with Docker Compose.

## What you learn

- Defining multiple services in a single `docker-compose.yml`
- Services referencing each other by **name** inside Docker's network
- Using `env_file` to inject environment variables per service
- Running a frontend (Next.js) and backend (Express) together with a shared cache layer

## Services

```
┌──────────────┐   ┌──────────────┐   ┌──────────┐
│   frontend   │   │   backend    │   │  redis   │
│  (Next.js)   │   │  (Express)   │   │          │
│  Port 3000   │   │  Port 8001   │   │ Port 6379│
└──────────────┘   └──────────────┘   └──────────┘
```

## `docker-compose.yml` breakdown

```yaml
services:
  backend:
    build: ./backend        # Uses ./backend/Dockerfile
    env_file: ./backend/.env
    ports: ["8001:7000"]    # host:container

  frontend:
    build: ./frontend       # Uses ./frontend/Dockerfile
    ports: ["3000:3000"]

  redis:
    image: redis            # Official Redis image — no custom build needed
    ports: ["6379:6379"]
```

## Running

```bash
cd level1/phase2

# Build all images and start all services
docker compose up --build

# Stop everything
docker compose down
```

## Endpoints

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8001 |
| Redis | `localhost:6379` (internal) |

## Environment Variables (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (internal: `7000`) |
