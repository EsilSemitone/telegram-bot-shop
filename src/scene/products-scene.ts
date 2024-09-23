import 'reflect-metadata'
import { inject, injectable } from 'inversify';
import { Composer, Context, Scenes } from "telegraf";
import { MyWizardContext } from "../common/context";
import { WizardScene } from "./common/wizard-scene";
import { IProductsService } from "../../..//api admin panel/src/products/interfaces/products.service.interface";
import { SCENES_ID } from './scenes-id';
import { TYPES } from '../../../api admin panel/src/injectsTypes';
import { Products, ProductsType } from '../../../api admin panel/src/products/products.types';
import { IProductsRepository } from '../../../api admin panel/src/products/interfaces/products.repository.interface';
import { Product } from '../../../api admin panel/src/products/entity/product.entity';
import { Cart } from '../common/cart';
import { ProductsSceneProps } from '../common/session';

@injectable()
export class ProductsScene extends WizardScene {
    scene: Scenes.WizardScene<MyWizardContext>;
    public productsCategories = Object.values(Products) as ProductsType[]

    constructor(
        @inject(TYPES.productsService) public productsService: IProductsService,
        @inject(TYPES.productsRepository) public productsRepository: IProductsRepository
    ) {
        super();
        this.scene = new Scenes.WizardScene<MyWizardContext>(
            SCENES_ID.products, ...[
                this.choiceCategory.bind(this),
                this.productsList.bind(this),
                this.productCard.bind(this)
            ]
        )

        this.useActions.bind(this)();
        this.scene.hears('⚙️Изменить данные', async (ctx) => {await ctx.scene.enter(SCENES_ID.quiz)});
        this.scene.hears('🧺Корзина', async (ctx) => {await ctx.scene.enter(SCENES_ID.cart)});
    }

    async choiceCategory (ctx: MyWizardContext): Promise<void> {
        if (ctx.scene.session.productsScene === undefined) {
            ctx.scene.session.productsScene = {
                category: undefined, 
                size: 10, 
                page: 0, 
                currentProductId: undefined, 
            }
        }

        await ctx.reply('Выберите категорию товаров', {
            reply_markup: {
                inline_keyboard: [
                    ...this.productsCategories.map(category => {
                    return [{text: category, callback_data: category}]}), 
                    [{text: '◀️Назад', callback_data: 'backFirstStepCallback'}]
                ]
            }
        })
    }
    
    async productsList(ctx: MyWizardContext): Promise<void> {

        const {page, size, category} = ctx.scene.session.productsScene

        if ((page === undefined) || (size === undefined) || (category === undefined)) {
            throw new Error('page, size или category есть undefined');
        }

        const productsPage = await this.productsService.getAll({page, size, type: category});

        await ctx.reply(`Выбрана категория: ${ctx.scene.session.productsScene.category}`, {
            reply_markup: {
                inline_keyboard: [
                    ...productsPage.map(product => {
                        return [{text: `${product.title} - ${product.price}p`, callback_data: String(product.id)}]
                    }),
                    [{text: '<', callback_data: '<'}, {text: '>', callback_data: '>'}],
                    [{text: '◀️Назад', callback_data: 'backProductsListCallback'}]
                ]
            }
        })
    }

    async productCard(ctx: MyWizardContext): Promise<void> {
        if (!ctx.scene.session.productsScene.currentProductId) {
            throw new Error('При открытии карточки продукта не удалось подгрузить id продукта с сессии')
        }

        const product = await this.productsRepository.findById(ctx.scene.session.productsScene.currentProductId);

        if (!product) {
            await ctx.reply('Извините не удалось отобразить карточку товара, обратитесь в службу поддержки по адресу ...')
            return this.productsList(ctx)
        }

        const {title, description, price} = product

        await ctx.reply(`*Название*:\n${title}\n\n*Описание:*\n${description}\n\n*Цена: ${price}р*`, {reply_markup: {inline_keyboard: [
            [{text: 'Добавить в корзину', callback_data: 'addToCard'}],
            [{text: '◀️Назад', callback_data: 'backProductCardCallback'}],
        ]}})
    }

