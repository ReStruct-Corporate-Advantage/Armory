import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SectorAttributeRuleBuilderComponent} from './sector-attribute-rule-builder.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {cloneDeep} from 'lodash';
import {ColumnSelectorOption} from '@blk/explore-ui-column-option';
import {ColumnConstants, ColumnDefinition, CoreColumnUtils, ExploreDialogParam, AlertConstants, NOTIFICATION_SERVICE_TOKEN} from '@blk/explore-ui-core';
import {SectorRuleBuilderConfig} from '../../models/sector/sector-rule-builder-config.model';
import {ColumnSectorRule} from '../../models/sector/column-sector/column-sector-rule.model';

describe('SectorAttributeRuleBuilderComponent', () => {
    let component: SectorAttributeRuleBuilderComponent;
    let fixture: ComponentFixture<SectorAttributeRuleBuilderComponent>;

    const notificationServiceStub = {
        openDialog: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SectorAttributeRuleBuilderComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceStub}
            ]
        });

        fixture = TestBed.createComponent(SectorAttributeRuleBuilderComponent);
        component = fixture.componentInstance;

        const curColumnSelection = new ColumnSelectorOption('cur');
        const secColumnSelection = new ColumnSelectorOption('group', 'uid2', [new ColumnSelectorOption('sec_group')], 'group');
        const secTypeColumnSelection = new ColumnSelectorOption('group', 'uid3', [new ColumnSelectorOption('sec_type')], 'group');
        const marTypeColumnSelection = new ColumnSelectorOption('group', 'uid4', [new ColumnSelectorOption('mar')], 'group');
        component.sectorRuleBuilderConfig = new SectorRuleBuilderConfig([curColumnSelection, secColumnSelection, secTypeColumnSelection, marTypeColumnSelection], null);

        fixture.detectChanges();
    });

    it('Test On Column Selection', () => {
        jest.spyOn(component, 'columnSelected');
        const columnDefinition = new ColumnDefinition();
        columnDefinition.columnTag = 'cur';
        columnDefinition.title = 'Currency';
        columnDefinition.dataType = ColumnConstants.COLUMN_DATA_TYPE.DATE;
        const curColumnSelection = new ColumnSelectorOption('cur');
        curColumnSelection.eventData = columnDefinition;
        component.selectedColumn = cloneDeep(columnDefinition);
        component.selectedColumn.columnTag = 'mar';
        component.initialColumnValue = ['Test'];
        component.columnSelectionOption = curColumnSelection;
        component.onColumnSelection({detail: {value: [curColumnSelection]}} as CustomEvent);
        expect(component.columnSelected).toHaveBeenCalledTimes(0);
        component.columnSelectionOption = null;
        component.onColumnSelection(null);
        expect(component.columnSelected).toHaveBeenCalledTimes(0);
        component.onColumnSelection({detail: {value: []}} as CustomEvent);
        expect(component.columnSelected).toHaveBeenCalledTimes(0);
        const groupSelection = new ColumnSelectorOption('group');
        groupSelection.children = [curColumnSelection];
        component.onColumnSelection({detail: {value: [groupSelection]}} as CustomEvent);
        expect(component.columnSelected).toHaveBeenCalledTimes(0);
        component.onColumnSelection({detail: {value: [curColumnSelection]}} as CustomEvent);
        expect(component.initialColumnValue).toEqual(['Test']);
        expect(component.selectedColumn).toEqual(columnDefinition);
        expect(component.columnSelected).toHaveBeenCalled();
    });

    describe('Test shouldDisplayWarningDialogForTabSwitch', () => {

        beforeEach(() => {
            component.columnValue = [];
            component.selectedColumn = null;
            component.defaultOperatorSelected = null;
            component.operatorSelected = null;
        });

        it('columnValue', function() {
            expect(component.shouldDisplayWarningDialogForTabSwitch()).toBeFalsy();
            component.columnValue = [''];
            expect(component.shouldDisplayWarningDialogForTabSwitch()).toBeFalsy();
            component.columnValue = ['USD'];
            expect(component.shouldDisplayWarningDialogForTabSwitch()).toBeTruthy();
        });

        it('selectedColumn', function() {
            component.selectedColumn = new ColumnDefinition();
            expect(component.shouldDisplayWarningDialogForTabSwitch()).toBeFalsy();
            component.selectedColumn.columnTag = 'sec_group';
            expect(component.shouldDisplayWarningDialogForTabSwitch()).toBeTruthy();
        });

        it('selectedOperator', function() {
            component.operatorSelected = 'equal';
            expect(component.shouldDisplayWarningDialogForTabSwitch()).toBeTruthy();
        });

        it('none selectedOperator', function() {
            component.operatorSelected = null;
            expect(component.shouldDisplayWarningDialogForTabSwitch()).toBeFalsy();
        });

        it('All  Values populated', function() {
            component.operatorSelected = 'equal';
            component.columnValue = ['USD'];
            component.selectedColumn = new ColumnDefinition();
            component.selectedColumn.columnTag = 'sec_group';
            expect(component.shouldDisplayWarningDialogForTabSwitch()).toBeTruthy();
        });
    });

    it('Test Set Column Type', () => {
        // set column as static
        component.selectedColumn = new ColumnDefinition();
        component.selectedColumn.isStaticColumn = true;
        component.setColumnType();
        expect(component.isStaticValueColumn).toBeTruthy();
        expect(component.isDateColumn).toBeFalsy();
        expect(component.isNumericColumn).toBeFalsy();
        expect(component.isTimeSpanColumn).toBeFalsy();
        // set column is date column
        component.selectedColumn.dataType = ColumnConstants.COLUMN_DATA_TYPE.DATE;
        component.selectedColumn.isStaticColumn = false;
        component.setColumnType();
        expect(component.isDateColumn).toBeTruthy();
        expect(component.isStaticValueColumn).toBeFalsy();
        expect(component.isNumericColumn).toBeFalsy();
        expect(component.isTimeSpanColumn).toBeFalsy();
        // set column is time span column
        component.selectedColumn.dataType = ColumnConstants.COLUMN_DATA_TYPE.TIME_SPAN;
        component.setColumnType();
        expect(component.isTimeSpanColumn).toBeTruthy();
        expect(component.isStaticValueColumn).toBeFalsy();
        expect(component.isDateColumn).toBeFalsy();
        expect(component.isNumericColumn).toBeFalsy();
        // set column is numeric column
        component.selectedColumn.dataType = ColumnConstants.COLUMN_DATA_TYPE.DOUBLE;
        component.setColumnType();
        expect(component.isNumericColumn).toBeTruthy();
        expect(component.isStaticValueColumn).toBeFalsy();
        expect(component.isDateColumn).toBeFalsy();
        expect(component.isTimeSpanColumn).toBeFalsy();
        component.selectedColumn.dataType = ColumnConstants.COLUMN_DATA_TYPE.INT;
        component.setColumnType();
        expect(component.isNumericColumn).toBeTruthy();
        expect(component.isStaticValueColumn).toBeFalsy();
        expect(component.isDateColumn).toBeFalsy();
        expect(component.isTimeSpanColumn).toBeFalsy();
        // set column is string column
        component.selectedColumn.dataType = ColumnConstants.COLUMN_DATA_TYPE.STRING;
        component.setColumnType();
        expect(component.isNumericColumn).toBeFalsy();
        expect(component.isStaticValueColumn).toBeFalsy();
        expect(component.isDateColumn).toBeFalsy();
        expect(component.isTimeSpanColumn).toBeFalsy();
    });

    it('Test get Column Data Type', () => {
        component.selectedColumn = new ColumnDefinition();
        component.selectedColumn.dataType = ColumnConstants.COLUMN_DATA_TYPE.INT;
        expect(component.getSelectedColumnDataType()).toEqual(ColumnConstants.BREAKDOWN_JSTREE_TYPE.NUMERIC);
        component.selectedColumn = new ColumnDefinition();
        component.selectedColumn.dataType = ColumnConstants.COLUMN_DATA_TYPE.DOUBLE;
        expect(component.getSelectedColumnDataType()).toEqual(ColumnConstants.BREAKDOWN_JSTREE_TYPE.NUMERIC);
        component.selectedColumn = new ColumnDefinition();
        component.selectedColumn.dataType = ColumnConstants.COLUMN_DATA_TYPE.DATE;
        expect(component.getSelectedColumnDataType()).toEqual(ColumnConstants.BREAKDOWN_JSTREE_TYPE.DATE);
        component.selectedColumn = new ColumnDefinition();
        component.selectedColumn.dataType = ColumnConstants.COLUMN_DATA_TYPE.TIME_SPAN;
        expect(component.getSelectedColumnDataType()).toEqual(ColumnConstants.COLUMN_DATA_TYPE.TIME_SPAN);
        component.selectedColumn = new ColumnDefinition();
        component.selectedColumn.dataType = ColumnConstants.COLUMN_DATA_TYPE.RATING;
        expect(component.getSelectedColumnDataType()).toEqual(ColumnConstants.BREAKDOWN_JSTREE_TYPE.RATING);
        component.selectedColumn = new ColumnDefinition();
        component.selectedColumn.dataType = ColumnConstants.COLUMN_DATA_TYPE.STRING;
        expect(component.getSelectedColumnDataType()).toEqual(ColumnConstants.COLUMN_DATA_TYPE.STRING);
    });

    it('Test setValuesFromColumnSectorRule', () => {
        const columnRule: ColumnSectorRule = new ColumnSectorRule();
        columnRule.columnName = 'Date';
        columnRule.columnTag = 'date';
        columnRule.positionColumnType = 'ALL';
        columnRule.dataType = 'date';
        columnRule.comparisonType = 'EQUALS';
        columnRule.comparisonValues = ['25-Aug-2016'];
        component.columnSectorRule = columnRule;
        const columnDefinition = new ColumnDefinition();
        columnDefinition.columnTag = 'cur';
        columnDefinition.title = 'Currency';
        columnDefinition.dataType = ColumnConstants.COLUMN_DATA_TYPE.DATE;
        jest.spyOn(CoreColumnUtils, 'getColumnDefByTagAndUse').mockImplementation((colTag: string, pos: string) => {
            return columnDefinition;
        });
        const curColumn = columnDefinition;
        const curColumnSelectionInnerOption = new ColumnSelectorOption('cur');
        curColumnSelectionInnerOption.eventData = curColumn;
        const curColumnSelection = new ColumnSelectorOption('group', 'uid1', [curColumnSelectionInnerOption], 'group');
        const secGroupCol = cloneDeep(curColumn);
        secGroupCol.columnTag = 'sec_group';
        const secGroupColInnerOption = new ColumnSelectorOption('sec_group');
        secGroupColInnerOption.eventData = secGroupCol;
        const secColumnSelection = new ColumnSelectorOption('group', 'uid2', [secGroupColInnerOption], 'group');
        const secTypeCol = cloneDeep(curColumn);
        secTypeCol.columnTag = 'sec_type';
        const secTypeColInnerOption = new ColumnSelectorOption('sec_type');
        secTypeColInnerOption.eventData = secTypeCol;
        const secTypeColumnSelection = new ColumnSelectorOption('group', 'uid3', [secTypeColInnerOption], 'group');
        const mar = cloneDeep(curColumn);
        mar.columnTag = 'mar';
        const marColInnerOption = new ColumnSelectorOption('mar');
        marColInnerOption.eventData = mar;
        const marTypeColumnSelection = new ColumnSelectorOption('group', 'uid4', [marColInnerOption], 'group');
        component.sectorRuleBuilderConfig = new SectorRuleBuilderConfig([curColumnSelection, secColumnSelection, secTypeColumnSelection, marTypeColumnSelection], null);
        component.setValuesFromColumnSectorRule();
        expect(component.selectedColumn).toEqual(columnDefinition);
        expect(component.columnSelectionOption.eventData).toEqual(columnDefinition);
        expect(component.columnSelectionOption.isSelected).toBeTruthy();
        expect(curColumnSelection['isExpanded']).toBeTruthy();
        expect(component.isDateColumn).toBeTruthy();
        expect(component.isStaticValueColumn).toBeFalsy();
        expect(component.isNumericColumn).toBeFalsy();
        expect(component.isTimeSpanColumn).toBeFalsy();
        expect(component.includeNullValues).toBeFalsy();
    });

    it('Test on Column Value Update', () => {
        component.onColumnValueUpdate(null);
        expect(component.columnValue).toBeNull();
        component.onColumnValueUpdate('Test');
        expect(component.columnValue).toEqual(['Test']);
        component.onColumnValueUpdate(1);
        expect(component.columnValue).toEqual([1]);
        component.onColumnValueUpdate([1, 2]);
        expect(component.columnValue).toEqual([1, 2]);
    });

    it('Test on Change Of Include Null Values', () => {
        expect(component.includeNullValues).toBeFalsy();
        component.onChangeOfIncludeNullValues(true);
        expect(component.includeNullValues).toBeTruthy();
    });

    it('Test onOperatorChange', () => {
        component.onOperatorChange({operator: 'equals', isDefault: true});
        expect(component.defaultOperatorSelected).toBe('equals');

        component.onOperatorChange({operator: 'Does Not Equal'});
        expect(component.operatorSelected).toBe('Does Not Equal');
        expect(component.isOperatorDoesNotEqual).toBeTruthy();
        expect(component.includeNullValues).toBeFalsy();

        component.onOperatorChange(null);
        expect(component.operatorSelected).toBe(null);
    });

    describe('validateRule Test', () => {
        beforeEach(() => {
            jest.spyOn(component['notificationService'], 'openDialog');
        });

        it('should return false with notification prompt if no selected column', () => {
            expect(component.validateRule()).toBeFalsy();
            expect(component['notificationService'].openDialog).toHaveBeenCalledWith(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT,
                    AlertConstants.HEADER.INVALID_ENTRY,
                    AlertConstants.BODY.INVALID_COLUMN,
                    AlertConstants.BTN.OK
                ));
        });

        it('should return false with notification prompt if selected column doesn\'t have columnTag property', () => {
            component.selectedColumn = new ColumnDefinition();
            expect(component.validateRule()).toBeFalsy();
            expect(component['notificationService'].openDialog).toHaveBeenCalledWith(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT,
                    AlertConstants.HEADER.INVALID_ENTRY,
                    AlertConstants.BODY.INVALID_COLUMN,
                    AlertConstants.BTN.OK
                ));
        });

        it('should return false with notification prompt if no operator selected', () => {
            component.selectedColumn = new ColumnDefinition();
            component.selectedColumn.columnTag = 'cur';
            expect(component.validateRule()).toBeFalsy();
            expect(component['notificationService'].openDialog).toHaveBeenCalledWith(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT,
                    AlertConstants.HEADER.INVALID_ENTRY,
                    AlertConstants.BODY.INVALID_OPERATION,
                    AlertConstants.BTN.OK
                ));
        });

        it('should return false with notification prompt if value is invalid', () => {
            component.operatorSelected = 'Equals';
            component.selectedColumn = new ColumnDefinition();
            component.selectedColumn.columnTag = 'cur';
            expect(component.validateRule()).toBeFalsy();
            expect(component['notificationService'].openDialog).toHaveBeenCalledWith(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT,
                    AlertConstants.HEADER.INVALID_ENTRY,
                    AlertConstants.BODY.INVALID_VALUE,
                    AlertConstants.BTN.OK
                ));
        });

        it('should return false with notification prompt if select is invalid', () => {
            component.isStaticValueColumn = true;
            component.operatorSelected = 'Equals';
            component.selectedColumn = new ColumnDefinition();
            component.selectedColumn.columnTag = 'cur';
            expect(component.validateRule()).toBeFalsy();
            expect(component['notificationService'].openDialog).toHaveBeenCalledWith(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT,
                    AlertConstants.HEADER.INVALID_ENTRY,
                    AlertConstants.BODY.INVALID_SELECT,
                    AlertConstants.BTN.OK
                ));
        });

        it('should return true', () => {
            component.columnValue = ['USD'];
            component.isStaticValueColumn = true;
            component.operatorSelected = 'Equals';
            component.selectedColumn = new ColumnDefinition();
            component.selectedColumn.columnTag = 'cur';
            expect(component.validateRule()).toBeTruthy();
        });
    });

    it('Test ngOnChanges', () => {
        jest.spyOn(component, 'setValuesFromColumnSectorRule');
        component.ngOnChanges(
            {}
        );
        expect(component.setValuesFromColumnSectorRule).toHaveBeenCalledTimes(0);
        const curColumn = new ColumnDefinition();
        curColumn.columnTag = 'cur';
        curColumn.title = 'Currency';
        curColumn.dataType = ColumnConstants.COLUMN_DATA_TYPE.DATE;
        const curColumnSelectionInnerOption = new ColumnSelectorOption('cur');
        curColumnSelectionInnerOption.eventData = curColumn;
        const curColumnSelection = new ColumnSelectorOption('group', 'uid1', [curColumnSelectionInnerOption]);
        const secGroupCol = cloneDeep(curColumn);
        secGroupCol.columnTag = 'sec_group';
        const secGroupColInnerOption = new ColumnSelectorOption('sec_group');
        secGroupColInnerOption.eventData = secGroupCol;
        const secColumnSelection = new ColumnSelectorOption('group', 'uid2', [secGroupColInnerOption]);
        const secTypeCol = cloneDeep(curColumn);
        secTypeCol.columnTag = 'sec_type';
        const secTypeColInnerOption = new ColumnSelectorOption('sec_type');
        secTypeColInnerOption.eventData = secTypeCol;
        const secTypeColumnSelection = new ColumnSelectorOption('group', 'uid3', [secTypeColInnerOption]);
        const mar = cloneDeep(curColumn);
        mar.columnTag = 'mar';
        const marColInnerOption = new ColumnSelectorOption('mar');
        marColInnerOption.eventData = mar;
        const marTypeColumnSelection = new ColumnSelectorOption('group', 'uid4', [marColInnerOption]);
        component.sectorRuleBuilderConfig = new SectorRuleBuilderConfig([curColumnSelection, secColumnSelection, secTypeColumnSelection, marTypeColumnSelection], null);
        component.columnSectorRule = new ColumnSectorRule();
        const columnSelection = new ColumnSelectorOption('new');
        columnSelection.eventData = new ColumnDefinition();
        columnSelection.isSelected = true;
        component.columnSelectionOption = columnSelection;
        component.ngOnChanges(
            {
                columnSectorRule: new SimpleChange(null, component.columnSectorRule, true)
            }
        );
        expect(component.setValuesFromColumnSectorRule).toHaveBeenCalledTimes(0);
        expect(component.selectedColumn).toBeNull();
        expect(component.columnSelectionOption).toBeNull();
        expect(columnSelection.isSelected).toBeFalsy();
        component.columnSectorRule.columnName = 'Security Group';
        component.columnSectorRule.columnTag = 'sec_group';
        component.columnSectorRule.positionColumnType = 'ALL';
        component.columnSectorRule.dataType = 'String';
        component.columnSectorRule.comparisonType = 'EQUALS';
        component.columnSectorRule.comparisonValues = ['EQUITY', 'BND'];
        component.sectorRuleBuilderConfig = new SectorRuleBuilderConfig([], null);
        component.ngOnChanges(
            {
                columnSectorRule: new SimpleChange(null, component.columnSectorRule, true)
            }
        );
        expect(component.setValuesFromColumnSectorRule).toHaveBeenCalled();
    });

});
