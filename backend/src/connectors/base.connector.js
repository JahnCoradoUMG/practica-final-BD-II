/**
 * Interfaz base Adapter — SCRUM-21
 * Métodos: testConnection, getMetrics, getSlowQueries, executeBackup
 */
export class BaseConnector {
  constructor(engine, { ready = false, mode = 'stub' } = {}) {
    this.engine = engine;
    this.ready = ready;
    this.mode = mode; // native | socket | stub
  }

  getCapabilities() {
    return {
      engine: this.engine,
      ready: this.ready,
      mode: this.mode,
      methods: ['testConnection', 'getMetrics', 'getSlowQueries', 'executeBackup'],
    };
  }

  async testConnection(_config) {
    throw new Error(`testConnection no implementado para ${this.engine}`);
  }

  async getMetrics(_config) {
    throw new Error(`getMetrics no implementado para ${this.engine}`);
  }

  async getSlowQueries(_config, _limit = 10) {
    throw new Error(`getSlowQueries no implementado para ${this.engine}`);
  }

  async executeBackup(_config, backupType = 'FULL') {
    throw new Error(`executeBackup no implementado para ${this.engine}`);
  }
}
