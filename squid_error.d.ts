declare module "squid_error" {
    export type SquidErrorSettings = {
        message?: string;
        stack?: string;
        code?: string;
        detail?: Record<string, unknown>;
        id?: number;
        timeStamp?: Date;
        skipLog?: boolean;
    };
    export type SquidHttpErrorSettings = (SquidErrorSettings & {
        httpStatusCode?: number;
    });
    /**
     * @typedef {{
     * message?: string;
     * stack?: string;
     * code?: string;
     * detail?: Record<string, unknown>;
     * id?: number;
     * timeStamp?: Date;
     * skipLog?: boolean;
     * }} SquidErrorSettings
     *
     * @typedef {(SquidErrorSettings & {httpStatusCode?: number})} SquidHttpErrorSettings
     */
    export class SquidError extends Error {
        /**
         * @param {Error} error
         */
        static GetFullErrorStack(error: Error): string;
        /**
         * @param {Error} error
         */
        static SerializeNativeError(error: Error): {
            syscall: unknown;
            port: unknown;
            path: unknown;
            info: unknown;
            errno: unknown;
            dest: unknown;
            address: unknown;
            signal: unknown;
            stack: string;
            message: string;
            name: string;
            code: unknown;
        };
        /**
         * @param {Error} error
         */
        static Serialize(error: Error): any;
        /**
         *
         * @param {SquidErrorSettings} settings
         * @param {unknown} [nativeError] Erro original
         * @returns
         */
        static Create(settings: SquidErrorSettings, nativeError?: unknown): SquidError;
        /**
         * @param {{ isSquidError?: boolean; }} error
         */
        static IsSquidError(error: {
            isSquidError?: boolean;
        }): boolean;
        /**
         * @param {unknown} error
         */
        static ExactInstanceOf(error: unknown): boolean;
        /**
         * @param {unknown} error
         */
        static Convert(error: unknown, onlyConvertNonSquidErrors?: boolean): unknown;
        /**
         * @param {SquidErrorSettings} settings
         * @param {unknown} [nativeError]
         * @param {(...args: unknown[]) => unknown} [implementationContext]
         */
        constructor(settings: SquidErrorSettings, nativeError?: unknown, implementationContext?: (...args: unknown[]) => unknown);
        nativeError: {
            syscall: unknown;
            port: unknown;
            path: unknown;
            info: unknown;
            errno: unknown;
            dest: unknown;
            address: unknown;
            signal: unknown;
            stack: string;
            message: string;
            name: string;
            code: unknown;
        };
        /** @type {string} */
        code: string;
        /** @type {Record<string, unknown>} */
        detail: Record<string, unknown>;
        /** @type {number} */
        id: number;
        /** @type {Date} */
        timeStamp: Date;
        /** @type {boolean} */
        skipLog: boolean;
        /** @type {boolean} @private */
        private _isSquidError;
        signal: unknown;
        address: unknown;
        dest: unknown;
        errno: unknown;
        info: unknown;
        path: unknown;
        port: unknown;
        syscall: unknown;
        /**
         * @param {Record<string, unknown>} detail
         */
        SetDetail(detail: Record<string, unknown>): this;
        /**
         * @param {boolean} skipLog
         */
        SetSkipLog(skipLog: boolean): this;
        get isSquidError(): boolean;
        Serialize(): {
            id: number;
            detail: Record<string, unknown>;
            timeStamp: Date;
            syscall: unknown;
            port: unknown;
            path: unknown;
            info: unknown;
            errno: unknown;
            dest: unknown;
            address: unknown;
            signal: unknown;
            stack: string;
            message: string;
            name: string;
            code: unknown;
        };
    }
    export class SquidHttpError extends SquidError {
        /**
         * @param {SquidHttpErrorSettings} settings
         * @param {unknown} [nativeError]
         * @param {(...args: unknown[]) => unknown} [implementationContext]
         */
        constructor(settings: SquidHttpErrorSettings, nativeError?: unknown, implementationContext?: (...args: unknown[]) => unknown);
        /** @type {number} */
        httpStatusCode: number;
        Serialize(): {
            httpStatusCode: number;
            id: number;
            detail: Record<string, unknown>;
            timeStamp: Date;
            syscall: unknown;
            port: unknown;
            path: unknown;
            info: unknown;
            errno: unknown;
            dest: unknown;
            address: unknown;
            signal: unknown;
            stack: string;
            message: string;
            name: string;
            code: unknown;
        };
        /**
         * @param {number} status
         */
        SetHttpStatusCode(status: number): this;
    }
}
//# sourceMappingURL=squid_error.d.ts.map