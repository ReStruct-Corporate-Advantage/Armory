import { ComponentFixture, TestBed } from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ColumnOptionResponse} from '../../interfaces';
import {ColumnOptionService} from '../../services/column-option.service';
import {DateFormatDropdownComponent} from './date-format-dropdown.component';
import {of} from 'rxjs';

describe('DateFormatDropdownComponent', () => {
    let component: DateFormatDropdownComponent;
    let fixture: ComponentFixture<DateFormatDropdownComponent>;

    const columnOptionsServiceMock = {
        fetchColumnOptions$: jest.fn()
    };

    const columnOptionsSpy = jest.spyOn(columnOptionsServiceMock, 'fetchColumnOptions$');
    columnOptionsSpy.mockReturnValue(of(getResponse()));

    /**
     * Performs required initialisation before each test is run
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DateFormatDropdownComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: ColumnOptionService, useValue: columnOptionsServiceMock
                }
            ]
        });

        fixture = TestBed.createComponent(DateFormatDropdownComponent);
        component = fixture.componentInstance;
        component.dateFormat = 'Aladdin date format';
    });

    describe('Test Component initialization with ngOnInit method', () => {
        it('Component should initialize with appropriate values', async() => {
            await component.ngOnInit();
            expect(columnOptionsServiceMock.fetchColumnOptions$).toHaveBeenCalledTimes(1);

            // Validate dateOption
            expect(component.dateOption).toEqual(getResponse()[0].options[2].columnOptionAttributes[0]);

            // Validate dateFormatDropdownOptions
            // First Option
            expect(component.dateFormatDropdownOptions[0].value).toEqual('Aladdin date format');
            expect(component.dateFormatDropdownOptions[0].label).toEqual('-1');
            // Second Option
            expect(component.dateFormatDropdownOptions[1].value).toEqual('M/d/yyyy');
            expect(component.dateFormatDropdownOptions[1].label).toEqual('0');

            // Validate availableDateFormatDropdownOptions
            // First Option
            expect(component.availableDateFormatDropdownOptions[0].values[0].displayValue).toEqual('Aladdin date format');
            expect(component.availableDateFormatDropdownOptions[0].values[0].value).toEqual('-1');
            expect(component.availableDateFormatDropdownOptions[0].values[0].isSelected).toEqual(true);

            // Second Option
            expect(component.availableDateFormatDropdownOptions[0].values[1].displayValue).toEqual('M/d/yyyy');
            expect(component.availableDateFormatDropdownOptions[0].values[1].value).toEqual('0');
            expect(component.availableDateFormatDropdownOptions[0].values[1].isSelected).toEqual(undefined);

        });
    });

    describe('Test onDateFormatSelectionChanged method', () => {
        it('onDateFormatSelectionChanged should change the value properly', () => {
            expect(component.dateFormat).toEqual('Aladdin date format');
            const event = {detail: { value: { displayValue: 'M/d/yyyy'}}};
            component.onDateFormatSelectionChanged(event as CustomEvent);
            expect(component.dateFormat).toEqual('M/d/yyyy');
        });
    });

    /**
    * Function to get mock data returned by fetchColumnOptions$
     */
    function getResponse(): ColumnOptionResponse[] {
        return [{
            colTag: '',
            use: '',
            options: [
                null,
                null,
                {
                    columnOptionKey: '',
                    columnOptionTitle: '',
                    columnOptionConfigType: '',
                    columnOptionAttributes: [{
                        title: 'Date Format',
                        key: 'dateFormat',
                        dataType: 'S',
                        values: [
                            {value: 'Aladdin date format', label: '-1'},
                            {value: 'M/d/yyyy', label: '0'}]
                    }]
                }
        ]}];
    }
});
