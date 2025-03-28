import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionSecurityListComponent} from './constraint-option-security-list.component';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BehaviorSubject, of} from 'rxjs';
import {Dictionary} from 'lodash';
import {Security} from '@interfaces/security.interface';
import {SecuritySearchComponent} from '../../../../../shared/components';

@Component({
    selector: 'app-security-search',
    template: ''
})
export class MockSecuritySearchComponent {
    validateAndAddSecurities(securities: Map<string, Security>) {
    }
}

describe('ConstraintOptionSecurityListComponent', () => {
    let component: ConstraintOptionSecurityListComponent;
    let fixture: ComponentFixture<ConstraintOptionSecurityListComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionSecurityListComponent, MockSecuritySearchComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionSecurityListComponent);
        component = fixture.componentInstance;
        component.options = [{
            optionAttribute: {
                title: 'title',
                key: 'key'
            },
            value$: of('value')
        }];
        component.optionValues$ = new BehaviorSubject<Dictionary<any>>({'securityList': 'Benchmark', 'selectedSecurities': new Map()});
        component.parentConfig = {
            investmentUniverseSettings: {
                investmentUniverse: [{
                    label: 'label',
                    enabled: true
                }]
            }
        };
        component.securitySearchComp = TestBed.createComponent(MockSecuritySearchComponent).componentInstance as SecuritySearchComponent;
        fixture.detectChanges();
        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set values on init', (done: any) => {
        expect(component.selectOptions).toEqual([{
            optionAttribute: {
                title: 'title',
                key: 'key',
                values: [{
                    label: 'label',
                    value: 'label'
                },
                    {
                        label: 'Investment Universe',
                        value: 'Investment Universe'
                    }],
                defaultValue: {
                    label: 'label',
                    value: 'label'
                }
            },
            value$: expect.anything()
        }]);
        component.selectOptions[0].value$.subscribe((value: any) => {
            expect(value).toBe('value');
            done();
        });
    });

    it('should emit on selection changed', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        const update: ConstraintOptionValueUpdate<string> = {
            key: 'key',
            value: 'update'
        };
        component.onUpdated(update);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith(update);
    });


    it('should filter unselected items', () => {
        component.parentConfig = {
            investmentUniverseSettings: {
                investmentUniverse: [{
                    label: 'label',
                    enabled: true
                }, {
                    label: 'label-1',
                    enabled: false
                }]
            }
        };
        component.ngOnInit();
        expect(component.selectOptions[0].optionAttribute.values.length).toEqual(2);
    });
});
