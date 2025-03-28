import {EfficientFrontierResponse, RequestConfig} from '../interfaces/common.interface';
import {createDataCube, getBreakdownLevels, ROOT_LEVEL} from './qbstr.adapter';
import {AggregationKey, createQK, GroupByKey} from '@qbstr/data-cube';

describe('qbstr adapter tests', () => {

    let config: RequestConfig;
    let response: EfficientFrontierResponse;

    beforeAll(() => {
        config = {
            columns: [
                {
                    columnKey: 'expectedReturn',
                    columnTitle: 'Return (Active)',
                    dataType: 'DOUBLE',
                    formatter: {
                        decimalPlaces: 4,
                        scalingFactor: 0.01
                    },
                    isSubtotalable: true
                }
            ],
            portfolio: 'ILB'
        };

        response = {
            data: {
                columns: ['expectedReturn'],
                data: {
                    children: [
                        {
                            data: [
                                '7.482802'
                            ],
                            rowId: 2,
                            title: '1'
                        }
                    ],
                    data: [
                        null
                    ],
                    rowId: 1
                }
            }
        };
    });

    it('should do breakdown levels #1', () => {
        expect(getBreakdownLevels(response.data.data)).toEqual([ROOT_LEVEL, 'level-1']);
    });

    it('should do breakdown levels #2', () => {
        expect(getBreakdownLevels(undefined)).toEqual([ROOT_LEVEL]);
    });

    it('should create cube #1', () => {
        const {cube} = createDataCube(config, response);
        expect(cube).toBeTruthy();
    });

    it('should create cube and group keys should exist#1', (done) => {
        const {cube} = createDataCube(config, response);
        expect(cube).toBeTruthy();
        const ck = createQK([ new GroupByKey(ROOT_LEVEL), new AggregationKey('expectedReturn', 'sum')]);
        expect(cube.has(ck)).toBeTruthy();
        cube.get(ck).subscribe(data => {
            expect(data).toEqual([{
                expectedReturn: null,
                rowId: 1,
                _ROOT_: 'ILB'
            }]);
            done();
        });
    });
})
