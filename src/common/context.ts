import { Context, Scenes } from 'telegraf';
import { MySession, MySessionScene } from './session';

export interface MyContext extends Context {
    session: MySession;
    scene: Scenes.SceneContextScene<MyContext, MySessionScene>;
}
