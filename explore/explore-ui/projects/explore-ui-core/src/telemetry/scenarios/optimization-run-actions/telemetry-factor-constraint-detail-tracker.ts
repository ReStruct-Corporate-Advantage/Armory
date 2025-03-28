import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {FactorConstraintDetail} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {agraph_platform_event_logging_explore_event_v1_FactorConstraintDetailSchema  as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {TelemetryFactorConstraintDetailParameter} from '../../parameters';

/**
 * Tracker to track factor constraints while running optimization
 */
export class TelemetryFactorConstraintDetailTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryFactorConstraintDetailParameter, FactorConstraintDetail> {

    /**
     * constructor
     */
    constructor() {
        super(eventSchema, 'explore:factor-constraint-details');
    }

    /**
     * Generate a protoBuff for portfolio constraints when the user runs optimization
     */
    generateProtoBuff(parameter: TelemetryFactorConstraintDetailParameter): FactorConstraintDetail {
        const factorConstraintDetail = new FactorConstraintDetail();
        factorConstraintDetail.setConstraintAttribute(parameter.constraintAttribute);
        factorConstraintDetail.setFactorConstraintName(parameter.factorConstraintName);
        return factorConstraintDetail;
    }
}
