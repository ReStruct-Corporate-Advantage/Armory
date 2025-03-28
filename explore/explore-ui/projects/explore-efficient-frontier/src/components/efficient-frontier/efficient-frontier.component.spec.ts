import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EfficientFrontierComponent} from './efficient-frontier.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('EfficientFrontierComponent', () => {
    let component: EfficientFrontierComponent;
    let fixture: ComponentFixture<EfficientFrontierComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EfficientFrontierComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(EfficientFrontierComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('test ngOnInit', () => {
        component.ngOnInit();
        expect(component.xAxis[0].values.length).toEqual(1);
        expect(component.yAxis[0].values.length).toEqual(5);
        expect(component.selectedXAxisColumn.columnKey).toEqual('max_total_risk');
        expect(component.selectedYAxisColumn.columnKey).toEqual('expectedReturn');
    });

    it('test initializeAxisColumns for already persisted selectedYAxis', () => {
        //if selectedYAxis column already persisted
        component.selectedYAxis = 'expectedVolatility';
        component.initializeAxisColumns();
        expect(component.selectedYAxisColumn.columnKey).toEqual('expectedVolatility');
    });

    it('tests ngOnChanges', () => {
        jest.spyOn(component, 'initializeAxisColumns');

        // scenario 0 - no changes
        component.ngOnChanges({});
        expect(component.initializeAxisColumns).not.toHaveBeenCalled();

        // scenario 1 - changes in latestOptimizationRunDetails
        component.ngOnChanges({latestOptimizationRunDetails: {}} as any);
        expect(component.initializeAxisColumns).toHaveBeenCalled();
    });

    it('test onYAxisColumnChanged', () => {
        expect(component.selectedYAxisColumn.columnKey).toEqual('expectedReturn');
        component.onYAxisColumnChanged({detail: {value: {value: {columnKey: 'expectedVolatility'}}}} as any);
        expect(component.selectedYAxisColumn.columnKey).toEqual('expectedVolatility');
    });

    it('test onXAxisColumnChanged', () => {
        expect(component.selectedXAxisColumn.columnKey).toEqual('max_total_risk');
        component.onXAxisColumnChanged({detail: {value: {value: {columnKey: 'expectedReturn'}}}} as any);
        expect(component.selectedXAxisColumn.columnKey).toEqual('expectedReturn');
    });
});
