import {TestBed} from '@angular/core/testing';
import {BehaviorSubject, of} from 'rxjs';
import {WorkspaceStore} from '../../../stores';
import {ExploreWidgetPasteService} from '@services/widget-data/explore-widget-paste.service';
import {FavoriteService} from '@services/favorite';
import {TestUtils} from '@utils/test.utils';
import {AppUtils} from '@utils/app.utils';
import {CoreFavoriteStore, CoreFavoriteUtils, DateValue, Favorite} from '@blk/explore-ui-core';
import {Report} from '@models/workspace/report.model';
import {WidgetConstants} from '@constants/widget.constants';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WidgetUtils} from '@utils/widget.utils';
import {ColumnSet} from '@blk/explore-ui-column-option';

describe('ExploreWidgetPasteService Test', () => {
    let service: ExploreWidgetPasteService;
    const favoriteServiceStub = {
        getFavorite$: jest.fn(() => of())
    };
    let report: Report;

    const updateWidgetWithPortfolioSettingsSpy = jest.spyOn(WidgetUtils, 'updateWidgetWithPortfolioSettings');

    beforeAll(done => TestUtils.initialize(done));

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{provide: FavoriteService, useValue: favoriteServiceStub}]
        });
        service =  TestBed.inject(ExploreWidgetPasteService);

        WorkspaceStore.init();
        report = new Report();
        report.key = 1234567;
        WorkspaceStore.updateCurrentReport(report);
        WidgetConstants.GRIDSTER_CONSTANTS.MAX_COLS = 24;
        WidgetConstants.GRIDSTER_CONSTANTS.DEFAULT_ITEM_COLS = 8;
        const currentPortfolio = new Portfolio('PEP');
        currentPortfolio.datePicker = new DateValue({date: '05/18/2020'});
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(currentPortfolio);
    });

    describe('pasteWidget Test', () => {
        it('test copy/paste widget from dev to dev', async() => {
            const widgetConfigStringified = JSON.stringify({
                    'nestedWidgetConfig': {
                        'title': 'Top Risk Contributor',
                        'sizeX': 12,
                        'sizeY': 8,
                        'row': 0,
                        'col': 11,
                        'configType': 'bar',
                        'dataStore': '12345',
                        'displayInputs': {
                            'showGridLines': {'showGridLines': true},
                            'secondaryAxisColumn': {'secondaryAxisColumn': {'inputType': 'secondaryAxis', 'data': null}}
                        }
                    },
                    'nestedDataStore': {
                        'name': '12345',
                        'metaData': {
                            'inputs': {
                                'columns': {
                                    'configType': 'columnSet',
                                    'columns': [{
                                        'columnTag': 'eqty_risk_ctr_pct',
                                        'columnKey': 'eqty_risk_ctr_pct_1534286085497',
                                        'positionColumnType': 'ACTIVE',
                                        'optionValues': [{
                                            'aggregationType': 2,
                                            'configType': 'aggregation'
                                        }, {
                                            'decimalPlaces': 1,
                                            'useThousandsSeparator': true,
                                            'scaling': 0.01,
                                            'configType': 'numericColumnFormatColumnOption'
                                        }]
                                    }]
                                },
                                'breakdownTree': {
                                    'breakdown': {
                                        'breakdownTitle': 'TOTAL',
                                        'subSectors': [{
                                            'breakdownRuleType': 'String',
                                            'useNoneBuckets': true,
                                            'groupByColumn': {
                                                'columnName': 'Issuer Name',
                                                'columnTag': 'issuer_name',
                                                'dataType': 'STRING',
                                                'positionColumnType': 'ALL'
                                            },
                                            'subSectors': []
                                        }]
                                    }, 'title': 'TOTAL'
                                },
                                'stackedBreakdownTree': {'breakdown': {'subSectors': []}, 'title': ''},
                                'topBottomFilter': {
                                    'columnTag': 'eqty_risk_ctr_pct',
                                    'columnKey': 'eqty_risk_ctr_pct_1534286085497',
                                    'top': 10,
                                    'positionColumnType': 'PORT',
                                    'configType': 'topBottomFilter'
                                },
                                'chart': {'chartType': 'column', 'configType': 'barSettings'},
                                'sortedColumns': {'sortedColumns': [], 'configType': 'sortedColumns'},
                                'showGridLines': {'showGridLines': true},
                                'secondaryAxisColumn': {
                                    'secondaryAxisColumn': {
                                        'inputType': 'secondaryAxis',
                                        'data': null
                                    }
                                }
                            }
                        }
                    },
                    'href': 'https://dev.blackrock.com/apps/explore-beta/',
                    'reportKey': 7654321
                });
            jest.spyOn(AppUtils, 'getHref').mockReturnValue('https://dev.blackrock.com/apps/explore-beta/');
            jest.spyOn(report, 'deserializeAndGetWidgetDataStore').mockReturnValue(undefined);
            await service.pasteWidget(widgetConfigStringified, report);
            expect(report.availableDataStores).not.toBeUndefined();
            const widgetAdded = report.widgets[0];
            expect(widgetAdded).not.toBeUndefined();
            expect(widgetAdded.title).toBe('Top Risk Contributor');
            expect(widgetAdded.dataStore.name).not.toBe('12345');
            expect(report.availableDataStores.get(widgetAdded.dataStore.name)).toBeDefined();
            expect(updateWidgetWithPortfolioSettingsSpy).toHaveBeenCalledWith(widgetAdded, WorkspaceStore.getCurrentPortfolio());
        });

        it('test copy/paste widget from dev to dev in the same report', async() => {
            const widgetStringified = JSON.stringify({
                    'nestedWidgetConfig': {
                        'title': 'Risk and Exposure',
                        'id': 12345,
                        'sizeX': 8,
                        'sizeY': 6,
                        'row': 0,
                        'col': 11,
                        'configType': 'bar',
                        'dataStore': '12345',
                        'displayInputs': {
                            'showGridLines': {'showGridLines': true},
                            'secondaryAxisColumn': {'secondaryAxisColumn': {'inputType': 'secondaryAxis', 'data': null}}
                        }
                    },
                    'nestedDataStore': {
                        'name': '12345',
                        'metaData': {
                            'inputs': {
                                'columns': {
                                    'configType': 'columnSet',
                                    'columns': [{
                                        'columnTag': 'eqty_risk_ctr_pct',
                                        'columnKey': 'eqty_risk_ctr_pct_1534286085497',
                                        'positionColumnType': 'ACTIVE',
                                        'optionValues': [{
                                            'aggregationType': 2,
                                            'configType': 'aggregation'
                                        }, {
                                            'decimalPlaces': 1,
                                            'useThousandsSeparator': true,
                                            'scaling': 0.01,
                                            'configType': 'numericColumnFormatColumnOption'
                                        }]
                                    }]
                                },
                                'breakdownTree': {
                                    'breakdown': {
                                        'breakdownTitle': 'TOTAL',
                                        'subSectors': [{
                                            'breakdownRuleType': 'String',
                                            'useNoneBuckets': true,
                                            'groupByColumn': {
                                                'columnName': 'Issuer Name',
                                                'columnTag': 'issuer_name',
                                                'dataType': 'STRING',
                                                'positionColumnType': 'ALL'
                                            },
                                            'subSectors': []
                                        }]
                                    }, 'title': 'TOTAL'
                                },
                                'stackedBreakdownTree': {'breakdown': {'subSectors': []}, 'title': ''},
                                'topBottomFilter': {
                                    'columnTag': 'eqty_risk_ctr_pct',
                                    'columnKey': 'eqty_risk_ctr_pct_1534286085497',
                                    'top': 10,
                                    'positionColumnType': 'PORT',
                                    'configType': 'topBottomFilter'
                                },
                                'chart': {'chartType': 'column', 'configType': 'barSettings'},
                                'sortedColumns': {'sortedColumns': [], 'configType': 'sortedColumns'},
                                'showGridLines': {'showGridLines': true},
                                'secondaryAxisColumn': {
                                    'secondaryAxisColumn': {
                                        'inputType': 'secondaryAxis',
                                        'data': null
                                    }
                                }
                            }
                        }
                    },
                    'href': 'https://dev.blackrock.com/apps/explore-beta/',
                    'reportKey': 1234567
                });
            jest.spyOn(AppUtils, 'getHref').mockReturnValue('https://dev.blackrock.com/apps/explore-beta/');
            jest.spyOn(report, 'deserializeAndGetWidgetDataStore').mockReturnValue(undefined);
            // Clear before spy calls
            updateWidgetWithPortfolioSettingsSpy.mockClear();
            await service.pasteWidget(widgetStringified, report);
            expect(report.availableDataStores).not.toBeUndefined();
            const widgetAdded = report.widgets[0];
            expect(widgetAdded).not.toBeUndefined();
            expect(widgetAdded.title).toBe('Risk and Exposure');
            expect(widgetAdded.id).not.toBe(12345);
            expect(widgetAdded.dimensions.x).toBeUndefined();
            expect(widgetAdded.dimensions.y).toBeUndefined();
            expect(updateWidgetWithPortfolioSettingsSpy).toHaveBeenCalledWith(widgetAdded, WorkspaceStore.getCurrentPortfolio());
        });

        it('test copy/paste widget from dev to dev for PGS chart widget', async() => {
            let widgetStringified = JSON.stringify({
                'nestedWidgetConfig': {
                    'title': 'Risk and Exposure',
                    'id': 12345,
                    'sizeX': 8,
                    'sizeY': 6,
                    'row': 0,
                    'col': 11,
                    'configType': 'pgsTs',
                    'dataStore': '12345',
                    'displayInputs': {
                        'showGridLines': {'showGridLines': true},
                        'secondaryAxisColumn': {'secondaryAxisColumn': {'inputType': 'secondaryAxis', 'data': null}}
                    }
                },
                'nestedDataStore': {
                    'name': '12345',
                    'metaData': {
                        'inputs': {
                            'columns': {
                                'configType': 'columnSet',
                                'columns': [{
                                    'columnTag': 'eqty_risk_ctr_pct',
                                    'columnKey': 'eqty_risk_ctr_pct_1534286085497',
                                    'positionColumnType': 'ACTIVE',
                                    'optionValues': [{
                                        'aggregationType': 2,
                                        'configType': 'aggregation'
                                    }, {
                                        'decimalPlaces': 1,
                                        'useThousandsSeparator': true,
                                        'scaling': 0.01,
                                        'configType': 'numericColumnFormatColumnOption'
                                    }]
                                }]
                            },
                            'breakdownTree': {
                                'breakdown': {
                                    'breakdownTitle': 'TOTAL',
                                    'subSectors': [{
                                        'breakdownRuleType': 'String',
                                        'useNoneBuckets': true,
                                        'groupByColumn': {
                                            'columnName': 'Issuer Name',
                                            'columnTag': 'issuer_name',
                                            'dataType': 'STRING',
                                            'positionColumnType': 'ALL'
                                        },
                                        'subSectors': []
                                    }]
                                }, 'title': 'TOTAL'
                            },
                            'stackedBreakdownTree': {'breakdown': {'subSectors': []}, 'title': ''},
                            'topBottomFilter': {
                                'columnTag': 'eqty_risk_ctr_pct',
                                'columnKey': 'eqty_risk_ctr_pct_1534286085497',
                                'top': 10,
                                'positionColumnType': 'PORT',
                                'configType': 'topBottomFilter'
                            },
                            'chart': {'chartType': 'column', 'configType': 'barSettings'},
                            'sortedColumns': {'sortedColumns': [], 'configType': 'sortedColumns'},
                            'showGridLines': {'showGridLines': true},
                            'secondaryAxisColumn': {
                                'secondaryAxisColumn': {
                                    'inputType': 'secondaryAxis',
                                    'data': null
                                }
                            }
                        }
                    }
                },
                'href': 'https://dev.blackrock.com/apps/explore-beta/',
                'reportKey': 1234567
            });
            jest.spyOn(AppUtils, 'getHref').mockReturnValue('https://dev.blackrock.com/apps/explore-beta/');
            jest.spyOn(report, 'deserializeAndGetWidgetDataStore').mockReturnValue(undefined);
            // Clear before spy calls
            updateWidgetWithPortfolioSettingsSpy.mockClear();
            await service.pasteWidget(widgetStringified, report);
            expect(report.widgets[0]).not.toBeUndefined();

            widgetStringified = JSON.stringify({
                'nestedWidgetConfig': {
                    'title': 'Risk and Exposure',
                    'id': 12345,
                    'sizeX': 8,
                    'sizeY': 6,
                    'row': 0,
                    'col': 11,
                    'configType': 'pgsTs',
                    'dataStore': '12345',
                    'displayInputs': {
                        'showGridLines': {'showGridLines': true},
                        'secondaryAxisColumn': {'secondaryAxisColumn': {'inputType': 'secondaryAxis', 'data': null}}
                    }
                },
                'nestedDataStore': {
                    'name': '12345',
                    'metaData': {
                        'inputs': {
                            'columns': {
                                'configType': 'columnSet',
                                'columns': [{
                                    'columnTag': 'eqty_risk_ctr_pct',
                                    'columnKey': 'eqty_risk_ctr_pct_1534286085497',
                                    'positionColumnType': 'ACTIVE',
                                    'optionValues': [{
                                        'aggregationType': 2,
                                        'configType': 'aggregation'
                                    }, {
                                        'decimalPlaces': 1,
                                        'useThousandsSeparator': true,
                                        'scaling': 0.01,
                                        'configType': 'numericColumnFormatColumnOption'
                                    }]
                                }]
                            },
                            'breakdownTree': {
                                'breakdown': {
                                    'breakdownTitle': 'TOTAL',
                                    'subSectors': [{
                                        'breakdownRuleType': 'String',
                                        'useNoneBuckets': true,
                                        'groupByColumn': {
                                            'columnName': 'Issuer Name',
                                            'columnTag': 'issuer_name',
                                            'dataType': 'STRING',
                                            'positionColumnType': 'ALL'
                                        },
                                        'subSectors': []
                                    }]
                                }, 'title': 'TOTAL'
                            },
                            'stackedBreakdownTree': {'breakdown': {'subSectors': []}, 'title': ''},
                            'topBottomFilter': {
                                'columnTag': 'eqty_risk_ctr_pct',
                                'columnKey': 'eqty_risk_ctr_pct_1534286085497',
                                'top': 10,
                                'positionColumnType': 'PORT',
                                'configType': 'topBottomFilter'
                            },
                            'chart': {'chartType': 'column', 'configType': 'barSettings'},
                            'sortedColumns': {'sortedColumns': [], 'configType': 'sortedColumns'},
                            'showGridLines': {'showGridLines': true},
                            'secondaryAxisColumn': {
                                'secondaryAxisColumn': {
                                    'inputType': 'secondaryAxis',
                                    'data': null
                                }
                            }
                        }
                    }
                },
                'href': 'https://dev.blackrock.com/apps/explore-beta/',
                'reportKey': 1
            });
            jest.spyOn(AppUtils, 'getHref').mockReturnValue('https://dev.blackrock.com/apps/explore-beta/');
            jest.spyOn(report, 'deserializeAndGetWidgetDataStore').mockReturnValue(undefined);
            // Clear before spy calls
            updateWidgetWithPortfolioSettingsSpy.mockClear();
            await service.pasteWidget(widgetStringified, report);
            expect(report.widgets.length).toBe(1);
        });

        it('test copy/paste widget with nested favorite', async() => {
            const reportFav = new Favorite();
            reportFav.id = 987;
            reportFav.data = JSON.stringify({
                'configType': 'columnSet',
                'columns': [{
                    'columnTag': 'eqty_risk_ctr_pct',
                    'columnKey': 'eqty_risk_ctr_pct_1534286085497',
                    'positionColumnType': 'ACTIVE',
                    'optionValues': [{
                        'aggregationType': 2,
                        'configType': 'aggregation'
                    }, {
                        'decimalPlaces': 1,
                        'useThousandsSeparator': true,
                        'scaling': 0.01,
                        'configType': 'numericColumnFormatColumnOption'
                    }]
                }]
            });
            CoreFavoriteStore.favoriteCache.set(CoreFavoriteUtils.getFavoriteKey(false, 987).toString(), reportFav);

            const widgetConfigStringified = JSON.stringify({
                    'nestedWidgetConfig': {
                        'title': 'Top Risk Contributor',
                        'sizeX': 12,
                        'sizeY': 8,
                        'row': 0,
                        'col': 11,
                        'configType': 'bar',
                        'dataStore': '12345',
                        'displayInputs': {
                            'showGridLines': {'showGridLines': true},
                            'secondaryAxisColumn': {'secondaryAxisColumn': {'inputType': 'secondaryAxis', 'data': null}}
                        }
                    },
                    'nestedDataStore': {
                        'name': '12345',
                        'metaData': {
                            'inputs': {
                                'columns': {
                                    'configType': 'columnSet',
                                    'favId': 987
                                },
                                'breakdownTree': {
                                    'breakdown': {
                                        'breakdownTitle': 'TOTAL',
                                        'subSectors': [{
                                            'breakdownRuleType': 'String',
                                            'useNoneBuckets': true,
                                            'groupByColumn': {
                                                'columnName': 'Issuer Name',
                                                'columnTag': 'issuer_name',
                                                'dataType': 'STRING',
                                                'positionColumnType': 'ALL'
                                            },
                                            'subSectors': []
                                        }]
                                    }, 'title': 'TOTAL'
                                },
                                'stackedBreakdownTree': {'breakdown': {'subSectors': []}, 'title': ''},
                                'topBottomFilter': {
                                    'columnTag': 'eqty_risk_ctr_pct',
                                    'columnKey': 'eqty_risk_ctr_pct_1534286085497',
                                    'top': 10,
                                    'positionColumnType': 'PORT',
                                    'configType': 'topBottomFilter'
                                },
                                'chart': {'chartType': 'column', 'configType': 'barSettings'},
                                'sortedColumns': {'sortedColumns': [], 'configType': 'sortedColumns'},
                                'showGridLines': {'showGridLines': true},
                                'secondaryAxisColumn': {
                                    'secondaryAxisColumn': {
                                        'inputType': 'secondaryAxis',
                                        'data': null
                                    }
                                }
                            }
                        }
                    },
                    'href': 'https://dev.blackrock.com/apps/explore-beta/',
                    'reportKey': 7654321
                });
            jest.spyOn(AppUtils, 'getHref').mockReturnValue('https://dev.blackrock.com/apps/explore-beta/');
            jest.spyOn(report, 'deserializeAndGetWidgetDataStore').mockReturnValue(undefined);
            await service.pasteWidget(widgetConfigStringified, report);
            expect(report.availableDataStores).not.toBeUndefined();
            const widgetAdded = report.widgets[0];
            expect(widgetAdded).not.toBeUndefined();
            expect(widgetAdded.title).toBe('Top Risk Contributor');
            expect(widgetAdded.dataStore.name).not.toBe('12345');
            expect(report.availableDataStores.get(widgetAdded.dataStore.name)).toBeDefined();
            expect(updateWidgetWithPortfolioSettingsSpy).toHaveBeenCalledWith(widgetAdded, WorkspaceStore.getCurrentPortfolio());

            // Validate that the fav was loaded and the report was placed onto the widget correctly.
            expect(favoriteServiceStub.getFavorite$).toHaveBeenCalled();
            const colSet = widgetAdded.dataStore.metaData.inputs.get('columns') as ColumnSet;
            expect(colSet.columns[0].columnTag).toBe('eqty_risk_ctr_pct');
        });

        it('test invalid data, should console log widget data and close modal', () => {
            const invalidConfig = () => {
                return 'abcdefg_invalidjsonstring';
            };
            jest.spyOn(console, 'log');
            jest.spyOn(AppUtils, 'getHref').mockReturnValue('https://dev.blackrock.com/apps/explore-beta/');
            jest.spyOn(report, 'deserializeAndGetWidgetDataStore').mockReturnValue(undefined);
            // clear mock calls
            updateWidgetWithPortfolioSettingsSpy.mockClear();
            service.pasteWidget('abcdefg_invalidjsonstring', report);
            expect(report.availableDataStores.size).toBe(0);
            expect(report.widgets.length).toBe(0);
            expect(updateWidgetWithPortfolioSettingsSpy).not.toHaveBeenCalled();
        });
    });
});

