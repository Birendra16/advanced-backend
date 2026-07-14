# Phase 1 — Nginx Round-Robin Load Balancing

Three identical Express servers run behind a single **Nginx reverse proxy** that distributes requests using the round-robin algorithm. This demonstrates the core concept of horizontal scaling — adding more instances of the same service to handle increased load.

## Architecture

```
                    ┌──────────────────────┐
Client ──── :8000 ──► Nginx (Round-Robin)  │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        server1:7000     server2:7000     server3:7000
      "Hello from      "Hello from      "Hello from
        1 server"         2 server"        3 server"
```

## Files

```
phase1/
├── nginx/
│   └── nginx.conf     # Upstream + proxy config
├── server/
│   ├── index.js       # Express server (reads SERVER_NAME from env)
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Nginx Configuration

```nginx
# nginx/nginx.conf
events {}

http {
  upstream backend {
    server server1:7000;   # Docker service names resolve as hostnames
    server server2:7000;
    server server3:7000;
  }

  server {
    listen 80;
    location / {
      proxy_pass http://backend;
    }
  }
}
```

Nginx uses **round-robin** by default — each new request goes to the next server in the list.

## Docker Compose Services

| Service | Build | Host Port | `SERVER_NAME` env |
|---------|-------|-----------|-------------------|
| `nginx` | official `nginx` image | `8000` → `80` | — |
| `server1` | `./server` | `5001` → `7000` | `"1 server"` |
| `server2` | `./server` | `5002` → `7000` | `"2 server"` |
| `server3` | `./server` | `5003` → `7000` | `"3 server"` |

> All three containers are **built from the same image** — the `SERVER_NAME` environment variable differentiates their responses.

## Running

```bash
cd level3/phase1
docker compose up --build
```

## Testing Round-Robin

Run the following multiple times and observe the rotating response:

```bash
curl http://localhost:8000

# Request 1 → { "message": "Hello from 1 server" }
# Request 2 → { "message": "Hello from 2 server" }
# Request 3 → { "message": "Hello from 3 server" }
# Request 4 → { "message": "Hello from 1 server" }  ← cycles back
```

## Key Concepts

| Concept | How it's applied |
|---------|-----------------|
| **Horizontal scaling** | Same image runs as 3 containers |
| **Load balancing** | Nginx distributes traffic evenly |
| **Round-robin** | Default Nginx upstream algorithm |
| **Docker DNS** | Service names (`server1`, `server2`) resolve automatically |
| **Volume-mounted config** | `nginx.conf` is mounted without rebuilding the Nginx image |
