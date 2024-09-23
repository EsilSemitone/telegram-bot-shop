import { Context, Scenes } from 'telegraf';
import { MySession, MySessionScene, MyWizardSession, MyWizardSessionScene } from './session';
import { SceneContextScene, WizardContextWizard } from 'telegraf/typings/scenes';

export interface BaseContext extends Context {
    session: MySession;
    scene: Scenes.SceneContextScene<MyContext, MySessionScene>;
}

export interface MyWizardContext extends Context {
    session: MyWizardSession
    scene: SceneContextScene<MyWizardContext, MyWizardSessionScene>
    wizard: WizardContextWizard<MyWizardContext>
}

export type MyContext = BaseContext & MyWizardContext
