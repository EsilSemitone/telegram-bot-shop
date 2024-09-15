import { Container, ContainerModule } from 'inversify';
import { ILoggerService } from './logger/logger.service.interface';
import { KEYS } from './keys';
import { LoggerService } from './logger/logger.service';
import { IConfigService } from './config/config.service.interface';
import { ConfigService } from './config/config.service';
import {prismaModule , productsModule} from '../../api admin panel/src/main'
import { App } from './app';
import { MainScene } from './scene/main-scene';
import { ProductsScene } from './scene/products-scene';
import { QuizScene } from './scene/quiz';

function buildContainer(): Container {
    
    const container = new Container();
    const mainModule = new ContainerModule(bind => {
        bind<App>(KEYS.app).to(App);
        bind<ILoggerService>(KEYS.logger_Service).to(LoggerService).inSingletonScope();
        bind<IConfigService>(KEYS.config_Service).to(ConfigService).inSingletonScope();
    });
    const sceneModule = new ContainerModule(bind => {
        bind<MainScene>(KEYS.main_Scene).to(MainScene).inSingletonScope()
        bind<ProductsScene>(KEYS.product_Scene).to(ProductsScene).inSingletonScope()
        bind<QuizScene>(KEYS.quiz_Scene).to(QuizScene).inSingletonScope()
    })
    container.load(mainModule)
    container.load(sceneModule)
    container.load(prismaModule)
    container.load(productsModule)
    return container;
}

export function main(): void {
    const botContainer = buildContainer();
    const app = botContainer.get<App>(KEYS.app)
    app.init();
}