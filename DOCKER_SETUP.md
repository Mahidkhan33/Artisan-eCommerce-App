# Docker Deployment Guide for Artisan Alley

This project uses an optimized multi-stage Dockerfile designed specifically for Next.js 14+ Applications using the `standalone` output mode. This reduces the container size drastically.

## Prerequisites
- Docker & Docker Compose installed on your system.

## Environment Variables
Ensure you have a `.env` file at the root of the project. Docker will automatically read from it.
The `docker-compose.yml` defaults to launching its own internal MongoDB container (`mongodb:27017`), but if you have a valid cloud Atlas `MONGO_URI` in your `.env`, it will override the local connection and use that instead.

## Getting Started

### 1. Build and Spin Up Containers
Run the following command in the root directory:
```bash
docker-compose up --build -d
```
This will:
- Spin up a MongoDB 7.0 container (data will persist via Docker volumes).
- Build the optimized Next.js Docker image.
- Start the application on `http://localhost:3000`.

### 2. View Logs
To watch the live logs of your Next.js application:
```bash
docker-compose logs -f app
```

### 3. Tear Down
To stop and remove the containers:
```bash
docker-compose down
```
*(Note: Your MongoDB database data will persist locally even if the container goes down. If you want to wipe the local database volume entirely, run `docker-compose down -v`)*
