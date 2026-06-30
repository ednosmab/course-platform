/**
 * @description Observable event types emitted by the offline persistence layer.
 * Each event carries a timestamp and optional structured data.
 */
export type TelemetryEventType =
  | 'migration.started'
  | 'migration.completed'
  | 'migration.failed'
  | 'db.corruption.detected'
  | 'sync.conflict'
  | 'sync.completed'
  | 'sync.failed'
  | 'cache.hit'
  | 'cache.miss'
  | 'offline.detected'
  | 'online.detected'
  | 'progress.saved'
  | 'module.downloaded'
  | 'image.cached'

/**
 * @description A single telemetry event.
 */
export interface TelemetryEvent {
  type: TelemetryEventType
  timestamp: number
  data?: Record<string, unknown>
  error?: Error
}

/**
 * @description Infrastructure contract for observability.
 * Services depend exclusively on this interface. Concrete
 * implementations (Console, Sentry, OpenTelemetry, Noop)
 * can be swapped without touching business logic.
 */
export interface ITelemetryProvider {
  /**
   * Records a domain event.
   */
  event(type: TelemetryEventType, data?: Record<string, unknown>): void

  /**
   * Records an error with optional context.
   */
  error(error: Error, context?: Record<string, unknown>): void

  /**
   * Records a numeric metric with optional tags.
   */
  metric(
    name: string,
    value: number,
    tags?: Record<string, string>,
  ): void
}
