import 'reflect-metadata';
import { Logger } from 'tslog';
import { ILoggerService } from './logger.service.interface';
import { injectable } from 'inversify';

@injectable()
export class LoggerService implements ILoggerService {
    logger: Logger<object>;

    constructor() {
        this.logger = new Logger();
    }

    info(...args: unknown[]): void {
        this.logger.info(args);
    }
    error(...args: unknown[]): void {
        this.logger.error(args);
    }
    warn(...args: unknown[]): void {
        this.logger.warn(args);
    }
}
