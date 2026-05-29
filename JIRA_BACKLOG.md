# Backlog Jira — DataOps Control Center

| Campo | Valor |
|-------|-------|
| **Sitio** | https://miumg-team-f4691jef.atlassian.net |
| **Proyecto Jira** | SCRUM (JahnTech) |
| **Epic** | [SCRUM-5](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-5) |
| **Filtro** | `labels = dataops` |
| **Total tareas** | 20 (+ 1 Epic) |

> La API de Atlassian no permite crear proyectos nuevos. Todo el backlog vive bajo el Epic **SCRUM-5** en el proyecto **SCRUM**. Para un proyecto dedicado `DOC`, créalo manualmente en Jira → Proyectos → Crear proyecto, y mueve o recrea el Epic.

---

## Orden de implementación recomendado

### Fase 0 — Fundación (bloqueante)

| Orden | Key | Tarea |
|-------|-----|-------|
| 1 | [SCRUM-6](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-6) | DOC-0.1 Repositorio + README ✅ |
| 2 | [SCRUM-7](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-7) | DOC-0.2 DDL metadatos ✅ |
| 3 | [SCRUM-8](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-8) | DOC-0.3 Docker Compose ✅ |
| 4 | [SCRUM-9](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-9) | DOC-0.4 API Node + JWT + Swagger ✅ |
| 5 | [SCRUM-10](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-10) | DOC-0.5 Frontend React shell ✅ |

### Fase 1 — Módulos funcionales (1→9)

| Orden | Key | Módulo | Peso evaluación |
|-------|-----|--------|-----------------|
| 6 | [SCRUM-11](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-11) | Registro de motores ✅ | Arquitectura |
| 7 | [SCRUM-12](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-12) | Health Check ✅ | — |
| 8 | [SCRUM-13](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-13) | Slow Query Analyzer ✅ | **25%** |
| 9 | [SCRUM-14](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-14) | Concurrencia / deadlocks ✅ | **25%** |
| 10 | [SCRUM-15](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-15) | Backup FULL/DIFF/INC ✅ | **20%** |
| 11 | [SCRUM-16](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-16) | Azure Blob upload ✅ | **20%** |
| 12 | [SCRUM-17](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-17) | Replicación + CAP ✅ | **25%** |
| 13 | [SCRUM-18](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-18) | Caché Redis ✅ | — |
| 14 | [SCRUM-19](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-19) | Power BI (5 vistas) ✅ | **20%** |
| 15 | [SCRUM-20](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-20) | Motor de alertas ✅ | **20%** |

### Fase 2 — Infraestructura transversal

| Orden | Key | Tarea |
|-------|-----|-------|
| 16 | [SCRUM-21](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-21) | Conectores multi-motor ✅ |
| 17 | [SCRUM-22](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-22) | Prometheus + Grafana ✅ |

### Fase 3 — Cierre y entregables

| Orden | Key | Tarea |
|-------|-----|-------|
| 18 | [SCRUM-23](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-23) | Pruebas E2E ✅ |
| 19 | [SCRUM-24](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-24) | Informe técnico PDF ✅ |
| 20 | [SCRUM-25](https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-25) | Demo en vivo ✅ |

---

## Vista rápida en Jira

- **Board del Epic:** https://miumg-team-f4691jef.atlassian.net/browse/SCRUM-5
- **JQL backlog:** `parent = SCRUM-5 ORDER BY key ASC`
- **JQL por etiqueta:** `project = SCRUM AND labels = dataops`

---

## Próximo paso sugerido

Siguiente paso recomendado: cierre final del Epic **SCRUM-5** y ensayo de defensa con `docs/DEMO-GUION.md`.
