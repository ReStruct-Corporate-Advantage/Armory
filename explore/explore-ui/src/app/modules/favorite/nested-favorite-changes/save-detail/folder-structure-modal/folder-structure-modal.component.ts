import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {
    AuxAdvancedTreeListInterface,
    AuxSelectOptionGroup,
    AuxTextInput,
    AuxTextInputValueChangedDetailInterface,
} from '@blk/aladdin-angular-components';
import {
    CoreCommonConstants,
    CoreFavoriteConstants,
    CoreFavoriteUtils,
    FavoriteDisplayEnum,
    FavoriteEnum,
    ModalDirective,
    TokenConstants,
    TokenUtils
} from '@blk/explore-ui-core';
import {FolderFavoriteTreeComponent} from './folder-favorite-tree/folder-favorite-tree.component';
import {FavoritePermissionComponent} from './favorite-permission/favorite-permission.component';
import {FavoriteUtils} from '@utils/favorite.utils';
import {FavoriteChangeFolderState, FolderFavoriteTreeService} from './folder-favorite-tree.service';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {SaveMode} from '@enums/save-mode.enum';
import {SavableFavoriteChange} from '@services/favorite-change-detection/favorite-change-detection.service';
import {
    FavoritePermissionGroupComponent
} from '../../../modify/favorite-permission-group/favorite-permission-group.component';
import {SaveDetailComponent} from '../save-detail.component';

/**
 * Folder Structure Modal Component
 */
@Component({
    selector: 'app-folder-structure-modal',
    templateUrl: './folder-structure-modal.component.html',
    styleUrls: ['./folder-structure-modal.component.scss']
})
export class FolderStructureModalComponent extends ModalDirective<string> implements OnInit {
    @ViewChild('favoriteFolderStructure', {static: false}) favoriteFolderStructureComponent: FolderFavoriteTreeComponent;
    @ViewChild('favoritePermission', {static: false}) favoritePermissionComponent: FavoritePermissionComponent;
    @ViewChild('favoriteDescriptionTextInput', {static: true}) auxDescriptionTextInput: AuxTextInput;

    protected readonly CoreFavoriteUtils = CoreFavoriteUtils;
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    readonly CoreCommonConstants = CoreCommonConstants;

    // selectedUser can be login, GLOBAL and ADMIN with access
    @Input() favoriteChange: SavableFavoriteChange;
    @Input() selectedUser: string;
    @Input() favoriteDisplayType: FavoriteDisplayEnum;
    modalTitle: string;
    favoriteTitle: string;

    private selectedFolder: AuxAdvancedTreeListInterface;

    // variable for aux-select (for users with Admin perm only)
    userOption: AuxSelectOptionGroup[];

    personalAccessOnly = true;

    // ACE permissioning
    isACEPermissionFeatureEnabled = false;

    isApplyButtonDisabled = true;

    // Flags for feature where user is required to select a folder for enterprise favorites
    isFolderSelectionRequiredEnabled = false;
    isFolderRequirementMet = false;

    isFolderTreeLoaded = false;

    selectedPermissionGroups: string[];

    @Input() isModalRootItem = true;

    constructor(private folderFavoriteTreeService: FolderFavoriteTreeService) {
        super();
    }

    ngOnInit(): void {
        // if user has the option of saving as enterprise with perm groups, update title
        this.modalTitle = ((this.isModalRootItem) || (!this.isModalRootItem && (this.selectedUser !== CoreFavoriteConstants.ADMIN))) ?
            SaveDetailComponent.SELECT_FOLDER : SaveDetailComponent.EDIT_DETAILS;
        this.favoriteTitle = this.favoriteChange.saveTitle;
        this.isFolderSelectionRequiredEnabled = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENTERPRISE_WITH_SELECT_FOLDER_ENABLED);
        this.selectedPermissionGroups = [...(this.favoriteChange.userPermGrps || [])];

        this.isFolderRequirementMet = this.checkIfFolderRequirementMet();
    }

    /**
     * Returns true if a folder is required to be selected for enterprise favorites.
     */
    private checkIfFolderRequirementMet(): boolean {
        return !this.isFolderSelectionRequiredEnabled || this.selectedUser !== CoreFavoriteConstants.ADMIN;
    }

    /**
     * Apply folder changes by adding the interim state to the folderChangesMap
     */
    applyFolderChanges(): void {
        this.favoriteChange.userPermGrps = this.selectedPermissionGroups;
        if (this.selectedFolder) {
            const folderFavoriteType = FavoriteEnum.getFolderType(this.favoriteChange.favoriteType);
            this.folderFavoriteTreeService.folderChangesMap.set(FavoriteUtils.getCacheKey(this.selectedUser, folderFavoriteType), this.favoriteFolderStructureComponent.rootFolderNode);
            this.updateOriginalAndNewFolderHolding();
            this.folderFavoriteTreeService.favoriteChangeHoldingFolderStateMap.get(this.favoriteChange).set(FavoriteChangeFolderState.NEW, this.selectedFolder);
            // If favoritePermissionComponent is available, add favoriteDescription to the change value.
            if (this.favoritePermissionComponent && this.favoriteChange instanceof FavoriteChange) {
                this.favoriteChange.favoriteDescription = this.favoritePermissionComponent.favoriteDescription;
            }
        } else {
            this.isApplyButtonDisabled = this.isFolderSelectionRequiredEnabled && this.selectedUser === CoreFavoriteConstants.ADMIN;
        }
        this.closeModal(this.selectedUser);
    }

    onFolderSelected(selectedFolder: AuxAdvancedTreeListInterface): void {
        this.selectedFolder = selectedFolder;
        this.isFolderRequirementMet = true;
    }

    /**
     * Update who's holding favoriteChange.
     */
    updateOriginalAndNewFolderHolding(): void {
        // If SAVE, remove the favorite node from the originalFolder and add it to the newFolder.
        // originalFolder doesn't exist when the favorite is not saved within the folder structure.
        const originalFolder = this.folderFavoriteTreeService.favoriteChangeHoldingFolderStateMap.get(this.favoriteChange).get(FavoriteChangeFolderState.ORIGINAL);
        if (this.favoriteChange.saveMode === SaveMode.SAVE && originalFolder) {
            originalFolder.eventData.childFavoriteData = originalFolder.eventData.childFavoriteData.filter(child => child !== this.favoriteChange);
            originalFolder.isSelected = false;
        }

        this.selectedFolder.eventData.childFavoriteData ??= [];
        if (!this.selectedFolder.eventData.childFavoriteData.some(childFavoriteData => childFavoriteData.title === this.favoriteChange.saveTitle)) {
            this.selectedFolder.eventData.childFavoriteData.push(this.favoriteChange);
        }
    }

    protected onPermissionGroupsSelected(selectedPermissionGroups: string[]): void {
        this.selectedPermissionGroups = selectedPermissionGroups;
        this.updateApplyButtonState();
    }

    private updateApplyButtonState(): void {
        this.isApplyButtonDisabled = !this.isFolderTreeLoaded || !this.isFolderRequirementMet || !FavoritePermissionGroupComponent.isPermissionGroupRequirementsMet(this.selectedUser, this.selectedPermissionGroups);
    }

    /**
     * Enable save after folder tree is loaded
     * @param isLoaded
     * @protected
     */
    protected onFolderTreeLoaded(isLoaded: boolean): void {
        this.isFolderTreeLoaded = isLoaded;
        this.updateApplyButtonState();
    }

    /**
     * Updates the favorite description to save with
     */
    updateFavoriteDescription(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.favoriteChange.enterpriseDescription = event.detail.value;
    }
}
