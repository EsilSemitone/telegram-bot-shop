import { MyContext } from '../../common/context';
import { Scenes } from 'telegraf';
import { IScene } from './scene.interface';

export abstract class MyScene implements IScene {
    scene: Scenes.BaseScene<MyContext>;

    constructor(sceneId: string) {
        this.scene = new Scenes.BaseScene<MyContext>(sceneId);
    }
}
