import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Scenes, Telegraf } from 'telegraf';
import { KEYS } from './keys';
import { IConfigService } from './config/config.service.interface';
import { MyContext } from './common/context';
import { ILoggerService } from './logger/logger.service.interface';
import { QuizScene } from './scene/quiz';
import { Command } from './command/command';
import { StartCommand } from './command/start.command';
import LocalSession from 'telegraf-session-local';
import { SCENES_ID } from './scene/scenes-id';

@injectable()
export class App {
    app: Telegraf<MyContext>;
    stage: Scenes.Stage<MyContext>;
    commands: Command[];

    constructor(
        @inject(KEYS.Config_Service) private configService: IConfigService,
        @inject(KEYS.Logger_Service) private loggerService: ILoggerService,
    ) {
        this.app = new Telegraf<MyContext>(this.configService.get('TOKEN'));
        this.stage = new Scenes.Stage<MyContext>([new QuizScene(SCENES_ID.quiz).scene]);
        this.commands = [new StartCommand(this.app)];
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
