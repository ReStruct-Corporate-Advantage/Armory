import {AbstractSpriteletLauncherService} from './abstract-spritelet-launcher.service';
import {Inject, Injectable} from '@angular/core';

/*
 * Service Registry class that Registers all the spritelet launchers and creates a map of action key -> SpriteletLauncher
 */
@Injectable()
export class SpriteletLauncherServiceRegistry {

    protected spriteletLaucherMap: Map<string, AbstractSpriteletLauncherService> = new Map<string, AbstractSpriteletLauncherService>();

    /**
     * spriteletLaunchers are injected as defined in widget.module.ts
     */
    constructor (@Inject(AbstractSpriteletLauncherService) protected spriteletLauncherServices: AbstractSpriteletLauncherService[]) {
        spriteletLauncherServices.forEach((spriteletLauncherService: AbstractSpriteletLauncherService) => {
            this.register(spriteletLauncherService.getSpriteletActionKey(), spriteletLauncherService);
        });
    }

    /**
     * get spritelet launcher based on action key
     *
     */
    public getSpriteletLauncherService (key: string): AbstractSpriteletLauncherService {
        return this.spriteletLaucherMap.get(key);
    }

    /**
     * Register the spriteletLauncherService to type it serves
     *
     */
    public register (key: string, spriteletLauncherService: AbstractSpriteletLauncherService): void {
        this.spriteletLaucherMap.set(key, spriteletLauncherService);
    }
}
