import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionRadioComponent} from './constraint-option-radio.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of} from 'rxjs';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';

describe('ConstraintOptionRadioComponent', () => {
    let component: ConstraintOptionRadioComponent<any>;
    let fixture: ComponentFixture<ConstraintOptionRadioComponent<any>>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionRadioComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionRadioComponent);
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
        it('should use provided value if present', (done: any) => {
            component.options = [{
                optionAttribute: {
                    key: 'key',
                    title: 'title',
                    defaultValue: {
                        label: 'label1',
                        value: 'value1'
                    },
                    values: [{
                        label: 'label1',
                        value: 'value1'
                    }, {
                        label: 'label2',
                        value: 'value2'
                    }]
                },
                value$: of('value2')
            }];

            component.ngOnInit();
            expect(component.key).toBe('key');
            component.data$.subscribe((data: AuxRadioInterface[]) => {
                expect(data).toEqual([{
                    label: 'label1',
                    eventData: 'value1',
                    checked: false
                }, {
                    label: 'label2',
                    eventData: 'value2',
                    checked: true
                }]);
                done();
            });
        });

        it('should use defalt value if present and no value', (done: any) => {
            component.options = [{
                optionAttribute: {
                    key: 'key',
                    title: 'title',
                    defaultValue: {
                        label: 'label2',
                        value: 'value2'
                    },
                    values: [{
                        label: 'label1',
                        value: 'value1'
                    }, {
                        label: 'label2',
                        value: 'value2'
                    }]
                },
                value$: of(undefined)
            }];

            component.ngOnInit();
            expect(component.key).toBe('key');
            component.data$.subscribe((data: AuxRadioInterface[]) => {
                expect(data).toEqual([{
                    label: 'label1',
                    eventData: 'value1',
                    checked: false
                }, {
                    label: 'label2',
                    eventData: 'value2',
                    checked: true
                }]);
                done();
            });
        });

        it('should use first value if no overrides', (done: any) => {
            component.options = [{
                optionAttribute: {
                    key: 'key',
                    title: 'title',
                    values: [{
                        label: 'label1',
                        value: 'value1'
                    }, {
                        label: 'label2',
                        value: 'value2'
                    }]
                },
                value$: of(undefined)
            }];

            component.ngOnInit();
            expect(component.key).toBe('key');
            component.data$.subscribe((data: AuxRadioInterface[]) => {
                expect(data).toEqual([{
                    label: 'label1',
                    eventData: 'value1',
                    checked: true
                }, {
                    label: 'label2',
                    eventData: 'value2',
                    checked: false
                }]);
                done();
            });
        });
    });

    it('should emit on radio group changed', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        component.onRadioGroupChanged({detail: {value: {eventData: 'update'}}} as any);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith({
            key: 'key',
            value: 'update'
        });
    });
});
