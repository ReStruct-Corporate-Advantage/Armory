import {TelemetryWhatIfPortfolioTrackingParameters} from '../../parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {ExploreSaveWhatIfStats} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreSaveWhatIfStatsSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';

export class TelemetrySaveWhatIfPortfolioTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryWhatIfPortfolioTrackingParameters, ExploreSaveWhatIfStats> {

    constructor() {
        super(eventSchema, 'explore-save-what-if-portfolio');
    }

    /**
     * Generate a protoBuff for events when the user saves what-if portfolio
     */
    generateProtoBuff(parameter: TelemetryWhatIfPortfolioTrackingParameters): ExploreSaveWhatIfStats {
        const exploreSaveWhatIfPortfolio = new ExploreSaveWhatIfStats();
        exploreSaveWhatIfPortfolio.setWhatIfPortfolioType(parameter.typeOfPortfolio);
        exploreSaveWhatIfPortfolio.setHasOtherWhatIf(parameter.hasOtherWhatIfs);
        return exploreSaveWhatIfPortfolio;
    }
}
