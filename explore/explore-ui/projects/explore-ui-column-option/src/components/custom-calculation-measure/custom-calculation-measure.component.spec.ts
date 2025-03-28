import {
    ColumnConfig,
    CoreTestUtils,
    CoreWidgetConfigStore,
    WidgetConfig,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {BehaviorSubject} from 'rxjs';
import {ColumnOptionInitializer} from '../../column-option.initializer';
import {CustomCalculationMeasureNodeColumnOption} from '../../models/column-option/custom-calculation-measure-node-column-option.model';
import {ColumnSet} from '../../models/column-set/column-set.model';
import * as riskExposureConfig from '../../test-utils/widget-configs/risk-and-exposure-widget.json';
import {CustomCalculationMeasureComponent} from './custom-calculation-measure.component';

describe('CustomCalculationMeasureComponent', () => {
    let customCalculationMeasureComponent: CustomCalculationMeasureComponent;
    const colConfig = new ColumnConfig({
        columnTag: 'market_val',
        positionColumnType: 'PORT',
        optionValues: [{
            measureNode: 'firstLevel',
            configType: CustomCalculationMeasureNodeColumnOption.CONFIG_TYPE
        }]
    });

    beforeAll(() => {
        ColumnOptionInitializer.initializeConfig();
        CoreTestUtils.initDefinitions();
        CoreWidgetConfigStore.currentWidgetConfigType$ = new BehaviorSubject(WidgetConfigType.RISK_EXPOSURE);
        CoreWidgetConfigStore.chartConfig.set(WidgetConfigType.RISK_EXPOSURE, new WidgetConfig(riskExposureConfig));
    });

    beforeEach(() => {
        customCalculationMeasureComponent = new CustomCalculationMeasureComponent();
        customCalculationMeasureComponent.columnMeasures = [colConfig];
        customCalculationMeasureComponent.widgetType = WidgetConfigType.RISK_EXPOSURE;
        customCalculationMeasureComponent.restrictedColumnOptions = {'sections': ['columnBreakdown', 'formatAndScaling', 'highlight', 'customColumnTitle']};
        customCalculationMeasureComponent.columnOptionsToAdd = [{
            columnOptionConfigType: 'customCalculationNodeType',
            columnOptionTitle: 'Formula Settings',
            columnOptionAttributes: [{
                title: 'Pick value from:',
                key: 'customCalculationNodeType',
                dataType: 'S'
            }]
        }];
    });

    describe('onInit Test', () => {
        it('tests component initialization', () => {
            customCalculationMeasureComponent.ngOnInit();

            expect(customCalculationMeasureComponent.widgetConfig).toBeTruthy();

            expect(customCalculationMeasureComponent.colSelectorWidgetInputs.size).toBe(1);
            expect(customCalculationMeasureComponent.colSelectorWidgetInputs.get('columns')).toBeTruthy();
            expect((customCalculationMeasureComponent.colSelectorWidgetInputs.get('columns') as ColumnSet).columns[0]).toEqual(colConfig);
            expect(customCalculationMeasureComponent.columnWidgetConfigInput).toBeTruthy();
            expect(customCalculationMeasureComponent.columnWidgetConfigInput.inputConfigType === 'columns').toBeTruthy();

            expect(customCalculationMeasureComponent.widgetConfig.customCalculationColumn.restrictedMeasureSelectionColumn
                .filter(filter => customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters.indexOf(filter) !== -1).length)
                .toBe(customCalculationMeasureComponent.widgetConfig.customCalculationColumn.restrictedMeasureSelectionColumn.length);

            // custom calculation is present
            expect(customCalculationMeasureComponent.restrictedColumnOptions).toEqual(customCalculationMeasureComponent.widgetConfig.customCalculationColumn.restrictedColumnOptions);
            expect(customCalculationMeasureComponent.columnOptionsToAdd[0]).toEqual(customCalculationMeasureComponent.widgetConfig.customCalculationColumn.measureNodeColumnOption);
        });

        it('tests component initialization - no custom calculation', () => {
            // custom calculation is absent
            customCalculationMeasureComponent.widgetConfig = undefined;
            customCalculationMeasureComponent.ngOnInit();
            expect(customCalculationMeasureComponent.restrictedColumnOptions).toBeDefined();
            expect(customCalculationMeasureComponent.columnOptionsToAdd).toBeDefined();
            expect(customCalculationMeasureComponent.columnOptionsToModify.size).toEqual(6);
        });

        it('should ignore compare to current option if not exists', () => {
            customCalculationMeasureComponent.ngOnInit();

            const columnOption1: any = {
                'columnOptionAttributes': [
                    {
                        'title': 'Date',
                        'key': 'overrideDate',
                        'dataType': 'S'
                    },
                    {
                        'title': 'Compare To Current',
                        'key': 'compareToCurrent',
                        'dataType': 'S'
                    }
                ],
                'columnOptionConfigType': 'overrideDateColumnOption',
                'columnOptionTitle': 'Date override',
                'columnOptionKey': 'overrideDateColumnOption'
            };
            customCalculationMeasureComponent.columnOptionsToModify.get('overrideDateColumnOption')(columnOption1);
            expect(columnOption1.columnOptionAttributes[0].isRestricted).toBe(true);
            expect(columnOption1.columnOptionAttributes[1].isRestricted).toBe(true);

            const columnOption2: any = {
                'columnOptionAttributes': [
                    {
                        'title': 'Date',
                        'key': 'overrideDate',
                        'dataType': 'S'
                    }
                ],
                'columnOptionConfigType': 'overrideDateColumnOption',
                'columnOptionTitle': 'Date override',
                'columnOptionKey': 'overrideDateColumnOption'
            };
            customCalculationMeasureComponent.columnOptionsToModify.get('overrideDateColumnOption')(columnOption2);
            expect(columnOption2.columnOptionAttributes[0].isRestricted).toBe(true);
        });

        it('tests setColumnFilters', () => {
            customCalculationMeasureComponent.ngOnInit();
            customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters = [
                {
                    type: '!=',
                    key: 'columnType',
                    value: ['FACTOR_ATTRIBUTES', 'custom_calc']
                },
                {
                    type: '!=',
                    key: 'columnReports',
                    value: ['prism_invisible', 'prism_custom_cal']
                }
            ];
            customCalculationMeasureComponent['setColumnFilters']();
            expect(customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters[1].value.includes('prism_custom_cal')).toBeFalsy();
            expect(customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters.includes(customCalculationMeasureComponent.widgetConfig.customCalculationColumn.restrictedMeasureSelectionColumn));
        });

        it('tests setColumnFilters for multiple reports in customCalcColumnReports', () => {
            customCalculationMeasureComponent.ngOnInit();
            customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters = [
                {
                    type: '!=',
                    key: 'columnType',
                    value: ['FACTOR_ATTRIBUTES', 'custom_calc']
                },
                {
                    type: '!=',
                    key: 'columnReports',
                    value: ['prism_invisible', 'prism_custom_cal', 'sample_1', 'sample_2', 'sample_3', 'sample_4', 'sample_5']
                }
            ];
            customCalculationMeasureComponent.widgetConfig.customCalculationColumn['customCalcColumnReports'] = ['prism_custom_cal', 'sample_2', 'sample_5'];
            customCalculationMeasureComponent['setColumnFilters']();
            expect(customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters[1].value.length).toBe(4);
            expect(customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters.includes(customCalculationMeasureComponent.widgetConfig.customCalculationColumn.restrictedMeasureSelectionColumn));
        });

        it('tests setColumnFilters for empty customCalReports', () => {
            customCalculationMeasureComponent.ngOnInit();
            customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters = [
                {
                    type: '!=',
                    key: 'columnType',
                    value: ['FACTOR_ATTRIBUTES', 'custom_calc']
                },
                {
                    type: '!=',
                    key: 'columnReports',
                    value: ['prism_invisible', 'prism_custom_cal', 'sample_1', 'sample_2', 'sample_3', 'sample_4', 'sample_5']
                }
            ];
            customCalculationMeasureComponent.widgetConfig.customCalculationColumn['customCalcColumnReports'] = [];
            customCalculationMeasureComponent['setColumnFilters']();
            expect(customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters[1].value.length).toBe(7);
            expect(customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters.includes(customCalculationMeasureComponent.widgetConfig.customCalculationColumn.restrictedMeasureSelectionColumn));
        });

        it('tests setColumnFilters for multiple reports in columnReports', () => {
            customCalculationMeasureComponent.ngOnInit();
            customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters = [
                {
                    type: '!=',
                    key: 'columnType',
                    value: ['FACTOR_ATTRIBUTES', 'custom_calc']
                },
                {
                    type: '!=',
                    key: 'columnReports',
                    value: []
                }
            ];
            customCalculationMeasureComponent.widgetConfig.customCalculationColumn['customCalcColumnReports'] = ['prism_custom_cal', 'sample_2', 'sample_5'];
            customCalculationMeasureComponent['setColumnFilters']();
            expect(customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters[1].value.length).toBe(0);
            expect(customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters.includes(customCalculationMeasureComponent.widgetConfig.customCalculationColumn.restrictedMeasureSelectionColumn));
        });

        it('should filter dataType and isSubtotalable from columnFilters so that non-numerical columns can show up in the chart widgets', () => {
            customCalculationMeasureComponent.ngOnInit();

            customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters = [
                {
                    'type': '=',
                    'key': 'reportTypes',
                    'value': 'SINGLE'
                },
                {
                    'type': '=',
                    'key': 'dataType',
                    'value': [
                        'TIME_SPAN',
                        'INT',
                        'DOUBLE'
                    ]
                },
                {
                    'type': '=',
                    'key': 'isSubtotalable',
                    'value': true
                },
                {
                    'type': '!=',
                    'key': 'columnType',
                    'value': 'FACTOR_ATTRIBUTES'
                },
                {
                    'type': '!=',
                    'key': 'groups',
                    'value': [
                        'Factor-Based',
                        'Scenario',
                        'GP Breakdown',
                        'Liquidity'
                    ]
                },
                {
                    'type': '!=',
                    'key': 'uses',
                    'value': 'Excess'
                },
                {
                    'type': '!=',
                    'key': 'columnReports',
                    'value': [
                        'prism_invisible',
                        'prism_custom_cal',
                        'explore_filter'
                    ]
                }
            ];
            customCalculationMeasureComponent['setColumnFilters']();

            expect(customCalculationMeasureComponent.columnWidgetConfigInput.columnFilters).toEqual([
                {
                    'type': '=',
                    'key': 'reportTypes',
                    'value': 'SINGLE'
                },
                {
                    'type': '!=',
                    'key': 'columnType',
                    'value': 'FACTOR_ATTRIBUTES'
                },
                {
                    'type': '!=',
                    'key': 'groups',
                    'value': [
                        'Factor-Based',
                        'Scenario',
                        'GP Breakdown',
                        'Liquidity'
                    ]
                },
                {
                    'type': '!=',
                    'key': 'uses',
                    'value': 'Excess'
                },
                {
                    'type': '!=',
                    'key': 'columnReports',
                    'value': [
                        'prism_invisible',
                        'explore_filter'
                    ]
                },
                {
                    'type': '!=',
                    'key': 'columnTag',
                    'value': ['custom_calc', 'pgs_custom_calc', 'custom_coverage']
                },
                {
                    'type': '!=',
                    'key': 'dataType',
                    'value': [
                        'TIME_SPAN'
                    ]
                },
                {
                    'type': '!=',
                    'key': 'isNotSupportedInCustomCal',
                    'value': true
                }
            ]);
        });
    });
});
