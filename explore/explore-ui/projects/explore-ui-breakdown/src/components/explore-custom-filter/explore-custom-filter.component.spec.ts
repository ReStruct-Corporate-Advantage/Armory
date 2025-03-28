import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

import {ExploreCustomFilterComponent} from './explore-custom-filter.component';
import {ExploreSelectOption} from '@blk/explore-ui-core';
import {ColumnSectorRule} from '../../models/sector/column-sector/column-sector-rule.model';
import {CustomFilter} from '../../models/filter/custom-filter.model';
import {CustomSector} from '../../models/sector/custom-sector/custom-sector.model';

describe('CustomFilterComponent', () => {
    let component: ExploreCustomFilterComponent;
    let fixture: ComponentFixture<ExploreCustomFilterComponent>;
    const filter = new CustomFilter();
    filter.customSector = new CustomSector();
    const columnRule = new ColumnSectorRule();

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExploreCustomFilterComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExploreCustomFilterComponent);
        component = fixture.componentInstance;
        component.filter = filter;
        component.filter.customSector.rule = columnRule;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit Test', () => {
        it('should set component variables on initialize', () => {
            component.ngOnInit();

            expect(component.filter.customSector).toEqual(filter.customSector);
            expect(component.filter.customSector.rule).toEqual(columnRule);
        });
    });

    describe('update value for checkbox and drop down', () => {
        beforeEach(() => {
            component.ngOnInit();
            component.applyFilterTo = 'BOTH';
        });

        it('if checkbox value gets change then update in model test case', () => {
            component.updateNormalizedCheckbox(false);
            expect(component.isNormalized.data).toBeFalsy();
        });

        it('Drop selection updating test case', () => {
            // Initial selection
            const data: ExploreSelectOption = new ExploreSelectOption('Portfolio cumulative', 'PORTFOLIO CUMULATIVE', false);
            component.updateFilterSelection(data);
            expect(component.applyFilterTo).toBe('PORTFOLIO CUMULATIVE');
        });
    });
});
