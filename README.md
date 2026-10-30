# Aprendiendo Juntos 📚

**School management platform** with three roles (admin, teacher and student): classes, subjects, schedules, assignments with submissions and grades, learning resources, observations and dashboards.

> Personal / portfolio project (not used by a real school). Deployed demo: frontend on Vercel, API on Render.
> https://frontend-aprendiendo-juntos.vercel.app

## Architecture

| Folder | What it is | Stack |
| --- | --- | --- |
| [`frontend/`](frontend) | Web app for admins, teachers and students | React 19, Vite, React Router, Axios, Recharts |
| [`api/`](api) | REST API | C# / ASP.NET Core 8, Entity Framework Core, PostgreSQL (Npgsql), JWT |

```
React (Vite) ──► ASP.NET Core API ──► EF Core ──► PostgreSQL
                         └──► Cloudinary (files)
```

## Features

- **Role-based access:** JWT auth with roles (admin / teacher / student) and protected routes per role.
- **Admin:** users, classes, subjects, schedules, resources and observations.
- **Teachers:** create assignments, review submissions, grade them and publish resources.
- **Students:** schedule, assignments, file submissions and resources.
- **Files** uploaded to Cloudinary from the API (credentials kept out of the code, read from configuration).
- **Reports:** charts with Recharts, and export to PDF (jsPDF) and Excel (xlsx).
- Relational model in PostgreSQL (users, roles, classes, subjects, assignments, submissions, grades…) with EF Core.
- Swagger docs, Docker support and architecture diagrams (C4 + ER) in [`frontend/docs`](frontend/docs).

## Run locally

```bash
# API (.NET 8) — set ConnectionStrings:DefaultConnection, Jwt:* and Cloudinary:* with user-secrets
cd api/ApiColegio
dotnet run

# Frontend
cd ../../frontend
cp .env.example .env    # VITE_API_URL=<API url>
npm install && npm run dev
```

---
Built by **Juan Mendoza** · [GitHub](https://github.com/Juaned2021)
