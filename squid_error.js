// @ts-check
// Reference: https://www.bennadel.com/blog/2828-creating-custom-error-objects-in-node-js-with-error-capturestacktrace.htm

/**
 * @typedef {{ message?: string; stack?: string; code?: string; detail?: Record<string, unknown>; id?: number; timeStamp?: Date; skipLog?: boolean; }} SquidErrorSettings
 */

/**
 * SquidHttpErrorSettings
 * @typedef {(SquidErrorSettings & {httpStatusCode?: number})} SquidHttpErrorSettings
 */

class SquidError extends Error
{
  /**
   * @param {SquidErrorSettings} settings
   * @param {(Error | undefined)} nativeError
   * @param {(...args: unknown[]) => unknown} implementationContext
   */
  constructor (settings, nativeError, implementationContext)
  {
    super(settings?.message || nativeError?.message || 'An error occurred and no error message was set.');

    this.nativeError = nativeError ? SquidError.SerializeNativeError(nativeError): null;

    const providedStack = settings?.stack || nativeError?.stack;


    if (providedStack)
      /** @type {string} stack */
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
    /** @type {string} */
    this.name      = this.constructor.name;
    /** @type {string} */
    this.code      = settings?.code || ('code' in nativeError && typeof nativeError.code === 'string' && nativeError?.code) || 'ERROR_CODE_NOT_SET';
    /** @type {Record<string, unknown>} */
    this.detail    = settings?.detail || {};
    /** @type {number} */
    this.id        = settings?.id || 0;
    /** @type {Date} */
    this.timeStamp = settings?.timeStamp || new Date();
    /** @type {boolean} */
    this.skipLog   = settings?.skipLog || false;

    /** @type {boolean} @private */
    this._isSquidError = true;
    if(nativeError) 
    {
      if ('signal'  in nativeError && nativeError?.signal)  this.signal  = nativeError.signal;
      if ('address' in nativeError && nativeError?.address) this.address = nativeError.address;
      if ('dest'    in nativeError && nativeError?.dest)    this.dest    = nativeError.dest;
      if ('errno'   in nativeError && nativeError?.errno)   this.errno   = nativeError.errno;
      if ('info'    in nativeError && nativeError?.info)    this.info    = nativeError.info;
      if ('path'    in nativeError && nativeError?.path)    this.path    = nativeError.path;
      if ('port'    in nativeError && nativeError?.port)    this.port    = nativeError.port;
      if ('syscall' in nativeError && nativeError?.syscall) this.syscall = nativeError.syscall;
    }
  }

  /**
   * @param {Record<string, unknown>} detail
   */
  SetDetail (detail)
  {
    this.detail = detail;
    return this;
  };

  /**
   * @param {boolean} skipLog
   */
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
  /**
   * @param {Error} error
   */
  static GetFullErrorStack (error)
  {
    let fullErrorStack = error.stack || error.toString();

    if ('cause' in error && error.cause && typeof (error.cause) === 'function')
    {
      const exceptionCause = error.cause();

      if (exceptionCause)
        fullErrorStack += `\nCaused by: ${this.GetFullErrorStack(exceptionCause)}`;
    }

    return fullErrorStack;
  }

  /**
   * @param {Error} error
   */
  static SerializeNativeError (error)
  {
    return {
      message : error.message,
      name    : error.name,
      code    : 'code' in error && error.code,
      ...(error.stack && { stack : this.GetFullErrorStack(error) }),
      // these are SystemError properties. Since NodeJS doesnt expose
      // the SystemError type, we cannot simply check for
      // if (err instanceof SystemError) and then add all
      // these properties at once. Thus, we need to check the existence
      // of each one individually
      ...('signal'  in error && error.signal  && { signal  : error.signal  }),
      ...('address' in error && error.address && { address : error.address }),
      ...('dest'    in error && error.dest    && { dest    : error.dest    }),
      ...('errno'   in error && error.errno   && { errno   : error.errno   }),
      ...('info'    in error && error.info    && { info    : error.info    }),
      ...('path'    in error && error.path    && { path    : error.path    }),
      ...('port'    in error && error.port    && { port    : error.port    }),
      ...('syscall' in error && error.syscall && { syscall : error.syscall })
    };
  }

  /**
   * @param {Error} error
   */
  static Serialize (error)
  {
    if('Serialize' in error && typeof error?.Serialize === 'function')
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

  /**
   * 
   * @param {SquidErrorSettings} settings 
   * @param {unknown} [nativeError] Erro original
   * @returns 
   */
  static Create (settings, nativeError)
  {
    const validatedError = nativeError instanceof Error ? nativeError : undefined;

    return new this(settings, validatedError, this.Create);
  }

  /**
   * @param {{ isSquidError?: boolean; }} error
   */
  static IsSquidError(error)
  {
    return (error?.isSquidError === true);
  }

  /**
   * @param {unknown} error
   */
  static ExactInstanceOf (error)
  {
    return (error instanceof this.constructor || error.constructor.name === this.name);
  }

  /**
   * @param {unknown} error
   */
  static Convert (error, onlyConvertNonSquidErrors = false)
  {
    if (onlyConvertNonSquidErrors)
      return (this.IsSquidError(error)) ? error : this.Create(null, error)

    return (this.ExactInstanceOf(error)) ? error : this.Create(null, error)
  }
}

class SquidHttpError extends SquidError
{
  /**
   * @param {SquidHttpErrorSettings} settings
   * @param {Error} nativeError
   * @param {any} implementationContext
   */
  constructor (settings, nativeError, implementationContext)
  {
    super(settings, nativeError, implementationContext);

    /** @type {number} */
    this.httpStatusCode = (settings?.httpStatusCode || 500);
  }

  Serialize ()
  {
    return {
      ...super.Serialize(),
      httpStatusCode : this.httpStatusCode
    };
  }

  /**
   * @param {number} status
   */
  SetHttpStatusCode (status)
  {
    this.httpStatusCode = status;
    return this;
  };
}

module.exports = { SquidError, SquidHttpError };
