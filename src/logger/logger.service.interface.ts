export interface ILoggerService {
    info(...args: unknown[]): void;
    error(...args: unknown[]): void;
    warn(...args: unknown[]): void;
}
