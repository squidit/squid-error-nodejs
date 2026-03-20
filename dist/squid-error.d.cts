/**
 * Reference: https://www.bennadel.com/blog/2828-creating-custom-error-objects-in-node-js-with-error-capturestacktrace.htm
 */
interface SquidErrorSettings {
    message?: string;
    stack?: string;
    code?: string;
    detail?: string;
    id?: number;
    timeStamp?: Date;
    skipLog?: boolean;
}
interface SquidHttpErrorSettings extends SquidErrorSettings {
    httpStatusCode?: number;
}
/** Native / system errors with optional Node system fields */
type NativeErrorLike = Error & Partial<NodeJS.ErrnoException> & {
    signal?: NodeJS.Signals;
    address?: string;
    dest?: unknown;
    info?: unknown;
    port?: number;
};
interface SerializedNativeError {
    message: string;
    name: string;
    code?: string;
    stack?: string;
    signal?: NodeJS.Signals;
    address?: string;
    dest?: unknown;
    errno?: number;
    info?: unknown;
    path?: string;
    port?: number;
    syscall?: string;
}
interface SquidErrorSerialized extends SerializedNativeError {
    id: number;
    detail: string;
    timeStamp: Date;
}
interface SquidHttpErrorSerialized extends SquidErrorSerialized {
    httpStatusCode: number;
}
interface ExceptionWithOptionalCause {
    stack?: string;
    cause?: (() => unknown) | unknown;
    toString(): string;
}
declare class SquidError extends Error {
    nativeError: SerializedNativeError | undefined;
    stack: string | undefined;
    code: string;
    detail: string;
    id: number;
    timeStamp: Date;
    skipLog: boolean;
    signal?: NodeJS.Signals;
    address?: string;
    dest?: unknown;
    errno?: number;
    info?: unknown;
    path?: string;
    port?: number;
    syscall?: string;
    constructor(settings?: SquidErrorSettings | null, nativeError?: NativeErrorLike | null, implementationContext?: Function);
    get isSquidError(): true;
    SetDetail(detail: string): this;
    SetSkipLog(skipLog: boolean): this;
    /**
     * Dumps long stack traces for exceptions having a cause() method (e.g. verror, restify).
     * Based on `dumpException` in node-extsprintf.
     */
    static GetFullErrorStack(exception: ExceptionWithOptionalCause): string;
    static SerializeNativeError(error: NativeErrorLike): SerializedNativeError;
    static Serialize(error: unknown): unknown;
    Serialize(): SquidErrorSerialized;
    static Create(this: typeof SquidError, settings: SquidErrorSettings | null | undefined, nativeError: NativeErrorLike | null | undefined): SquidError;
    static IsSquidError(error: unknown): error is SquidError;
    static ExactInstanceOf(this: typeof SquidError, error: unknown): boolean;
    static Convert(this: typeof SquidError, error: unknown, onlyConvertNonSquidErrors?: boolean): SquidError;
}
declare class SquidHttpError extends SquidError {
    httpStatusCode: number;
    constructor(settings?: SquidHttpErrorSettings | null, nativeError?: NativeErrorLike | null, implementationContext?: Function);
    Serialize(): SquidHttpErrorSerialized;
    SetHttpStatusCode(status: number): this;
    static Create(this: typeof SquidHttpError, settings: SquidHttpErrorSettings | null | undefined, nativeError: NativeErrorLike | null | undefined): SquidHttpError;
}

export { type NativeErrorLike, type SerializedNativeError, SquidError, type SquidErrorSerialized, type SquidErrorSettings, SquidHttpError, type SquidHttpErrorSerialized, type SquidHttpErrorSettings };
