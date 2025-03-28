import {TelemetryReportActionParameters} from '../../parameters/report-actions/telemetry-report-action-parameters';
import {ExploreReportUserBehaviour} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {TelemetryReportActionTracker} from './telemetry-report-action-tracker';

describe('TelemetryReportUserActionTracker', () => {

    const telemetryReportUserActionTracker = new TelemetryReportActionTracker();

    it('should log ExploreReportUserBehaviour', () => {
        const reportUserActionParameters = new TelemetryReportActionParameters({actionType: 'RELOAD',
            widgetTypes: Array.of('risk', 'bar'), reportTitle: 'Dummy Report', reportId: null, reportOwner: null});
        const protoBuff = telemetryReportUserActionTracker.generateProtoBuff(reportUserActionParameters);
        expect(protoBuff instanceof ExploreReportUserBehaviour).toBe(true);
        expect((protoBuff as ExploreReportUserBehaviour).getActionType()).toEqual('RELOAD');
        expect((protoBuff as ExploreReportUserBehaviour).getWidgetsCount()).toEqual(2);
        expect( (protoBuff as ExploreReportUserBehaviour).getWidgetTypesList()).toEqual(Array.of('risk', 'bar'));
    });
});
