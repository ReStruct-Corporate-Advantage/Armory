import {Injectable} from '@angular/core';
import {ClickElemConstants, ClickEventParameters, ExploreClickableElementType, TelemetryActionConstants, TelemetryService} from '@blk/explore-ui-core';

@Injectable({
    providedIn: 'root'
})
/**
 * Common service for Explore frontend Click events
 */
export class TelemetryClickService {

    /**
     * Push data to SnowFlake from 'Report Group' button click from multiple source
     */
    public reportGroupClick(label: string, elementSource: string) {
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_UI_ELEMENT, new ClickEventParameters(ExploreClickableElementType.BUTTON, label, elementSource, ClickElemConstants.CONTEXT_PATH.ADD_REPORT_GRP_BTN_CLICK));
    }

    /**
     * Push data to SnowFlake from 'Report Group Menu Bar' clicked on Side Bar menu
     */
    public reportGroupMenuBarClick(label: string) {
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_UI_ELEMENT, new ClickEventParameters(ExploreClickableElementType.MENU, label, ClickElemConstants.SOURCE.SIDE_BAR, ClickElemConstants.CONTEXT_PATH.REPORT_GRP_MENU_CLICK));
    }

    /**
     * Push data to SnowFlake from 'Portfolios Menu Bar' clicked on Side Bar menu
     */
    public sideBarPortfoliosMenuBarClick(label: string) {
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_UI_ELEMENT, new ClickEventParameters(ExploreClickableElementType.MENU, label, ClickElemConstants.SOURCE.SIDE_BAR, ClickElemConstants.CONTEXT_PATH.PORTFOLIOS_MENU_BAR));
    }

    /**
     * Push data to SnowFlake from 'Plus widget Icon' clicked on Report Bar tab
     */
    public reportBarTabPlusWidgetIconClick(label: string, contextPath: string) {
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_UI_ELEMENT, new ClickEventParameters(ExploreClickableElementType.BUTTON, label, ClickElemConstants.SOURCE.REPORT_TAB, contextPath));
    }
}
