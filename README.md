# VSR Sales Engine — Web App

React + TypeScript frontend for the VSR Sales Engine lead-hunting tool. Backend, task tracker and all
project docs: [VsrSalesEngineWebApi](https://github.com/shiv10r/VsrSalesEngineWebApi)
(`TASKS.md`, `docs/ARCHITECTURE.md`, `docs/ENGINEERING_RULES.md`, `docs/DEPLOYMENT.md`).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173, proxies /api to http://localhost:5015
npm run build    # type-check + production build
npm test         # node test runner
```

Start the backend first (`dotnet run --project src/VsrSalesEngineWebApi` in the API repo). In development
the sign-in screen has a "Fill the local demo account" button; production builds do not include it.

## Configuration

- `VITE_API_BASE_URL` — backend URL for deployed builds (for example the Render URL).
- The Content-Security-Policy in `vercel.json` and `netlify.toml` allows API calls only to
  `https://vsrsalesenginewebapi.onrender.com`. Change it in both files if the API moves.

## Layout

- `src/App.tsx` — thin shell
- `src/hooks` — state and data loading per area
- `src/components/screens` — one component per page (Dashboard, Agents, Opportunities, ...)
- `src/components/agents` — agent roster, live feed, lead heat map
- `src/services` — one API module per feature
- `tests` — unit and render tests (`*.test.mjs`)

Files stay under 250 lines.
