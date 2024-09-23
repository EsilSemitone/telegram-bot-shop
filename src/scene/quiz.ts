import 'reflect-metadata'
import { MyWizardContext} from '../common/context';
import { Composer, Scenes } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { SCENES_ID } from './scenes-id';
import { WizardScene } from './common/wizard-scene';
import { injectable } from 'inversify';

@injectable()
export class QuizScene extends WizardScene {
    scene: Scenes.WizardScene<MyWizardContext>;

    static citiesKeyboard: InlineKeyboardButton.CallbackButton[][] = [
        [{ text: 'Москва', callback_data: 'Москва' }],
        [{ text: 'Санкт-Петербург', callback_data: 'Санкт-Петербург' }],
        [{ text: 'Екатеринбург', callback_data: 'Екатеринбург' }],
        [{ text: 'Тюмень', callback_data: 'Тюмень' }],
        [{ text: 'Новосибирск', callback_data: 'Новосибирск' }],
        [{ text: 'Владивосток', callback_data: 'Владивосток' }],
    ];

    static citiesActions = QuizScene.citiesKeyboard.map(button => {
        return button[0].callback_data;
    });

    constructor() {
        super()
        this.scene = new Scenes.WizardScene<MyWizardContext>(
            SCENES_ID.quiz, ...[
                this.firstStep.bind(this), 
                this.citiesSetActionsStep.bind(this)(), 
                this.addressStep.bind(this)(),
                this.finalStep.bind(this)()
            ])
        this.scene.leave(this.leave.bind(this))
    }

    async leave(ctx: MyWizardContext): Promise<void> {
        await ctx.reply('Данные успешно сохранены')
    }

    async firstStep(ctx: MyWizardContext): Promise<Scenes.WizardContextWizard<MyWizardContext>> {
        await ctx.reply('Выберете город доставки:', {
            reply_markup: {
                inline_keyboard: QuizScene.citiesKeyboard,
            },
        });   

        return ctx.wizard.next()
    }

    citiesSetActionsStep(): Composer<MyWizardContext> {
        
        const step = new Composer<MyWizardContext>();
        
        for (const city of QuizScene.citiesActions) {
            
            step.action(city, async ctx => {
                ctx.session.city = city;
                await ctx.reply('Отлично, теперь введите ваш адрес:')
                return ctx.wizard.next()
            });
        }  

        return step;
    }
    
    addressStep(): Composer<MyWizardContext> {
        
        const step = new Composer<MyWizardContext>();

        step.hears(/.+/, async (ctx) => {
            ctx.session.address = ctx.message.text;

            await ctx.reply(
                `Ваш город: ${ctx.session.city} \nВаш адрес: ${ctx.session.address}`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Все верно', callback_data: 'leave' }],
                            [{ text: 'Изменить данные', callback_data: 'restart' }],
                        ],
                    },
                },
            );
            return ctx.wizard.next()
        });
        return step;
    }

    finalStep(): Composer<MyWizardContext> {
        
        const step = new Composer<MyWizardContext>();

        step.action('leave', async ctx => {
            await ctx.scene.enter(SCENES_ID.main);
        })

        step.action('restart', async ctx => {
            //Я изломал всю голову себе и трем чат ботам GPT и так и не  понял 
            //почему ctx.wizard.selectStep(0) не вызывает первый шаг а лиш меняет курсор
            ctx.wizard.selectStep(0)
            return this.firstStep(ctx)
        })

        return step
    }
}
