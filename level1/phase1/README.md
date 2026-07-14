# Phase 1 — Single Container Express Server

The simplest possible Docker project: one Express.js server, one Dockerfile, one container.

## What you learn

- How to write a `Dockerfile` for a Node.js application
- Layer-caching strategy (`COPY package*.json` before `COPY . .`)
- Running environment variables inside a container via `dotenv`
- Building and running a Docker image locally

## Files

| File | Description |
|------|-------------|
| `index.js` | Express server — single `GET /` route returning JSON |
| `Dockerfile` | Container build instructions |
| `.dockerignore` | Tells Docker to ignore `node_modules` |
| `package.json` | `express` + `dotenv` dependencies |

## Dockerfile

```dockerfile
FROM node
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
CMD ["node", "index.js"]
```

## Running

```bash
# Build the image
docker build -t l1-phase1 .

# Run the container, mapping container port to host
docker run -p 5000:5000 l1-phase1
```

```bash
# Test it
curl http://localhost:5000
# → { "message": "Hello from docker phase 1" }
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Port the server listens on |
