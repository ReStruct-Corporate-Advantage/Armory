import {ChangeDetectorRef, Component, Input, ViewChild} from '@angular/core';
import {
    AuxAdvancedTreeList,
    AuxAdvancedTreeListContextMenuClickedDetailInterface,
    AuxAdvancedTreeListDropDetailInterface,
    AuxAdvancedTreeListInterface
} from '@blk/aladdin-angular-components';
import {takeUntil} from 'rxjs/operators';
import {cloneDeep} from 'lodash';
import {FavoriteService} from '@services/favorite';
import {NotificationService} from '@services/notification';
import {FavoriteTreeService} from '../../../service/favorite-tree.service';
import {FavoriteTreeModifiableDirective} from '../../favorite-tree-modifiable.directive';
import {FavoriteTreeUtils} from '../../../utils/favorite-tree.utils';
import {
    AbstractFavoriteConfig,
    ErrorTypeConstants,
    ExploreDeleteFavoriteEventLocation,
    UIErrorParameters
} from '@blk/explore-ui-core';
import {FavoriteTreeActionUtils} from '../../../utils/favorite-tree-action.utils';
import {TooltipUtils} from '@utils/tooltip.utils';

/**
 * Favorite Tree Save Mode Component inherits FavoriteTreeComponent
 *  handles to update favorite folder structure with contextMenu and drag and drop
 *  makes http calls to save folder structure and to delete favorites
 */
@Component({
    selector: 'app-favorite-tree-save-mode',
    templateUrl: './favorite-tree-save-mode.component.html',
    styleUrls: ['./favorite-tree-save-mode.component.scss']
})
export class FavoriteTreeSaveModeComponent extends FavoriteTreeModifiableDirective {
    @ViewChild('tree', {static: false}) tree: AuxAdvancedTreeList;

    @Input() configToSave: AbstractFavoriteConfig;
    protected readonly TooltipUtils = TooltipUtils;

    /**
     * constructor
     */
    constructor(protected favoriteTreeService: FavoriteTreeService, protected favoriteService: FavoriteService, protected notificationService: NotificationService, protected changeDetectorRef: ChangeDetectorRef) {
        super(notificationService, favoriteTreeService, changeDetectorRef);
        this.saveMode = true;
    }

    protected updateFavoriteTreeStructure(selectedNode: AuxAdvancedTreeListInterface, title: string, id: number): void {
        this.removeNodeFromOriginalFolder(title, this.allFavoriteTreeData);
        this.addFavoriteToSelectedNode(selectedNode, title, id);
    }

    /**
     * Add favorite to the selected folder
     */
    private addFavoriteToSelectedNode(selectedNode: AuxAdvancedTreeListInterface, title: string, id: number): void {
        const newChild: AuxAdvancedTreeListInterface = {
            label: title,
            eventData: {favoriteId: id}
        };
        selectedNode.children.push(newChild);
    }

    /**
     * Remove favorite from its original folder when it is being saved into a different folder
     */
    private removeNodeFromOriginalFolder(value: string, nodeList: AuxAdvancedTreeListInterface[]): void {
        const originalNode = this.findNodeWithLabel(value, nodeList);
        const originalParent = originalNode?.parent;

        if (originalParent) {
            const uid = originalNode.parent.uid;
            FavoriteTreeActionUtils.removeSelectedNodeAndUpdateParent(originalParent, uid);
        }
    }

    /**
     * Find node using the favorite label
     */
    private findNodeWithLabel(value: string, nodes: AuxAdvancedTreeListInterface[]): AuxAdvancedTreeListInterface {
        for (const node of nodes) {
            if (node.label === value) {
                return node;
            }
            let childNode;
            if (node.children) {
                childNode = this.findNodeWithLabel(value, node.children);
            }
            if (childNode) {
                return childNode;
            }
        }
    }

    /**
     * On folder renamed
     * this event is getting called after create/rename folder
     */
    onFolderRenamed(): void {
        this.saveFavoriteFolderStructure();
    }

    /**
     * On node drag and drop
     */
    onNodeDragAndDrop(event: CustomEvent<AuxAdvancedTreeListDropDetailInterface>): void {
        FavoriteTreeActionUtils.updateNodeOnDragAndDrop(event, this.tree, this.saveFavoriteFolderStructure);
    }

    /**
     * On context menu clicked (create/rename/delete)
     * (on save mode)
     */
    onContextMenuClicked(event: CustomEvent<AuxAdvancedTreeListContextMenuClickedDetailInterface>): void {
        const menuItem = event.detail;
        const clonedFavoriteTreeData = cloneDeep(this.allFavoriteTreeData);

        FavoriteTreeActionUtils.handleFolderContextMenuActions(event.detail, clonedFavoriteTreeData, this.saveFavoriteFolderStructure);
        if (FavoriteTreeUtils.getFavoriteDeleteLabel(this.favDisplayName) === menuItem.label) {
            this.performDeleteFavoriteOperation(menuItem, clonedFavoriteTreeData);
        }
        this.allFavoriteTreeData = clonedFavoriteTreeData;
    }

    private performDeleteFavoriteOperation(menuItem: AuxAdvancedTreeListContextMenuClickedDetailInterface, clonedFavoriteTreeData: AuxAdvancedTreeListInterface[]) {
        this.deleteFavorite(menuItem.value.eventData.favoriteId, menuItem.value.label);

        // Telemetry section added
        this.favoriteService.postDeleteTelemetry(
            ExploreDeleteFavoriteEventLocation.EXPLORE_DELETE_FAVORITE_EVENT_LOCATION_SAVE,
            menuItem.value.eventData.type,
            menuItem.value.eventData.favoriteId,
            menuItem.value.label,
            this.favoriteTreeOwner);

        // if the clicked node's parent is not a root, then also save updated favorite folder structure
        FavoriteTreeActionUtils.removeSelectedNodeAndUpdateParent(
            FavoriteTreeUtils.findParentNode(clonedFavoriteTreeData, menuItem.value.uid),
            menuItem.value.uid,
            () => this.saveFavoriteFolderStructure()
        );
    }

    /**
     * Delete favorite
     */
    private deleteFavorite(favoriteId: number, favoriteTitle: string): void {
        this.favoriteService.deleteFavorite$(favoriteId, this.favType, favoriteTitle, this.favoriteTreeOwner)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                this.notificationService.success('Successfully deleted the favorite: ' + favoriteTitle);
                // If the favoriteId matches the current configToSave's id, the user has deleted the existing underlying favorite
                // Setting id to undefined will treat is as a new favorite
                if (favoriteId === this.configToSave.id) {
                    this.configToSave.id = undefined;
                }
            }, _error => {
                this.notificationService.error('Failed to delete favorite: ' + favoriteTitle, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_DELETE_FAVORITE_ERROR);
            });
    }

    /**
     * Create first level folder on + Create folder button clicked
     */
    createFirstLevelFolder(): void {
        this.allFavoriteTreeData = [FavoriteTreeActionUtils.createFirstLevelFolder(), ...this.allFavoriteTreeData];
    }
}
