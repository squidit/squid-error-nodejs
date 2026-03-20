/**
 * Reference: https://www.bennadel.com/blog/2828-creating-custom-error-objects-in-node-js-with-error-capturestacktrace.htm
 */

export interface SquidErrorSettings {
  message?: string
  stack?: string
  code?: string
  detail?: string
  id?: number
  timeStamp?: Date
  skipLog?: boolean
}

export interface SquidHttpErrorSettings extends SquidErrorSettings {
  httpStatusCode?: number
}

/** Native / system errors with optional Node system fields */
export type NativeErrorLike
  = Error
    & Partial<NodeJS.ErrnoException>
    & {
      signal?: NodeJS.Signals
      address?: string
      dest?: unknown
      info?: unknown
      port?: number
    }

export interface SerializedNativeError {
  message: string
  name: string
  code?: string
  stack?: string
  signal?: NodeJS.Signals
  address?: string
  dest?: unknown
  errno?: number
  info?: unknown
  path?: string
  port?: number
  syscall?: string
}

export interface SquidErrorSerialized extends SerializedNativeError {
  id: number
  detail: string
  timeStamp: Date
}

export interface SquidHttpErrorSerialized extends SquidErrorSerialized {
  httpStatusCode: number
}

interface ExceptionWithOptionalCause {
  stack?: string
  cause?: (() => unknown) | unknown
  toString(): string
}

export class SquidError extends Error {
  nativeError: SerializedNativeError | undefined
  override stack: string | undefined
  code: string
  detail: string
  id: number
  timeStamp: Date
  skipLog: boolean

  signal?: NodeJS.Signals
  address?: string
  dest?: unknown
  errno?: number
  info?: unknown
  path?: string
  port?: number
  syscall?: string

  constructor(
    settings?: SquidErrorSettings | null,
    nativeError?: NativeErrorLike | null,
    implementationContext?: Function,
  ) {
    super(settings?.message || nativeError?.message || 'An error occurred and no error message was set.')

    this.nativeError = nativeError ? SquidError.SerializeNativeError(nativeError) : undefined

    const providedStack = settings?.stack || nativeError?.stack

    if (providedStack) {
      this.stack = providedStack
    }
    else {
      Error.captureStackTrace(this, implementationContext || this.constructor)
    }

    this.name = this.constructor.name
    this.code = settings?.code || nativeError?.code || 'ERROR_CODE_NOT_SET'
    this.detail = settings?.detail || ''
    this.id = settings?.id || 0
    this.timeStamp = settings?.timeStamp || new Date()
    this.skipLog = settings?.skipLog || false

    if (nativeError?.signal) this.signal = nativeError.signal
    if (nativeError?.address) this.address = nativeError.address
    if (nativeError?.dest) this.dest = nativeError.dest
    if (nativeError?.errno !== undefined) this.errno = nativeError.errno
    if (nativeError?.info !== undefined) this.info = nativeError.info
    if (nativeError?.path) this.path = nativeError.path
    if (nativeError?.port !== undefined) this.port = nativeError.port
    if (nativeError?.syscall) this.syscall = nativeError.syscall
  }

  get isSquidError(): true {
    return true
  }

  SetDetail(detail: string): this {
    this.detail = detail
    return this
  }

  SetSkipLog(skipLog: boolean): this {
    this.skipLog = skipLog
    return this
  }

  /**
   * Dumps long stack traces for exceptions having a cause() method (e.g. verror, restify).
   * Based on `dumpException` in node-extsprintf.
   */
  static GetFullErrorStack(exception: ExceptionWithOptionalCause): string {
    let fullErrorStack = exception.stack || exception.toString()

    if (exception.cause && typeof exception.cause === 'function') {
      const exceptionCause = exception.cause()

      if (exceptionCause) {
        fullErrorStack += `\nCaused by: ${this.GetFullErrorStack(exceptionCause as ExceptionWithOptionalCause)}`
      }
    }

    return fullErrorStack
  }

  static SerializeNativeError(error: NativeErrorLike): SerializedNativeError {
    const out: SerializedNativeError = {
      message: error.message,
      name: error.name,
      code: error.code,
    }
    if (error.stack) out.stack = this.GetFullErrorStack(error)
    if (error.signal) out.signal = error.signal
    if (error.address) out.address = error.address
    if (error.dest) out.dest = error.dest
    if (error.errno !== undefined) out.errno = error.errno
    if (error.info !== undefined) out.info = error.info
    if (error.path) out.path = error.path
    if (error.port !== undefined) out.port = error.port
    if (error.syscall) out.syscall = error.syscall
    return out
  }

  static Serialize(error: unknown): unknown {
    if (typeof (error as { Serialize?: unknown })?.Serialize === 'function') {
      return (error as { Serialize: () => unknown }).Serialize()
    }

    if (Object.prototype.toString.call(error) === '[object Error]') {
      return SquidError.SerializeNativeError(error as NativeErrorLike)
    }

    return error
  }

  Serialize(): SquidErrorSerialized {
    return {
      ...SquidError.SerializeNativeError(this as NativeErrorLike),
      id: this.id,
      detail: this.detail,
      timeStamp: this.timeStamp,
    }
  }

  static Create(
    this: typeof SquidError,
    settings: SquidErrorSettings | null | undefined,
    nativeError: NativeErrorLike | null | undefined,
  ): SquidError {
    return new this(settings, nativeError, this.Create)
  }

  static IsSquidError(error: unknown): error is SquidError {
    return (error as SquidError | undefined)?.isSquidError === true
  }

  static ExactInstanceOf(this: typeof SquidError, error: unknown): boolean {
    return (
      error instanceof this.constructor
      || (error as Error).constructor.name === this.name
    )
  }

  static Convert(
    this: typeof SquidError,
    error: unknown,
    onlyConvertNonSquidErrors = false,
  ): SquidError {
    if (onlyConvertNonSquidErrors) {
      return this.IsSquidError(error) ? error : this.Create(undefined, error as NativeErrorLike)
    }

    return this.ExactInstanceOf(error) ? (error as SquidError) : this.Create(undefined, error as NativeErrorLike)
  }
}

export class SquidHttpError extends SquidError {
  httpStatusCode: number

  constructor(
    settings?: SquidHttpErrorSettings | null,
    nativeError?: NativeErrorLike | null,
    implementationContext?: Function,
  ) {
    super(settings, nativeError, implementationContext)
    this.httpStatusCode = settings?.httpStatusCode || 500
  }

  override Serialize(): SquidHttpErrorSerialized {
    return {
      ...super.Serialize(),
      httpStatusCode: this.httpStatusCode,
    }
  }

  SetHttpStatusCode(status: number): this {
    this.httpStatusCode = status
    return this
  }

  static override Create(
    this: typeof SquidHttpError,
    settings: SquidHttpErrorSettings | null | undefined,
    nativeError: NativeErrorLike | null | undefined,
  ): SquidHttpError {
    return new this(settings, nativeError, this.Create)
  }
}
