import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionFactorTagComponent} from './constraint-option-factor-tag.component';
import {ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AppStore} from '../../../../../app.store';
import {of, Subject} from 'rxjs';
import {ConstraintOptionTypeKey} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {ColumnConfig, CoreCommonConstants} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';

describe('ConstraintFactorTagComponent', () => {
    let component: ConstraintOptionFactorTagComponent;
    let fixture: ComponentFixture<ConstraintOptionFactorTagComponent>;

    const appStoreStub = {
        toggleFactorConstraintValue$: new Subject<string>()
    };

    const cdRefStub = {
        detectChanges: jest.fn(() => {})
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionFactorTagComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: AppStore, useValue: appStoreStub},
                {provide: ChangeDetectorRef, useValue: cdRefStub}
            ]
        });

        fixture = TestBed.createComponent(ConstraintOptionFactorTagComponent);
        component = fixture.componentInstance;
        component.options = [{
            value$: of(),
            optionAttribute: {title: '', key: ''}
        }];
        fixture.detectChanges();
    });

    it('tests ngOnInit', () => {
        jest.spyOn(component, 'disableAndResetOption');
        jest.spyOn(component.updated, 'emit');
        component['appStore'].toggleFactorConstraintValue$.next(ConstraintOptionTypeKey.FACTOR_TAG);
        expect(component.disableAndResetOption).toHaveBeenCalledWith(ConstraintOptionTypeKey.FACTOR_TAG, ConstraintOptionTypeKey.FACTOR_TAG);
        expect(component.isDisabled).toBe(true);
        expect(component.factorRadio.isChecked).toBe(false);
        expect(component.updated.emit).toHaveBeenCalledWith({key: ConstraintOptionTypeKey.FACTOR_TAG, value: CoreCommonConstants.EMPTY_STRING});
    });

    it('tests updateCheckedAndDisablePropsOnValChange', () => {
        jest.spyOn(component['cdRef'], 'detectChanges');
        component.isDisabled = null;
        component.factorRadio.isChecked = null;
        component.updateCheckedAndDisablePropsOnValChange('');
        expect(component.isDisabled).toBe(true);
        expect(component.factorRadio.isChecked).toBe(false);
        expect(component['cdRef'].detectChanges).toHaveBeenCalled();
    });

    it('tests onUpdated', () => {
        jest.spyOn(component.updated, 'emit').mockImplementation(() => {});
        const event = {
            key: 'abc',
            value: 'bcd'
        };
        component.onUpdated(event);
        expect(component.updated.emit).toHaveBeenCalledWith(event);
    });

    it('should test factor modals', () => {
        component.ngOnInit();
        const columnConfig = ColumnConfig.createColumn('pct_mv');
        const columnSet = new ColumnSet();
        columnSet.columns = [columnConfig];
        component.inputs.set('columns', columnSet);
        jest.spyOn(component.updated, 'emit');
        component.onFactorsModalClosed(true);
        expect(component.updated.emit).toHaveBeenCalledWith({key: ConstraintOptionTypeKey.FACTOR_TAG, value: 'pct_mv'});
    });
});
