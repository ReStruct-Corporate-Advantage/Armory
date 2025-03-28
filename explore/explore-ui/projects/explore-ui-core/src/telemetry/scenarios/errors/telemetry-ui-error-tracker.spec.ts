import {TelemetryUIErrorTracker} from './telemetry-ui-error-tracker';
import {ErrorTypeConstants} from './error-type.constants';
import {UIErrorParameters} from './ui-error-parameters';

describe('TelemetryUIErrorTracker Test', () => {
    // Just for the sake of test coverage - not meaningful test.
    // The tests are just to check the protobuff setters but even this cannot be tested directly either (implementation is not accessible).
    const telemetryUIErrorTracker = new TelemetryUIErrorTracker();

    it('should generateProtoBuff', () => {
        const errorMessage = 'Date Vary is not supported with Column Level Breakdowns. Remove the column level breakdown to proceed.';
        const parameters = new UIErrorParameters(
            ErrorTypeConstants.UI_VALIDATION_ERROR,
            errorMessage,
            ['SNP500'],
            false,
            'Test Report',
            123,
            'seakim',
            'riskExposure',
            'Risk and exposure'
        );

        const exploreUiError = telemetryUIErrorTracker.generateProtoBuff(parameters);
        telemetryUIErrorTracker['setAnalysisContext'](parameters, exploreUiError);
        telemetryUIErrorTracker['setReportContext'](parameters, exploreUiError.getExploreAnalysisContext());
        telemetryUIErrorTracker['setWidgetContext'](parameters, exploreUiError);
    });
});
