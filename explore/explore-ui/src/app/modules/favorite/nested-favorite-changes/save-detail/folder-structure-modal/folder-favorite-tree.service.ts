import {Injectable} from '@angular/core';
import {isEmpty, isNil} from 'lodash';
import {CoreFavoriteConstants, FavoriteEnum} from '@blk/explore-ui-core';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {FavoriteConstants} from '@constants/favorite.constants';
import {FavoriteUtils} from '@utils/favorite.utils';
import {FavoriteTreeActionUtils} from '../../../utils/favorite-tree-action.utils';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {WorkspaceFavoriteChange} from '@models/favorite/workspace-favorite-change.model';
import {SavableFavoriteChange} from '@services/favorite-change-detection/favorite-change-detection.service';
import {FavoriteTreeGenerationUtils} from '../../../utils/favorite-tree-generation.utils';

/**
 * Service that holds internal favorite tree nodes state which gets generated on save modal open
 */
@Injectable()
export class FolderFavoriteTreeService {

    /**
     * map that holds all folder favorite trees to be saved until saving series get executed
     * key: owner + favoriteTreeType eg> seakim,LAYOUT_FOLDER
     * value: folder favorite tree of the owner and type
     *
     * Before submitting data, this preserves the interim states of the folder structures across all levels of favorites for different owners (access).
     * In the event that a user clicks "Cancel" on the modal, any changes made are disregarded.
     */
    folderChangesMap = new Map<string, AuxAdvancedTreeListInterface>();

    /**
     * map that holds all folder favorite changes until saving series get executed
     * key: SavableFavoriteChange
     * value: Map<FavoriteChangeFolderState, AuxAdvancedTreeListInterface> where keys (FavoriteChangeFolderState) are ["originalFolder", "newFolder"] and the values are the corresponding values.
     */
    favoriteChangeHoldingFolderStateMap = new Map<SavableFavoriteChange, Map<FavoriteChangeFolderState, AuxAdvancedTreeListInterface>>();

    // properties while tree is generated for the current FavoriteChange (each save-detail component has different FavoriteChange)
    private favoriteChange: SavableFavoriteChange;
    // setter for favoriteChange used in unit test
    set favoriteChangeSet(favoriteToSet: SavableFavoriteChange) {
        this.favoriteChange = favoriteToSet;
    }

    private currentFavoriteChangeHoldingFolderState: Map<FavoriteChangeFolderState, AuxAdvancedTreeListInterface>;
    // parentNodesMap to update expanded state for parent(s) of selected favorite.
    private parentNodesMap: Map<AuxAdvancedTreeListInterface, AuxAdvancedTreeListInterface>;


    static getFolderChangeMapKey(favoriteChange: SavableFavoriteChange): string {
        return FavoriteUtils.getCacheKey(favoriteChange.savingUser, FavoriteEnum.getFolderType(favoriteChange.favoriteType));
    }

    /**
    * Getter to retrieve the value for FavoriteChangeFolderState.NEW from currentFavoriteChangeHoldingFolderState.
    */
    get newFavoriteChangeHoldingFolderState(): any {
        return this.currentFavoriteChangeHoldingFolderState?.get(FavoriteChangeFolderState.NEW);
    }


