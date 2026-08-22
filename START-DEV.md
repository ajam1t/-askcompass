# Mithila Jodi — How to start the dev server

## First-time setup

1. Copy the env file:
   ```
   copy apps\web\.env.example apps\web\.env.local
   ```
   Then open `apps\web\.env.local` and fill in your Supabase dev project credentials.

2. Install dependencies (if not already done):
   ```
   C:\Users\amit.manoj.jha\node-portable\node-v22.17.1-win-x64\npm.cmd install
   ```

## Start the app

Run from the `mithila-jodi` root folder:

```
C:\Users\amit.manoj.jha\node-portable\node-v22.17.1-win-x64\npm.cmd run dev
```

This starts Next.js on http://localhost:3000

## Design foundation (original HTML mockups)

Still available in the `design-foundation/` folder.
Serve them with the original Node server if needed:

```
C:\Users\amit.manoj.jha\node-portable\node-v22.17.1-win-x64\node.exe design-foundation/serve-helper.js
```

## Supabase local dev

Install Supabase CLI, then:
```
supabase start
supabase db push
```
(See supabase/config.toml for local config)