    isProductScenePropsExist<C extends MyWizardContext>(
        ctx: C, 
        ...props: Array<keyof ProductsSceneProps>
    ): boolean {
        for (const prop of props) {
            if (ctx.scene.session.productsScene[prop] === undefined) {
                return false;
            }
        }
        return true

    }

    async updateProductList(ctx: MyWizardContext): Promise<Product[] | null> {
        const {page, size, category} = ctx.scene.session.productsScene
        
        const productsPage = await this.productsService.getAll({
            page,
            size, 
            type: category
        });

        if (productsPage.length === 0) {
            return null
        }

        await ctx.editMessageText(`Выбрана категория: ${ctx.scene.session.productsScene.category}`, {
        reply_markup: {
            inline_keyboard: [
                ...productsPage.map(product => {
                    return [{text: `${product.title} - ${product.price}p`, callback_data: String(product.id)}]
                }),
                [{text: '<', callback_data: '<'}, {text: '>', callback_data: '>'}],
                [{text: '◀️Назад', callback_data: 'backProductsListCallback'}]
            ]}
        })

        return productsPage;

    }

    useActions(): void {
        //choiceCategory

        for (const category of this.productsCategories) {
            this.scene.action(category, async ctx => {
                ctx.scene.session.productsScene.category = category;
                return this.productsList(ctx);
            })
        }

        this.scene.action('backFirstStepCallback', async ctx => {
            ctx.scene.enter(SCENES_ID.main)
        })
        
        
        //productsList

        this.scene.action('<', async (ctx) => {
            if (!this.isProductScenePropsExist(ctx, 'page', 'size', 'category')) {
                throw new Error('page, size или category является undefined')
            }

            if (ctx.scene.session.productsScene.page === 0) {
                return undefined;
            }
            ctx.scene.session.productsScene.page! -= 1;
            
            const result = await this.updateProductList(ctx);

            if (!result) {
                ctx.scene.session.productsScene.page! += 1
            }
        });

        this.scene.action('>', async (ctx) => {
            if (!this.isProductScenePropsExist(ctx, 'page', 'size', 'category')) {
                throw new Error('page, size или category является undefined')
            }
            ctx.scene.session.productsScene.page! += 1;
            
            const result = await this.updateProductList(ctx);

            if (!result) {
                ctx.scene.session.productsScene.page! -= 1
            }
        });

        this.scene.action('backProductsListCallback', async (ctx) => {
            return this.choiceCategory(ctx)
        });

        this.scene.action(/\d+/, async (ctx) => {
            ctx.scene.session.productsScene.currentProductId = Number(ctx.match[0]);
            return this.productCard(ctx)
        });


        //productCard

        this.scene.action('addToCard', async (ctx) => {
            if (!this.isProductScenePropsExist(ctx, 'currentProductId')) {
                throw new Error('Не удалось получить id актуального продукта')
            }
            const product = await this.productsRepository.findById(ctx.scene.session.productsScene.currentProductId!);

            if (!product) {
                await ctx.reply(
                    'Приносим извинения, к сожалению товар нельзя добавить в корзину, обратитесь в поддержку. ID товара: ' + ctx.scene.session.productsScene.currentProductId
                )
                return undefined;
            }
            Cart.add(ctx, product);
            
            await ctx.reply('Продукт успешно добавлен в вашу корзину', {reply_markup: {inline_keyboard: [
                [{text: "Перейти в корзину", callback_data: 'leaveToCart'}]
            ]}})
        })

        this.scene.action('backProductCardCallback', async (ctx) => {
            return this.productsList(ctx)
        });

        //addToCard

        this.scene.action('leaveToCart', async (ctx) => {
            ctx.scene.enter(SCENES_ID.cart)
        });
    }
}