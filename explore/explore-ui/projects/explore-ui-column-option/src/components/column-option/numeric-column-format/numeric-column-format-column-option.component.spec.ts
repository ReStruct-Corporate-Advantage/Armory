import {AuxNumericStepper} from '@blk/aladdin-angular-components';
import {ColumnDefinition, NumericColumnFormat} from '@blk/explore-ui-core';
import {of} from 'rxjs';
import {NumericColumnFormatColumnOption} from '../../../models/column-option/numeric-column-format-column-option.model';
import {UiColumnOptionService} from '../../../services/ui-column-option.service';
import {LibColumnUtils} from '../../../utils';
import {ColumnOptionTestBed} from '../../../test-utils';
import {NumericColumnFormatColumnOptionComponent} from './numeric-column-format-column-option.component';

describe('Numeric Column Format ColumnOption component test case', () => {
    let testBed: ColumnOptionTestBed<NumericColumnFormatColumnOptionComponent, NumericColumnFormatColumnOption>;

    const uiColumnOptionServiceStub = {
        getOverrideDateSelection$: jest.fn( () => of())
    };

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockData = {
            decimalPlaces: 1,
            useThousandsSeparator: true
        };

        const allPossibleScalingOptions: Map<string, number> = new Map<string, number>();
        allPossibleScalingOptions.set('Percent (%)', 1);
        allPossibleScalingOptions.set('Basis Point (bp)', 0.01);
        const numericColumnFormat: NumericColumnFormat = new NumericColumnFormat();
        numericColumnFormat.scalingOptions = allPossibleScalingOptions;
        numericColumnFormat.isUseThousandsSeparator = true;
        numericColumnFormat.decimalPlaces = 1;
        numericColumnFormat.scalingFactor = 0.01;

        const mockedColumnDef: ColumnDefinition = new ColumnDefinition();
        mockedColumnDef.columnFormat = numericColumnFormat;

        jest.spyOn(LibColumnUtils, 'getColumnDefinition').mockImplementationOnce(() => {
            return mockedColumnDef;
        });

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<NumericColumnFormatColumnOptionComponent, NumericColumnFormatColumnOption>(
            NumericColumnFormatColumnOptionComponent,
            new NumericColumnFormatColumnOption(),
            mockData,
            null,
            null,
            null,
            null,
            [{provide: UiColumnOptionService, useValue: uiColumnOptionServiceStub}]

        );
        testBed.component.numericColFormat = numericColumnFormat;
    });

    it('should have aux-numeric-stepper component', () => {
        const compiled = testBed.fixture.debugElement.nativeElement;
        expect(compiled.querySelector('aux-numeric-stepper')).not.toBe(null);
        expect(compiled.querySelector('aux-checkbox')).not.toBe(null);
    });

    it('When the numeric stepper value will changed the value in the model should update', () => {
        testBed.component.maxDecimalPlaces = 8;
        testBed.component.decimalPlacesNumericStepper = ({ setValue: jest.fn()} as any) as AuxNumericStepper;
        let event = {detail: {value: 2}};
        testBed.component.onValueChangedHandler(event as CustomEvent);
        expect(testBed.component.optionValue.decimalPlaces).toBe(2);
        event = {detail: {value: -2}};
        testBed.component.onValueChangedHandler(event as CustomEvent);
        expect(testBed.component.optionValue.decimalPlaces).toBe(2);
        expect(testBed.component.decimalPlacesNumericStepper.setValue).toHaveBeenCalledWith('2');
        event = {detail: {value: 8}};
        testBed.component.onValueChangedHandler(event as CustomEvent);
        expect(testBed.component.optionValue.decimalPlaces).toBe(8);
        event = {detail: {value: 9}};
        testBed.component.onValueChangedHandler(event as CustomEvent);
        expect(testBed.component.optionValue.decimalPlaces).toBe(8);
        event = {detail: {value: 2.7}};
        testBed.component.onValueChangedHandler(event as CustomEvent);
        expect(testBed.component.optionValue.decimalPlaces).toBe(8);
    });

    it('When useThousandSeparator value will change the value in the model should update', () => {
        const event = {detail: {value: {checked: false}}};
        testBed.component.onCheckboxChange(event as CustomEvent);
        expect(testBed.component.optionValue.useThousandsSeparator).toBe(false);
    });

    it('Check if allPossible Scaling option is properly populated', () => {
        expect(testBed.component.allScalingOptions.size).toBe(2);
        expect(testBed.component.allScalingOptions.has('Percent (%)')).toBeTruthy();
        expect(testBed.component.allScalingOptions.has('Any Dummy Value')).toBeFalsy();
    });

    it('Populating aux-data for scaling options', () => {
        const dummyScalingOptions:  Map<string, number> = new Map<string, number>();
        dummyScalingOptions.set('Thousands (m)', 1000);
        dummyScalingOptions.set('Millions (mm)', 1000000);
        dummyScalingOptions.set('None', 1);

        // All checked boolean is false, as in our component scaling Factor is 0.01
        const auxScalingData = [{'checked': false, 'disabled': false, 'label': 'None'},
            {'checked': false, 'disabled': false, 'label': 'Thousands (m)'},
            {'checked': false, 'disabled': false, 'label': 'Millions (mm)'}];

        testBed.component.allScalingOptions = dummyScalingOptions;
        // Empty the already populated aux-scaling-data
        testBed.component.stackedScalingOptionData = [];
        testBed.component.getStackedScalingData();
        expect(testBed.component.stackedScalingOptionData).toStrictEqual(auxScalingData);
    });

    it('If scaling options gets changed change in option values', () => {
        // suppose we've selected Percent % scaling factor should be updated to 1
        const changedEvent = {detail: {value: {label: 'Percent (%)'}}};
        testBed.component.onScalingOptionChanged(changedEvent as CustomEvent);
        expect(testBed.component.optionValue.scaling).toBe(1);
    });

    it('If optionValues are populated then do not take default value from columnDef', () => {
        testBed.component.optionValue = new NumericColumnFormatColumnOption();
        testBed.component.optionValue.decimalPlaces = 1;
        testBed.component['initializeComponent']();
        expect(testBed.component.decimalPlaces).toBe(1);
        expect(testBed.component.useThousandsSeparator).toBeTruthy();

        // Populate boolean value different in optionValues
        // useThousandsSeparator will take optionValues boolean value
        testBed.component.optionValue.useThousandsSeparator = false;
        testBed.component['initializeComponent']();
        expect(testBed.component.useThousandsSeparator).toBeFalsy();
    });

    it('if columnDef does not exist and optionValues does not have anything it should not give NPE', () => {
        // Resetting decimal places to undefined overriding already given value
        testBed.component.decimalPlaces = undefined;
        testBed.component['initializeComponent']();
        expect(testBed.component.decimalPlaces).toBe(1);
    });

    it('getUpdatedScalingOptions test case', () => {
        jest.spyOn(testBed.component['uiColumnOptionService'], 'getOverrideDateSelection$').mockReturnValue(of('PERCENTAGE_COMPARE_TO_CURRENT'));
        testBed.component.getUpdatedScalingOptions();
        expect(testBed.component.scalingFactor).toBe(0.01);
        expect(testBed.component.optionValue.scaling).toBe(0.01);

        jest.spyOn(testBed.component['uiColumnOptionService'], 'getOverrideDateSelection$').mockReturnValue(of('PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION'));
        testBed.component.getUpdatedScalingOptions();
        expect(testBed.component.scalingFactor).toBe(0.01);
        expect(testBed.component.optionValue.scaling).toBe(0.01);

        // add scalingFactor to be 1000
        testBed.component.numericColFormat.scalingFactor = 1000;
        // If Override option different from PERCENTAGE_COMPARE_TO_CURRENT then scalingValue would be taken from ColumnDefinition
        jest.spyOn(testBed.component['uiColumnOptionService'], 'getOverrideDateSelection$').mockReturnValue(of('COMPARE_TO_CURRENT'));
        testBed.component.getUpdatedScalingOptions();
        expect(testBed.component.scalingFactor).toBe(1000);
        expect(testBed.component.optionValue.scaling).toBe(1000);
    });
});
