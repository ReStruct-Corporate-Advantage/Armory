import {Directive, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {first, takeUntil, tap} from 'rxjs/operators';
import {
    AuxButtonTypeEnum,
    AuxNotificationStyleEnum,
    AuxNotificationToastTypeEnum
} from '@blk/aladdin-angular-components';
import {
    BulkSavingAction,
    BulkSavingEventDetailsKey,
    BulkSavingLevel,
    CommonUtils,
    CoreCommonConstants,
    CoreFavoriteConstants, CoreFavoriteStore, CoreUserMetaDataStore,
    EventType, ExploreDialogParam,
    Favorite,
    ModalDirective,
    TelemetryActionConstants,
    TelemetryGenericEventParameters,
    TelemetryService,
    TokenConstants,
    TokenUtils
} from '@blk/explore-ui-core';

import {
    FavoriteChangeDetectionService,
    SavableFavoriteChange
} from '@services/favorite-change-detection/favorite-change-detection.service';
import {
    BulkSavingHandlerService,
    BulkSavingResponse,
    BulkSavingSavable,
    SavablesInOrder
} from './service/bulk-saving-handler.service';
import {
    FolderFavoriteTreeService
} from './nested-favorite-changes/save-detail/folder-structure-modal/folder-favorite-tree.service';
import {NotificationService} from '@services/notification';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {WorkspaceFavoriteChange} from '@models/favorite/workspace-favorite-change.model';
import {FavoriteUtils} from '@utils/favorite.utils';
import {FavoriteConflict} from '@models/favorite/base-favorite-change.model';
import {FavoriteStore} from '@stores/favorite.store';
import {SaveMode} from '@enums/save-mode.enum';
import {WorkspaceStore} from '@stores/workspace.store';
import {FavoriteTreeService} from './service/favorite-tree.service';
import {CommonConstants} from '@constants/common.constants';
import {WorkpadFavoriteChange} from '@models/favorite/workpad-favorite-change.model';
import {isEmpty} from 'lodash';

@Directive()
export class BulkSavingModalDirective<T extends SavableFavoriteChange> extends ModalDirective implements OnInit {
    private readonly SUCCESS_NOTIFICATION_HEADER: string = 'Saved Successfully';
    private readonly FAIL_NOTIFICATION_HEADER: string = 'Submit Unsuccessful: Return To The Page To Review And Resubmit The Changes, Displayed Below.';

    readonly FAVORITE_DUPLICATE_TITLE_WARNING_HEADER: string = 'Duplicate Component Name';
    readonly FAVORITE_DUPLICATE_TITLE_WARNING_MESSAGE: string = 'A saved component(s) already exists with that name.  If you continue, the existing saved component(s) will be overwritten.';
    readonly FAVORITE_ENTERPRISE_DUPLICATE_TITLE_WARNING_HEADER: string = 'Duplicate Enterprise Component Name';
    readonly FAVORITE_ENTERPRISE_DUPLICATE_TITLE_WARNING_MESSAGE: string = 'A saved enterprise component(s) already exists with that name. Please choose different name';

    readonly FAVORITE_CONFLICTS_WARNING_HEADER: string = 'Conflict Saving Components';
    readonly FAVORITE_CONFLICTS_WARNING_MESSAGE: string = 'You have made changes to the same saved component(s) in multiple places. If you continue, the conflicting component(s) will not be saved.';

    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly CoreCommonConstants = CoreCommonConstants;

    // flattenedFavoriteChanges keeps favorite changes in flattened structure.
    flattenedFavoriteChanges: SavableFavoriteChange[] = [];

    changedFavoritesTree: T;

    submitButtonDisabled$ = new BehaviorSubject(true);

    // fields for checking if any favorites have duplicate titles
    isDuplicateFavoriteTitles = false;
    isDuplicateEnterpriseFavoriteTitles = false;
    duplicateTitleFavorites: FavoriteConflict[];
    duplicateEnterpriseTitleFavorites: FavoriteConflict[];
    favoriteOverrideMap: Map<SavableFavoriteChange, number | string>; // favoriteChange to the favoriteId of the same title favorite in cache.

    // fields for checking if same favorite is trying to be saved in multiple places
    isConflictingFavorites = false;
    conflictingFavorites: FavoriteConflict[];
    conflictingFavoriteIds: Set<number | string>;

    // field for checking if root favorite is an admin favorite trying to be overwritten
    isAdminOverwriteWarning = false;

    // field for checking if single or multi save summaries modal to be shown
    isSingleLayerSaveSummaryModalOpen = false;
    isMultiLayerSaveSummaryModalOpen = false;

    // field for checking if root favorite is an admin favorite trying to be saved at root folder
    isFolderWarningModalOpen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    isFavoriteInFolder = false;
    isCloseAdminFolderDialog = false;

    // flag indicating if user perm error dialog is open
    isUserPermErrorDialogOpen = false;
    // contains messaging for the user perms error dialog
    userPermErrorDialog$: BehaviorSubject<ExploreDialogParam> = new BehaviorSubject(null);


    constructor(private favoriteTreeService: FavoriteTreeService, protected favoriteChangeDetectionService: FavoriteChangeDetectionService, private bulkSavingHandlerService: BulkSavingHandlerService, protected folderFavoriteTreeService: FolderFavoriteTreeService, protected notificationService: NotificationService) {
        super();
    }

    ngOnInit(): void {
        const favoriteType = this.changedFavoritesTree.favoriteType + CoreFavoriteConstants._FOLDER;
        const currentFavoriteId: any = this.changedFavoritesTree.value.id;

        this.userPermErrorDialog$.next(
            new ExploreDialogParam(
                'alert',
                'Enterprise Permissions',
                `This ${CoreFavoriteConstants.FAVORITE_DISPLAY_NAMES[this.changedFavoritesTree.favoriteDisplayType]} contains Enterprise components that require a permission group assigned to them. Please review highlighted fields and correct where needed.`,
                CommonConstants.BUTTON_TEXT.OK
            )
        );

        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENTERPRISE_WITH_SELECT_FOLDER_ENABLED)) {
            this.favoriteTreeService.checkFavoriteInFolderStructure$(this.changedFavoritesTree.savingUser, favoriteType, currentFavoriteId)
                .pipe(
                    takeUntil(this.ngUnsubscribe),
                    tap(response => {
                        if (response) {
                            this.isFavoriteInFolder = true;
                        }
                        this.submitButtonDisabled$.next(false);
                    })
                ).subscribe();
        }
    }

    /**
     * In order to check duplicate titles for saving, we need to have ALL existing favorites of the types that we are saving.
     */
    protected getAllSlimFavorites(): void {
        this.bulkSavingHandlerService.getAllSlimFavorites$(this.changedFavoritesTree, this.flattenedFavoriteChanges)
            .pipe(first())
            .subscribe(() => {
                // submit button initially disabled while pre warming the cache, after warming re-enable
                this.submitButtonDisabled$.next(false);
            });
    }

    cancelSaving(): void {
        TelemetryService.track(TelemetryActionConstants.GENERIC_EVENT, this.generateBulkSavingParameters(true));
        this.closeModal();
    }

    /**
     * Validates saving selection and either displays warning message or proceeds to save selection
     */
    validateSelectionAndSave(): void {
        if (this.isPermGroupsRequirementsFailed()) {
            return;
        }
        this.isConflictingFavorites = this.checkFavoriteConflicts();
        this.isDuplicateFavoriteTitles = this.checkDuplicateFavoriteTitles();
        this.isDuplicateEnterpriseFavoriteTitles = !!this.duplicateEnterpriseTitleFavorites?.length;
        this.isAdminOverwriteWarning = !this.isDuplicateEnterpriseFavoriteTitles && !!this.changedFavoritesTree.value.id && this.changedFavoritesTree.savingUser === CoreFavoriteConstants.ADMIN && this.changedFavoritesTree.saveMode === SaveMode.SAVE;

        if (!this.isAdminOverwriteWarning) {
            // isAdminOverwriteWarning is true only if the first-layer favorite change is an enterprise favorite.
            // Open the multi-layer save summary modal if the first-layer favorite change is NOT an enterprise favorite,
            // but it includes nested enterprise favorites.
            this.openMultiLayerSaveSummaryModalIfApplicable();
        }

        // check if token is enabled, its an admin user and is in save or save as mode
        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENTERPRISE_WITH_SELECT_FOLDER_ENABLED) &&
            (this.changedFavoritesTree.savingUser === CoreFavoriteConstants.ADMIN &&
                (this.changedFavoritesTree.saveMode === SaveMode.SAVE || this.changedFavoritesTree.saveMode === SaveMode.SAVE_AS))) {
            // check if folder is selected for save
            this.checkFavoriteInFolder();
        }

        if (!this.isAdditionalSavingConflicts()) {
            // no conflicts, allow saving to continue
            this.saveChanges();
        }
    }

    checkFavoriteInFolder(): void {
        let shouldWarnAdmin = false;
        const currentFavoriteChangeHoldingFolderState = this.folderFavoriteTreeService['currentFavoriteChangeHoldingFolderState'];

        // When the current and previous folder state are empty, it means the favorite is being saved in the root folder.
        // When the current and previous folder state are not empty, and the favorite in folder is false, it means the favorite is being saved in the root folder.
        // When the favoriteinfolder is true, and the current and previous folder state are empty and in save as mode, it means the favorite is being saved in the root folder.
        if ((currentFavoriteChangeHoldingFolderState?.size <= 0) ||
            (!currentFavoriteChangeHoldingFolderState && !this.isFavoriteInFolder) ||
            (this.isFavoriteInFolder && !currentFavoriteChangeHoldingFolderState && this.changedFavoritesTree.saveMode === SaveMode.SAVE_AS)) {
            shouldWarnAdmin = true;
        }

        this.isFolderWarningModalOpen$.next(shouldWarnAdmin);

    }

    /**
     * Checks for multiple instances of the same favorite trying to be saved.  If conflicts exist the user is presented with a dialogue, otherwise saving proceeds
     */
    private checkFavoriteConflicts(): boolean {
        const conflicts: FavoriteConflict[] = [];
        this.changedFavoritesTree.checkSavingConflicts(new Set<number>(), conflicts);

        if (conflicts.length === 0) {
            return false;
        }
        this.conflictingFavorites = [];
        this.conflictingFavoriteIds = new Set<number>();
        conflicts.forEach(conflict => {
            this.conflictingFavoriteIds.add(conflict.id);
            this.conflictingFavorites.push(conflict);
        });
        return true;
    }

    /**
     * Checks if a favorite already exists with the same type and title
     */
    private checkDuplicateFavoriteTitles(): boolean {
        this.favoriteOverrideMap = new Map<SavableFavoriteChange, number>();
        this.flattenedFavoriteChanges.filter(change => change.isSelected).forEach(favoriteChange => {
            const sameTitleFavorite = FavoriteStore.getFavoriteFromCache(favoriteChange.savingUser, favoriteChange.favoriteType, favoriteChange.saveTitle);
            if (!this.shouldOverrideFavorite(favoriteChange, sameTitleFavorite)) {
                return;
            }

            // The sameTitleFavorite will be overridden (if user continues) as we don't want duplicate titled favorites saved in the list.
            this.favoriteOverrideMap.set(favoriteChange, sameTitleFavorite.id);
        });

        if (this.favoriteOverrideMap.size === 0) {
            return false;
        }

        this.duplicateTitleFavorites = [];
        this.duplicateEnterpriseTitleFavorites = [];
        for (const favoriteChange of this.favoriteOverrideMap.keys()) {
            this.duplicateTitleFavorites.push({id: null, title: favoriteChange.saveTitle, displayType: favoriteChange.favoriteDisplayType} as FavoriteConflict);
            if (favoriteChange.savingUser === CoreFavoriteConstants.ADMIN && TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS)) {
                this.duplicateEnterpriseTitleFavorites.push({id: null, title: favoriteChange.saveTitle, displayType: favoriteChange.favoriteDisplayType} as FavoriteConflict);
            }
        }
        return true;
    }

    private shouldOverrideFavorite(favoriteChange: SavableFavoriteChange, sameTitleFavorite: Favorite): boolean {
        if (!sameTitleFavorite) {
            return false;
        }
        if (favoriteChange.saveMode === SaveMode.SAVE) {
            // In case of 'Save', if the same title favorite has different favorite ID, the favorite will be overridden.
            return favoriteChange.value.id !== sameTitleFavorite.id;
        } else {
            // In case of 'SaveAs', if the same title favorite exists and user continues, the favorite will always be overridden.
            return true;
        }
    }

    /**
     * Closes the dialog displaying the error that the user is trying to save the same favorite in multiple places
     * @param continueSaving whether user has decided to ignore the conflicts and proceed with saving
     */
    closeConflictingFavoritesDialog(continueSaving: boolean): void {
        this.isConflictingFavorites = false;
        if (continueSaving && !this.isAdditionalSavingConflicts()) {
            // Unselects any conflicting favorites and then saves all remaining selected favorites
            this.changedFavoritesTree.unselectById(this.conflictingFavoriteIds);
            this.saveChanges();
        }
    }

    /**
     * Closes the dialog displaying the error that the user is trying to save a favorite with a title that already exists
     * @param continueSaving whether user has decided to overwrite existing and proceed with saving
     */
    closeDuplicateFavoriteTitlesDialog(continueSaving: boolean): void {
        this.isDuplicateFavoriteTitles = false;
        this.isDuplicateEnterpriseFavoriteTitles = false;
        this.duplicateEnterpriseTitleFavorites = [];
        if (continueSaving && !this.isAdditionalSavingConflicts()) {
            this.favoriteOverrideMap.forEach((id: number, favoriteChange: SavableFavoriteChange) => {
                favoriteChange.newFavoriteId = id;
            });
            this.saveChanges();
        }
    }

    protected saveChanges(): void {
        TelemetryService.track(TelemetryActionConstants.GENERIC_EVENT, this.generateBulkSavingParameters());

        this.submitButtonDisabled$.next(true);
        this.bulkSavingHandlerService.saveChanges$(this.folderFavoriteTreeService.folderChangesMap, this.folderFavoriteTreeService.favoriteChangeHoldingFolderStateMap)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(({savablesInOrder, index, failedRequestItems}: BulkSavingResponse) => {

                if (index === savablesInOrder.length - 1) {
                    this.submitButtonDisabled$.next(false);

                    this.handleNotifications(savablesInOrder, failedRequestItems);

                    // Upon successful saving, refresh the current instances to update component(s) that are subscribing to the changes.
                    if (this.changedFavoritesTree instanceof WorkspaceFavoriteChange) {
                        WorkspaceStore.refreshWorkspace();
                    }
                    // refreshCurrentWorkpad can be called within refreshWorkspace but calling it explicitly here (for now) to minimize the impact.
                    WorkspaceStore.refreshCurrentWorkpad();

                    if (!failedRequestItems.length) {
                        // Close the modal once the final series of saving is complete successfully.
                        this.closeModal();
                    }
                }
                CoreFavoriteStore.favSavedNotifier$.next(null);
            });
    }

    private handleNotifications(savablesInOrder: SavablesInOrder, failedRequestItems: BulkSavingSavable[]): void {
        const successMessages = this.getSuccessMessages(savablesInOrder, failedRequestItems);
        if (successMessages.length) {
            this.notificationService.detailedMessage({
                toastType: AuxNotificationToastTypeEnum.TIMEOUT,
                header: this.SUCCESS_NOTIFICATION_HEADER,
                id: CommonUtils.generateUniqueIdAsString(),
                message: successMessages,
                notificationStyle: AuxNotificationStyleEnum.SUCCESS
            });
        }

        if (failedRequestItems.length) {
            this.notificationService.detailedMessage({
                toastType: AuxNotificationToastTypeEnum.PERSISTENT,
                header: this.FAIL_NOTIFICATION_HEADER,
                id: CommonUtils.generateUniqueIdAsString(),
                message: this.getFailedMessages(failedRequestItems),
                notificationStyle: AuxNotificationStyleEnum.ERROR
            });
        }
    }

    private getSuccessMessages(savablesInOrder: SavablesInOrder, failedRequestItems: BulkSavingSavable[]): string[] {
        const messages = [];
        for (const bulkSavingItems of savablesInOrder) {
            for (const savingItem of bulkSavingItems) {
                // If savingItem is for folder structure saving, we don't want to show it on the success message (but only on the failure message).
                if (failedRequestItems.includes(savingItem) || typeof savingItem === 'string') {
                    continue;
                }
                const messageItem = this.getListMessageItem(savingItem);
                messages.push(messageItem);
            }
        }
        return messages;
    }

    private getFailedMessages(failedRequestItems: BulkSavingSavable[]) {
        const messages = [];
        for (const failedRequestItem of failedRequestItems) {
            const messageItem = this.getListMessageItem(failedRequestItem);
            messages.push(messageItem);
        }
        return messages;
    }

    private getListMessageItem(savingItem: BulkSavingSavable): string {
        // BulkSavingSavable can be FavoriteChange|WorkspaceFavoriteChange|string where it's folderCacheKey (eg> seakim,LAYOUT_FOLDER) if it is string.
        if (savingItem instanceof FavoriteChange || savingItem instanceof WorkspaceFavoriteChange) {
            const favoriteChange = savingItem as SavableFavoriteChange;
            const sentenceCasedFavoriteType = CoreFavoriteConstants.FAVORITE_DISPLAY_NAMES[favoriteChange.favoriteDisplayType];

            return `${sentenceCasedFavoriteType}: <strong>${favoriteChange.saveTitle}</strong>`;
        } else {
            const folderCacheKey = savingItem;
            const folderType = FavoriteUtils.transformInFrontendName(FavoriteUtils.getTypeFromCacheKey(folderCacheKey).split(CoreFavoriteConstants._FOLDER)[0]);
            const sentenceCasedFolderType = CommonUtils.getInSentenceCase(folderType + CoreFavoriteConstants._FOLDER);

            const folderOwner = FavoriteUtils.getOwnerFromCacheKey(folderCacheKey);

            const isAdminOrGlobalUser = folderOwner === CoreFavoriteConstants.ADMIN || folderOwner === CoreFavoriteConstants.GLOBAL_USER;
            let message = `<strong>${sentenceCasedFolderType}</strong>`;
            if (isAdminOrGlobalUser) {
                message += ` for ${folderOwner}`;
            }
            return message;
        }
    }

    private generateBulkSavingParameters(isCancel?: boolean): TelemetryGenericEventParameters {
        const parameters = new TelemetryGenericEventParameters(EventType.BULK_SAVING);
        const savingLevel = this.changedFavoritesTree instanceof WorkspaceFavoriteChange ? BulkSavingLevel.WORKSPACE : BulkSavingLevel.REPORT;
        parameters.details.set(BulkSavingEventDetailsKey.BULK_SAVING_LEVEL, savingLevel);

        if (isCancel) {
            // NO_SAVE if cancel is clicked.
            parameters.details.set(BulkSavingEventDetailsKey.BULK_SAVING_ACTION, BulkSavingAction.NO_SAVE);
        } else if (this.flattenedFavoriteChanges.length === 1) {
            // SAVE_ROOT_ONLY if only root level is available and submitted.
            parameters.details.set(BulkSavingEventDetailsKey.BULK_SAVING_ACTION, BulkSavingAction.SAVE_ROOT_ONLY);
        } else if (this.flattenedFavoriteChanges.filter(change => change.isSelected).length === 1) {
            // SAVE_ROOT_ONLY_MODIFIED if only root level is submitted and other changes are opted out.
            parameters.details.set(BulkSavingEventDetailsKey.BULK_SAVING_ACTION, BulkSavingAction.SAVE_ROOT_ONLY_MODIFIED);
        } else if (this.flattenedFavoriteChanges.some(change => !change.isSelected)) {
            // SAVE_MODIFIED if some changes are submitted and others are opted out.
            parameters.details.set(BulkSavingEventDetailsKey.BULK_SAVING_ACTION, BulkSavingAction.SAVE_MODIFIED);
        } else {
            // SAVE_ALL if all changes are submitted.
            parameters.details.set(BulkSavingEventDetailsKey.BULK_SAVING_ACTION, BulkSavingAction.SAVE_ALL);
        }
        return parameters;
    }

    closeAdminOverwriteDialog(continueSaving: boolean): void {
        this.isAdminOverwriteWarning = false;
        // Explicitly check that continueSaving is the emitted boolean so it doesn't get triggered from another event
        if (continueSaving === true) {
            this.openSaveSummaryModalIfApplicable();
        }
    }

    closeAdminFolderDialog(): void {
        this.isCloseAdminFolderDialog = true;
        // set observable to be false
        this.isFolderWarningModalOpen$.next(false);
    }

    /**
     * Checks if there are any additional warning modals a user must acknowledge before saving proceeds
     */
    private isAdditionalSavingConflicts(): boolean {
        if (this.isCloseAdminFolderDialog) {
            this.checkFavoriteInFolder();
        }

        return this.isConflictingFavorites || this.isDuplicateFavoriteTitles || this.isAdminOverwriteWarning || this.isFolderWarningModalOpen$.value
            || this.isSingleLayerSaveSummaryModalOpen || this.isMultiLayerSaveSummaryModalOpen;
    }

    /**
     * Check when submit is clicked that each enterprise favorite has user perm groups assigned if applicable.
     * If the check fails, then displays dialog error to user telling them to fix before saving
     */
    private isPermGroupsRequirementsFailed(): boolean {
        // user perms not applicable if not enabled, required, user not admin, or user belongs to no perm groups
        if (!TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS) ||
            !TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED) ||
            !CoreUserMetaDataStore.userMetaData.canUserSaveEnterpriseFavorites() ||
            !CoreUserMetaDataStore.userMetaData.userPermissionGroups?.length) {
            this.isUserPermErrorDialogOpen = false;
        } else {
            // open error dialog if check fails
            this.isUserPermErrorDialogOpen = !this.changedFavoritesTree.isEnterprisePermGroupReqMet();
        }
        return this.isUserPermErrorDialogOpen;
    }

    /**
     * Called when dialog closed
     */
    onUserPermErrorDialogClosed(): void {
        this.isUserPermErrorDialogOpen = false;
    }

    private openSaveSummaryModalIfApplicable(): void {
        // Open the single-layer save summary modal for a single layer enterprise favorite change if the changeSummary is not there.
        this.isSingleLayerSaveSummaryModalOpen = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_VERSIONS)
            && this.isSingleLayerFavoriteChange()
            && this.changedFavoritesTree.savingUser === CoreFavoriteConstants.ADMIN
            && !this.changedFavoritesTree.changeSummary;

        // Open the multi-layer save summary modal for a nested enterprise favorite change.
        this.openMultiLayerSaveSummaryModalIfApplicable();
    }

    /**
     * Open the multi-layer save summary modal for a nested enterprise favorite change.
     *  If the top level is enterprise favorite, open this modal via admin overwrite warning modal.
     */
    private openMultiLayerSaveSummaryModalIfApplicable(): void {
        this.isMultiLayerSaveSummaryModalOpen = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_VERSIONS)
            && !this.isSingleLayerFavoriteChange()
            && this.shouldOpenMultiSaveSummaryModal(this.changedFavoritesTree);
    }

    private isSingleLayerFavoriteChange(): boolean {
        return isEmpty(this.changedFavoritesTree.nestedChanges);
    }

    /**
     * Recursively check if save summary modal should open.
     *  It should open only if favorite change is enterprise favorite, or it includes nested enterprise favorites,
     *  AND the enterprise favorite is checked during saving.
     */
    private shouldOpenMultiSaveSummaryModal(favoritesTree: WorkspaceFavoriteChange | FavoriteChange | WorkpadFavoriteChange): boolean {
        if (favoritesTree instanceof WorkspaceFavoriteChange || favoritesTree instanceof FavoriteChange) {
            if (favoritesTree.savingUser === CoreFavoriteConstants.ADMIN && favoritesTree.isSelected && favoritesTree.saveMode === SaveMode.SAVE) {
                return true;
            }
            // Check all nested changes
            for (const nestedChange of favoritesTree.nestedChanges) {
                if (this.shouldOpenMultiSaveSummaryModal(nestedChange)) {
                    return true;
                }
            }
        } else if (favoritesTree instanceof WorkpadFavoriteChange) {
            // Check all modified reports
            for (const reportChange of favoritesTree.modifiedReports) {
                if (this.shouldOpenMultiSaveSummaryModal(reportChange)) {
                    return true;
                }
            }
        }
        // No selected enterprise favorite change found
        return false;
    }

    /**
     * Close save summaries modal
     *  if save is true and no conflicts, save the changes.
     */
    closeSaveSummaryModal(continueSaving: boolean): void {
        this.isSingleLayerSaveSummaryModalOpen = false;
        this.isMultiLayerSaveSummaryModalOpen = false;
        if (continueSaving === true && !this.isAdditionalSavingConflicts()) {
           this.saveChanges();
        }
    }
}
