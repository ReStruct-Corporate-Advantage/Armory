import {TestBed} from '@angular/core/testing';
import {HttpParams} from '@angular/common/http';
import {
    ColumnConfig,
    ColumnOptionFactory,
    HTTP_SERVICE_TOKEN,
    PerformanceSettings
} from '@blk/explore-ui-core';
import {Observable, of} from 'rxjs';
import {ColumnOptionResponse} from '../interfaces';
import {ColumnOptionsStore} from '../stores/column-options.store';
import {ColumnOptionService} from './column-option.service';
import {AggregationColumnOption} from '../models/column-option/aggregation-column-option.model';
import {SelectedColumnSelectorOption} from '../models/ui/selected-column-selector-option.model';
import {ColumnSet} from '../models/column-set/column-set.model';
import {ColumnOptionInitializer} from '../column-option.initializer';

describe('ColumnService', () => {
    let service: ColumnOptionService;
    const columnOptionsResponseMock: any = {
        data: [{colTag: 'market_val', uses: 'PORT', options: [{ columnOptionTitle: 'title1', columnOptionConfigType: 'configType1'}]},
            {colTag: 'cusip', uses: 'ALL', options: [{ columnOptionTitle: 'title2', columnOptionConfigType: 'configType2'}]}]
    };
    const http2BmsServiceStub = {
        post$: jest.fn((): Observable<any> => of(columnOptionsResponseMock))
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [{provide: HTTP_SERVICE_TOKEN, useValue: http2BmsServiceStub}, ColumnOptionService]
        });

        service = TestBed.inject(ColumnOptionService);

        ColumnOptionInitializer.registerColumnConfigTypes();
        ColumnOptionInitializer.registerColumnOptionTypes();
    });

    afterEach(() => {
        http2BmsServiceStub.post$.mockClear();
        service.inProgressColumnOptionRequests.clear();
    });

    describe('fetchColumnOptions$', () => {
        it('should make http call if data is not cached', (done: any) => {
            // Arrange
            ColumnOptionsStore.columnOptions.clear();

            const cols: any = [{colTag: 'market_val', use: 'PORT'}, {colTag: 'cusip', use: 'ALL'}];

            // Act
            service.fetchColumnOptions$(cols)
                .subscribe((response: ColumnOptionResponse[]) => {

                    expect(http2BmsServiceStub.post$).toHaveBeenCalledWith('bulkColumnOptions', {colList: cols}, new HttpParams());
                    expect(response.length).toBe(2);
                    expect(response[0].colTag).toBe('market_val');
                    expect(response[0].use).toBe('PORT');
                    expect(response[0].options.length).toBe(1);
                    expect(response[0].options[0].columnOptionTitle).toBe('title1');
                    expect(response[0].options[0].columnOptionConfigType).toBe('configType1');

                    expect(response[1].colTag).toBe('cusip');
                    expect(response[1].use).toBe('ALL');
                    expect(response[1].options.length).toBe(1);
                    expect(response[1].options[0].columnOptionTitle).toBe('title2');
                    expect(response[1].options[0].columnOptionConfigType).toBe('configType2');

                    done();
                });
        });

        it('should take data from cache if already cached', (done: any) => {
            // Arrange
            const columnOptionsMock = {
                columnOptionKey: 'configType',
                columnOptionTitle: 'columnOptionTitle',
                columnOptionConfigType: 'configType',
                columnOptionAttributes: [
                    {
                        title: 'customCalculation',
                        key: 'customCalculation',
                        dataType: 'S'
                    }
                ]
            };
            ColumnOptionsStore.columnOptions.clear();
            ColumnOptionsStore.columnOptions.set('market_val_PORT_ColumnOption', [columnOptionsMock]);

            // Act
            service.fetchColumnOptions$([{colTag: 'market_val', use: 'PORT'}])
                .subscribe((response: ColumnOptionResponse[]) => {
                    // Assert
                    expect(http2BmsServiceStub.post$).not.toHaveBeenCalled();
                    expect(response.length).toBe(1);
                    expect(response[0].colTag).toBe('market_val');
                    expect(response[0].use).toBe('PORT');
                    expect(response[0].options.length).toBe(1);
                    expect(response[0].options[0].columnOptionTitle).toBe('columnOptionTitle');
                    expect(response[0].options[0].columnOptionConfigType).toBe('configType');
                    expect(response[0].options[0].columnOptionAttributes.length).toBe(1);
                    done();
                });
        });

        it('should take return the original observable if request is in progress', (done: any) => {
            // Arrange
            const columnOptionsMock = {
                columnOptionKey: 'configType',
                columnOptionTitle: 'columnOptionTitle',
                columnOptionConfigType: 'configType',
                columnOptionAttributes: [
                    {
                        title: 'customCalculation',
                        key: 'customCalculation',
                        dataType: 'S'
                    }
                ]
            };
            // Mock an existing observable
            service.bulkColumnOptionsObservable = of('TEST');
            ColumnOptionsStore.columnOptions.clear();
            ColumnOptionsStore.columnOptions.set('market_val_PORT_ColumnOption', [columnOptionsMock]);
            service.inProgressColumnOptionRequests.set('market_val_PORT_ColumnOption', true);

            // Act
            service.fetchColumnOptions$([{colTag: 'market_val', use: 'PORT'}])
                .subscribe((response: ColumnOptionResponse[]) => {
                    // Assert
                    expect(response).toEqual('TEST');
                    done();
                });
        });

        it('should take data from cache if already cached and make http call for ones not in cache', (done: any) => {
            // Arrange
            const columnOptionsMock = {
                columnOptionKey: 'configType',
                columnOptionTitle: 'columnOptionTitle',
                columnOptionConfigType: 'configType',
                columnOptionAttributes: [
                    {
                        title: 'customCalculation',
                        key: 'customCalculation',
                        dataType: 'S'
                    }
                ]
            };
            ColumnOptionsStore.columnOptions.clear();
            ColumnOptionsStore.columnOptions.set('market_val_BENCH_ColumnOption', [columnOptionsMock]);
            service.inProgressColumnOptionRequests = new Map<string, boolean>();

            // Act
            service.fetchColumnOptions$([{colTag: 'market_val', use: 'BENCH'}, {colTag: 'market_val', use: 'PORT'}, {colTag: 'cusip', use: 'ALL'}])
                .subscribe((response: ColumnOptionResponse[]) => {
                    expect(http2BmsServiceStub.post$).toHaveBeenCalledWith('bulkColumnOptions', {
                        colList: [{
                            colTag: 'market_val',
                            columnOptionType: 'ColumnOption',
                            use: 'PORT'
                        }, {
                            colTag: 'cusip',
                            columnOptionType: 'ColumnOption',
                            use: 'ALL'
                        }]
                    }, new HttpParams());
                    expect(response.length).toBe(3);
                    expect(response[0].colTag).toBe('market_val');
                    expect(response[0].use).toBe('BENCH');
                    expect(response[0].options.length).toBe(1);
                    expect(response[0].options[0].columnOptionTitle).toBe('columnOptionTitle');
                    expect(response[0].options[0].columnOptionConfigType).toBe('configType');
                    expect(response[0].options[0].columnOptionAttributes.length).toBe(1);
                    expect(response[1].colTag).toBe('market_val');
                    expect(response[1].use).toBe('PORT');
                    expect(response[1].options.length).toBe(1);
                    expect(response[1].options[0].columnOptionTitle).toBe('title1');
                    expect(response[1].options[0].columnOptionConfigType).toBe('configType1');
                    expect(response[2].colTag).toBe('cusip');
                    expect(response[2].use).toBe('ALL');
                    expect(response[2].options.length).toBe(1);
                    expect(response[2].options[0].columnOptionTitle).toBe('title2');
                    expect(response[2].options[0].columnOptionConfigType).toBe('configType2');
                    done();
                });
        });
    });

    describe('fetchAndPopulateColumnOptions$', () => {
        let mockCallbackFunction: jest.Mock;
        let columnOptionFactorySpy: jest.SpyInstance;
        let optionDefinitionsSpy: jest.SpyInstance;

        beforeEach(() => {
            ColumnOptionsStore.columnOptions.clear();

            const columnOptionsResponse: any = {
                data: [
                    {
                        colTag: 'market_val',
                        uses: 'PORT',
                        options: [
                            {
                                columnOptionTitle: 'Mock Aggregation Column Opt Title',
                                columnOptionConfigType: AggregationColumnOption.CONFIG_TYPE,
                                columnOptionAttributes: [
                                    {
                                        title: 'Aggregation',
                                        key: 'aggregation',
                                        dataType: 'numeric',
                                        defaultValue: {value: 2, label: 'Sum'}
                                    }
                                ]
                            },
                            {
                                columnOptionTitle: 'Mock Performance Column Opt Title',
                                columnOptionConfigType: PerformanceSettings.CONFIG_TYPE,
                                columnOptionAttributes: []
                            }
                        ]
                    }
                ]
            };
            jest.spyOn(http2BmsServiceStub, 'post$').mockReturnValueOnce(of(columnOptionsResponse));

            mockCallbackFunction = jest.fn();
            columnOptionFactorySpy = jest.spyOn(ColumnOptionFactory, 'createModel');
            optionDefinitionsSpy = jest.spyOn(service, 'getOptionDefinitions');
        });

        afterEach(() => {
            mockCallbackFunction.mockClear();
            columnOptionFactorySpy.mockClear();
            optionDefinitionsSpy.mockClear();
        });

        it('should fetch and populate column options', (done) => {
            const columnConfig = ColumnConfig.createColumn('market_val', 'PORT');
            const columnSelectorOptionMock = new SelectedColumnSelectorOption(columnConfig, []);

            service.fetchAndPopulateColumnOptions$([columnSelectorOptionMock], [], null, mockCallbackFunction)
                .subscribe(() => {
                    expect(http2BmsServiceStub.post$).toHaveBeenCalledTimes(1);

                    expect(columnConfig.optionValues.length).toEqual(2);
                    expect(columnOptionFactorySpy).toHaveBeenCalledTimes(2);
                    expect(columnConfig.optionValues[0] instanceof AggregationColumnOption).toBeTruthy();
                    expect(columnConfig.optionValues[1] instanceof PerformanceSettings).toBeTruthy();

                    expect(mockCallbackFunction).toHaveBeenCalledTimes(1);
                    expect(mockCallbackFunction).toHaveBeenCalledWith(columnConfig);
                    expect(optionDefinitionsSpy).toHaveBeenCalled();

                    done();
                });
        });

        it('should use existing column option models if present in the column config', (done) => {
            const columnConfig = ColumnConfig.createColumn('market_val', 'PORT');
            // Simulate a column with existing options
            columnConfig.optionValues = [
                new AggregationColumnOption(),
                new PerformanceSettings()
            ];
            const columnSelectorOptionMock = new SelectedColumnSelectorOption(columnConfig, []);

            service.fetchAndPopulateColumnOptions$([columnSelectorOptionMock], [], null, mockCallbackFunction)
                .subscribe(() => {
                    expect(http2BmsServiceStub.post$).toHaveBeenCalledTimes(1);

                    expect(columnConfig.optionValues.length).toEqual(2);
                    expect(columnOptionFactorySpy).not.toHaveBeenCalled();

                    expect(mockCallbackFunction).toHaveBeenCalledTimes(1);
                    expect(mockCallbackFunction).toHaveBeenCalledWith(columnConfig);

                    done();
                });
        });
            });

    describe('validateChildColumns$', () => {

        beforeEach(() => {
            ColumnOptionsStore.columnOptions.clear();

            const columnOptionsResponse: any = {
                data: true,
                message: 'Error notification'
            };
            jest.spyOn(http2BmsServiceStub, 'post$').mockReturnValueOnce(of(columnOptionsResponse));
        });

        it('should validate if child columns are spawned', (done) => {
            const columnSetMock = new ColumnSet();
            service.isSingleChildColumn$(columnSetMock)
                .subscribe(() => {
                    expect(http2BmsServiceStub.post$).toHaveBeenCalledTimes(1);
                    done();
                });
        });
    });

});
