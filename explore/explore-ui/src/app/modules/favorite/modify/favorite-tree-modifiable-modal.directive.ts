import {Directive} from '@angular/core';
import {
    AuxAdvancedTreeListInterface,
    AuxSelectOption,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {BehaviorSubject, Subject} from 'rxjs';

import {CommonConstants} from '@constants/index';
import {CoreUserMetaDataStore, ModalDirective} from '@blk/explore-ui-core';
import {FavoriteConstants} from '@constants/favorite.constants';
import get from 'lodash/get';
import {FavoriteTreeUtils} from '../utils/favorite-tree.utils';
import {FavoriteUtils} from '@utils/favorite.utils';

@Directive()
export abstract class FavoriteTreeModifiableModalDirective extends ModalDirective {
    // variables for saving/loading favorites and tree structure
    favType: string;
    favTreeType: string;
    favDisplayName: string;
    updateFavoriteTreeStructure$ = new Subject<{ selectedNode: AuxAdvancedTreeListInterface, title: string, id: number|string }>();

    // to subscribe the value(login) in favorite-tree
    selectedUser$: BehaviorSubject<string> = new BehaviorSubject<string>(CoreUserMetaDataStore.userMetaData.login);

    // subscribing event from favorite-tree
    selectedFavoriteNode$ = new Subject<AuxAdvancedTreeListInterface>();
    selectedNode: AuxAdvancedTreeListInterface;

    // bound with aux-text-input value and with selectedFavoriteNode$
    favoriteTitle: string;

    // originalTitle to record the original favorite title to handle cases if title is unchanged
    originalTitle: string;

    // variable for aux-select (for users with Admin perm only)
    favoriteOwnerOption: AuxSelectOptionGroup[];

    // button texts
    readonly BUTTON_TEXT = CommonConstants.BUTTON_TEXT;

    // callback from saveFavoriteAction$
    callback: Function;
    defaultToPersonal = false;

    /**
     * Show favorite owner options (Personal, Admin, and Global option)
     */
    showFavoriteOwnerOptions(favType: string): void {
        // show favoriteOwnerOptions if user has sharedFavPerm or globalFavPerm
        const showAdmin = CoreUserMetaDataStore.userMetaData.canUserSaveEnterpriseFavorites() && FavoriteConstants.ADMIN_ACCOUNT_FAVORITES.includes(favType);
        const showGlobal = FavoriteUtils.isUserAllowedToSaveGlobal(favType);

        this.favoriteOwnerOption = FavoriteTreeUtils.getFavoriteOwnerOptions(this.selectedUser$.getValue(), showAdmin, showGlobal);
    }

    /**
     * This function is available for Admin only
     * Update favorite owner on aux-select selection changed
     */
    updateFavoriteOwner(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (get(event, 'detail.value')) {
            const selectedUser = FavoriteTreeUtils.getFavoriteOwner((event.detail.value as AuxSelectOption).displayValue);
            // update favoriteTreeOwner to update the tree
            this.selectedUser$.next(selectedUser);
        }
        this.setShowButton();
    }

    abstract setShowButton(): void;
}
