import { Container, ContainerModule } from 'inversify';
import { ILoggerService } from './logger/logger.service.interface';
import { KEYS } from './keys';
import { LoggerService } from './logger/logger.service';
import { IConfigService } from './config/config.service.interface';
import { ConfigService } from './config/config.service';
import { App } from './app';

function buildContainer(): Container {
    const container = new Container();
    const mainModule = new ContainerModule(bind => {
        bind<ILoggerService>(KEYS.loggerService).to(LoggerService).inSingletonScope();
        bind<IConfigService>(KEYS.configService).to(ConfigService).inSingletonScope();
        bind<App>(KEYS.App).to(App);
    });
    container.load(mainModule);

    return container;
}

function main(): void {
    const container = buildContainer();
    const app = container.get<App>(KEYS.App);
    app.init();
}

main();
