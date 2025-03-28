import {HttpClient} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';
import {WidgetConfigResolverService} from './widget-config-resolver.service';
import {WIDGET_CONFIG_DIRECTORY_TOKEN} from './tokens';
import {CommonUtils} from '../core/utils';

const testConfig = {
    testWidget: {$refJson: 'test-widget.json'},
    $refObjects: {
        customCalculationColumn: {
            restrictedColumnOptions: {
                sections: [
                    'columnBreakdown',
                    'formatAndScaling',
                    'highlight',
                    'customColumnTitle'
                ]
            }
        },
        defaultNotionalNumericColumns: {
            categoryType: 'columns',
            categoryTitle: 'Measures',
            noAccordion: true,
            inputs: [
                {
                    inputConfigType: 'columns',
                    inputName: 'columns',
                    valueField: 'columnTag',
                    mandateSettingType: 'CHART_REPORT',
                    columnFilters: {
                        $ref: 'numericColumnFilters'
                    },
                    'default': [
                        {
                            $ref: 'notionalMarketValuePercentColumn'
                        }
                    ]
                }
            ]
        },
        notionalMarketValuePercentColumn: {
            columnTag: 'pct_notional_val',
            positionColumnType: 'PORT',
            columnKey: 'pct_notional_val_0',
            title: 'Notional Market Value %'
        },
        numericColumnFilters: [
            {
                type: '=',
                key: 'reportTypes',
                value: 'SINGLE'
            },
            {
                type: '=',
                key: 'dataType',
                value: [
                    'TIME_SPAN',
                    'INT',
                    'DOUBLE'
                ]
            },
        ],
    }
};

const testWidgetConfig = {
    configType: 'testWidget',
    size: {
        height: 6,
        width: 8
    },
    title: 'Time series chart',
    reference: {
        $ref: 'customCalculationColumn'
    },
    deeply: {
        nested: {
            reference: [
                {
                    $ref: 'defaultNotionalNumericColumns'
                }
            ]
        }
    }
};

