import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';
import {
    SectorConstraintBoundType
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {
    TelemetrySectorConstraintBoundParameter
} from '../../parameters';
import {
    agraph_platform_event_logging_explore_event_v1_SectorConstraintBoundTypeSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';

/**
 * TelemetrySectorConstraintBoundTracker is used to generate protos for operators of sector constraints
 */
export class TelemetrySectorConstraintBoundTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetrySectorConstraintBoundParameter, SectorConstraintBoundType> {

    constructor() {
        super(eventSchema, 'explore:sector-constraint-bound-type');
    }

    /**
     * Generate a protoBuff for bound operators when user adds sector constraints in optimization
     */
    generateProtoBuff(parameter: TelemetrySectorConstraintBoundParameter): SectorConstraintBoundType {
        const sectorConstraintBoundType = new SectorConstraintBoundType();
        sectorConstraintBoundType.setLowerBoundConstraintOperator(parameter.constraintLowerBoundOperator);
        sectorConstraintBoundType.setUpperBoundConstraintOperator(parameter.constraintUpperBoundOperator);
        sectorConstraintBoundType.setConstraintType(parameter.constraintType);
        return sectorConstraintBoundType;
    }
}
