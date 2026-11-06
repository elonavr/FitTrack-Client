# FitTrack Client

React frontend for the [FitTrack API](../FitTrack-API).

## Stack
- Vite + React 18 + TypeScript
- React Router (routing, protected routes)
- TanStack Query (API data fetching and cache)
- Tailwind CSS 3

## Getting started
1. Start the FitTrack API (default `http://localhost:5001`).
2. `cp .env.example .env` and adjust `VITE_API_URL` if needed.
3. `npm install`
4. `npm run dev` and open http://localhost:5173

## Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck and production build to `dist/` |
| `npm run typecheck` | TypeScript check only |
| `npm run preview` | Serve the production build |

## Structure
```
src/
  lib/          api client, session storage, shared types
  auth/         AuthContext, ProtectedRoute / GuestRoute
  components/   shared UI primitives (Header, Card, Button, Input...)
  features/     feature modules (goals: queries, mutations, components)
  pages/        Landing, Login, Signup, Dashboard
```
