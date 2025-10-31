/**
 * Development logger for debugging
 * 
 * @packageDocumentation
 */

/**
 * Log level
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Log entry
 */
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: number
  data?: unknown
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /**
   * Minimum log level to record
   */
  minLevel?: LogLevel

  /**
   * Maximum number of log entries
   */
  maxEntries?: number

  /**
   * Whether to also log to console
   */
  console?: boolean
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

/**
 * Development logger for FHEVM operations
 * 
 * @example
 * ```typescript
 * import { DevLogger } from '@mixaspro/devtools'
 * 
 * const logger = new DevLogger({ minLevel: 'info', console: true })
 * 
 * logger.info('Encrypting value', { value: 42 })
 * logger.error('Encryption failed', { error: err })
 * 
 * const logs = logger.getLogs()
 * ```
 */
export class DevLogger {
  private logs: LogEntry[] = []
  private config: Required<LoggerConfig>

  constructor(config: LoggerConfig = {}) {
    this.config = {
      minLevel: config.minLevel ?? 'debug',
      maxEntries: config.maxEntries ?? 1000,
      console: config.console ?? true,
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: unknown): void {
    this.log('debug', message, data)
  }

  /**
   * Log info message
   */
  info(message: string, data?: unknown): void {
    this.log('info', message, data)
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: unknown): void {
    this.log('warn', message, data)
  }

  /**
   * Log error message
   */
  error(message: string, data?: unknown): void {
    this.log('error', message, data)
  }

  /**
   * Log message with level
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel]) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      data,
    }

    this.logs.push(entry)
    this.evictOldLogs()

    if (this.config.console) {
      const consoleMethod = level === 'debug' ? 'log' : level
      // eslint-disable-next-line no-console
      console[consoleMethod](`[FHEVM ${level.toUpperCase()}]`, message, data ?? '')
    }
  }

  /**
   * Get all logs
   * 
   * @param filter - Optional filter
   * @returns Array of log entries
   */
  getLogs(filter?: { level?: LogLevel; since?: number }): LogEntry[] {
    let logs = this.logs

    if (filter?.level !== null && filter?.level !== undefined) {
      logs = logs.filter((log) => log.level === filter.level)
    }

    if (filter?.since !== undefined && filter.since !== null) {
      const since = filter.since
      logs = logs.filter((log) => log.timestamp >= since)
    }

    return logs
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = []
  }

  /**
   * Evict old logs if exceeding max
   */
  private evictOldLogs(): void {
    if (this.logs.length <= this.config.maxEntries) {
      return
    }

    this.logs = this.logs.slice(-this.config.maxEntries)
  }

  /**
   * Export logs as JSON
   */
  export(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}
