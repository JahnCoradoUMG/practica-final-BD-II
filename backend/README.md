# Backend — DataOps Control Center

API REST con **Node.js 20**, **Express**, **JWT** y **Swagger**.

## Arquitectura (capas)

```
routes → controllers → services → repositories
                              ↘ connectors/ (adapter por motor)
```

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | No | Healthcheck (Docker) |
| GET | `/ready` | No | Readiness + BD |
| GET | `/metrics` | No | Prometheus placeholder |
| GET | `/api-docs` | No | Swagger UI |
| POST | `/api/auth/login` | No | Obtener JWT |
| GET | `/api/health/thresholds` | JWT | Umbrales globales |
| GET | `/api/health/metrics/latest` | JWT | Últimas métricas |
| GET | `/api/system/info` | JWT | Estado API + conectores |
| GET | `/api/system/alert-rules` | JWT | Reglas de alerta |

## Credenciales por defecto (desarrollo)

- Usuario: `admin`
- Password: `admin123`  
Configurar en `.env`: `API_ADMIN_USER`, `API_ADMIN_PASSWORD`.

## Ejemplo (Docker)

```powershell
# Login
$body = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$login = Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method POST -Body $body -ContentType "application/json"
$token = $login.data.token

# Endpoint protegido
Invoke-RestMethod -Uri http://localhost:3000/api/system/info -Headers @{ Authorization = "Bearer $token" }
```

## Desarrollo local

```bash
cd backend
npm install
# Configurar .env en raíz del monorepo con METADATA_DB_HOST=localhost
npm run dev
```

## Docker

Se construye con el servicio `api` en `docker/docker-compose.yml`:

```powershell
docker compose -f docker/docker-compose.yml up -d --build api
```
