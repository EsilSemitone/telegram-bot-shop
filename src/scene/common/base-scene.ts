import 'reflect-metadata'
import { injectable } from 'inversify';
import { MyContext } from '../../common/context';
import { Scenes } from 'telegraf';
import { IScene } from './scene.interface';
import { TelegrafNextFunctionType } from './telegraf_Next_Function.type';

@injectable()
export abstract class MyScene implements IScene {
    scene: Scenes.BaseScene<MyContext>;

    async deleteLastMessage(ctx: MyContext, next: TelegrafNextFunctionType): Promise<void> {
        if (ctx.scene.session.lastMessageId) {
            try {
                await ctx.deleteMessage(ctx.scene.session.lastMessageId);
                ctx.scene.session.lastMessageId = undefined;
            } catch {
                console.log('Почему-то не смог удалить сообщение, возможно оно уже удалено');
            }
        }
        next();
    }

    saveLastMessageId(ctx: MyContext, id: number): void {
        ctx.scene.session.lastMessageId = id;
    }
}
