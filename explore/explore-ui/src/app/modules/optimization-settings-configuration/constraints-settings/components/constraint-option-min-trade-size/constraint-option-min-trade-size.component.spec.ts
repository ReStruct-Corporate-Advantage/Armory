import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {of, Subject} from 'rxjs';
import {Dictionary} from 'lodash';

import {ConstraintOptionMinTradeSizeComponent} from './constraint-option-min-trade-size.component';
import {ConstraintOptionTypeKey} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {ColumnConfig} from '@blk/explore-ui-core';

describe('ConstraintOptionMinTradeSizeComponent', () => {
    let component: ConstraintOptionMinTradeSizeComponent;
    let fixture: ComponentFixture<ConstraintOptionMinTradeSizeComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionMinTradeSizeComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionMinTradeSizeComponent);
        component = fixture.componentInstance;
        component.options = [
            {
                optionAttribute: {
                    title: 'ConstraintValue',
                    key: 'constraintNumberValue'
                },
                value$: of(true)
            },
            {
                optionAttribute: {
                    title: 'Unit',
                    key: 'ConstraintUnit'
                },
                value$: of(true)
            },
            {
                optionAttribute: {
                    title: 'Min Trade Size',
                    key: 'minTradeSize'
                },
                value$: of(5)
            },
            {
                optionAttribute: {
                    title: 'Trade Increment',
                    key: 'tradeIncrement'
                },
                value$: of(10)
            }
        ];
        component.optionValues$ = new Subject<Dictionary<any>>();
        component.optionValues$.next({
            key: ConstraintOptionTypeKey.MIXED_INTEGER_SUPPORT,
            value: true
        });
        component.optionValues$.next({
            key: 'minTradeSize',
            value: 5
        });
        component.optionValues$.next({
            key: 'tradeIncrement',
            value: 5
        });
        component.columnConfig = new ColumnConfig('min_trade_size');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit on min trade size changed', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        component.tradeIncrementKey = 'minTradeSize';
        component.onTradeIncrementChanged({detail: {value: '5'}});
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit on trade increment changed', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        component.tradeIncrementKey = 'tradeIncrement';
        component.onTradeIncrementChanged({detail: {value: '5'}});
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit on checkbox changed', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        component.onCheckBoxChanged({detail: {value: {checked: true}}});
        expect(emitSpy).toHaveBeenCalledTimes(2);
    });
});
