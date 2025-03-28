import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionFilterModalComponent} from './constraint-option-filter-modal.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CustomFilter} from '@blk/explore-ui-breakdown';

describe('ConstraintOptionFilterModalComponent', () => {
    let component: ConstraintOptionFilterModalComponent;
    let fixture: ComponentFixture<ConstraintOptionFilterModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionFilterModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })

        fixture = TestBed.createComponent(ConstraintOptionFilterModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('should set values on init', () => {
        it('should create new filter if none provided', () => {
            component.filter = undefined;

            component.ngOnInit();
            expect(component.newFilter).toBeDefined();
            expect(component.filterName).toBe('Custom Sector');
        });

        it('should use provided filter if present', () => {
            const filter = new CustomFilter();
            filter['title'] = 'New Title';
            component.filter = filter;

            component.ngOnInit();
            expect(component.newFilter).toEqual(filter);
            expect(component.filterName).toBe('New Title');
        });
    });

    it('should emit on submit', () => {
        const filter = new CustomFilter();
        component.newFilter = filter;
        const emitSpy = jest.spyOn(component.submitted, 'emit');

        component.onSubmitted();
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith(filter);
    });

    it('should emit on canceled', () => {
        const emitSpy = jest.spyOn(component.cancelled, 'emit');

        component.onCancelled();
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should update filter title on value changed', () => {
        const filter = new CustomFilter();
        component.newFilter = filter;

        component.onValueChanged({detail:{value: 'newTitle'}} as any);
        expect(component.newFilter['title']).toBe('newTitle');
    });
});
