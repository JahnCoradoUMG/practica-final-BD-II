# System Brief — DataOps Control Center


| Campo                     | Valor                                 |
| ------------------------- | ------------------------------------- |
| **Proyecto**              | DataOps Control Center                |
| **Tipo**                  | Práctica Final — Base de Datos II     |
| **Versión del documento** | 1.0                                   |
| **Fecha**                 | Mayo 2026                             |
| **Rol de referencia**     | Arquitecto de Software / DBA Engineer |


---

## 1. Resumen ejecutivo

**DataOps Control Center** es una plataforma centralizada de monitoreo, gestión y recuperación de bases de datos empresariales. El estudiante debe construir un sistema que opere sobre **múltiples motores de BD simultáneamente** (Oracle, SQL Server, PostgreSQL), genere **métricas en tiempo real** y responda de forma **autónoma** ante eventos críticos.

La plataforma está inspirada en herramientas de nivel empresarial como **Oracle Enterprise Manager**, **SQL Monitor** y **Grafana**, e integra administración avanzada, replicación, concurrencia, respaldo, caché, BI y alertas en un único ecosistema desplegable con **Docker Compose**.

---

## 2. Problema y oportunidad

### 2.1 Problema

En entornos empresariales de alta disponibilidad, la administración de bases de datos se fragmenta entre:

- Herramientas distintas por motor (Oracle, SQL Server, PostgreSQL).
- Métricas dispersas sin correlación centralizada.
- Respuesta manual ante deadlocks, fallos de backup o degradación de rendimiento.
- Falta de visibilidad ejecutiva (SLA, RPO/RTO, disponibilidad global).

### 2.2 Solución propuesta

Un **centro de control unificado** que:

1. Registre y valide conexiones a motores heterogéneos.
2. Supervise salud y rendimiento de forma continua.
3. Automatice respaldos (local + nube) y recuperación ante desastres.
4. Simule y analice concurrencia, replicación y caché.
5. Exponga KPIs en dashboards BI y dispare alertas configurables.

---

## 3. Objetivo general

Desarrollar una plataforma que cubra los **pilares de administración de BD en entornos de alta disponibilidad**:


| Pilar                       | Descripción                                                         |
| --------------------------- | ------------------------------------------------------------------- |
| **Monitoreo activo**        | CPU, memoria, conexiones, bloqueos en tiempo real                   |
| **Análisis de rendimiento** | Consultas lentas, planes de ejecución, optimización indexada        |
| **Backup y recuperación**   | Full / Diferencial / Incremental, snapshots, replicación a nube     |
| **Visualización BI**        | Power BI con KPIs de SLA, top queries, replicación                  |
| **Motor de alertas**        | Correo y notificaciones ante deadlocks, backup fallido, degradación |
| **Replicación distribuida** | Primario-réplica, lag, análisis CAP, consistencia eventual          |


---

## 4. Alcance del sistema

### 4.1 Dentro del alcance (In Scope)

- Registro seguro de motores de BD (credenciales cifradas, nunca en texto plano).
- Health check automático cada minuto con estados Healthy / Warning / Critical.
- Captura y clasificación de consultas lentas con evidencia antes/después de optimización.
- Simulación de ≥100 usuarios concurrentes y detección/resolución de deadlocks.
- Backups FULL, DIFF e INC con cadena de restauración demostrable.
- Snapshots nombrados: `PRE_DEPLOY`, `PRE_TEST`, `PRE_IMPORT`.
- Simulación de desastre (DROP TABLE accidental) con medición de **RPO** y **RTO**.
- Replicación de backups a **Azure Blob Storage** o **Amazon S3** (hash + URL remoto + retención).
- Replicación primario-réplica con medición de lag (2s / 5s / 20s).
- Caché Redis con métricas hit/miss e invalidación (TTL + manual).
- Dashboards Power BI (5 vistas obligatorias).
- Motor de alertas configurable sin redeploy.
- Stack containerizado con Docker Compose.
- Autenticación JWT y documentación OpenAPI/Swagger.

### 4.2 Fuera del alcance (Out of Scope) — implícito

- Soporte a motores distintos de Oracle, SQL Server y PostgreSQL (salvo extensión justificada en informe).
- Multi-tenancy empresarial completo (la práctica es individual).
- Producción en cluster Kubernetes (Docker Compose es el requisito mínimo).

