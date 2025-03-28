import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ColumnConfig, ColumnOptionMetaDataInterface, NotificationServiceInterface, AbstractColumnOption} from '@blk/explore-ui-core';
import {of, Subject} from 'rxjs';
import {ColumnOptionService} from '../../../services/column-option.service';
import {CopyColumnOptionsModalComponent} from './copy-column-options-modal.component';
import {isEqual} from 'lodash';

describe('CopyColumnOptionsModalComponent', () => {
    let component: CopyColumnOptionsModalComponent;
    let fixture: ComponentFixture<CopyColumnOptionsModalComponent>;

    const column =
        ColumnConfig.createColumn('security_description', 'ALL', 'security_description_1', 'Security Description');
    column.optionValues = [
        {
            'value': 'NAME',
            'configType': 'secDescOptions'
        },
        {
            'value': 0,
            'configType': 'aggregation'
        },
        {
            'configType': 'customColumnTitle'
        },
        {
            'highlightSettings': [],
            'highlightOnlyLeaf': true,
            'configType': 'highlight'
        }
    ];

    const columns = [
        {
            'optionValues': [
                {
                    'lookthroughSettings': {
                        'isLookThroughEnabled': false,
                        'isBenchLookThroughEnabled': false,
                        'ltSecurityTypes': [],
                        'ltProxies': [],
                        'ltFilterRulesFav': {},
                        'isLookThroughInheritanceEnabled': false
                    }
                },
                {
                    'climateScenario': [
                        {
                            'scenarioType': 'RCP 4.5',
                            'scenarioTypeDisplayName': 'Expected Emissions (RCP 4.5)',
                            'scenarioPercentile': 'mean',
                            'scenarioPercentileDisplayName': 'Average Risk',
                            'scenarioYear': '2020',
                            'scenarioYearDisplayName': 'Today'
                        }
                    ]
                },
                {
                    'value': 1400
                },
                {
                    'decimalPlaces': 2,
                    'useThousandsSeparator': true,
                    'scaling': 1
                }
            ],
            'columnTag': 'pc_risk_score',
            'columnKey': 'pc_risk_score_cc2850f51ea64a2',
            'positionColumnType': 'BENCH',
            'columnTitle': 'Benchmark Physical Climate Score'
        },
        {
            'optionValues': [
                {
                    'lookthroughSettings': {
                        'isLookThroughEnabled': false,
                        'isBenchLookThroughEnabled': false,
                        'ltSecurityTypes': [],
                        'ltProxies': [],
                        'ltFilterRulesFav': {},
                        'isLookThroughInheritanceEnabled': false
                    }
                },
                {
                    'climateScenario': [
                        {
                            'scenarioType': 'RCP 4.5',
                            'scenarioTypeDisplayName': 'Expected Emissions (RCP 4.5)',
                            'scenarioPercentile': 'mean',
                            'scenarioPercentileDisplayName': 'Average Risk',
                            'scenarioYear': '2020',
                            'scenarioYearDisplayName': 'Today'
                        }
                    ]
                },
                {
                    'value': 1400
                },
                {
                    'decimalPlaces': 2,
                    'useThousandsSeparator': true,
                    'scaling': 1
                },
                {},
                {
                    'highlightSettings': [],
                    'highlightOnlyLeaf': true
                },
                {
                    'breakdownLevel': 1,
                    'portfolioGroupLevel': 1,
                    'breakdownHideWithNoValues': true,
                    'breakdown': {
                        'children': [],
                        'isMandateDefaultBreakdown': false,
                        'isConfigured': false
                    },
                    'breakdownHideTotal': false,
                    'breakdownHideOther': false,
                    'isFullPortfolioName': false,
                    'isColumnBreakdownNormalize': false,
                    'isGroupByPortBenchActive': false,
                    'isFactorBreakdown': false
                },
                {
                    'overrideDateTypes': [],
                    'showAttribution': false,
                    'dateType': 'ECONOMY'
                }
            ],
            'columnTag': 'pc_risk_score',
            'columnKey': 'pc_risk_score_db217fc8b9fa449',
            'positionColumnType': 'ACTIVE',
            'columnTitle': 'Active Physical Climate Score'
        }
    ];
    const columnsToUpdate = new Set<ColumnConfig>();
    const compositeKeyToColumnOptionsMap = new Map<string, ColumnOptionMetaDataInterface[]>();
    compositeKeyToColumnOptionsMap.set('security_description+ALL',
        [
            {
                'columnOptionAttributes': [
                    {
                        'title': 'Display',
                        'defaultValue': {
                            'value': 'NAME',
                            'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                            'label': 'Name'
                        },
                        'key': 'secDescDisplay',
                        'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeWithValues',
                        'values': [
                            {
                                'value': 'ASSET_ID',
                                'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                                'label': 'Asset ID'
                            },
                            {
                                'value': 'TICKER',
                                'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                                'label': 'Ticker'
                            },
                            {
                                'value': 'NAME',
                                'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                                'label': 'Name'
                            },
                            {
                                'value': 'TICKER_COUPON_MATURITY',
                                'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                                'label': 'Ticker/Coupon/Maturity'
                            },
                            {
                                'value': 'BB_TICKER',
                                'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                                'label': 'BB Ticker'
                            }
                        ],
                        'dataType': 'S'
                    }
                ],
                'columnOptionConfigType': 'secDescOptions',
                'columnOptionTitle': 'Additional settings',
                'CLASS_TYPE': 'com.bfm.prism.data.column.options.security.SecurityDescriptionColumnOption',
                'columnOptionKey': 'secDescOptions'
            },
            {
                'columnOptionAttributes': [
                    {
                        'title': 'Type',
                        'defaultValue': {
                            'value': '0',
                            'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                            'label': 'None'
                        },
                        'key': 'aggregationType',
                        'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeWithValues',
                        'values': [
                            {
                                'value': 2100,
                                'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                                'label': 'Unique Value'
                            },
                            {
                                'value': 0,
                                'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                                'label': 'None'
                            }
                        ],
                        'dataType': 'S'
                    }
                ],
                'columnOptionConfigType': 'aggregation',
                'columnOptionTitle': 'Aggregation',
                'CLASS_TYPE': 'com.bfm.prism.data.column.options.general.AggregationColumnOption',
                'columnOptionKey': 'aggregation'
            },
            {
                'columnOptionAttributes': [
                    {
                        'title': 'Title',
                        'key': 'title',
                        'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                        'dataType': 'S'
                    }
                ],
                'columnOptionConfigType': 'customColumnTitle',
                'columnOptionTitle': 'Display options',
                'CLASS_TYPE': 'com.bfm.prism.data.column.options.general.CustomColumnTitleOption',
                'columnOptionKey': 'customColumnTitle'
            },
            {
                'columnOptionAttributes': [
                    {
                        'title': 'Compare Type',
                        'key': 'compareType',
                        'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                        'dataType': 'S'
                    },
                    {
                        'title': 'Compare Value',
                        'key': 'compareValue',
                        'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                        'dataType': 'S'
                    },
                    {
                        'title': 'Highlight Color',
                        'key': 'highlightColor',
                        'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                        'dataType': 'S'
                    }
                ],
                'columnOptionConfigType': 'highlight',
                'columnOptionTitle': 'Highlight',
                'CLASS_TYPE': 'com.bfm.prism.data.column.options.general.HighlightColumnOptions',
                'columnOptionKey': 'highlight'
            }
        ]);
    // Need one column option metadata for each column option
    const sourceColumnOptionMetaData = {
        'columnOptionAttributes': [
            {
                'title': 'Compare Type',
                'key': 'compareType',
                'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                'dataType': 'S'
            },
            {
                'title': 'Compare Value',
                'key': 'compareValue',
                'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                'dataType': 'S'
            },
            {
                'title': 'Highlight Color',
                'key': 'highlightColor',
                'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                'dataType': 'S'
            }
        ],
        'columnOptionConfigType': 'highlight',
        'columnOptionTitle': 'Highlight',
        'CLASS_TYPE': 'com.bfm.prism.data.column.options.general.HighlightColumnOptions',
        'columnOptionKey': 'highlight'
    };

    const activeColumnOption = [{
        columnOptionKey: 'activeCalculationColumnOption',
        columnOptionTitle: 'Active Calculation',
        columnOptionConfigType: 'activeCalculationColumnOption',
        columnOptionAttributes: [{
            title: 'Type',
            key: '',
            dataType: ''
        }]
    }];

    const columnOptionsServiceMock = {
        fetchColumnOptions$: jest.fn(() => of([{colTag: 'pct_mv', use: 'ACTIVE', options: activeColumnOption}]))
    };

    const notificationServiceMock = {
        success: jest.fn(() => of(component.COPY_COLUMNS_SUCCESS))
    };

    const columnOptionCopied$ = new Subject<{columns: ColumnConfig[], columnOptionValue: AbstractColumnOption}>();

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CopyColumnOptionsModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: ColumnOptionService, useValue: columnOptionsServiceMock
                },
                {
                    provide: NotificationServiceInterface, useValue: notificationServiceMock
                }
            ]
        });

        fixture = TestBed.createComponent(CopyColumnOptionsModalComponent);
        component = fixture.componentInstance;

        component.column = column;
        component.columns = columns;
        component.compositeKeyToColumnOptionsMap = compositeKeyToColumnOptionsMap;
        component.sourceColumnOptionMetaData = sourceColumnOptionMetaData;
        columnsToUpdate.clear();
        component.columnsToUpdate = columnsToUpdate;
        component.columnOptionCopied$ = columnOptionCopied$;
    });

    describe('filterColumn Test', () => {
        it('should filter columns', async () => {
            expect(component.filterColumn(column.columnTag + '+' + column.positionColumnType)).toBeTruthy();
        });
    });

    describe('filterColumns Test', () => {
        it('should add checkbox to ExploreCheckbox', async () => {
            // TODO
            component.column = {
                'optionValues': [
                    {
                        'lookthroughSettings': {
                            'isLookThroughEnabled': false,
                            'isBenchLookThroughEnabled': false,
                            'ltSecurityTypes': [],
                            'ltProxies': [],
                            'ltFilterRulesFav': {},
                            'isLookThroughInheritanceEnabled': false
                        }
                    },
                    {
                        'climateScenario': [
                            {
                                'scenarioType': 'RCP 4.5',
                                'scenarioTypeDisplayName': 'Expected Emissions (RCP 4.5)',
                                'scenarioPercentile': 'mean',
                                'scenarioPercentileDisplayName': 'Average Risk',
                                'scenarioYear': '2020',
                                'scenarioYearDisplayName': 'Today'
                            }
                        ]
                    },
                    {
                        'value': 1400
                    },
                    {
                        'decimalPlaces': 2,
                        'useThousandsSeparator': true,
                        'scaling': 1
                    },
                    {},
                    {
                        'highlightSettings': [],
                        'highlightOnlyLeaf': true
                    },
                    {
                        'breakdownLevel': 1,
                        'portfolioGroupLevel': 1,
                        'breakdownHideWithNoValues': true,
                        'breakdown': {
                            'children': [],
                            'isMandateDefaultBreakdown': false,
                            'isConfigured': false
                        },
                        'breakdownHideTotal': false,
                        'breakdownHideOther': false,
                        'isFullPortfolioName': false,
                        'isColumnBreakdownNormalize': false,
                        'isGroupByPortBenchActive': false,
                        'isFactorBreakdown': false
                    },
                    {
                        'overrideDateTypes': [],
                        'showAttribution': false,
                        'dateType': 'ECONOMY'
                    }
                ],
                'columnTag': 'pc_risk_score',
                'columnKey': 'pc_risk_score_db217fc8b9fa449',
                'positionColumnType': 'ACTIVE',
                'columnTitle': 'Active Physical Climate Score'
            };

            const expectedColumnsForCheckbox = [
                {
                    'label': 'Benchmark Physical Climate Score',
                    'checked': false,
                    'disabled': false
                }
            ];
            // @ts-ignore
            expect(isEqual(expectedColumnsForCheckbox, component.filterColumns(columns)));
        });
    });

    describe('closeModal Test', () => {
        it('should flip isOpen flag and emit modalClosed', () => {
            jest.spyOn(component.modalClosed, 'emit');
            component.closeModal();
            expect(component.isOpen).toBeFalsy();
            expect(component.modalClosed.emit).toHaveBeenCalledWith();
        });
    });

    describe('onColumnSelection Test', () => {
        it('should update columnsToUpdate', () => {
            const event = {
                'detail': {
                    'value': {
                        'label': 'CUSIP',
                        'checked': true,
                        'disabled': false,
                        'eventData': ''
                    }
                }
            };
            component.onColumnSelection(event);
            expect(columnsToUpdate.size).toBe(1);
        });
    });

    describe('applyColumnOptionChanges Test', () => {
        it('should apply source column option value to target column option', () => {
            const targetColumn = ColumnConfig.createColumn(
                'cusip',
                'ALL',
                'cusip_0',
                'CUSIP'
            );
            targetColumn.optionValues = [{'configType': 'highlight'}];
            columnsToUpdate.add(targetColumn);
            component.columnsToUpdate = columnsToUpdate;
            component.applyColumnOptionChanges();
            let sourceColumnOptionHighLight = {};
            let targetColumnOptionHighLight = {};
            for (const item of column.optionValues) {
                if (item.configType === 'highlight') {
                    sourceColumnOptionHighLight = item;
                }
            }
            for (const item of targetColumn.optionValues) {
                if (item.configType === 'highlight') {
                    targetColumnOptionHighLight = item;
                }
            }
            delete targetColumnOptionHighLight['optionState'];
            expect(isEqual(sourceColumnOptionHighLight, targetColumnOptionHighLight)).toBeTruthy();
        });
    });
});
