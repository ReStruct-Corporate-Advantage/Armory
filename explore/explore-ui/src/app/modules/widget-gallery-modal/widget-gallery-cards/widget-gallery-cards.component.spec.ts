import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {ClickEventParameters, CoreWidgetConfigStore, ExploreClickableElementType, TelemetryService, WidgetConfig, WidgetConfigType} from '@blk/explore-ui-core';
import {WidgetGalleryCardsComponent} from './widget-gallery-cards.component';
import {of} from 'rxjs';
import {NotificationService} from '@services/notification';
import {MandateMappingService} from '@services/mandate/mandate-mapping.service';


describe('WidgetGalleryCardsComponent', () => {
    let component: WidgetGalleryCardsComponent;
    let fixture: ComponentFixture<WidgetGalleryCardsComponent>;

    const notificationServiceStub = {
        success: jest.fn()
    };

    const mandateMappingServiceStub = {
        setWidgetDefaultsAsPerMandate: jest.fn(() => [of()])
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WidgetGalleryCardsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: MandateMappingService, useValue: mandateMappingServiceStub},
            ]
        });

        fixture = TestBed.createComponent(WidgetGalleryCardsComponent);
        component = fixture.componentInstance;
    });

    it('should emit createWidget', () => {
        jest.spyOn(component.widgetCreate, 'emit');

        const widget = new WidgetConfig(WidgetConfigType.RISK_EXPOSURE);
        component.createWidget(widget);
        expect(component.widgetCreate.emit).toHaveBeenCalledWith(widget.configType);
        expect(component.showErrorToast).toBeFalsy();
    });

    it('should emit moreViewOn', () => {
        jest.spyOn(component.openMoreView, 'emit');
        const spyTelSvc = jest.spyOn(TelemetryService, 'track');
        const widget = CoreWidgetConfigStore.getChartConfigForType(WidgetConfigType.RISK_EXPOSURE);
        component.moreViewOn(widget);
        expect(component.openMoreView.emit).toHaveBeenCalledWith(widget);
        expect(spyTelSvc).toHaveBeenCalledWith('CLICK ON UI ELEMENT',
            new ClickEventParameters(ExploreClickableElementType.BUTTON, 'Risk and Exposure',
                'REPORT TAB', 'PLUS WIDGET MORE LINK CLICK'));
    });

    describe('chartWidget Check Tests', () => {
        it('should return false on table widget types', () => {
            const widget = CoreWidgetConfigStore.getChartConfigForType(WidgetConfigType.RISK_EXPOSURE);
            expect(component.chartWidget(widget)).toBe(false);
        });
        it('should return true on chart widget types', () => {
            const widget = CoreWidgetConfigStore.getChartConfigForType(WidgetConfigType.BAR);
            expect(component.chartWidget(widget)).toBe(true);
        });
    });

});
