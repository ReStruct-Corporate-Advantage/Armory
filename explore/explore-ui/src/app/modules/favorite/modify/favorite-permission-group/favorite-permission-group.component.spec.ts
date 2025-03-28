import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FavoritePermissionGroupComponent} from './favorite-permission-group.component';
import {
    CoreDefinitionStore,
    CoreFavoriteConstants,
    CoreUserMetaDataStore,
    ExploreSelectOption,
    TokenConstants,
    UserMetaData
} from '@blk/explore-ui-core';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('FavoritePermissionGroupComponent', () => {
    let component: FavoritePermissionGroupComponent;
    let fixture: ComponentFixture<FavoritePermissionGroupComponent>;

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.userPermissionGroups = ['apg-rio'];
        CoreUserMetaDataStore.userMetaData.allEnterprisePermissionGroups = [
            {'value': 'apg-rio', 'text': 'APG RIO Team'},
            {'value': 'apm', 'text': 'APM Team'},
            {'value': 'qa', 'text': 'QA Team'}
        ];
        CoreDefinitionStore.tokens = {
            ExploreEnableEnterpriseTags: 'Y',
            ExploreEntPermTagsRequired: 'Y',
        };

        TestBed.configureTestingModule({
            declarations: [FavoritePermissionGroupComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        fixture = TestBed.createComponent(FavoritePermissionGroupComponent);
        component = fixture.componentInstance;

        component.selectedPermissionGroups = [];

        fixture.detectChanges();
    });

    it('should initialize with permission options correctly', () => {
        component.selectedPermissionGroups = ['apg-rio'];
        component.ngOnInit();

        expect(component.permGroupOptions.length).toBe(2);

        const userPermissionGroups = component.permGroupOptions[0];
        const otherPermissionGroups = component.permGroupOptions[1];

        expect(userPermissionGroups.label).toEqual('Your permission groups');
        expect(userPermissionGroups.values.length).toEqual(1);
        expect(userPermissionGroups.values[0]).toEqual({value: 'apg-rio', displayValue: 'APG RIO Team', isSelected: true});

        expect(otherPermissionGroups.label).toEqual('Other permission groups (optional)');
        expect(otherPermissionGroups.values.length).toEqual(2);
        expect(otherPermissionGroups.values[0]).toEqual({value: 'apm', displayValue: 'APM Team', isSelected: false});
        expect(otherPermissionGroups.values[1]).toEqual({value: 'qa', displayValue: 'QA Team', isSelected: false});
    });

    it('should emit updated permission groups when onPermissionsGroupsChanged is called', () => {
        jest.spyOn(component.permissionGroupsChanged, 'emit');

        const event = {
            detail: {
                value: [
                    new ExploreSelectOption('APG RIO Team', 'apg-rio', true),
                    new ExploreSelectOption('APM Team', 'apm', false)
                ]
            }
        } as CustomEvent;

        component.onPermissionsGroupsChanged(event);

        expect(component.permissionGroupsChanged.emit).toHaveBeenCalledWith(['apg-rio', 'apm']);
    });

    it('should return true if the feature is not enabled', () => {
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'N';

        expect(FavoritePermissionGroupComponent.isPermissionGroupRequirementsMet('user', ['apg-rio'])).toBe(true);
    });

    it('should return true if the feature is not applicable', () => {
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'Y';

        expect(FavoritePermissionGroupComponent.isPermissionGroupRequirementsMet('user', ['apg-rio'])).toBe(true);
    });

    it('should return false if permissions are required and none are selected', () => {
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'Y';
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED] = 'Y';

        expect(FavoritePermissionGroupComponent.isPermissionGroupRequirementsMet(CoreFavoriteConstants.ADMIN, [])).toBe(false);
    });

    it('should return true if permissions are not required and none are selected', () => {
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'Y';
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED] = 'N';

        expect(FavoritePermissionGroupComponent.isPermissionGroupRequirementsMet(CoreFavoriteConstants.ADMIN, [])).toBe(true);
    });

    it('should return true if selected permissions include at least one of the users permission groups', () => {
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'Y';
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED] = 'Y';

        expect(FavoritePermissionGroupComponent.isPermissionGroupRequirementsMet(CoreFavoriteConstants.ADMIN, ['apg-rio'])).toBe(true);
    });

    it('should return false if selected permissions do not include any of the users permission groups', () => {
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'Y';
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED] = 'Y';

        expect(FavoritePermissionGroupComponent.isPermissionGroupRequirementsMet(CoreFavoriteConstants.ADMIN, ['qa'])).toBe(false);
    });

    it('should validate selected permission groups correctly', () => {
        CoreDefinitionStore.tokens.ExploreEntPermTagsRequired = 'Y';

        // Case 1: Valid selection (user belongs to one of the selected groups)
        component['validateSelectedPermissionGroups'](['apg-rio']);
        expect(component.isValidSelection).toBe(true);

        // Case 2: Invalid selection (user does not belong to any of the selected groups)
        component['validateSelectedPermissionGroups'](['qa']);
        expect(component.isValidSelection).toBe(false);

        // Case 3: Valid selection (no permission groups selected and not required)
        CoreDefinitionStore.tokens.ExploreEntPermTagsRequired = 'N';
        component['validateSelectedPermissionGroups']([]);
        expect(component.isValidSelection).toBe(true);

        // Case 4: Valid selection (user belongs to one of the selected groups and not required)
        component['validateSelectedPermissionGroups'](['apg-rio']);
        expect(component.isValidSelection).toBe(true);
    });
});
