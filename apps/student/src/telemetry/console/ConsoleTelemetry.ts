import type {
  ITelemetryProvider,
  TelemetryEventType,
} from '../types'

/**
 * @description Telemetry provider that logs to the console.
 * Intended for development and debugging. In production,
 * replace with SentryTelemetry, OpenTelemetry, or NoopTelemetry.
 */
export class ConsoleTelemetry implements ITelemetryProvider {
  event(type: TelemetryEventType, data?: Record<string, unknown>): void {
    console.log(`[Telemetry] ${type}`, data ?? '')
  }

  error(error: Error, context?: Record<string, unknown>): void {
    console.error('[Telemetry] ERROR:', error.message, context ?? '')
  }

  metric(
    name: string,
    value: number,
    tags?: Record<string, string>,
  ): void {
    console.log(`[Metric] ${name}=${value}`, tags ?? '')
  }
}
