import { Scenes } from 'telegraf';

export interface MySessionScene extends Scenes.SceneSessionData {
    somePropSession: string;
}

export interface MySession extends Scenes.SceneSession<MySessionScene> {
    city: string;
    address: string;
}
