import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {
    AuxAdvancedTreeList,
    AuxAdvancedTreeListContextMenuClickedDetailInterface,
    AuxAdvancedTreeListDropDetailInterface,
    AuxAdvancedTreeListInterface,
    AuxAdvancedTreeListSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {map, takeUntil} from 'rxjs/operators';
import {CoreFavoriteConstants, FavoriteEnum, SubscribableComponent, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {Observable, of, throwError} from 'rxjs';
import {cloneDeep} from 'lodash';
import {FolderFavoriteTreeService} from '../folder-favorite-tree.service';
import {FavoriteUtils} from '@utils/favorite.utils';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {FavoriteTreeUtils} from '../../../../utils/favorite-tree.utils';
import {FavoriteTreeService} from '../../../../service/favorite-tree.service';
import {FavoriteTreeActionUtils} from '../../../../utils/favorite-tree-action.utils';
import {FavoriteConstants} from '@constants/favorite.constants';
import {TooltipUtils} from '@utils/tooltip.utils';

/**
 * Favorite folder structure component for the new save report component (show folders only and no leaf level favorites)
 */
@Component({
    selector: 'app-folder-favorite-tree',
    templateUrl: './folder-favorite-tree.component.html',
    styleUrls: ['folder-favorite-tree.component.scss']
})
export class FolderFavoriteTreeComponent extends SubscribableComponent implements OnChanges {
    readonly advanceTreeCustomStyle = FavoriteTreeUtils.advanceTreeCustomStyle;
    protected readonly TooltipUtils = TooltipUtils;
    @ViewChild('tree', {static: false}) tree: AuxAdvancedTreeList;

    // to update the tree dynamically based on owner
    @Input() private favoriteChange: FavoriteChange;
    @Input() private selectedUser: string;
    @Output() private folderTreeLoaded = new EventEmitter<boolean>();

    @Output()
    folderSelected = new EventEmitter<AuxAdvancedTreeListInterface>();

    rootFolderNode: AuxAdvancedTreeListInterface = {label: null, children: []};

    showStatusBadge = false;
    
    constructor(private favoriteTreeService: FavoriteTreeService, private folderFavoriteTreeService: FolderFavoriteTreeService, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit(): void {
        this.showStatusBadge = this.selectedUser === CoreFavoriteConstants.ADMIN;
        this.changeDetectorRef.detectChanges(); // Trigger change detection to update the view
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.selectedUser) {
            // Keep track of the current selected user
            const currentSelectedUser = this.selectedUser;
            this.folderTreeLoaded.emit(false);
            // Clear out allFavoriteTreeData to remove the stale favorite tree data while fetching data.
            this.rootFolderNode = {label: null, children: []};
            this.changeDetectorRef.markForCheck();

            this.generateFolderFavoriteTreeNode$()
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((treeData: AuxAdvancedTreeListInterface) => {
                    // If there was no favorite folder tree data OR
                    // The user was switched while waiting on the fetching/processing of the previous user's favorite folders
                    // Then don't set the root folder. This is to prevent a corner case race condition where the apply button was enabled,
                    // but the results of the folders came back for the previous user first (ex: personal vs. _ADMIN)
                    if (!treeData || currentSelectedUser !== this.selectedUser) {
                        return;
                    }
                    this.rootFolderNode = treeData;
                    if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENTERPRISE_WITH_SELECT_FOLDER_ENABLED) &&
                    this.selectedUser === CoreFavoriteConstants.ADMIN) {
                        // If the user is admin, then check if there are any new folders added to the tree. If yes, then enable the apply button.
                        if (this.folderFavoriteTreeService.newFavoriteChangeHoldingFolderState) {
                            this.folderTreeLoaded.emit(true);
                        } else {
                            this.folderTreeLoaded.emit(false);
                        }
                    } else {
                        this.folderTreeLoaded.emit(true);
                    }
                    this.changeDetectorRef.markForCheck();
                });
        }
    }

    /**
     * Generate favorite tree (folders only)
     */
    generateFolderFavoriteTreeNode$(): Observable<AuxAdvancedTreeListInterface> {
        const folderFavoriteType = FavoriteEnum.getFolderType(this.favoriteChange.favoriteType);

        // If we modified the tree for given selectedUser and folderFavoriteType, get it from folderChangesMap in the folderFavoriteTreeService.
        let rootFolderNode = this.folderFavoriteTreeService.folderChangesMap.get(FavoriteUtils.getCacheKey(this.selectedUser, folderFavoriteType));

        if (rootFolderNode) {
            this.folderFavoriteTreeService.generateFavoriteTreeNode(rootFolderNode, this.favoriteChange);
            return of(rootFolderNode);
        }

        return this.favoriteTreeService.getFavoriteFolderStructure$(this.selectedUser, folderFavoriteType)
            .pipe(
                map((folderFavoriteData: FavoriteFolderItem) => {
                    rootFolderNode = this.folderFavoriteTreeService.generateFavoriteTreeNode(folderFavoriteData, this.favoriteChange);
                    return rootFolderNode;
                }, error => {
                    return throwError(error);
                }));
    }

    /**
     * On node drag and drop
     */
    onNodeDragAndDrop(event: CustomEvent<AuxAdvancedTreeListDropDetailInterface>): void {
        FavoriteTreeActionUtils.updateNodeOnDragAndDrop(event, this.tree);
    }

    /**
     * Create first level folder on + Create folder button clicked
     */
    createFirstLevelFolder(): void {
        this.rootFolderNode.children = [FavoriteTreeActionUtils.createFirstLevelFolder(), ...this.rootFolderNode.children];
    }

    /**
     * On context menu clicked (create/rename/delete)
     * (on save mode)
     */
    onContextMenuClicked(event: CustomEvent<AuxAdvancedTreeListContextMenuClickedDetailInterface>): void {
        const clonedFavoriteTreeData = cloneDeep(this.rootFolderNode.children);
        FavoriteTreeActionUtils.handleFolderContextMenuActions(event.detail, clonedFavoriteTreeData);

        this.rootFolderNode.children = clonedFavoriteTreeData;
    }

    /**
     * On node selected, emit the selected folder.
     */
    onNodeSelected(event: CustomEvent<AuxAdvancedTreeListSelectionChangedDetailInterface>): void {
        const selectedNode = event.detail.value[0];
        // If the selected node is a favorite, then use its parent folder as the folder to save in. Else, use the selected node (as it will be a folder then)
        const newFolder = selectedNode?.eventData?.type === FavoriteConstants.FAVORITE ? selectedNode.parent : selectedNode;
        this.folderSelected.emit(newFolder);
    }
}
