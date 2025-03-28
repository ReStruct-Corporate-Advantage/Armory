import {TestBed} from '@angular/core/testing';

import {EfficientFrontierChartService} from './efficient-frontier-chart-service';

describe('EfficientFrontierChartService', () => {
    let service: EfficientFrontierChartService;

    const latestOptimizationRunDetails = [{
        'expectedSpecificVolatility': ['2.406996E-4', '2.406996E-4'],
        'constraintBoundValues': {'max_total_risk': 1},
        'spreadTcostOfTrades': '1.094350E-9',
        'expectedReturn': ['7.482802E-7', '7.482802E-7'],
        'tcostOfTrades': '1.094350E-9',
        'turnover': '1.094350E-09',
        'expectedVolatility': ['6.242770E-4', '6.242770E-4'],
        'expectedFactorVolatility': ['5.760082E-4', '5.760082E-4']
    }];

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(EfficientFrontierChartService);
    });

    it('test transformDataToFrontierResponse', () => {
        const response = service.transformDataToFrontierResponse(latestOptimizationRunDetails as any, 'expectedReturn', 'max_total_risk');
        expect(response).toEqual({
            'data': {
                'columns': [
                    'expectedReturn',
                ],
                'data': {
                    'children': [
                        {
                            'data': ['7.482802E-7'],
                            'rowId': 2,
                            'title': 1,
                        },
                    ],
                    'data': [null],
                    'rowId': 1,
                },
            },
        });
    });

    it('test getRequestConfig', () => {
        const requestConfig = service.getRequestConfig('ILB', 'expectedReturn');
        expect(requestConfig).toEqual({
            'columns': [
                {
                    'columnKey': 'expectedReturn',
                    'columnTitle': 'Returns (Active) - Alpha Score',
                    'dataType': 'DOUBLE',
                    'formatter': {
                        'decimalPlaces': 4,
                        'scalingFactor': 0.01,
                    },
                    'isSubtotalable': true,
                },
            ],
            'portfolio': 'ILB',
        });
    });
});
