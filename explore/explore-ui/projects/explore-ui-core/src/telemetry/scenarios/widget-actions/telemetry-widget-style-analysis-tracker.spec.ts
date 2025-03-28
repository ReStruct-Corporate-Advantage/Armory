import {TelemetryWidgetStyleAnalysisTracker} from './telemetry-widget-style-analysis-tracker';
import {
    TelemetryStyleAnalysisParameters,
    TelemetryStyleColumnSettingsParameters,
    TelemetryStyleMeasureSettingsParameters
} from '../../parameters';
import {StyleMeasureMode} from '../../enums';

describe('Telemetry Style Analysis Tracker', () => {
    it(' it should test generateProtoBuff', () => {
        const trackerInvestment = new TelemetryWidgetStyleAnalysisTracker();
        const measures = new TelemetryStyleMeasureSettingsParameters({'max': 5, 'min': 2, 'weight': 2, 'mode': StyleMeasureMode.STYLE_MEASURE_MODE_NORMAL});
        const map = new Map();
        map.set('column_1', measures);
        const styleColumnSettings = new TelemetryStyleColumnSettingsParameters({'subColumn': 'column_1', 'measuresExpanded': true, 'measuresSettings': map});
        const map2 = new Map();
        map2.set('column', styleColumnSettings);
        const params = new TelemetryStyleAnalysisParameters({'widgetType': 'risk', 'columnSettings': map2});
        const stats = trackerInvestment.generateProtoBuff(params);
        expect(stats.getColumnSettingsMap().getLength()).toBe(1);
        expect(stats.getWidgetType()).toBe('risk');
        expect(stats.getColumnSettingsMap().get('column').getMeasuresSettingsMap().getLength()).toBe(1);
    });
});
