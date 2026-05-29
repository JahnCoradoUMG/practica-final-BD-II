# Frontend — DataOps Control Center

Interfaz React 18 con Vite.

## Estado

- **SCRUM-6**: estructura inicial creada.
- **SCRUM-10**: implementado (shell React, rutas protegidas y layout responsivo).

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

Abre http://localhost:5173

## Alcance SCRUM-10

- Enrutamiento con `react-router-dom`.
- Login contra `POST /api/auth/login`.
- Rutas protegidas para `Dashboard`, `Health Check` y `Sistema`.
- Cliente API para endpoints protegidos:
  - `GET /api/health/metrics/latest`
  - `GET /api/system/info`
