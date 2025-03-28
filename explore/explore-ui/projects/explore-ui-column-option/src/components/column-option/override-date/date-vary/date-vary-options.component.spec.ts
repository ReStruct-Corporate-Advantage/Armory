import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OverrideDateConstants} from '@blk/explore-ui-core';
import {OverrideDateColumnOption} from '../../../../models/column-option/override-date-column-option.model';
import { DateVaryOptionsComponent } from './date-vary-options.component';

describe('DateVaryOptionsComponent', () => {
    let component: DateVaryOptionsComponent;
    let fixture: ComponentFixture<DateVaryOptionsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DateVaryOptionsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(DateVaryOptionsComponent);
        component = fixture.componentInstance;

        component.optionValue = new OverrideDateColumnOption();
    });

    describe('onInit Test', () => {
        it('should initialize default dateType with saved dateType', () => {
            component.optionValue.dateType = OverrideDateConstants.DATE_VARY_TYPES.ANALYTIC[0];
            component.initializeDefaultDateType();
            expect(component.optionValue.dateType).toBe(OverrideDateConstants.DATE_VARY_TYPES.ANALYTIC[0]);
        });

        it('should initialize default dateType with BOTH', () => {
            component.initializeDefaultDateType();
            expect(component.optionValue.dateType).toBe(OverrideDateConstants.VARY_BOTH);
        });

        it('should initialize date vary options', () => {
            component.initializeDateVaryOptions();
            expect(component.dateVaryOptions[0].label).toBe('Position date');
            expect(component.dateVaryOptions[0].eventData).toBe('EXPOSURE');
            expect(component.dateVaryOptions[1].label).toBe('Analytic date');
            expect(component.dateVaryOptions[1].eventData).toBe('ANALYTIC');
            expect(component.dateVaryOptions[2].label).toBe('Position and analytic date');
            expect(component.dateVaryOptions[2].eventData).toBe('BOTH');
        });
    });

    it('Tests onOverrideDateTypeChanged', () => {
        jest.spyOn(component.dateVaryOptionChanged, 'emit');
        // Starts as 'BOTH'
        component.ngOnInit();
        expect(component.optionValue.dateType).toEqual(OverrideDateConstants.VARY_BOTH);

        // Select the first option which is 'POSITION'
        component.onDateVaryOptionChanged(component.dateVaryOptions[0]);
        expect(component.optionValue.dateType).toEqual(OverrideDateConstants.DATE_VARY_TYPES.POSITION[0]);
        expect(component.dateVaryOptionChanged.emit).toHaveBeenCalled();
    });

    it('should default ECONOMY -> BOTH - old favorite issue', () => {
        component.optionValue.dateType = 'ECONOMY';
        // Starts as 'BOTH'
        component.ngOnInit();
        expect(component.optionValue.dateType).toEqual(OverrideDateConstants.VARY_BOTH);
    });
});
