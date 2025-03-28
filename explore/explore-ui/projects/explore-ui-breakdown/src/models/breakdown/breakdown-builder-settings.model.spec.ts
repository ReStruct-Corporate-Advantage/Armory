import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {BreakdownBuilderSettings} from './breakdown-builder-settings.model';
import {BreakdownFavoriteConstants} from '../../constants/breakdown-favorite.constants';

describe('BreakdownBuilderSettingsModal', () => {

    it('Test getBreakdownDisplayName', () => {
        const breakdownBuilderSettings = new BreakdownBuilderSettings();
        breakdownBuilderSettings.inputName = CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN;
        expect(breakdownBuilderSettings.getBreakdownDisplayName()).toEqual(BreakdownFavoriteConstants.FACTOR_BREAKDOWN_DISPLAY_NAME);
        breakdownBuilderSettings.inputName = '';
        breakdownBuilderSettings.favoriteType = BreakdownFavoriteConstants.FACTOR_BREAKDOWN;
        expect(breakdownBuilderSettings.getBreakdownDisplayName()).toEqual(BreakdownFavoriteConstants.FACTOR_BREAKDOWN_DISPLAY_NAME);
        breakdownBuilderSettings.favoriteType = BreakdownFavoriteConstants.BREAKDOWN;
        expect(breakdownBuilderSettings.getBreakdownDisplayName()).toEqual(BreakdownFavoriteConstants.BREAKDOWN);
    });
});
