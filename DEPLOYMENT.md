# Deployment

Deploy this project as two separate services:

## Backend: Render

Use `render.yaml` from the repository root.

Required Render environment variables:

- `ADMIN_PASSWORD`: admin login password
- `CORS_ORIGINS`: Vercel frontend URL, for example `https://your-project.vercel.app`

Render will expose the Socket.IO backend URL, for example:

```text
https://quizroom-api.onrender.com
```

## Frontend: Vercel

Import the same GitHub repository into Vercel and keep the project root as the repository root. Vercel will use `vercel.json`.

Required Vercel environment variable:

- `VITE_SOCKET_URL`: Render backend URL, for example `https://quizroom-api.onrender.com`

The frontend build output is `frontend/dist`.
