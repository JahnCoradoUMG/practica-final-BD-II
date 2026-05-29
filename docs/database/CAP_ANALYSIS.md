# Analisis CAP - Modulo 6 (SCRUM-17)

## Escenario

La plataforma DataOps prioriza disponibilidad operativa con consistencia eventual en telemetria no critica.

## Decision

- **Consistencia (C):** fuerte para metadatos administrativos (conexiones, reglas, backups).
- **Disponibilidad (A):** alta para consultas de monitoreo y dashboards, incluso con lag.
- **Particiones (P):** toleradas mediante modo degradado y alertas de lag.

## Justificacion

- Para monitoreo en tiempo real, una lectura con segundos de retraso es aceptable.
- Para operaciones criticas (backups y configuracion), se mantiene flujo transaccional en metadatos.
- El sistema avisa lag > 10s para prevenir decisiones con datos obsoletos.
