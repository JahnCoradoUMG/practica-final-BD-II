# Guion para video explicativo — DataOps Control Center

Guía paso a paso para grabar un video del proyecto. Cada bloque indica **qué decir**, **dónde hacer clic** y **qué deberías ver**.

---

## Antes de grabar (15 minutos)

### 1. Levantar la plataforma

```powershell
# Desde la raíz del proyecto
docker compose -f docker/docker-compose.yml up -d --build
docker compose -f docker/docker-compose.yml ps
```

Todos los servicios deben estar `Up`. Si alguno falla:

```powershell
docker compose -f docker/docker-compose.yml logs api --tail 30
```

### 2. Credenciales que usarás en el video

| Sistema | Usuario | Contraseña | URL |
|---------|---------|------------|-----|
| **Frontend + API** | `admin` | `admin123` | http://localhost:5173 |
| **Swagger (API)** | mismo login vía `/api/auth/login` | | http://localhost:3000/api-docs |
| **Grafana** | `admin` | `admin` | http://localhost:3001 |

### 3. Datos para registrar un motor de prueba

Cuando la API corre **en Docker** (caso normal), usa estos valores en el formulario de **Motores BD**:

| Campo | Valor |
|-------|-------|
| Nombre | `PG-Demo-Video` |
| Motor | `POSTGRESQL` |
| Host | `postgres-test` |
| Puerto | `5432` |
| Database | `testdb` |
| Usuario | `testuser` |
| Contraseña | `testpass` |

> Si corres la API **fuera de Docker** (`npm run dev` en tu PC), cambia Host a `localhost` y Puerto a `5433`.

### 4. Orden lógico del video

Muchos módulos dependen de tener al menos **1 motor registrado**. Para replicación necesitas **2 motores**. Registra primero los motores y luego recorre el menú lateral.

```
Login → Dashboard → Motores BD → Health → Slow Queries → Concurrencia
→ Backups → Replicación → Cache → Alertas → Power BI → Sistema → (opcional) Grafana
```

---

## Bloque 0 — Introducción (1–2 min)

**Qué decir:**
> "Este es DataOps Control Center: una plataforma para monitorear, administrar y recuperar bases de datos. Usa React en el frontend, Node.js en el backend, PostgreSQL para metadatos, Redis para caché, y Prometheus/Grafana para observabilidad. Todo se levanta con Docker Compose."

**Qué mostrar:**
- Abrir `README.md` o la carpeta del proyecto (opcional).
- Abrir http://localhost:5173

---

## Bloque 1 — Login (30 seg)

**Dónde:** http://localhost:5173/login

**Qué hacer:**
1. Usuario: `admin`
2. Contraseña: `admin123`
3. Clic en iniciar sesión

**Qué deberías ver:**
- Redirección a `/dashboard`
- Menú lateral con todas las secciones
- Arriba a la derecha: pill con `admin`

**Qué decir:**
> "La autenticación es JWT. El frontend guarda el token y lo envía en cada petición a la API."

---

## Bloque 2 — Dashboard (1 min)

**Dónde:** Menú lateral → **Dashboard** (`/dashboard`)

**Qué mostrar:**
- Tarjetas de acceso rápido (Motores, Health, Sistema)
- Tabla de conexiones registradas (puede estar vacía al inicio)

**Qué decir:**
> "Este es el panel principal. Desde aquí accedemos a cada módulo funcional del System Brief."

---

## Bloque 3 — Módulo 1: Registro de motores (2–3 min)

**Dónde:** Menú lateral → **Motores BD** (`/connections`)

### Paso A — Probar conexión antes de guardar

1. Llenar el formulario con los datos de la tabla de arriba (`PG-Demo-Video`, etc.)
2. Clic en **Test conexión**
3. Esperar mensaje verde: `OK: ...`

**Qué decir:**
> "Primero validamos conectividad en tiempo real. Las contraseñas se cifran antes de guardarse en PostgreSQL metadatos."

### Paso B — Registrar el motor

4. Clic en **Registrar**
5. Ver la fila nueva en la tabla con estado `ACTIVE`

### Paso C — (Opcional) Segundo motor para replicación

Repite con otro nombre, por ejemplo `PG-Demo-Replica` (mismos host/puerto/credenciales).

**Qué decir:**
> "El sistema soporta Oracle, SQL Server y PostgreSQL mediante conectores adapter. Aquí registro motores heterogéneos en un catálogo central."

---

## Bloque 4 — Módulo 2: Health Check (2 min)

**Dónde:** Menú lateral → **Health Check** (`/health`)

**Qué mostrar:**
- Tabla superior: última métrica por conexión (CPU, memoria, conexiones, estado)
- Tabla inferior: historial de capturas

**Qué decir:**
> "Un job en background captura métricas cada minuto y clasifica el estado en HEALTHY, WARNING o CRITICAL según umbrales configurables."

