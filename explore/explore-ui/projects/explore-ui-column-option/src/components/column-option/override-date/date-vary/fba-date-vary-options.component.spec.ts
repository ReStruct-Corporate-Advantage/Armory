import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OverrideDateConstants} from '@blk/explore-ui-core';
import {FbaDateVaryOptionsComponent} from './fba-date-vary-options.component';
import {OverrideDateColumnOption} from '../../../../models/column-option/override-date-column-option.model';

describe('FbaDateVaryOptionsComponent', () => {
    let component: FbaDateVaryOptionsComponent;
    let fixture: ComponentFixture<FbaDateVaryOptionsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FbaDateVaryOptionsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(FbaDateVaryOptionsComponent);
        component = fixture.componentInstance;

        component.optionValue = new OverrideDateColumnOption();
        component.riskColumnFlags = ['DEPENDS_ON_ECONOMY', 'DEPENDS_ON_EXPOSURE', 'IS_MULTICOLUMN', 'BELONGS_TO_FACTOR_REPORT', 'BELONGS_TO_SECTOR_REPORT', 'BELONGS_TO_SECTOR_TO_FACTOR_REPORT', 'BELONGS_TO_SECTOR_TO_SECURITY_REPORT', 'BELONGS_TO_PORTFOLIO_REPORT', 'IS_ACTIVE', 'SUPPORTS_BREAKDOWN', 'IS_SUBTOTAL_ABLE'];
    });

    describe('onInit Test', () => {
        it('should initialize default dateType with saved dateType', () => {
            component.optionValue.dateType = OverrideDateConstants.FBA_DATE_VARY_TYPES.ECONOMY[0];
            component.initializeDefaultDateType();
            expect(component.optionValue.dateType).toBe(OverrideDateConstants.FBA_DATE_VARY_TYPES.ECONOMY[0]);
        });

        it('should initialize default dateType with BOTH', () => {
            component.initializeDefaultDateType();
            expect(component.optionValue.dateType).toBe(OverrideDateConstants.VARY_BOTH);
        });

        it('should initialize date vary options', () => {
            component.initializeDateVaryOptions();
            expect(component.dateVaryOptions[0].label).toBe('Exposures');
            expect(component.dateVaryOptions[0].eventData).toBe('EXPOSURE');
            expect(component.dateVaryOptions[1].label).toBe('Economy');
            expect(component.dateVaryOptions[1].eventData).toBe('ECONOMY');
            expect(component.dateVaryOptions[2].label).toBe('Economy & Exposures');
            expect(component.dateVaryOptions[2].eventData).toBe('BOTH');
        });
    });

    it('Tests onOverrideDateTypeChanged', () => {
        jest.spyOn(component.dateVaryOptionChanged, 'emit');
        // Starts as 'BOTH'
        component.ngOnInit();
        expect(component.optionValue.dateType).toEqual(OverrideDateConstants.VARY_BOTH);

        // Select the first option which is 'EXPOSURE'
        component.onDateVaryOptionChanged(component.dateVaryOptions[0]);
        expect(component.optionValue.dateType).toEqual(OverrideDateConstants.FBA_DATE_VARY_TYPES.EXPOSURE[0]);
        expect(component.dateVaryOptionChanged.emit).toHaveBeenCalled();
    });
});
