import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionCustomAggregationComponent} from './constraint-option-custom-aggregation.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of, Subject} from 'rxjs';
import {Dictionary} from 'lodash';
import {CustomAggregationColumnOption, CustomCalculationConstants} from '@blk/explore-ui-column-option';
import {ConstraintOptionTypeKey} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {TestUtils} from '@utils/test.utils';
import { ColumnConfig } from '@blk/explore-ui-core';

describe('ConstraintOptionCustomAggregationComponent', () => {
    let component: ConstraintOptionCustomAggregationComponent;
    let fixture: ComponentFixture<ConstraintOptionCustomAggregationComponent>;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionCustomAggregationComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionCustomAggregationComponent);
        component = fixture.componentInstance;
        component.options = [
            {
                optionAttribute: {
                    title: 'Type',
                    key: 'subtotalType'
                },
                value$: of(2)
            },
            {
                optionAttribute: {
                    title: 'Weight Type',
                    key: 'weightType'
                },
                value$: of('PORT')
            },
            {
                optionAttribute: {
                    title: '"Column weight type"',
                    key: '"colWeightType"'
                },
                value$: of('NOTIONAL')
            }
        ];
        component.optionValues$ = new Subject<Dictionary<any>>();
        component.optionValues$.next({
                key: ConstraintOptionTypeKey.CUSTOM_AGGREGATION,
                value: new CustomAggregationColumnOption({subtotalType: 2, weightType: 'PORT'})
        });
        component.columnConfig = new ColumnConfig(CustomCalculationConstants.CUSTOM_CALCULATION);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set values on initialization', (done: any) => {
        expect(component.columnConfig.columnTag).toEqual(CustomCalculationConstants.CUSTOM_CALCULATION);
        expect(component.optionMetaData).toBeDefined();
        expect(component.optionMetaData.columnOptionKey).toEqual(ConstraintOptionTypeKey.CUSTOM_AGGREGATION);
        expect(component.optionMetaData.columnOptionAttributes.length).toEqual(3);
        expect(component.restrictedColumnOptions).toBeDefined();
        done();
    });
});
