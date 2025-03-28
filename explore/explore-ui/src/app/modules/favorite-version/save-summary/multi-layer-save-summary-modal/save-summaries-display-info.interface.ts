import {FavoriteDisplayEnum} from '@blk/explore-ui-core';
import {WorkspaceFavoriteChange} from '@models/favorite/workspace-favorite-change.model';
import {FavoriteChange} from '@models/favorite/favorite-change.model';

/**
 * Nested enterprise favorite change information to display in save-summary-modal.
 */
export interface SaveSummariesDisplayInfo {
    // title of the display info
    title: string;
    // type of the display info - it's string for flatworkpad and report group.
    type?: FavoriteDisplayEnum | string;
    // true if the favorite is an enterprise favorite AND the component is checked during saving.
    shouldShowSaveSummary?: boolean;
    // nested enterprise favorite changes
    nestedChanges: SaveSummariesDisplayInfo[];
    // summary of the favorite change
    changeSummary?: string;
    // original object for easy mapping
    favoriteChange?: WorkspaceFavoriteChange | FavoriteChange;
}
