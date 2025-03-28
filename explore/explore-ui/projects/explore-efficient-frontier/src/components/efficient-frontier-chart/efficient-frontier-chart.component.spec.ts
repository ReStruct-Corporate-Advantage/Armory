import {ComponentFixture, TestBed} from '@angular/core/testing';
import {EfficientFrontierChartComponent} from './efficient-frontier-chart.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('EfficientFrontierChartComponent', () => {
    let component: EfficientFrontierChartComponent;
    let fixture: ComponentFixture<EfficientFrontierChartComponent>;

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

    const selectedYAxisColumn = {
        'columnKey': 'expectedReturn',
        'columnTitle': 'Return (Active)',
        'dataType': 'DOUBLE',
        'isSubtotalable': true,
        'formatter': {
            'scalingFactor': 0.01,
            'decimalPlaces': 4
        }
    };

    const selectedXAxisColumn = {
        'columnKey': 'max_total_risk',
        'columnTitle': 'Risk (Active)',
        'dataType': 'DOUBLE',
        'isSubtotalable': true,
        'formatter': {
            'scalingFactor': 0.01,
            'decimalPlaces': 4
        }
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EfficientFrontierChartComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(EfficientFrontierChartComponent);
        component = fixture.componentInstance;
        component.selectedYAxisColumn = selectedYAxisColumn;
        component.selectedXAxisColumn = selectedXAxisColumn;
        component.portfolio = 'ILB';
        component.latestOptimizationRunDetails = latestOptimizationRunDetails as any;
        fixture.detectChanges();
    });

    it('test ngOnChanges', () => {
        jest.spyOn(component, 'initializeChartContext');
        component.ngOnChanges({selectedYAxisColumn: {currentValue: 'return', previousValue: 'return'}, selectedXAxisColumn: {currentValue: 'risk', previousValue: 'risk'}} as any);
        expect(component.initializeChartContext).not.toHaveBeenCalled();
        component.ngOnChanges({selectedYAxisColumn: {currentValue: 'return', previousValue: 'return'}, selectedXAxisColumn: {currentValue: 'risk', previousValue: 'return'}} as any);
        expect(component.initializeChartContext).toHaveBeenCalledTimes(1);
        component.ngOnChanges({selectedYAxisColumn: {currentValue: 'return', previousValue: 'risk'}, selectedXAxisColumn: {currentValue: 'risk', previousValue: 'risk'}} as any);
        expect(component.initializeChartContext).toHaveBeenCalledTimes(2);
    });

    describe('format Test', () => {

        it('format on null and non numeric data', () => {
            let output = component.formatValue('abc', {});
            expect(output).toBe('abc');

            output = component.formatValue(null, {});
            expect(output).toBe(null);

            output = component.formatValue(undefined, {});
            expect(output).toBe(null);

            output = component.formatValue('', {});
            expect(output).toBe('');
        });

        it('format on numeric data', () => {
            let output = component.formatValue(0.12345, {scalingFactor: 0.01});
            expect(output).toBe('12');

            output = component.formatValue(0.12345, {scalingFactor: 0.01, decimalPlaces: 2});
            expect(output).toBe('12.35');
        });
    });
});
