import { inject, injectable } from 'inversify';
import { config } from 'dotenv';
import type { DotenvParseOutput } from 'dotenv';
import 'reflect-metadata';
import { IConfigService } from './config.service.interface';
import { KEYS } from '../keys';
import { ILoggerService } from '../logger/logger.service.interface';

@injectable()
export class ConfigService implements IConfigService {
    config: DotenvParseOutput;

    constructor(@inject(KEYS.loggerService) private logger: ILoggerService) {
        const { parsed, error } = config();
        if (error) {
            throw new Error('Произошла ошибка при чтении файла .env ' + JSON.stringify(error));
        }
        if (parsed) {
            this.config = parsed;
        }
    }

    get(key: string): string {
        return this.config[key];
    }
}
