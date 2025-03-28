import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionSelectComponent} from './constraint-option-select.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of} from 'rxjs';
import {OptimizationConstants} from '@constants/optimization.constants';

describe('ConstraintOptionSelectComponent', () => {
    let component: ConstraintOptionSelectComponent<any>;
    let fixture: ComponentFixture<ConstraintOptionSelectComponent<any>>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionSelectComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionSelectComponent);
        component = fixture.componentInstance;
        component.options = [{
            optionAttribute: {
                key: 'key',
                title: 'title',
                values: []
            },
            value$: of('test')
        }];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('should set values on init', () => {
        it('should not set selected when no value or default value', () => {
            component.options = [{
                optionAttribute: {
                    key: 'key',
                    title: 'title',
                    values: [{
                        label: 'displayValue',
                        value: 'value'
                    }]
                },
                value$: of(undefined)
            }];

            component.ngOnInit();
            expect(component.key).toEqual('key');
            expect(component.label).toEqual('title');
            expect(component.data).toEqual([{
                values: [{
                    displayValue: 'displayValue',
                    value: 'value'
                }]
            }]);
            expect(component.selected).toBeUndefined();
        });

        it('should set selected to default when default but no value', () => {
            const emitSpy = jest.spyOn(component.updated, 'emit');
            component.options = [{
                optionAttribute: {
                    key: 'key',
                    title: 'title',
                    values: [{
                        label: 'displayValue',
                        value: 'value'
                        },
                        {
                            label: 'defaultDisplayValue',
                            value: 'defaultValue'
                        }],
                    defaultValue: {
                        label: 'defaultDisplayValue',
                        value: 'defaultValue'
                    }
                },
                value$: of(undefined)
            }];

            component.ngOnInit();
            expect(component.key).toEqual('key');
            expect(component.label).toEqual('title');
            expect(component.data).toEqual([{
                values: [{
                        displayValue: 'displayValue',
                        value: 'value'
                    },
                    {
                        displayValue: 'defaultDisplayValue',
                        isSelected: true,
                        value: 'defaultValue'
                    }
                ]
            }]);
            expect(component.selected).toEqual({
                displayValue: 'defaultDisplayValue',
                isSelected: true,
                value: 'defaultValue'
            });
            expect(emitSpy).toHaveBeenCalledTimes(1);
            expect(emitSpy).toHaveBeenCalledWith({
                key: 'key',
                value: 'defaultValue'
            });
        });

        it('should set selected to value when present', () => {
            component.options = [{
                optionAttribute: {
                    key: 'key',
                    title: 'title',
                    values: [{
                        label: 'displayValue',
                        value: 'value'
                    }]
                },
                value$: of('value')
            }];

            component.ngOnInit();
            expect(component.key).toEqual('key');
            expect(component.label).toEqual('title');
            expect(component.data).toEqual([{
                values: [{
                    displayValue: 'displayValue',
                    isSelected: true,
                    value: 'value'
                }]
            }]);
            expect(component.selected).toEqual({
                displayValue: 'displayValue',
                isSelected: true,
                value: 'value'
            });
        });
    });

    it('should emit on selection changed', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        component.onSelectionChanged({detail: {value: {value: 'update'}}} as any);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith({
            key: 'key',
            value: 'update',
            changeType: 'changed'
        });
    });

    it('tests selection change type - manual vs. programmatic', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        const commonObjResult = {
            key: 'key',
            value: 'update'
        };

        // #1
        component.onDropdownOpened();
        component.onDropdownClosed();
        component.onSelectionChanged({detail: {value: {value: 'update'}}} as any);
        expect(emitSpy).toHaveBeenCalledWith({
            ...commonObjResult,
            changeType: OptimizationConstants.PROGRAMMATIC_QUICK_FACTOR_CHANGE
        });

        // #2
        component.onDropdownOpened();
        component.onSelectionChanged({detail: {value: {value: 'update'}}} as any);
        component.onDropdownClosed();
        expect(emitSpy).toHaveBeenCalledWith({
            ...commonObjResult,
            changeType: OptimizationConstants.MANUAL_QUICK_FACTOR_CHANGE
        });

        // #3
        component.onSelectionChanged({detail: {value: {value: 'update'}}} as any);
        expect(emitSpy).toHaveBeenCalledWith({
            ...commonObjResult,
            changeType: OptimizationConstants.PROGRAMMATIC_QUICK_FACTOR_CHANGE
        });
    });
});
