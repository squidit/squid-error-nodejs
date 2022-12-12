export class SquidError extends Error {
    static GetFullErrorStack(exception: any): any;
    static SerializeNativeError(error: any): {
        syscall: any;
        port: any;
        path: any;
        info: any;
        errno: any;
        dest: any;
        address: any;
        signal: any;
        stack: any;
        message: any;
        name: any;
        code: any;
    };
    static Serialize(error: any): any;
    static Create(settings: any, nativeError: any): SquidError;
    constructor(settings: any, nativeError: any, implementationContext: any);
    nativeError: any;
    stack: any;
    code: any;
    detail: any;
    id: any;
    timeStamp: any;
    skipLog: any;
    signal: any;
    address: any;
    dest: any;
    errno: any;
    info: any;
    path: any;
    port: any;
    syscall: any;
    SetDetail(detail: any): SquidError;
    SetSkipLog(skipLog: any): SquidError;
    Serialize(): {
        id: any;
        detail: any;
        timeStamp: any;
        syscall: any;
        port: any;
        path: any;
        info: any;
        errno: any;
        dest: any;
        address: any;
        signal: any;
        stack: any;
        message: any;
        name: any;
        code: any;
    };
}
export class SquidHttpError extends SquidError {
    static Create(settings: any, nativeError: any): SquidHttpError;
    httpStatusCode: any;
    Serialize(): {
        httpStatusCode: any;
        id: any;
        detail: any;
        timeStamp: any;
        syscall: any;
        port: any;
        path: any;
        info: any;
        errno: any;
        dest: any;
        address: any;
        signal: any;
        stack: any;
        message: any;
        name: any;
        code: any;
    };
    SetHttpStatusCode(status: any): SquidHttpError;
}
