import {TelemetrySaveWhatIfPortfolioTracker} from './telemetry-save-what-if-portfolio-tracker';
import {TelemetryWhatIfPortfolioTrackingParameters} from '../../parameters';
import {ExplorePortfolioTypeEnum} from '../../enums';

describe('TelemetrySavePortfolioTypeParameters', () => {
    it('should test generateProtoBuff', () => {
        const tracker = new TelemetrySaveWhatIfPortfolioTracker();
        const stats = tracker.generateProtoBuff(new TelemetryWhatIfPortfolioTrackingParameters({ typeOfPortfolio: ExplorePortfolioTypeEnum.WHAT_IF, hasOtherWhatIfs: true}));
        expect(stats.getWhatIfPortfolioType()).toBe(3);
        expect(stats.getHasOtherWhatIf()).toBeTruthy();
    });
});