### 4.3 Restricciones

- **Práctica individual**: el estudiante debe explicar y defender todo el código en defensa oral.
- **Modificaciones en vivo**: la tecnología elegida debe permitir cambios durante la demostración.
- **Objetivos orientativos de SLA**: RPO ≈ 15 min, RTO ≈ 45 min (el estudiante debe argumentar cumplimiento).

---

## 5. Arquitectura de referencia

### 5.1 Patrón arquitectónico

Arquitectura en **capas** con separación estricta:

```
┌─────────────────────────────────────────────────────────────┐
│  CAPA DE PRESENTACIÓN                                       │
│  React 18+ / Vue / Angular / Next / TypeScript              │
│  Gráficas en tiempo real · Diseño responsivo                │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST / GraphQL
┌──────────────────────────▼──────────────────────────────────┐
│  CAPA API (Backend)                                         │
│  .NET 8 Web API · Python · Java · C# · Node.js/Express      │
│  Orquestación · JWT · Swagger/OpenAPI                       │
└──────┬──────────────┬──────────────┬────────────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
│ Conectores  │ │ Servicios │ │  Monitoreo  │
│ por motor   │ │ auxiliares│ │  Prometheus │
│ Oracle      │ │ Redis     │ │  Grafana    │
│ SQL Server  │ │ Alert Eng.│ │ Alertmanager│
│ PostgreSQL  │ │ Cloud BK  │ │ Exporters   │
└─────────────┘ └───────────┘ └─────────────┘
       │
┌──────▼──────────────────────────────────────────────────────┐
│  CAPA DE DATOS — Motores registrados + BD de metadatos      │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Principios de diseño


| Principio                     | Aplicación                                                    |
| ----------------------------- | ------------------------------------------------------------- |
| **Separación de capas**       | La UI solo habla con el Backend API                           |
| **Conectores especializados** | Cada motor tiene su adaptador; el backend orquesta            |
| **Procesamiento asíncrono**   | Prometheus, Redis y alertas no bloquean consultas principales |
| **Seguridad por defecto**     | Credenciales en variables de entorno; JWT en API              |
| **Observabilidad**            | Métricas exportadas + logs estructurados + `ALERT_LOG`        |


### 5.3 Integraciones externas


| Servicio                   | Rol                               |
| -------------------------- | --------------------------------- |
| **Prometheus**             | Recolección de métricas           |
| **Grafana**                | Visualización operativa           |
| **Alertmanager**           | Integración con Motor de Alertas  |
| **Redis**                  | Caché de consultas frecuentes     |
| **Azure Blob / Amazon S3** | Almacenamiento remoto de backups  |
| **Power BI**               | Dashboards ejecutivos             |
| **SMTP / correo**          | Notificaciones Warning y Critical |


---

## 6. Módulos funcionales


| #   | Módulo                  | Responsabilidad principal                                | Entidades clave                   |
| --- | ----------------------- | -------------------------------------------------------- | --------------------------------- |
| 1   | Registro de motores     | Alta de conexiones, validación, persistencia segura      | `CONNECTIONS`                     |
| 2   | Health Check automático | Job cada 1 min; estados Healthy/Warning/Critical         | `DB_METRICS`                      |
| 3   | Slow Query Analyzer     | Detección, clasificación, optimización con evidencia     | `QUERY_LOG`                       |
| 4   | Concurrencia            | ≥100 usuarios; deadlocks y resolución                    | `TX_LOG`                          |
| 5   | Backup, Recovery y Nube | FULL/DIFF/INC, snapshots, RPO/RTO, upload cloud          | `BACKUP_HISTORY`                  |
| 6   | Replicación distribuida | Primario-réplica, lag, análisis CAP                      | Métricas de lag                   |
| 7   | Caché Redis             | Hit/miss, TTL, invalidación, comparativa ~400ms vs ~40ms | Log de métricas caché             |
| 8   | Business Intelligence   | 5 vistas Power BI obligatorias                           | Agregaciones de todos los módulos |
| 9   | Motor de alertas        | Reglas configurables, correo, dashboard                  | `ALERT_LOG`                       |


---

## 7. Modelo de datos conceptual

### 7.1 `CONNECTIONS`

Registro maestro de motores. Campos: `id`, `nombre`, `motor` (Oracle/SQL Server/PostgreSQL), `host`, `port`, `database_name`, `user_name`, `status` (ACTIVE/INACTIVE/ERROR), `created_at`. Las credenciales **no** se almacenan en texto plano.

### 7.2 `DB_METRICS`

Métricas por captura: `db_id`, `cpu`, `memory`, `connections`, `locks`, `deadlocks`, `disk_usage`, `capture_time`.

### 7.3 `QUERY_LOG`

Análisis de rendimiento: `query_text`, `duration_ms`, `rows_returned`, `index_used`, `execution_plan`, `created_at`.

**Clasificación obligatoria:**


| Categoría | Umbral      |
| --------- | ----------- |
| Fast      | < 100 ms    |
| Medium    | 100–500 ms  |
| Slow      | 500–2000 ms |
| Critical  | > 2000 ms   |


### 7.4 `TX_LOG`

Concurrencia: `session`, `operación`, `inicio`, `fin`, `wait_time`, `lock_type` (SHARED/EXCLUSIVE/DEADLOCK/TIMEOUT).

### 7.5 `BACKUP_HISTORY`

Metadatos de respaldo: tipo (FULL/DIFF/INC), tamaño MB, duración, restore point, referencia a FULL padre (DIFF/INC), hash de integridad, URL remoto, estado SLA.

### 7.6 `ALERT_LOG`

Auditoría de alertas: timestamp, condición, motor afectado, severidad, estado de resolución.

---

## 8. Reglas de negocio críticas

### 8.1 Health Check

- Ejecución: **cada 1 minuto** (job planificado).
- Umbrales configurables → clasificación Healthy / Warning / Critical.

### 8.2 Motor de alertas (mínimo)


| Condición                | Acción                      | Severidad |
| ------------------------ | --------------------------- | --------- |
| CPU > 85%                | Correo electrónico          | Warning   |
| Deadlocks > 3            | Alerta crítica en dashboard | Critical  |
| Backup fallido           | Alarma roja + correo        | Critical  |
| Lag replicación > 10 seg | Notificación en dashboard   | Warning   |
| Disco > 90%              | Correo + alerta visual      | Critical  |
| Conexiones > umbral      | Notificación automática     | Warning   |


El motor debe ser **configurable sin redeploy**.

### 8.3 Replicación — umbrales de lag


| Escenario    | Lag    | Estado      |
| ------------ | ------ | ----------- |
| Carga normal | 2 seg  | Aceptable   |
| Carga media  | 5 seg  | Advertencia |
| Carga alta   | 20 seg | Crítico     |


### 8.4 Caché Redis — objetivos de demostración


| Escenario | Tiempo objetivo |
| --------- | --------------- |
| Sin caché | ~400 ms         |
| Con caché | ~40 ms          |


Estrategias requeridas: **TTL**, invalidación manual por evento, **hit ratio** en dashboard.

### 8.5 Disponibilidad global (BI)

Objetivo: **99,9%** por motor sobre ventana temporal seleccionada.

---

## 9. Stack tecnológico sugerido


| Capa            | Tecnología principal                      | Alternativas válidas               |
| --------------- | ----------------------------------------- | ---------------------------------- |
| Backend         | Node.js + Express                         | Python, Java, C#, .NET 8 Web API   |
| Frontend        | React 18+                                 | Vue, Angular, Next, TypeScript     |
| Autenticación   | JWT (obligatorio)                         | —                                  |
| API Docs        | Swagger / OpenAPI                         | —                                  |
| Monitoreo       | Prometheus + Grafana                      | Exporters por motor                |
| Alertas         | Alertmanager + Motor propio               | —                                  |
| Caché           | Redis (contenedor)                        | —                                  |
| Backup remoto   | Azure Blob Storage                        | —                                  |
| BI              | Power BI                                  | —                                  |
| Infraestructura | **Docker + Docker Compose (obligatorio)** | Variables de entorno para secretos |


---

## 10. Requisitos no funcionales


| Categoría           | Requisito                                                         |
| ------------------- | ----------------------------------------------------------------- |
| **Seguridad**       | Credenciales cifradas; secrets en `.env`; JWT en API              |
| **Disponibilidad**  | Health check continuo; replicación primario-réplica               |
| **Rendimiento**     | Caché Redis; jobs asíncronos para métricas y alertas              |
| **Recuperabilidad** | Cadena FULL→DIFF→INC; snapshots; RPO/RTO documentados             |
| **Observabilidad**  | Prometheus, Grafana, logs de alertas y métricas                   |
| **Mantenibilidad**  | Capas separadas; conectores por motor; configuración sin redeploy |
| **Portabilidad**    | Un solo `docker compose up` levanta la plataforma                 |
| **Usabilidad**      | UI responsiva; dashboards en tiempo real                          |


---

## 11. Entregables del proyecto


| Entregable                | Descripción                                                    |
| ------------------------- | -------------------------------------------------------------- |
| **Repositorio Git**       | Código completo, commits significativos, README de instalación |
| **Docker Compose**        | Levanta toda la plataforma con un comando                      |
| **Informe técnico (PDF)** | Análisis por módulo, CAP, RPO/RTO, evidencia de pruebas        |
| **Demostración en vivo**  | Simulación de fallos y recuperación ante el docente            |


---

## 12. Criterios de evaluación (alineación)


| Peso | Área                     | Enfoque de evaluación                 |
| ---- | ------------------------ | ------------------------------------- |
| 25%  | Módulos BD (3, 4, 6)     | Slow Query, Concurrencia, Replicación |
| 20%  | Backup & Recovery + Nube | FULL/DIFF/INC + Azure                 |
| 20%  | Arquitectura y código    | Capas, calidad, Docker                |
| 20%  | Dashboard BI y monitoreo | Power BI, Grafana, alertas            |
| 15%  | Informe técnico          | CAP, RPO/RTO, justificaciones         |


---

## 13. Actores y casos de uso principales


| Actor                        | Casos de uso                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------- |
| **DBA / Administrador**      | Registrar motores, configurar umbrales, ejecutar backups, restaurar snapshots |
| **Desarrollador / Analista** | Revisar slow queries, planes de ejecución, optimizaciones                     |
| **Operaciones / NOC**        | Monitorear Grafana, resolver alertas, verificar lag de replicación            |
| **Ejecutivo / Gestión**      | Consultar Power BI (SLA, disponibilidad, top queries)                         |
| **Sistema (automatizado)**   | Health check, jobs de backup, upload a nube, disparo de alertas               |


---

## 14. Riesgos y dependencias


| Riesgo                        | Mitigación                                           |
| ----------------------------- | ---------------------------------------------------- |
| Complejidad multi-motor       | Conectores aislados por motor; pruebas incrementales |
| Credenciales expuestas        | Cifrado + variables de entorno; nunca en repositorio |
| Cadena de backup incorrecta   | Pruebas automatizadas FULL→DIFF→INC documentadas     |
| Lag de replicación no medible | Instrumentación explícita en primario y réplica      |
| Alertas hardcodeadas          | Tabla/config externa editable sin redeploy           |


**Dependencias externas:** servicios SMTP, cuenta Azure, instancias de motores BD, Power BI Desktop/Service.

---

## 15. Próximos pasos recomendados (post System Brief)

1. **ADR / Decisiones de stack** — Confirmar backend, frontend y motor(es) de metadatos.
2. **Diagrama C4** — Contexto, contenedores y componentes.
3. **Esquema físico DDL** — Script SQL completo de todas las tablas.
4. **docker-compose.yml** — Esqueleto de servicios (API, UI, Redis, Prometheus, Grafana).
5. **Backlog por módulo** — Historias de usuario con criterios de aceptación por cada uno de los 9 módulos.

---

## 16. Glosario


| Término       | Definición                                                                                          |
| ------------- | --------------------------------------------------------------------------------------------------- |
| **CAP**       | Teorema que limita Consistencia, Disponibilidad y Tolerancia a particiones en sistemas distribuidos |
| **RPO**       | Recovery Point Objective — pérdida máxima de datos aceptable                                        |
| **RTO**       | Recovery Time Objective — tiempo máximo para restaurar el servicio                                  |
| **Lag**       | Retraso entre escritura en primario y lectura en réplica                                            |
| **Hit ratio** | Porcentaje de consultas servidas desde caché vs origen                                              |
| **DataOps**   | Prácticas que unifican datos, operaciones y automatización en el ciclo de vida de BD                |


---

*Documento generado a partir de **DataOps-Control-Center.pdf** — Práctica Final, Base de Datos II.*