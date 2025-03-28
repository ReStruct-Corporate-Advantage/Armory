import {ExploreComparisonModeStats} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {TelemetryComparisonModeTrackingParameters} from "../../parameters";
import {TelemetryComparisonModeTracker} from "./telemetry-comparison-mode-tracker";

describe('TelemetryComparisonModeTracker', () => {

    const telemetryComparisonModeTracker = new TelemetryComparisonModeTracker();

    it('should log ExploreComparisonModeStats', () => {
        const action = new TelemetryComparisonModeTrackingParameters({editMode: true,
            changeApplied: true});
        const protoBuff = telemetryComparisonModeTracker.generateProtoBuff(action);
        expect(protoBuff instanceof ExploreComparisonModeStats).toBe(true);
        expect((protoBuff as ExploreComparisonModeStats).getEditMode()).toBeTruthy();
        expect((protoBuff as ExploreComparisonModeStats).getChangeApplied()).toBeTruthy();
    });
});
