import {Injectable} from '@angular/core';
import {forkJoin, from, Observable} from 'rxjs';
import {concatMap, map} from 'rxjs/operators';
import {CoreFavoriteConstants, Favorite, SaveFavoriteResult, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {flatten} from 'lodash';

import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {SaveMode} from '@enums/save-mode.enum';
import {
    FavoriteChangeFolderState,
    FolderFavoriteTreeService
} from '../nested-favorite-changes/save-detail/folder-structure-modal/folder-favorite-tree.service';
import {FavoriteService} from '@services/favorite';
import {FavoriteTreeUtils} from '../utils/favorite-tree.utils';
import {FavoriteUtils} from '@utils/favorite.utils';
import {FavoriteTreeService} from './favorite-tree.service';
import {WorkspaceFavoriteChange} from '@models/favorite/workspace-favorite-change.model';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';
import {FavoriteConstants} from '@constants/favorite.constants';
import {DataRequestConstants} from '@constants/data-request.constants';
import {WorkpadFavoriteChange} from '@models/favorite/workpad-favorite-change.model';
import {SavableFavoriteChange} from '@services/favorite-change-detection/favorite-change-detection.service';

/**
 * Service that handle bulk saving in multiple series with sync/async combination.
 */
@Injectable()
export class BulkSavingHandlerService {
    changedFavoritesTree: SavableFavoriteChange;

    // flattenedFavoriteChanges keeps favorite changes in flattened structure.
    flattenedFavoriteChanges: SavableFavoriteChange[];

    folderChangesMap: Map<string, AuxAdvancedTreeListInterface>;

    favoriteChangeHoldingFolderStateMap: Map<SavableFavoriteChange, Map<FavoriteChangeFolderState, AuxAdvancedTreeListInterface>>;

    constructor(private favoriteTreeService: FavoriteTreeService, private favoriteService: FavoriteService) {
    }

    /**
     * Get all slimFavorites$
     */
    getAllSlimFavorites$(changedFavoritesTree: SavableFavoriteChange, flattenedFavoriteChanges: SavableFavoriteChange[]): Observable<Favorite[][]> {
        // Store changedFavoritesTree and flattenedFavoriteChanges at the beginning of saving process.
        this.changedFavoritesTree = changedFavoritesTree;
        this.flattenedFavoriteChanges = flattenedFavoriteChanges;

        // Before the bulk saving, we need to check duplicate titles in the existing favorites.
        const requests: Observable<Favorite[]>[] = [];
        for (const favoriteChange of flattenedFavoriteChanges) {
            requests.push(this.favoriteService.getSlimFavorites$(favoriteChange.savingUser, favoriteChange.favoriteType));
        }
        return forkJoin(requests);
    }

    saveChanges$(folderChangesMap: Map<string, AuxAdvancedTreeListInterface>, favoriteChangeHoldingFolderStateMap: Map<SavableFavoriteChange, Map<FavoriteChangeFolderState, AuxAdvancedTreeListInterface>>): Observable<BulkSavingResponse> {
        this.folderChangesMap = folderChangesMap;
        this.favoriteChangeHoldingFolderStateMap = favoriteChangeHoldingFolderStateMap;

        // 1. Separate the favoriteChanges to run sequentially.
        // favoriteChangesToSaveInOrder keeps favoriteChanges in the order where they can be executed sequentially.
        const favoriteChangesToSaveInOrder: SavableFavoriteChange[][] = this.getFavoriteChangesToSaveInOrder();

        // 2. After all favorites are saved, folder structures (if any) will be saved.
        const allFolderSavingKeys = this.getValidFolderChangeMapKeys();

        // 3. Save the favorite / folderFavorite series (in async) sequentially.
        return this.sequentiallySaveFavorites$(favoriteChangesToSaveInOrder, allFolderSavingKeys);
    }

    private getFavoriteChangesToSaveInOrder(): SavableFavoriteChange[][] {
        // Calculate savingOrders for the changes in the favorite tree.
        this.calculateSavingOrders(this.changedFavoritesTree);

        const favoriteChangesToSaveInOrder = [];

        for (let i = 0; i < this.flattenedFavoriteChanges.length; i++) {
            const ithOrderList = this.flattenedFavoriteChanges.filter(change => this.isSavable(change) && change.savingOrder === i);
            if (ithOrderList.length) {
                favoriteChangesToSaveInOrder.push(ithOrderList);
            }
        }
        return favoriteChangesToSaveInOrder;
    }

    private calculateSavingOrders(favoriteChange: SavableFavoriteChange): void {

        // There are two flavors of saving: "Save" and "SaveAs".
        // "Save" is just updating the contents of existing favorite (or creating a brand-new favorite but does not apply in this context/workflow).
        // "SaveAs" is creating a new favorite using the old favorite as a template.
        //
        // When saving involves just "Save", everything can go asynchronously at once, since there is no reference changing.
        // When saving involves "SaveAs", the reference of nested ("SavedAs") favorite now has to be changed, so now this has to be sequential.
        // So the parent of "SavedAs" favorite has to wait for the child to be saved first.
        //
        // eg 1> Report(Save, holds ColumnSet), ColumnSet(SaveAs, holds CustomCalc), CustomCalc(SaveAs)
        //          first order - CustomCalc
        //          second order - ColumnSet
        //          third order - Report
        //
        // eg 2> Report(Save, holds ColumnSet), ColumnSet(Save, holds CustomCalc), CustomCalc(SaveAs)
        //          first order - CustomCalc, Report (Note that Report comes in the first order because the reference of ColumnSet remains unchanged)
        //          second order - ColumnSet
        //
        // In summary, the saving order of a favorite is determined by the number of "SaveAs" child layers associated with the favorite.

        if (favoriteChange instanceof WorkspaceFavoriteChange) {
            this.calculateSavingOrdersForWorkspaceFavoriteChange(favoriteChange);
        }
        if (favoriteChange instanceof FavoriteChange) {
            this.calculateSavingOrdersForFavoriteChange(favoriteChange);
        }
    }

    private calculateSavingOrdersForWorkspaceFavoriteChange(favoriteChange: WorkspaceFavoriteChange): void {
        favoriteChange.savingOrder ??= 0;

        if (!favoriteChange.nestedChanges.length) {
            // leaf level
            return;
        }

        let selectedSaveAsNestedChanges = [];
        for (const workpadChange of favoriteChange.nestedChanges) {
            // The first part is for the recursion.  It first needs to calculate the underlying nested changes' savingOrders before calculating the savingOrder of the workspace.
            this.calculateSavingOrdersForWorkpadFavoriteChange(workpadChange);

            // The second part is to find the nested changes of workspace.
            // The saving order of workspace depends on the savingOrders of the nested changes.
            const portfolioSideSaveAsNestedChanges = workpadChange.nestedChanges.filter(nestedChange => nestedChange.isSelected && nestedChange.saveMode === SaveMode.SAVE_AS);
            const reportSideSaveAsNestedChanges = workpadChange.modifiedReports.filter(modifiedReport => modifiedReport.isSelected && modifiedReport.saveMode === SaveMode.SAVE_AS);

            const saveAsNestedChangesUnderUnsavedReport = flatten(
                workpadChange.modifiedReports
                    .filter(modifiedReport => !modifiedReport.value.id)
                    .map(unsavedReport => unsavedReport.nestedChanges.filter(nestedChange => nestedChange.isSelected && nestedChange.saveMode === SaveMode.SAVE_AS)));

            selectedSaveAsNestedChanges = [
                ...selectedSaveAsNestedChanges,
                ...portfolioSideSaveAsNestedChanges,
                ...reportSideSaveAsNestedChanges,
                ...saveAsNestedChangesUnderUnsavedReport
            ];
        }

        this.setSavingOrder(favoriteChange, selectedSaveAsNestedChanges);
    }

    private calculateSavingOrdersForWorkpadFavoriteChange(favoriteChange: WorkpadFavoriteChange): void {
        if (!favoriteChange.nestedChanges.length && !favoriteChange.modifiedReports.length) {
            // leaf level
            return;
        }

        for (const modifiedReport of favoriteChange.modifiedReports) {
            this.calculateSavingOrdersForFavoriteChange(modifiedReport);
        }
        for (const nestedChange of favoriteChange.nestedChanges) {
            this.calculateSavingOrdersForFavoriteChange(nestedChange);
        }
    }

    private calculateSavingOrdersForFavoriteChange(favoriteChange: FavoriteChange): void {
        favoriteChange.savingOrder ??= 0;

        if (!favoriteChange.nestedChanges.length) {
            // leaf level
            return;
        }
        for (const nestedChange of favoriteChange.nestedChanges) {
            this.calculateSavingOrdersForFavoriteChange(nestedChange);
        }

        // If selected favoriteChange's nestedChanges include "SaveAs", the favoriteChange's savingOrder becomes max(savingOrder of "SaveAs") + 1.
        const selectedSaveAsNestedChanges = favoriteChange.nestedChanges.filter(change => change.isSelected && change.saveMode === SaveMode.SAVE_AS);

        this.setSavingOrder(favoriteChange, selectedSaveAsNestedChanges);
    }

    setSavingOrder(favoriteChange: SavableFavoriteChange, selectedSaveAsNestedChanges: FavoriteChange[]) {
        if (selectedSaveAsNestedChanges.length) {
            favoriteChange.savingOrder = Math.max(...selectedSaveAsNestedChanges.map(change => change.savingOrder)) + 1;
        }
    }

    /**
     * Get valid folderChangeMapKeys (filter out unselected ones)
     */
    private getValidFolderChangeMapKeys(): string[] {
        // 1. Get folderChangeMapKeys from flattenedFavoriteChanges after removing unselected/duplicate items.
        const folderChangeMapKeys = new Set(
            this.flattenedFavoriteChanges
                .filter(favoriteChange => favoriteChange.isSelected)
                .map(favoriteChange => FolderFavoriteTreeService.getFolderChangeMapKey(favoriteChange))
        );

        const validFolderChangeMapKeys = [];
        // 2. If the key and the root folder is available in the folderChangesMap, add to validFolderChangeMapKeys.
        for (const folderChangeMapKey of folderChangeMapKeys) {
            if (this.folderChangesMap.has(folderChangeMapKey)) {
                validFolderChangeMapKeys.push(folderChangeMapKey);
            }
        }

        return validFolderChangeMapKeys;
    }

    /**
     * Sequentially save favorites
     * eg>
     *      FavoriteName | SaveMode | SavingOrder
     *      -------------------------------------
     *      FavReport1   | (SaveAs) | (1)
     *
     *
     *              FavReport1(Save)(1)
     *              |               |
     *   FavColSet1(Save)(1)  FavColSet2(Save)(2)
     *              |               |
     *   CustomCalc1(Save)(1)   CustomCalc2(SaveAs)(1)
     *
     *
     * Saving Process explained -
     *   1. All SavingOrder(1) get fired asynchronously
     *   2. FavColSet2 with SavingOrder(2) will be fired after the first serie, with the new favorite id of CustomCalc2.
     */
    sequentiallySaveFavorites$(favoriteChangesToSaveInOrder: SavableFavoriteChange[][], allFolderSavingKeys: string[]): Observable<BulkSavingResponse> {
        const isFolderSavingInvolved = !!allFolderSavingKeys.length;

        const savablesInOrder: SavablesInOrder = isFolderSavingInvolved
            ? [...favoriteChangesToSaveInOrder, allFolderSavingKeys]
            : favoriteChangesToSaveInOrder;

        let failedRequestItems = [];

        return from(savablesInOrder).pipe(
            // save favorites with same savingOrder in parallel
            concatMap(parallelSavables => {
                if (parallelSavables[0] instanceof FavoriteChange || parallelSavables[0] instanceof WorkspaceFavoriteChange) {
                    return this.saveFavoritesInAsync$(parallelSavables as SavableFavoriteChange[]);
                }
                return this.saveFavoriteFolderStructureInAsync$(parallelSavables as string[]);
            }),
            map((response, index) => {
                if (savablesInOrder[index][0] instanceof FavoriteChange || savablesInOrder[index][0] instanceof WorkspaceFavoriteChange) {
                    failedRequestItems = this.runPostFavoriteSavingProcess(response, savablesInOrder, index, isFolderSavingInvolved, failedRequestItems);
                } else {
                    failedRequestItems = this.handleFailedFolderSavingItems(response, savablesInOrder, index, failedRequestItems);
                }
                // console log response meta data.
                console.log(response);

                return {savablesInOrder, index, failedRequestItems};
            }));
    }

    /**
     * Save passed in favorites asynchronously, in other word - fire all save requests at once.
     */
    private saveFavoritesInAsync$(favoriteChanges: SavableFavoriteChange[]): Observable<SaveFavoriteResult[]> {
        const requests = favoriteChanges.map(favoriteChange => this.saveFavorite$(favoriteChange));
        return forkJoin(requests);
    }

    /**
     * Save favorite after parsing favorite information from FavoriteChange.
     */
    private saveFavorite$(favoriteChange: SavableFavoriteChange): Observable<SaveFavoriteResult> {
        const {value, saveTitle, savingUser, favoriteType, userPermGrps, changeSummary, changeSummaryDetails, enterpriseDescription} = favoriteChange;
        const favoriteId = favoriteChange.newFavoriteId || (favoriteChange.saveMode === SaveMode.SAVE ? value.id : null);
        // favoriteDescription holds value for global layout template permissioning.
        const favoriteDescription = this.changedFavoritesTree instanceof FavoriteChange ? this.changedFavoritesTree.favoriteDescription : null;

        // Check to make sure selected user is ADMIN before persisting perm groups
        const permGroups = savingUser === CoreFavoriteConstants.ADMIN && (userPermGrps?.length > 0 || !TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED)) ? userPermGrps : null;

        const favoriteToSave = value.createFavorite(favoriteType, favoriteId, saveTitle, favoriteDescription, changeSummaryDetails, changeSummary, permGroups, savingUser, enterpriseDescription);

        return this.favoriteService.saveFavorite$(favoriteToSave, savingUser, true);
    }

    private saveFavoriteFolderStructureInAsync$(allFolderSavingKeys: string[]): Observable<any[]> {
        // Before saving the folder structures, handle the favorite data for Save/SaveAs.
        this.handleFavoriteDataInFolderStructures();

        const requests = allFolderSavingKeys.map(folderChangesMapKey => this.saveFavoriteFolderStructure$(folderChangesMapKey));
        return forkJoin(requests);
    }

    /**
     * Save favorite folder structure after parsing favorite information from folderChangesMap.
     */
    private saveFavoriteFolderStructure$(folderChangesMapKey: string): Observable<any> {
        const folderFavoriteTree = this.folderChangesMap.get(folderChangesMapKey);

        const favoriteFolderItem = FavoriteTreeUtils.generateFavoriteFolderItem(folderFavoriteTree);

        const folderType = FavoriteUtils.getTypeFromCacheKey(folderChangesMapKey);
        const folderOwner = FavoriteUtils.getOwnerFromCacheKey(folderChangesMapKey);

        return this.favoriteTreeService.saveFavoriteFolderStructure$(favoriteFolderItem, folderType, folderOwner);
    }

    private handleFavoriteDataInFolderStructures(): void {
        // Loop through flattenedFavoriteChanges and update the folderFavoriteTrees for Save/SaveAs.
        for (const favoriteChange of this.flattenedFavoriteChanges) {

            // If there is no folderChanges for given type and user OR if favoriteChange is unselected, continue.
            const favoriteChangeHoldingFolderState = this.favoriteChangeHoldingFolderStateMap.get(favoriteChange);

            if (!favoriteChangeHoldingFolderState || !favoriteChange.isSelected) {
                continue;
            }

            if (favoriteChange.saveMode === SaveMode.SAVE) {
                // In Save mode, one favorite (same favorite id) can be in ONE folder
                const folder = favoriteChangeHoldingFolderState.get(FavoriteChangeFolderState.NEW)
                    ?? favoriteChangeHoldingFolderState.get(FavoriteChangeFolderState.ORIGINAL);

                this.replaceFavoriteChangeToFavoriteFolderItem(favoriteChange, folder);
            } else {
                // In SaveAs mode, one favorite (same favorite id) can be in maximum of ONE folder.
                const newFolder = favoriteChangeHoldingFolderState.get(FavoriteChangeFolderState.NEW);
                const oldFolder = favoriteChangeHoldingFolderState.get(FavoriteChangeFolderState.ORIGINAL);

                this.replaceFavoriteChangeToFavoriteFolderItem(favoriteChange, newFolder, oldFolder);
            }
        }
    }

    /**
     * The passed in folder(s) hold favoriteChange.
     *  Create FavoriteFolderItem and then replace it with the favoriteChange.
     */
    private replaceFavoriteChangeToFavoriteFolderItem(favoriteChange: SavableFavoriteChange, newFolder: AuxAdvancedTreeListInterface, oldFolder?: AuxAdvancedTreeListInterface): void {
        // If there is no newFolder and no oldFolder, return.
        if (!newFolder && !oldFolder) {
            return;
        }

        const newFolderItem = new FavoriteFolderItem({
            type: FavoriteConstants.FAVORITE,
            title: favoriteChange.saveTitle,
            // favoriteChange.value.id is already updated from the server response.
            favoriteId: favoriteChange.value.id
        });

        // ALL Save scenarios && SaveAs without old folder scenarios
        // "Save" mode doesn't have oldFolder, but just being explicit to make the code easier to read.
        if (!oldFolder || favoriteChange.saveMode === SaveMode.SAVE) {
            // replace favoriteChange to newFolderItem.
            newFolder.eventData.childFavoriteData = [...newFolder.eventData.childFavoriteData.filter(favoriteData => favoriteData !== favoriteChange), newFolderItem];
            return;
        }

        const oldFolderItem = favoriteChange.originalFavoriteFolderItem;

        // Duplicate favorite title case with "Save as" -
        // If a user "save as" a favorite with duplicate favorite title, the old favorite is overridden,
        // and the new favorite's content will take the place of the old one while retaining the old favorite id.
        // If the user selects a new folder to "save as" the favorite, the old favorite will be removed from the old folder (if the old favorite was initially saved within a folder).
        // If folder is not selected, the new favorite will be saved under the old folder (the old favorite will be removed, but essentially they are same in the folder structure favorite since it only holds the title and the id).
        if (oldFolderItem.favoriteId === newFolderItem.favoriteId && oldFolderItem.title === newFolderItem.title) {
            if (oldFolder && newFolder) {
                oldFolder.eventData.childFavoriteData = [...oldFolder.eventData.childFavoriteData.filter(favoriteData => favoriteData !== favoriteChange)];
                newFolder.eventData.childFavoriteData = [...newFolder.eventData.childFavoriteData.filter(favoriteData => favoriteData !== favoriteChange), newFolderItem];
            } else {
                oldFolder.eventData.childFavoriteData = [...oldFolder.eventData.childFavoriteData.filter(favoriteData => favoriteData !== favoriteChange), newFolderItem];
            }
        } else {
            if (oldFolder && newFolder) {
                oldFolder.eventData.childFavoriteData = [...oldFolder.eventData.childFavoriteData.filter(favoriteData => favoriteData !== favoriteChange), oldFolderItem];
                newFolder.eventData.childFavoriteData = [...newFolder.eventData.childFavoriteData.filter(favoriteData => favoriteData !== favoriteChange), newFolderItem];
            } else {
                oldFolder.eventData.childFavoriteData = [...oldFolder.eventData.childFavoriteData.filter(favoriteData => favoriteData !== favoriteChange), oldFolderItem, newFolderItem];
            }
        }
    }

    /**
     * Run post saving process after each favorite batch saving is complete.
     */
    private runPostFavoriteSavingProcess(responseMetaData: SaveFavoriteResult[], savablesInOrder: SavablesInOrder, index: number, isFolderSavingInvolved: boolean, failedRequestItems: BulkSavingSavable[]): BulkSavingSavable[] {
        const favoriteChanges = savablesInOrder[index] as FavoriteChange[];

        if (!responseMetaData) {
            return [...failedRequestItems, ...favoriteChanges];
        }

        for (let i = 0; i < responseMetaData.length; i++) {
            const favoriteChange = favoriteChanges[i];
            if (responseMetaData[i].status !== DataRequestConstants.SUCCESS_RESPONSE) {
                failedRequestItems.push(favoriteChange);
                continue;
            }
            favoriteChange.isSaved = true;

            // If folder saving is involved, and the saveMode for the favoriteChange is SaveAs,
            // set originalFavoriteFolderItem to handle the original favorite for folder saving.
            if (isFolderSavingInvolved && favoriteChange.saveMode === SaveMode.SAVE_AS) {
                favoriteChange.originalFavoriteFolderItem = new FavoriteFolderItem({
                    type: FavoriteConstants.FAVORITE,
                    title: favoriteChange.value.title,
                    favoriteId: favoriteChange.value.id
                });
            }

            // Update the config title, owner and favorite id.
            favoriteChange.value.title = favoriteChange.saveTitle;
            favoriteChange.value.owner = favoriteChange.savingUser;
            favoriteChange.value.id = responseMetaData[i].favoriteId;
            favoriteChange.value.enterpriseDescription = favoriteChange.enterpriseDescription;
            favoriteChange.value.currentFavoriteVersion = responseMetaData[i].currentFavoriteVersion;
            favoriteChange.value.latestFavoriteVersion = responseMetaData[i].latestFavoriteVersion;
            favoriteChange.value.versionNumber = responseMetaData[i].versionNumber;

            // clear any change detection flags on the favorite now that it has been saved
            favoriteChange.value.resetChangeDetectionFlags();
        }

        return failedRequestItems;
    }

    /**
     * This is just a guardrail, but less likely to happen unless there are some network issue.
     */
    private handleFailedFolderSavingItems(responseMetaData: any[], savablesInOrder: SavablesInOrder, index: number, failedRequestItems: BulkSavingSavable[]): BulkSavingSavable[] {
        const folderCacheKeys = savablesInOrder[index] as string[];
        if (!responseMetaData) {
            return [...failedRequestItems, ...folderCacheKeys];
        }

        for (let i = 0; i < responseMetaData.length; i++) {
            if (responseMetaData[i].status !== DataRequestConstants.SUCCESS_RESPONSE) {
                failedRequestItems.push(folderCacheKeys[i]);
            }
        }
        if (!failedRequestItems.length) {
            return failedRequestItems;
        }

        // Delete the key from folderChangesMap, so next time user submit the action, the folder is excluded for saving.
        // This process is segregated in a separate loop, since the chances are slim and doesn't always need to be performed.
        for (const folderCacheKey of folderCacheKeys) {
            if (!failedRequestItems.includes(folderCacheKey)) {
                this.folderChangesMap.delete(folderCacheKey);
            }
        }
        return failedRequestItems;
    }

    /**
     * isSavable returns the change that are selected AND NOT saved yet.
     *  isSaved is to handle a corner case where some requests fail partially; we do not want to re-save the changes that are already saved.
     */
    private isSavable(change: SavableFavoriteChange): boolean {
        return !change.isSaved && change.isSelected;
    }
}

export type SavablesInOrder = (string[]|(SavableFavoriteChange)[])[];

// string is for the folderMapCacheKey eg> seakim,LAYOUT_FOLDER
export type BulkSavingSavable = SavableFavoriteChange|string;

export interface BulkSavingResponse {
    savablesInOrder: SavablesInOrder;
    index: number;
    failedRequestItems: BulkSavingSavable[];
}
