export function BiPage() {
  return (
    <section>
      <h1>Power BI — 5 vistas obligatorias</h1>
      <p>Guía y checklist en `docs/bi/POWERBI_GUIDE.md`.</p>
      <ol>
        <li>Rendimiento temporal</li>
        <li>Heatmap de actividad</li>
        <li>Top 10 queries lentas</li>
        <li>Backups y SLA</li>
        <li>Disponibilidad global</li>
      </ol>
      <p>Fuente sugerida: PostgreSQL metadata o export CSV desde endpoints API.</p>
    </section>
  );
}
