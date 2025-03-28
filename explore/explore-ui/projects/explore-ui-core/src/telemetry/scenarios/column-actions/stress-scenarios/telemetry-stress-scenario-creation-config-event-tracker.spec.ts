import { TelemetryStressScenarioCreationConfigEventTracker } from './telemetry-stress-scenario-creation-config-event-tracker';
import { TelemetryStressScenarioCreationConfigEventParameters } from '../../../parameters';
import {
    StressScenarioCreationConfigEvent
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';

describe('TelemetryStressScenarioCreationConfigEventTracker', () => {
    let tracker: TelemetryStressScenarioCreationConfigEventTracker;

    beforeEach(() => {
        tracker = new TelemetryStressScenarioCreationConfigEventTracker();
    });

    it('should create an instance', () => {
        expect(tracker).toBeTruthy();
    });

    it('should generate a StressScenarioDetail proto buff', () => {
        const parameters = new TelemetryStressScenarioCreationConfigEventParameters();
        parameters.scenarioType = 'type1';
        parameters.dxsShockUnit = 'unit1';
        parameters.impliedShockUnit = 'unit2';
        parameters.restrictImpliedShock = 'shock1';
        parameters.noiseDampening = 'damp1';
        parameters.startDate = '01/01/2022';
        parameters.endDate = '12/31/2022';
        parameters.holdingPeriodOverride = 10;
        parameters.createNewSpecifiedScenario = true;
        parameters.shockCorrelationsDateEnabled = true;
        parameters.viewedAsSpecifiedShock = true;
        parameters.factorColumnsList = [];
        const protoBuff = tracker.generateProtoBuff(parameters);
        expect(protoBuff instanceof StressScenarioCreationConfigEvent).toBe(true);
        expect(protoBuff.getScenarioType()).toEqual('type1');
        expect(protoBuff.getDxsShockUnit()).toEqual('unit1');
        expect(protoBuff.getImpliedShockUnit()).toEqual('unit2');
        expect(protoBuff.getRestrictImpliedShock()).toEqual('shock1');
        expect(protoBuff.getNoiseDampening()).toEqual('damp1');
        expect(protoBuff.getStartDate().toArray()).toEqual([2022, 1, 1]);
        expect(protoBuff.getEndDate().toArray()).toEqual([2022, 12, 31]);
        expect(protoBuff.getHoldingPeriodOverride()).toEqual(10);
        expect(protoBuff.getCreateNewSpecifiedScenario()).toEqual(true);
        expect(protoBuff.getShockCorrelationsDateEnabled()).toEqual(true);
        expect(protoBuff.getViewedAsSpecifiedShock()).toEqual(true);
        expect(protoBuff.getFactorListsList().length).toEqual(0);
    });
});
