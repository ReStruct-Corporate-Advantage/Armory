import {CollapsedLookthroughColumnOption} from './collapsed-lookthrough-column-option.model';
import {CoreUserMetaDataStore,UserMetaData} from '@blk/explore-ui-core';

describe('Test CollapsedLookthroughColumnOption model', () => {
    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });
    it('Test serialize/deserialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const option = new CollapsedLookthroughColumnOption();
        option.lookthroughSettings.ltSecurityTypes.push('FUND');
        option.lookthroughSettings.ltSecurityTypes.push('ETF');

        const serialized = option.serialize();

        const otherOption = new CollapsedLookthroughColumnOption(serialized);

        expect(option.equals(otherOption)).toBeTruthy();
    });

    describe('Test isValid', () => {
        const option = new CollapsedLookthroughColumnOption();

        it('Test isValid with empty ltSecurityTypes', () => {
            expect(option.isValid()).toBeFalsy();
        });

        it('Test isValid', () => {
            option.lookthroughSettings.ltSecurityTypes.push('FUND');
            option.lookthroughSettings.ltSecurityTypes.push('ETF');
            expect(option.isValid()).toBeTruthy();
        });
    });
});
