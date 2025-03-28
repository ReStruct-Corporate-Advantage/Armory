import { TelemetryFactorTracker } from './telemetry-factor-tracker';
import { TelemetryFactorParameters } from '../../../parameters';
import { Factor } from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';

describe('TelemetryFactorTracker', () => {
    let tracker: TelemetryFactorTracker;

    beforeEach(() => {
        tracker = new TelemetryFactorTracker();
    });

    it('should create an instance', () => {
        expect(tracker).toBeTruthy();
    });

    it('should generate a Factor proto buff', () => {
        const parameters = new TelemetryFactorParameters({
            factorTag: 'tag1',
            factorKey: 'key1',
            riskSettingsChanged: true,
            fxCrossCurrencyChanged: true,
            shockSettingsChanged: true
        });
        const protoBuff = tracker.generateProtoBuff(parameters);
        expect(protoBuff instanceof Factor).toBe(true);
        expect(protoBuff.getFactorTag()).toEqual('tag1');
        expect(protoBuff.getFactorKey()).toEqual('key1');
        expect(protoBuff.getRiskSettingsChanged()).toEqual(true);
        expect(protoBuff.getFxCrossCurrencyChanged()).toEqual(true);
        expect(protoBuff.getShockSettingsChanged()).toEqual(true);
    });
});
