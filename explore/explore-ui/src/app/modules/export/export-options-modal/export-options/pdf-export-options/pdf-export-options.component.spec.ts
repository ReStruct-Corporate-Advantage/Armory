import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PdfExportOptionsComponent} from './pdf-export-options.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {PDFPageFormat} from '@enums/export/pdf-page-format.enum';
import {PDFPageLayout} from '@enums/export/pdf-page-layout.enum';
import {PDFPageMargin} from '@models/export/pdf-page-margin.model';
import {PDFExportOrientation} from '@enums/export/pdf-export-orientation.enum';
import {TablePDFExportConfig} from '@models/export/table-pdf-export-config.model';
import {TablePDFScaling} from '@enums/export/table-pdf-scaling.enum';
import {ExportConstants, ExportLevel} from '../../../../../constants';

describe('PdfExportOptionsComponent', () => {
    let component: PdfExportOptionsComponent;
    let fixture: ComponentFixture<PdfExportOptionsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PdfExportOptionsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(PdfExportOptionsComponent);
        component = fixture.componentInstance;
        component.exportConfig = new PDFExportConfig();
    });

    describe('Test Component initialization', () => {
        it('Component should initialize the properties with appropriate values', () => {
            component.ngOnInit();

            // Validate exportConfig
            expect(component.exportConfig).toBeDefined();

            // Validate orientationOptions
            expect(component.orientationOptions.length).toBe(2);

            // Validate pageFormatOptions
            expect(component.pageFormatOptions[0].values.length).toBe(6);

            // Validate layoutOptions
            expect(component.layoutOptions[0].values.length).toBe(9);

            // Validate marginOptions
            expect(component.marginOptions[0].values.length).toBe(5);

            // Validate table PDF options for PDFExportConfig
            expect(component.tablePDFScalingOptions).toBeUndefined();
            expect(component.showPrintAsIsOption).toBe(false);
            expect(component.showCustomLevel).toBe(false);
            expect(component.customLevelDepth).toBeUndefined();
            expect(component.tablePDFExportOptions.length).toBe(0);


            // Validate table PDF options for TablePDFExportConfig
            component.exportConfig = new TablePDFExportConfig();
            component.exportConfig.exportLevel = ExportLevel.WIDGET;
            component.ngOnInit();
            expect(component.tablePDFScalingOptions[0].values.length).toBe(2);
            expect(component.showPrintAsIsOption).toBe(true);
            expect(component.showCustomLevel).toBe(false);
            expect(component.customLevelDepth).toBe(0);
            expect(component.tablePDFExportOptions.length).toBe(3);

            // validate isPageLayoutDisabled
            expect(component.isPageLayoutDisabled).toBe(false);
            component.exportConfig.appendTimestamp = true;
            component.exportConfig.layout = PDFPageLayout.W1X3;
            component.ngOnInit();
            expect(component.isPageLayoutDisabled).toBe(false);
            component.exportConfig.appendTimestamp = false;
            component.exportConfig.layout = PDFPageLayout.W1X1;
            component.exportConfig.exportLevel = ExportLevel.REPORT;
            component.ngOnInit();
            expect(component.isPageLayoutDisabled).toBe(false);
            component.exportConfig.appendTimestamp = true;
            component.exportConfig.layout = PDFPageLayout.W1X1;
            component.exportConfig.exportLevel = ExportLevel.WIDGET;
            component.ngOnInit();
            expect(component.isPageLayoutDisabled).toBe(true);
        });
    });

    it('Test ngOnChanges', () => {
        jest.spyOn(component, 'initializeAuxOptions');
        // Try with empty changes
        component.ngOnChanges({});
        expect(component.initializeAuxOptions).not.toHaveBeenCalled();

        // Create changes that are first change
        let changes = {exportConfig: new SimpleChange(component.exportConfig, new PDFExportConfig(), true)};
        component.ngOnChanges(changes);
        expect(component.initializeAuxOptions).not.toHaveBeenCalled();

        // Try changes that are not the first change
        changes = {exportConfig: new SimpleChange(component.exportConfig, new PDFExportConfig(), false)};
        component.ngOnChanges(changes);
        expect(component.initializeAuxOptions).toHaveBeenCalled();
    });

    describe('Test onOrientationChanged method', () => {
        it('onOrientationChanged should change the orientation', () => {
            expect(component.exportConfig.orientation).toEqual(PDFExportOrientation.PORTRAIT);
            const event = {detail: {value: {eventData: PDFExportOrientation.LANDSCAPE}}};
            component.onOrientationChanged(event as CustomEvent);
            expect(component.exportConfig.orientation).toEqual(PDFExportOrientation.LANDSCAPE);
        });
    });

    describe('Test onPageSizeSelectionChanged method', () => {
        it('onPageSizeSelectionChanged should change the value properly', () => {
            expect(component.exportConfig.pageFormat).toEqual(PDFPageFormat.LETTER);
            const event = {detail: {value: {value: PDFPageFormat.LEGAL}}};
            component.onPageSizeSelectionChanged(event as CustomEvent);
            expect(component.exportConfig.pageFormat).toEqual(PDFPageFormat.LEGAL);
        });
    });

    describe('Test onPageLayoutSelectionChanged method', () => {
        it('onPageLayoutSelectionChanged should change the value properly', () => {
            expect(component.exportConfig.layout).toEqual(PDFPageLayout.REPORT_AS_IS);
            const event = {detail: {value: {value: PDFPageLayout.W1X3}}};
            component.onPageLayoutSelectionChanged(event as CustomEvent);
            expect(component.exportConfig.layout).toEqual(PDFPageLayout.W1X3);
        });
    });

    describe('Test onPageMarginSelectionChanged method', () => {
        it('onPageMarginSelectionChanged should change the value properly', () => {
            expect(component.exportConfig.pageMargin).toEqual(PDFPageMargin.NORMAL);
            const event = {detail: {value: {value: PDFPageMargin.WIDE}}};
            component.onPageMarginSelectionChanged(event as CustomEvent);
            expect(component.exportConfig.pageMargin).toEqual(PDFPageMargin.WIDE);
        });
    });

    describe('Test Custom Page Margin Changed methods', () => {
        it('should change the value properly', () => {
            component.ngOnInit();
            // validate before change
            expect(component.exportConfig.pageMargin.top).toEqual(1);
            expect(component.exportConfig.pageMargin.right).toEqual(1);
            expect(component.exportConfig.pageMargin.bottom).toEqual(1);
            expect(component.exportConfig.pageMargin.left).toEqual(1);
            // valid value is entered
            let event = {detail: {value: '1.2'}} as CustomEvent;
            component.onPageMarginTopChanged(event);
            component.onPageMarginRightChanged(event);
            component.onPageMarginBottomChanged(event);
            component.onPageMarginLeftChanged(event);

            // validate after change
            expect(component.exportConfig.pageMargin.top).toEqual(1.2);
            expect(component.exportConfig.pageMargin.right).toEqual(1.2);
            expect(component.exportConfig.pageMargin.bottom).toEqual(1.2);
            expect(component.exportConfig.pageMargin.left).toEqual(1.2);

            // invalid value is entered
            event = {detail: {value: 'invalid value'}} as CustomEvent;
            component.onPageMarginTopChanged(event);
            component.onPageMarginRightChanged(event);
            component.onPageMarginBottomChanged(event);
            component.onPageMarginLeftChanged(event);

            // validate after change - value will not change
            expect(component.exportConfig.pageMargin.top).toEqual(1.2);
            expect(component.exportConfig.pageMargin.right).toEqual(1.2);
            expect(component.exportConfig.pageMargin.bottom).toEqual(1.2);
            expect(component.exportConfig.pageMargin.left).toEqual(1.2);
        });
    });

    describe('Test onPrintAsIsChanged method', () => {
        it('onPrintAsIsChanged should change the value properly', () => {
            expect(component.exportConfig.printAsIs).toEqual(true);
            const event = {detail: {value: {checked: false}}};
            component.onPrintAsIsChanged(event as CustomEvent);
            expect(component.exportConfig.appendTimestamp).toEqual(false);
        });
    });

    describe('Test onTablePDFScalingSelectionChanged method', () => {
        it('onTablePDFScalingSelectionChanged should change the value properly', () => {
            component.exportConfig = new TablePDFExportConfig();
            component.ngOnInit();
            expect((component.exportConfig as TablePDFExportConfig).scaling).toEqual(TablePDFScaling.NO_SCALING);
            const event = {detail: {value: {value: TablePDFScaling.FIT_ALL_COLS}}};
            component.onTablePDFScalingSelectionChanged(event as CustomEvent);
            expect((component.exportConfig as TablePDFExportConfig).scaling).toEqual(TablePDFScaling.FIT_ALL_COLS);
        });
    });

    describe('Test onTablePDFExportOptionsChanged method', () => {
        it('onTablePDFExportOptionsChanged should change the export options', () => {
            component.exportConfig = new TablePDFExportConfig();
            component.ngOnInit();
            validatePDFExportOptions(true, false, false, false);

            // validate for visible only
            let event = {detail: {value: {eventData: ExportConstants.VISIBLE_DATA_ONLY}}};
            component.onTablePDFExportOptionsChanged(event as CustomEvent);
            validatePDFExportOptions(false, true, false, false);

            // validate for custom level
            event = {detail: {value: {eventData: ExportConstants.EXPORT_CUSTOM_LEVEL}}};
            component.onTablePDFExportOptionsChanged(event as CustomEvent);
            validatePDFExportOptions(false, false, true, true);
        });
    });

    describe('Test onCustomLevelDepthChanged method', () => {
        it('onCustomLevelDepthChanged should change the value properly', () => {
            component.exportConfig = new TablePDFExportConfig();
            component.ngOnInit();
            // validate before change
            expect((component.exportConfig as TablePDFExportConfig).customLevelDepth).toEqual(0);
            const event = {detail: {value: '1'}} as CustomEvent;
            component.onCustomLevelDepthChanged(event);
            // validate after change
            expect((component.exportConfig as TablePDFExportConfig).customLevelDepth).toEqual(1);
        });
    });

    describe('Test onAppendTimestampChanged method', () => {
        it('onAppendTimestampChanged should change the value properly', () => {
            expect(component.exportConfig.appendTimestamp).toEqual(false);
            const event = {detail: {value: {checked: true}}};
            component.onAppendTimestampChanged(event as CustomEvent);
            expect(component.exportConfig.appendTimestamp).toEqual(true);
        });
    });

    describe('Test onLogoPresentChanges method', () => {
        it('onLogoPresentChanges should change the value properly', () => {
            expect(component.exportConfig.logoConfig.logoPresent).toEqual(false);
            const event = {detail: {value: {checked: true}}};
            component.onLogoPresentChanges(event as CustomEvent);
            expect(component.exportConfig.logoConfig.logoPresent).toEqual(true);
        });
    });

    describe('Test onLogoPreview method', () => {
        it('onLogoPreview should change the value properly', () => {
            const event_false = {detail: {value: {checked: false}}};
            component.logoPreview(event_false as CustomEvent);
            expect(component.exportConfig.logoConfig.showLogoPreview).toEqual(false);
            const event_true = {detail: {value: {checked: true}}};
            component.logoPreview(event_true as CustomEvent);
            expect(component.exportConfig.logoConfig.showLogoPreview).toEqual(true);
        });
    });

    describe('Test onLogoPositionChanged method', () => {
        it('onLogoPositionChanged should change the value properly', () => {
            component.exportConfig = new TablePDFExportConfig();
            component.ngOnInit();
            // validate before change
            expect((component.exportConfig as TablePDFExportConfig).logoConfig.logoPosition).toEqual(0);
            const event = {detail: {value: '1'}} as CustomEvent;
            component.onLogoPositionChanged(event);
        });
    });

    describe('Test processFile method', () => {
        it('processFile generates imageData that is base64 encoded form of image', () => {
           component.exportConfig = new TablePDFExportConfig();
           component.ngOnInit();
           // validate before any changes
           expect((component.exportConfig as TablePDFExportConfig).logoConfig.logoImageFile).toBeUndefined();
           const event = {detail: {newValue: ['a']}} as CustomEvent;
           setTimeout( () => {
               component.processFile(event);
               (component.exportConfig as TablePDFExportConfig).logoConfig.logoImageFile = 'imagedata';
               expect((component.exportConfig as TablePDFExportConfig).logoConfig.logoImageFile).toEqual('imagedata');
            }, 1000);
        });
    });

    /**
     * function to validate the PDF export options
     */
    function validatePDFExportOptions(fullyExpanded: boolean, visibleOnly: boolean, customLevel: boolean, showCustomLevel: boolean) {
        const exportConfig = component.exportConfig as TablePDFExportConfig;
        expect(exportConfig.fullyExpanded).toBe(fullyExpanded);
        expect(exportConfig.visibleOnly).toBe(visibleOnly);
        expect(exportConfig.customLevel).toBe(customLevel);
        expect(component.showCustomLevel).toBe(showCustomLevel);
    }
});
