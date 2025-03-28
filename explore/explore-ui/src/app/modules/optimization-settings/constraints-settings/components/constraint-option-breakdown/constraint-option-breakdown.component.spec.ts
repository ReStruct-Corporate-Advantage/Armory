import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ConstraintOptionBreakdownComponent} from './constraint-option-breakdown.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of} from 'rxjs';
import {WidgetConfigFactory} from '../../../../../factories';
import {Breakdown, BreakdownFavoriteConstants} from '@blk/explore-ui-breakdown';
import {CoreFavoriteConstants, FavoriteType, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';

describe('ConstraintOptionBreakdownComponent', () => {
    let component: ConstraintOptionBreakdownComponent;
    let fixture: ComponentFixture<ConstraintOptionBreakdownComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionBreakdownComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionBreakdownComponent);
        component = fixture.componentInstance;
        component.options = [{
            optionAttribute: {
                key: 'key',
                title: 'title'
            },
            value$: of(undefined)
        }];
    });

    it('should create', () => {
        const getInputsForWidgetConfigByNameSpy = jest.spyOn(WidgetConfigFactory, 'getInputsForWidgetConfigByName');
        getInputsForWidgetConfigByNameSpy.mockReturnValue(undefined);
        fixture.detectChanges();
        expect(component).toBeTruthy();
        getInputsForWidgetConfigByNameSpy.mockRestore();
    });

    describe('should set values on init', () => {
        it('should use breakdown and widget config if provided', (done: any) => {
            const breakdown: Breakdown = new Breakdown();
            component.options = [{
                optionAttribute: {
                    key: 'key',
                    title: 'title'
                },
                value$: of(breakdown)
            }];
            const columnFilter = [{filter: 'filter'}];
            const customSectorColumnFilter = [{customFilter: 'customFilter'}];
            const getInputsForWidgetConfigByNameSpy = jest.spyOn(WidgetConfigFactory, 'getInputsForWidgetConfigByName');
            getInputsForWidgetConfigByNameSpy.mockReturnValue({
                groupByColumnFilters: columnFilter,
                customColumnFilters: customSectorColumnFilter
            } as any);

            component.ngOnInit();
            expect(component.key).toBe('key');
            component.breakdown$.subscribe((newBreakdown: Breakdown) => {
                expect(newBreakdown).toBe(breakdown);
                done();
            });
            expect(component.breakdownBuilderSettings).toEqual({
                columnFilter,
                customSectorColumnFilter,
                fieldToUse: 'columnTag',
                favoriteType: BreakdownFavoriteConstants.BREAKDOWN,
                favoriteFolderType: BreakdownFavoriteConstants.BREAKDOWN + CoreFavoriteConstants._FOLDER,
                includeNoBreakdownOption: false
            });
            expect(getInputsForWidgetConfigByNameSpy).toHaveBeenCalledTimes(1);
            expect(getInputsForWidgetConfigByNameSpy).toHaveBeenCalledWith(WidgetConfigType.RISK_EXPOSURE, WidgetInputType.BREAKDOWN_TREE);
            getInputsForWidgetConfigByNameSpy.mockRestore();
        });

        it('should create breakdown if none provided', fakeAsync(() => {
            component.options = [{
                optionAttribute: {
                    key: 'key',
                    title: 'title'
                },
                value$: of(undefined)
            }];
            const getInputsForWidgetConfigByNameSpy = jest.spyOn(WidgetConfigFactory, 'getInputsForWidgetConfigByName');
            getInputsForWidgetConfigByNameSpy.mockReturnValue(undefined);
            const emitSpy = jest.spyOn(component.updated, 'emit');

            component.ngOnInit();
            expect(component.key).toBe('key');
            component.breakdown$.subscribe((newBreakdown: Breakdown) => {
                expect(newBreakdown).toBeDefined();
            });
            tick();
            expect(component.breakdownBuilderSettings).toEqual({
                fieldToUse: 'columnTag',
                favoriteType: FavoriteType.BREAKDOWN,
                favoriteFolderType: BreakdownFavoriteConstants.BREAKDOWN + CoreFavoriteConstants._FOLDER,
                includeNoBreakdownOption: false
            });
            expect(getInputsForWidgetConfigByNameSpy).toHaveBeenCalledTimes(1);
            expect(getInputsForWidgetConfigByNameSpy).toHaveBeenCalledWith(WidgetConfigType.RISK_EXPOSURE, WidgetInputType.BREAKDOWN_TREE);
            expect(emitSpy).toHaveBeenCalledTimes(1);
            expect(emitSpy).toHaveBeenCalledWith({
                key: 'key',
                value: expect.anything()
            });
            getInputsForWidgetConfigByNameSpy.mockRestore();
        }));
    });

    it('should emit on breakdown changed', fakeAsync(() => {
        const breakdown: Breakdown = new Breakdown();
        component.options = [{
            optionAttribute: {
                key: 'key',
                title: 'title'
            },
            value$: of(breakdown)
        }];
        jest.spyOn(WidgetConfigFactory, 'getInputsForWidgetConfigByName').mockReturnValue(undefined);
        component.ngOnInit();
        const emitSpy = jest.spyOn(component.updated, 'emit');

        component.onBreakdownChanged();
        tick();
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith({
            key: 'key',
            value: breakdown
        });
    }));
});
