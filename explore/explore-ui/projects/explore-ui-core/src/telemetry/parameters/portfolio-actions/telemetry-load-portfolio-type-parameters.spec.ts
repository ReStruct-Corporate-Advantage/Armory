import {TelemetryLoadPortfolioTypeParameters} from './telemetry-load-portfolio-type-parameters';
import {ExplorePortfolioFavoriteTypeEnum} from '../../enums';

describe('TelemetryLoadPortfolioTypeParameters', () => {
    it('should test deserialize', () => {
        const params = new TelemetryLoadPortfolioTypeParameters({
            typeOfFavorite: ExplorePortfolioFavoriteTypeEnum.EXPLORE_FAVORITE_TYPE_SHARED
        });
        expect(params.typeOfFavorite).toBe(ExplorePortfolioFavoriteTypeEnum.EXPLORE_FAVORITE_TYPE_SHARED);
    });
});
