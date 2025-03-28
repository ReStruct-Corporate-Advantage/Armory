import {ColumnBreakdownColumnOptionComponent} from './column-breakdown-column-option.component';
import {
    Breakdown,
    BreakdownFavoriteConstants,
    ColumnBreakdown,
    ColumnSector,
    CustomSector
} from '@blk/explore-ui-breakdown';
import {ColumnOptionTestBed, LibColumnUtils} from '@blk/explore-ui-column-option';
import {
    ColumnConfig,
    ColumnDefinition,
    CoreWidgetConfigStore,
    ExploreCheckbox, ExploreSelectOptionGroup,
    PortfolioRiskColumnCategoryDefinition
} from '@blk/explore-ui-core';

describe('ColumnBreakdownColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<ColumnBreakdownColumnOptionComponent, ColumnBreakdown>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Column-level breakdown',
            columnOptionAttributes: [
                {
                    title: 'Column Breakdown',
                    key: 'columnBreakdown',
                    dataType: 'S',
                    values: [
                        {
                            value: true,
                            label: 'hasSectorBreakdown'
                        },
                        {
                            value: true,
                            label: 'hasFactorBreakdown'
                        }
                    ]
                }
            ],
            columnOptionConfigType: 'columnBreakdown',
            columnOptionKey: 'columnBreakdown'
        };

        const dummyInputs = {
            inputCategories: [
                {
                    categoryType: 'breakdown',
                    categoryTitle: 'Breakdown',
                    noAccordion: true,
                    inputs: [
                        {
                            inputConfigType: 'breakdownTree',
                            inputName: 'breakdownTree',
                            inputTitle: 'Sector Breakdown',
                            mandateSettingType: 'BREAKDOWN',
                            groupByColumnFilters: [
                                {
                                    type: '=',
                                    key: 'isGroupable',
                                    value: true
                                },
                                {
                                    type: '!=',
                                    key: 'praadaBreakdown',
                                    value: true
                                },
                                {
                                    type: '!=',
                                    key: 'columnTag',
                                    value: 'portfolio_group'
                                },
                                {
                                    type: '!=',
                                    key: 'columnType',
                                    value: ['FACTOR_ATTRIBUTES', 'GR_SECTOR']
                                },
                                {
                                    type: '!=',
                                    key: 'uses',
                                    value: ['BENCH', 'ACTIVE']
                                },
                                {
                                    type: '!=',
                                    key: 'groups',
                                    value: ['Liquidity']
                                }
                            ],
                            EATBreakdownFilter: [
                                {
                                    type: '=',
                                    key: 'isEATBreakdownDefinition',
                                    value: true
                                }
                            ],
                            customColumnFilters: [
                                {
                                    type: '=',
                                    key: 'isGroupable',
                                    value: true
                                },
                                {
                                    type: '!=',
                                    key: 'praadaBreakdown',
                                    value: true
                                },
                                {
                                    type: '!=',
                                    key: 'columnType',
                                    value: ['FACTOR_ATTRIBUTES']
                                },
                                {
                                    type: '!=',
                                    key: 'uses',
                                    value: ['BENCH', 'ACTIVE']
                                },
                                {
                                    type: '!=',
                                    key: 'groups',
                                    value: ['Liquidity']
                                },
                                {
                                    type: '=',
                                    key: 'levelColumns',
                                    value: 'undefined'
                                },
                                {
                                    type: '!=',
                                    key: 'columnTag',
                                    value: 'portfolio_group'
                                }
                            ],
                            valueField: 'columnTag',
                            max: 5,
                            default: {
                                breakdown: {
                                    breakdownTitle: 'Security Group',
                                    subSectors: [
                                        {
                                            breakdownRuleType: 'String',
                                            useNoneBuckets: true,
                                            groupByColumn: {
                                                columnTag: 'sec_group',
                                                columnName: 'Security Group',
                                                positionColumnType: 'ALL'
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            inputConfigType: 'breakdownTree',
                            inputTitle: 'Factor Breakdown',
                            inputName: 'riskFactorBreakdown',
                            mandateSettingType: 'FAC_BKD',
                            noAccordion: true,
                            groupByColumnFilters: [
                                {
                                    type: '=',
                                    key: 'isGroupable',
                                    value: true
                                },
                                {
                                    type: '=',
                                    key: 'columnType',
                                    value: ['FACTOR_ATTRIBUTES']
                                },
                                {
                                    type: '=',
                                    key: 'columnReports',
                                    value: ['prism_var_sectors', 'prism_var_factors', 'factor_attrib_dd']
                                }
                            ],
                            customColumnFilters: [
                                {
                                    type: '=',
                                    key: 'isGroupable',
                                    value: true
                                },
                                {
                                    type: '=',
                                    key: 'columnType',
                                    value: ['FACTOR_ATTRIBUTES']
                                },
                                {
                                    type: '=',
                                    key: 'columnReports',
                                    value: ['prism_var_sectors', 'prism_var_factors']
                                }
                            ],
                            valueField: 'field',
                            default: {
                                breakdown: {
                                    breakdownTitle: '',
                                    subSectors: [
                                        {
                                            breakdownRuleType: 'String',
                                            useNoneBuckets: true,
                                            groupByColumn: {
                                                columnTag: 'BRS_GOLD_5',
                                                columnName: 'BRS Standard Factor Tree Level 1',
                                                positionColumnType: 'ALL',
                                                dataType: 'STRING'
                                            },
                                            subSectors: [
                                                {
                                                    breakdownRuleType: 'String',
                                                    useNoneBuckets: true,
                                                    groupByColumn: {
                                                        columnTag: 'BRS_GOLD_4',
                                                        columnName: 'BRS Standard Factor Tree Level 2',
                                                        positionColumnType: 'ALL',
                                                        dataType: 'STRING'
                                                    },
                                                    subSectors: [
                                                        {
                                                            breakdownRuleType: 'String',
                                                            useNoneBuckets: true,
                                                            groupByColumn: {
                                                                columnTag: 'BRS_GOLD_3',
                                                                columnName: 'BRS Standard Factor Tree Level 3',
                                                                positionColumnType: 'ALL',
                                                                dataType: 'STRING'
                                                            },
                                                            subSectors: [
                                                                {
                                                                    breakdownRuleType: 'String',
                                                                    useNoneBuckets: true,
                                                                    groupByColumn: {
                                                                        columnTag: 'BRS_GOLD_2',
                                                                        columnName: 'BRS Standard Factor Tree Level 4',
                                                                        positionColumnType: 'ALL',
                                                                        dataType: 'STRING'
                                                                    },
                                                                    subSectors: [
                                                                        {
                                                                            breakdownRuleType: 'String',
                                                                            useNoneBuckets: true,
                                                                            groupByColumn: {
                                                                                columnTag: 'BRS_GOLD_1',
                                                                                columnName: 'BRS Standard Factor Tree Level 5',
                                                                                positionColumnType: 'ALL',
                                                                                dataType: 'STRING'
                                                                            }
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            ]
        };
        jest.spyOn(CoreWidgetConfigStore, 'getChartConfigForType').mockReturnValue(dummyInputs);

        const colDefSpy = jest.spyOn(LibColumnUtils, 'getColumnDefinition');
        colDefSpy.mockReturnValue(getRiskContributionColumnDef());

        // Create a dummy column breakdown
        const dummyColumnBreakdown = new ColumnBreakdown();
        const dummySecGroupSector = new ColumnSector();
        dummySecGroupSector.columnTag = 'sec_group';
        dummySecGroupSector.columnName = 'Security Group';
        dummySecGroupSector.positionColumnType = 'ALL';
        const dummyBreakdown = new Breakdown();
        dummyBreakdown.addChild(dummySecGroupSector);
        dummyColumnBreakdown.breakdown = dummyBreakdown;

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<ColumnBreakdownColumnOptionComponent, ColumnBreakdown>(
            ColumnBreakdownColumnOptionComponent,
            dummyColumnBreakdown,
            mockedOption,
            [],
            'rfv_contrib_port',
            'PORT',
            getRiskContributionColumn()
        );
    });

    it('Test init of component', () => {
        expect(testBed.component.favoriteType).toEqual(BreakdownFavoriteConstants.BREAKDOWN);
        expect(testBed.component.hideCheckboxData.length).toEqual(3);
    });

    it('Test createBreakdownTypeOptions', () => {
        let breakdownTypeOptions = testBed.component.createBreakdownTypeOptions();
        expect(breakdownTypeOptions[0].values.length).toEqual(2);
        expect(breakdownTypeOptions[0].values[0].value).toEqual(BreakdownFavoriteConstants.BREAKDOWN);
        expect(breakdownTypeOptions[0].values[0].isSelected).toBeTruthy();
        expect(breakdownTypeOptions[0].values[1].value).toEqual(BreakdownFavoriteConstants.FACTOR_BREAKDOWN);
        expect(breakdownTypeOptions[0].values[1].isSelected).toBeFalsy();
        expect(testBed.component.supportsMultipleTypes).toBeTruthy();
        testBed.component.favoriteType = BreakdownFavoriteConstants.FACTOR_BREAKDOWN;
        breakdownTypeOptions = testBed.component.createBreakdownTypeOptions();
        expect(breakdownTypeOptions[0].values.length).toEqual(2);
        expect(breakdownTypeOptions[0].values[0].value).toEqual(BreakdownFavoriteConstants.BREAKDOWN);
        expect(breakdownTypeOptions[0].values[0].isSelected).toBeFalsy();
        expect(breakdownTypeOptions[0].values[1].value).toEqual(BreakdownFavoriteConstants.FACTOR_BREAKDOWN);
        expect(breakdownTypeOptions[0].values[1].isSelected).toBeTruthy();
        expect(testBed.component.supportsMultipleTypes).toBeTruthy();
    });

    it('Test createBreakdownBuilderSettings', () => {
        testBed.component.updateBreakdownBuilderSettings();
        expect(testBed.component.breakdownBuilderSettings.inputName).toEqual('');
        expect(testBed.component.breakdownBuilderSettings.fieldToUse).toEqual('columnTag');
        expect(testBed.component.breakdownBuilderSettings.columnFilter.length).toEqual(6);
        expect(testBed.component.breakdownBuilderSettings.quickColumnFilter.length).toEqual(5);
        expect(testBed.component.breakdownBuilderSettings.customSectorColumnFilter.length).toEqual(7);
    });

    it('Test updateBreakdownBuilderSettings() for Exposure Columns', () => {
        testBed.component.column = getExposureColumn();
        jest.spyOn(LibColumnUtils, 'getColumnDefinition').mockReturnValue(getExposureColumnDef());

       testBed.component.updateBreakdownBuilderSettings();
        expect(testBed.component.breakdownBuilderSettings.inputName).toEqual('');
        expect(testBed.component.breakdownBuilderSettings.fieldToUse).toEqual('columnTag');
        expect(testBed.component.breakdownBuilderSettings.columnFilter.length).toEqual(1);
        expect(testBed.component.breakdownBuilderSettings.columnFilter[0].key).toEqual('isEATBreakdownDefinition');
        expect(testBed.component.breakdownBuilderSettings.quickColumnFilter.length).toEqual(1);
        expect(testBed.component.breakdownBuilderSettings.customSectorColumnFilter.length).toEqual(1);
    });

    function getExposureColumn(): ColumnConfig {
        const serializedColumn = {
            columnTag: 'port_exp',
            columnKey: 'port_exp_1',
            positionColumnType: 'PORT',
            optionValues: [
                {
                    aggregationType: 2,
                    configType: 'aggregation'
                },
                {
                    decimalPlaces: 1,
                    useThousandsSeparator: true,
                    scaling: 0.01,
                    configType: 'numericColumnFormatColumnOption'
                },
                {
                    breakdownLevel: 1,
                    portfolioGroupLevel: 1,
                    isGroupByPortBenchActive: false,
                    isFullPortfolioName: false,
                    isColumnBreakdownNormalize: false,
                    breakdownHideTotal: false,
                    breakdownHideOther: false,
                    breakdown: {
                        children: [],
                        isMandateDefaultBreakdown: false,
                        isConfigured: false
                    },
                    isFactorBreakdown: true,
                    configType: 'columnBreakdown'
                }
            ]
        };
        return new ColumnConfig(serializedColumn);
    }

    function getExposureColumnDef(): ColumnDefinition {
        return new ColumnDefinition({
            columnTag: 'port_exp',
            field: 'port_exp',
            title: 'Factor Exposure',
            uses: 'PORT',
            isSubtotalable: true,
            reportTypes: ['SINGLE', 'TREND'],
            columnReports: ['prism_dataagg', 'prism_all'],
            dataType: 'DOUBLE',
            columnType: 'RISK',
            isNotSupportedInCustomCal: false,
            groups: ['Portfolio Risk'],
            isGroupable: true,
            isVisible: true,
            isStaticColumn: false,
            columnDesc: '',
            functionFlag: 1,
            strippedName: 'Factor Exposure',
            isRASColumn: false,
            isEATBreakdownDefinition: false,
            columnFormat: {
                scalingOptions: {},
                decimalPlaces: 2,
                isUseThousandsSeparator: true,
                isScalable: true,
                scalingFactor: 1
            }
        });
    }

    it('Test updateBreakdownBuilderSettings() for RAS Columns', () => {
        testBed.component.isRASColumn = true;
        testBed.component.favoriteType = BreakdownFavoriteConstants.FACTOR_BREAKDOWN;

        testBed.component.updateBreakdownBuilderSettings();
        expect(testBed.component.breakdownBuilderSettings.inputName).toEqual('riskFactorBreakdown');
        expect(testBed.component.hideCheckboxData[0].disabled).toEqual(false);
        expect(testBed.component.hideCheckboxData[1].disabled).toEqual(false);
        expect(testBed.component.hideCheckboxData[2].disabled).toEqual(false);
        expect(testBed.component.showGroupByPortBenchActiveBreakdownOption).toEqual(false);

        testBed.component.favoriteType = BreakdownFavoriteConstants.BREAKDOWN;

        testBed.component.updateBreakdownBuilderSettings();
        expect(testBed.component.breakdownBuilderSettings.inputName).toEqual('');
        expect(testBed.component.hideCheckboxData[0].disabled).toEqual(false);
        expect(testBed.component.hideCheckboxData[1].disabled).toEqual(false);
        expect(testBed.component.hideCheckboxData[2].disabled).toEqual(false);
        expect(testBed.component.showGroupByPortBenchActiveBreakdownOption).toEqual(false);
    });

    describe('Test determineNormalizeOptionVisibility', () => {
        it('Test determineNormalizeOptionVisibility with empty breakdown', () => {
            jest.spyOn(testBed.component, 'resetColumnBreakdownOptions');
            const emptyBreakdown = new Breakdown();
            testBed.component.determineNormalizeOptionVisibility(emptyBreakdown);
            expect(testBed.component.resetColumnBreakdownOptions).toHaveBeenCalled();
        });

        it('Test determineNormalizeOptionVisibility with security group breakdown', () => {
            // Create a dummy column sector of Security Group
            const dummySecGroupSector = new ColumnSector();
            dummySecGroupSector.columnTag = 'sec_group';
            dummySecGroupSector.columnName = 'Security Group';
            dummySecGroupSector.positionColumnType = 'ALL';
            const dummyBreakdown = new Breakdown();
            dummyBreakdown.addChild(dummySecGroupSector);
            testBed.component.determineNormalizeOptionVisibility(dummyBreakdown);
            expect(testBed.component.showNormalizeBreakdownOption).toBeFalsy();
            expect(testBed.component.showFullPortfolioNameBreakdownOption).toBeFalsy();
            expect(testBed.component.showGroupByPortBenchActiveBreakdownOption).toBeTruthy();
        });

        it('Test determineNormalizeOptionVisibility with custom sector breakdown', () => {
            jest.spyOn(testBed.component, 'resetColumnBreakdownOptions');
            // Create a dummy custom sector
            testBed.component.showGroupByPortBenchActiveBreakdownOption = false;
            testBed.component.optionValue.isGroupByPortBenchActive = false;
            const dummyCustomSector = new CustomSector();
            const dummyBreakdown = new Breakdown();
            dummyBreakdown.addChild(dummyCustomSector);
            testBed.component.determineNormalizeOptionVisibility(dummyBreakdown);
            expect(testBed.component.showGroupByPortBenchActiveBreakdownOption).toBeTruthy();
            expect(testBed.component.optionValue.isGroupByPortBenchActive).toBeFalsy();
            expect(testBed.component.resetColumnBreakdownOptions).toHaveBeenCalledWith(false);
            testBed.component.showGroupByPortBenchActiveBreakdownOption = true;
            testBed.component.optionValue.isGroupByPortBenchActive = true;
            testBed.component.determineNormalizeOptionVisibility(dummyBreakdown);
            expect(testBed.component.showGroupByPortBenchActiveBreakdownOption).toBeTruthy();
            expect(testBed.component.optionValue.isGroupByPortBenchActive).toBeTruthy();
        });

        it('Test determineNormalizeOptionVisibility with portfolio name breakdown', () => {
            testBed.component.column = getMarketValPercentColumn();
            jest.spyOn(LibColumnUtils, 'getColumnDefinition').mockReturnValue(getMarketValPercentColumnDef());

            // Create a dummy column sector of Portfolio Name
            const dummyPortNameSector = new ColumnSector();
            dummyPortNameSector.columnTag = 'portfolio_name';
            dummyPortNameSector.columnName = 'Portfolio Name';
            dummyPortNameSector.positionColumnType = 'ALL';
            const dummyBreakdown = new Breakdown();
            dummyBreakdown.addChild(dummyPortNameSector);
            testBed.component.determineNormalizeOptionVisibility(dummyBreakdown);
            expect(testBed.component.showNormalizeBreakdownOption).toBeTruthy();
            expect(testBed.component.showFullPortfolioNameBreakdownOption).toBeTruthy();
            expect(testBed.component.showGroupByPortBenchActiveBreakdownOption).toBeTruthy();
        });
    });

    it('Test resetColumnBreakdownOptions', () => {
        // Set everything to be true
        testBed.component.showGroupByPortBenchActiveBreakdownOption = true;
        testBed.component.optionValue.isGroupByPortBenchActive = true;
        testBed.component.showFullPortfolioNameBreakdownOption = true;
        testBed.component.optionValue.isFullPortfolioName = true;
        testBed.component.showNormalizeBreakdownOption = true;
        testBed.component.optionValue.isColumnBreakdownNormalize = true;
        testBed.component.isPortGroupBreakdown = true;

        testBed.component.optionValue.breakdownLevel = 5;
        testBed.component.optionValue.breakdownHideTotal = true;
        testBed.component.optionValue.breakdownHideOther = true;

        testBed.component.resetColumnBreakdownOptions(false);
        expect(testBed.component.showGroupByPortBenchActiveBreakdownOption).toBeTruthy();
        expect(testBed.component.optionValue.isGroupByPortBenchActive).toBeTruthy();
        expect(testBed.component.showFullPortfolioNameBreakdownOption).toBeFalsy();
        expect(testBed.component.optionValue.isFullPortfolioName).toBeFalsy();
        expect(testBed.component.showNormalizeBreakdownOption).toBeFalsy();
        expect(testBed.component.optionValue.isColumnBreakdownNormalize).toBeFalsy();
        expect(testBed.component.isPortGroupBreakdown).toBeFalsy();
        // Breakdown level and breakdown hide options should still remain intact
        expect(testBed.component.optionValue.breakdownLevel).toEqual(5);
        expect(testBed.component.optionValue.breakdownHideTotal).toBeTruthy();
        expect(testBed.component.optionValue.breakdownHideOther).toBeTruthy();

        // Pass in resetAll flag as true
        testBed.component.resetColumnBreakdownOptions(true);
        // Breakdown level and breakdown hide options should be reset
        expect(testBed.component.optionValue.breakdownLevel).toEqual(1);
        expect(testBed.component.optionValue.breakdownHideTotal).toBeFalsy();
        expect(testBed.component.optionValue.breakdownHideOther).toBeFalsy();
        expect(testBed.component.showGroupByPortBenchActiveBreakdownOption).toBeFalsy();
        expect(testBed.component.optionValue.isGroupByPortBenchActive).toBeFalsy();
    });



    it('should return a map when decompositionModes attribute is present', () => {
        const mockAttributes = [
            {
                title: 'Column Breakdown',
                key: 'columnBreakdown',
                dataType: 'S',
                values: [
                    {
                        value: JSON.stringify({ managerSelection: { standAlone: [], contribution: [] } }),
                        label: 'decompositionModes'
                    }
                ]
            }
        ];
        testBed.component.option = {columnOptionAttributes: mockAttributes} as any;

        const result = testBed.component.createMultiManagerOptions();
        expect(result).toEqual({
            managerSelection: {
                standAlone: [],
                contribution: []
            }
        });
    });

    it('should return null when decompositionModes attribute is not present', () => {
        const mockAttributes = [
            {
                title: 'Column Breakdown',
                key: 'columnBreakdown',
                dataType: 'S',
                values: []
            }
        ];
        testBed.component.option = { columnOptionAttributes: mockAttributes } as any;

        const result = testBed.component.createMultiManagerOptions();
        expect(result).toBeNull();
    });

    it('Test onBreakdownTypeChanged', () => {
        const customEvent = new CustomEvent('build', {detail: {value: {value: BreakdownFavoriteConstants.FACTOR_BREAKDOWN}}});
        testBed.component.onBreakdownTypeChanged(customEvent);
        expect(testBed.component.favoriteType).toEqual(BreakdownFavoriteConstants.FACTOR_BREAKDOWN);
        expect(testBed.component.optionValue.breakdown.isEmpty()).toBeTruthy();
    });

    it('Test onCheckboxGroupChanged', () => {
        const customEvent = new CustomEvent('build', {
            detail: {
                value: [
                    new ExploreCheckbox(ColumnBreakdownColumnOptionComponent.HIDE_TOTAL, true, false),
                    new ExploreCheckbox(ColumnBreakdownColumnOptionComponent.HIDE_OTHER, true, false)
                ]
            }
        });
        testBed.component.onCheckboxGroupChanged(customEvent);
        expect(testBed.component.optionValue.breakdownHideTotal).toBeFalsy();
        expect(testBed.component.optionValue.breakdownHideOther).toBeFalsy();
    });

    it('Test onBreakdownLevelChanged', () => {
        testBed.component.onBreakdownLevelChanged(5);
        expect(testBed.component.optionValue.breakdownLevel).toEqual(5);
    });

    it('Test onPortfolioGroupLevelChanged', () => {
        testBed.component.onPortfolioGroupLevelChanged(4);
        expect(testBed.component.optionValue.portfolioGroupLevel).toEqual(4);
    });

    it('Test onNormalizeBreakdownOptionChanged', () => {
        testBed.component.onNormalizeBreakdownOptionChanged(true);
        expect(testBed.component.optionValue.isColumnBreakdownNormalize).toBeTruthy();
    });

    it('Test onFullPortfolioNameBreakdownOptionChanged', () => {
        testBed.component.onFullPortfolioNameBreakdownOptionChanged(true);
        expect(testBed.component.optionValue.isFullPortfolioName).toBeTruthy();
    });

    it('Test onGroupByPortBenchActiveBreakdownOptionChanged', () => {
        testBed.component.onGroupByPortBenchActiveBreakdownOptionChanged(true);
        expect(testBed.component.optionValue.isGroupByPortBenchActive).toBeTruthy();
    });

    it('Test onSelectedBreakdownTypeChange', () => {
        testBed.component.onSelectedBreakdownTypeChange('FAC_BKD');
        expect(testBed.component.optionValue.multiManagerData.breakdownType).toEqual(BreakdownFavoriteConstants.FACTOR_BREAKDOWN);
    });

    it('Test onSelectedDecompositionModeChange', () => {
        testBed.component.onSelectedDecompositionModeChange('mode1');
        expect(testBed.component.optionValue.multiManagerData.decompositionMode).toBeTruthy();
    });

    it('Test onSelectedDecompositionModeChange for none', () => {
        testBed.component.breakdownTypeOptions = [new ExploreSelectOptionGroup()];
        testBed.component.onSelectedDecompositionModeChange('none');
        expect(testBed.component.optionValue.multiManagerData.decompositionMode).toBeTruthy();
    });

    it('Test onSelectedDecompositionTypeChange', () => {
        testBed.component.onSelectedDecompositionTypeChange('type1');
        expect(testBed.component.optionValue.multiManagerData.decompositionType).toBeTruthy();
    });

    function getRiskContributionColumn(): ColumnConfig {
        return new ColumnConfig({
            columnTag: 'rfv_contrib_port',
            columnKey: 'rfv_contrib_port_4',
            positionColumnType: 'PORT',
            optionValues: [
                {
                    configType: 'numericColumnFormatColumnOption'
                },
                {
                    economyRiskSettings: {},
                    advancedRiskSettings: {},
                    configType: 'riskSettings'
                },
                {
                    aggregationType: 0,
                    configType: 'aggregation'
                }
            ]
        });
    }

    function getRiskContributionColumnDef(): ColumnDefinition {
        const dummyColumnDef = new PortfolioRiskColumnCategoryDefinition();
        dummyColumnDef.matchingRiskCategories = [
            'DEPENDS_ON_ECONOMY',
            'DEPENDS_ON_EXPOSURE',
            'IS_MULTICOLUMN',
            'BELONGS_TO_FACTOR_REPORT',
            'BELONGS_TO_SECTOR_REPORT',
            'BELONGS_TO_SECTOR_TO_FACTOR_REPORT',
            'BELONGS_TO_SECTOR_TO_SECURITY_REPORT',
            'BELONGS_TO_PORTFOLIO_REPORT',
            'IS_PORT',
            'SUPPORTS_BREAKDOWN',
            'IS_SUBTOTAL_ABLE'
        ];
        return dummyColumnDef;
    }

    function getMarketValPercentColumn(): ColumnConfig {
        const serializedColumn = {
            columnTag: 'pct_mv',
            columnKey: 'pct_mv_1',
            positionColumnType: 'PORT',
            optionValues: [
                {
                    aggregationType: 2,
                    configType: 'aggregation'
                },
                {
                    decimalPlaces: 1,
                    useThousandsSeparator: true,
                    scaling: 0.01,
                    configType: 'numericColumnFormatColumnOption'
                },
                {
                    breakdownLevel: 1,
                    portfolioGroupLevel: 1,
                    isGroupByPortBenchActive: false,
                    isFullPortfolioName: false,
                    isColumnBreakdownNormalize: false,
                    breakdownHideTotal: false,
                    breakdownHideOther: false,
                    breakdownObject: {
                        breakdown: {
                            breakdownTitle: 'Portfolio Name',
                            subSectors: [
                                {
                                    breakdownRuleType: 'String',
                                    useNoneBuckets: true,
                                    groupByColumn: {
                                        columnName: 'Portfolio Name',
                                        columnTag: 'portfolio_name',
                                        dataType: 'STRING',
                                        positionColumnType: 'ALL'
                                    },
                                    subSectors: []
                                }
                            ]
                        },
                        title: 'Portfolio Name'
                    },
                    isFactorBreakdown: false,
                    configType: 'columnBreakdown'
                }
            ]
        };
        return new ColumnConfig(serializedColumn);
    }

    function getMarketValPercentColumnDef(): ColumnDefinition {
        return new ColumnDefinition({
            columnTag: 'pct_mv',
            field: null,
            title: 'Market Value %',
            uses: 'PORT',
            isSubtotalable: true,
            reportTypes: ['SINGLE', 'TREND'],
            columnReports: ['prism_dataagg', 'prism_all'],
            dataType: 'DOUBLE',
            columnType: 'DERIVED',
            isNotSupportedInCustomCal: false,
            groups: ['Position'],
            isGroupable: false,
            isStaticColumn: false,
            columnDesc: '%of market value',
            functionFlag: 0,
            strippedName: 'Market Value %',
            columnFormat: {
                scalingOptions: {},
                decimalPlaces: 1,
                isUseThousandsSeparator: true,
                isScalable: true,
                scalingFactor: 0.01
            }
        });
    }
});
