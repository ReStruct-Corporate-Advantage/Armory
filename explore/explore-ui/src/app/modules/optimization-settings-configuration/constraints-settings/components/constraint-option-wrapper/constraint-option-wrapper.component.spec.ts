import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ConstraintOptionWrapperComponent} from './constraint-option-wrapper.component';
import {ComponentFactory, ComponentFactoryResolver, ComponentRef, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {OptionValueComponent} from '../../interfaces/option-value-component.interface';
import {Observable, of} from 'rxjs';
import {ConstraintOption} from '../../models/constraint-option';
import {ConstraintOptionValueUpdate} from '../../models/constraint-option-value-update';

class MockOptionValueComponent implements OptionValueComponent<any, any> {
    options: Array<ConstraintOption<any>>;
    parentConfig: any;
    updated: Observable<ConstraintOptionValueUpdate<any>>;
}

describe('ConstraintOptionWrapperComponent', () => {
    let component: ConstraintOptionWrapperComponent<any, any>;
    let fixture: ComponentFixture<ConstraintOptionWrapperComponent<any, any>>;
    let componentFactoryResolver: ComponentFactoryResolver;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionWrapperComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{
                provide: ComponentFactoryResolver,
                useValue: {
                    resolveComponentFactory: jest.fn()
                }
            }]
        });

        fixture = TestBed.createComponent(ConstraintOptionWrapperComponent);
        component = fixture.componentInstance;
        componentFactoryResolver = TestBed.inject(ComponentFactoryResolver);
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('should inject component after view init', () => {
        it('should not inject if not valid component', () => {
            component.component = undefined;
            const resolveComponentFactorySpy = jest.spyOn(componentFactoryResolver, 'resolveComponentFactory');

            component.ngAfterViewInit();
            expect(resolveComponentFactorySpy).not.toHaveBeenCalled();
        });

        it('should inject if valid component', fakeAsync(() => {
            component.component = MockOptionValueComponent;
            const resolveComponentFactorySpy = jest.spyOn(componentFactoryResolver, 'resolveComponentFactory');
            const componentFactory: ComponentFactory<OptionValueComponent<any, any>> = {} as any;
            const options: Array<ConstraintOption<any>> = [{
                optionAttribute: {
                    title: 'title',
                    key: 'key'
                },
                value$: of('value')
            }];
            component.options = options;
            const parentConfig = {
                config: 'test'
            };
            component.parentConfig = parentConfig;
            const instance: MockOptionValueComponent = {
                options: undefined,
                parentConfig: undefined,
                updated: of({key: 'key', value: 'update'})
            };
            const componentRef: ComponentRef<OptionValueComponent<any, any>> = {
                instance
            } as any;
            component.viewRef = {
                createComponent: jest.fn()
            } as any;
            const createComponentSpy = jest.spyOn(component.viewRef, 'createComponent');
            createComponentSpy.mockReturnValue(componentRef);
            resolveComponentFactorySpy.mockReturnValue(componentFactory);
            const updatedSpy = jest.spyOn(component.updated, 'emit');

            component.ngAfterViewInit();
            tick();
            expect(resolveComponentFactorySpy).toHaveBeenCalledTimes(1);
            expect(resolveComponentFactorySpy).toHaveBeenCalledWith(MockOptionValueComponent);
            expect(createComponentSpy).toHaveBeenCalledTimes(1);
            expect(createComponentSpy).toHaveBeenCalledWith(componentFactory);
            expect(instance.options).toBe(options);
            expect(instance.parentConfig).toBe(parentConfig);
            expect(updatedSpy).toHaveBeenCalledTimes(1);
            expect(updatedSpy).toHaveBeenCalledWith({
                key: 'key',
                value: 'update'
            });
        }));
    });
});
