import { MyContext } from '../common/context';
import { MyScene } from './common/scene';
import { IScene } from './common/scene.interface';
import { Scenes } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { TelegrafNextFunctionType } from './common/telegraf_Next_Function.type';

export class QuizScene extends MyScene implements IScene {
    scene: Scenes.BaseScene<MyContext>;

    //Сломал всю голову и не понял почему если я пытаюсь просто определить это свойство и достучаться к нему через this
    // то при обращении оно становится undefined, как буд-то где-то теряется контекст но где? Или я чего-то не понимаю (
    //По этому я сделал его статичным
    static citiesKeyboard: InlineKeyboardButton.CallbackButton[][] = [
        [{ text: 'Москва', callback_data: 'Москва' }],
        [{ text: 'Санкт-Петербург', callback_data: 'Санкт-Петербург' }],
        [{ text: 'Екатеринбург', callback_data: 'Екатеринбург' }],
        [{ text: 'Тюмень', callback_data: 'Тюмень' }],
        [{ text: 'Новосибирск', callback_data: 'Новосибирск' }],
        [{ text: 'Владивосток', callback_data: 'Владивосток' }],
    ];

    constructor(sceneId: string) {
        super(sceneId);
        this.scene.enter(this.enter);
        this.scene.action('restart', this.restart, this.enter);
        this.scene.action('leave', this.leave);
        this.useCityAction();
        this.useAddressAction();
    }

    async enter(ctx: MyContext, next: TelegrafNextFunctionType): Promise<void> {
        await ctx.reply('Выберете город доставки:', {
            reply_markup: {
                inline_keyboard: QuizScene.citiesKeyboard,
            },
        });
    }

    async leave(ctx: MyContext): Promise<void> {
        const { leave } = Scenes.Stage;
        leave<MyContext>();
    }

    async restart(ctx: MyContext, next: TelegrafNextFunctionType): Promise<void> {
        ctx.session.address = '';
        ctx.session.city = '';
        return next();
    }

    useCityAction(): void {
        const callback_data = QuizScene.citiesKeyboard.map(button => {
            return button[0].callback_data;
        });

        for (const data of callback_data) {
            this.scene.action(data, async ctx => {
                ctx.session.city = data;
                await ctx.reply('Отлично, теперь введите ваш адрес:');
            });
        }
    }

    useAddressAction(): void {
        this.scene.hears(/.+/, async ctx => {
            ctx.session.address = ctx.message.text;
            await ctx.reply(`Ваш город ${ctx.session.city} \nВаш адрес ${ctx.session.address}`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Все верно', callback_data: 'leave' }],
                        [{ text: 'Изменить данные', callback_data: 'restart' }],
                    ],
                },
            });
        });
    }
}
