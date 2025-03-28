import {TestBed} from '@angular/core/testing';

import {SharedModalService} from './shared-modal.service';
import {SaveMode} from '@enums/save-mode.enum';
import {
    SavableFavoriteChange
} from '../../../shared/services/favorite-change-detection/favorite-change-detection.service';
import {
    CoreCommonConstants,
    CoreDefinitionStore,
    CoreUserMetaDataStore,
    TokenConstants,
    UserMetaData
} from '@blk/explore-ui-core';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';

describe('SharedModalService', () => {

    let service: SharedModalService;

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.userPermissionGroups = ['group1'];
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'Y';

        TestBed.configureTestingModule({});
        service = TestBed.inject(SharedModalService);
    });

    test('Save disabled, Save-as enabled and selected when user is saving as a different user', () => {
        const favoriteChange: SavableFavoriteChange = {
            value: {
                owner: 'otherUser',
                userPermGrps: []
            },
            savingUser: 'currentUser',
            saveMode: SaveMode.SAVE
        };

        const result: AuxRadioInterface[] = service.updateSaveOptions(favoriteChange);

        expect(result).toEqual([
            { label: CoreCommonConstants.BUTTON_TEXT.SAVE, checked: false, disabled: true, eventData: SaveMode.SAVE },
            { label: CoreCommonConstants.BUTTON_TEXT.SAVE_AS, checked: true, disabled: false, eventData: SaveMode.SAVE_AS }
        ]);
    });

    test('Save enabled and selected, Save-as enabled when user is permissioned', () => {
        const favoriteChange: SavableFavoriteChange = {
            value: {
                owner: 'currentUser',
                userPermGrps: ['group1']
            },
            savingUser: 'currentUser',
            saveMode: SaveMode.SAVE
        };

        const result: AuxRadioInterface[] = service.updateSaveOptions(favoriteChange);

        expect(result).toEqual([
            { label: CoreCommonConstants.BUTTON_TEXT.SAVE, checked: true, disabled: false, eventData: SaveMode.SAVE },
            { label: CoreCommonConstants.BUTTON_TEXT.SAVE_AS, checked: false, disabled: false, eventData: SaveMode.SAVE_AS }
        ]);
    });

    test('Save disabled, Save-as enabled and selected when user is not permissioned', () => {
        const favoriteChange: SavableFavoriteChange = {
            value: {
                owner: 'currentUser',
                userPermGrps: ['group2']
            },
            savingUser: 'currentUser',
            saveMode: SaveMode.SAVE
        };

        const result: AuxRadioInterface[] = service.updateSaveOptions(favoriteChange);

        expect(result).toEqual([
            { label: CoreCommonConstants.BUTTON_TEXT.SAVE, checked: false, disabled: true, eventData: SaveMode.SAVE },
            { label: CoreCommonConstants.BUTTON_TEXT.SAVE_AS, checked: true, disabled: false, eventData: SaveMode.SAVE_AS }
        ]);
    });
});
