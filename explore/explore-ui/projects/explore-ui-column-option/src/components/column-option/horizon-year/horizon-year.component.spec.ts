import {HorizonYearComponent} from './horizon-year.component';
import {ColumnOptionTestBed} from '../../../test-utils';
import {HorizonYearColumnOption} from '../../../models/column-option/horizon-year-column-option.model';
import {ChangeDetectorRef} from '@angular/core';

describe('HorizonYearComponent', () => {
    let testBed: ColumnOptionTestBed<HorizonYearComponent, HorizonYearColumnOption>;
    let component: HorizonYearComponent;

    const changeDetectorRefMock = {
        markForCheck: jest.fn()
    };

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionAttributes: [{
                'title': 'Horizon Options',
                'key': 'horizonYear',
                'dataType': 'S'
            }],
            columnOptionTitle: 'Horizon Options',
            columnOptionKey: 'horizonOptions'
        };

        const hzOption = new HorizonYearColumnOption();
        hzOption.horizonList = [1, 3, 5];

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<HorizonYearComponent, HorizonYearColumnOption>
        (HorizonYearComponent,
            hzOption,
            mockedOption,
            undefined,
            undefined,
            undefined,
            undefined, [{provide: ChangeDetectorRef, useValue: changeDetectorRefMock}]);

        component = testBed.component;
        component.horizonYearSelection = [];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return horizonYearCheckboxData', () => {
        component.optionValue.horizonList = [1, 3];
        component['initializeComponent']();
        expect(component.horizonYearSelection.length).toBe(4);
        // test all horizonYearCheckboxData1 values
        expect(component.horizonYearSelection[0].checked).toBeTruthy();
        expect(component.horizonYearSelection[1].checked).toBeTruthy();
        expect(component.horizonYearSelection[2].checked).toBeFalsy();
        expect(component.horizonYearSelection[3].checked).toBeFalsy();
    });

    // test onCheckboxGroupChanged method
    it('should call onCheckboxGroupChanged method', () => {
        component.optionValue.horizonList = [1, 3];
        const event = {
            detail: {
                value: [{checked: true, eventData: 1}, {checked: true, eventData: 3}, {checked: true, eventData: 5}, {checked: false, eventData: 10}]
            }
        };
        component.onCheckboxGroupChanged(event as any);
        expect(component.optionValue.horizonList.includes(5)).toBeTruthy();
    });

    it('should not return horizonYearCheckboxData ', () => {
        component.optionValue.horizonList = [];
        component['initializeComponent']();
        expect(component.horizonYearSelection.length).toBe(4);
        // test all horizonYearCheckboxData1 values
        expect(!component.horizonYearSelection[0].checked).toBeTruthy();
        expect(!component.horizonYearSelection[1].checked).toBeTruthy();
        expect(component.horizonYearSelection[2].checked).toBeFalsy();
        expect(component.horizonYearSelection[3].checked).toBeFalsy();
    });

    it('should call onCheckboxGroupChanged method for unchecked boxes', () => {
        component.optionValue.horizonList = [];
        const event = {
            detail: {
                value: [{checked: false, eventData: 1}, {checked: false, eventData: 3}, {checked: false, eventData: 5}, {checked: false, eventData: 10}]
            }
        };
        component.onCheckboxGroupChanged(event as any);
        expect(component.optionValue.horizonList.length === 0).toBeTruthy();
    });
});
