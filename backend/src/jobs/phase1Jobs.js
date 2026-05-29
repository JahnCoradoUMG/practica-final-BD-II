import * as queryService from '../services/queryService.js';
import * as txService from '../services/txService.js';
import * as replicationService from '../services/replicationService.js';
import * as alertService from '../services/alertService.js';

let timers = [];

function schedule(fn, intervalMs) {
  const timer = setInterval(async () => {
    try {
      await fn();
    } catch (err) {
      console.error('[phase1-job]', err.message);
    }
  }, intervalMs);
  timers.push(timer);
}

export function startPhase1Jobs() {
  schedule(() => queryService.generateSlowQuerySamples(), 120_000);
  schedule(() => txService.simulateConcurrency(100), 180_000);
  schedule(() => replicationService.autoCaptureReplication(), 90_000);
  schedule(() => alertService.evaluateAlerts(), 60_000);
  console.log('[phase1-jobs] schedulers iniciados');
}

export function stopPhase1Jobs() {
  timers.forEach((timer) => clearInterval(timer));
  timers = [];
}
