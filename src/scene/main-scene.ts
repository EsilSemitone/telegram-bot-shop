import 'reflect-metadata'
import { MyContext } from '../common/context';
import { TelegrafNextFunctionType } from './common/telegraf_Next_Function.type';
import { MyScene } from './common/base-scene';
import { SCENES_ID } from './scenes-id';
import { injectable } from 'inversify';
import { Scenes } from 'telegraf';

@injectable()
export class MainScene extends MyScene {
    constructor() {
        super();
        this.scene = new Scenes.BaseScene(SCENES_ID.main)
        this.scene.enter(this.enter.bind(this));
        this.scene.hears('Товары🎠', async (ctx) => {ctx.scene.enter(SCENES_ID.products)});
        // this.scene.hears('Корзина🧺');
        this.scene.hears('Изменить данные⚙️', async (ctx) => {ctx.scene.enter(SCENES_ID.quiz)});
    }

    async enter(ctx: MyContext, next?: TelegrafNextFunctionType): Promise<void> {
        await ctx.reply(
            'Мы рады видеть вас снова',
            {
                reply_markup: {
                    keyboard: [['Товары🎠', 'Корзина🧺'], ['Изменить данные⚙️']],
                    is_persistent: true,
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            },
        );
    }
}