    /**
     * Generate favorite tree
     * @param data - FavoriteFolderItem if it is first time creation, or AuxAdvancedTreeListInterface[] if it is from folderChangesMap.
     */
    generateFavoriteTreeNode(data: FavoriteFolderItem | AuxAdvancedTreeListInterface, favoriteChange: SavableFavoriteChange): AuxAdvancedTreeListInterface {
        // Set currentFavoriteChangeHoldingFolderState for the favoriteChange if it doesn't already exist.
        if (!this.favoriteChangeHoldingFolderStateMap.has(favoriteChange)) {
            this.favoriteChangeHoldingFolderStateMap.set(favoriteChange, new Map<FavoriteChangeFolderState, AuxAdvancedTreeListInterface>());
        }
        this.currentFavoriteChangeHoldingFolderState = this.favoriteChangeHoldingFolderStateMap.get(favoriteChange);

        // Clear out parentNodesMap and folderNode, and update favoriteChange at the beginning.
        this.parentNodesMap = new Map<AuxAdvancedTreeListInterface, AuxAdvancedTreeListInterface>();
        this.favoriteChange = favoriteChange;

        let rootFolderNode: AuxAdvancedTreeListInterface;
        if (!(data instanceof FavoriteFolderItem)) {
            rootFolderNode = data;
            // 1. Update the parentNodeMap to update the selected/expanded state,
            // 2. Update folderNode (that holds which holds the favorite) and the folderNode to hold favoriteChange.
            this.updateParentNodeMapAndFolderNode(rootFolderNode);
        } else {
            rootFolderNode = this.createAuxTreeNode(data, favoriteChange.favoriteType, favoriteChange.savingUser === CoreFavoriteConstants.ADMIN);
        }

        // If folderNode doesn't exist, that means the favorite is not saved within the folder favorite.
        const folderNode = this.currentFavoriteChangeHoldingFolderState.get(FavoriteChangeFolderState.ORIGINAL);
        if (folderNode) {
            // Select the folder node of the favorite and expand the parents
            folderNode.isSelected = true;
            this.expandParentNodes(folderNode);
        }

        return rootFolderNode;
    }

    /**
     * Update parentNodesMap and folderNode for existing treeNodes
     */
    private updateParentNodeMapAndFolderNode(node: AuxAdvancedTreeListInterface): void {
        // First reset all expanded and selected state.
        node.isExpanded = false;
        node.isSelected = false;

        if (node.children) {
            for (const childNode of node.children) {
                this.parentNodesMap.set(childNode, node);
                this.updateParentNodeMapAndFolderNode(childNode);
            }
        }

        if (node.eventData.childFavoriteData) {

            // ** In this context,
            // "favorites" exist in two forms: FavoriteChange and FavoriteFolderItem.
            // "favorites" are added under eventData.childFavoriteData.
            //
            // Premise: a user has "two different favorite changes" of same type, and "both are saved in the folder structure".
            //
            //  When the user opens up the folder structure modal (for the "first favorite"),
            //  1. the "first favorite" is added as FavoriteChange (the tree should hold the reference of the object, for changes to be reflected).
            //  2. all other "favorites" are added as FavoriteFolderItem (the tree should hold the "favorites", to be converted back to savable format).
            //
            //  When the user opens up the folder structure modal (for the "second favorite"),
            //  1. the "second favorite" already exists in the tree in the form of FavoriteFolderItem.
            //  2. Now, it needs to be updated to "FavoriteChange" for the reason above.

            let tempFavoriteData: FavoriteFolderItem;

            for (const childFavoriteData of node.eventData.childFavoriteData) {
                const doesFavoriteIdMatch = childFavoriteData instanceof FavoriteChange || childFavoriteData instanceof WorkspaceFavoriteChange
                    ? this.favoriteChange === childFavoriteData
                    : !isNil(this.favoriteChange.value.id) && this.favoriteChange.value.id === childFavoriteData.favoriteId;

                if (doesFavoriteIdMatch) {
                    this.currentFavoriteChangeHoldingFolderState.set(FavoriteChangeFolderState.ORIGINAL, node);
                    // If the childFavoriteData with the favoriteId is instanceof FavoriteFolderItem,
                    // set the childFavoriteData to tempFavoriteNode, and then update it to be favoriteChange.
                    if (childFavoriteData instanceof FavoriteFolderItem) {
                        tempFavoriteData = childFavoriteData;
                    }
                    break;
                }
            }
            // If tempFavoriteData exists, replace it with the favoriteChange.
            if (tempFavoriteData) {
                const folderNode = this.currentFavoriteChangeHoldingFolderState.get(FavoriteChangeFolderState.ORIGINAL);
                folderNode.eventData.childFavoriteData =
                    [...folderNode.eventData.childFavoriteData.filter(childFavoriteData => childFavoriteData !== tempFavoriteData), this.favoriteChange];
            }
        }
    }

