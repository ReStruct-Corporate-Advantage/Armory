import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {PortfolioConstraintDetail} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {agraph_platform_event_logging_explore_event_v1_PortfolioConstraintDetailSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {TelemetryPortfolioConstraintDetailParameter} from '../../parameters';

/**
 * Tracker to track portfolio constraints while running optimization
 */
export class TelemetryPortfolioConstraintDetailTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryPortfolioConstraintDetailParameter, PortfolioConstraintDetail> {

    /**
     * constructor
     */
    constructor() {
        super(eventSchema, 'explore:portfolio-constraint-details');
    }

    /**
     * Generate a protoBuff for portfolio constraints when the user runs optimization
     */
    generateProtoBuff(parameter: TelemetryPortfolioConstraintDetailParameter): PortfolioConstraintDetail {
        const portfolioConstraintDetail = new PortfolioConstraintDetail();
        portfolioConstraintDetail.setConstraintAttribute(parameter.constraintAttribute);
        portfolioConstraintDetail.setPortfolioConstraintValue(parameter.portfolioConstraintValue);
        return portfolioConstraintDetail;
    }
}
