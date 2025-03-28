import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {ClickEventParameters, CoreWidgetConfigStore, ExploreClickableElementType, TelemetryService, WidgetConfigType, WidgetConfig} from '@blk/explore-ui-core';
import {WidgetGalleryMoreComponent} from './widget-gallery-more.component';
import {of} from 'rxjs';
import {NotificationService} from '@services/notification';
import {MandateMappingService} from '@services/mandate/mandate-mapping.service';


describe('WidgetGalleryMoreComponent', () => {
    let component: WidgetGalleryMoreComponent;
    let fixture: ComponentFixture<WidgetGalleryMoreComponent>;

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
            declarations: [WidgetGalleryMoreComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: MandateMappingService, useValue: mandateMappingServiceStub},
            ]
        });

        fixture = TestBed.createComponent(WidgetGalleryMoreComponent);
        component = fixture.componentInstance;
    });

    describe('onInit Test', () => {
        beforeEach(() => {
            component.widgetMore = CoreWidgetConfigStore.getChartConfigForType(WidgetConfigType.BAR);
            component.ngOnInit();
            fixture.detectChanges();
        });

        it('should set isChartWidget variable in onInit', () => {
            expect(component.isChartWidget).toBe(true);
        });
    });

    it('should emit createWidget', () => {
        jest.spyOn(component.widgetMoreCreate, 'emit');
        const spyTelSvc = jest.spyOn(TelemetryService, 'track');
        component.widgetMore = CoreWidgetConfigStore.getChartConfigForType(WidgetConfigType.RISK_EXPOSURE);
        component.createWidget();

        expect(component.widgetMoreCreate.emit).toHaveBeenCalledWith(component.widgetMore.configType);
        expect(spyTelSvc).toHaveBeenCalledWith('CLICK ON UI ELEMENT',
            new ClickEventParameters(ExploreClickableElementType.BUTTON, 'Risk and Exposure',
                'REPORT TAB', 'PLUS WIDGET ADD WIDGET BUTTON CLICK'));
    });

    it('should emit moreViewOff', () => {
        jest.spyOn(component.closeMoreView, 'emit');
        component.moreViewOff(true);
        expect(component.closeMoreView.emit).toHaveBeenCalled();
    });

});
