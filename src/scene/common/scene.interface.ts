import { Scenes } from 'telegraf';
import { MyContext } from '../../common/context';

export interface IScene {
    scene: Scenes.BaseScene<MyContext>;
}