    /**
     * Create tree node for Aux advanced tree list
     */
    private createAuxTreeNode(favoriteData: FavoriteFolderItem, favoriteType: string, isEnterpriseAccess: boolean): AuxAdvancedTreeListInterface {
        if (favoriteData.favoriteId && favoriteData.type !== FavoriteConstants.FAVORITE && favoriteData.type !== FavoriteConstants.FOLDER) {
            if (isEmpty(favoriteData.children)) {
                return null;
            }
            favoriteData.type = FavoriteConstants.FOLDER;
        }

        const label = FavoriteUtils.updateHeaderBasedOnToolName(favoriteData);

        const node = {
            label,
            eventData: {
                favoriteId: favoriteData.favoriteId
            } as any
        };

        if (favoriteData.type === FavoriteConstants.FOLDER) {
            this.handleFolderNode(node, favoriteData, favoriteType, isEnterpriseAccess);
        }

        return node;
    }

    /**
     * handles aux fav tree for type folder
     */
    private handleFolderNode(node: AuxAdvancedTreeListInterface, favoriteData: FavoriteFolderItem, favoriteType: string, isEnterpriseAccess: boolean): void {
        node.children = [];
        node.eventData.childFavoriteData = [];
        node.iconType = 'folder-subtle';

        if (favoriteData.children.length === 0) {
            FavoriteTreeActionUtils.addContextMenu(node, FavoriteConstants.EMPTY_FOLDER);
        } else {
            FavoriteTreeActionUtils.addContextMenu(node, FavoriteConstants.FOLDER);

            for (const childData of favoriteData.children) {
                let childNode: any;

                // 1. childNode is folder
                if (childData.type === FavoriteConstants.FOLDER) {
                    childNode = this.createAuxTreeNode(childData, favoriteType, isEnterpriseAccess);
                    // Update parentNodesMap if favoriteChange has favoriteId, so we can expand all parents of the favorite.
                    if (this.favoriteChange.value.id) {
                        this.parentNodesMap.set(childNode as AuxAdvancedTreeListInterface, node);
                    }
                    node.children.push(childNode as AuxAdvancedTreeListInterface);
                    continue;
                }

                // 2. childNode is favorite
                if (!isNil(this.favoriteChange.value.id) && this.favoriteChange.value.id === childData.favoriteId) {
                    // In the event that the favoriteId is a match, set childNode as the favoriteChange,
                    // so the tree holds the reference of the FavoriteChange object.
                    childNode = this.favoriteChange;
                    this.currentFavoriteChangeHoldingFolderState.set(FavoriteChangeFolderState.ORIGINAL, node);
                } else {
                    // In the absence of a match, default to the childData.
                    childNode = childData;
                }
                // Add favorite leaf nodes to node.eventData, so we have them while converting it back to FavoriteFolderItem before saving.
                node.eventData.childFavoriteData.push(childNode);
                // Create a node for each favorite
                node.children.push(FavoriteTreeGenerationUtils.createBaseAuxFavTreeData(null, childData, favoriteData.type, false, favoriteType, isEnterpriseAccess));
            }
        }
    }

    /**
     * Expand parent nodes
     */
    private expandParentNodes(childNode: AuxAdvancedTreeListInterface) {
        childNode.isExpanded = true;
        const parentNode = this.parentNodesMap.get(childNode);
        if (parentNode) {
            this.expandParentNodes(parentNode);
        }
    }
}

export enum FavoriteChangeFolderState {
    // originalFolder is the folder that holds favorite (FavoriteChange) before any user interactions.
    ORIGINAL = 'originalFolder',
    // newFolder is user selected folder that WILL hold favorite (FavoriteChange).
    NEW = 'newFolder'
}
