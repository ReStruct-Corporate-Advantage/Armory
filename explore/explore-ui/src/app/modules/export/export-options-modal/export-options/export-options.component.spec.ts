import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ExportOptionsComponent} from './export-options.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {PDFExportConfig} from '../../../../models/export/pdf-export-config.model';
import {ExcelExportConfig} from '../../../../models/export/excel-export-config.model';

describe('ExportOptionsComponent', () => {
    let component: ExportOptionsComponent;
    let fixture: ComponentFixture<ExportOptionsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExportOptionsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExportOptionsComponent);
        component = fixture.componentInstance;
        component.exportConfig = new PDFExportConfig();
    });

    describe('Test Component initialization with ngOnInit method', () => {
        it('Component should initialize the properties with appropriate values', async () => {
            component.ngOnInit();
            // Validate exportConfig
            expect(component.exportConfig).toEqual(new PDFExportConfig());
            // Validate isPDFExportConfig
            expect(component.isPDFExportConfig).toBe(true);

            // Checking for Excel Export Config
            component.exportConfig = new ExcelExportConfig();
            component.ngOnInit();
            // Validate exportConfig
            expect(component.exportConfig).toEqual(new ExcelExportConfig());
            // Validate isPDFExportConfig
            expect(component.isExcelExportConfig).toBe(true);

        });
    });

    it('Test ngOnChanges', () => {
        jest.spyOn(component, 'setExportConfigFlags');

        // Test empty changes
        const emptyChanges = {};
        component.ngOnChanges(emptyChanges);
        expect(component.setExportConfigFlags).not.toHaveBeenCalled();

        // Test change to the same export config type (PDF)
        const changesToPDF = {exportConfig: new SimpleChange(component.exportConfig, new PDFExportConfig(), true)};
        component.ngOnChanges(changesToPDF);
        expect(component.setExportConfigFlags).not.toHaveBeenCalled();

        // Test change to a different export config type (PDF -> Excel)
        const changesToExcel = {exportConfig: new SimpleChange(component.exportConfig, new ExcelExportConfig(), true)};
        component.ngOnChanges(changesToExcel);
        expect(component.setExportConfigFlags).toHaveBeenCalled();
    });
});
