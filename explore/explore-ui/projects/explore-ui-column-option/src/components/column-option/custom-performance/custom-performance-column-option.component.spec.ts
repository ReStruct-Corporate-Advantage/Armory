import {
    ColumnConfig,
    ColumnOptionFactory,
    CoreTestUtils,
    CoreWidgetConfigStore,
    WidgetConfig,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {find} from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {CustomPerformanceColumnOption} from '../../../models/column-option/custom-performance-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils/column-option-test-bed.testutil';
import * as returnsWidgetConfig from '../../../test-utils/widget-configs/return-analysis-widget.json';
import * as riskExposureConfig from '../../../test-utils/widget-configs/risk-and-exposure-widget.json';
import {CustomPerformanceColumnOptionComponent} from './custom-performance-column-option.component';

describe('CustomPerformanceComponent', () => {
    let testBed: ColumnOptionTestBed<CustomPerformanceColumnOptionComponent, CustomPerformanceColumnOption>;
    let customPerformanceColumnOption: CustomPerformanceColumnOption;

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll(() => {
        CoreTestUtils.initDefinitions();
        ColumnOptionFactory.registerOptionType(CustomPerformanceColumnOption.CONFIG_TYPE, CustomPerformanceColumnOption);
    });

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Custom settings',
            columnOptionConfigType: 'customPerfSettings',
            columnOptionAttributes: [{
                title: 'Port/Bench/Active',
                values: ['Portfolio', 'Benchmark', 'Active']
            }, {
                title: 'Performance Column Type',
                values: [{label: 'Return'}, {label: 'Contribution'}, {label: 'P&L'}]
            }, {
                title: 'Columns To Combine'
            }]
        };
        CoreWidgetConfigStore.currentWidgetConfigType$ = new BehaviorSubject<string>(WidgetConfigType.RISK_EXPOSURE);
        CoreWidgetConfigStore.chartConfig.set('riskExposure', new WidgetConfig(riskExposureConfig));
        CoreWidgetConfigStore.chartConfig.set('returnsWidget', new WidgetConfig(returnsWidgetConfig));
        customPerformanceColumnOption = new CustomPerformanceColumnOption();
        customPerformanceColumnOption.positionColumnType = 'Portfolio';
        customPerformanceColumnOption.performanceColumnType = 'Return';
        const underlyingColumns: ColumnConfig[] = [];
        underlyingColumns.push(ColumnConfig.createColumn('acct_fees_contr', 'PORT', 'acct_fees_contr_0', 'Accounting Fees Contribution'));
        underlyingColumns.push(ColumnConfig.createColumn('conv_contr', 'PORT', 'conv_contr_1', 'Convexity Contribution'));
        customPerformanceColumnOption.underlyingColumns = underlyingColumns;
        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<CustomPerformanceColumnOptionComponent, CustomPerformanceColumnOption>(CustomPerformanceColumnOptionComponent, customPerformanceColumnOption, mockedOption, [], 'custom_perf', 'PORT');
    });

    describe('Test initializeComponent method', () => {
        it('Validate init of the component', () => {
            expect(testBed.component).toBeTruthy();

            // validate underlyingColumns
            // expect(testBed.component.underlyingColumns).toBe('Accounting Fees Contribution, Convexity Contribution');

            // validate for RE widget
            expect(testBed.component.positionColumnTypeOptions[0].values.length).toBe(3);
            expect(testBed.component.performanceColumnTypeOptions[0].values.length).toBe(2);
            expect(testBed.component.performanceColumnTypeOptions[0].values[0].isSelected).toBe(true);
            expect(testBed.component.optionValue.performanceColumnType).toBe(testBed.component.performanceColumnTypeOptions[0].values[0].displayValue);
            expect(testBed.component.underlyingColumnsOptions[0].values.length).toBe(40);
            expect(testBed.component.underlyingColumnsOptions[0].values.find(
                value => value.displayValue === customPerformanceColumnOption.underlyingColumns[0].columnTitle).isSelected).toBe(true);
            expect(testBed.component.underlyingColumnsOptions[0].values.find(
                value => value.displayValue === customPerformanceColumnOption.underlyingColumns[1].columnTitle).isSelected).toBe(true);
            expect(testBed.component.isUnderlyingColumnsUpdated).toBe(true);
            expect(testBed.component.column.columnTitle).toBe('Custom Performance Column (Portfolio) (Contribution)');

            // validate for RA widget
            CoreWidgetConfigStore.updateCurrentWidgetConfigType(WidgetConfigType.RETURNS);
            customPerformanceColumnOption.performanceColumnType = 'Return';
            testBed.component.optionValue.underlyingColumns = [ColumnConfig.createColumn('acct_fees_ret', 'PORT', 'acct_fees_ret_0', 'Accounting Fees Return')];
            testBed.fixture.detectChanges();
            testBed.component.ngOnInit();
            expect(testBed.component.positionColumnTypeOptions[0].values.length).toBe(3);
            expect(testBed.component.performanceColumnTypeOptions[0].values.length).toBe(3);
            expect(find(testBed.component.performanceColumnTypeOptions[0].values, {value: testBed.component.optionValue.performanceColumnType}).isSelected).toBe(true);
            expect(testBed.component.underlyingColumnsOptions[0].values.length).toBe(60);
            expect(testBed.component.underlyingColumnsOptions[0].values.find(
                value => value.displayValue === testBed.component.optionValue.underlyingColumns[0].columnTitle).isSelected).toBe(true);
            expect(testBed.component.column.columnTitle).toBe('Custom Performance Column (Portfolio) (Return)');
        });
    });

    describe('Test onPositionColumnTypeChanged method', () => {
        it('should sets the positionColumnType to the selected value from dropdown and update Column title and underlyingColumns', () => {
            expect(testBed.component.column.columnTitle).toBe('Custom Performance Column (Portfolio) (Contribution)');
            const event = {detail: {value: {displayValue: 'Benchmark'}}};
            testBed.component.onPositionColumnTypeChanged(event as CustomEvent);
            expect(testBed.component.optionValue.positionColumnType).toEqual('Benchmark');
            expect(testBed.component.optionValue.underlyingColumns.length).toBe(0);
            expect(testBed.component.underlyingColumnsOptions.length).toBe(0);
            expect(testBed.component.isUnderlyingColumnsUpdated).toBe(false);
            expect(testBed.component.column.columnTitle).toBe('Custom Performance Column (Benchmark) (Contribution)');
        });
    });

    describe('Test onPerformanceColumnTypeChanged method', () => {
        it('should sets the performanceColumnType to the selected value from dropdown and update Column title and underlyingColumns', () => {
            expect(testBed.component.column.columnTitle).toBe('Custom Performance Column (Portfolio) (Contribution)');
            const event = {detail: {value: {displayValue: 'P&L'}}};
            testBed.component.onPerformanceColumnTypeChanged(event as CustomEvent);
            expect(testBed.component.optionValue.performanceColumnType).toEqual('P&L');
            expect(testBed.component.optionValue.underlyingColumns.length).toBe(0);
            expect(testBed.component.underlyingColumnsOptions.length).toBe(0);
            expect(testBed.component.isUnderlyingColumnsUpdated).toBe(false);
            expect(testBed.component.column.columnTitle).toBe('Custom Performance Column (Portfolio) (P&L)');
        });
    });

    describe('Test onUnderlyingColumnsChanged method', () => {
        it('should sets the underlyingColumns to the selected values', () => {
            expect(testBed.component.optionValue.underlyingColumns.length).toBe(2);
            const colConfig1 = ColumnConfig.createColumn('crv_contr', 'PORT', 'crv_contr_0', 'Curve Contribution');
            customPerformanceColumnOption.underlyingColumns.push(colConfig1);
            const event = {
                detail: {
                    value: [{value: customPerformanceColumnOption.underlyingColumns[0]},
                        {value: customPerformanceColumnOption.underlyingColumns[1]},
                        {value: customPerformanceColumnOption.underlyingColumns[2]}]
                }
            } as CustomEvent;
            testBed.component.onUnderlyingColumnsChanged(event);
            expect(testBed.component.optionValue.underlyingColumns.length).toBe(3);
        });
    });

    describe('Test updateUnderlyingColumns method', () => {
        it('update the underlyingColumns based on positionType and Performance Column type', () => {
            expect(testBed.component.isUnderlyingColumnsUpdated).toBe(true);
            expect(testBed.component.underlyingColumnsOptions[0].values.length).toBe(40);
            testBed.component.optionValue.positionColumnType = 'Benchmark';
            testBed.component.optionValue.performanceColumnType = 'P&L';
            testBed.component.isUnderlyingColumnsUpdated = false;
            testBed.component.updateUnderlyingColumns();
            expect(testBed.component.isUnderlyingColumnsUpdated).toBe(true);
            expect(testBed.component.underlyingColumnsOptions[0].values.length).toBe(34);
        });
    });
});
