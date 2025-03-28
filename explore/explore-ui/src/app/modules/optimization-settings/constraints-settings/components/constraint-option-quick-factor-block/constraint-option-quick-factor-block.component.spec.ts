import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionQuickFactorBlockComponent} from './constraint-option-quick-factor-block.component';
import {ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of, Subject} from 'rxjs';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {QUICK_FACTOR_BLOCK_LIST} from '@optimization-settings/constraints-settings/constants/constraint.constants';
import {AppStore} from '../../../../../app.store';
import {ConstraintOptionTypeKey} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';

describe('ConstraintOptionQuickFactorBlockComponent', () => {
    let component: ConstraintOptionQuickFactorBlockComponent;
    let fixture: ComponentFixture<ConstraintOptionQuickFactorBlockComponent>;

    const appStoreStub = {
        toggleFactorConstraintValue$: {
            pipe: jest.fn(() => new Subject<string>()),
            next: jest.fn(() => {})
        }
    };

    const cdRefStub = {
        detectChanges: jest.fn(() => {})
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionQuickFactorBlockComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: AppStore, useValue: appStoreStub},
                {provide: ChangeDetectorRef, useValue: cdRefStub}
            ]
        });

        fixture = TestBed.createComponent(ConstraintOptionQuickFactorBlockComponent);
        component = fixture.componentInstance;
        component.options = [{
            optionAttribute: {
                title: 'title',
                key: 'key'
            },
            value$: of('value')
        }];
        fixture.detectChanges();
    });

    it('should set values on init', (done: any) => {
        expect(component.selectOptions).toEqual([{
            optionAttribute: {
                title: 'title',
                key: 'key',
                values: QUICK_FACTOR_BLOCK_LIST,
                defaultValue: {
                    label: 'None',
                    value: ''
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
            value: 'update',
            changeType: 'opened,changed'
        };
        component.onUpdated(update);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith(update);
    });

    it('tests disableOtherField', () => {
        component.quickFactorBlockValue = {key: 'test', value: 'EQ', changeType: 'opened,changed'};
        component.disableOtherField();
        expect(component.isDisabled).toBe(false);
        expect(component['appStore'].toggleFactorConstraintValue$.next).toHaveBeenCalledWith(ConstraintOptionTypeKey.FACTOR_TAG);
    });
});
