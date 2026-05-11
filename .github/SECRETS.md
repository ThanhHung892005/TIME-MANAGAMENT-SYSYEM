# GitHub Actions — Required Secrets

Go to **Settings → Secrets and variables → Actions** trong repo GitHub và thêm các secrets sau:

## CI/CD Secrets

| Secret | Mô tả | Lấy ở đâu |
|--------|-------|-----------|
| `DOCKERHUB_USERNAME` | Docker Hub username | hub.docker.com → Account Settings |
| `DOCKERHUB_TOKEN` | Docker Hub access token | hub.docker.com → Account Settings → Security |
| `RENDER_BACKEND_DEPLOY_HOOK` | URL deploy hook của Render | Render dashboard → Service → Settings → Deploy Hook |
| `VERCEL_TOKEN` | Vercel API token | vercel.com → Account Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel Org/User ID | `vercel env pull` hoặc `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Vercel Project ID | `vercel link` rồi xem `.vercel/project.json` |

## OAuth Google Secrets (dành cho Render)

Thêm vào **Environment Variables** của service Render:

| Variable | Giá trị |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Từ Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | Từ Google Cloud Console → Credentials |
| `SESSION_SECRET` | Random string dài ≥ 32 ký tự |
| `FRONTEND_URL` | URL production của frontend (Vercel) |
| `JWT_SECRET` | Random string dài ≥ 32 ký tự |

## Hướng dẫn nhanh

### 1. Docker Hub
```bash
# Tạo access token tại hub.docker.com → Account Settings → Security → New Access Token
```

### 2. Render Deploy Hook
1. Tạo Web Service trên render.com, chọn Docker image từ Docker Hub
2. Settings → Deploy Hook → Copy URL

### 3. Vercel
```bash
cd frontend
npm i -g vercel
vercel login
vercel link          # tạo .vercel/project.json
cat .vercel/project.json  # lấy orgId và projectId
```

### 4. Google OAuth (Cloud Console)
1. Vào console.cloud.google.com → APIs & Services → Credentials
2. Create Credentials → OAuth 2.0 Client ID → Web application
3. Authorized redirect URIs: `https://your-backend.onrender.com/api/auth/google/callback`
4. Copy Client ID và Client Secret
