import {
    AbstractColumnOption,
    ColumnOptionFactory,
    CoreWidgetConfigStore,
    RestrictedOption,
    RestrictedOptionInterface,
    RestrictedSections
} from '@blk/explore-ui-core';
import {RiskSettings} from '@blk/explore-ui-risk';
import {each} from 'lodash';
import {ColumnOptionInitializer} from '../column-option.initializer';
import {ActiveType} from '../enums';
import {ActiveCalculationColumnOption} from '../models/column-option/active-calculation-column-option.model';
import {AggregationColumnOption} from '../models/column-option/aggregation-column-option.model';
import {BookColumnOption} from '../models/column-option/book-column-option.model';
import * as returnsWidget from '../test-utils/widget-configs/return-analysis-widget.json';

describe('Column Option Model abstract-favorite-config.model.spec.tsFactory Test', () => {

    beforeAll(() => {
        ColumnOptionInitializer.registerColumnOptionTypes();
    });

    /**
     * Test case for method getRestrictedColumnOptions
     */
    it('Test getRestrictedColumnOptions', () => {
        CoreWidgetConfigStore.chartConfig.set('returnsWidget', returnsWidget);
        const expectedRestrictedColumnOptions: any = {
            sections: ['columnBreakdown', 'aggregation'],
            options: [Object({section: 'performanceSettings', options: ['TIME-PERIOD', 'AS-REPORTED']})]
        };
        expect(JSON.stringify(ColumnOptionFactory.getRestrictedColumnOptions('returnsWidget')) === JSON.stringify(expectedRestrictedColumnOptions)).toBe(true);
    });

    describe('getFilteredColumnOptions', () => {
        let getRestrictedColumnOptionsSpy;
        const configType = 'my-config';
        const restrictedSectionsMock: RestrictedSections = ['columnBreakdown', 'aggregation'];
        const restrictedOptionsMock: RestrictedOption[] = [
            {
                'section': 'performanceSettings',
                'options': ['TIME-PERIOD', 'AS-REPORTED']
            }
        ];
        const columnOptionPerformanceSettingsMock = {
            columnOptionKey: 'performanceSettings',
            columnOptionTitle: 'Performance Settings',
            columnOptionAttributes: [
                {
                    title: 'Time Period',
                    key: 'TIME-PERIOD',
                    dataType: 'S'
                },
                {
                    title: 'As Reported',
                    key: 'AS-REPORTED',
                    dataType: 'B'
                },
                {
                    title: 'Excess Settings',
                    key: 'EXCESS-SETTINGS',
                    dataType: 'S'
                },
                {
                    title: 'Attribution Settings',
                    key: 'ATTRIBUTION-SETTINGS',
                    dataType: 'S'
                }
            ],
            columnOptionConfigType: 'performanceSettings'
        };
        const columnOptionAggregationMock = {
            columnOptionKey: 'aggregation',
            columnOptionTitle: 'Aggregation',
            columnOptionAttributes: [{
                title: 'Type',
                defaultValue: {value: 2, label: 'Sum'},
                key: 'aggregationType',
                values: [
                    {
                        value: 3,
                        label: 'Spread Duration * Notional/Spread Duration * Notional'
                    },
                    {
                        value: 2,
                        label: 'Sum'
                    },
                    {
                        value: 14,
                        label: 'Market Value/Market Value, null value excluded'
                    },
                    {
                        value: 2100, label: 'Unique Value'
                    },
                    {
                        value: 10, label: 'Average'
                    },
                    {
                        value: 12,
                        label: 'Absolute Sum'
                    },
                    {
                        value: 5, label: 'Par Value/Par Value'
                    },
                    {
                        value: 15, label: 'Par Val/Par Val Ignore Zero'
                    },
                    {
                        value: 44,
                        label: 'Wt Avg Hmean'
                    },
                    {
                        value: 56, label: 'Market Value Percent Subtotaller'
                    },
                    {
                        value: 115, label: 'Par Val/Par Val Absolute Weight'
                    },
                    {
                        value: 16,
                        label: 'Harmonic Mean'
                    },
                    {
                        value: 43, label: 'Median'
                    },
                    {
                        value: 42, label: 'Min'
                    },
                    {
                        value: 55,
                        label: 'Absolute MV by MV Subtotaller'
                    },
                    {
                        value: 57, label: 'Absolute MV by Absolute MV Subtotaller'
                    },
                    {
                        value: 205,
                        label: 'Par Value/Par Value, with Title Traded'
                    },
                    {
                        value: 2300, label: 'Wt Avg'
                    },
                    {
                        value: 4, label: 'Market Value/Market Value'
                    },
                    {
                        value: 41,
                        label: 'Max'
                    },
                    {
                        value: 1, label: 'Notional Market Value/Market Value'
                    },
                    {
                        value: 0, label: 'None'
                    },
                    {
                        value: 59,
                        label: 'Absolute Notional MV by MV Subtotaller'
                    },
                    {
                        value: 58, label: 'Absolute Notional MV by Portfolio MV Subtotaller'
                    }],
                dataType: 'S'
            }],
            columnOptionConfigType: 'aggregation'
        };

        beforeEach(() => {
            // jest.spyOn(WidgetConfigFactory, 'getInputsForWidgetConfigType').mockImplementationOnce(() => []);
            // jest.spyOn(WidgetConfigFactory, 'getChartConfigForType').mockImplementationOnce(() => ({title: 'title'} as WidgetConfig));
            getRestrictedColumnOptionsSpy = jest.spyOn(ColumnOptionFactory, 'getRestrictedColumnOptions');
        });

        afterEach(() => {
            getRestrictedColumnOptionsSpy.mockClear();
        });

        it('should get restricted options', () => {
            // Arrange - act
            getRestrictedColumnOptionsSpy.mockImplementationOnce(() => {
            });
            ColumnOptionFactory.getFilteredColumnOptions(configType, [columnOptionPerformanceSettingsMock]);

            // Assert
            expect(getRestrictedColumnOptionsSpy).toHaveBeenCalledWith(configType);
        });

        it('should use passed on restricted options', () => {
            // Arrange - act
            getRestrictedColumnOptionsSpy.mockImplementationOnce(() => {
            });
            ColumnOptionFactory.getFilteredColumnOptions(configType, [columnOptionPerformanceSettingsMock], {
                options: restrictedOptionsMock,
                sections: restrictedSectionsMock
            });

            // Assert
            expect(getRestrictedColumnOptionsSpy).toHaveBeenCalledTimes(0);
        });

        it('should return back column options as it is, if config type and restrictedOptions are undefined', () => {
            const columnOptions = [columnOptionPerformanceSettingsMock];
            expect(ColumnOptionFactory.getFilteredColumnOptions(undefined, columnOptions) === columnOptions).toBeTruthy();
        });

        it('should filter based on restrictedOptions sections', () => {
            // Arrange
            const restrictedColumnOptionMock: RestrictedOptionInterface = {
                sections: restrictedSectionsMock
            };
            getRestrictedColumnOptionsSpy.mockImplementationOnce(() => restrictedColumnOptionMock);

            // Act
            const filteredColumnOptions = ColumnOptionFactory.getFilteredColumnOptions(configType, [columnOptionPerformanceSettingsMock, columnOptionAggregationMock]);

            // Assert
            expect(filteredColumnOptions).toEqual([columnOptionPerformanceSettingsMock]);
        });

        it('should filter based on restrictedOptions options', () => {
            // Arrange
            const restrictedColumnOptionMock: RestrictedOptionInterface = {
                sections: [],
                options: restrictedOptionsMock
            };
            getRestrictedColumnOptionsSpy.mockImplementationOnce(() => restrictedColumnOptionMock);
            const expectedColumnOptionPerformanceSettingsMock = {...columnOptionPerformanceSettingsMock};
            expectedColumnOptionPerformanceSettingsMock.columnOptionAttributes.slice(2);

            // Act
            const filteredColumnOptions = ColumnOptionFactory.getFilteredColumnOptions(configType, [columnOptionPerformanceSettingsMock, columnOptionAggregationMock]);

            // Assert
            expect(filteredColumnOptions).toEqual([expectedColumnOptionPerformanceSettingsMock, columnOptionAggregationMock]);
        });

        it('should filter out options with empty columnOptionAttributes', () => {
            // Arrange
            const restrictedColumnOptionMock: RestrictedOptionInterface = {
                sections: [],
                options: []
            };
            getRestrictedColumnOptionsSpy.mockImplementationOnce(() => restrictedColumnOptionMock);

            // Act
            const filteredColumnOptions = ColumnOptionFactory.getFilteredColumnOptions(configType, [
                {...columnOptionPerformanceSettingsMock, columnOptionAttributes: []},
                {...columnOptionAggregationMock, columnOptionAttributes: []}
            ]);

            // Assert
            expect(filteredColumnOptions).toEqual([]);
        });
    });

    it('createNewModel - No Settings', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(ActiveCalculationColumnOption.CONFIG_TYPE);
        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model instanceof ActiveCalculationColumnOption).toBeTruthy();
        const activeCalcModel: ActiveCalculationColumnOption = model as ActiveCalculationColumnOption;
        expect(activeCalcModel.activeType).toBe(ActiveType[ActiveType.DIFF_1MINUS2]);
    });

    it('createNewModel - With Settings', () => {
        const settings: any = {
            columnOptionAttributes: [{
                title: 'Book Type',
                key: 'accountingConvention',
                dataType: 'S',
                defaultValue: {label: 'accountingConvention', value: 'TAX'}
            }, {
                key: 'bookFxConversion',
                title: 'Enable BookFX Conversion',
                dataType: 'B',
                defaultValue: {label: 'bookFxConversion', value: true}
            }]
        };
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(BookColumnOption.CONFIG_TYPE, settings);

        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model instanceof BookColumnOption).toBeTruthy();
        const bookModel: BookColumnOption = model as BookColumnOption;
        expect(bookModel.accountingConvention).toBe('TAX');
    });

    it('createModel - invalid key', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createModel('BLAH', undefined);
        expect(model).toBeUndefined();
    });

    it('createModel - valid key', () => {
        const model = ColumnOptionFactory.createModel(BookColumnOption.CONFIG_TYPE, undefined);
        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model instanceof BookColumnOption).toBeTruthy();
    });

    it('createModel - Legacy risk settings', () => {
        const model = ColumnOptionFactory.createModel(RiskSettings.LEGACY_CONFIG_TYPE, undefined);
        expect(model).toBeDefined();
        expect(model instanceof RiskSettings).toBeTruthy();
    });

    it('createModels - Legacy Style', () => {
        const options: any = {
            accountingConvention: 'WSTO',
            aggregationType: 4
        };
        validateModels(options);
    });

    it('createModels - New Style', () => {
        const options: any = {
            bookColumnOptions: {
                configType: 'bookColumnOptions',
                accountingConvention: 'WSTO'
            },
            aggregation: {
                configType: 'aggregation',
                aggregationType: 4
            }
        };
        validateModels(options);
    });

    it('createModels - Mixed Style', () => {
        const options: any = {
            accountingConvention: 'TAX',
            aggregationType: 4,
            bookColumnOptions: {
                configType: 'bookColumnOptions',
                accountingConvention: 'WSTO'
            }
        };
        validateModels(options);
    });

    it('createModels -Options as Array not map Style', () => {
        const options: any[] = [
            {
                configType: 'bookColumnOptions',
                accountingConvention: 'WSTO'
            },
            {
                configType: 'aggregation',
                aggregationType: 4
            }
        ];
        validateModels(options);
    });

    /**
     * Validates the options passed in against what is expected.
     */
    function validateModels(options: any): void {
        const models: AbstractColumnOption[] = ColumnOptionFactory.createModels(options);
        expect(models).toBeDefined();
        expect(models).not.toBeNull();

        expect(models.length).toBe(2);

        each(models, function (model: AbstractColumnOption) {
            if (model.configType === BookColumnOption.CONFIG_TYPE) {
                expect(model instanceof BookColumnOption).toBeTruthy();
                const bookModel: BookColumnOption = model as BookColumnOption;
                expect(bookModel.accountingConvention).toBe('WSTO');
            } else if (model.configType === AggregationColumnOption.CONFIG_TYPE) {
                expect(model instanceof AggregationColumnOption).toBeTruthy();
                const aggModel: AggregationColumnOption = model as AggregationColumnOption;
                expect(aggModel.value).toBe(4);
            } else {
                fail();
            }
        });
    }

    // Test addRequestParams
    it('createModels for mixedLegacyColumnOptionFavorite', () => {
        const optionValues = {
            performanceSettings: {
                timePeriod: {
                    numberOfPeriods: 2,
                    shortName: 'MTD',
                    timePeriodName: '2 Months to Date'
                },
                attributionSettings: {},
                configType: 'performanceSettings'
            },
            customPivotPoint: 'TWO_YEAR',
            'AS-REPORTED': true
        };

        const options: AbstractColumnOption[] = ColumnOptionFactory.createModels(optionValues);
        const performanceSettings = options[0] as PerformanceSettings;
        expect(performanceSettings.timePeriod.numberOfPeriods).toBe(2);
        expect(performanceSettings.timePeriod.shortName).toBe('MTD');
        expect(performanceSettings.timePeriod.timePeriodName).toBe('2 Months to Date');
        expect(performanceSettings.additionalSettings.customPivotPoint).toBe('TWO_YEAR');
        expect(performanceSettings.additionalSettings.asReported).toBe(true);
    });
});
