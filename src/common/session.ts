import { Scenes } from 'telegraf';

export interface MySessionScene extends Scenes.SceneSessionData {
    lastMessageId: number | undefined;
}

export interface MySession extends Scenes.SceneSession<MySessionScene> {
    city: string;
    address: string;
}

export interface MyWizardSession extends Scenes.SceneSession<MyWizardSessionScene> {
    city: string;
    address: string;
}

export interface MyWizardSessionScene extends Scenes.WizardSessionData {
    lastMessageId: number | undefined;
}