import {ScreeningFilterComponent} from './screening-filter.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CustomFilter} from '@blk/explore-ui-breakdown';

describe('Screening filter Component', () => {
    let component: ScreeningFilterComponent;
    let fixture: ComponentFixture<ScreeningFilterComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [CommonModule, ReactiveFormsModule],
            declarations: [ScreeningFilterComponent]
        });

        fixture = TestBed.createComponent(ScreeningFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.portFilter = new CustomFilter();
    });

    it('should create', () => {
         const customFilter = new CustomFilter({title: 'filter1'});
         component.updatePortFilter(customFilter);
         expect(component.portFilter).not.toBeUndefined();
    });
});
