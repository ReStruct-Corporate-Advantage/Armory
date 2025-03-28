import {AbstractFavoriteConfig} from '@blk/explore-ui-core';

/**
 * Model for save favorite action contents.
 */
export class SaveFavoriteAction {
    configToSave: AbstractFavoriteConfig;
    displayName: string;
    type: string;
    treeType: string;
    callback: Function;
    action: string;
    defaultToPersonal: boolean;

    /**
     * constructor
     */
    constructor(configToSave: AbstractFavoriteConfig, displayName: string, type: string, treeType?: string, callback?: Function, action?: string, defaultToPersonal?: boolean) {
        this.configToSave = configToSave;
        this.displayName = displayName;
        this.type = type;
        this.treeType = treeType;

        // callback is optional
        this.callback = callback;

        // action and updateLoading are needed only for quick save workspace
        this.action = action;

        // in case we do not need type selection box (personal / admin)
        this.defaultToPersonal = defaultToPersonal;
    }
}
