import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ExportOptionsModalComponent} from './export-options-modal.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {Http2BmsService} from '@services/bms';
import {HttpClient} from '@angular/common/http';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {WidgetServiceRegistry} from '@services/widget/widget-service-registry';
import {ExportService} from '@services/export/export.service';
import {Report} from '@models/workspace/report.model';
import {BatchExportingStore, UserMetaDataStore, WorkspaceStore} from '../../../stores';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {TablePDFExportConfig} from '@models/export/table-pdf-export-config.model';
import {WorkpadExportComposite} from '@models/export/export-composite/workpad-export-composite.model';
import {WorkpadExcelExportConfig} from '@models/export/workpad-excel-export-config.model';
import {Widget} from '@models/widget/widget.model';
import {ExportLevel} from '@constants/export.constants';
import {PDFPageFormat} from '@enums/export/pdf-page-format.enum';
import {PDFPageLayout} from '@enums/export/pdf-page-layout.enum';
import {TestUtils} from '@utils/test.utils';
import {ExcelExportOutlineStyle} from '@enums/export/excel-export-outline-style.enum';
import {BatchContainerStatus} from '@enums/batch-reporting/batch-container-status.enum';
import {CoreUserMetaDataStore, ExportType, UserMetaData, WidgetConfigType} from '@blk/explore-ui-core';
import {WorkspaceExportComposite} from '@models/export/export-composite/workspace-export-composite.model';
import {TelemetryExportPDFRequestParameters} from '@blk/explore-ui-core';
import {TelemetryExportExcelRequestParameters} from '@blk/explore-ui-core';

