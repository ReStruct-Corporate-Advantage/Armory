/**
 * Model for load favorite action contents.
 */
import {LoadFavoriteActionInterface} from '@models/favorite/load-favorite-action.interface';
import {ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {ModalInvokeSource} from '@models/favorite/modal-invoke-source.enum';

export class LoadFavoriteAction {
    type: string;
    treeType: string;
    displayName: string;
    callback: FavoriteCallback;
    ignoreEnterpriseTree: boolean;
    headerDisplayName: string;
    subCategoryData?: ExploreSelectOptionGroup[];
    sourceUniqueId?: string;
    source?: ModalInvokeSource;
    showAladdinFavorites?: boolean;

    /**
     * constructor
     */
    constructor(loadFavoriteActionInterface: LoadFavoriteActionInterface) {
        if (!loadFavoriteActionInterface) {
            return;
        }

        this.type = loadFavoriteActionInterface.type;
        this.treeType = loadFavoriteActionInterface.treeType;
        this.displayName = loadFavoriteActionInterface.displayName;
        this.callback = loadFavoriteActionInterface.callback;
        this.ignoreEnterpriseTree = loadFavoriteActionInterface.ignoreEnterpriseTree;
        if (!loadFavoriteActionInterface.headerDisplayName) {
            this.headerDisplayName = loadFavoriteActionInterface.displayName;
        }
        this.headerDisplayName = loadFavoriteActionInterface.headerDisplayName;
        this.subCategoryData = loadFavoriteActionInterface.subCategoryData;
        this.sourceUniqueId = loadFavoriteActionInterface.sourceUniqueId;
        this.source = loadFavoriteActionInterface.source;
        this.showAladdinFavorites = loadFavoriteActionInterface.showAladdinFavorites;
    }
}

export type FavoriteCallback = (favId: number, loadingMessage: string, forceRefresh: boolean, isGlobal: boolean, title?: string, presetId?: string, type?: string) => void;
