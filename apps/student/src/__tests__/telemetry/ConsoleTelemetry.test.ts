import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConsoleTelemetry } from '../../telemetry/console/ConsoleTelemetry'

describe('ConsoleTelemetry', () => {
  let telemetry: ConsoleTelemetry

  beforeEach(() => {
    telemetry = new ConsoleTelemetry()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should log events to console', () => {
    telemetry.event('progress.saved', { userId: 'u1', lessonId: 'l1' })

    expect(console.log).toHaveBeenCalledWith(
      '[Telemetry] progress.saved',
      { userId: 'u1', lessonId: 'l1' },
    )
  })

  it('should log events without data', () => {
    telemetry.event('offline.detected')

    expect(console.log).toHaveBeenCalledWith(
      '[Telemetry] offline.detected',
      '',
    )
  })

  it('should log errors to console.error', () => {
    const error = new Error('test error')
    telemetry.error(error, { context: 'test' })

    expect(console.error).toHaveBeenCalledWith(
      '[Telemetry] ERROR:',
      'test error',
      { context: 'test' },
    )
  })

  it('should log metrics to console', () => {
    telemetry.metric('cache.hit', 1, { module: 'mod1' })

    expect(console.log).toHaveBeenCalledWith(
      '[Metric] cache.hit=1',
      { module: 'mod1' },
    )
  })

  it('should log metrics without tags', () => {
    telemetry.metric('sync.duration', 150)

    expect(console.log).toHaveBeenCalledWith(
      '[Metric] sync.duration=150',
      '',
    )
  })
})
