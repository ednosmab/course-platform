import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NoopTelemetry } from '../../telemetry/noop/NoopTelemetry'

describe('NoopTelemetry', () => {
  let telemetry: NoopTelemetry

  beforeEach(() => {
    telemetry = new NoopTelemetry()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should not log events', () => {
    telemetry.event('progress.saved', { userId: 'u1' })

    expect(console.log).not.toHaveBeenCalled()
  })

  it('should not log errors', () => {
    telemetry.error(new Error('test'))

    expect(console.error).not.toHaveBeenCalled()
  })

  it('should not log metrics', () => {
    telemetry.metric('test', 1)

    expect(console.log).not.toHaveBeenCalled()
  })
})
