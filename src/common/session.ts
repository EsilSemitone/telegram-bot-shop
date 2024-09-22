import { Scenes } from 'telegraf';
import { ProductsType } from '../products/products.types';
import { CartStorage } from './cart';

export interface MySessionScene extends Scenes.SceneSessionData {
    productsScene: ProductsSceneProps
}

export interface MySession extends Scenes.SceneSession<MySessionScene> {
    city: string;
    address: string;
    cart: CartStorage | undefined
}

export interface MyWizardSession extends Scenes.SceneSession<MyWizardSessionScene> {
    city: string;
    address: string;
    cart: CartStorage | undefined
}

export interface MyWizardSessionScene extends Scenes.WizardSessionData {
    productsScene: ProductsSceneProps
}

export interface ProductsSceneProps {
    category: ProductsType | undefined;
    page: number | undefined;
    size: number | undefined;
    currentProductId: number | undefined
}