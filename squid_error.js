// Reference: https://www.bennadel.com/blog/2828-creating-custom-error-objects-in-node-js-with-error-capturestacktrace.htm

class SquidError extends Error
{
  constructor (settings, nativeError, implementationContext)
  {
    super(settings?.message || nativeError?.message || 'An error occurred and no error message was set.');

    this.nativeError = nativeError ? SquidError.SerializeNativeError(nativeError): null;

    const providedStack = settings?.stack || nativeError?.stack;

    if (providedStack)
      this.stack = providedStack;
    else
      // Capture the current stacktrace and store it in the property "this.stack". By
      // providing the implementationContext argument, we will remove the current
      // constructor (or the optional factory function) line-item from the stacktrace; this
      // is good because it will reduce the implementation noise in the stack property.
      // --
      // Read More: https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi#Stack_trace_collection_for_custom_exceptions
      Error.captureStackTrace(this, (implementationContext || this.constructor));

    // The parent constructor also sets the name property to "Error", so we reset it to the right value.
    this.name      = this.constructor.name;
    this.code      = settings?.code || nativeError?.code || 'ERROR_CODE_NOT_SET';
    this.detail    = settings?.detail || '';
    this.id        = settings?.id || 0;
    this.timeStamp = settings?.timeStamp || new Date();
    this.skipLog   = settings?.skipLog || false;

    this._isSquidError = true;

    if (nativeError?.signal)  this.signal  = nativeError.signal;
    if (nativeError?.address) this.address = nativeError.address;
    if (nativeError?.dest)    this.dest    = nativeError.dest;
    if (nativeError?.errno)   this.errno   = nativeError.errno;
    if (nativeError?.info)    this.info    = nativeError.info;
    if (nativeError?.path)    this.path    = nativeError.path;
    if (nativeError?.port)    this.port    = nativeError.port;
    if (nativeError?.syscall) this.syscall = nativeError.syscall;
  }

  SetDetail (detail)
  {
    this.detail = detail;
    return this;
  };

  SetSkipLog (skipLog)
  {
    this.skipLog = skipLog;
    return this;
  }

  get isSquidError ()
  {
    return this._isSquidError;
  };

  /*
  * This function dumps long stack traces for exceptions having a cause()
  * method. The error classes from
  * [verror](https://github.com/davepacheco/node-verror) and
  * [restify v2.0](https://github.com/mcavage/node-restify) are examples.
  *
  * Based on `dumpException` in
  * https://github.com/davepacheco/node-extsprintf/blob/master/lib/extsprintf.js
  */
  static GetFullErrorStack (exception)
  {
    let fullErrorStack = exception.stack || exception.toString();

    if (exception.cause && typeof (exception.cause) === 'function')
    {
      const exceptionCause = exception.cause();

      if (exceptionCause)
        fullErrorStack += `\nCaused by: ${this.GetFullErrorStack(exceptionCause)}`;
    }

    return (fullErrorStack);
  }

  static SerializeNativeError (error)
  {
    return {
      message : error.message,
      name    : error.name,
      code    : error.code,
      ...(error.stack && { stack : this.GetFullErrorStack(error) }),
      // these are SystemError properties. Since NodeJS doesnt expose
      // the SystemError type, we cannot simply check for
      // if (err instanceof SystemError) and then add all
      // these properties at once. Thus, we need to check the existence
      // of each one individually
      ...(error.signal  && { signal  : error.signal  }),
      ...(error.address && { address : error.address }),
      ...(error.dest    && { dest    : error.dest    }),
      ...(error.errno   && { errno   : error.errno   }),
      ...(error.info    && { info    : error.info    }),
      ...(error.path    && { path    : error.path    }),
      ...(error.port    && { port    : error.port    }),
      ...(error.syscall && { syscall : error.syscall })
    };
  }

  static Serialize (error)
  {
    if(typeof error?.Serialize === 'function')
      return error.Serialize();

    if (Object.prototype.toString.call(error) === "[object Error]")
      return SquidError.SerializeNativeError(error);

    return error;
  }

  Serialize ()
  {
    return {
      ...SquidError.SerializeNativeError(this),
      id        : this.id,
      detail    : this.detail,
      timeStamp : this.timeStamp
    };
  }

  static Create (settings, nativeError)
  {
    return new this(settings, nativeError, this.Create);
  }

  static IsSquidError(error)
  {
    return (error?.isSquidError === true);
  }

  static ExactInstanceOf (error)
  {
    return (error instanceof this.constructor || error.constructor.name === this.name);
  }

  static Convert (error, onlyConvertNonSquidErrors = false)
  {
    if (onlyConvertNonSquidErrors)
      return (this.IsSquidError(error)) ? error : this.Create(null, error)

    return (this.ExactInstanceOf(error)) ? error : this.Create(null, error)
  }
}

class SquidHttpError extends SquidError
{
  constructor (settings, nativeError, implementationContext)
  {
    super(settings, nativeError, implementationContext);

    this.httpStatusCode = (settings?.httpStatusCode || 500);
  }

  Serialize ()
  {
    return {
      ...super.Serialize(),
      httpStatusCode : this.httpStatusCode
    };
  }

  SetHttpStatusCode (status)
  {
    this.httpStatusCode = status;
    return this;
  };
}

module.exports = { SquidError, SquidHttpError };
