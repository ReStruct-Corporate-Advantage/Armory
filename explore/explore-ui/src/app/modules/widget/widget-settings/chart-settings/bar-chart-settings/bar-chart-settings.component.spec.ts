import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ColumnConstants, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {TestUtils} from '@utils/test.utils';

import {orientationOption} from '@enums/bar-chart-orientation-options.enum';
import {WidgetConfigFactory} from '../../../../../factories';
import {BarChartSettings} from '@models/widget/inputs/chart-settings/bar-chart-settings.model';
import {SortedColumn} from '@models/widget/inputs/sorted-columns/sorted-column';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {Widget} from '@models/widget/widget.model';
import {WorkspaceStore} from '@stores/index';
import {BarChartSettingsComponent} from './bar-chart-settings.component';
import {ColumnSet} from '@blk/explore-ui-column-option';

describe('BarChartSettingsComponent', () => {
    let component: BarChartSettingsComponent;
    let fixture: ComponentFixture<BarChartSettingsComponent>;
    let widget: Widget;

    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentPortfolio(new Portfolio('PEP'));
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BarChartSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(BarChartSettingsComponent);
        component = fixture.componentInstance;
        widget = new Widget(WidgetConfigType.BAR);

        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.BAR, 'chart');
        component.inputs = widget.getCombinedInputs();
    });

    it('check if component is initialized correctly', () => {
        jest.spyOn(component, 'initializeOrientationOptions');
        jest.spyOn(component, 'initializeSortedColumns');
        jest.spyOn(WidgetConfigFactory, 'getHideBreakdownInSorting').mockReturnValue(false);

        component.ngOnInit();

        expect(component.isSortByDisabled).not.toBeUndefined();
        expect(component.isTotalCheckboxDisabled).not.toBeUndefined();
        expect(component.isSortByDisabled).not.toBeUndefined();

        expect(component.initializeOrientationOptions).toHaveBeenCalled();
        expect(component.initializeSortedColumns).toHaveBeenCalled();
    });

    describe('Test onSortBySelectionChanged method', () => {
        it('onSortBySelectionChanged should change the sortBy selector', () => {

            const event = {detail: {value: {value: 'Notional Market Value %'}}};
            // Change to bar chart
            const newSortedColumn = new SortedColumn({
                colId: '',
                sort: ColumnConstants.SORTING_ORDER.BREAKDOWN_SORT_ORDER.VALUE
            });
            const sortedColumns: SortedColumns = new SortedColumns();
            sortedColumns.sortedColumns = [newSortedColumn];
            component.inputs.set('sortedColumns', sortedColumns);
            component.onSortBySelectionChanged(event as CustomEvent);
            let sortedColumn = component.getInput('sortedColumns') as SortedColumns;
            expect(sortedColumn.sortedColumns[0].colId).toEqual('Notional Market Value %');

            event.detail.value.value = 'Commitment';
            // Change to Commitment
            component.onSortBySelectionChanged(event as CustomEvent);
            sortedColumn = component.getInput('sortedColumns') as SortedColumns;
            expect(sortedColumn.sortedColumns[0].colId).toEqual('Commitment');
        });
    });

    describe('Test onSortOrderSelectionChanged method', () => {
        it('onSortOrderSelectionChanged should change the sortOrder selector', () => {

            const event = {detail: {value: {value: 'ASC'}}};
            // Change to Ascending
            const newSortedColumn = new SortedColumn({
                colId: '',
                sort: ColumnConstants.SORTING_ORDER.BREAKDOWN_SORT_ORDER.VALUE
            });
            const sortedColumns: SortedColumns = new SortedColumns();
            sortedColumns.sortedColumns = [newSortedColumn];
            component.inputs.set('sortedColumns', sortedColumns);
            component.onSortOrderSelectionChanged(event as CustomEvent);
            const sortedColumn = component.getInput('sortedColumns') as SortedColumns;
            expect(sortedColumn.sortedColumns[0].sort).toEqual('ASC');
        });
    });

    describe('Test onOrientationChanged method', () => {
        it('onOrientationChanged should change the chartType properly', () => {
            // check show total line option
            const event = {detail: {value: {eventData: 'bar'}}};
            component.onOrientationChanged(event as CustomEvent);
            expect((component.getInput('chart') as BarChartSettings).chartType).toEqual('bar');
        });
    });

    describe('Test onCheckboxGroupChanged method', () => {
        it('onCheckboxGroupChanged should change the includeTotalValues properly', () => {
            let value = {checked: false};
            component.onCheckboxGroupChanged(value);
            expect((component.getInput('chart') as BarChartSettings).includeTotalValues).toEqual(value.checked);

            value = {checked: true};
            component.onCheckboxGroupChanged(value);
            // Stacked Breakdown is not applied
            expect((component.getInput('chart') as BarChartSettings).includeTotalValues).toEqual(false);
        });
    });

    describe('Test initializeOrientationOptions method', () => {
        it('initializeOrientationOptions should create options properly', () => {
            component.initializeOrientationOptions();

            // First option
            expect(component.orientationOptions[0].label).toEqual('Horizontal');
            expect(component.orientationOptions[0].eventData).toEqual(orientationOption.HORIZONTAL);
            expect(component.orientationOptions[0].checked).toEqual(false);

            // Second option
            expect(component.orientationOptions[1].label).toEqual('Vertical');
            expect(component.orientationOptions[1].eventData).toEqual(orientationOption.VERTICAL);
            // Verical is the selected Option
            expect(component.orientationOptions[1].checked).toEqual(true);
        });
    });

    describe('Test initializeSortOrderOptions method', () => {
        it('initializeSortOrderOptions should initialize sort order properly', () => {
            component.hideBreakdownInSorting = true;
            const newSortedColumn = new SortedColumn({
                colId: '',
                sort: ColumnConstants.SORTING_ORDER.ASC_SORT_ORDER.VALUE
            });
            const sortedColumns: SortedColumns = new SortedColumns();
            sortedColumns.sortedColumns = [newSortedColumn];
            component.inputs.set('sortedColumns', sortedColumns);
            component.initializeSortOrderOptions();

            let expectedSortingOrder = [
                {
                    'values': [
                        {
                            'displayValue': 'Ascending',
                            'value': 'ASC',
                            'isSelected': true
                        },
                        {
                            'displayValue': 'Descending',
                            'value': 'DESC',
                            'isSelected': false
                        }
                    ]
                }];
            expect(component.sortingOrder).toEqual(expectedSortingOrder);

            // Setting hideBreakdownInSorting = false
            component.hideBreakdownInSorting = false;
            component.initializeSortOrderOptions();
            expectedSortingOrder = [
                {
                    'values': [
                        {
                            'displayValue': 'Ascending',
                            'value': 'ASC',
                            'isSelected': true
                        },
                        {
                            'displayValue': 'Descending',
                            'value': 'DESC',
                            'isSelected': false
                        },
                        {
                            'displayValue': 'Breakdown',
                            'value': 'BREAKDOWN',
                            'isSelected': false
                        }
                    ]
                }];
            expect(component.sortingOrder).toEqual(expectedSortingOrder);
        });
    });

    describe('Test initializeSortedColumns method', () => {
        it('initializeSortedColumns should initialize sortByOptions to none selected', () => {
            component.widgetColumns = widget.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet;
            component.initializeSortedColumns();
            expect(component.widgetColumns).not.toBeUndefined();
            const expectedValues: AuxSelectOption[] = [{
                displayValue: 'Notional Market Value %',
                value: 'pct_notional_val_0',
                isSelected: false
            }];
            // creating expected sortByOptions
            const expectedSortByOptions = [{values: expectedValues}];
            expect(component.sortByOptions).toEqual(expectedSortByOptions);
        });

        it('should clear sortedColumns if column no longer exists', () => {
            const sortedColumns = widget.getCombinedInputs().get(SortedColumns.configType) as SortedColumns;
            sortedColumns.sortedColumns = [new SortedColumn({colId: 'pct_mv', sort: 'DESC'})];
            component.widgetColumns = widget.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet;

            component.initializeSortedColumns();

            expect((component.inputs.get(SortedColumns.configType) as SortedColumns).sortedColumns).toHaveLength(0);
        });
    });

    it('onSortOrderSelectionChanged - default sortBy to first column if not previously set when sortOrder changed', () => {
        const sortedColumns = widget.getCombinedInputs().get(SortedColumns.configType) as SortedColumns;
        sortedColumns.sortedColumns = [];
        component.widgetColumns = widget.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet;

        const event = {detail: {value: {value: ColumnConstants.SORTING_ORDER.ASC_SORT_ORDER.VALUE}}} as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
        component.onSortOrderSelectionChanged(event);

        expect((component.inputs.get(SortedColumns.configType) as SortedColumns).sortedColumns).toHaveLength(1);
        const sortedColumn = (component.inputs.get(SortedColumns.configType) as SortedColumns).sortedColumns[0];
        expect(sortedColumn.colId).toEqual((widget.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet).columns[0].columnKey);
        expect(sortedColumn.sort).toEqual(ColumnConstants.SORTING_ORDER.ASC_SORT_ORDER.VALUE);
        // allow user to change sortBy
        expect(component.isSortByDisabled).toEqual(false);
    });

    it('onSortOrderSelectionChanged - should clear sortBy column if sortOrder is BREAKDOWN', () => {
        const sortedColumns = widget.getCombinedInputs().get(SortedColumns.configType) as SortedColumns;
        sortedColumns.sortedColumns = [new SortedColumn({colId: 'pct_mv', sort: ColumnConstants.SORTING_ORDER.ASC_SORT_ORDER.VALUE})];
        component.widgetColumns = widget.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet;

        const event = {detail: {value: {value: ColumnConstants.SORTING_ORDER.BREAKDOWN_SORT_ORDER.VALUE}}} as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
        component.onSortOrderSelectionChanged(event);

        expect((component.inputs.get(SortedColumns.configType) as SortedColumns).sortedColumns).toHaveLength(1);
        const sortedColumn = (component.inputs.get(SortedColumns.configType) as SortedColumns).sortedColumns[0];
        expect(sortedColumn.colId).toBeUndefined();
        expect(sortedColumn.sort).toEqual(ColumnConstants.SORTING_ORDER.BREAKDOWN_SORT_ORDER.VALUE);
        expect(component.isSortByDisabled).toEqual(true);
    });
});
