import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ConstraintOptionsComponent} from './constraint-options.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {OptionValueComponent} from '../../interfaces/option-value-component.interface';
import {ConstraintOption} from '../../models/constraint-option';
import {Observable} from 'rxjs';
import {ConstraintOptionValueUpdate} from '../../models/constraint-option-value-update';
import {ConstraintsSettingsService} from '../../interfaces/constraints-settings-service.interface';
import {CONSTRAINTS_SETTINGS_SERVICE} from '../../tokens/constraints-settings-service.token';
import {ConstraintOptionType} from '../../models/constraint-option-type';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {CompositionUtils} from '@utils/composition.utils';
import {ClimateDamageFunctionColumnOptionComponent} from '@blk/explore-ui-column-option';

class MockOptionValueComponent implements OptionValueComponent<string, any> {
    options: ConstraintOption<string>[];
    parentConfig: any;
    updated: Observable<ConstraintOptionValueUpdate<string>>;
}

describe('ConstraintOptionsComponent', () => {
    let component: ConstraintOptionsComponent<any, any>;
    let fixture: ComponentFixture<ConstraintOptionsComponent<any, any>>;
    let constraintsSettingsService: ConstraintsSettingsService<any, any>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{
                provide: CONSTRAINTS_SETTINGS_SERVICE,
                useValue: {
                    getConstraintTitle: jest.fn(),
                    getConstraintOptionTypes: jest.fn(),
                    getConstraintOptionComponent: jest.fn(),
                    updateOptionValues: jest.fn(),
                    isConstraintOptionVisible: jest.fn(),
                    isUnGroupedConstraintOptionComponent: jest.fn(() => true)
                }
            }]
        });

        fixture = TestBed.createComponent(ConstraintOptionsComponent);
        component = fixture.componentInstance;
        constraintsSettingsService = TestBed.inject(CONSTRAINTS_SETTINGS_SERVICE);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('should update options on changes', () => {
        it('should not update if no constraint', () => {
            component.constraint = undefined;
            component.unGroupedOptions = undefined;
            component.groupedOptions = undefined;

            component.ngOnChanges({});
            expect(component.unGroupedOptions).toBeUndefined();
            expect(component.unGroupedOptions).toBeUndefined();
        });

        it('should initialize column config if constraint is custom_calc', () => {
            component.constraint = new Constraint();
            component.constraint.constraintTag = 'custom_calc';
            const getConstraintTitleSpy = jest.spyOn(constraintsSettingsService, 'getConstraintTitle');
            getConstraintTitleSpy.mockReturnValue('title');
            const optionTypes: ConstraintOptionType<any>[] = [{
                type: 'breakdownTree',
                optionAttributes: [{
                    key: 'key1',
                    title: 'title1'
                }]
            }, {
                type: 'filter',
                optionAttributes: [{
                    key: 'key2',
                    title: 'title2'
                }]
            }];
            const optionValues = {
                key1: 'value1',
                key2: 'value2'
            };
            const getConstraintOptionTypesSpy = jest.spyOn(constraintsSettingsService, 'getConstraintOptionTypes');
            getConstraintOptionTypesSpy.mockReturnValue({
                optionTypes,
                optionValues
            });
            const getConstraintOptionComponentSpy = jest.spyOn(constraintsSettingsService, 'getConstraintOptionComponent');
            getConstraintOptionComponentSpy.mockReturnValue(MockOptionValueComponent);
            const isConstraintOptionVisibleSpy = jest.spyOn(constraintsSettingsService, 'isConstraintOptionVisible');
            isConstraintOptionVisibleSpy.mockReturnValue(true);

            component.ngOnChanges({});
            expect(component.columnConfig).not.toBeUndefined();
        });

        it('should initialize column config if constraint is of climate group', () => {
            component.constraint = new Constraint();
            component.constraint.constraintTag = 'ta_temp_score';
            component.constraint.group = 'Climate';
            const getConstraintTitleSpy = jest.spyOn(constraintsSettingsService, 'getConstraintTitle');
            getConstraintTitleSpy.mockReturnValue('title');
            const optionTypes: ConstraintOptionType<any>[] = [{
                type: 'breakdownTree',
                optionAttributes: [{
                    key: 'key1',
                    title: 'title1'
                }]
            }, {
                type: 'filter',
                optionAttributes: [{
                    key: 'key2',
                    title: 'title2'
                }]
            }];
            const optionValues = {
                key1: 'value1',
                key2: 'value2'
            };
            const getConstraintOptionTypesSpy = jest.spyOn(constraintsSettingsService, 'getConstraintOptionTypes');
            getConstraintOptionTypesSpy.mockReturnValue({
                optionTypes,
                optionValues
            });
            const getConstraintOptionComponentSpy = jest.spyOn(constraintsSettingsService, 'getConstraintOptionComponent');
            getConstraintOptionComponentSpy.mockReturnValue(MockOptionValueComponent);
            const isConstraintOptionVisibleSpy = jest.spyOn(constraintsSettingsService, 'isConstraintOptionVisible');
            isConstraintOptionVisibleSpy.mockReturnValue(true);

            component.ngOnChanges({});
            expect(component.columnConfig).not.toBeUndefined();
        });


        it('should update if constraint', fakeAsync(() => {
            const constraint = {key: 'val'};
            component.constraint = constraint;
            const getConstraintTitleSpy = jest.spyOn(constraintsSettingsService, 'getConstraintTitle');
            getConstraintTitleSpy.mockReturnValue('title');
            const optionTypes: ConstraintOptionType<any>[] = [{
                type: 'breakdownTree',
                optionAttributes: [{
                    key: 'key1',
                    title: 'title1'
                }]
            }, {
                type: 'filter',
                optionAttributes: [{
                    key: 'key2',
                    title: 'title2'
                }]
            }];
            const optionValues = {
                key1: 'value1',
                key2: 'value2'
            };
            const getConstraintOptionTypesSpy = jest.spyOn(constraintsSettingsService, 'getConstraintOptionTypes');
            getConstraintOptionTypesSpy.mockReturnValue({
                optionTypes,
                optionValues
            });
            const getConstraintOptionComponentSpy = jest.spyOn(constraintsSettingsService, 'getConstraintOptionComponent');
            getConstraintOptionComponentSpy.mockReturnValue(MockOptionValueComponent);
            const isConstraintOptionVisibleSpy = jest.spyOn(constraintsSettingsService, 'isConstraintOptionVisible');
            isConstraintOptionVisibleSpy.mockReturnValue(true);

            component.ngOnChanges({});
            expect(component.unGroupedOptions.length).toBe(2);
            component.unGroupedOptions[0].options[0].value$.subscribe((value: any) => {
                expect(value).toEqual('value1');
            });
            component.unGroupedOptions[1].options[0].value$.subscribe((value: any) => {
                expect(value).toEqual('value2');
            });
            component.unGroupedOptions[0].isVisible$.subscribe((isVisible: boolean) => {
                expect(isVisible).toBe(true);
            });
            component.unGroupedOptions[1].isVisible$.subscribe((isVisible: boolean) => {
                expect(isVisible).toBe(true);
            });
            tick();
            expect(getConstraintTitleSpy).toHaveBeenCalledTimes(1);
            expect(getConstraintTitleSpy).toHaveBeenCalledWith(constraint);
            expect(getConstraintOptionTypesSpy).toHaveBeenCalledTimes(1);
            expect(getConstraintOptionTypesSpy).toHaveBeenCalledWith(constraint);
            expect(getConstraintOptionComponentSpy).toHaveBeenCalledTimes(4);
            expect(isConstraintOptionVisibleSpy).toHaveBeenCalledTimes(4);
            expect(isConstraintOptionVisibleSpy).toHaveBeenCalledWith('breakdownTree', optionValues);
            expect(isConstraintOptionVisibleSpy).toHaveBeenCalledWith('filter', optionValues);
        }));
    });

    it('should update if constraint with colum option', fakeAsync(() => {
        const constraint = {key: 'val'};
        constraint['group'] = 'Climate';
        component.constraint = constraint;
        const getConstraintTitleSpy = jest.spyOn(constraintsSettingsService, 'getConstraintTitle');
        getConstraintTitleSpy.mockReturnValue('title');
        const optionTypes: ConstraintOptionType<any>[] = [{
            type: 'RelativeAbsolute',
            optionAttributes: [{
                key: 'key1',
                title: 'title1'
            }]
        }, {
            type: 'climateDamageFunctionOptions',
            optionAttributes: [{
                key: 'key2',
                title: 'title2'
            }]
        }, {
            type: 'sectorConstraintType',
            optionAttributes: [{
                key: 'key3',
                title: 'title3'
            }]
        }];
        const optionValues = {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
        };
        const getConstraintOptionTypesSpy = jest.spyOn(constraintsSettingsService, 'getConstraintOptionTypes');
        getConstraintOptionTypesSpy.mockReturnValue({
            optionTypes,
            optionValues
        });
        const getConstraintOptionComponentSpy = jest.spyOn(constraintsSettingsService, 'getConstraintOptionComponent');
        getConstraintOptionComponentSpy.mockImplementation((type: string) => {
            return type === 'climateDamageFunctionOptions' ? ClimateDamageFunctionColumnOptionComponent : MockOptionValueComponent;
        });
        const isConstraintOptionVisibleSpy = jest.spyOn(constraintsSettingsService, 'isConstraintOptionVisible');
        isConstraintOptionVisibleSpy.mockReturnValue(true);
        const isUnGroupedConstraintOptionComponent = jest.spyOn(constraintsSettingsService, 'isUnGroupedConstraintOptionComponent');
        isUnGroupedConstraintOptionComponent.mockImplementation((type: string) => {
            return type === 'climateDamageFunctionOptions';
        });

        component.ngOnChanges({});
        expect(component.unGroupedOptions.length).toBe(1);
        expect(component.groupedOptions.length).toBe(1);
        component.sectorConstraintOption.options[0].value$.subscribe((value: any) => {
            expect(value).toEqual('value3');
        });
        component.groupedOptions[0].options[0].value$.subscribe((value: any) => {
            expect(value).toEqual('value1');
        });
        component.unGroupedOptions[0].isVisible$.subscribe((isVisible: boolean) => {
            expect(isVisible).toBe(true);
        });
        component.sectorConstraintOption.isVisible$.subscribe((isVisible: boolean) => {
            expect(isVisible).toBe(true);
        });
        component.groupedOptions[0].isVisible$.subscribe((isVisible: boolean) => {
            expect(isVisible).toBe(true);
        });
        tick();
        expect(getConstraintTitleSpy).toHaveBeenCalledTimes(1);
        expect(getConstraintTitleSpy).toHaveBeenCalledWith(constraint);
        expect(getConstraintOptionTypesSpy).toHaveBeenCalledTimes(1);
        expect(getConstraintOptionTypesSpy).toHaveBeenCalledWith(constraint);
        expect(getConstraintOptionComponentSpy).toHaveBeenCalledTimes(6);
        expect(isConstraintOptionVisibleSpy).toHaveBeenCalledTimes(5);
        expect(isConstraintOptionVisibleSpy).toHaveBeenCalledWith('RelativeAbsolute', optionValues);
        expect(isConstraintOptionVisibleSpy).toHaveBeenCalledWith('climateDamageFunctionOptions', optionValues);
        expect(isConstraintOptionVisibleSpy).toHaveBeenCalledWith('sectorConstraintType', optionValues);
    }));

    it('should emit on updated', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        const nextSpy = jest.spyOn(component.optionValues$, 'next');
        const update: ConstraintOptionValueUpdate<any> = {
            key: 'key',
            value: 'value'
        };
        const constraint = {
            optionValues: {}
        };
        component.constraint = constraint;
        const updateOptionValuesSpy = jest.spyOn(constraintsSettingsService, 'updateOptionValues');
        updateOptionValuesSpy.mockReturnValue({
            key: 'value'
        });

        component.onUpdated(update);
        expect(updateOptionValuesSpy).toHaveBeenCalledTimes(1);
        expect(updateOptionValuesSpy).toHaveBeenCalledWith(constraint, 'key', 'value');
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(nextSpy).toHaveBeenCalledWith({
            key: 'value'
        });
    });

    it('should add/delete efficientEnabledConstraints on updated', () => {
        // setup
        const update: ConstraintOptionValueUpdate<any> = {
            key: 'key',
            value: 'value'
        };
        component.constraint = new Constraint({
            optionValues: {}
        });
        component.parentConfig = new OptimizationSettings();
        const updateOptionValuesSpy = jest.spyOn(CompositionUtils, 'checkIfConstraintInEfficientFormat');
        updateOptionValuesSpy.mockReturnValue(true);

        // verify before update
        expect(component.parentConfig.efficientEnabledConstraints.size).toEqual(0);
        component.onUpdated(update);

        // after update
        expect(component.parentConfig.efficientEnabledConstraints.size).toEqual(1);

        // when checkIfConstraintInEfficientFormat return false
        updateOptionValuesSpy.mockReturnValue(false);
        component.onUpdated(update);
        expect(component.parentConfig.efficientEnabledConstraints.size).toEqual(0);
    });

    it('should test tabChangehandler', () => {
        component.auxAccordion = {
            activeTabIndex: 3
        };
        component.tabChangeHandler();
        expect(component.selectedSectionIndex).toEqual(3);

        component.tabChangeHandler();
        expect(component.selectedSectionIndex).toEqual(-1);
        expect(component.auxAccordion.activeTabIndex).toEqual(-1);

        component.auxAccordion.activeTabIndex = 3;
        component.tabChangeHandler();
        expect(component.selectedSectionIndex).toEqual(3);

        component.auxAccordion.activeTabIndex = 2;
        component.tabChangeHandler();
        expect(component.selectedSectionIndex).toEqual(2);
    });
});
