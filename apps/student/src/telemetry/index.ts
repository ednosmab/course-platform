import type { ITelemetryProvider } from './types'
import { ConsoleTelemetry } from './console/ConsoleTelemetry'
import { NoopTelemetry } from './noop/NoopTelemetry'

export type { ITelemetryProvider, TelemetryEventType, TelemetryEvent } from './types'

export { ConsoleTelemetry } from './console/ConsoleTelemetry'
export { NoopTelemetry } from './noop/NoopTelemetry'

/**
 * Creates a telemetry provider based on the environment.
 * @param mode - 'console' for development, 'noop' for tests/production without backend.
 */
export function createTelemetry(mode: 'console' | 'noop' = 'console'): ITelemetryProvider {
  switch (mode) {
    case 'console':
      return new ConsoleTelemetry()
    case 'noop':
      return new NoopTelemetry()
  }
}
