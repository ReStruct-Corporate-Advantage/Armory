import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {OptimizationSummaryComponent} from './optimization-summary.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {OPTIMIZATION_SERVICE} from '../../tokens/optimization-service.token';
import {of} from 'rxjs';
import {OptimizationService} from '../../services/optimization-service.interface';
import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';

const OPTIMIZATION_ID = 'id';

describe('OptimizationSummaryComponent', () => {
    let component: OptimizationSummaryComponent;
    let fixture: ComponentFixture<OptimizationSummaryComponent>;
    let optimizationService: OptimizationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [OptimizationSummaryComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: OPTIMIZATION_SERVICE,
                    useValue: {
                        getOptimizationSummaryData$: jest.fn(() => of({}))
                    }
                }
            ]
        });

        fixture = TestBed.createComponent(OptimizationSummaryComponent);
        component = fixture.componentInstance;
        optimizationService = TestBed.inject(OPTIMIZATION_SERVICE);
        component.optimizationId = OPTIMIZATION_ID;
        component.optimizationSummary = {
            title: 'title',
            type: 'type',
            subType: 'subtype',
            columns: []
        };
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should set optimization summary data', fakeAsync(() => {
        const mockData: OptimizationSummaryData = {
            data: [{}],
            optionsValue: 'val'
        };
        optimizationService.getOptimizationSummaryData$ = jest.fn(() => of(mockData));
        fixture.detectChanges();
        component.optimizationSummaryData$.subscribe((optimizationSummaryData: OptimizationSummaryData) => {
            expect(optimizationSummaryData).toEqual(mockData);
        });
        tick();
        expect(optimizationService.getOptimizationSummaryData$).toHaveBeenCalledTimes(1);
        expect(optimizationService.getOptimizationSummaryData$).toHaveBeenCalledWith(OPTIMIZATION_ID, 'type', 'subtype', undefined);
    }));

    describe('show options label', () => {
        it('should show label', (done: any) => {
            optimizationService.getOptimizationSummaryData$ = jest.fn(() =>
                of({
                    additionalData: {
                        optionsValue: 'value'
                    }
                })
            );
            fixture.detectChanges();
            component.showOptionsLabel$.subscribe((showOptionsLabel: boolean) => {
                expect(showOptionsLabel).toEqual(true);
                done();
            });
        });

        it('should not show label', (done: any) => {
            fixture.detectChanges();
            component.showOptionsLabel$.subscribe((showOptionsLabel: boolean) => {
                expect(showOptionsLabel).toEqual(false);
                done();
            });
        });
    });

    describe('show data', () => {
        it('should show data', (done: any) => {
            optimizationService.getOptimizationSummaryData$ = jest.fn(() =>
                of({
                    data: [{}]
                })
            );
            fixture.detectChanges();
            component.showData$.subscribe((showData: boolean) => {
                expect(showData).toEqual(true);
                done();
            });
        });

        it('should not show data', (done: any) => {
            fixture.detectChanges();
            component.showData$.subscribe((showData: boolean) => {
                expect(showData).toEqual(false);
                done();
            });
        });
    });

    it('should edit', () => {
        const emitSpy = jest.spyOn(component.edit, 'emit');
        component.onEdit();
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });
});
