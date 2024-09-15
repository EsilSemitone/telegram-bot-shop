import { inject, injectable } from 'inversify';
import { config } from 'dotenv';
import type { DotenvParseOutput } from 'dotenv';
import 'reflect-metadata';
import { IConfigService } from './config.service.interface';
import { KEYS } from '../keys';
import { ILoggerService } from '../logger/logger.service.interface';
import { join } from 'path';

@injectable()
export class ConfigService implements IConfigService {
    config: DotenvParseOutput;

    constructor(@inject(KEYS.logger_Service) private logger: ILoggerService) {
        const { parsed, error } = config({path: join(__dirname, '..', '..', '.env')});
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
