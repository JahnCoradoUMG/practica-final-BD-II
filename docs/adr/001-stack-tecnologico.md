# ADR 001 — Stack tecnológico

| Campo | Valor |
|-------|-------|
| **Estado** | Aceptado |
| **Fecha** | 2026-05-25 |
| **Ticket** | SCRUM-6 (DOC-0.1) |
| **Referencia** | SystemBrief.md, DataOps-Control-Center.pdf |

## Contexto

La práctica final **DataOps Control Center** exige una plataforma multi-motor con monitoreo, backup, replicación, caché, BI y alertas, desplegable con **Docker Compose** y modificable en vivo durante la defensa oral.

Se evalúan: calidad de arquitectura por capas (20%), módulos de BD (25%), backup + nube (20%), BI + monitoreo (20%) e informe técnico (15%).

## Decisión

Adoptar el siguiente stack:

| Capa | Tecnología | Versión objetivo |
|------|------------|------------------|
| **Backend API** | Node.js + Express | Node ≥ 20 LTS |
| **Autenticación** | JWT (`jsonwebtoken`) | — |
| **Documentación API** | Swagger / OpenAPI (`swagger-ui-express`) | OpenAPI 3 |
| **Frontend** | React | 18+ |
| **Build frontend** | Vite | 5+ |
| **BD metadatos** | PostgreSQL | 16+ |
| **Caché** | Redis | 7+ |
| **Monitoreo** | Prometheus + Grafana | Última estable en Compose |
| **Alertas** | Motor propio + Alertmanager | Integración progresiva |
| **Backup remoto** | Azure Blob Storage | SDK `@azure/storage-blob` |
| **BI** | Power BI Desktop / Service | Conexión a PostgreSQL o export |
| **Contenedores** | Docker + Docker Compose | Obligatorio |

### Motores monitoreados (conectores)

- PostgreSQL (`pg`)
- Microsoft SQL Server (`mssql` / `tedious`)
- Oracle (`oracledb`)

Patrón **adapter**: interfaz común en backend; un módulo por motor.

## Alternativas consideradas

| Alternativa | Motivo de descarte |
|-------------|-------------------|
| .NET 8 Web API | Válida en el PDF; se elige Node.js por alineación con stack del estudiante y rapidez de iteración en demo en vivo |
| Python (FastAPI) | Válida; menor integración unificada JS full-stack con React |
| Amazon S3 en lugar de Azure | PDF permite ambos; Azure seleccionado por disponibilidad de cuenta académica (ajustable vía `.env`) |
| Angular / Vue | React 18+ por ecosistema de dashboards y curva de integración con Vite |

## Consecuencias

### Positivas

- Un solo lenguaje (TypeScript/JavaScript) en frontend y backend reduce contexto.
- Express + capas (routes → controllers → services → repositories) cumple separación del System Brief.
- PostgreSQL centraliza `CONNECTIONS`, `DB_METRICS`, `QUERY_LOG`, `TX_LOG`, `BACKUP_HISTORY`, `ALERT_LOG`.
- Docker Compose unifica API, UI, Redis, Prometheus, Grafana y motores de prueba.

### Negativas / riesgos

- Oracle en contenedor requiere imagen pesada o instancia externa; se documentará stub o conexión opcional.
- Cifrado de credenciales es responsabilidad de la aplicación (`CREDENTIALS_ENCRYPTION_KEY`).
- Power BI queda fuera del Compose; se documenta conexión de datos en README.

## Estructura de repositorio

```
practica_final/
├── backend/          # API Node.js + Express
├── frontend/         # React 18 + Vite
├── docker/           # Compose, init SQL, configs Prometheus/Grafana
├── docs/             # ADR, informe, guiones de demo
├── backups/          # (gitignored) respaldos locales
├── .env.example
├── README.md
└── SystemBrief.md
```

## Criterios de cumplimiento (SCRUM-6)

- [x] Estructura de carpetas creada
- [x] README con prerequisitos e instalación inicial
- [x] `.env.example` sin secretos reales
- [x] `.gitignore` para node_modules, .env y backups
- [x] ADR documentando decisiones de stack

## Actualización SCRUM-7

- DDL en `docker/init/001_schema.sql` validado contra PostgreSQL 16.
- Documentación: `docs/database/SCHEMA.md`.

## Referencias

- [SystemBrief.md](../../SystemBrief.md)
- [JIRA Epic SCRUM-5](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-5)
