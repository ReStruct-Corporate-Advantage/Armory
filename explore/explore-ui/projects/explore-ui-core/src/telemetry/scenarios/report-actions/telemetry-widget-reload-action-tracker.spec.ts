import {ExploreWidgetReloadUserBehavior} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {TelemetryWidgetReloadActionTracker} from './telemetry-widget-reload-action-tracker';
import {TelemetryWidgetReloadParameters} from '../../parameters/report-actions/telemetry-widget-reload-parameters';

describe('TelemetryReportUserActionTracker', () => {

    const telemetryWidgetReloadActionTracker = new TelemetryWidgetReloadActionTracker();

    it('should log ExploreWidgetReloadUserBehavior', () => {
        const reportUserActionParameters = new TelemetryWidgetReloadParameters('risk', true, Array.of('col1', 'col2'),
            'Risk & Exposure');
        const protoBuff = telemetryWidgetReloadActionTracker.generateProtoBuff(reportUserActionParameters);
        expect(protoBuff instanceof ExploreWidgetReloadUserBehavior).toBe(true);
        expect((protoBuff as ExploreWidgetReloadUserBehavior).getWidgetName()).toEqual('Risk & Exposure');
        expect((protoBuff as ExploreWidgetReloadUserBehavior).getWidgetType()).toEqual('risk');
        expect((protoBuff as ExploreWidgetReloadUserBehavior).getHardRefresh()).toEqual(true);
        expect((protoBuff as ExploreWidgetReloadUserBehavior).getColumnTagsList()).toEqual(Array.of('col1', 'col2'));
    });
});
