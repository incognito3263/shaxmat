# Chess Nexus — Deploy to Server with Domain

This guide explains how to deploy **Chess Nexus** to a VPS/cloud server with your own domain and HTTPS.

## Prerequisites

- A VPS (Ubuntu 22.04 recommended) — e.g. DigitalOcean, Linode, AWS EC2, etc.
- A domain name pointing to your server’s IP (A record)
- SSH access to the server

---

## 1. Server Setup

### 1.1 Connect and update

```bash
ssh root@YOUR_SERVER_IP
apt update && apt upgrade -y
```

### 1.2 Install Docker and Docker Compose

```bash
apt install -y docker.io docker-compose
systemctl enable docker
systemctl start docker
```

### 1.3 Install Nginx and Certbot (for SSL)

```bash
apt install -y nginx certbot python3-certbot-nginx
```

---

## 2. Deploy the Application

### 2.1 Clone the project

```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/shaxmat.git
cd shaxmat
```

Or upload the project with `scp` / `rsync`:

```bash
rsync -avz --exclude node_modules --exclude venv ./ user@YOUR_SERVER_IP:/opt/shaxmat/
```

### 2.2 Create production environment file

```bash
cd /opt/shaxmat
nano .env
```

Add:

```env
DATABASE_URL=postgresql://shaxmat_user:shaxmat@db:5432/shaxmat_plus_db
SECRET_KEY=a81860510039c82ea4512ababf16c06551ca7798762acbc380603913e86cbcb3
```

Generate a secret key:

```bash
openssl rand -hex 32
```

### 2.3 Update docker-compose for production

Create `docker-compose.prod.yml` or adjust `docker-compose.yml`:

- Use stronger DB password
- Remove `--reload` from uvicorn
- Optionally add restart policies

### 2.4 Build and run

```bash
docker compose up -d --build
```

Check that containers are running:

```bash
docker compose ps
```

---

## 3. Configure Nginx and Domain

### 3.1 Create Nginx site config

```bash
nano /etc/nginx/sites-available/chess-nexus
```

Use this config (replace `YOUR_DOMAIN.com` with your domain):

```nginx
server {
    listen 80;
    server_name newchess.uz www.newchess.uz;

    # Frontend (React SPA)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /game {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /signup { proxy_pass http://127.0.0.1:8000; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
    location /login { proxy_pass http://127.0.0.1:8000; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
    location /users { proxy_pass http://127.0.0.1:8000; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
    location /leaderboard { proxy_pass http://127.0.0.1:8000; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
    location /notifications { proxy_pass http://127.0.0.1:8000; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
    location /upload-avatar { proxy_pass http://127.0.0.1:8000; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; client_max_body_size 10M; }
    location /update-profile { proxy_pass http://127.0.0.1:8000; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
    location /uploads { proxy_pass http://127.0.0.1:8000; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }

    # WebSocket
    location /ws {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3.2 Enable site and test

```bash
ln -s /etc/nginx/sites-available/chess-nexus /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 3.3 Obtain SSL certificate

```bash
certbot --nginx -d YOUR_DOMAIN.com -d www.newchess.uz
```

Follow the prompts. Certbot will update Nginx for HTTPS.

---

## 4. Frontend Production Build

The frontend must use the same origin for API and WebSocket in production. The app already uses `window.location.host` in production mode, so when served from your domain it will call the same domain.

Ensure the frontend Docker image is built with production settings (already configured in the Dockerfile).

---

## 5. Firewall

```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

---

## 6. Useful Commands

| Action | Command |
|--------|---------|
| View logs | `docker compose logs -f` |
| Restart | `docker compose restart` |
| Rebuild | `docker compose up -d --build` |
| Stop | `docker compose down` |

---

## 7. Domain DNS

Point your domain to the server:

| Type | Name | Value |
|------|------|-------|
| A | @ | YOUR_SERVER_IP |
| A | www | YOUR_SERVER_IP |

---

## 8. Security Checklist

- [ ] Change `shaxmat_password` in docker-compose
- [ ] Set strong `SECRET_KEY` in `.env`
- [ ] Use HTTPS only (Certbot handles this)
- [ ] Keep the server and Docker images updated
