import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FavoriteConstants} from '@constants/favorite.constants';
import {SingleLevelBreakdownComponent} from './single-level-breakdown.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Breakdown, BreakdownBuilderSettings, BreakdownConstants, BreakdownFavoriteConstants, ColumnSector} from '@blk/explore-ui-breakdown';
import {ColumnDefinition, FavoriteType} from '@blk/explore-ui-core';
import {ColumnFilter, LibColumnUtils} from '@blk/explore-ui-column-option';
import {cloneDeep, find} from 'lodash';

describe('SingleLevelBreakdownComponent', () => {
    let component: SingleLevelBreakdownComponent;
    let fixture: ComponentFixture<SingleLevelBreakdownComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SingleLevelBreakdownComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(SingleLevelBreakdownComponent);
        component = fixture.componentInstance;
        component.breakdownBuilderSettings = new BreakdownBuilderSettings();
        component.breakdownBuilderSettings.fieldToUse = 'columnTag';
    });

    it('Test Radio Button Label', () => {
        expect(component.label).toEqual(BreakdownConstants.BREAKDOWN_OPTIONS.SINGLE.label);
    });

    it('Test On Breakdown Option Change', () => {
        const selectedColumn = new ColumnDefinition();
        selectedColumn.columnTag = 'sec_group';
        selectedColumn.dataType = 'STRING';
        selectedColumn.title = 'Security Group';
        const expectedBreakdown = new Breakdown();
        const columnSector = new ColumnSector();
        columnSector.columnTag = 'sec_group';
        columnSector.columnName = 'Security Group';
        columnSector.dataType = 'STRING';
        columnSector.useNoneBuckets = true;
        expectedBreakdown.addChild(columnSector);
        expectedBreakdown.title = columnSector.columnName;
        expectedBreakdown.isConfigured = false;
        const event = {detail: {value:{value: selectedColumn}}} as CustomEvent;
        jest.spyOn(component.breakdownChanged, 'emit');
        component.singleLevelBreakdown = new Breakdown();
        component.singleLevelBreakdown.isConfigured = false;
        component.onBreakdownOptionChange(event);
        expect(component.singleLevelBreakdown).toEqual(expectedBreakdown);
        expect(component.breakdownChanged.emit).toHaveBeenLastCalledWith(expectedBreakdown);
    });

    it('Test onBreakdownOptionChange with "Default Breakdown"', () => {
        const event = {detail: {value: { value: {isMandateDefaultBreakdown: true}}}} as CustomEvent;
        component.singleLevelBreakdown = new Breakdown();
        component.singleLevelBreakdown.isConfigured = false;
        component.onBreakdownOptionChange(event);
        expect(component.singleLevelBreakdown.isMandateDefaultBreakdown).toEqual(true);
        expect(component.singleLevelBreakdown.title).toEqual(BreakdownConstants.MANDATE_DEFAULT_BREAKDOWN_TITLE);
        expect(component.singleLevelBreakdown.isConfigured).toEqual(false);
    });

    it('Test Initialize Column Selections', () => {
        const column1 = new ColumnDefinition();
        column1.columnTag = 'sec_group';
        column1.dataType = 'STRING';
        column1.title = 'Security Group';
        const column2 = new ColumnDefinition();
        column2.columnTag = 'sec_type';
        column2.dataType = 'STRING';
        column2.title = 'Security Type';
        component.singleLevelBreakdown = new Breakdown();
        const columnSector = new ColumnSector();
        columnSector.columnTag = 'sec_group';
        columnSector.columnName = 'Security Group';
        columnSector.dataType = 'STRING';
        columnSector.useNoneBuckets = true;
        component.singleLevelBreakdown.addChild(columnSector);
        component.singleLevelBreakdown.title = columnSector.columnName;
        jest.spyOn(LibColumnUtils, 'getFilteredList').mockImplementation((columnFilter: ColumnFilter[]): ColumnDefinition[] => {
            return [column1, column2];
        });
        component['initializeColumnSelections']();
        expect(component.columnOptions.length).toEqual(3);
    });

    describe('Test Single Breakdown Object initialization', () => {

        beforeEach(() => {
            jest.spyOn<any, any>(component, 'initializeColumnSelections').mockImplementation(() => {
            });
        });

        it('when current breakdown is single level', () => {
            component.breakdown = new Breakdown();
            component.breakdown.isConfigured = false;
            component.breakdown.title = 'Test Title';
            component.breakdown.addChild(new ColumnSector());
            component.ngOnInit();
            expect(component.singleLevelBreakdown !== component.breakdown).toBeTruthy();
            expect(component.singleLevelBreakdown.title).toEqual('Test Title');
        });

        it('when current breakdown is not single level and favorite Type is Factor Breakdown', () => {
            component.breakdownBuilderSettings.favoriteType = BreakdownFavoriteConstants.FACTOR_BREAKDOWN;
            component.breakdown = new Breakdown();
            component.breakdown.isConfigured = true;
            component.breakdown.title = 'Test Title';
            component.breakdown.addChild(new ColumnSector());
            component.ngOnInit();
            expect(component.singleLevelBreakdown.title).toEqual('BRS Standard Factor Tree Level 1');
            expect((component.singleLevelBreakdown.children[0] as ColumnSector).columnTag).toEqual('BRS_GOLD_5');
        });

        it('when current breakdown is not single level and favorite Type is not Factor Breakdown', () => {
            component.breakdownBuilderSettings.favoriteType = FavoriteType.BREAKDOWN;
            component.breakdown = new Breakdown();
            component.breakdown.isConfigured = true;
            component.breakdown.title = 'Test Title';
            component.breakdown.addChild(new ColumnSector());
            component.ngOnInit();
            expect(component.singleLevelBreakdown.title).toEqual('Security Group');
            expect((component.singleLevelBreakdown.children[0] as ColumnSector).columnTag).toEqual('sec_group');
        });

    });

    describe('Test Get Column Filters', () => {

        it('No Filters defined', () => {
            expect(component['getColumnFilters']()).toEqual([{
                type: '!=',
                key: 'dataType',
                value: [
                    'TIME_SPAN',
                    'DATE',
                    'INT',
                    'DOUBLE'
                ]
            }]);
        });

        it('quickColumnFilter and columnFilter defined', () => {
            component.breakdownBuilderSettings.quickColumnFilter = [{
                type: '==',
                key: 'dataType',
                value: [
                    'STRING'
                ]
            }];
            component.breakdownBuilderSettings.columnFilter = [{
                type: '!=',
                key: 'dataType',
                value: [
                    'STRING'
                ]
            }];
            expect(component['getColumnFilters']()).toEqual([{
                type: '==',
                key: 'dataType',
                value: [
                    'STRING'
                ]
            }, {
                type: '!=',
                key: 'dataType',
                value: [
                    'TIME_SPAN',
                    'DATE',
                    'INT',
                    'DOUBLE'
                ]
            }]);
        });

        it('quickColumnFilter not defined and columnFilter defined', () => {
            component.breakdownBuilderSettings.quickColumnFilter = undefined;
            component.breakdownBuilderSettings.columnFilter = [{
                type: '!=',
                key: 'dataType',
                value: [
                    'STRING'
                ]
            }];
            expect(component['getColumnFilters']()).toEqual([{
                type: '!=',
                key: 'dataType',
                value: [
                    'STRING'
                ]
            }, {
                type: '!=',
                key: 'dataType',
                value: [
                    'TIME_SPAN',
                    'DATE',
                    'INT',
                    'DOUBLE'
                ]
            }]);
        });
    });

    it('Test ngOnChanges', () => {
        component['getDefaultBreakdown'] = jest.fn();
        component['initializeColumnSelections'] = jest.fn();
        const changes: any = {};
        // Call ngOnChanges with an empty changes
        component.ngOnChanges(changes);
        expect(component['getDefaultBreakdown']).not.toHaveBeenCalled();
        expect(component['initializeColumnSelections']).not.toHaveBeenCalled();
        // Mock a fake changes object
        changes.breakdownBuilderSettings = {};
        // Call ngOnChanges with the correct changes object
        component.ngOnChanges(changes);
        expect(component['getDefaultBreakdown']).toHaveBeenCalled();
        expect(component['initializeColumnSelections']).toHaveBeenCalled();

        // Mock breakdown as well
        jest.clearAllMocks();
        component.singleLevelBreakdown = new Breakdown();
        // Call ngOnChanges with the correct changes object
        component.ngOnChanges(changes);
        expect(component['getDefaultBreakdown']).not.toHaveBeenCalled();
        expect(component['initializeColumnSelections']).toHaveBeenCalledTimes(1);
    });

    it('Test getDefaultBreakdown() and initializeColumnSelections() for Exposure Columns', () => {
        const column1 = new ColumnDefinition();
        column1.columnTag = 'NLAF_EDR';
        column1.dataType = 'STRING';
        column1.title = 'BRS Standard Equity Factor Breakdown';
        const column2 = new ColumnDefinition();
        column2.columnTag = 'fm_ftype';
        column2.dataType = 'STRING';
        column2.title = 'Exposure Aggregation Type';
        jest.spyOn(LibColumnUtils, 'getFilteredList').mockImplementation((columnFilter: ColumnFilter[]): ColumnDefinition[] => {
            return [column1, column2];
        });
        const dummyInput = {
            inputCategories: [
                {
                    categoryType: 'breakdown',
                    categoryTitle: 'Breakdown',
                    noAccordion: true,
                    inputs: [
                        {
                            inputConfigType: 'breakdownTree',
                            inputTitle: 'Factor Breakdown',
                            inputName: 'riskFactorBreakdown',
                            mandateSettingType: 'FAC_BKD',
                            noAccordion: true,
                            EATBreakdownFilter: [
                                {
                                    type: '=',
                                    key: 'isEATBreakdownDefinition',
                                    value: true
                                }
                            ]
                        }
                    ]
                }
            ]
        };
        const inputs = dummyInput.inputCategories;
        const breakdownInputs = find(inputs, {categoryType: 'breakdown'})['inputs'];
        const breakdownEntry = find(breakdownInputs, {mandateSettingType: BreakdownFavoriteConstants.FACTOR_BREAKDOWN});
        const eatFilter: any[] = breakdownEntry['EATBreakdownFilter'];

        component.breakdownBuilderSettings.columnFilter = cloneDeep(eatFilter);
        component.breakdownBuilderSettings.includeNoBreakdownOption = false;
        const changes: any = {};
        changes.breakdownBuilderSettings = {};
        component.ngOnChanges(changes);
        expect(component.singleLevelBreakdown.getDisplayTitle()).toEqual(BreakdownConstants.EXPOSURE_AGGREGATION_TYPE);
        expect(component.singleLevelBreakdown.isConfigured).toBeFalsy();
        expect(component.columnOptions.length).toEqual(2);
    });
});
