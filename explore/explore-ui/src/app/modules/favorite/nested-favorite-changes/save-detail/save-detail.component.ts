import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {
    AuxAdvancedTreeListInterface,
    AuxButtonTypeEnum,
    AuxRadioGroupChangedDetailInterface,
    AuxRadioInterface,
    AuxSelectOption,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface,
    AuxTextInput,
    AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {SaveMode} from '@enums/save-mode.enum';
import {
    FavoriteChangeFolderState,
    FolderFavoriteTreeService
} from './folder-structure-modal/folder-favorite-tree.service';
import {SavableFavoriteChange} from '@services/favorite-change-detection/favorite-change-detection.service';
import {FavoriteService} from '@services/favorite';
import {SharedModalService} from '../../service/shared-modal.service';
import {CoreFavoriteConstants, CoreFavoriteUtils, CoreUserMetaDataStore, FavoriteEnum, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {
    FavoritePermissionGroupComponent
} from '../../modify/favorite-permission-group/favorite-permission-group.component';
import { FavoriteTreeUtils } from '../../utils/favorite-tree.utils';
import { FavoriteConstants } from '@constants/favorite.constants';
import { FavoriteUtils } from '@utils/favorite.utils';
import { catchError, map, throwError } from 'rxjs';
import { FavoriteFolderItem } from '@models/favorite/favorite-folder-item.model';
import { FavoriteTreeService } from '../../service/favorite-tree.service';

/**
 * Displays the save details for a favorite like name, save/save-as, folder
 */
@Component({
    selector: 'app-save-detail',
    templateUrl: './save-detail.component.html',
    styleUrls: ['./save-detail.component.scss']
})
export class SaveDetailComponent implements OnChanges, OnInit {
    static readonly PERMISSIONS_AND_FOLDER_TEXT = 'Permissions & Folder';
    static readonly FOLDER_TEXT = 'Folder';
    static readonly SELECT_FOLDER = 'Select Folder';
    static readonly EDIT_DETAILS = 'Edit Details';

    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    // Favorite that is being saved
    @Input() favoriteChange: SavableFavoriteChange;
    // Flag indicating if title textbox should be fixed size
    @Input() isFixedSize = false;

    @ViewChild('favoriteTitleTextInput', {static: true}) auxTextInput: AuxTextInput;
    @ViewChild('favoriteDescriptionTextInput', {static: true}) auxDescriptionTextInput: AuxTextInput;

    saveOptions: AuxRadioInterface[];

    /** Flag indicating if perm groups are enabled on enterprise favorites */
    isEnterprisePermGroupEnabled = false;
    /** Flag indicating if perm groups are required on enterprise favorites */
    isEnterprisePermGroupRequired = false;
    /** Flag indicating if required star should be shown next to permission group */
    isRequiredFlagShown = false;
    /** Flag indicating if folder and/or perms have been selected */
    isRequiredPermsSelected = false;
    personalAccessOnly = true;
    selectedPermissionGroups: string[];
    selectedUser: string;
    // variable for aux-select (for users with Admin perm only)
    userOption: AuxSelectOptionGroup[];
    // ACE permissioning
    isACEPermissionFeatureEnabled = false;
    enterpriseDescription: string;
    @Input() isModalRootItem = true;
    isFolderStructureModalOpen = false;
    enterpriseDescriptionText: string;
    // folder name text for display
    folderNameText: string;
    // loaded folder name text for display when user is ADMIN
    loadedFolder: string;
    // selected folder name text from select folder
    selectedFolder: string;
    folderText: string;

    constructor(private sharedModalService: SharedModalService, private folderFavoriteTreeService: FolderFavoriteTreeService, private changeDetectorRef: ChangeDetectorRef, private favoriteService: FavoriteService, private favoriteTreeService: FavoriteTreeService) {
    }

    ngOnInit(): void {
        this.isEnterprisePermGroupEnabled = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS)
            && CoreUserMetaDataStore.userMetaData.canUserSaveEnterpriseFavorites()
            && !!CoreUserMetaDataStore.userMetaData.userPermissionGroups?.length;
        this.isEnterprisePermGroupRequired = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED);
        this.enterpriseDescriptionText = "e.g. 'This "+ CoreFavoriteConstants.FAVORITE_DISPLAY_NAMES[this.favoriteChange.favoriteDisplayType] + " will be used for...'. 140 characters max.";
        this.selectedUser = this.favoriteChange.savingUser;
        this.selectedPermissionGroups = [...(this.favoriteChange.userPermGrps || [])];
        this.showFavoriteOwnerOptions();
        // Show "Permissions & Folder" if user can save as enterprise, otherwise just show "Folder"
        this.folderText = this.isEnterprisePermGroupEnabled ? SaveDetailComponent.PERMISSIONS_AND_FOLDER_TEXT : SaveDetailComponent.FOLDER_TEXT;
        this.enterpriseDescription = this.favoriteChange.enterpriseDescription;
        this.getFolderNameText(this.favoriteChange).then(folderName => {
            this.loadedFolder = folderName;
            // when its save set the folderNameText to the folder name of the favorite loaded; when save as set it to empty string
            this.folderNameText = this.favoriteChange.saveMode === SaveMode.SAVE_AS ? '' : folderName;
            this.checkSaveRequirements();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.favoriteChange) {
            this.updateSaveOptions();
            this.checkSaveRequirements();
        }
    }

    /**
     * Called when radio buttons changed to switch between Save and Save As
     */
    changeSaveMethod(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        this.favoriteChange.saveMode = event.detail.value.eventData;
        // when selecting save as from save, clear the folderNameText, when selecting save from save as, set the folderNameText to the loaded folder or the folder selected from closeFolderStructureModal
        this.folderNameText = this.favoriteChange.saveMode === SaveMode.SAVE_AS ? '' : (this.selectedFolder ? this.selectedFolder : this.loadedFolder);
        this.handleFolderStructureSaving();
        this.updateUntouchedTitle();
    }

    /**
     * For folder structure saving,
     *  In the case of Save - the favorite will move from the originalFolder to the newFolder.
     *  In the case of SaveAs - the favorite will stay in the originalFolder, but the favorite with the new favoriteId will be saved in the newFolder.
     *
     *  ** originalFolder is where the favorite was saved before user interaction, and newFolder is where a user selected to be saved.
     */
    private handleFolderStructureSaving(): void {
        const currentFavoriteChangeHoldingFolderState = this.folderFavoriteTreeService.favoriteChangeHoldingFolderStateMap.get(this.favoriteChange);

        // There are 4 cases:
        // 1. both newFolder and originalFolder doesn't exist    -   No handling is required.
        // 2. newFolder doesn't exist and originalFolder exist   -   No handling is required.
        // 3. newFolder exist and originalFolder doesn't exist   -   No handling is required.
        // 4. both newFolder and originalFolder exist            -   Handle Save/SaveAs scenario.

        const originalFolder = currentFavoriteChangeHoldingFolderState?.get(FavoriteChangeFolderState.ORIGINAL);
        const newFolder = currentFavoriteChangeHoldingFolderState?.get(FavoriteChangeFolderState.NEW);
        if (!originalFolder || !newFolder) {
            return;
        }

        if (this.favoriteChange.saveMode === SaveMode.SAVE) {
            // In the case of Save the originalFolder should NOT hold the favorite.
            originalFolder.eventData.childFavoriteData = originalFolder.eventData.childFavoriteData.filter(child => child !== this.favoriteChange);
        } else if (this.favoriteChange.saveMode === SaveMode.SAVE_AS && !originalFolder.eventData.childFavoriteData.includes(this.favoriteChange)) {
            // In the case of SaveAs the originalFolder should hold the favorite.
            // The favorite should be re-added to the originalFolder when user selected Save, and then reselect SaveAs.
            originalFolder.eventData.childFavoriteData.push(this.favoriteChange);
        }
    }

    /**
     * Update title if they stay untouched.
     *  remove or append " Copy" with save/saveAs change.
     */
    private updateUntouchedTitle() {
        const COPY = ' Copy';
        const isTitleUntouchedForSave = this.favoriteChange.saveMode === SaveMode.SAVE && this.favoriteChange.saveTitle === this.favoriteChange.value.title + COPY;
        const isTitleUntouchedForSaveAs = this.favoriteChange.saveMode === SaveMode.SAVE_AS && this.favoriteChange.saveTitle === this.favoriteChange.value.title;

        if (!isTitleUntouchedForSave && !isTitleUntouchedForSaveAs) {
            return;
        }

        if (isTitleUntouchedForSave) {
            this.favoriteChange.saveTitle = this.favoriteChange.value.title;
        } else {
            this.favoriteChange.saveTitle += COPY;
        }
        this.auxTextInput.setValue(this.favoriteChange.saveTitle);
        this.changeDetectorRef.detectChanges();
    }

    /**
     * Updates the favorite title to save with
     */
    updateFavoriteTitle(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.favoriteChange.saveTitle = event.detail.value;
    }

    /**
     * Updates the favorite description to save with
     */
    updateFavoriteDescription(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.favoriteChange.enterpriseDescription = event.detail.value;
    }

    openFolderStructureModal(): void {
        this.sharedModalService.openFolderStructureModal(this);
    }

    closeFolderStructureModal(selectedSavingUser: string): void {
        this.sharedModalService.closeFolderStructureModal(this, selectedSavingUser);
        // if the folder has changed, update the folder name text from favoriteChangeHoldingFolderStateMap
        const latestFolderState = this.folderFavoriteTreeService.favoriteChangeHoldingFolderStateMap.get(this.favoriteChange);
        const newSelectedFolder = latestFolderState?.get(FavoriteChangeFolderState.NEW);
        // when newSelectedFolder is not null and the type is admin, update the folderNameText
        if (newSelectedFolder && this.favoriteChange.savingUser === CoreFavoriteConstants.ADMIN) {
            this.selectedFolder = newSelectedFolder.label;
            this.folderNameText = newSelectedFolder.label;
        }
        this.checkSaveRequirements();
    }

    /**
     * Determines which save options are valid for the selected user
     */
    private updateSaveOptions(): void {
        this.saveOptions = this.sharedModalService.updateSaveOptions(this.favoriteChange);
    }

    /**
     * Checks user perms requirement for saving enterprise favorite
     */
    private checkSaveRequirements(): void {
        // required if perm group enabled, required, and favorite is being saved as ADMIN
        this.isRequiredFlagShown = this.isEnterprisePermGroupEnabled && this.isEnterprisePermGroupRequired && this.favoriteChange.savingUser === CoreFavoriteConstants.ADMIN;

        // only relevant if a perm selection is required
        this.isRequiredPermsSelected = !this.isRequiredFlagShown ||
            FavoritePermissionGroupComponent.isPermissionGroupRequirementsMet(this.favoriteChange.savingUser, this.favoriteChange.userPermGrps);

        // clear flag once the required perms have been selected
        if (this.isRequiredPermsSelected) {
            this.favoriteChange.showMissingUserPermError = false;
        }
    }

     /**
     * Show favorite owner options (Personal, Admin, and Global option)
     */
     showFavoriteOwnerOptions(): void {
        const favoriteType = this.favoriteChange.favoriteType;
        // show favoriteOwnerOptions if user has sharedFavPerm or globalFavPerm
        const showAdmin = CoreUserMetaDataStore.userMetaData.canUserSaveEnterpriseFavorites() && FavoriteConstants.ADMIN_ACCOUNT_FAVORITES.includes(favoriteType);
        const showGlobal = FavoriteUtils.isUserAllowedToSaveGlobal(favoriteType);
        this.personalAccessOnly = !showAdmin && !showGlobal;
        this.userOption = FavoriteTreeUtils.getFavoriteOwnerOptions(this.selectedUser, showAdmin, showGlobal);
    }

    /**
     * This function is available for Admin only
     * Update favorite owner on aux-select selection changed
     */
    updateFavoriteOwner(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (event?.detail?.value) {
            // update favoriteOwner to update the tree
            this.selectedUser = FavoriteTreeUtils.getFavoriteOwner((event.detail.value as AuxSelectOption).displayValue);

            this.isACEPermissionFeatureEnabled = CoreFavoriteUtils.isGlobalFavorite(this.selectedUser)
                && FavoriteEnum.getFolderType(this.favoriteChange.favoriteType) === FavoriteConstants.LAYOUT_FOLDER
                && TokenUtils.isFeatureEnabled(TokenConstants.ENABLE_TEMPLATE_PERMISSIONING);

            this.favoriteChange.savingUser = this.selectedUser;
            this.folderNameText = this.favoriteChange.savingUser === CoreFavoriteConstants.ADMIN ? this.loadedFolder : '';
            this.updateSaveOptions();
        }
    }

    /**
     * Update selected permission groups
     */
    public onPermissionGroupsSelected(selectedPermissionGroups: string[]): void {
        this.selectedPermissionGroups = selectedPermissionGroups;
        this.favoriteChange.userPermGrps = selectedPermissionGroups;
    }

    /**
     * Get folder name text
     */
    public async getFolderNameText(favoriteChange: SavableFavoriteChange): Promise<string> {
        // when favoriteChange savinguser is not ADMIN, return empty string
        if (favoriteChange.savingUser !== CoreFavoriteConstants.ADMIN) {
            return '';
        }
        // get favorite folder list from cache
        const folderFavoriteType = FavoriteEnum.getFolderType(favoriteChange.favoriteType);
        let rootFolderNode = this.folderFavoriteTreeService.folderChangesMap.get(FavoriteUtils.getCacheKey(this.selectedUser, folderFavoriteType));
        rootFolderNode = rootFolderNode
            ? this.folderFavoriteTreeService.generateFavoriteTreeNode(rootFolderNode, this.favoriteChange)
            : await this.favoriteTreeService.getFavoriteFolderStructure$(this.selectedUser, folderFavoriteType)
                .pipe(
                    map((folderFavoriteData: FavoriteFolderItem) => {
                        return this.folderFavoriteTreeService.generateFavoriteTreeNode(folderFavoriteData, this.favoriteChange);
                    }),
                    catchError(error => {
                        return throwError(error);
                    })
                ).toPromise();
        const folderName = rootFolderNode ? this.traverseAndFindFolderName(rootFolderNode, favoriteChange.value.id) : '';
        return folderName || '';
    }

    /**
     * Traverse the tree to find the folder name for the given favoriteId
     */
    public traverseAndFindFolderName(node: AuxAdvancedTreeListInterface, favoriteId: string|number): string | null {
        return !node.children ? null : node.children.reduce((acc, child) => {
            if (acc) return acc;
            if (child.eventData.favoriteId === favoriteId) return node.label;
            return this.traverseAndFindFolderName(child, favoriteId);
        }, null as string | null);
    }

}
