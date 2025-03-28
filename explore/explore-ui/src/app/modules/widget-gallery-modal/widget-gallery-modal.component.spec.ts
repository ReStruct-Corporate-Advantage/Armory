import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {WorkspaceStore} from '../../stores';
import {WidgetGalleryModalComponent} from './widget-gallery-modal.component';
import {NotificationService} from '@services/notification';
import {TestUtils} from '@utils/test.utils';
import {MandateMappingService} from '@services/mandate/mandate-mapping.service';
import {WidgetConfigFactory} from '../../factories';
import {Report} from '@models/workspace/report.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {WidgetUtils} from '@utils/widget.utils';
import {
    ClickEventParameters,
    ExploreClickableElementType,
    ExploreSelectOption,
    TelemetryService,
    WidgetConfig,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {
    AuxSegmentedControlSelectionChangedDetailInterface,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {WidgetGalleryConstants} from '@constants/widget-gallery.constants';


describe('WidgetGalleryModalComponent', () => {
    let component: WidgetGalleryModalComponent;
    let fixture: ComponentFixture<WidgetGalleryModalComponent>;

    let mockPretextElement: HTMLDivElement;

    const notificationServiceStub = {
        success: jest.fn()
    };

    const mandateMappingServiceStub = {
        setWidgetDefaultsAsPerMandate: jest.fn().mockReturnValue([of({})])
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WidgetGalleryModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: MandateMappingService, useValue: mandateMappingServiceStub},
            ]
        });

        fixture = TestBed.createComponent(WidgetGalleryModalComponent);
        component = fixture.componentInstance;

        mockPretextElement = document.createElement('div');
        mockPretextElement.scrollIntoView = jest.fn();
    });

    describe('onInit Test', () => {
        beforeEach(() => {
            component.ngOnInit();
            fixture.detectChanges();
            jest.spyOn(component, 'sortTabWidgets');
        });

        it('should set variables onInit', () => {
            expect(component.tableWidgets).toBe(WidgetConfigFactory.tableWidgets);
            expect(component.chartWidgets).toBe(WidgetConfigFactory.chartWidgets);
            const allWidgetsTest = WidgetConfigFactory.tableWidgets.concat(WidgetConfigFactory.chartWidgets);
            component.sortPopular(allWidgetsTest);
            expect(component.allWidgets).toEqual(allWidgetsTest);
        });
    });

    describe('createWidget Test', () => {
        it('should create widget in currentReport', fakeAsync(() => {
            jest.spyOn(WorkspaceStore, 'getCurrentReport').mockReturnValue(new Report());
            jest.spyOn(WorkspaceStore, 'getCurrentPortfolio').mockReturnValue(new WhatIfPortfolio());
            const spyFn = jest.spyOn(WidgetUtils, 'addDefaultReturnsColumn');
            const spyTelSvc = jest.spyOn(TelemetryService, 'track');
            component.widgetAddedFromMoreView = true;
            component.createWidget(WidgetConfigType.RISK_EXPOSURE);
            expect(spyTelSvc).toHaveBeenCalledWith('CLICK ON UI ELEMENT',
                new ClickEventParameters(ExploreClickableElementType.BUTTON, 'Risk and Exposure',
                    'REPORT TAB', 'PLUS WIDGET PLUS ICON CLICK'));
            expect(WorkspaceStore.getCurrentReport().widgets.length).toEqual(1);
            expect(WorkspaceStore.getCurrentReport().availableDataStores.size).toEqual(1);
            expect(spyFn).not.toHaveBeenCalled();
            expect(mandateMappingServiceStub.setWidgetDefaultsAsPerMandate).toHaveBeenCalled();
            expect(notificationServiceStub.success).toHaveBeenCalled();
        }));

        it('should create returns widget in currentReport', fakeAsync(() => {
            jest.spyOn(WorkspaceStore, 'getCurrentReport').mockReturnValue(new Report());
            jest.spyOn(WorkspaceStore, 'getCurrentPortfolio').mockReturnValue(new WhatIfPortfolio());
            const spyFn = jest.spyOn(WidgetUtils, 'addDefaultReturnsColumn').mockImplementationOnce(_a => {
            });
            component.createWidget(WidgetConfigType.RETURNS);
            expect(WorkspaceStore.getCurrentReport().widgets.length).toEqual(1);
            expect(WorkspaceStore.getCurrentReport().availableDataStores.size).toEqual(1);
            expect(spyFn).toHaveBeenCalled();
            expect(mandateMappingServiceStub.setWidgetDefaultsAsPerMandate).toHaveBeenCalled();
        }));
    });

    describe('MoreView Tests', () => {
        it('should turn off GalleryView', () => {
            component.moreViewOn(new WidgetConfig(WidgetConfigType.RETURNS));
            expect(component.isGalleryView).toBe(false);
        });

        it('should turn on GalleryView', () => {
            component.moreViewOff(false);
            expect(component.isGalleryView).toBe(true);
            expect(component.widgetAddedFromMoreView).toBeFalsy();
        });

    });

    describe('OnTabSelected Tests', () => {
        it('Charts tab selected', () => {
            const tabEvent = new CustomEvent<AuxSegmentedControlSelectionChangedDetailInterface>('AuxSegmentedControlSelectionChangedDetailInterface',
                {
                    detail: {
                        index: 0,
                        srcEvent: undefined,
                        data: component.widgetTypeTabData[2],
                    },
                });
            component.onTabSelected(tabEvent, mockPretextElement);
            expect(component.activeTabUID).toBe(WidgetGalleryConstants.CHARTS_TAB);
        });
        it('Tables tab selected', () => {
            const tabEvent = new CustomEvent<AuxSegmentedControlSelectionChangedDetailInterface>('AuxSegmentedControlSelectionChangedDetailInterface',
                {
                    detail: {
                        index: 0,
                        srcEvent: undefined,
                        data: component.widgetTypeTabData[1],
                    },
                });
            component.onTabSelected(tabEvent, mockPretextElement);
            expect(component.activeTabUID).toBe(WidgetGalleryConstants.TABLES_TAB);
        });
    });

    describe('OnSortingSelected Tests', () => {
        it('Popularity selected', () => {
            const tabEvent = new CustomEvent<AuxSelectSelectionChangedDetailInterface>('AuxSelectSelectionChangedDetailInterface',
                {
                    detail: {
                        srcEvent: undefined,
                        value: new ExploreSelectOption('Popularity', 'Popularity', true)
                    },
                });
            component.onSortingSelection(tabEvent, mockPretextElement);
            expect(component.sortingSelected).toBe('Popularity');
        });
        it('Alphabetical selected', () => {
            const tabEvent = new CustomEvent<AuxSelectSelectionChangedDetailInterface>('AuxSelectSelectionChangedDetailInterface',
                {
                    detail: {
                        srcEvent: undefined,
                        value: new ExploreSelectOption('Alphabetical (A-Z)', 'Alphabetical (A-Z)', true)
                    },
                });
            component.onSortingSelection(tabEvent, mockPretextElement);
            expect(component.sortingSelected).toBe('Alphabetical (A-Z)');
        });
    });

});
