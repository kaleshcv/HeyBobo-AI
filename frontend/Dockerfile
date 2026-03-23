FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ─── Production image (nginx) ───────────────────────────────
FROM nginx:1.25-alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA routing
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # ── MIME types ────────────────────────────────────────────
    # nginx's built-in mime.types does not include .mjs (ES modules).
    # Without this, .mjs files are served as application/octet-stream
    # and the browser refuses to run them as a Worker.
    include /etc/nginx/mime.types;
    types {
        application/javascript  mjs;
    }

    # ── gzip ──────────────────────────────────────────────────
    gzip on;
    gzip_vary on;
    gzip_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        text/javascript
        application/wasm;

    # ── pdf.worker — no immutable cache (unhashed filename) ───
    location = /pdf.worker.min.mjs {
        add_header Cache-Control "public, max-age=3600";
        add_header Content-Type "application/javascript";
        # Allow SharedArrayBuffer for pdfjs (needed in some browsers)
        add_header Cross-Origin-Opener-Policy "same-origin";
        add_header Cross-Origin-Embedder-Policy "require-corp";
    }

    # ── Hashed assets — long-lived immutable cache ─────────────
    location ~* \.(js|mjs|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|wasm)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # ── SPA fallback ───────────────────────────────────────────
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ── Security headers ───────────────────────────────────────
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
