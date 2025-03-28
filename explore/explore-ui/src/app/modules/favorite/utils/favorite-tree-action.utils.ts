import {
    AuxAdvancedTreeList,
    AuxAdvancedTreeListContextMenuClickedDetailInterface, AuxAdvancedTreeListDropDetailInterface,
    AuxAdvancedTreeListInterface
} from '@blk/aladdin-angular-components';
import {FavoriteConstants} from '@constants/favorite.constants';
import {UIConstants} from '@constants/ui.constants';
import {FavoriteTreeUtils} from './favorite-tree.utils';

export class FavoriteTreeActionUtils {

    /**
     * Handle context menu actions
     */
    static handleFolderContextMenuActions(menuItem: AuxAdvancedTreeListContextMenuClickedDetailInterface, favoriteTreeData: AuxAdvancedTreeListInterface[], callback?: () => void): void {
        let clickedNode: AuxAdvancedTreeListInterface;
        let clickedNodesParent: AuxAdvancedTreeListInterface | AuxAdvancedTreeListInterface[];

        switch (menuItem.label) {
            case UIConstants.CREATE_FOLDER:
                clickedNode = FavoriteTreeUtils.findNode(favoriteTreeData, menuItem.value.uid);
                clickedNode.isExpanded = true;

                const newFolder: AuxAdvancedTreeListInterface = {
                    label: UIConstants.NEW_FOLDER,
                    iconType: 'folder-subtle',
                    isEditable: true,
                    children: []
                };

                FavoriteTreeActionUtils.addContextMenu(newFolder, FavoriteConstants.EMPTY_FOLDER);
                clickedNode.children = [newFolder, ...clickedNode.children];
                break;

            case UIConstants.RENAME_FOLDER:
                clickedNode = FavoriteTreeUtils.findNode(favoriteTreeData, menuItem.value.uid);
                clickedNode.isEditable = true;
                break;

            case UIConstants.DELETE_FOLDER:
                clickedNodesParent = FavoriteTreeUtils.findParentNode(favoriteTreeData, menuItem.value.uid);
                FavoriteTreeActionUtils.removeSelectedNodeAndUpdateParent(clickedNodesParent, menuItem.value.uid, callback);
                break;
        }
    }

    /**
     * Add context menu on right click of a node
     * (on save mode ONLY)
     */
    static addContextMenu(data: AuxAdvancedTreeListInterface, nodeType: string, favDisplayName?: string): void {
        switch (nodeType) {
            case FavoriteConstants.FAVORITE:
                data.contextMenu = [{label: FavoriteTreeUtils.getFavoriteDeleteLabel(favDisplayName)}];
                break;
            case FavoriteConstants.FOLDER:
                data.contextMenu = [
                    {label: UIConstants.CREATE_FOLDER},
                    {label: UIConstants.RENAME_FOLDER}
                ];
                break;
            case FavoriteConstants.EMPTY_FOLDER:
                data.eventData = {type: FavoriteConstants.FOLDER};
                data.contextMenu = [
                    {label: UIConstants.CREATE_FOLDER},
                    {label: UIConstants.RENAME_FOLDER},
                    {label: UIConstants.DELETE_FOLDER}
                ];
                break;
        }
    }

    /**
     * Remove selected node and update parent if applicable
     */
    static removeSelectedNodeAndUpdateParent(clickedNodesParent: AuxAdvancedTreeListInterface | AuxAdvancedTreeListInterface[], uid: string, callback?: () => void): void {
        const childsOfParentNode = (Array.isArray(clickedNodesParent)) ? clickedNodesParent : clickedNodesParent.children;

        const indexOfTarget = childsOfParentNode.findIndex(
            item => item.uid === uid
        );

        childsOfParentNode.splice(indexOfTarget, 1);

        // if we have the parent node (meaning it's not root) and the parent don't hold any children, then update the context menu
        if (!Array.isArray(clickedNodesParent) && clickedNodesParent.children.length === 0) {
            FavoriteTreeActionUtils.addContextMenu(clickedNodesParent, FavoriteConstants.EMPTY_FOLDER);
        }

        if (callback) {
            // setTimeout here because at this time (on context menu clicked) the favorite tree data is not updated
            setTimeout(() => {
                callback();
            }, 10);
        }
    }

    /**
     * Update node on drag and drop
     */
    static updateNodeOnDragAndDrop(event: CustomEvent<AuxAdvancedTreeListDropDetailInterface>, tree: AuxAdvancedTreeList, callback?: Function): void {
        const node = (event.detail.srcEvent as any).composedPath()[0].closest('.aux-advanced-tree-list__hyperlist-row');
        const targetNodesUid = node && node.dataset['id'];
        tree.getDataFlat()
            .then( (dataFlat) => {
                const targetNode = dataFlat.find((item) => {
                    return item.uid === targetNodesUid;
                });

                // if adding a node into an empty folder, then update the context menu to remove delete option
                if (targetNode && targetNode.eventData.type === 'folder' && targetNode.children.length === 1) {
                    FavoriteTreeActionUtils.addContextMenu(targetNode, FavoriteConstants.FOLDER);
                }
            })
            .then(() => {
                if (callback) {
                    callback();
                }
            });
    }

    /**
     * Create first level folder
     */
    static createFirstLevelFolder(): AuxAdvancedTreeListInterface {
        const newFolder: AuxAdvancedTreeListInterface = {
            label: UIConstants.NEW_FOLDER,
            iconType: 'folder-subtle',
            isEditable: true,
            children: []
        };
        FavoriteTreeActionUtils.addContextMenu(newFolder, FavoriteConstants.EMPTY_FOLDER);

        return newFolder;
    }
}
