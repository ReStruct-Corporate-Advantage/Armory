import {TelemetryLoadPortfolioTracker} from './telemetry-load-portfolio-tracker';
import {
    TelemetryLoadPortfolioTypeParameters
} from '../../parameters/portfolio-actions/telemetry-load-portfolio-type-parameters';
import {ExplorePortfolioFavoriteTypeEnum} from '../../enums';

describe('TelemetryLoadPortfolioTypeParameters', () => {
    it('should test generateProtoBuff', () => {
        const tracker = new TelemetryLoadPortfolioTracker();
        const stats = tracker.generateProtoBuff(new TelemetryLoadPortfolioTypeParameters({ typeOfFavorite: ExplorePortfolioFavoriteTypeEnum.EXPLORE_FAVORITE_TYPE_SHARED}));
        expect(stats.getWhatIfFavoriteType()).toBe(1);
    });
});
