import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {
    AuxAdvancedTreeListInterface,
    AuxTextInputFormValueChangedDetailInterface, AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {BehaviorSubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {DataRequestConstants, ExploreConstants} from '@constants/index';
import {FavoriteStore} from '@stores/index';
import {FavoriteService, NotificationService} from '@services/index';
import {
    AbstractFavoriteConfig,
    AlertConstants,
    CoreFavoriteConstants,
    CoreFavoriteStore,
    CoreFavoriteUtils,
    CoreUserMetaDataStore,
    ErrorTypeConstants,
    ExploreDialogParam,
    Favorite,
    SaveFavoriteResult,
    TokenConstants,
    TokenUtils,
    UIErrorParameters
} from '@blk/explore-ui-core';
import {AppStore} from '../../../../app.store';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import get from 'lodash/get';
import {FavoriteConstants} from '@constants/favorite.constants';
import {FavoriteTreeModifiableModalDirective} from '../favorite-tree-modifiable-modal.directive';
import {SaveFavoriteVersionDetailsAndSummary} from '@models/favorite-version/favorite-version-log.interface';
import * as momentTz from 'moment-timezone';
import {cloneDeep} from 'lodash';
import {FavoritePermissionGroupComponent} from '../favorite-permission-group/favorite-permission-group.component';

/**
 * Save Favorite Modal
 *
 * @example
 *  <ng-container *ngIf="isMandateSettingsModalOpen">
 *      <app-save-favorite-modal [isOpen]="isSaveFavoriteModalOpen"
 *                               (modalClosed)="closeSaveFavoriteModal()">
 *      </app-save-favorite-modal>
 *  </ng-container>
 */
@Component({
    selector: 'app-save-favorite-modal',
    templateUrl: './save-favorite-modal.component.html',
    styleUrls: ['../favorite-tree-modifiable.component.scss']
})
export class SaveFavoriteModalComponent extends FavoriteTreeModifiableModalDirective implements OnInit {
    protected readonly CoreFavoriteUtils = CoreFavoriteUtils;
    protected readonly CoreFavoriteConstants = CoreFavoriteConstants;

    saveFavoriteAction$: BehaviorSubject<SaveFavoriteAction>;
    configToSave: AbstractFavoriteConfig;

    // disabling Save/SaveAs button until favorite tree in the save-favorite-modal is created
    isSaveButtonDisabled = true;
    isSaveAsButtonDisabled = true;

    isFolderTreeLoaded = false;

    // flags to display Save/SaveAs buttons
    showSaveButton = false;
    showSaveAsButton = false;

    // permissions groups that the user has selected in the saving session
    selectedPermissionsGroups: string[] = [];

    // variables for adding save summary to enterprise favorites
    saveSummary: SaveFavoriteVersionDetailsAndSummary = {changeSummary: undefined, changeSummaryDetails: undefined};
    isSaveSummaryOpen = false;
    isSaveAs = false;
    previousEnterpriseDescription: string;

    /**
     * constructor
     */
    constructor(protected favoriteService: FavoriteService, protected notificationService: NotificationService, protected appStore: AppStore, protected changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        // create local saveFavoriteAction$ to pass favType and favTreeType down to favorite-tree
        this.saveFavoriteAction$ = this.appStore.saveFavoriteAction$;

        this.saveFavoriteAction$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((saveFavoriteAction: SaveFavoriteAction) => {
                if (!saveFavoriteAction.configToSave || !saveFavoriteAction.type) {
                    return;
                }

                this.showFavoriteOwnerOptions(saveFavoriteAction.type);
                this.configToSave = saveFavoriteAction.configToSave;
                this.favType = saveFavoriteAction.type;
                this.favTreeType = saveFavoriteAction.treeType;
                this.favDisplayName = saveFavoriteAction.displayName;
                this.defaultToPersonal = saveFavoriteAction.defaultToPersonal;

                this.selectedPermissionsGroups = cloneDeep(saveFavoriteAction.configToSave.userPermGrps) || [];

                // update default favoriteTitle and keep originalTitle
                this.favoriteTitle = this.originalTitle = this.configToSave.title;
                this.previousEnterpriseDescription = this.configToSave.enterpriseDescription;
                this.callback = saveFavoriteAction.callback;

                // set to show Save/SaveAs buttons
                this.setShowButton();
            });

        // update selectedNode and favoriteTitle
        this.selectedFavoriteNode$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((node: AuxAdvancedTreeListInterface) => {
                if (!node) {
                    return;
                }
                this.selectedNode = node;

                if (node.eventData.type !== FavoriteConstants.FOLDER) {
                    this.favoriteTitle = node.label;
                }
            });
    }

    /**
     * Enable save after folder tree is loaded
     * @param isLoaded
     * @protected
     */
    protected onFolderTreeLoaded(isLoaded: boolean): void {
        this.isFolderTreeLoaded = isLoaded;
        this.updateSaveButtonsState();
    }

    protected onPermissionsGroupSelected(selectedPermissionsGroups: string[]): void {
        this.selectedPermissionsGroups = selectedPermissionsGroups;
        this.updateSaveButtonsState();
    }

    private updateSaveButtonsState(): void {
        if (!this.isFolderTreeLoaded || !this.configToSave || !FavoritePermissionGroupComponent.isPermissionGroupRequirementsMet(this.selectedUser$.getValue(), this.selectedPermissionsGroups)) {
            this.isSaveButtonDisabled = true;
            this.isSaveAsButtonDisabled = true;
        } else {
            this.isSaveButtonDisabled = this.configToSave.tool === ExploreConstants.PRISM;
            this.isSaveAsButtonDisabled = false;
        }
    }

    /**
     * On 'Save/SaveAs' button clicked
     * Case 1: (SAVE AS) the favorite is Prism favorite, and the title DOESN'T exists in login's favorite list
     * Case 2: (SAVE AS) the favorite is Prism favorite, and the title already exists in login's favorite list
     *
     * Case 3: (SAVE AS) the config to save belongs to login, and the title is unchanged
     * Case 4: (SAVE) the config to save belongs to login, and the title is unchanged
     * Case 5: (SAVE AS) the config to save belongs to login, and the title is changed, and the title DOESN'T exists in login's favorite list
     * Case 6: (SAVE) the config to save belongs to login, and the title is changed, and the title DOESN'T exists in login's favorite list
     * Case 7: (BOTH) the config to save belongs to login, and the title is changed, and the title already exists in login's favorite list
     *
     * Case 8: (SAVE) brand new favorite, and the title DOESN'T exists in login's favorite list
     * Case 9: (SAVE) brand new favorite, and the title already exists in login's favorite list
     *
     * Case 10: (SAVE AS) the config to save belongs to someone else, and the title DOESN'T exists in login's favorite list
     * Case 11: (SAVE AS) the config to save belongs to someone else, and the title already exists in login's favorite list
     */
    onSaveButtonClicked(saveAs?: boolean): void {
        const selectedUser = this.selectedUser$.getValue();
        // check if token is enabled, its an admin user, summary to be entered and version number is not 1.
        if (CoreFavoriteUtils.isADLFavorite(this.favType, selectedUser) && !this.saveSummary?.changeSummary
            && this.configToSave.id && !saveAs) {
            this.isSaveSummaryOpen = true;
            this.isSaveAs = saveAs;
            return;
        }
        if (!this.favoriteTitle) {
            return;
        }

        const favToBeOverridden = FavoriteStore.getFavoriteFromCache(selectedUser, this.favType, this.favoriteTitle);
        const originalFavoriteObject = FavoriteStore.getFavoriteFromCache(selectedUser, this.favType, null, this.configToSave.id);

        // handle Prism favorite
        if (this.configToSave.tool === ExploreConstants.PRISM && saveAs) {
            this.performPrismFavoriteTask(favToBeOverridden, selectedUser);
            return;
        }

        const updateFolderStructure = this.selectedNode
            && this.selectedNode.eventData
            && this.selectedNode.eventData.type === FavoriteConstants.FOLDER;

        switch (this.configToSave.owner) {
            case selectedUser:
                this.performFavoriteSaveTask(saveAs, favToBeOverridden, originalFavoriteObject, selectedUser, updateFolderStructure);
                break;

            case undefined:
            default:
                if (!favToBeOverridden) {
                    // Case 8: (SAVE) brand new favorite, and the title DOESN'T exists in login's favorite list
                    // Case 10: (SAVE AS) the favorite to save belongs to someone else, and the title DOESN'T exists in login's favorite list
                    //  => Save it as a new favorite and update the folder structure if a folder is selected
                    this.saveFavorite({favoriteId: null, owner: selectedUser, updateFolderStructure});

                } else {
                    // Case 9: (SAVE) brand new favorite, and the title already exists in login's favorite list
                    // Case 11: (SAVE AS) the favorite to save belongs to someone else, and the title already exists in login's favorite list
                    //  => Prompt for confirmation, then override the favorite with duplicate title
                    this.confirmFavoriteSaveWithSameTitle(favToBeOverridden.id, favToBeOverridden, selectedUser);
                }
                break;
        }
    }

    /**
     * Save Favorite and pop up success/error toast
     * this function is used as callback so need arrow to get the right scope
     */
    saveFavorite = (obj: { favoriteId: number | string, owner: string, updateFolderStructure?: boolean }): void => {
        // update config title and id before save
        this.configToSave.title = this.favoriteTitle;
        this.configToSave.id = obj.favoriteId;
        this.configToSave.lastUpdatedBy = CoreUserMetaDataStore.userMetaData.login;
        this.configToSave.dateLastUpdated = momentTz.tz(momentTz.tz.guess()).format('MM/DD/YYYY HH:mm zz');
        this.configToSave.userPermGrps = this.selectedPermissionsGroups;
        this.configToSave.changeSummary = this.saveSummary?.changeSummary;
        this.configToSave.changeSummaryDetail = this.saveSummary?.changeSummaryDetails;

        // Component gets closed after save, so disabling button has no negative impact,
        // but this prevents multiple saving trigger in laggy environment.
        this.isSaveButtonDisabled = this.isSaveAsButtonDisabled = true;

        // Check to make sure selected user is ADMIN before persisting perm groups
        const permGroups = ((obj.owner === CoreFavoriteConstants.ADMIN) && (this.configToSave.userPermGrps?.length > 0)) ? this.configToSave.userPermGrps : null;

        this.favoriteService.saveFavorite$(this.configToSave.createFavorite(this.favType, this.configToSave.id, this.configToSave.title, null, this.configToSave.changeSummaryDetail, this.configToSave.changeSummary, permGroups, obj.owner, this.configToSave.enterpriseDescription, this.configToSave.statusTag), obj.owner)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((response: SaveFavoriteResult) => {
                if (response && response.status === DataRequestConstants.SUCCESS_RESPONSE) {
                    this.notificationService.success('Successfully saved ' + this.favoriteTitle);

                    // update current config's owner and id after saving
                    this.configToSave.id = response.favoriteId;
                    this.configToSave.owner = response.owner;
                    this.configToSave.currentFavoriteVersion = response.currentFavoriteVersion;
                    this.configToSave.latestFavoriteVersion = response.latestFavoriteVersion;
                    this.configToSave.versionNumber = response.versionNumber;

                    if (obj.updateFolderStructure) {
                        // update selected folder with the saved favorite
                        this.updateFavoriteTreeStructure$.next({selectedNode: this.selectedNode, title: this.configToSave.title, id: response.favoriteId});
                    }

                    this.configToSave.resetChangeDetectionFlags();
                }
                console.log(response);
                // if callback, run it after favorite is saved
                if (this.callback) {
                    this.callback(this.configToSave);
                    CoreFavoriteStore.favSavedNotifier$.next(this.configToSave.id);
                }

                this.closeModal();

            }, error => {
                console.error(error);
                this.notificationService.error('Error occurred while saving: ' + error.toString(), ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SAVE_FAVORITE_ERROR);
                this.closeModal();
            });
    };

    /**
     * Update favorite title on aux-text-input form value changed
     */
    updateFavoriteTitle(event: CustomEvent<AuxTextInputFormValueChangedDetailInterface>): void {
        if (get(event, 'detail.value')) {
            this.favoriteTitle = event.detail.value;
        }
    }

    /**
     * Open prompt dialog with save favorite callback
     */
    private openDialogToSaveFavorite(callbackArgs: {favoriteId: number|string, owner: string, updateFolderStructure?: boolean}): void {
        this.notificationService.openDialog(
            new ExploreDialogParam(
                AlertConstants.TYPE.PROMPT,
                AlertConstants.HEADER.CONFIRM,
                AlertConstants.BODY.FAVORITE_WITH_SAME_NAME,
                AlertConstants.BTN.OK,
                AlertConstants.BTN.CANCEL,
                this.saveFavorite,
                null,
                callbackArgs
            ));
    }

    /**
     * Set showSaveButton and showSaveAsButton
     * Show "Save":
     * for non-existing favorite (brand new) and login's favorite (login can be either current user or admin if Type: admin is selected for user with admin perm ONLY)
     * Show "Save As":
     * for someone else's favorite and login's favorite (login can be either current user or admin if Type: admin is selected for user with admin perm ONLY)
     */
    setShowButton(): void {
        this.showSaveButton = (!this.configToSave.owner || this.configToSave.owner === this.selectedUser$.getValue()) && this.checkIfPermedUserGroup();
        this.showSaveAsButton = !!this.configToSave.owner;
        this.changeDetectorRef.markForCheck();
    }

    checkIfPermedUserGroup(): boolean {
        return !this.configToSave.userPermGrps?.length || this.configToSave.userPermGrps.some(group =>
            CoreUserMetaDataStore.userMetaData.userPermissionGroups.includes(group)
        );
    }

    /**
     * Save or prompt for confirmation if PRISM favorite
     */
    private performPrismFavoriteTask(favToBeOverridden: Favorite, selectedUser: string): void {
        if (!favToBeOverridden) {
            // Case 1: (SAVE AS) the config is Prism favorite, and the title DOESN'T exist in login's favorite list
            //  => Create a new favorite
            this.saveFavorite({favoriteId: null, owner: selectedUser});

        } else {
            // Case 2: (SAVE AS) the config is Prism favorite, and the title already exists in login's favorite list
            //  => Prompt for confirmation, then override the favorite with duplicate title
            this.confirmFavoriteSaveWithSameTitle(favToBeOverridden.id, favToBeOverridden, selectedUser);
        }
    }

    /**
     * Save or prompt for confirmation for Explore Favorites both save/save as scenario
     */
    private performFavoriteSaveTask(saveAs: boolean, favToBeOverridden: Favorite, originalFavoriteObject: Favorite, selectedUser: string, updateFolderStructure: boolean) {
        if (saveAs) {
            if (this.favoriteTitle === originalFavoriteObject?.title) {
                // Case 3: (SAVE AS) the config to save belongs to login, and the title is unchanged
                //  => Prompt for confirmation, then override the favorite
                this.confirmFavoriteSaveWithSameTitle(this.configToSave.id, favToBeOverridden, selectedUser, updateFolderStructure);

            } else if (!favToBeOverridden) {
                // Case 5: (SAVE AS) the config to save belongs to login, and the title is changed, and the title DOESN'T exists in login's favorite list
                //  => Save it as a new favorite and update the folder structure if a folder is selected
                this.saveFavorite({favoriteId: null, owner: selectedUser, updateFolderStructure});
            } else {
                // Case 7: (BOTH) the config to save belongs to login, and the title is changed, and the title already exists in login's favorite list
                //  => Prompt for confirmation, then override the favorite with duplicate title
                this.confirmFavoriteSaveWithSameTitle(favToBeOverridden.id, favToBeOverridden, selectedUser);
            }
        } else {
            if (!favToBeOverridden || favToBeOverridden?.id === this.configToSave.id) {
                // Case 4: (SAVE) the config to save belongs to login, and the title is unchanged
                // Case 6: (SAVE) the config to save belongs to login, and the title is changed, and the title DOESN'T exists in login's favorite list
                //  => Override the favorite
                this.saveFavorite({favoriteId: this.configToSave.id, owner: selectedUser, updateFolderStructure});

            } else {
                // Case 7: (BOTH) the config to save belongs to login, and the title is changed, and the title already exists in login's favorite list
                //  => Prompt for confirmation, then override the favorite with duplicate title
                this.confirmFavoriteSaveWithSameTitle(favToBeOverridden.id, favToBeOverridden, selectedUser);
            }
        }
    }

    confirmFavoriteSaveWithSameTitle(favId: number | string, favToBeOverridden: Favorite, selectedUser: string, updateFolderStructure?: boolean) {
        if (favToBeOverridden.owner === CoreFavoriteConstants.ADMIN && TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS)) {
            this.notificationService.openDialog(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT,
                    AlertConstants.HEADER.ENTERPRISE_FAVORITE_TITLE_SAME,
                    AlertConstants.BODY.ENTERPRISE_FAVORITE_TITLE_SAME,
                    AlertConstants.BTN.OK
                )
            );
        } else {
            this.openDialogToSaveFavorite({favoriteId: favId, owner: selectedUser, updateFolderStructure});
        }
    }

    closeSaveSummaryDialog(continueSaving: any): void {
        this.isSaveSummaryOpen = false;
        // Explicitly check that continueSaving is the emitted boolean, so it doesn't get triggered from another event
        if (continueSaving === true) {
            this.onSaveButtonClicked(this.isSaveAs);
        }
    }

    /**
     * Updates the favorite description to save with
     */
    updateFavoriteDescription(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.configToSave.enterpriseDescription = event.detail.value;
    }

    /**
     * Check if the description field is supported
     * @param user
     */
    isDescriptionSupported(user: string): boolean {
        return user === CoreFavoriteConstants.ADMIN && CoreFavoriteUtils.isADLFavorite(this.favType, user);
    }

    /**
     * Close modal and revert description
     */
    cancelModal(): void {
        this.configToSave.enterpriseDescription = this.previousEnterpriseDescription;
        this.closeModal();
    }
}
