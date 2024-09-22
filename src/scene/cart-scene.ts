import 'reflect-metadata'
import { MyScene } from './common/base-scene';
import { inject, injectable } from 'inversify';
import { MyContext } from '../common/context';
import { TelegrafNextFunctionType } from './common/telegraf_Next_Function.type';
import { TYPES } from '../../../api admin panel/src/injectsTypes';
import { IProductsRepository } from '../../../api admin panel/src/products/interfaces/products.repository.interface';
import { Scenes } from 'telegraf';
import { SCENES_ID } from './scenes-id';

@injectable()
export class CartScene extends MyScene {

    constructor(@inject(TYPES.productsRepository) private productRepository: IProductsRepository) {
        super()
        this.scene = new Scenes.BaseScene<MyContext>(SCENES_ID.cart)
        this.scene.enter(this.enter.bind(this));
        this.useActions.bind(this)()
    }

    async enter(ctx: MyContext, next: TelegrafNextFunctionType): Promise<void> {

        if (ctx.session.cart === undefined || ctx.session.cart.length === 0) {
            await ctx.reply('Ваша корзина пуста, добавить товары?', {reply_markup: {
                inline_keyboard: [
                    [{text: 'Перейти к товарам', callback_data: 'goToProducts'}],
                    [{text: 'В главное меню', callback_data: 'goToMain'}],
                ]
            }})
            return undefined;
        }

        const amountProducts = ctx.session.cart.reduce((sum, product) => {
            return sum + product.count
        }, 0)

        const sumPriceProducts = ctx.session.cart.reduce((sum, product) => {
            return sum + product.product.price
        }, 0)

        const bodyCart = ctx.session.cart.map(({product, count}) => {
            return `\n\n${product.title}\n${count} штук на сумму ${product.price * count}р.`
        }).join('')

        ctx.reply(
            `В козине ${amountProducts} товаров, на сумму ${sumPriceProducts}р
            ${bodyCart}
            `,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Отчистить корзину', callback_data: 'cleaningCart'}],
                        [{text: 'В главное меню', callback_data: 'goToMain'}],
                    ]
                }
            }
        )
    }

    useActions(): void {
        this.scene.action('goToProducts', async (ctx) => {
            return await ctx.scene.enter(SCENES_ID.products)
        })

        this.scene.action('goToMain', async (ctx) => {
            return await ctx.scene.enter(SCENES_ID.main)
        })
        this.scene.action('cleaningCart', async (ctx) => {
            ctx.session.cart = [];
            ctx.scene.enter(SCENES_ID.cart)
        })
    }
}