import {TestBed} from '@angular/core/testing';
import {TelemetryClickService} from '@services/telemetry/telemetry-click.service';
import {ClickElemConstants, ClickEventParameters, ExploreClickableElementType, TelemetryActionConstants, TelemetryService} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import spyOn = jest.spyOn;

describe('TelemetryClickService', () => {
    let service: TelemetryClickService;
    beforeEach(() => {
        service = TestBed.inject(TelemetryClickService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('test reportGroupClick', () => {
        const spy = spyOn(TelemetryService, 'track');
        service.reportGroupClick(CommonConstants.BUTTON_TEXT.REPORT_GROUP, ClickElemConstants.SOURCE.ADD_PORTFOLIO_MODAL);
        expect(spy).toHaveBeenCalledWith(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_UI_ELEMENT,
            new ClickEventParameters(ExploreClickableElementType.BUTTON, CommonConstants.BUTTON_TEXT.REPORT_GROUP,
                ClickElemConstants.SOURCE.ADD_PORTFOLIO_MODAL, ClickElemConstants.CONTEXT_PATH.ADD_REPORT_GRP_BTN_CLICK));
    });

    it('test reportGroupMenuBarClick', () => {
        const spy = spyOn(TelemetryService, 'track');
        service.reportGroupMenuBarClick('Rename');
        expect(spy).toHaveBeenCalledWith(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_UI_ELEMENT,
            new ClickEventParameters(ExploreClickableElementType.MENU, 'Rename',
                ClickElemConstants.SOURCE.SIDE_BAR, ClickElemConstants.CONTEXT_PATH.REPORT_GRP_MENU_CLICK));
    });

    it('test sideBarPortfoliosMenuBarClick', () => {
        const spy = spyOn(TelemetryService, 'track');
        service.sideBarPortfoliosMenuBarClick('Add What-if Portfolio');
        expect(spy).toHaveBeenCalledWith(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_UI_ELEMENT,
            new ClickEventParameters(ExploreClickableElementType.MENU, 'Add What-if Portfolio',
                'SIDE BAR', 'PORTFOLIOS MENU BAR CLICK'));
    });

    it('test reportBarTabPlusWidgetIconClick', () => {
        const spy = spyOn(TelemetryService, 'track');
        service.reportBarTabPlusWidgetIconClick('Risk and exposure', 'PLUS WIDGET PLUS ICON CLICK');
        expect(spy).toHaveBeenCalledWith('CLICK ON UI ELEMENT',
            new ClickEventParameters(ExploreClickableElementType.BUTTON, 'Risk and exposure',
                'REPORT TAB', 'PLUS WIDGET PLUS ICON CLICK'));
    });
});
