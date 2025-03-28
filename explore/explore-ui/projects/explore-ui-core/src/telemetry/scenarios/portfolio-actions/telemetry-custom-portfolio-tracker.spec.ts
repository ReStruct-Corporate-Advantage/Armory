import {TelemetryCustomPortfolioTracker} from './telemetry-custom-portfolio-tracker';
import {TelemetryCustomPortfolioTrackingParameters} from '../../parameters';
import {ExplorePortfolioTypeEnum, ModellingColumn, WayToAddSecurity} from '../../enums';

describe('TelemetryCustomPortfolioTracker', () => {
    it('should test generateProtoBuff', () => {
        const tracker = new TelemetryCustomPortfolioTracker();
        const params = new TelemetryCustomPortfolioTrackingParameters({
            wayToAddSecurity: WayToAddSecurity.COPY_PASTE_SECURITIES,
            isCalculateNavUsed: true,
            isSecuritiesCleared: true,
            hasOtherWhatIfs: false,
            typeOfPortfolio: ExplorePortfolioTypeEnum.PORTFOLIO,
            modellingColumnUsed: ModellingColumn.cur_face,
            securitiesFailedToUpload: 5,
            securitiesUploadedSuccessfully: 5
        });
        params.addedPortfoliosTypeToCountMap = new Map<string, number>([]);
        const stats = tracker.generateProtoBuff(params);

        expect(stats.getCalculateNavUsed()).toBe(true);
        expect(stats.getHasOtherWhatIf()).toBe(false);
        expect(stats.getSecuritiesCleared()).toBe(true);
    });
});
