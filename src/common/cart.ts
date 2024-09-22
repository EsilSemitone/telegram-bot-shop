import { Product } from "../../../api admin panel/src/products/entity/product.entity";
import { MyContext, MyWizardContext } from "./context";

export type ProductFromCart = { product: Product; count: number; }
export type CartStorage = Array<ProductFromCart>

export class Cart {

    static add(ctx: MyWizardContext | MyContext, product: Product): CartStorage {
        if (ctx.session.cart === undefined) {
            ctx.session.cart = [{product, count: 1}]

            return ctx.session.cart
        }

        const foundProductIndex = ctx.session.cart.findIndex(p => p.product.id === product.id);

        if (foundProductIndex === -1) {
            ctx.session.cart.push({product, count: 1})
        }
        else {
            ctx.session.cart[foundProductIndex].count += 1;
        }

        return ctx.session.cart;
    }
    
    static delete(ctx: MyWizardContext | MyContext, product: Product): CartStorage | null {
        if (ctx.session.cart === undefined) {
            return null
        }

        const foundProductIndex = ctx.session.cart.findIndex(p => p.product.id === product.id);

        if (foundProductIndex === -1) {
            return null
        }

        if (ctx.session.cart[foundProductIndex].count <= 1) {
            ctx.session.cart.splice(foundProductIndex, 1)
            return ctx.session.cart;
        }

        ctx.session.cart[foundProductIndex].count -= 1;
        return ctx.session.cart;
    }
}