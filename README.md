# Todo App (NestJS + React + Postgres)

This is a small full-stack Todo application.  
Backend is in **NestJS** with Prisma and JWT auth, frontend is in **React (Vite + Redux)**, and database is **PostgreSQL**.

---

1. In the `todo-api` folder:
   - Rename `.env.template` → `.env.docker`
   - Make sure `OPENAI_API_KEY` is set to your OpenAI token.
2. In the `todo-web` folder:
   - Rename `.env.template` → `.env.local`
3. From the project root, build and start:
   ```bash
   docker compose up -d --build
   ```
4. Frontend will be available at **http://localhost:3334**  
   Backend API is at **http://localhost:3333**  
   Postgres runs on port **5432** inside the container.

First time it starts, Prisma migrations are applied automatically.

---

## Notes

- Login/Register returns a JWT token. It’s stored in `localStorage` on the frontend.
- Todos are user-scoped. Each user sees only their own list.
- There’s a small AI suggestion button when typing todos (calls `/ai/suggest` endpoint).
- Default accounts are not created — just register a new user from the UI.
