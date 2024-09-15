import 'reflect-metadata'
import { injectable } from 'inversify';
import { MyContext, MyWizardContext } from '../../common/context';
import { Scenes } from 'telegraf';
import { IScene } from './scene.interface';
import { TelegrafNextFunctionType } from './telegraf_Next_Function.type';

@injectable()
export abstract class WizardScene implements IScene {
    scene: Scenes.WizardScene<MyWizardContext>

    async deleteLastMessage(ctx: MyWizardContext, next: TelegrafNextFunctionType): Promise<void> {
        if (ctx.scene.session.lastMessageId) {
            try {
                await ctx.deleteMessage(ctx.scene.session.lastMessageId);
                ctx.scene.session.lastMessageId = undefined;
            } catch {
                throw new Error('Не удалось удалить сообщение')
            }
        }
        next();
    }

    saveLastMessageId(ctx: MyContext, id: number): void {
        ctx.scene.session.lastMessageId = id;
    }
}