**Si la tabla superior está vacía:**
- Espera ~1 minuto y recarga la página, **o**
- En Swagger (http://localhost:3000/api-docs): `POST /api/health/run` con token Bearer

**Qué deberías ver:**
- Filas con tu conexión `PG-Demo-Video`
- Columna **Estado** con pill de color (healthy/warning/critical)

---

## Bloque 5 — Módulo 3: Slow Query Analyzer (2 min)

**Dónde:** Menú lateral → **Slow Queries** (`/queries`)

**Qué hacer:**
1. Clic en **Generar muestras**
2. Ver la tabla llenarse con queries clasificadas (`SLOW`, `CRITICAL`, etc.)
3. Elegir una fila con duración alta (ej. > 2000 ms)
4. Clic en **Optimizar** en esa fila
5. Recargar visualmente: columna **Antes/Después** debe mostrar menor tiempo

**Qué decir:**
> "Detectamos consultas lentas, mostramos el plan de ejecución, aplicamos optimización con índice sugerido, y comparamos tiempos antes y después."

**Qué deberías ver:**
- `2317 ms` → `463 ms` (aprox., según datos generados)
- Mejora visible en la columna Antes/Después

---

## Bloque 6 — Módulo 4: Concurrencia y deadlocks (2 min)

**Dónde:** Menú lateral → **Concurrencia** (`/tx`)

**Qué hacer:**
1. Clic en **Simular 100 usuarios**
2. Esperar unos segundos
3. Observar contadores arriba: Total, Deadlocks, Wait avg
4. Bajar a la tabla y filtrar visualmente filas con `DEADLOCK` en columna Lock

**Qué decir:**
> "Simulamos carga concurrente. El sistema registra sesiones, tiempos de espera, tipos de bloqueo y deadlocks resueltos en la tabla tx_log."

**Qué deberías ver:**
- Total ≥ 100 (acumulado si repites)
- Deadlocks > 0
- Filas con `lock_type = DEADLOCK` y `Resuelto = Sí` en algunos casos

---

## Bloque 7 — Módulo 5: Backups FULL / DIFF / INC (3 min)

**Dónde:** Menú lateral → **Backups** (`/backups`)

**Qué hacer:**
1. En el desplegable, elegir tu motor (`PG-Demo-Video`)
2. Clic en **FULL** → esperar fila nueva en historial
3. Clic en **DIFF** → nueva fila enlazada al FULL
4. Clic en **INC** → nueva fila incremental
5. (Opcional) Clic en **Snapshot PRE_DEPLOY**
6. Clic en **Simular restore** → narrar recuperación post "DROP TABLE"

**Qué decir:**
> "Ejecutamos la cadena FULL, diferencial e incremental. Cada backup guarda hash SHA-256, RPO, RTO y cumplimiento SLA. Si Azure está configurado, aparece URL remota; si no, el backup queda local en la carpeta backups/."

**Qué deberías ver en la tabla:**

| Columna | Qué explicar |
|---------|--------------|
| Tipo | FULL, DIFF, INC |
| Estado | SUCCESS |
| RPO / RTO | Objetivos ~15 min / ~45 min |
| SLA | Sí / No |
| URL remoto | Enlace Blob si Azure configurado, sino `-` |

---

## Bloque 8 — Módulo 6: Replicación y CAP (2 min)

**Dónde:** Menú lateral → **Replicación** (`/replication`)

**Requisito:** al menos 2 motores registrados.

**Qué hacer:**
1. Clic en **Capturar escenarios 2s/5s/20s**
2. Ver 3 filas nuevas con escenarios NORMAL, MEDIUM, HIGH

**Qué decir:**
> "Medimos lag entre primario y réplica. NORMAL ~2 s es aceptable, MEDIUM ~5 s advertencia, HIGH ~20 s crítico. En CAP priorizamos disponibilidad en telemetría y consistencia fuerte en metadatos administrativos."

**Qué deberías ver:**

| Escenario | Lag aprox. | Estado |
|-----------|------------|--------|
| NORMAL | ~2 s | ACCEPTABLE |
| MEDIUM | ~5 s | WARNING |
| HIGH | ~20 s | CRITICAL |

Documento de apoyo: `docs/database/CAP_ANALYSIS.md`

---

## Bloque 9 — Módulo 7: Caché Redis (1–2 min)

**Dónde:** Menú lateral → **Cache Redis** (`/cache`)

**Qué hacer:**
1. Clic en **Probar endpoint cacheado** varias veces (3–5 veces)
2. Observar texto: `Hit: Sí` en llamadas repetidas
3. Ver **Hit ratio** subir (objetivo > 50 %)
4. (Opcional) Clic en **Invalidar cache** y repetir prueba

**Qué decir:**
> "Sin caché la respuesta tarda ~400 ms; con Redis ~40 ms. El hit ratio mide cuántas consultas frecuentes se sirven desde memoria."

**Qué deberías ver:**
- Primera llamada: `Hit: No`
- Siguientes: `Hit: Sí`
- Hit ratio aumentando (ej. 88 %)

---

## Bloque 10 — Módulo 9: Motor de alertas (2 min)

**Dónde:** Menú lateral → **Alertas** (`/alerts`)

**Qué hacer:**
1. Sección **Reglas**: mostrar reglas precargadas (CPU_HIGH, BACKUP_FAILED, etc.)
2. Clic en **Evaluar reglas**
3. Bajar a **Historial**: ver alertas con estado `OPEN`
4. En una alerta: clic **Ack**, luego **Resolver**

**Qué decir:**
> "Las reglas son configurables sin redeploy. El motor evalúa métricas de health, backups y replicación. También recibe webhooks de Prometheus/Alertmanager."

**Truco para forzar alertas (opcional, vía Swagger):**
- `POST /api/backups/record-failure` con `{ "dbId": 1 }`
- Luego **Evaluar reglas** en la UI

---

## Bloque 11 — Módulo 8: Power BI (1 min)

**Dónde:** Menú lateral → **Power BI** (`/bi`)

**Qué mostrar:**
- Checklist de 5 vistas obligatorias en pantalla
- Abrir `docs/bi/POWERBI_GUIDE.md` si tienes el archivo .pbix

**Qué decir:**
> "Power BI consume los metadatos de PostgreSQL o exportaciones CSV de la API. Las cinco vistas cubren SLA, queries lentas, replicación, backups y alertas."

---

## Bloque 12 — Sistema e infraestructura (2 min)

**Dónde:** Menú lateral → **Sistema** (`/system`)

**Qué mostrar:**
- Estado de API, base de datos y conectores registrados

**Opcional — Swagger:**
- http://localhost:3000/api-docs
- Mostrar endpoints agrupados por módulo

**Opcional — Observabilidad:**
- Grafana http://localhost:3001 → dashboards `DataOps - Health Metrics` y `DataOps - Replicación`
- Prometheus http://localhost:9090/targets → targets `dataops-api` y `postgres-metadata` en UP
- Métricas crudas: http://localhost:3000/metrics

**Qué decir:**
> "La observabilidad complementa la UI: Prometheus scrapea la API, Grafana visualiza, y Alertmanager reenvía alertas al motor propio."

---

## Bloque 13 — Cierre (1 min)

**Qué decir:**
> "Resumiendo: registramos motores con credenciales cifradas, monitoreamos salud, optimizamos queries, simulamos concurrencia, ejecutamos backups con RPO/RTO, medimos lag de replicación, aceleramos consultas con Redis, gestionamos alertas y exponemos KPIs en Power BI. Todo está documentado en el informe técnico PDF y probado con 8 escenarios E2E."

**Qué mostrar (opcional):**
- `docs/informe-tecnico.pdf`
- `docs/e2e/evidence/` (JSON de pruebas)

---

## Mapa rápido: menú UI → módulo → ticket

| Menú lateral | Módulo | Ticket |
|--------------|--------|--------|
| Motores BD | Registro de motores | SCRUM-11 |
| Health Check | Health automático | SCRUM-12 |
| Slow Queries | Análisis de queries | SCRUM-13 |
| Concurrencia | Deadlocks / TX | SCRUM-14 |
| Backups | FULL/DIFF/INC + restore | SCRUM-15 |
| Replicación | Lag + CAP | SCRUM-17 |
| Cache Redis | Hit/miss | SCRUM-18 |
| Alertas | Motor de alertas | SCRUM-20 |
| Power BI | BI ejecutivo | SCRUM-19 |
| Sistema | Info API + conectores | SCRUM-9/21 |
| (externo) Grafana/Prometheus | Observabilidad | SCRUM-22 |

---

## Si algo falla durante la grabación

| Problema | Solución rápida |
|----------|-----------------|
| Login falla | Verificar API: http://localhost:3000/health |
| Test conexión falla | Usar `postgres-test:5432` (Docker) o `localhost:5433` (API local) |
| Health vacío | Esperar 1 min o `POST /api/health/run` en Swagger |
| Replicación sin datos | Registrar 2 motores primero |
| Cache hit ratio bajo | Clic **Probar endpoint cacheado** 5+ veces |
| Frontend caído | Continuar en Swagger http://localhost:3000/api-docs |
| Reiniciar API | `docker compose -f docker/docker-compose.yml restart api` |

---

## Duración sugerida del video

| Versión | Tiempo | Qué incluir |
|---------|--------|-------------|
| **Completa** | 18–20 min | Todos los bloques 0–13 |
| **Media** | 12–15 min | Bloques 1, 3–10, 13 (sin Grafana/Swagger) |
| **Corta** | 8–10 min | Login + Motores + Health + Queries + Backups + Alertas + cierre |

---

## Checklist antes de subir el video

- [ ] Se ve el login con `admin`
- [ ] Se registró al menos 1 motor con test OK
- [ ] Se mostró optimización de slow query (antes/después)
- [ ] Se ejecutó cadena FULL → DIFF → INC
- [ ] Se mencionó RPO/RTO o simuló restore
- [ ] Se mostró lag de replicación (3 escenarios)
- [ ] Se demostró cache hit
- [ ] Se disparó o mostró al menos 1 alerta
- [ ] Se mencionó Power BI o informe técnico
