class SquidError extends Error {
  nativeError;
  stack;
  code;
  detail;
  id;
  timeStamp;
  skipLog;
  signal;
  address;
  dest;
  errno;
  info;
  path;
  port;
  syscall;
  constructor(settings, nativeError, implementationContext) {
    super(settings?.message || nativeError?.message || "An error occurred and no error message was set.");
    this.nativeError = nativeError ? SquidError.SerializeNativeError(nativeError) : void 0;
    const providedStack = settings?.stack || nativeError?.stack;
    if (providedStack) {
      this.stack = providedStack;
    } else {
      Error.captureStackTrace(this, implementationContext || this.constructor);
    }
    this.name = this.constructor.name;
    this.code = settings?.code || nativeError?.code || "ERROR_CODE_NOT_SET";
    this.detail = settings?.detail || "";
    this.id = settings?.id || 0;
    this.timeStamp = settings?.timeStamp || /* @__PURE__ */ new Date();
    this.skipLog = settings?.skipLog || false;
    if (nativeError?.signal) this.signal = nativeError.signal;
    if (nativeError?.address) this.address = nativeError.address;
    if (nativeError?.dest) this.dest = nativeError.dest;
    if (nativeError?.errno !== void 0) this.errno = nativeError.errno;
    if (nativeError?.info !== void 0) this.info = nativeError.info;
    if (nativeError?.path) this.path = nativeError.path;
    if (nativeError?.port !== void 0) this.port = nativeError.port;
    if (nativeError?.syscall) this.syscall = nativeError.syscall;
  }
  get isSquidError() {
    return true;
  }
  SetDetail(detail) {
    this.detail = detail;
    return this;
  }
  SetSkipLog(skipLog) {
    this.skipLog = skipLog;
    return this;
  }
  /**
   * Dumps long stack traces for exceptions having a cause() method (e.g. verror, restify).
   * Based on `dumpException` in node-extsprintf.
   */
  static GetFullErrorStack(exception) {
    let fullErrorStack = exception.stack || exception.toString();
    if (exception.cause && typeof exception.cause === "function") {
      const exceptionCause = exception.cause();
      if (exceptionCause) {
        fullErrorStack += `
Caused by: ${this.GetFullErrorStack(exceptionCause)}`;
      }
    }
    return fullErrorStack;
  }
  static SerializeNativeError(error) {
    const out = {
      message: error.message,
      name: error.name,
      code: error.code
    };
    if (error.stack) out.stack = this.GetFullErrorStack(error);
    if (error.signal) out.signal = error.signal;
    if (error.address) out.address = error.address;
    if (error.dest) out.dest = error.dest;
    if (error.errno !== void 0) out.errno = error.errno;
    if (error.info !== void 0) out.info = error.info;
    if (error.path) out.path = error.path;
    if (error.port !== void 0) out.port = error.port;
    if (error.syscall) out.syscall = error.syscall;
    return out;
  }
  static Serialize(error) {
    if (typeof error?.Serialize === "function") {
      return error.Serialize();
    }
    if (Object.prototype.toString.call(error) === "[object Error]") {
      return SquidError.SerializeNativeError(error);
    }
    return error;
  }
  Serialize() {
    return {
      ...SquidError.SerializeNativeError(this),
      id: this.id,
      detail: this.detail,
      timeStamp: this.timeStamp
    };
  }
  static Create(settings, nativeError) {
    return new this(settings, nativeError, this.Create);
  }
  static IsSquidError(error) {
    return error?.isSquidError === true;
  }
  static ExactInstanceOf(error) {
    return error instanceof this.constructor || error.constructor.name === this.name;
  }
  static Convert(error, onlyConvertNonSquidErrors = false) {
    if (onlyConvertNonSquidErrors) {
      return this.IsSquidError(error) ? error : this.Create(void 0, error);
    }
    return this.ExactInstanceOf(error) ? error : this.Create(void 0, error);
  }
}
class SquidHttpError extends SquidError {
  httpStatusCode;
  constructor(settings, nativeError, implementationContext) {
    super(settings, nativeError, implementationContext);
    this.httpStatusCode = settings?.httpStatusCode || 500;
  }
  Serialize() {
    return {
      ...super.Serialize(),
      httpStatusCode: this.httpStatusCode
    };
  }
  SetHttpStatusCode(status) {
    this.httpStatusCode = status;
    return this;
  }
  static Create(settings, nativeError) {
    return new this(settings, nativeError, this.Create);
  }
}
export {
  SquidError,
  SquidHttpError
};
//# sourceMappingURL=squid-error.js.map