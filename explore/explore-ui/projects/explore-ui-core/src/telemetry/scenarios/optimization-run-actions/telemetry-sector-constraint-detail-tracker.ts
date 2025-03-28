import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {
    TelemetrySectorConstraintDetailParameter
} from '../../parameters';
import {
    SectorConstraintDetail
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {
    agraph_platform_event_logging_explore_event_v1_SectorConstraintDetailSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {TelemetrySectorConstraintBoundTracker} from './telemetry-sector-constraint-bound-tracker';

/**
 * TelemetrySectorConstraintDetailTracker is used to generate protos for individual sector constraints
 */
export class TelemetrySectorConstraintDetailTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetrySectorConstraintDetailParameter, SectorConstraintDetail> {

    static sectorBoundType = new TelemetrySectorConstraintBoundTracker();

    constructor() {
        super(eventSchema, 'explore:sector-constraint-details');
    }

    /**
     * Generate a protoBuff when user adds sector constraints in optimization
     */
    generateProtoBuff(parameter: TelemetrySectorConstraintDetailParameter): SectorConstraintDetail {
        const sectorConstraintDetail = new SectorConstraintDetail();
        sectorConstraintDetail.setConstraintAttribute(parameter.constraintAttribute);
        sectorConstraintDetail.setSelectedSector(parameter.sectorsForConstraint);
        sectorConstraintDetail.setConstraintBoundType(TelemetrySectorConstraintDetailTracker.sectorBoundType.generateProtoBuff(parameter.sectorConstraintType));
        sectorConstraintDetail.setFilterApplied(parameter.isFilterApplied);
        return sectorConstraintDetail;
    }
}
