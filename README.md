# Personal Task Manager

A personal productivity app built with React, Vite, and Tailwind CSS.

## Features

- Sign up / log in with credentials saved in the browser (localStorage)
- Live ticking clock in the header
- Add, edit, delete, and complete tasks
- Search and sort tasks by due date or priority
- All data persists across sessions via localStorage — no backend required

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or newer
- npm (comes with Node.js)

### Install & run

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  pages/
    Login.tsx         # Login screen
    Signup.tsx        # Sign-up screen
    TaskManager.tsx   # Main task manager screen
  hooks/
    useAuth.ts        # Auth logic (signup / login / logout)
    useTasks.ts       # Task CRUD (add / edit / delete / toggle)
    useLocalStorage.ts # Generic localStorage hook
    use-toast.ts      # Toast notification hook
  components/
    LiveClock.tsx     # Ticking clock component
    ui/               # shadcn/ui component library
  lib/
    utils.ts          # Tailwind class helper
  App.tsx             # Routing setup
  main.tsx            # Entry point
  index.css           # Global styles and theme
```

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — dev server and bundler
- **Tailwind CSS v4** — styling
- **shadcn/ui** — component library (Radix UI primitives)
- **react-hook-form** + **Zod** — form validation
- **wouter** — client-side routing
- **framer-motion** — animations
- **localStorage** — all data persistence (no backend)
