import {Component} from '@angular/core';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {FavoriteTreeModifiableDirective} from '../../favorite-tree-modifiable.directive';
import {FavoriteTreeUtils} from '../../../utils/favorite-tree.utils';
import {FavoriteTreeActionUtils} from '../../../utils/favorite-tree-action.utils';
import {TooltipUtils} from '@utils/tooltip.utils';

/**
 *  Favorite Tree Delete Mode Component inherits FavoriteTreeComponent
 *  handles to delete favorites
 */
@Component({
    selector: 'app-favorite-tree-delete-mode',
    templateUrl: './favorite-tree-delete-mode.component.html',
    styleUrls: []
})
export class FavoriteTreeDeleteModeComponent extends FavoriteTreeModifiableDirective {

    protected readonly TooltipUtils = TooltipUtils;

    protected updateFavoriteTreeStructure(selectedNode: AuxAdvancedTreeListInterface, _title: string, _id: number): void {
        this.deleteNode(this.filteredFavoriteTreeData, selectedNode);
        this.deleteNode(this.allFavoriteTreeData, selectedNode);
    }

    /**
     * Remove selected node from the tree
     */
    private deleteNode(treeData: AuxAdvancedTreeListInterface[], selectedNode: AuxAdvancedTreeListInterface): void {
        // findParentNode returns the parent node if exists or the nodeList itself if no parent
        const clickedNodesParent = FavoriteTreeUtils.findParentNode(treeData, selectedNode.uid);
        // if the clicked node's parent is not a root, then also save updated favorite folder structure
        FavoriteTreeActionUtils.removeSelectedNodeAndUpdateParent(clickedNodesParent, selectedNode.uid);
    }
}
