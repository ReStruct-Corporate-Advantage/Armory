import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionFilterComponent} from './constraint-option-filter.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of} from 'rxjs';
import {CustomFilter} from '@blk/explore-ui-breakdown';

describe('ConstraintOptionFilterComponent', () => {
    let component: ConstraintOptionFilterComponent;
    let fixture: ComponentFixture<ConstraintOptionFilterComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionFilterComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionFilterComponent);
        component = fixture.componentInstance;
        component.options = [{
            optionAttribute: {
                key: 'key',
                title: 'title'
            },
            value$: of(undefined)
        }];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('should set values on init', () => {
        it('should set filter name if filter - filter object', (done: any) => {
            const customFilter = new CustomFilter();
            customFilter['title'] = 'Custom Sector';
            component.options = [{
                optionAttribute: {
                    key: 'key',
                    title: 'title'
                },
                value$: of(customFilter)
            }];
            component.ngOnInit();
            expect(component.key).toBe('key');
            component.filter$.subscribe((filter: CustomFilter) => {
                expect(filter).toEqual(customFilter);
                done();
            });
        });

        it('should set filter name if filter - filter name', done => {
            const customFilter = new CustomFilter();
            customFilter['title'] = 'Custom Sector';
            component.options = [{
                optionAttribute: {
                    key: 'key',
                    title: 'title'
                },
                value$: of(customFilter)
            }];
            component.ngOnInit();
            expect(component.key).toBe('key');
            component.filterName$.subscribe((filterName: string) => {
                expect(filterName).toBe('Custom Sector');
                done();
            });
        });

        it('should not set filter name if no filter', (done: any) => {
            component.options = [{
                optionAttribute: {
                    key: 'key',
                    title: 'title'
                },
                value$: of(undefined)
            }];

            component.ngOnInit();
            expect(component.key).toBe('key');
            component.filter$.subscribe((filter: CustomFilter) => {
                expect(filter).toBeUndefined();
                done();
            });
        });

        it('should not set filter name if no filter - filter name', (done: any) => {
            component.options = [{
                optionAttribute: {
                    key: 'key',
                    title: 'title'
                },
                value$: of(undefined)
            }];

            component.ngOnInit();
            expect(component.key).toBe('key');
            component.filterName$.subscribe((filterName: string) => {
                expect(filterName).toBeUndefined();
                done();
            });
        });

        it('should set filter and filterName based on port filter', done => {
            component.options = undefined;
            component.portFilter = new CustomFilter({title: 'filter1'});
            component.ngOnInit();
            component.filter$.subscribe((filter: CustomFilter) => {
                expect(filter === component.portFilter).toBeTruthy();
                done();
            });
        });

        it('should set filter and filterName based on port filter - filter name', done => {
            component.options = undefined;
            component.portFilter = new CustomFilter({title: 'filter1'});
            component.ngOnInit();
            component.filterName$.subscribe((filterName: string) => {
                expect(filterName).toBe('filter1');
                done();
            });
        });
    });

    it('should set modal opened on edit', () => {
        component.onEdited();
        expect(component.openModal).toBe(true);
    });

    it('should emit on submitted', () => {
        const filter = new CustomFilter();
        const emitSpy = jest.spyOn(component.updated, 'emit');

        component.onSubmitted(filter);
        expect(component.openModal).toBe(false);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith({
            key: 'key',
            value: filter
        });
    });

    it('should update filter and emit it, if portFilter is present', () => {
        const filter = new CustomFilter();
        const emitSpy = jest.spyOn(component.portFilterUpdated, 'emit');
        component.portFilter = new CustomFilter();
        component.onSubmitted(filter);
        expect(component.openModal).toBe(false);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith(filter);
    });

    it('should set modal closed on cancel', () => {
        component.onCancelled();
        expect(component.openModal).toBe(false);
    });
});
