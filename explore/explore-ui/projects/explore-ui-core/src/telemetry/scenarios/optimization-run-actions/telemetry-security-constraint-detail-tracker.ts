import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {SecurityConstraintDetail} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {agraph_platform_event_logging_explore_event_v1_SecurityConstraintDetailSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {TelemetrySecurityConstraintDetailParameter} from '../../parameters';

/**
 * Tracker to track Security constraints while running optimization
 */
export class TelemetrySecurityConstraintDetailTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetrySecurityConstraintDetailParameter, SecurityConstraintDetail> {

    /**
     * constructor
     */
    constructor() {
        super(eventSchema, 'explore:security-constraint-details');
    }

    /**
     * Generate a protoBuff for Security constraints when the user runs optimization
     */
    generateProtoBuff(parameter: TelemetrySecurityConstraintDetailParameter): SecurityConstraintDetail {
        const securityConstraintDetail = new SecurityConstraintDetail();
        securityConstraintDetail.setConstraintAttribute(parameter.constraintAttribute);
        securityConstraintDetail.setSecurityConstraintAppliedUsing(parameter.wayToApplySecurityConstraint);
        return securityConstraintDetail;
    }
}
