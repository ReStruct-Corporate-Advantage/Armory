import { ComponentFixture, TestBed } from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ColumnStaticValuesService} from '@blk/explore-ui-column-option';
import {ColumnStaticStringValue, NOTIFICATION_SERVICE_TOKEN} from '@blk/explore-ui-core';
import { RestrictImpliedShockComponent } from './restrict-implied-shock.component';
import {Observable, of, throwError} from 'rxjs';

describe('RestrictImpliedShockComponent', () => {
    let component: RestrictImpliedShockComponent;
    let fixture: ComponentFixture<RestrictImpliedShockComponent>;
    const columnStaticValuesServiceMock = {
        getColumnStaticValues$: jest.fn(),
        getColumnStaticValuesForColumns$: jest.fn(_colTags => of([])),
    };

    const notificationServiceMock = {
        error: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RestrictImpliedShockComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: ColumnStaticValuesService, useValue: columnStaticValuesServiceMock}, {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceMock}]
        });

        fixture = TestBed.createComponent(RestrictImpliedShockComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('test method fetchStaticValuesForBreakdownTags', () => {
        it('test for success', () => {
            const columnStaticValues = [{
                value: 'BND',
                desc: 'Sec Group',
                displayName: 'BOND',
            }];
            jest.spyOn(component['columnStaticValuesService'], 'getColumnStaticValuesForColumns$').mockImplementation(_colTags => of(columnStaticValues) as unknown as Observable<ColumnStaticStringValue[]>);
            component.selections = undefined;
            component['fetchStaticValuesForBreakdownTags']();
            expect(component.selections).not.toBeUndefined();
            expect(component.selections[0].values.length).toEqual(2);
        });

        it('test for error', () => {
            jest.spyOn(component['columnStaticValuesService'], 'getColumnStaticValuesForColumns$').mockImplementation(_colTags => throwError( () => 'Error'));
            component.selections = undefined;
            component['fetchStaticValuesForBreakdownTags']();
            expect(component.selections).not.toBeUndefined();
            expect(component.selections[0].values.length).toEqual(0);
        });
    });

    it('test method initializeSelectedOptions', () => {
        component.selections = [{ values: [
            {
                displayValue: 'A',
                value: 'A',
            },
        ]}];
        component.value = [ 'A', 'X-Y' ];

        expect(component.showOtherTextField).toBeFalsy();
        expect(component.otherShocksValue).toBeUndefined();
        expect(component.selectedOptionValues.length).toBe(0);

        component['initializeSelectedOptions']();

        expect(component.selectedOptionValues.length).toBe(1);
        expect(component.selectedOptionValues[0]).toBe('A');
        expect(component.showOtherTextField).toBeTruthy();
        expect(component.otherShocksValue).toBe('X-Y');
    });

    it('test method onSelectionsChange', () => {
        expect(component.showOtherTextField).toBeFalsy();
        jest.spyOn(component.valueChange, 'emit');

        const options = [
            {
                displayValue: 'A',
                value: 'A',
            },
            {
                displayValue: 'Other',
                value: 'OTHER_VAL',
            },
        ];
        component.otherShocksValue = 'X-Y,Z';

        component.onSelectionsChange(options);

        expect(component.showOtherTextField).toBeTruthy();
        expect(component.valueChange.emit).toHaveBeenCalledWith([ 'A', 'X-Y', 'Z']);
    });

    it('test method onOtherShockValueChanged', () => {
        jest.spyOn(component.valueChange, 'emit');
        const otherShocksValue = 'X-Y,Z';
        component.onOtherShockValueChanged(otherShocksValue);
        expect(component.otherShocksValue).toEqual(otherShocksValue);
        expect(component.valueChange.emit).toHaveBeenCalledWith([ 'X-Y', 'Z']);
    });

});

