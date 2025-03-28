import {ClickElemConstants, ClickEventParameters, ExploreClickableElementType, TelemetryClickEventTracker} from '@blk/explore-ui-core';
import {ExploreFrontendClickEvent} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';

describe('TelemetryClickEventTracker', () => {
    const telemetryClickEventTracker = new TelemetryClickEventTracker();

    it('should log TelemetryClickEventTracker', () => {
        const parameters = new ClickEventParameters(ExploreClickableElementType.MENU, 'Expand All', ClickElemConstants.SOURCE.WIDGET, ClickElemConstants.CONTEXT_PATH.WIDGET_RIGHT_CLICK);
        const protoBuff = telemetryClickEventTracker.generateProtoBuff(parameters);
        expect(protoBuff instanceof ExploreFrontendClickEvent).toBe(true);
        expect((protoBuff as ExploreFrontendClickEvent).getElementType()).toEqual(ExploreClickableElementType.MENU);
        expect((protoBuff as ExploreFrontendClickEvent).getElementLabel()).toEqual('Expand All');
        expect((protoBuff as ExploreFrontendClickEvent).getElementSource()).toEqual(ClickElemConstants.SOURCE.WIDGET);
        expect( (protoBuff as ExploreFrontendClickEvent).getContextPath()).toEqual(ClickElemConstants.CONTEXT_PATH.WIDGET_RIGHT_CLICK);
    });

    it('should log TelemetryClickEventTracker with Map', () => {
        const addlInfoMap = new Map();
        addlInfoMap.set('key1', 'value1');
        const parameters = new ClickEventParameters(ExploreClickableElementType.MENU, 'Expand All', ClickElemConstants.SOURCE.WIDGET, ClickElemConstants.CONTEXT_PATH.WIDGET_RIGHT_CLICK, null, addlInfoMap);
        const protoBuff = telemetryClickEventTracker.generateProtoBuff(parameters);
        expect(protoBuff instanceof ExploreFrontendClickEvent).toBe(true);
        expect((protoBuff as ExploreFrontendClickEvent).getElementType()).toEqual(ExploreClickableElementType.MENU);
        expect((protoBuff as ExploreFrontendClickEvent).getElementLabel()).toEqual('Expand All');
        expect((protoBuff as ExploreFrontendClickEvent).getElementSource()).toEqual(ClickElemConstants.SOURCE.WIDGET);
        expect( (protoBuff as ExploreFrontendClickEvent).getContextPath()).toEqual(ClickElemConstants.CONTEXT_PATH.WIDGET_RIGHT_CLICK);
        expect( (protoBuff as ExploreFrontendClickEvent).getAdditionalDetailsMap().get('key1')).toEqual('value1');
    });
});
