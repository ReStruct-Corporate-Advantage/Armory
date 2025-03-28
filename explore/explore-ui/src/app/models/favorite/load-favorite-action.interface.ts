import {FavoriteCallback} from '@models/favorite/load-favorite-action.model';
import {ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {ModalInvokeSource} from '@models/favorite/modal-invoke-source.enum';

export interface LoadFavoriteActionInterface {
    type: string;
    treeType: string;
    displayName: string;
    callback: FavoriteCallback;
    ignoreEnterpriseTree?: boolean;
    headerDisplayName: string;
    subCategoryData?: ExploreSelectOptionGroup[];
    sourceUniqueId?: string;
    source?: ModalInvokeSource;
    showAladdinFavorites?: boolean;
}
