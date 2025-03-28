import {TelemetryComparisonModeTrackingParameters} from './telemetry-comparison-mode-tracking-parameters';
describe('TelemetryComparisonModeTrackingParameters', () => {
    it('should test deserialize', () => {
        const params = new TelemetryComparisonModeTrackingParameters({
            editMode: true,
            changeApplied: true
        });
        expect(params.editMode).toBeTruthy();
        expect(params.changeApplied).toBeTruthy();
    });
});
