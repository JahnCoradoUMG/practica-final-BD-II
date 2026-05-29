# DataOps Control Center

Plataforma centralizada de monitoreo, gestión y recuperación de bases de datos empresariales.

**Práctica Final — Base de Datos II (UMG)**  
Inspirada en Oracle Enterprise Manager, SQL Monitor y Grafana.

| Documento | Descripción |
|-----------|-------------|
| [SystemBrief.md](./SystemBrief.md) | Visión, alcance y arquitectura |
| [JIRA_BACKLOG.md](./JIRA_BACKLOG.md) | Backlog y orden de tareas (Epic SCRUM-5) |
| [docs/adr/001-stack-tecnologico.md](./docs/adr/001-stack-tecnologico.md) | Decisiones de stack (ADR 001) |
| [docs/database/SCHEMA.md](./docs/database/SCHEMA.md) | Esquema DDL PostgreSQL (SCRUM-7) |
| [docs/observability/README.md](./docs/observability/README.md) | Prometheus, Grafana, Alertmanager (SCRUM-22) |
| [docs/TEST-PLAN.md](./docs/TEST-PLAN.md) | Plan y checklist E2E (SCRUM-23) |

---

## Stack

| Capa | Tecnología |
|------|------------|
| Backend | Node.js 20+ · Express · JWT · Swagger |
| Frontend | React 18+ · Vite |
| Metadatos | PostgreSQL 16+ |
| Caché | Redis 7+ |
| Monitoreo | Prometheus · Grafana |
| Backup remoto | Azure Blob Storage |
| BI | Power BI |
| Infra | Docker · Docker Compose |

---

## Requisitos previos

Instalar en el equipo de desarrollo:

| Herramienta | Versión mínima | Verificación |
|-------------|----------------|--------------|
| [Node.js](https://nodejs.org/) | 20 LTS | `node -v` |
| [npm](https://www.npmjs.com/) | 10+ | `npm -v` |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 24+ | `docker -v` |
| [Docker Compose](https://docs.docker.com/compose/) | v2 | `docker compose version` |
| [Git](https://git-scm.com/) | 2.40+ | `git -v` |

Opcional según módulos:

| Herramienta | Uso |
|-------------|-----|
| [Azure CLI](https://learn.microsoft.com/azure/cli/) o cuenta Azure | Backups en Blob Storage (Módulo 5) |
| [Power BI Desktop](https://powerbi.microsoft.com/desktop/) | Dashboards ejecutivos (Módulo 8) |
| Cliente SMTP o [Mailtrap](https://mailtrap.io/) | Pruebas de alertas por correo (Módulo 9) |

---

## Estructura del proyecto

```
practica_final/
├── backend/          # API REST — orquestación y conectores BD
├── frontend/         # UI React — dashboards y formularios
├── docker/           # docker-compose.yml, init SQL, Prometheus, Grafana
├── docs/             # ADR, informe técnico, guiones de demo
├── backups/          # Respaldos locales (no versionado)
├── .env.example      # Plantilla de variables de entorno
├── SystemBrief.md
└── JIRA_BACKLOG.md
```

---

## Inicio rápido

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repositorio>
cd practica_final

# Variables de entorno
cp .env.example .env
# Editar .env con valores locales (JWT_SECRET, contraseñas, etc.)

# Backend (cuando esté implementado — SCRUM-9)
cd backend
npm install
cd ..

# Frontend (SCRUM-10)
cd frontend
npm install
cd ..
```

### 2. Levantar toda la plataforma con Docker (SCRUM-7 + SCRUM-8)

**Todo corre en contenedores.** Al primer `up`, PostgreSQL ejecuta automáticamente `001_schema.sql` y `002_seed.sql` desde `docker/init/`.

```powershell
# Desde la raíz del proyecto
Copy-Item .env.example .env   # solo la primera vez
docker compose -f docker/docker-compose.yml up -d --build

# O con script helper
.\scripts\docker-up.ps1
```

Verificar que el DDL se aplicó:

```powershell
docker exec dataops-postgres-metadata psql -U dataops -d dataops_metadata -c "\dt"
```

Detener la stack:

```powershell
docker compose -f docker/docker-compose.yml down
# o: .\scripts\docker-down.ps1
```

Modelo de datos: [docs/database/SCHEMA.md](./docs/database/SCHEMA.md).

### Pruebas E2E (SCRUM-23)

Con la stack Docker en ejecución:

```powershell
.\scripts\run-e2e-tests.ps1
```

Evidencias JSON en `docs/e2e/evidence/`. Ver [docs/TEST-PLAN.md](./docs/TEST-PLAN.md).

### Informe técnico PDF (SCRUM-24)

- Entregable: [docs/informe-tecnico.pdf](docs/informe-tecnico.pdf)  
- Fuente editable: [docs/informe-tecnico.md](docs/informe-tecnico.md)  
- Regenerar: `.\scripts\generate-informe-pdf.ps1` (requiere Python 3 + `fpdf2`)

| Servicio | URL / Puerto |
|----------|----------------|
| Frontend (React shell) | http://localhost:5173 |
| API + Swagger | http://localhost:3000/api-docs |
| API health | http://localhost:3000/health |
| Métricas Prometheus (API) | http://localhost:3000/metrics |
| Postgres exporter | http://localhost:9187/metrics |
| PostgreSQL metadatos | localhost:5432 |
| PostgreSQL prueba | localhost:5433 |
| Redis | localhost:6379 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin / admin) |
| Alertmanager | http://localhost:9093 |

> `000_create_database.sql` es solo referencia manual; **en Docker no se usa** — la imagen oficial crea usuario y BD con `POSTGRES_*`.

### 3. Ejecutar en desarrollo (fuera de Docker, opcional)

```bash
# Terminal 1 — API
cd backend && npm run dev

# Terminal 2 — UI
cd frontend && npm run dev
```

URLs previstas:

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api-docs |
| Grafana | http://localhost:3001 |
| Prometheus | http://localhost:9090 |

---

## Módulos funcionales

| # | Módulo | Ticket Jira |
|---|--------|-------------|
| 1 | Registro de motores | SCRUM-11 |
| 2 | Health Check automático | SCRUM-12 |
| 3 | Slow Query Analyzer | SCRUM-13 |
| 4 | Concurrencia / deadlocks | SCRUM-14 |
| 5 | Backup + Azure Blob | SCRUM-15, SCRUM-16 |
| 6 | Replicación + CAP | SCRUM-17 |
| 7 | Caché Redis | SCRUM-18 |
| 8 | Power BI | SCRUM-19 |
| 9 | Motor de alertas | SCRUM-20 |
| — | Observabilidad (Prometheus/Grafana) | SCRUM-22 |

Estado actual del repositorio: **Fases 0–2 en progreso** — ver [JIRA_BACKLOG.md](./JIRA_BACKLOG.md).

---

## Seguridad

- No commitear `.env`, credenciales ni archivos en `backups/`.
- Usar `CREDENTIALS_ENCRYPTION_KEY` para cifrar passwords de motores en `CONNECTIONS`.
- Rotar `JWT_SECRET` en entornos distintos a desarrollo.

---

## Entregables académicos

| Entregable | Ubicación prevista |
|------------|-------------------|
| Código fuente + README | Este repositorio |
| Docker Compose | `docker/docker-compose.yml` |
| Informe técnico PDF | `docs/informe-tecnico.pdf` |
| Demo en vivo | `docs/DEMO-GUION.md` |

---

## Licencia y autoría

Proyecto académico individual — Base de Datos II, UMG.
