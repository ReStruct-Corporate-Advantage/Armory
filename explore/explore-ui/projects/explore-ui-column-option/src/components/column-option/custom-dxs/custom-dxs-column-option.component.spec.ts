import {CustomDxsColumnOption} from '../../../models/column-option/custom-dxs-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils';
import {CustomDxsColumnOptionComponent} from './custom-dxs-column-option.component';

describe('CustomDxsComponent', () => {
    let testBed: ColumnOptionTestBed<CustomDxsColumnOptionComponent, CustomDxsColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Additional Settings',
            columnOptionAttributes: [
                {
                    title: 'Spread Type',
                    defaultValue: {
                        value: false,
                        label: 'Alternative OAS (LIBOR)'
                    },
                    values: [
                        {value: true, label: 'OAS (Government)'},
                        {value: false, label: 'Alternative OAS (LIBOR)'}
                    ]
                },
                {title: 'Floor (bp)'},
                {title: 'Cap (bp)'},
                {title: 'Use duration for EUR denominated government bonds'}
            ],
            columnOptionConfigType: 'dxsColumnOptions'
        };
        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<CustomDxsColumnOptionComponent, CustomDxsColumnOption>(CustomDxsColumnOptionComponent, new CustomDxsColumnOption(), mockedOption);
    });

    it('Validate init of the component', () => {
        // Should have the titles defined.
        expect(testBed.component.spreadTypeAttribute.title).toBe('Spread Type');
        expect(testBed.component.spreadTypeAttribute.defaultValue.value).toBeFalsy();
        expect(testBed.component.spreadTypeAttribute.values.length).toBe(2);
        expect(testBed.component.spreadLimitFloorTitle).toBe('Floor (bp)');
        expect(testBed.component.spreadLimitCapTitle).toBe('Cap (bp)');
        expect(testBed.component.useDurationForEurGovBondTitle).toBe('Use duration for EUR denominated government bonds');
        expect(testBed.component.optionValue.isOasBased).toBeFalsy();
        expect(testBed.component.spreadTypeDisplayOptions.length).toBe(2);

        // The control should have an aux-checkbox component and a aux-radio-group
        const compiled = testBed.fixture.debugElement.nativeElement;
        expect(compiled.querySelector('aux-radio-group')).not.toBe(null);
        expect(compiled.querySelector('aux-checkbox')).not.toBe(null);
    });

    it('should change spread type', () => {
        testBed.component.spreadTypeDisplayOptions = [
            {label: 'Alternative OAS (LIBOR)', checked: false, disabled: false},
            {label: 'OAS (Government)', checked: true, disabled: false}
        ];
        testBed.component.spreadTypeChange();
        expect(testBed.component.optionValue.isOasBased).toBeTruthy();

        testBed.component.spreadTypeDisplayOptions = [
            {label: 'Alternative OAS (LIBOR)', checked: true, disabled: false},
            {label: 'OAS (Government)', checked: false, disabled: false}
        ];
        testBed.component.spreadTypeChange();
        expect(testBed.component.optionValue.isOasBased).toBeFalsy();
    });

    it('should change floor value', () => {
        const event = {detail: {value: 2}};
        testBed.component.onFloorValueChangedHandler(event as CustomEvent);
        expect(testBed.component.optionValue.floor).toBe(2);
    });

    it('should change cap value', () => {
        const event = {detail: {value: 5}};
        testBed.component.onCapValueChangedHandler(event as CustomEvent);
        expect(testBed.component.optionValue.cap).toBe(5);
    });

    it('should update checkbox value', () => {
        testBed.component.optionValue.useDurationForEuroGovtBonds = false;
        const event = {detail: {value: {checked: true}}};
        testBed.component.updateDxsColumnOptionsCheckbox(event as CustomEvent);
        expect(testBed.component.optionValue.useDurationForEuroGovtBonds).toBeTruthy();
    });
});
