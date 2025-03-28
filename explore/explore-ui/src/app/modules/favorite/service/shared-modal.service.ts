import {Injectable} from '@angular/core';
import {SaveMode} from '@enums/save-mode.enum';
import {CoreCommonConstants, CoreFavoriteUtils, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {SavableFavoriteChange} from '@services/favorite-change-detection/favorite-change-detection.service';

/**
 * Service that handle warning modal when folder is not selected.
 */
@Injectable({
  providedIn: 'root'
})
export class SharedModalService {
    /**
     * Updates the save options for a given favorite change.
     *
     * @param favoriteChange - The favorite change object containing the details of the change.
     * @returns An array of AuxRadioInterface objects representing the save options.
     *
     * The method determines the save options based on the ownership and save mode of the favorite change.
     * If the favorite change is owned by someone other than the saving user, the "Save" option is disabled.
     * Otherwise, the save mode is set to either the existing save mode or the default save mode (SaveMode.SAVE).
     * The method returns an array of save options with appropriate labels, checked states, and disabled states.
     */
    updateSaveOptions(favoriteChange: SavableFavoriteChange): AuxRadioInterface[] {
        const isSavingAsDifferentUser = favoriteChange.value.owner && favoriteChange.value.owner !== favoriteChange.savingUser;
        // user is permissioned if token not enabled, no user perms assigned, or they are included in permission group of previously saved favorites
        const isUserPermissioned = !TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS) ||
            !favoriteChange.value.userPermGrps?.length || CoreFavoriteUtils.isUserPermissionGroupIncluded(favoriteChange.value.userPermGrps);
        // disabled Save if a user is saving as a different user, or they are not permissioned
        const isSaveDisabled = isSavingAsDifferentUser || !isUserPermissioned;
        favoriteChange.saveMode = isSaveDisabled ? SaveMode.SAVE_AS : favoriteChange.saveMode || SaveMode.SAVE;

        return [
          { label: CoreCommonConstants.BUTTON_TEXT.SAVE, checked: favoriteChange.saveMode === SaveMode.SAVE, disabled: isSaveDisabled, eventData: SaveMode.SAVE },
          { label: CoreCommonConstants.BUTTON_TEXT.SAVE_AS, checked: favoriteChange.saveMode === SaveMode.SAVE_AS, disabled: !favoriteChange.value.owner, eventData: SaveMode.SAVE_AS }
        ];
    }

    /**
     * Opens the folder structure modal.
     *
     * @param component - The component instance that contains the modal state.
     *
     * This method sets the `isFolderStructureModalOpen` property of the component to `true` to open the modal.
     */
    openFolderStructureModal(component: any): void {
        component.isFolderStructureModalOpen = true;
    }

    /**
     * Closes the folder structure modal and updates the save options if a saving user is selected.
     *
     * @param component - The component instance that contains the modal state and favorite change details.
     * @param selectedSavingUser - The selected saving user. If provided, it updates the saving user in the favorite change and refreshes the save options.
     *
     * This method sets the `isFolderStructureModalOpen` property of the component to `false` to close the modal.
     * If a `selectedSavingUser` is provided, it updates the `savingUser` property of the `favoriteChange` object in the component
     * and calls `updateSaveOptions` to refresh the save options based on the new saving user.
     */
    closeFolderStructureModal(component: any, selectedSavingUser: string): void {
        if (typeof selectedSavingUser === 'string') {
          component.favoriteChange.savingUser = selectedSavingUser;
          component.saveOptions = this.updateSaveOptions(component.favoriteChange);
        }
        component.isFolderStructureModalOpen = false;
    }
}
