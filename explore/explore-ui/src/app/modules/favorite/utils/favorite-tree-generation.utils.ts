import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {FavoriteConstants} from '@constants/favorite.constants';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';
import {CoreFavoriteConstants, Favorite, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {CompositionConstants} from '@constants/composition.constants';
import {flatMap, includes, isEmpty} from 'lodash';
import {FavoriteUtils} from '@utils/favorite.utils';
import {FavoriteTreeActionUtils} from './favorite-tree-action.utils';
import { FavoriteStore } from '@stores/favorite.store';

/**
 * Favorite utility library that is used for common favorite tree methods.
 */
export class FavoriteTreeGenerationUtils {

    static createFavoriteTree(favoriteFolder: FavoriteFolderItem, selectedOwner: string, favType: string, favTreeType: string, favDisplayName: string, slimFavorites: Favorite[], isSaveMode: boolean, isExpanded: boolean): AuxAdvancedTreeListInterface[] {
        const isGlobal = selectedOwner === CoreFavoriteConstants.GLOBAL_USER;

        // flatten the list of list, if it's a portfolio folder
        if (favTreeType === FavoriteConstants.PORTFOLIO_FOLDER) {
            slimFavorites = flatMap(slimFavorites, slimFavorite => slimFavorite);
        }

        const favMap: Map<number|string, Favorite> = new Map<number, Favorite>();
        for (const favorite of slimFavorites) {
            favMap.set(favorite.id, favorite);
        }

        const addedFavoriteIds: number[] = [];
        const tree = FavoriteTreeGenerationUtils.createAuxFavTreeData(favoriteFolder, favType, favMap, addedFavoriteIds, isExpanded, isGlobal, isSaveMode, true, favDisplayName);

        if (!tree.children) {
            tree.children = [];
        }

        // This is not to add missing favorites for load global layout (aladdin template).
        if (!FavoriteUtils.isAladdinTemplate(isSaveMode, isGlobal, favType)) {
            FavoriteTreeGenerationUtils.addMissingFavoriteNodes(slimFavorites, tree, addedFavoriteIds, isSaveMode, favDisplayName, FavoriteTreeGenerationUtils.whatIfFavoriteTypesToFilterOn(isSaveMode, favType));
        }

        FavoriteTreeGenerationUtils.sortTreeNodes(tree);
        return [...tree.children];
    }

    /**
     * create tree data to consume with aux-tree-list component
     */
    private static createAuxFavTreeData(data: FavoriteFolderItem, favType: string, favMap: Map<number|string, Favorite>, addedFavoriteIds: (number|string)[], isExpanded: boolean, isGlobal: boolean, isSaveMode: boolean, isRoot?: boolean, favDisplayName?: string): AuxAdvancedTreeListInterface {
        let favorite: Favorite = null;

        if (data.favoriteId) {
            // if the type of the item is 'favorite', then get favorite from favMap, then push to the addedFavoriteIds list
            if (data.type === FavoriteConstants.FAVORITE) {
                favorite = favMap.get(data.favoriteId);
            }
            // if there was no favorite found
            if (!favorite && data.type !== FavoriteConstants.FOLDER) {
                // if there are no children, then return null
                if (isEmpty(data.children)) {
                    return null;
                }
                // if there are children, then convert the type to a folder
                data.type = FavoriteConstants.FOLDER;
            }
        }

        const auxFavTreeData = FavoriteTreeGenerationUtils.createBaseAuxFavTreeData(favorite, data, favType, isExpanded, favorite?.type, favorite?.owner === CoreFavoriteConstants.ADMIN);

        switch (data.type) {
            case FavoriteConstants.FAVORITE:
                FavoriteTreeGenerationUtils.handleAuxFavTreeForFavorite(auxFavTreeData, data, favorite, favType, addedFavoriteIds, isSaveMode, favDisplayName);
                break;

            case FavoriteConstants.FOLDER:
                FavoriteTreeGenerationUtils.handleAuxFavTreeForFolder(auxFavTreeData, data, favType, favMap, addedFavoriteIds, isExpanded, isGlobal, isSaveMode, favDisplayName);
                break;
        }

        FavoriteTreeGenerationUtils.setFavDataToShowStatusTags(favorite, isSaveMode, auxFavTreeData);

        // Hide (do not display) the folders in below cases:
        //  1. All load mode && non-root empty folder
        //  2. All global && non-root empty folder
        // Otherwise do the normal processing.
        const isNonRootEmptyFolder = !isRoot && data.type === FavoriteConstants.FOLDER && isEmpty(auxFavTreeData.children);
        if ((isGlobal || !isSaveMode) && isNonRootEmptyFolder) {
            return;
        }

        return auxFavTreeData;
    }

    /**
     * Create base auxFavTreeData
     */
    public static createBaseAuxFavTreeData(favorite: Favorite, favoriteFolderItem: FavoriteFolderItem, favType: string, isExpanded: boolean, favoriteType: string, isEnterpriseAccess: boolean): AuxAdvancedTreeListInterface {
        // Get the title from the fav if there is one otherwise the folder structure.
        let label = FavoriteUtils.updateHeaderBasedOnToolName(favorite ?? favoriteFolderItem);
        const originalLabel = label;
        if (favorite?.type !== favType) {
            // This specifically applies to what if favorites.
            // In case of what if favorites we have more than one kind, against a single "PORTFOLIO_FOLDER".
            // Therefore, in order to distinguish between favorites of different kinds, we put a suffix.
            // Once the "aux advanced tree list" is capable of hiding/disabling a node, this
            // will become more intuitive visually on the UI
            const matchingFavTypeSuffix: string = CompositionConstants.WHAT_IF_FAVORITE_TYPES.get(favorite?.type);
            if (!!matchingFavTypeSuffix) {
                label += matchingFavTypeSuffix;
            }
        }

        // Applies specifically to point in time favorite (for now)
        // Here, we want to append the associated date for point in time against the label to be short in the tree.
        const extraField = favorite?.description?.split(CompositionConstants.FAV_ID_DELIMITER)?.[1];
        if (!isEmpty(extraField) && CompositionConstants.TYPES_TO_FETCH_DATE_FIELD.includes(favorite?.type)) {
            label += ' [ DATE - ' + extraField + ' ]';
        }

        const auxAdvancedTreeList = {
            label,
            isExpanded,
            eventData: {
                favoriteId: favoriteFolderItem.favoriteId,
                statusTag: favorite?.statusTag,
                type: favoriteFolderItem.children ? favoriteFolderItem.type : favType,
                ...(originalLabel === label ? {} : {originalLabel})
            } as any
        };
        if (favorite?.description) {
            // if we have an extra field, split and get 0'th index
            auxAdvancedTreeList.eventData.description = isEmpty(extraField)
                ? favorite.description
                : favorite.description.split(CompositionConstants.FAV_ID_DELIMITER)?.[0];
        }

        // when favorite is null or undefined its for the select folder modal
        if (!favorite && favoriteFolderItem.favoriteId && auxAdvancedTreeList.eventData.favoriteId && isEnterpriseAccess) {
            FavoriteTreeGenerationUtils.setSelectFolderLearnLink(auxAdvancedTreeList, favoriteType);
        }


        return auxAdvancedTreeList;
    }

    /**
     * handles aux fav tree for type favorite
     */
    private static handleAuxFavTreeForFavorite(auxFavTreeData, data: FavoriteFolderItem, favorite: Favorite, favType: string, addedFavoriteIds: (number|string)[], isSaveMode: boolean, favDisplayName?: string): void {
        // if the favorite exists and favType is a type of what-if,
        // then take the "exact" favorite type from the favorite itself
        auxFavTreeData.eventData.type = !!favorite && CompositionConstants.WHAT_IF_FAVORITE_TYPES.has(favType)
            ? favorite.type
            : favType;

        addedFavoriteIds.push(data.favoriteId);

        if (isSaveMode) {
            FavoriteTreeActionUtils.addContextMenu(auxFavTreeData, FavoriteConstants.FAVORITE, favDisplayName);
        }

        if (data.children) {
            // if a node has children, it's shown as a folder.
            // adding this because found a case where the type is favorite but it has children of an empty array.
            auxFavTreeData.children = undefined;
        }

        // Set learn link if applicable
        FavoriteTreeGenerationUtils.setLearnLink(favorite, auxFavTreeData);
    }

    /**
     * handles aux fav tree for type folder
     */
    private static handleAuxFavTreeForFolder(auxFavTreeData, data: FavoriteFolderItem, favType: string, favMap: Map<number|string, Favorite>, addedFavoriteIds: (number|string)[], isExpanded: boolean, isGlobal: boolean, isSaveMode: boolean, favDisplayName?: string): void {
        auxFavTreeData.children = [];
        auxFavTreeData.iconType = 'folder-subtle';

        if (data.children.length === 0) {
            if (isSaveMode) {
                FavoriteTreeActionUtils.addContextMenu(auxFavTreeData, FavoriteConstants.EMPTY_FOLDER);
            }
        } else {
            if (isSaveMode) {
                FavoriteTreeActionUtils.addContextMenu(auxFavTreeData, FavoriteConstants.FOLDER);
            }

            // Filter out duplication to fix the issue - BUG 1720969: duplicate favorite (same id) shown up within a folder
            const childrenWithNoDuplication = [];
            const favoriteIds = new Set();
            for (const child of data.children) {
                if (child.favoriteId && favoriteIds.has(child.favoriteId)) {
                    continue;
                }
                favoriteIds.add(child.favoriteId);
                childrenWithNoDuplication.push(child);
            }

            for (const child of childrenWithNoDuplication) {
                const childNode = FavoriteTreeGenerationUtils.createAuxFavTreeData(child, favType, favMap, addedFavoriteIds, isExpanded, isGlobal, isSaveMode, false, favDisplayName);
                if (childNode) {
                    auxFavTreeData.children.push(childNode);
                }
            }
        }
    }

    /**
     * Creates the favorite nodes in the tree that are not already present.
     */
    private static addMissingFavoriteNodes(favorites: Favorite[], tree: AuxAdvancedTreeListInterface, addedFavoriteIds: (number|string)[], isSaveMode: boolean, favDisplayName?: string, favTypes?: string[]): void {
        // if we have favTypes passed, then filter the list of favorites on them
        // else use favorites list as it is
        const favoritesToConsider: Favorite[] = !!favTypes?.length
            ? favorites.filter(favorite => favTypes.includes(favorite.type))
            : favorites;

        for (const fav of favoritesToConsider) {
            if (!includes(addedFavoriteIds, fav.id)) {
                // fav.data will generally be empty since we are fetching slim favorites, however preset breakdowns have fav.data holding the presetBreakdownId (ex. iaa_breakdown)
                const label = FavoriteUtils.updateHeaderBasedOnToolName(fav);
                const extraField = fav?.description?.split(CompositionConstants.FAV_ID_DELIMITER)?.[1];
                const extraFieldAbsent = isEmpty(extraField);
                const auxFavData: AuxAdvancedTreeListInterface = {
                    ...(extraFieldAbsent || !CompositionConstants.TYPES_TO_FETCH_DATE_FIELD.includes(fav.type) ? {label} : {label: label + ' [ DATE - ' + extraField + ' ]'}),
                    eventData: {
                        favoriteId: fav.id,
                        type: fav.type,
                        presetBreakdownId: fav.data,
                        ...(extraFieldAbsent ? {} : {originalLabel: label})
                    }
                };
                this.setFavDataToShowStatusTags(fav, isSaveMode, auxFavData);

                // Set learn link if applicable
                FavoriteTreeGenerationUtils.setLearnLink(fav, auxFavData);


                if (fav.description) {
                    // if we have an extra field, split and get 0'th index
                    auxFavData.eventData.description = extraFieldAbsent
                        ? fav.description
                        : fav.description.split(CompositionConstants.FAV_ID_DELIMITER)[0];
                }

                if (isSaveMode) {
                    FavoriteTreeActionUtils.addContextMenu(auxFavData, FavoriteConstants.FAVORITE, favDisplayName);
                }
                tree.children.push(auxFavData);
            }
        }
    }

    static setFavDataToShowStatusTags(fav: Favorite, isSaveMode: boolean, auxFavData: AuxAdvancedTreeListInterface) {
        if (fav?.statusTag && !isSaveMode && TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_STATUS_TAGS)) {
            if (fav.statusTag === CoreFavoriteConstants.FAVORITE_STATUS.DECOMMISSIONED) {
                auxFavData.col1Slot = CoreFavoriteConstants.FAVORITE_STATUS_DISPLAY_SLOTS.DECOMMISSIONED + fav.id;
            } else if (fav.statusTag === CoreFavoriteConstants.FAVORITE_STATUS.UNDER_REVIEW) {
                auxFavData.col1Slot = CoreFavoriteConstants.FAVORITE_STATUS_DISPLAY_SLOTS.UNDER_REVIEW + fav.id;
            }
        }
    }

    /**
     * sorts the data in the tree
     */
    private static sortTreeNodes(node: AuxAdvancedTreeListInterface): void {
        if (!node.children || node.children.length === 0) {
            return;
        }
        // remove all invalid children
        node.children = node.children.filter(el => {
            return el !== null;
        });

        node.children.sort((child1: AuxAdvancedTreeListInterface, child2: AuxAdvancedTreeListInterface) => {
            // All folders at top, alphabetically arranged items
            if (child1.eventData.type === FavoriteConstants.FOLDER && child2.eventData.type !== FavoriteConstants.FOLDER) {
                return -1;
            }
            if (child1.eventData.type !== FavoriteConstants.FOLDER && child2.eventData.type === FavoriteConstants.FOLDER) {
                return 1;
            }
            if (child1.label && child2.label && child1.label.toLowerCase() > child2.label.toLowerCase()) {
                return 1;
            }
            if (child1.label && child2.label && child1.label.toLowerCase() < child2.label.toLowerCase()) {
                return -1;
            }

            return 0;
        });

        for (const child of node.children) {
            FavoriteTreeGenerationUtils.sortTreeNodes(child);
        }
    }

    /**
     * Provides applicable what-if favorite types for the favorite tree
     * @param isSaveMode - if it's save or load mode
     * @param favType - favorite type
     */
    private static whatIfFavoriteTypesToFilterOn(isSaveMode: boolean, favType: string): string[] {
        // filtering the favorites by type - this applies specifically to "what-if favorites" where we are fetching
        // all applicable "what-if" kinds but want to display only those that match the type of
        // what if currently being saved/loaded
        let whatIfFavTypes: string[] = [];
        if (CompositionConstants.WHAT_IF_FAVORITE_TYPES.has(favType)) {
            if (!isSaveMode) {
                // for load mode we will populate it's adhoc counterparts as well
                if (favType === CompositionConstants.WHATIF_POS.TYPE) {
                    whatIfFavTypes = [...CompositionConstants.TYPES_TO_FETCH_DATE_FIELD];
                } else if (favType === CompositionConstants.WHATIF_RULES.TYPE) {
                    whatIfFavTypes = [CompositionConstants.WHATIF_RULES.TYPE, CompositionConstants.ADHOC_PORT_GROUP];
                }
            } else {
                // in case of save mode, we only populate, as of today, the what-if's matching the favType
                whatIfFavTypes = [favType];
            }
        }

        return whatIfFavTypes;
    }

    /**
     * Set learn link for the favorite
     */
    private static setLearnLink(favorite: Favorite, auxFavData: AuxAdvancedTreeListInterface): void {
        if (favorite?.owner === CoreFavoriteConstants.ADMIN && favorite.enterpriseDescription) {
            auxFavData.isLearnLink = true;
            auxFavData.eventData.enterpriseDescription = favorite.enterpriseDescription;
        }
    }

    /**
     * Set learn link for the select folder modal
     */
    private static setSelectFolderLearnLink(auxFavData: AuxAdvancedTreeListInterface, favoriteType: string): void {
        // get slim favorites from the cache
        const slimFavorites = FavoriteStore.slimFavCache.get(FavoriteUtils.getCacheKey(CoreFavoriteConstants.ADMIN, favoriteType));
        // get the favorite from the cache
        const favorite = slimFavorites?.find(fav => fav.id === auxFavData.eventData.favoriteId);

        // if the favorite is from admin, and has enterprise description, then set the learn link
        if (favorite?.enterpriseDescription) {
            auxFavData.isLearnLink = true;
            auxFavData.eventData.enterpriseDescription = favorite.enterpriseDescription;
        }

         // set status tag for folder
         FavoriteTreeGenerationUtils.setFavDataToShowStatusTags(favorite, false, auxFavData);
    }
}
