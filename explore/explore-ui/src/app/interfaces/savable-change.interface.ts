import {SaveMode} from '@enums/save-mode.enum';
import {FavoriteDisplayEnum, FavoriteType} from '@blk/explore-ui-core';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';

export interface SavableChange {
    // is favorite changed selected to be saved
    isSelected: boolean;
    // In the bulk saving process, if any failed requests need to be resubmitted, we don't want to resubmit the success ones.
    isSaved: boolean;
    // favorite title to save
    saveTitle: string;
    // method of saving
    saveMode: SaveMode;
    // Saving user can be "personal/admin/global" and can change from one to another with "SaveAs" option.
    savingUser: string;
    // new favorite id of the favorite - this is needed for duplicate title handling for SaveAs where the old and new favorite ids are different
    newFavoriteId: number;
    // The sequence of execution for the savingOrders is asynchronous, beginning with savingOrder 0, then 1, then 2, and so forth.
    savingOrder: number;
    // original favoriteFolderItem of the config (for folder saving / saveAs)
    // In case of saveAs, original favorite should hold the original title and favoriteId, while the new favorite should hold the title and new favoriteId.
    originalFavoriteFolderItem: FavoriteFolderItem;
    // type of the favorite, used for displaying the type of favorite that has been modified
    favoriteDisplayType: FavoriteDisplayEnum;
    // Same favoriteDisplayType can be different favoriteType based on the widgetType and WidgetInput type and name.
    // eg> REPORT, RISK_REPORT, RETURN_REPORT, MULTI_REPORT, BREAKDOWN, FAC_BKD, etc.
    favoriteType: FavoriteType;
    // save version reason for Favorities
    saveDetails?: string;
    // additional details for save version of Favorites
    saveSummary?: string;
    // user perm groups to save Enterprise favorites to
    userPermGrps: string[];
    // flag representing if missing user perm text should be shown as an error state
    showMissingUserPermError: boolean;
    lastUpdatedBy: string;
    dateLastUpdated: string;
    // enterprise description of the favorite
    enterpriseDescription?: string;
}
