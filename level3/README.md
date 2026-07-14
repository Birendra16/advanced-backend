# Level 3 — Nginx, Load Balancing & Microservices

This level introduces horizontal scaling and service decomposition. Phase 1 puts a **Nginx load balancer** in front of multiple identical server instances. Phase 2 evolves this into a proper **microservices architecture** with a dedicated API gateway routing requests to independent domain services.

---

## 📁 Structure

```
level3/
├── phase1/                 # Nginx round-robin load balancing
│   ├── nginx/
│   │   └── nginx.conf      # Upstream config for 3 servers
│   ├── server/             # Express server (scaled × 3)
│   └── docker-compose.yml
│
└── phase2/                 # API Gateway + Microservices
    ├── nginx/
    │   └── nginx.conf      # Upstream config for 2 gateways
    ├── backend/
    │   ├── gateway/        # Express API Gateway (proxy)
    │   └── services/
    │       ├── auth/       # Authentication microservice
    │       ├── order/      # Order microservice
    │       └── product/    # Product microservice
    └── docker-compose.yml
```

---

## Phase 1 — Nginx Round-Robin Load Balancing

Three identical Express servers run as separate Docker containers. **Nginx** sits in front and distributes incoming requests across all three using the default **round-robin** algorithm.

### Architecture

```
Client
  │
  ▼
Nginx (port 8000)
  │  round-robin
  ├──▶ server1:7000  (responds: "Hello from 1 server")
  ├──▶ server2:7000  (responds: "Hello from 2 server")
  └──▶ server3:7000  (responds: "Hello from 3 server")
```

### Key Nginx configuration

```nginx
upstream backend {
  server server1:7000;
  server server2:7000;
  server server3:7000;
}

server {
  listen 80;
  location / {
    proxy_pass http://backend;
  }
}
```

### Services in `docker-compose.yml`

| Service | Image/Build | Host Port | Note |
|---------|------------|-----------|------|
| `nginx` | `nginx` (official) | `8000` | Mounts `nginx.conf` |
| `server1` | `./server` | `5001` | `SERVER_NAME=1 server` |
| `server2` | `./server` | `5002` | `SERVER_NAME=2 server` |
| `server3` | `./server` | `5003` | `SERVER_NAME=3 server` |

### Running

```bash
cd level3/phase1
docker compose up --build
```

Make repeated requests to `http://localhost:8000` and observe the response rotating between the three server names — proof of round-robin distribution.

---

## Phase 2 — API Gateway + Microservices

The architecture grows into a true microservices system. A horizontally-scaled **API Gateway** handles all inbound traffic and proxies to the appropriate backend **domain service** based on the URL prefix.

### Architecture

```
Client
  │
  ▼
Nginx (port 8080)
  │  round-robin across 2 gateway instances
  ├──▶ gateway1:8000 ─┐
  └──▶ gateway2:8000 ─┤
                       │  express-http-proxy routing
                       ├──▶ /auth    → auth-service:8001
                       ├──▶ /order   → order-service:8002
                       └──▶ /product → product-service:8003
```

### Gateway routing (`backend/gateway/index.js`)

```javascript
app.use("/auth",    proxy("http://auth-service:8001"))
app.use("/order",   proxy("http://order-service:8002"))
app.use("/product", proxy("http://product-service:8003"))
```

### Services in `docker-compose.yml`

| Service | Build | Host Port | Container Port |
|---------|-------|-----------|----------------|
| `nginx` | official image | `8080` | `80` |
| `gateway1` | `./backend/gateway` | `7001` | `8000` |
| `gateway2` | `./backend/gateway` | `7002` | `8000` |
| `auth-service` | `./backend/services/auth` | `5001` | `8001` |
| `order-service` | `./backend/services/order` | `5002` | `8002` |
| `product-service` | `./backend/services/product` | `5003` | `8003` |

### Microservices

Each service (`auth`, `order`, `product`) is a standalone Express server with its own:
- `Dockerfile`
- `.env`
- `config/` (DB connection)
- `controllers/`
- `routes/`
- `models/`

This enables independent deployment, scaling, and failure isolation per domain.

### Running

```bash
cd level3/phase2
docker compose up --build
```

**Example requests:**

```bash
# Health check (hits one of the gateways via Nginx)
curl http://localhost:8080/

# Route to auth service
curl http://localhost:8080/auth/

# Route to order service
curl http://localhost:8080/order/

# Route to product service
curl http://localhost:8080/product/
```

---

## Concepts Mastered in Level 3

- ✅ **Nginx upstream** block and round-robin load balancing
- ✅ **Horizontal scaling** — running N identical containers from one image
- ✅ **API Gateway** pattern using `express-http-proxy`
- ✅ **Microservices** — isolating auth, order, and product into independent services
- ✅ **Docker internal DNS** — services communicate by name, not IP
- ✅ Combining Nginx load balancing with an API Gateway tier
