# Level 1 — Docker & Containerization

This level introduces **Docker** and **Docker Compose** through two progressive phases. You will learn how to package a Node.js server into a container image and then orchestrate multiple services together.

---

## 📁 Structure

```
level1/
├── phase1/   # Single Docker container — Express server
└── phase2/   # Multi-container stack — Next.js + Express + Redis
```

---

## Phase 1 — Single Container Express Server

A minimal Express.js application packaged inside a Docker container. The goal is to understand how to write a `Dockerfile`, set environment variables, and run a containerised Node.js process.

### What's inside

| File | Purpose |
|------|---------|
| `index.js` | Express server with a single `GET /` health-check route |
| `Dockerfile` | Container build instructions |
| `.dockerignore` | Excludes `node_modules` from the build context |
| `package.json` | Dependencies: `express`, `dotenv` |

### Key concepts

- **`FROM node`** — base image selection
- **`WORKDIR /app`** — setting the working directory inside the container
- **`COPY package*.json .` → `npm install` → `COPY . .`** — layer-caching best practice
- **`CMD ["node", "index.js"]`** — container startup command
- **Environment variables** via `dotenv` and Docker `--env-file` / `-e` flags

### Running

```bash
cd level1/phase1

# Build the image
docker build -t level1-phase1 .

# Run the container (expose port 5000)
docker run -p 5000:5000 level1-phase1
```

Visit `http://localhost:5000` → `{ "message": "Hello from docker phase 1" }`

---

## Phase 2 — Multi-Container Full-Stack App

Extends Phase 1 by adding a **Next.js frontend**, a **Redis** service, and wiring everything together with **Docker Compose**.

### What's inside

```
phase2/
├── backend/       # Express server (same pattern as Phase 1)
├── frontend/      # Next.js application
└── docker-compose.yml
```

### Services defined in `docker-compose.yml`

| Service | Build/Image | Host Port | Container Port |
|---------|-------------|-----------|----------------|
| `backend` | `./backend` | `8001` | `7000` |
| `frontend` | `./frontend` | `3000` | `3000` |
| `redis` | `redis` (official image) | `6379` | `6379` |

### Key concepts

- **`docker-compose.yml`** — declarative multi-service orchestration
- **`env_file`** — injecting environment variables from a file into a service
- **Named services** resolve to hostnames inside the Docker network (e.g., `redis` is reachable at `redis:6379`)

### Running

```bash
cd level1/phase2

docker compose up --build
```

| Endpoint | URL |
|----------|-----|
| Backend API | `http://localhost:8001` |
| Frontend | `http://localhost:3000` |

---

## Concepts Mastered in Level 1

- ✅ Writing a production-style `Dockerfile` for Node.js
- ✅ Using `.dockerignore` to keep images lean
- ✅ Multi-stage service orchestration with Docker Compose
- ✅ Service-to-service networking inside Docker
- ✅ Managing env vars per service with `env_file`
