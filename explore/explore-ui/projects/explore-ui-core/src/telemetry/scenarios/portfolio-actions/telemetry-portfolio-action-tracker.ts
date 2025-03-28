import {ExploreAddPortfolio} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreAddPortfolioSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {CommonUtils} from '../../../core/utils';
import {AddPortfolioTrackingParameters} from '../../parameters/portfolio-actions/telemetry-portfolio-tracking-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

/**
 * TelemetryPortfolioActionTracker is used to generated protos to capture events done on Portfolios
 */
export class TelemetryPortfolioActionTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<AddPortfolioTrackingParameters, ExploreAddPortfolio[]> {

    constructor() {
        super(eventSchema, 'explore:add-portfolio');
    }

    /**
     * generateProtoBuff creates and returns an ExploreAddPortfolio object populated with the data in parameters
     */
    generateProtoBuff(parameters: AddPortfolioTrackingParameters): ExploreAddPortfolio[] {
        const addPortActionArray = [];
        parameters.portArray.forEach((portTicker) => {
            const addPortAction = new ExploreAddPortfolio();
            addPortAction.setPortfolioQueryDate(CommonUtils.createReportingDate(parameters.portfolioQueryDate));
            addPortAction.setAddPortfolioSource(parameters.addPortSource);
            addPortAction.setExplorePortfolioType(parameters.portType);
            addPortActionArray.push(addPortAction);
        });
        return addPortActionArray;
    }
}
