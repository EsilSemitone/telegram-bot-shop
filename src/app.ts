import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Scenes, Telegraf } from 'telegraf';
import { KEYS } from './keys';
import { IConfigService } from './config/config.service.interface';
import { MyContext, MyWizardContext } from './common/context';
import { ILoggerService } from './logger/logger.service.interface';
import { Command } from './command/command';
import { StartCommand } from './command/start.command';
import LocalSession from 'telegraf-session-local';
import { IScene } from './scene/common/scene.interface';

@injectable()
export class App {
    app: Telegraf<MyContext>;
    stage: Scenes.Stage<MyContext | MyWizardContext>;
    commands: Command[];

    constructor(
        @inject(KEYS.config_Service) private configService: IConfigService,
        @inject(KEYS.logger_Service) private loggerService: ILoggerService,
        @inject(KEYS.main_Scene) private mainScene: IScene,
        @inject(KEYS.product_Scene) private productScene: IScene,
        @inject(KEYS.quiz_Scene) private quizScene: IScene,
        @inject(KEYS.cart_Scene) private cartScene: IScene,

    ) {
        this.app = new Telegraf<MyContext | MyWizardContext>(this.configService.get('TOKEN'));
        this.commands = [new StartCommand(this.app)];
        this.stage = new Scenes.Stage<MyContext | MyWizardContext>([
            mainScene.scene,
            productScene.scene,
            quizScene.scene,
            cartScene.scene
        ]);
    }

    useCommand(): void {
        for (const command of this.commands) {
            command.handle();
        }
    }

    useMiddleware(): void {
        this.app.use(new LocalSession({ database: 'session.json' }).middleware());
        this.app.use(this.stage.middleware());
    }

    init(): void {
        this.useMiddleware();
        this.useCommand();
        this.app.launch(() => {
            this.loggerService.info('Бот успешно запущен');
        });
    }
}
