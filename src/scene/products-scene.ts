import 'reflect-metadata'
import { inject, injectable } from 'inversify';
import { Composer, Scenes } from "telegraf";
import { MyWizardContext } from "../common/context";
import { WizardScene } from "./common/wizard-scene";
import { IProductsService } from "../../..//api admin panel/src/products/interfaces/products.service.interface";
import { SCENES_ID } from './scenes-id';
import { TYPES } from '../../../api admin panel/src/injectsTypes';

@injectable()
export class ProductsScene extends WizardScene {
    scene: Scenes.WizardScene<MyWizardContext>;
    
    constructor(
        @inject(TYPES.productsService) public productsService: IProductsService
    ) {
        super();
        this.scene = new Scenes.WizardScene<MyWizardContext>(SCENES_ID.products, ...[this.firstStep.bind(this)])
    }

    async firstStep(ctx: MyWizardContext): Promise<void> {

        const products = await this.productsService.getAll({});
        ctx.reply('Здесь вы можете ознакомится с нашими товарами', {
            reply_markup: {
                inline_keyboard: [
                    [{text: products[0].title, callback_data: products[0].title}]
                ]
            }
        })
    }

    returnScene = (): Scenes.WizardScene<MyWizardContext> => {
        return this.scene
    }

    // productsPages() {
    //     const step = new Composer<MyWizardContext>()

    //     step
    // }
}