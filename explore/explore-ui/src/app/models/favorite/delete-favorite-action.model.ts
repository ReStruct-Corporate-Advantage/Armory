import {AbstractFavoriteConfig} from '@blk/explore-ui-core';

/**
 * Model for delete favorite action contents.
 */
export class DeleteFavoriteAction {
    configToDelete: AbstractFavoriteConfig;
    displayName: string;
    type: string;
    treeType: string;
    callback: Function;

    /**
     * constructor
     */
    constructor(configToDeleteWorkspace: AbstractFavoriteConfig, displayName: string, type: string, treeType?: string, callback?: Function) {
        this.configToDelete = configToDeleteWorkspace;
        this.displayName = displayName;
        this.type = type;
        this.treeType = treeType;
        this.callback = callback;
    }
}