describe('ExportOptionsModalComponent', () => {
    let component: ExportOptionsModalComponent;
    let fixture: ComponentFixture<ExportOptionsModalComponent>;

    beforeEach(() => {
        const report: Report = new Report();
        jest.spyOn(WorkspaceStore, 'getCurrentReport').mockReturnValue(report);


        const httpGetMockFn = jest.fn();
        const httpPostMockFn = jest.fn();

        const httpMock = {
            get: httpGetMockFn,
            post: httpPostMockFn
        };

        const riskAndExposureServiceMock = {
            extractDataAndStore: jest.fn(),
            getWidgetConfigTypes: jest.fn(() => [WidgetConfigType.RISK_EXPOSURE])
        };

        const exportServiceMock = {
            exportFile: jest.fn(() => new Observable(subscriber => {
                subscriber.next(true);
            })),
            exportPDF: jest.fn(),
            processPDF: jest.fn(),
            exportWorkpadToExcel: jest.fn(() => new Observable(subscriber => {
                subscriber.next(true);
            }))
        };

        TestBed.configureTestingModule({
            declarations: [ExportOptionsModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                Http2BmsService,
                {provide: HttpClient, useValue: httpMock},
                {
                    provide: AbstractWidgetService, useValue: riskAndExposureServiceMock,
                    deps: [Http2BmsService],
                    multi: true
                },
                {
                    provide: ExportService, useValue: exportServiceMock
                },
                {
                    provide: WidgetServiceRegistry, useClass: WidgetServiceRegistry
                }
            ]
        });

        fixture = TestBed.createComponent(ExportOptionsModalComponent);
        component = fixture.componentInstance;
        component.isOpen = true;

        const exportComposite = new ExportComposite();
        exportComposite.exportConfig = new PDFExportConfig();
        component.exportComposite = exportComposite;
        BatchExportingStore.batchContainerStatus$ = new BehaviorSubject<BatchContainerStatus>(BatchContainerStatus.PRELOAD);
    });

    beforeAll((done) => {
        WorkspaceStore.init();
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
        CoreUserMetaDataStore.userMetaData.launchApps = ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW'];
        CoreUserMetaDataStore.userMetaData.login = 'ktalwar';
        CoreUserMetaDataStore.userMetaData.globalFavPerms = true;
        CoreUserMetaDataStore.userMetaData.perfDataPerms = true;
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;
        TestUtils.initialize(done);
    });

    describe('Test Component creation', () => {
        it('should create component', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('ngOnInit Test', () => {
        it('should update the html template', () => {
            component.ngOnInit();
            expect(fixture.debugElement.nativeElement.querySelector('aux-modal')).toMatchSnapshot();
        });

        it('should set the modal header', () => {
            expect(component.exportHeader).toBe('Export Options');
            component.ngOnInit();

            expect(component.exportHeader).toBe('PDF Export Options');
        });
    });

    describe('closeModal Test', () => {
        it('should close modal on cancel button clicked', () => {
            jest.spyOn(component.modalClosed, 'emit');
            component.closeModal();

            expect(component.isOpen).toBeFalsy();
            expect(component.modalClosed.emit).toHaveBeenCalled();
        });

        describe('should close modal and emit config on ok button clicked', () => {
            it('Test with ExcelExportConfig', () => {
                jest.spyOn(component.modalClosed, 'emit');
                component.exportComposite = new ExportComposite();
                component.exportComposite.exportConfig = new ExcelExportConfig();
                jest.spyOn(component['exportService'], 'exportFile').mockReturnValue(new Observable());
                jest.spyOn(UserMetaDataStore, 'setPreferenceValue');

                component.closeModal(true);
                expect(component['exportService'].exportFile).toHaveBeenCalled();
                expect(component.isOpen).toBeFalsy();
                expect(component.modalClosed.emit).toHaveBeenCalled();
                expect(UserMetaDataStore.setPreferenceValue).toHaveBeenCalled();
            });

            it('Test with PDFExportConfig', () => {
                component.exportComposite = new ExportComposite();
                component.exportComposite.exportConfig = new PDFExportConfig();
                jest.spyOn(UserMetaDataStore, 'setPreferenceValue');

                component.closeModal(true);
                expect(component['exportService'].processPDF).toHaveBeenCalled();
                expect(UserMetaDataStore.setPreferenceValue).toHaveBeenCalled();
                expect(component.isOpen).toBeFalsy();
            });

            it('Test with TablePDFExportConfig - with printAsIn option set as true', () => {
                component.exportComposite = new ExportComposite();
                component.exportComposite.exportConfig = new TablePDFExportConfig();
                (component.exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoImageFile = 'imagedata';

                jest.spyOn(component['exportService'], 'exportFile').mockReturnValue(new Observable());
                jest.spyOn(component['exportService'], 'processPDF');

                component.closeModal(true);
                expect(component['exportService'].exportFile).not.toHaveBeenCalled();
                expect(component['exportService'].processPDF).toHaveBeenCalled();
                expect(component.isOpen).toBeFalsy();
            });

            it('Test with TablePDFExportConfig - with printAsIn option set as false', () => {
                component.exportComposite = new ExportComposite();
                component.exportComposite.exportConfig = new TablePDFExportConfig();
                (component.exportComposite.exportConfig as TablePDFExportConfig).printAsIs = false;
                (component.exportComposite.exportConfig as TablePDFExportConfig).logoConfig.logoImageFile = 'imagedata';

                jest.spyOn(component['exportService'], 'exportFile').mockReturnValue(new Observable());

                component.closeModal(true);
                expect(component['exportService'].exportFile).toHaveBeenCalled();

                expect(component.isOpen).toBeFalsy();
            });

            it('Test with WorkpadExcelExportConfig', () => {
                component.exportComposite = new WorkpadExportComposite();
                component.exportComposite.exportConfig = new WorkpadExcelExportConfig();
                jest.spyOn(component['exportService'], 'exportWorkpadToExcel').mockReturnValue(new Observable());

                component.closeModal(true);
                expect(component['exportService'].exportWorkpadToExcel).toHaveBeenCalled();

                expect(component.isOpen).toBeFalsy();
            });

            it('Test for setting downloadInProgress falsy only if batch container status is idle', () => {
                BatchExportingStore.batchContainerStatus$ = new BehaviorSubject<BatchContainerStatus>(BatchContainerStatus.LOADING);
                component.closeModal(true);
                expect(component['exportService'].processPDF).toHaveBeenCalled();

                expect(component.downloadInProgress).toBeTruthy();
            });

            it('Test for creating notification when report group has pgs chart widgets', () => {
                BatchExportingStore.batchContainerStatus$ = new BehaviorSubject<BatchContainerStatus>(BatchContainerStatus.LOADING);
                const exportComposite = new WorkpadExportComposite();
                exportComposite.exportConfig = new PDFExportConfig();
                jest.spyOn(component['notificationService'], 'warning');
                exportComposite.workpad = {
                    activeReport: {
                        widgets: [
                            new Widget(WidgetConfigType.BAR),
                            new Widget(WidgetConfigType.PGS_BAR)
                        ]
                    }
                };
                component.exportComposite = exportComposite;
                component.closeModal(true);
                expect(component['notificationService'].warning).toHaveBeenCalled();
            });

            it('Test for call of update Exporting options method', () => {
                jest.spyOn(component['exportService'], 'exportFile').mockReturnValue(of(true));
                jest.spyOn(component, 'updateExportingStatus');
                component.exportComposite.exportConfig = new WorkpadExcelExportConfig();
                component.closeModal(true);
                expect(component.updateExportingStatus).toHaveBeenCalled();
            });

            it('Test for call of update Exporting options for report group excel method', () => {
                jest.spyOn(component, 'updateExportingStatus');
                jest.spyOn(component['exportService'], 'exportWorkpadToExcel').mockReturnValue(of(true));
                component.exportComposite = new WorkpadExportComposite();
                component.exportComposite.exportConfig = new WorkpadExcelExportConfig();
                component.closeModal(true);
                expect(component.updateExportingStatus).toHaveBeenCalled();
            });
        });
    });

    describe('user default excel/pdf settings test', () => {

        it('should call initialize excel export config from default values', () => {
            component.exportComposite = new ExportComposite();
            component.exportComposite.exportConfig = new ExcelExportConfig();
            jest.spyOn(component, 'initializeExcelExportConfigFromDefaultValues').mockReturnValue(new ExcelExportConfig());
            component.ngOnInit();
            expect(component.initializeExcelExportConfigFromDefaultValues).toHaveBeenCalled();

            component.exportComposite.exportConfig = new TablePDFExportConfig();
            jest.spyOn(component, 'initializePDFExportConfigFromDefaultValues').mockReturnValue(new TablePDFExportConfig());
            component.ngOnInit();
            expect(component.initializePDFExportConfigFromDefaultValues).toHaveBeenCalled();
        });

        it('initializePDFExportConfigFromDefaultValues test', () => {
            const defaultTableExportConfig = new TablePDFExportConfig();
            defaultTableExportConfig.pageFormat = PDFPageFormat.A4;
            const defaultPDFSettings = JSON.stringify(defaultTableExportConfig);
            const exportConfig = new PDFExportConfig();
            exportConfig.exportLevel = ExportLevel.WIDGET;
            let widget = new Widget(WidgetConfigType.BAR);

            let expectedConfig = component.initializePDFExportConfigFromDefaultValues(defaultPDFSettings, exportConfig, widget);
            expect(expectedConfig instanceof PDFExportConfig).toBeTruthy();
            expect(expectedConfig.printAsIs).toBeTruthy();
            expect(expectedConfig.layout).toBe(PDFPageLayout.W1X1);
            expect(expectedConfig.pageFormat).toBe(PDFPageFormat.A4);

            widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            expectedConfig = component.initializePDFExportConfigFromDefaultValues(defaultPDFSettings, exportConfig, widget);
            expect(expectedConfig instanceof TablePDFExportConfig).toBeTruthy();

            exportConfig.exportLevel = ExportLevel.REPORT;
            expectedConfig = component.initializePDFExportConfigFromDefaultValues(defaultPDFSettings, exportConfig, widget);
            expect(expectedConfig instanceof PDFExportConfig).toBeTruthy();

            // Test with null defaultSettings
            expectedConfig = component.initializePDFExportConfigFromDefaultValues(null, exportConfig, widget);
            expect(expectedConfig).toBe(exportConfig);
        });

        it('initializePDFExportConfigFromDefaultValues test for simple table', () => {
            const defaultTableExportConfig = new TablePDFExportConfig();
            defaultTableExportConfig.pageFormat = PDFPageFormat.A4;
            defaultTableExportConfig.fullyExpanded = true;
            defaultTableExportConfig.visibleOnly = true;
            defaultTableExportConfig.customLevel = true;
            const defaultPDFSettings = JSON.stringify(defaultTableExportConfig);
            const exportConfig = new PDFExportConfig();
            exportConfig.exportLevel = ExportLevel.GRID;

            const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            const expectedConfig = component.initializePDFExportConfigFromDefaultValues(defaultPDFSettings, exportConfig, widget);
            expect(expectedConfig instanceof TablePDFExportConfig).toBeTruthy();
            expect(expectedConfig.pageFormat).toBe(PDFPageFormat.A4);
            expect((expectedConfig as TablePDFExportConfig).visibleOnly).toBeFalsy();
            expect((expectedConfig as TablePDFExportConfig).customLevel).toBeFalsy();
        });

        it('initializeExcelExportConfigFromDefaultValues test', () => {
            const defaultExcelExportConfig = new ExcelExportConfig();
            defaultExcelExportConfig.outlineStyle = ExcelExportOutlineStyle.VERTICAL;
            const defaultExcelSettings = JSON.stringify(defaultExcelExportConfig);
            const exportConfig = new WorkpadExcelExportConfig();

            let expectedConfig = component.initializeExcelExportConfigFromDefaultValues(defaultExcelSettings, exportConfig);
            expect(expectedConfig instanceof WorkpadExcelExportConfig).toBeTruthy();
            expect(expectedConfig.outlineStyle).toBe(ExcelExportOutlineStyle.VERTICAL);

            const exportConfig2 = new ExcelExportConfig();
            expectedConfig = component.initializeExcelExportConfigFromDefaultValues(defaultExcelSettings, exportConfig2);
            expect(expectedConfig instanceof ExcelExportConfig).toBeTruthy();
            expect(expectedConfig.outlineStyle).toBe(ExcelExportOutlineStyle.VERTICAL);

            // Test with null defaultSettings
            expectedConfig = component.initializeExcelExportConfigFromDefaultValues(null, exportConfig2);
            expect(expectedConfig).toBe(exportConfig2);
        });

        it('initializeExcelExportConfigFromDefaultValues test for simple table', () => {
            const defaultExcelExportConfig = new ExcelExportConfig();
            defaultExcelExportConfig.outlineStyle = ExcelExportOutlineStyle.VERTICAL;
            defaultExcelExportConfig.fullyExpanded = true;
            defaultExcelExportConfig.visibleOnly = true;
            defaultExcelExportConfig.freezeColumnHeaders = true;
            defaultExcelExportConfig.exportToSingleSheet = true;
            defaultExcelExportConfig.isFilterFriendly = true;
            defaultExcelExportConfig.isGroupingEnabled = true;
            const defaultExcelSettings = JSON.stringify(defaultExcelExportConfig);

            const exportConfig = new ExcelExportConfig();
            exportConfig.exportLevel = ExportLevel.GRID;
            const expectedConfig = component.initializeExcelExportConfigFromDefaultValues(defaultExcelSettings, exportConfig);
            const newExcelConfig = new ExcelExportConfig();
            expect(expectedConfig instanceof ExcelExportConfig).toBeTruthy();
            expect(expectedConfig.outlineStyle).toBe(ExcelExportOutlineStyle.VERTICAL);
            expect(expectedConfig.fullyExpanded).toBe(newExcelConfig.fullyExpanded);
            expect(expectedConfig.visibleOnly).toBe(newExcelConfig.visibleOnly);
            expect(expectedConfig.freezeColumnHeaders).toBe(newExcelConfig.freezeColumnHeaders);
            expect(expectedConfig.exportToSingleSheet).toBe(newExcelConfig.exportToSingleSheet);
        });
    });

    describe('getExportLevelAndType test', () => {
        it('export level = Workspace and Type = Excel', () => {
            component.exportComposite = new WorkspaceExportComposite();
            component.exportComposite.exportConfig = new WorkpadExcelExportConfig();
            const res = component.getExportLevelAndType();
            expect(res.exportLevel).toBe(ExportLevel.WORKSPACE);
            expect(res.exportType).toBe(ExportType.EXPORT_TO_EXCEL);
        });
        it('export level = Workspace and Type = PDF', () => {
            component.exportComposite = new WorkspaceExportComposite();
            component.exportComposite.exportConfig = new PDFExportConfig();
            const res = component.getExportLevelAndType();
            expect(res.exportLevel).toBe(ExportLevel.WORKSPACE);
            expect(res.exportType).toBe(ExportType.EXPORT_TO_PDF);
        });
        it('export level = Report and Type = Excel', () => {
            component.exportComposite = new ExportComposite();
            component.exportComposite.exportConfig = new ExcelExportConfig();
            const res = component.getExportLevelAndType();
            expect(res.exportLevel).toBe(ExportLevel.REPORT);
            expect(res.exportType).toBe(ExportType.EXPORT_TO_EXCEL);
        });
        it('export level = Report and Type = PDF', () => {
            component.exportComposite = new ExportComposite();
            component.exportComposite.exportConfig = new PDFExportConfig();
            const res = component.getExportLevelAndType();
            expect(res.exportLevel).toBe(ExportLevel.REPORT);
            expect(res.exportType).toBe(ExportType.EXPORT_TO_PDF);
        });
        it('export level = Widget and Type = Excel', () => {
            component.exportComposite = new ExportComposite();
            component.exportComposite.exportConfig = new ExcelExportConfig();
            component.exportComposite.exportConfig.exportLevel = ExportLevel.WIDGET;
            const res = component.getExportLevelAndType();
            expect(res.exportLevel).toBe(ExportLevel.WIDGET);
            expect(res.exportType).toBe(ExportType.EXPORT_TO_EXCEL);
        });
        it('export level = Widget and Type = PDF', () => {
            component.exportComposite = new ExportComposite();
            component.exportComposite.exportConfig = new PDFExportConfig();
            component.exportComposite.exportConfig.exportLevel = ExportLevel.WIDGET;
            const res = component.getExportLevelAndType();
            expect(res.exportLevel).toBe(ExportLevel.WIDGET);
            expect(res.exportType).toBe(ExportType.EXPORT_TO_PDF);
        });
    });

    describe('ExportOptions test', () => {
        it('Pdf export options', () => {
            component.exportComposite = new ExportComposite();
            component.exportComposite.exportConfig = new PDFExportConfig();
            component.exportComposite.exportConfig.exportLevel = ExportLevel.WIDGET;

            const param = component.getPdfExportOptions(ExportLevel.WIDGET);
            expect(param).toBeInstanceOf(TelemetryExportPDFRequestParameters);
            expect(param.exportLevel).toBe('Widget');
            expect(param.orientation).toBe('Portrait');
        });
        it('Excel export options', () => {
            component.exportComposite = new ExportComposite();
            component.exportComposite.exportConfig = new ExcelExportConfig();
            component.exportComposite.exportConfig.exportLevel = ExportLevel.WIDGET;

            const param = component.getExcelExportOptions(ExportLevel.WIDGET);
            expect(param).toBeInstanceOf(TelemetryExportExcelRequestParameters);
            expect(param.exportLevel).toBe('Widget');
        });
        it('Excel export options with isFilterFriendly true', () => {
            component.exportComposite = new ExportComposite();
            component.exportComposite.exportConfig = new ExcelExportConfig();
            component.exportComposite.exportConfig.exportLevel = ExportLevel.WIDGET;
            (component.exportComposite.exportConfig as ExcelExportConfig).isFilterFriendly = true;

            const params = component.getExcelExportOptions(ExportLevel.WIDGET);
            expect(params).toBeInstanceOf(TelemetryExportExcelRequestParameters);
            expect(params.exportLevel).toBe('Widget');
        });
        it('Excel export options with isGroupingEnabled true', () => {
            component.exportComposite = new ExportComposite();
            component.exportComposite.exportConfig = new ExcelExportConfig();
            component.exportComposite.exportConfig.exportLevel = ExportLevel.REPORT;
            (component.exportComposite.exportConfig as ExcelExportConfig).isGroupingEnabled = true;

            const param = component.getExcelExportOptions(ExportLevel.WIDGET);
            expect(param).toBeInstanceOf(TelemetryExportExcelRequestParameters);
            expect(param.exportLevel).toBe('Widget');
        });
    });
});
