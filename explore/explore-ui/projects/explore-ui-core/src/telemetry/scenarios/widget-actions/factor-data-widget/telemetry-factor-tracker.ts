import {BaseTelemetryActionTracker} from '../../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../../telemetry-abstract-action-tracker';
import {
    TelemetryFactorParameters,
} from '../../../parameters';
import {
    Factor,
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {
    agraph_platform_event_logging_explore_event_v1_FactorSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';

/**
 * TelemetryFactorTracker is used to generate protos to capture factor for factor data widget
 */
export class TelemetryFactorTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryFactorParameters, Factor> {

    constructor() {
        super(eventSchema, 'explore:factor');
    }

    generateProtoBuff(parameter: TelemetryFactorParameters): Factor {
        const factor = new Factor();
        factor.setFactorTag(parameter.factorTag);
        factor.setFactorKey(parameter.factorKey);
        factor.setRiskSettingsChanged(parameter.riskSettingsChanged);
        factor.setFxCrossCurrencyChanged(parameter.fxCrossCurrencyChanged);
        factor.setShockSettingsChanged(parameter.shockSettingsChanged);
        return factor;
    }
}
