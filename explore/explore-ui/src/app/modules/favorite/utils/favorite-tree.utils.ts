import {
    AuxAdvancedTreeListInterface,
    AuxSelectOption,
    AuxSelectOptionGroup
} from '@blk/aladdin-angular-components';
import {FavoriteConstants} from '@constants/favorite.constants';
import {UIConstants} from '@constants/ui.constants';
import {CoreFavoriteConstants, CoreUserMetaDataStore} from '@blk/explore-ui-core';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';

/**
 * Utility class that holds common methods used for aux components
 */
export class FavoriteTreeUtils {

    /**
     * Custom style passed into aux-advanced-tree-list
     */
    static readonly advanceTreeCustomStyle = {
        'aux-advanced-tree-list__hyperlist': {
            marginBottom: '0',
            marginTop: '0',
            width: 'auto',
            overflow: 'auto'
        }
    };

    /**
     * Get favorite owner options for aux-select
     */
    static getFavoriteOwnerOptions(login: string, showAdmin: boolean, showGlobal: boolean): AuxSelectOptionGroup[] {
        let selectedAccount: string;
        if (login === CoreFavoriteConstants.ADMIN) {
            selectedAccount = FavoriteConstants.ADMIN_ACCOUNT;
        } else if (login === CoreFavoriteConstants.GLOBAL_USER) {
            selectedAccount = FavoriteConstants.GLOBAL_ACCOUNT;
        } else {
            selectedAccount = FavoriteConstants.PERSONAL_ACCOUNT;
        }

        const options: AuxSelectOption[] = [{displayValue: FavoriteConstants.PERSONAL_ACCOUNT, isSelected: FavoriteConstants.PERSONAL_ACCOUNT === selectedAccount}];
        if (showAdmin) {
            options.push({displayValue: FavoriteConstants.ADMIN_ACCOUNT, isSelected: FavoriteConstants.ADMIN_ACCOUNT === selectedAccount});
        }
        if (showGlobal) {
            options.push({displayValue: FavoriteConstants.GLOBAL_ACCOUNT, isSelected: FavoriteConstants.GLOBAL_ACCOUNT === selectedAccount});
        }
        return [{values: options}];
    }

    /**
     * This function is available for Admin only
     * Get favorite owner on aux-select selection changed
     */
    static getFavoriteOwner(auxSelectDisplayValue: string): string {
        switch (auxSelectDisplayValue) {
            case FavoriteConstants.PERSONAL_ACCOUNT:
                return CoreUserMetaDataStore.userMetaData.login;
            case FavoriteConstants.ADMIN_ACCOUNT:
                return CoreFavoriteConstants.ADMIN;
            case FavoriteConstants.GLOBAL_ACCOUNT:
                return CoreFavoriteConstants.GLOBAL_USER;
        }
    }

    /**
     * Returns Delete Label for any favorites Display Name
     * @param favDisplayName - Favorite Display Name
     */
    static getFavoriteDeleteLabel(favDisplayName: string): string {
        return favDisplayName ? UIConstants.DELETE_FAVORITE + ' ' + favDisplayName : UIConstants.DELETE_FAVORITE;
    }

    /**
     * Find parent node from nodeList recursively
     *  returns the parent node if exists or the nodeList itself if no parent
     */
    static findParentNode(nodeList: AuxAdvancedTreeListInterface[], value: string): AuxAdvancedTreeListInterface | AuxAdvancedTreeListInterface[] {
        const clickedNode = FavoriteTreeUtils.findNode(nodeList, value);
        return clickedNode.parent || nodeList;
    }

    /**
     * Find node from nodeList recursively (DFS)
     */
    static findNode(nodes: AuxAdvancedTreeListInterface[], value: string): AuxAdvancedTreeListInterface {
        for (const node of nodes) {
            if (node.uid === value) {
                return node;
            }

            let theNodesChild;
            if (node.children) {
                theNodesChild = FavoriteTreeUtils.findNode(node.children, value);
            }

            if (theNodesChild) {
                return theNodesChild;
            }
        }
    }

    /**
     * Get folder favorite data to save from AUX nodes.
     */
    static generateFolderFavoriteDataToSave(folderFavoriteId: number|string, favoriteTreeData: AuxAdvancedTreeListInterface[]): FavoriteFolderItem {
        const folderFavoriteData = new FavoriteFolderItem({type: FavoriteConstants.FOLDER, favoriteId: folderFavoriteId});

        const folderFavoriteNodes = FavoriteTreeUtils.getFolderFavoriteNodes(favoriteTreeData);
        for (const node of folderFavoriteNodes) {
            folderFavoriteData.children.push(new FavoriteFolderItem(node));
        }
        return folderFavoriteData;
    }

    /**
     * Get favorite folder item in savable format
     */
    private static getFolderFavoriteNodes(auxTreeData: AuxAdvancedTreeListInterface[]): AuxAdvancedTreeListInterface[] {
        const folderFavoriteNodes = [];
        // get all the first level folders since folderFavCache only hold the folder type
        for (const item of auxTreeData) {
            if (item.children) {
                folderFavoriteNodes.push(item);
            }
        }

        // now update the folders with title, type, and favoriteId so it can be deserialized as FavoriteFolderItem
        folderFavoriteNodes.forEach(
            function iter(item) {
                item.title = item.label;
                item.type = item.eventData.type;
                if (item.children) {
                    item.children.forEach(iter);
                } else {
                    item.type = FavoriteConstants.FAVORITE;
                    item.favoriteId = item.eventData.favoriteId;
                }
            });
        return folderFavoriteNodes;
    }

    /**
     * Transform the folder favorite tree into FavoriteFolderItem to save
     */
    static generateFavoriteFolderItem(folderFavoriteData: AuxAdvancedTreeListInterface): FavoriteFolderItem {
        [folderFavoriteData]
            .forEach(function iter(item: any) {
                item.title = item.label;
                item.type = FavoriteConstants.FOLDER;
                if (item === folderFavoriteData) {
                    item.favoriteId = folderFavoriteData.eventData.favoriteId;
                }

                if (item.children) {
                    // First, filter out any children that are favorites and not folders
                    item.children = item.children.filter(child => child.eventData?.type !== FavoriteConstants.FAVORITE);
                    // All nested folders are under children.
                    item.children.forEach(iter);
                }

                if (item.eventData?.childFavoriteData) {
                    // To fix the existing folder favorite with duplicate favorite within the same folder issue (BUG 1723274)
                    const childFavoriteDataWithNoDuplication = [];
                    const favoriteIds = new Set();
                    for (const favoriteData of item.eventData.childFavoriteData) {
                        if (!(favoriteData instanceof FavoriteFolderItem) || !favoriteData.favoriteId || favoriteIds.has(favoriteData.favoriteId)) {
                            continue;
                        }
                        childFavoriteDataWithNoDuplication.push(favoriteData);
                        favoriteIds.add(favoriteData.favoriteId);
                    }

                    // All favorites are under eventData.childFavoriteData.
                    // Add them to children, so they can be deserialized properly.
                    item.children = [...item.children, ...childFavoriteDataWithNoDuplication];
                }
            });

        return new FavoriteFolderItem(folderFavoriteData);
    }
}
