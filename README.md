# ProjeX Frontend

Web client for ProjeX, a platform where developers publish their projects and take part in hackathons.

![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_7-CA4245?logo=reactrouter&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

**Live demo:** [projex-frontend-hazel.vercel.app](https://projex-frontend-hazel.vercel.app)

## Related repositories

| Repository | Role |
| --- | --- |
| [projex-frontend](https://github.com/XXXDoriXXX/projex-frontend) | This repo. React web client. |
| [projex-backend](https://github.com/XXXDoriXXX/projex-backend) | REST API (Express, Prisma, PostgreSQL) that this client is built for. Its CORS settings already allow `http://localhost:5173` and the live demo. |

## Current status

This project is in early development. What exists today:

- Home page and login page with email and password fields and social login buttons, in a dark theme.
- Reusable UI components (button, form input, social button, text and form display).
- Routing with React Router (`/`, `/login`).

Pages for projects, dashboard, profile and registration are created as empty placeholders and are not routed yet. The client does not call the backend API yet.

## Tech stack

React 19, TypeScript, Vite 7, Tailwind CSS 4, React Router 7, lucide-react and react-icons, ESLint.

## Getting started

Requirements: Node.js and npm.

```bash
git clone https://github.com/XXXDoriXXX/projex-frontend.git
cd projex-frontend
npm install
npm run dev
```

The app opens on `http://localhost:5173`.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Environment variables

The app does not read any environment variables at the moment.

## Deployment

The live demo is hosted on Vercel.
