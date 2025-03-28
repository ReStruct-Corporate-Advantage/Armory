import {BaseTelemetryActionTracker} from '../../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../../telemetry-abstract-action-tracker';
import {
    StressScenarioCreationConfigEvent,
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {
    agraph_platform_event_logging_explore_event_v1_StressScenarioCreationConfigEventSchema as eventSchema
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {TelemetryStressScenarioCreationConfigEventParameters} from '../../../parameters';
import {TelemetryFactorTracker} from '../../widget-actions/factor-data-widget';
import {CommonUtils} from '../../../../core/utils';

/**
 * TelemetryStressScenarioCreationConfigEventTracker is used to generate protos to capture stress scenario creation requests
 */
export class TelemetryStressScenarioCreationConfigEventTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryStressScenarioCreationConfigEventParameters, StressScenarioCreationConfigEvent> {

    static telemetryFactorTracker = new TelemetryFactorTracker();

    constructor() {
        super(eventSchema, 'explore:stress-scenario-creation-config-event');
    }

    generateProtoBuff(parameter: TelemetryStressScenarioCreationConfigEventParameters): StressScenarioCreationConfigEvent {
        const scenarioCreationConfigEvent = new StressScenarioCreationConfigEvent();
        scenarioCreationConfigEvent.setScenarioType(parameter.scenarioType);
        scenarioCreationConfigEvent.setDxsShockUnit(parameter.dxsShockUnit);
        if (parameter.impliedShockUnit) {
            scenarioCreationConfigEvent.setImpliedShockUnit(parameter.impliedShockUnit);
        }
        if (parameter.restrictImpliedShock) {
            scenarioCreationConfigEvent.setRestrictImpliedShock(parameter.restrictImpliedShock);
        }
        if (parameter.noiseDampening) {
            scenarioCreationConfigEvent.setNoiseDampening(parameter.noiseDampening);
        }
        if (parameter.startDate) {
            scenarioCreationConfigEvent.setStartDate(CommonUtils.createReportingDate(parameter.startDate));
        }
        if (parameter.endDate) {
            scenarioCreationConfigEvent.setEndDate(CommonUtils.createReportingDate(parameter.endDate));
        }
        if (parameter.holdingPeriodOverride) {
            scenarioCreationConfigEvent.setHoldingPeriodOverride(parameter.holdingPeriodOverride);
        }
        if (parameter.createNewSpecifiedScenario) {
            scenarioCreationConfigEvent.setCreateNewSpecifiedScenario(parameter.createNewSpecifiedScenario);
        }
        if (parameter.shockCorrelationsDateEnabled) {
            scenarioCreationConfigEvent.setShockCorrelationsDateEnabled(parameter.shockCorrelationsDateEnabled);
        }
        if (parameter.viewedAsSpecifiedShock) {
            scenarioCreationConfigEvent.setViewedAsSpecifiedShock(parameter.viewedAsSpecifiedShock);
        }
        if (parameter.factorColumnsList) {
            const factorColumnsList = parameter.factorColumnsList.map(factor => TelemetryStressScenarioCreationConfigEventTracker.telemetryFactorTracker.generateProtoBuff(factor));
            scenarioCreationConfigEvent.setFactorListsList(factorColumnsList);
        }
        return scenarioCreationConfigEvent;
    }
}
