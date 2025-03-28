import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
    CoreFavoriteConstants,
    CoreFavoriteUtils,
    CoreUserMetaDataStore,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    TokenConstants,
    TokenUtils
} from '@blk/explore-ui-core';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';

@Component({
  selector: 'app-favorite-permission-group',
  templateUrl: './favorite-permission-group.component.html'
})
export class FavoritePermissionGroupComponent implements OnInit {

    // permission groups that are selected in this save session
    @Input()
    selectedPermissionGroups: string[];

    // emits when permission groups selection changes
    @Output()
    permissionGroupsChanged = new EventEmitter<string[]>();

    // when true, displays the select box to choose permission groups
    isPermissionGroupEnabled: boolean;
    // when true, requires user to select a permission group before saving
    isPermissionGroupRequired: boolean;

    // permission groups that a user is a part of
    userPermissionGroups: string[] = [];

    // flag indicating if selected user perms are valid for the user (they belong to one of them selected)
    isValidSelection = true;

    // select box data
    permGroupOptions: ExploreSelectOptionGroup[] = [];

    static isPermissionGroupRequirementsMet(selectedUser: string, selectedPermissionsGroups: string[]): boolean {
        // valid if not saving as enterprise
        if (selectedUser !== CoreFavoriteConstants.ADMIN) {
            return true;
        }

        // valid if feature is not enabled
        if (!TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS)) {
            return true;
        }

        // valid if user belongs to no perm groups
        if (!CoreUserMetaDataStore.userMetaData.userPermissionGroups?.length) {
            return true;
        }

        // not valid if permissions are required and none selected
        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED) && (selectedPermissionsGroups.length === 0)) {
            return false;
        }

        // valid if permissions are not required and none are selected
        if (!TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED) && (selectedPermissionsGroups.length === 0)) {
            return true;
        }

        // valid if selected permissions include at least one of the user's permission groups
        return CoreFavoriteUtils.isUserPermissionGroupIncluded(selectedPermissionsGroups);
    }

    ngOnInit() {
        this.isPermissionGroupEnabled = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS) && CoreUserMetaDataStore.userMetaData.userPermissionGroups?.length > 0;
        if (!this.isPermissionGroupEnabled) {
            return;
        }
        this.isPermissionGroupRequired = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED);

        this.initializePermissionOptions();
        this.validateSelectedPermissionGroups(this.selectedPermissionGroups);
    }

    initializePermissionOptions(): void {
        const allPermissionGroups: { text: string, value: string }[] = CoreUserMetaDataStore.userMetaData.allEnterprisePermissionGroups || [];
        if (allPermissionGroups.length === 0) {
            return;
        }

        const userPermissionGroups: string[] = CoreUserMetaDataStore.userMetaData.userPermissionGroups;

        const userPermissionGroupsOptions: ExploreSelectOption[] = [];
        const otherPermissionGroupOptions: ExploreSelectOption[] = [];

        allPermissionGroups.forEach(permissionGroup => {
            const option = new ExploreSelectOption(permissionGroup.text, permissionGroup.value, (this.selectedPermissionGroups || []).includes(permissionGroup.value));
            if (userPermissionGroups.includes(permissionGroup.value)) {
                this.userPermissionGroups.push(permissionGroup.value);
                userPermissionGroupsOptions.push(option);
            } else {
                otherPermissionGroupOptions.push(option);
            }
        });

        this.permGroupOptions = [
            new ExploreSelectOptionGroup(userPermissionGroupsOptions, 'Your permission groups'),
            new ExploreSelectOptionGroup(otherPermissionGroupOptions, 'Other permission groups (optional)'),
        ];
    }

    /**
     * Called when permission groups changed
     */
    onPermissionsGroupsChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const updatedPermissionGroups = (event.detail.value as AuxSelectOption[]).map((selectedColumn: ExploreSelectOption) => selectedColumn.value);
        this.validateSelectedPermissionGroups(updatedPermissionGroups);
        this.permissionGroupsChanged.emit(updatedPermissionGroups);
    }

    /**
     * Checks if selected perm groups are valid
     */
    private validateSelectedPermissionGroups(selectedPermGroups: string[]): void {
        this.isValidSelection = FavoritePermissionGroupComponent.isPermissionGroupRequirementsMet(CoreFavoriteConstants.ADMIN, selectedPermGroups);
    }

}
