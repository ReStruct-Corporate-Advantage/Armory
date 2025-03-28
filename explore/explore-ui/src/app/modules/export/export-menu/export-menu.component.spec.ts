import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ExportMenuComponent} from './export-menu.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {TestUtils} from '@utils/test.utils';
import {AppStore} from '../../../app.store';
import {BehaviorSubject, of} from 'rxjs';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {ExportConstants} from '@constants/export.constants';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {WorkspaceStore} from '../../../stores';
import {Report} from '@models/workspace/report.model';
import {FlatWorkpad} from '../../../models/workspace/flat-workpad.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ExportHubStore} from '@stores/export-hub.store';
import {Widget} from '@models/widget/widget.model';

import {
    ExportHubJob
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {ExportHubUtils} from '../../export-hub/utils/export-hub.utils';
import {AlertConstants, CommonUtils, CoreWidgetConfigStore, WidgetConfig} from '@blk/explore-ui-core';
import {ApiModelConversionService} from '@services/portfolio-analytics-api/api-model-conversion.service';
import {ApiRequestFactory} from '../../../factories/api-request.factory';
import {NotificationService} from '@services/notification';
import {AuxNotificationStyleEnum, AuxNotificationToastTypeEnum} from '@blk/aladdin-angular-components';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';

describe('ExportMenuComponent', () => {
    let component: ExportMenuComponent;
    let fixture: ComponentFixture<ExportMenuComponent>;

    const appStoreStub = {
        openExportOptionsModal$: new BehaviorSubject(null)
    };

    const exportHubStoreStub = {
        openScheduleJobModal: jest.fn()
    };

    const apiModelConversionServiceMock = {
        getGenerateApiRequestPayload: jest.fn(),
        convertExploreModelToApiModel$: jest.fn()
    };

    const notificationService = {
        error: jest.fn(),
        warning: jest.fn(),
        detailedMessage: jest.fn()
    };


    beforeAll((done) => {
        WorkspaceStore.init();
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExportMenuComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: AppStore, useValue: appStoreStub},
                {provide: ExportHubStore, useValue: exportHubStoreStub},
                {provide: NotificationService, useValue: notificationService},
                {provide: ApiModelConversionService, useValue: apiModelConversionServiceMock}
            ]
        });

        fixture = TestBed.createComponent(ExportMenuComponent);
        component = fixture.componentInstance;
        component.exportLevel = ExportConstants.EXPORT_PDF_REPORT;
    });


    describe('Export Menu Appearance Tests', () => {
        it('should default render as a link button', () => {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement.querySelector('aux-inline-menu')).toMatchSnapshot();
        });
    });

    describe('onExportClick Test', () => {
        it('should return false', () => {
            expect(component.onExportClick()).toBe(false);
        });
    });

    describe('onChanges Test', () => {
        it('should export to BLO if option is set to true', () => {
            component.shouldIncludeBLOOption = true;
            jest.spyOn(ExportHubUtils, 'isExportHubEnabled').mockReturnValue(false);

            component.ngOnInit();
            expect(component.EXPORT_OPTION[0].length).toBe(3);
        });

        it('should show Export Hub if user has access and feature is Enabled', () => {
            component.shouldIncludeBLOOption = true;
            jest.spyOn(ExportHubUtils, 'isExportHubEnabled').mockReturnValue(true);
            component.ngOnInit();
            expect(component.EXPORT_OPTION[0].length).toBe(4);
        });
    });

    describe('onMenuItemClicked Test', () => {
        it('should openExportModal with undefined', () => {
            jest.spyOn<any>(component, 'openExportModal');
            const event = {detail: {element: {label: ''}}};
            // @ts-ignore - to mock event since detail in CustomEvent is read-only property
            const exportComposite = new ExportComposite();
            exportComposite.exportConfig = new ExcelExportConfig();
            const report = new Report();
            exportComposite.report = report;
            WorkspaceStore.currentReport$.next(report);

            // @ts-ignore - to mock event since detail in CustomEvent is read-only property
            component.onMenuItemClicked(event);
            expect(component['openExportModal']).toHaveBeenCalledWith(exportComposite);
        });

        it('should openExportModal with PDFExportConfig', () => {
            WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());
            jest.spyOn<any>(component, 'openExportModal');
            component.exportLevel = ExportConstants.EXPORT_PDF_REPORT;
            const event = {detail: {element: {label: 'Export to PDF'}}};

            const exportComposite = new ExportComposite();
            exportComposite.chartingLib = undefined;
            exportComposite.widget = null;
            const report = new Report();
            exportComposite.report = report;
            WorkspaceStore.currentReport$.next(report);
            exportComposite.exportConfig = new PDFExportConfig();

            // @ts-ignore - to mock event since detail in CustomEvent is read-only property
            component.onMenuItemClicked(event);
            expect(component['openExportModal']).toHaveBeenCalledWith(exportComposite);
        });

        it('should schedule job export correctly', () => {
            const mockPortfolio = new Portfolio();
            mockPortfolio.portName = 'Test Portfolio';
            const mockWidget = new Widget();
            mockWidget.displayTitle = 'Test Widget';
            mockWidget.title = 'Widget Title';
            WorkspaceStore.currentPortfolio$.next(mockPortfolio);
            jest.spyOn(ExportHubUtils, 'encodeWidgetSettingsForScheduledJob').mockReturnValue('settings');
            const mockWidgetConfig = new WidgetConfig();
            mockWidgetConfig.title = 'Widget Title';
            jest.spyOn(CoreWidgetConfigStore, 'getChartConfigForType').mockReturnValue(mockWidgetConfig);
            component.scheduleJobExport([mockWidget]);

            const scheduledJob: ExportHubJob = exportHubStoreStub.openScheduleJobModal.mock.calls[0][0];
            expect(scheduledJob.getJobPortfoliosList().length).toBe(1);
            expect(scheduledJob.getJobPortfoliosList()[0].getJobPortfolioName()).toBe('Test Portfolio');
            expect(scheduledJob.getJobWidgetsList().length).toBe(1);
            expect(scheduledJob.getJobWidgetsList()[0].getTitle()).toBe('Test Widget');
            expect(scheduledJob.getJobWidgetsList()[0].getWidgetType()).toBe('Widget Title');
            jest.clearAllMocks();
        });

        it('should validate and schedule job export correctly', () => {
            const mockPortfolio = new Portfolio();
            mockPortfolio.portName = 'Test Portfolio';
            const mockWidget = new Widget();
            mockWidget.displayTitle = 'Test Widget';
            mockWidget.title = 'Widget Title';
            WorkspaceStore.currentPortfolio$.next(mockPortfolio);
            WorkspaceStore.currentReport$.next(new Report());
            WorkspaceStore.getCurrentReport().widgets = [mockWidget, mockWidget, mockWidget, mockWidget];
            jest.spyOn(ExportHubUtils, 'encodeWidgetSettingsForScheduledJob').mockReturnValue('settings');
            const mockWidgetConfig = new WidgetConfig();
            mockWidgetConfig.title = 'Widget Title';
            jest.spyOn(ApiRequestFactory, 'widgetHasApiRequestType')
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(true)
                .mockReturnValue(false);
            jest.spyOn(CoreWidgetConfigStore, 'getChartConfigForType').mockReturnValue(mockWidgetConfig);
            apiModelConversionServiceMock.convertExploreModelToApiModel$
                .mockReturnValueOnce(of({data: 'data'}))
                .mockReturnValueOnce(of({data: 'data'}))
                .mockReturnValue(of(new Error('error')));
            component.validateWidgetsAndAddToScheduledJob();
            const scheduledJob: ExportHubJob = exportHubStoreStub.openScheduleJobModal.mock.calls[0][0];
            expect(scheduledJob.getJobPortfoliosList().length).toBe(1);
            expect(scheduledJob.getJobPortfoliosList()[0].getJobPortfolioName()).toBe('Test Portfolio');
            expect(scheduledJob.getJobWidgetsList().length).toBe(2);
            expect(scheduledJob.getJobWidgetsList()[0].getTitle()).toBe('Test Widget');
            expect(scheduledJob.getJobWidgetsList()[0].getWidgetType()).toBe('Widget Title');
        });

        it('should validate with no widgets', () => {
            WorkspaceStore.currentReport$.next(new Report());
            WorkspaceStore.getCurrentReport().widgets = [];
            component.validateWidgetsAndAddToScheduledJob()
            expect(notificationService.error).toHaveBeenCalledTimes(1);
        });

        it('should export to BLO', () => {
            jest.spyOn<any, string>(component, 'exportBLO').mockImplementationOnce(() => {});
            const event = {detail: {element: {eventData: 'Export to Bulk Load Orders (BLO)'}}};

            // @ts-ignore - to mock event since detail in CustomEvent is read-only property
            component.onMenuItemClicked(event);
            expect(component['exportBLO']).toHaveBeenCalled();
        });

    });

    describe('openExportModal Test', () => {
        it('should trigger openExportOptionsModal$ to open Export modal', () => {
            jest.spyOn(component['appStore'].openExportOptionsModal$, 'next');
            const exportComposite = new ExportComposite();
            exportComposite.exportConfig = new PDFExportConfig();
            component['openExportModal'](exportComposite);
            expect(component['appStore'].openExportOptionsModal$.next).toHaveBeenCalledWith(exportComposite);
        });
    });

    describe('handleValidationErrors', () => {
        it('should show error for unsupported and invalid widgets when no valid widgets', () => {
            const validWidgets = [];
            const errorWidgetMessages: string[] = ['Invalid widget settings'];
            jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue('id');
            component['handleValidationErrors'](validWidgets, errorWidgetMessages);

            expect(notificationService.detailedMessage).toHaveBeenCalledWith({
                toastType: AuxNotificationToastTypeEnum.PERSISTENT,
                header: 'Error',
                id: 'id',
                message: errorWidgetMessages,
                notificationStyle: AuxNotificationStyleEnum.ERROR
            });
        });

        it('should show error message when all widgets are unsupported', () => {
            const validWidgets = [];
            const errorWidgetMessages: string[] = [];

            jest.spyOn(component as any, 'handleValidationErrors');

            // Mock the WorkspaceStore to return an empty array of widgets
            jest.spyOn(WorkspaceStore, 'getCurrentReport').mockReturnValue({ widgets: [{displayTitle: 'Widget 1'}, {displayTitle: 'Widget 2'}] });

            jest.spyOn(ApiRequestFactory, 'widgetHasApiRequestType').mockReturnValue(false);

            // Call the method
            component.validateWidgetsAndAddToScheduledJob();

            // Check if handleValidationErrors was called with the correct parameters
            expect(component['handleValidationErrors']).toHaveBeenCalledTimes(1);
        });

        it('should show warning for unsupported and invalid widgets when there are valid widgets', () => {
            const validWidgets = [new Widget()];
            const errorWidgetMessages: string[] = ['Invalid widget settings'];
            jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue('id');

            component['handleValidationErrors'](validWidgets, errorWidgetMessages);

            expect(notificationService.detailedMessage).toHaveBeenCalledWith({
                toastType: AuxNotificationToastTypeEnum.PERSISTENT,
                header: 'Warning',
                id: 'id',
                message: errorWidgetMessages,
                notificationStyle: AuxNotificationStyleEnum.WARNING
            });
        });

        it('should show error for unsupported widgets when no valid widgets', () => {
            const validWidgets = [];
            const errorWidgetMessages: string[] = [AlertConstants.NOTIFICATION.UNSUPPORTED_WIDGETS_FOR_EXPORT];

            component['handleValidationErrors'](validWidgets,  errorWidgetMessages);

            expect(notificationService.detailedMessage).toHaveBeenCalledWith({
                toastType: AuxNotificationToastTypeEnum.PERSISTENT,
                header: 'Error',
                id: expect.any(String),
                message: errorWidgetMessages,
                notificationStyle: AuxNotificationStyleEnum.ERROR
            });
        });

        it('should show warning for unsupported widgets when there are valid widgets', () => {
            const validWidgets = [new Widget()];
            const errorWidgetMessages: string[] = [AlertConstants.NOTIFICATION.UNSUPPORTED_WIDGETS_FOR_EXPORT];

            component['handleValidationErrors'](validWidgets, errorWidgetMessages);

            expect(notificationService.detailedMessage).toHaveBeenCalledWith({
                toastType: AuxNotificationToastTypeEnum.PERSISTENT,
                header: 'Warning',
                id: expect.any(String),
                message: errorWidgetMessages,
                notificationStyle: AuxNotificationStyleEnum.WARNING
            });
        });

        it('should show error for invalid widget settings when no valid widgets', () => {
            const validWidgets = [];
            const errorWidgetMessages: string[] = ['Invalid widget settings'];

            component['handleValidationErrors'](validWidgets, errorWidgetMessages);

            expect(notificationService.detailedMessage).toHaveBeenCalledWith({
                toastType: AuxNotificationToastTypeEnum.PERSISTENT,
                header: 'Error',
                id: expect.any(String),
                message: errorWidgetMessages,
                notificationStyle: AuxNotificationStyleEnum.ERROR
            });
        });

        it('should show warning for invalid widget settings when there are valid widgets', () => {
            const validWidgets = [{}];
            const errorWidgetMessages: string[] = ['Invalid widget settings'];

            component['handleValidationErrors'](validWidgets, errorWidgetMessages);

            expect(notificationService.detailedMessage).toHaveBeenCalledWith({
                toastType: AuxNotificationToastTypeEnum.PERSISTENT,
                header: 'Warning',
                id: expect.any(String),
                message: errorWidgetMessages,
                notificationStyle: AuxNotificationStyleEnum.WARNING
            });
        });

    });

    it('should return false and show error if portfolio is an instance of WhatIfPortfolio', () => {
        const portfolio = new WhatIfPortfolio();
        const result = component['arePortfolioAndBenchmarkValid'](portfolio);
        expect(result).toBe(false);
        expect(notificationService.error).toHaveBeenCalledWith('What-If portfolios and benchmarks are not supported for scheduled jobs');
    });

    it('should return false and show error if benchmark portfolio is an instance of WhatIfPortfolio', () => {
        const portfolio = new Portfolio();
        portfolio.benchmark = { portfolio: new WhatIfPortfolio() } as any;
        const result = component['arePortfolioAndBenchmarkValid'](portfolio);
        expect(result).toBe(false);
        expect(notificationService.error).toHaveBeenCalledWith('What-If portfolios and benchmarks are not supported for scheduled jobs');
    });

    it('should return true if portfolio and benchmark portfolio are valid', () => {
        const portfolio = new Portfolio();
        portfolio.benchmark = { portfolio: new Portfolio() } as any;
        const result = component['arePortfolioAndBenchmarkValid'](portfolio);
        expect(result).toBe(true);
    });


});