describe('WidgetConfigResolver tests', () => {
    let widgetConfigResolverService: WidgetConfigResolverService;

    const httpMock = {
        get: jest.fn((url) => {
            if (url === 'path/to/my/configs/test-widget.json' || url === 'test-widget.json') {
                return of(cloneDeep(testWidgetConfig));
            }
        })
    };

    describe('resolveConfig$', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    {
                        provide: WIDGET_CONFIG_DIRECTORY_TOKEN,
                        useValue: 'path/to/my/configs/'
                    },
                    {
                        provide: HttpClient,
                        useValue: httpMock
                    },
                    {
                        provide: WidgetConfigResolverService,
                        useClass: WidgetConfigResolverService
                    }
                ]
            });

            widgetConfigResolverService = TestBed.inject(WidgetConfigResolverService);
            httpMock.get.mockClear();
        });

        it('should correctly resolve a configuration', (done) => {
            widgetConfigResolverService.resolveConfig$(testConfig).subscribe((resolved) => {
                expect(resolved).toEqual({
                    'testWidget': {
                        'configType': 'testWidget',
                        'deeply': {
                            'nested': {
                                'reference': [
                                    {
                                        'categoryTitle': 'Measures',
                                        'categoryType': 'columns',
                                        'inputs': [
                                            {
                                                'columnFilters': [
                                                    {
                                                        'key': 'reportTypes',
                                                        'type': '=',
                                                        'value': 'SINGLE',
                                                    },
                                                    {
                                                        'key': 'dataType',
                                                        'type': '=',
                                                        'value': [
                                                            'TIME_SPAN',
                                                            'INT',
                                                            'DOUBLE',
                                                        ],
                                                    },
                                                ],
                                                'default': [
                                                    {
                                                        'columnKey': 'pct_notional_val_0',
                                                        'columnTag': 'pct_notional_val',
                                                        'positionColumnType': 'PORT',
                                                        'title': 'Notional Market Value %',
                                                    },
                                                ],
                                                'inputConfigType': 'columns',
                                                'inputName': 'columns',
                                                'mandateSettingType': 'CHART_REPORT',
                                                'valueField': 'columnTag',
                                            },
                                        ],
                                        'noAccordion': true,
                                    },
                                ],
                            },
                        },
                        'reference': {
                            'restrictedColumnOptions': {
                                'sections': [
                                    'columnBreakdown',
                                    'formatAndScaling',
                                    'highlight',
                                    'customColumnTitle',
                                ],
                            },
                        },
                        'size': {
                            'height': 6,
                            'width': 8,
                        },
                        'title': 'Time series chart',
                    },
                });
                done();
            });
        });

        it('should return the config as-is when there are no reference objects found', (done) => {
            const {$refObjects, ...configOmitRefObjects} = testConfig;
            widgetConfigResolverService.resolveConfig$(configOmitRefObjects).subscribe((resolved) => {
                expect(resolved).toEqual({
                    'testWidget': {
                        'configType': 'testWidget',
                        'deeply': {
                            'nested': {
                                'reference': [
                                    {
                                        '$ref': 'defaultNotionalNumericColumns',
                                    },
                                ],
                            },
                        },
                        'reference': {
                            '$ref': 'customCalculationColumn',
                        },
                        'size': {
                            'height': 6,
                            'width': 8,
                        },
                        'title': 'Time series chart',
                    },
                });
                done();
            });
        });

        it('should correctly handle references to non-existent objects', (done) => {
            const consoleLogSpy = jest.spyOn(console, 'error').mockImplementationOnce(() => undefined);
            const {$refObjects: {customCalculationColumn, ...omitCustomCalcRef}, ...omitRefObjects} = testConfig;
            const configWithMissingReference = {
                ...omitRefObjects,
                $refObjects: omitCustomCalcRef
            };

            widgetConfigResolverService.resolveConfig$(configWithMissingReference).subscribe((resolved) => {
                expect(resolved).toEqual({
                    'testWidget': {
                        'configType': 'testWidget',
                        'deeply': {
                            'nested': {
                                'reference': [
                                    {
                                        'categoryTitle': 'Measures',
                                        'categoryType': 'columns',
                                        'inputs': [
                                            {
                                                'columnFilters': [
                                                    {
                                                        'key': 'reportTypes',
                                                        'type': '=',
                                                        'value': 'SINGLE',
                                                    },
                                                    {
                                                        'key': 'dataType',
                                                        'type': '=',
                                                        'value': [
                                                            'TIME_SPAN',
                                                            'INT',
                                                            'DOUBLE',
                                                        ],
                                                    },
                                                ],
                                                'default': [
                                                    {
                                                        'columnKey': 'pct_notional_val_0',
                                                        'columnTag': 'pct_notional_val',
                                                        'positionColumnType': 'PORT',
                                                        'title': 'Notional Market Value %',
                                                    },
                                                ],
                                                'inputConfigType': 'columns',
                                                'inputName': 'columns',
                                                'mandateSettingType': 'CHART_REPORT',
                                                'valueField': 'columnTag',
                                            },
                                        ],
                                        'noAccordion': true,
                                    },
                                ],
                            },
                        },
                        'reference': undefined,
                        'size': {
                            'height': 6,
                            'width': 8,
                        },
                        'title': 'Time series chart',
                    },
                });
                expect(consoleLogSpy.mock.calls[0][0]).toEqual('Could not find reference object customCalculationColumn for object');
                consoleLogSpy.mockRestore();
                done();
            });
        });

        it('should include a loading message as part of the request if specified', (done) => {
            const generateUniqueIdAsStringSpy = jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockImplementationOnce(() => 'abcde89');
            widgetConfigResolverService.resolveConfig$(testConfig, {requestLoadingMessage: 'TEST Loading widget configs...'})
                .subscribe((resolved) => {
                    expect(resolved).toBeTruthy();
                    expect(httpMock.get.mock.calls[0][1]).toEqual({
                        'params': {
                            'cloneFrom': {
                                'cloneFrom': null,
                                'encoder': {},
                                'map': null,
                                'updates': null,
                            },
                            'encoder': {},
                            'map': null,
                            'updates': [
                                {
                                    'op': 's',
                                    'param': 'loadingKey',
                                    'value': 'ld_abcde89',
                                },
                                {
                                    'op': 's',
                                    'param': 'loadingMessage',
                                    'value': 'TEST Loading widget configs...',
                                },
                            ],
                        },
                    });

                    generateUniqueIdAsStringSpy.mockRestore();
                    done();
                });
        });
    });

    describe('should correctly form widget config paths', () => {
        const providers = [
            {
                provide: HttpClient,
                useValue: httpMock
            },
            {
                provide: WidgetConfigResolverService,
                useClass: WidgetConfigResolverService
            }
        ];

        const getWidgetConfigResolverServiceForTest = (additionalProviders: any[]): WidgetConfigResolverService => {
            TestBed.configureTestingModule({
                providers: [
                    ...providers,
                    ...additionalProviders
                ]
            });

            return TestBed.inject(WidgetConfigResolverService);
        };

        const TEST_WIDGET_CONFIG_FILE_NAME = 'test-widget.json';
        const EXPECTED_WIDGET_CONFIG_PATH = `path/to/my/configs/${TEST_WIDGET_CONFIG_FILE_NAME}`;

        beforeEach(() => {
            httpMock.get.mockClear();
        });

        it('with no trailing slash', (done) => {
            const service = getWidgetConfigResolverServiceForTest([
                {provide: WIDGET_CONFIG_DIRECTORY_TOKEN, useValue: 'path/to/my/configs'}
            ]);

            service.resolveConfig$(testConfig).subscribe(() => {
                expect(httpMock.get.mock.calls[0][0]).toEqual(EXPECTED_WIDGET_CONFIG_PATH);
                done();
            });
        });

        it('with a single trailing slash', (done) => {
            const service = getWidgetConfigResolverServiceForTest([
                {provide: WIDGET_CONFIG_DIRECTORY_TOKEN, useValue: 'path/to/my/configs/'}
            ]);

            service.resolveConfig$(testConfig).subscribe(() => {
                expect(httpMock.get.mock.calls[0][0]).toEqual(EXPECTED_WIDGET_CONFIG_PATH);
                done();
            });
        });

        it('with an abundance of trailing slashes', (done) => {
            const service = getWidgetConfigResolverServiceForTest([
                {provide: WIDGET_CONFIG_DIRECTORY_TOKEN, useValue: 'path/to/my/configs////'}
            ]);

            service.resolveConfig$(testConfig).subscribe(() => {
                expect(httpMock.get.mock.calls[0][0]).toEqual(EXPECTED_WIDGET_CONFIG_PATH);
                done();
            });
        });

        it('with an empty string', (done) => {
            const service = getWidgetConfigResolverServiceForTest([
                {provide: WIDGET_CONFIG_DIRECTORY_TOKEN, useValue: ''}
            ]);

            service.resolveConfig$(testConfig).subscribe(() => {
                // Expect that we resolve relative to the base path, rather than the root
                expect(httpMock.get.mock.calls[0][0]).toEqual(TEST_WIDGET_CONFIG_FILE_NAME);
                done();
            });
        });

        it('with a solitary slash', (done) => {
            const service = getWidgetConfigResolverServiceForTest([
                {provide: WIDGET_CONFIG_DIRECTORY_TOKEN, useValue: '/'}
            ]);

            service.resolveConfig$(testConfig).subscribe(() => {
                // Expect that we resolve relative to the base path, rather than the root
                expect(httpMock.get.mock.calls[0][0]).toEqual(TEST_WIDGET_CONFIG_FILE_NAME);
                done();
            });
        });
    });
});
