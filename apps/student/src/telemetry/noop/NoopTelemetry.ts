import type { ITelemetryProvider } from '../types'

/**
 * @description Silent telemetry provider. Discards all events.
 * Use in tests or in production when no observability backend is configured.
 */
export class NoopTelemetry implements ITelemetryProvider {
  event(): void {}
  error(): void {}
  metric(): void {}
}
