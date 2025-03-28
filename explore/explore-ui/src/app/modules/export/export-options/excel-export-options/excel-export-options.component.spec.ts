import {ExcelExportOptionsComponent} from './excel-export-options.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {WorkpadExcelExportConfig} from '@models/export/workpad-excel-export-config.model';
import {ExportLevel} from '@constants/export.constants';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {WorkpadExportComposite} from '@models/export/export-composite/workpad-export-composite.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Workspace} from '@models/workspace/workspace.model';
import {WorkspaceExportComposite} from '@models/export/export-composite/workspace-export-composite.model';
import {ExportUtils} from '@utils/export/export.utils';
import {ExcelExportOutlineStyle} from '@enums/export/excel-export-outline-style.enum';

describe('ExcelExportOptionsComponent', () => {
    let component: ExcelExportOptionsComponent;
    let fixture: ComponentFixture<ExcelExportOptionsComponent>;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExcelExportOptionsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExcelExportOptionsComponent);
        component = fixture.componentInstance;
        component.exportConfig = new ExcelExportConfig();
    });

    it('check if component is initialized correctly', () => {
        const dummyParentWidget = new Widget();
        const dummyChildWidget = new Widget();
        dummyChildWidget.dataStore.parentDataStore = dummyParentWidget.dataStore;
        dummyChildWidget.dataStore.isDependentOnParentForData = true;
        component.exportComposite = new ExportComposite();
        component.exportComposite.report = new Report();
        component.exportComposite.report.widgets.push(dummyParentWidget, dummyChildWidget);
        component.ngOnInit();
        expect(component.sizeRadioOptions.length).toBe(2);
        expect(component.outlineStyleOptions.length).toBe(2);
        expect(component.breakdownDisplayOptions.length).toBe(3);
        const expectedSizeRadioOptions: AuxRadioInterface[] = [
            {
                label: 'All data, expanded',
                checked: true
            },
            {
                label: 'Currently visible data only',
                checked: false
            }
        ];
        const expectedOutlineStyleOptions: AuxRadioInterface[] = [
            {
                label: 'Horizontal',
                eventData: 1,
                checked: true,
                disabled: false
            },
            {
                label: 'Vertical',
                eventData: 2,
                checked: false,
                disabled: false
            },
        ];
        const expectedBreakdownDisplayOptions: AuxRadioInterface[] = [
            {
                label: 'Flat data with indentation',
                checked: true
            },
            {
                label: 'Flat data + column headers with filtering',
                checked: false
            },
            {
                label: 'Grouped data with expandable, nested rows',
                checked: false
            }
        ];
        expect(component.outlineStyleOptions).toStrictEqual(expectedOutlineStyleOptions);
        expect(component.sizeRadioOptions).toStrictEqual(expectedSizeRadioOptions);
        expect(component.breakdownDisplayOptions).toStrictEqual(expectedBreakdownDisplayOptions);
        expect(component.showWorkpadOptions).toBeFalsy();
        expect(component.isOutlineStyleChecked).toBeTruthy();
    });

    describe('Test onInit method', () => {
        it('onInit should set isWidgetLayoutOptionsDisabled to true if called from widget', () => {
            component.exportConfig.exportLevel = ExportLevel.WIDGET;
            const dummyParentWidget = new Widget();
            const dummyChildWidget = new Widget();
            dummyChildWidget.dataStore.parentDataStore = dummyParentWidget.dataStore;
            dummyChildWidget.dataStore.isDependentOnParentForData = true;
            component.exportComposite = new ExportComposite();
            component.exportComposite.report = new Report();
            component.exportComposite.report.widgets.push(dummyParentWidget, dummyChildWidget);
            component.ngOnInit();
            expect(component.isWidgetLayoutOptionsDisabled).toBeTruthy();
        });

        it('onInit should set showOnlyMiscellaneousOptions to true if export level is simple table', () => {
            component.exportConfig.exportLevel = ExportLevel.GRID;
            const dummyParentWidget = new Widget();
            const dummyChildWidget = new Widget();
            dummyChildWidget.dataStore.parentDataStore = dummyParentWidget.dataStore;
            dummyChildWidget.dataStore.isDependentOnParentForData = true;
            component.exportComposite = new ExportComposite();
            component.exportComposite.report = new Report();
            component.exportComposite.report.widgets.push(dummyParentWidget, dummyChildWidget);
            component.ngOnInit();
            expect(component.showOnlyMiscellaneousOptions).toBeTruthy();
        });
    });

    it('Test ngOnChanges', () => {
        jest.spyOn(component, 'initializeAuxOptions');
        // Try with empty changes
        component.ngOnChanges({});
        expect(component.initializeAuxOptions).not.toHaveBeenCalled();

        // Create changes that are first change
        let changes = {exportConfig: new SimpleChange(component.exportConfig, new ExcelExportConfig(), true)};
        component.ngOnChanges(changes);
        expect(component.initializeAuxOptions).not.toHaveBeenCalled();

        // Try changes that are not the first change
        changes = {exportConfig: new SimpleChange(component.exportConfig, new ExcelExportConfig(), false)};
        component.ngOnChanges(changes);
        expect(component.initializeAuxOptions).toHaveBeenCalled();
    });

    describe('Test shouldShowTimePeriodSheetName', () => {
        const returnsWidget = new Widget();
        returnsWidget.configType = WidgetConfigType.RETURNS;
        const exposureWidget = new Widget();
        exposureWidget.configType = WidgetConfigType.RISK_EXPOSURE;
        const report = new Report();
        const workpad = new ReportGroup();
        const workspace = new Workspace();

        it ('Test shouldShowTimePeriodSheetName with null', () => {
            component.exportComposite = null;
            expect(component.shouldShowTimePeriodSheetName()).toBeFalsy();
        });

        it ('Test shouldShowTimePeriodSheetName with a widget export', () => {
            component.exportComposite = new ExportComposite();
            component.exportComposite.widget = exposureWidget;
            expect(component.shouldShowTimePeriodSheetName()).toBeFalsy();

            component.exportComposite.widget = returnsWidget;
            expect(component.shouldShowTimePeriodSheetName()).toBeTruthy();
        });

        it ('Test shouldShowTimePeriodSheetName with a report export', () => {
            component.exportComposite = new ExportComposite();
            component.exportComposite.report = report;
            expect(component.shouldShowTimePeriodSheetName()).toBeFalsy();

            component.exportComposite.report.addWidget(exposureWidget);
            expect(component.shouldShowTimePeriodSheetName()).toBeFalsy();

            component.exportComposite.report.addWidget(returnsWidget);
            expect(component.shouldShowTimePeriodSheetName()).toBeTruthy();
        });

        it ('Test shouldShowTimePeriodSheetName with a report group export', () => {
            const workpadExportComposite = new WorkpadExportComposite();
            const reportNoReturns = new Report();
            const widget = new Widget();
            widget.configType = WidgetConfigType.RISK_EXPOSURE;
            reportNoReturns.addWidget(widget);
            workpad.addReports(reportNoReturns);
            workpadExportComposite.workpad = workpad;
            component.exportComposite = workpadExportComposite;
            expect(component.shouldShowTimePeriodSheetName()).toBeFalsy();

            workpadExportComposite.workpad.addReports(report);
            expect(component.shouldShowTimePeriodSheetName()).toBeTruthy();
        });

        it ('Test shouldShowTimePeriodSheetName with a workspace export', () => {
            const workspaceExportComposite = new WorkspaceExportComposite();
            const reportNoReturns = new Report();
            const widget = new Widget();
            widget.configType = WidgetConfigType.RISK_EXPOSURE;
            reportNoReturns.addWidget(widget);
            const reportGroup = new ReportGroup();
            reportGroup.addReports(reportNoReturns);
            workspace.addWorkpads(reportGroup);
            workspaceExportComposite.workspace = workspace;
            component.exportComposite = workspaceExportComposite;
            expect(component.shouldShowTimePeriodSheetName()).toBeFalsy();

            workspaceExportComposite.workspace.addWorkpads(workpad);
            expect(component.shouldShowTimePeriodSheetName()).toBeTruthy();
        });
    });

    describe('Test onSizeChanged method', () => {
        it('onSizeChanged should change the outline selector', () => {
            const event = {detail:{value: {label: 'Currently visible data only'}}};
            component.onSizeChanged(event as CustomEvent);
            expect(component.exportConfig.visibleOnly).toBeTruthy();
            expect(component.exportConfig.fullyExpanded).toBeFalsy();
        });
    });

    describe('Test oneWidgetRadioChanged method', () => {
        it('onWidgetRadioChanged should alter the isOneWidgetPerSheet and exportToSingleSheet variables', () => {
            component.isOneWidgetPerSheet = true;
            component.exportConfig.exportToSingleSheet = true;
            component.onOneWidgetRadioChanged();
            expect(component.isOneWidgetPerSheet).toBeFalsy();
            expect(component.exportConfig.exportToSingleSheet).toBeFalsy();
        });
    });

    describe('Test onBreakdownDisplayChanged method', () => {
        it('onBreakdownDisplayChanged should change the isGroupingEnabled and isFilterFriendly', () => {
            const event = {detail:{value: {label: 'Flat data + column headers with filtering'}}};
            component.onBreakdownDisplayChanged(event as CustomEvent);
            expect(component.exportConfig.isFilterFriendly).toBeTruthy();
            expect(component.exportConfig.isGroupingEnabled).toBeFalsy();
        });
    });

    describe('Test onOutlineCheckboxChanged method', () => {
        it('onOutlineCheckboxChanged should change the outline selector', () => {
            const event = {detail: {value: {checked: true}}};
            component.isOutlineStyleChecked = true;
            const mockOultineStyleOptions:AuxRadioInterface[] = [{label: 'Horizontal', eventData : ExcelExportOutlineStyle.HORIZONTAL, checked: true, disabled: false}];
            jest.spyOn(ExportUtils, 'populateExcelExportOutlineStyleOptions').mockReturnValue(mockOultineStyleOptions);
            component.onOutlineCheckboxChanged(event as CustomEvent);
            expect(component.isOutlineStyleChecked).toBeFalsy();
            expect(component.exportConfig.outlineStyle).toBe(1);

            const newEvent = {detail: {value: {checked: false}}};
            component.isOutlineStyleChecked = true;
            component.onOutlineCheckboxChanged(newEvent as CustomEvent);
            expect(component.isOutlineStyleChecked).toBeFalsy();
            expect(component.exportConfig.outlineStyle).toBe(0);
            expect(ExportUtils.populateExcelExportOutlineStyleOptions).toHaveBeenCalledTimes(2);
        });
    });

    describe('Test onOutlineStyleChanged method', () => {
        it('onOutlineStyleChanged should change the outline selector', () => {
            const event = {detail:{value: {eventData: 2}}};
            component.onOutlineStyleChanged(event as CustomEvent);
            expect(component.exportConfig.outlineStyle).toBe(2);
        });
    });

    describe('Test updateFreezeColumnsHeaders method', () => {
        it('updateFreezeColumnHeaders should change the freezeColumnHeaders', () => {
            const event = {detail: {value: {checked: true}}};
            component.updateFreezeColumnHeadersValue(event as CustomEvent);
            expect(component.exportConfig.freezeColumnHeaders).toBeTruthy();
        });
    });

    it('Test updateSuppressRowShading', () => {
        const event = {detail: {value: {checked: true}}};
        component.updateSuppressRowShading(event as CustomEvent);
        expect(component.exportConfig.suppressRowShading).toBeTruthy();
    });

    describe('Test updateUseMergedCellFooterValue method', () => {
        it('updateUseMergedCellFooterValue should change the useMergedCellFooter', () => {
            const event = {detail: {value: {checked: true}}};
            component.updateUseMergedCellFooterValue(event as CustomEvent);
            expect(component.exportConfig.useMergedCellFooter).toBeTruthy();
        });
    });

    describe('Test updateOneWorkbookperWorkpad method', () => {
        it('updateOneWorkbookperWorkpad should update oneWorkBookperWorkpad and isOneWorkBook checked correctly', () => {
            const event = {detail: {value: {checked: true}}};
            component.exportConfig = new WorkpadExcelExportConfig();
            component.updateOneWorkbookPerWorkpad(event as CustomEvent);
            expect(component.isOneWorkbookChecked).toBeTruthy();
        });
    });
});
