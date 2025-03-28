import {ChangeDetectorRef, Directive, Input, OnInit} from '@angular/core';
import {AuxAdvancedTreeListInterface, AuxAdvancedTreeListSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {Observable} from 'rxjs';
import {FavoriteTreeDirective} from '../favorite-tree.directive';
import {FavoriteTreeUtils} from '../utils/favorite-tree.utils';
import {FavoriteUtils} from '@utils/favorite.utils';
import {ErrorTypeConstants, UIErrorParameters} from '@blk/explore-ui-core';
import {first, takeUntil} from 'rxjs/operators';
import {FavoriteStore} from '@stores/favorite.store';
import {NotificationService} from '@services/notification';
import {FavoriteTreeService} from '../service/favorite-tree.service';

/**
 * Base class for breakdown sector selector tree to provide common inputs
 */
@Directive()
export abstract class FavoriteTreeModifiableDirective extends FavoriteTreeDirective implements OnInit {

    @Input() updateFavoriteTreeStructure$: Observable<{selectedNode: AuxAdvancedTreeListInterface, title: string, id: number}>;
    isExpanded = true;

    constructor(protected notificationService: NotificationService, protected favoriteTreeService: FavoriteTreeService, protected changeDetectorRef: ChangeDetectorRef) {
        super(favoriteTreeService, changeDetectorRef);
    }

    ngOnInit() {
        super.ngOnInit();

        this.updateFavoriteTreeStructure$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(({selectedNode, title, id}) => {
                this.updateFavoriteTreeStructure(selectedNode, title, id);
                this.saveFavoriteFolderStructure();
            });
    }

    protected abstract updateFavoriteTreeStructure(selectedNode: AuxAdvancedTreeListInterface, title: string, id: number): void;

    /**
     * Save favorite folder structure
     */
    protected saveFavoriteFolderStructure = (): void => {
        const selectedUser = this.favoriteTreeOwner;
        const folderFavoriteId = FavoriteStore.folderFavCache.get(FavoriteUtils.getCacheKey(selectedUser, this.favTreeType))?.favoriteId;
        const folderFavoriteData = FavoriteTreeUtils.generateFolderFavoriteDataToSave(folderFavoriteId, this.allFavoriteTreeData);

        this.favoriteTreeService.saveFavoriteFolderStructure$(folderFavoriteData, this.favTreeType, selectedUser)
            .pipe(first())
            .subscribe(() => {
                this.notificationService.success('Successfully saved favorite folder structure.');
            }, error => {
                console.log(error);
                this.notificationService.error('Failed to save favorite folder structure.', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_UPDATE_FAVORITE_FOLDER_ITEM_TO_SAVE_ERROR);
            });
    }

    /**
     * On favorite Selected
     * Overridden function
     */
    onFavoriteSelected(event: CustomEvent<AuxAdvancedTreeListSelectionChangedDetailInterface>): void {
        const node: AuxAdvancedTreeListInterface = event.detail.value[0];
        if (node) {
            // update the node to the parent
            this.selectedFavoriteNode$.next(node);
        }
    }
}
