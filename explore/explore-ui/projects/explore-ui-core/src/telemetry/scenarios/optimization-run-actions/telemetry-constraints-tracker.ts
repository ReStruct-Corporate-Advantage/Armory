import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {TelemetryConstraintsParameters} from '../../parameters';
import {
    agraph_platform_event_logging_explore_event_v1_ExploreRunOptimizationConstraintsSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {
    ExploreRunOptimizationConstraints
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {TelemetrySectorConstraintDetailTracker} from './telemetry-sector-constraint-detail-tracker';
import {TelemetrySecurityConstraintDetailTracker} from './telemetry-security-constraint-detail-tracker';
import {TelemetryPortfolioConstraintDetailTracker} from './telemetry-portfolio-constraint-detail-tracker';
import {TelemetryFactorConstraintDetailTracker} from './telemetry-factor-constraint-detail-tracker';

/**
 * TelemetryConstraintsTracker is used to generated protos to capture user actions on running optimization (only constraints)
 */
export class TelemetryConstraintsTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryConstraintsParameters, ExploreRunOptimizationConstraints> {

    static sectorConstraintDetail = new TelemetrySectorConstraintDetailTracker();
    static securityConstraintDetail = new TelemetrySecurityConstraintDetailTracker();
    static portfolioConstraintDetail = new TelemetryPortfolioConstraintDetailTracker();
    static factorContraintDetail = new TelemetryFactorConstraintDetailTracker();

    constructor() {
        super(eventSchema, 'explore:run-optimization-constraints-stats');
    }

    /**
     * Generate a protoBuff for events when the user runs optimization (only for constraints)
     */
    generateProtoBuff(parameter: TelemetryConstraintsParameters): ExploreRunOptimizationConstraints {
        const exploreRunOptimizationConstraints = new ExploreRunOptimizationConstraints();
        exploreRunOptimizationConstraints.setPortfolioConstraintDetailsList(parameter.portfolioConstraints
            .map(param => TelemetryConstraintsTracker.portfolioConstraintDetail.generateProtoBuff(param)));
        exploreRunOptimizationConstraints.setSecurityConstraintDetailsList(parameter.securityConstraints
            .map(param => TelemetryConstraintsTracker.securityConstraintDetail.generateProtoBuff(param)));
        exploreRunOptimizationConstraints.setSectorConstraintDetailsList(parameter.sectorConstraints
            .map(param => TelemetryConstraintsTracker.sectorConstraintDetail.generateProtoBuff(param)));
        exploreRunOptimizationConstraints.setFactorConstraintDetailsList(parameter.factorConstraints
            .map(param => TelemetryConstraintsTracker.factorContraintDetail.generateProtoBuff(param)));
        return exploreRunOptimizationConstraints;
    }

}
