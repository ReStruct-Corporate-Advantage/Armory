import {ColumnOptionFactory} from '@blk/explore-ui-core';
import {ActiveCalculationColumnOption} from './active-calculation-column-option.model';
import {ScopeColumnOption} from './scope-column-option.model';

describe('Scope column options model test', () => {
    let columnOption: ScopeColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(ScopeColumnOption.CONFIG_TYPE, ScopeColumnOption);
    });

    beforeEach(() => {
        columnOption = new ScopeColumnOption();
    });

    it('Test model initialization', () => {
        expect(columnOption).not.toBeUndefined();
        expect(columnOption).not.toBeNull();
        expect(columnOption.isApplyBenchmarkSecuritiesChecked).toBe(true);
    });

    it('test CreateRequest Params', () => {
        const optionValues: any = {};
        columnOption.addRequestParams(optionValues);
        expect(optionValues.scope).not.toBeUndefined();
        expect(optionValues.scope).not.toBeNull();
        expect(optionValues.scope.isApplyBenchmarkSecuritiesChecked).toBe(true);
    });

    it('Test serialize', () => {
        const data = columnOption.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.isApplyBenchmarkSecuritiesChecked).toBe(true);
    });

    it('Test deserialize', () => {
        const data: any = {
            isApplyBenchmarkSecuritiesChecked: true
        };
        const model = new ScopeColumnOption(data);

        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.isApplyBenchmarkSecuritiesChecked).toBe(true);
    });

    it('Test equals', () => {
        expect(columnOption.equals(columnOption)).toBeTruthy();

        // Create another one the same and ensure it is still equal.
        const other = new ScopeColumnOption(columnOption.serialize());
        expect(columnOption.equals(other)).toBeTruthy();

        // Change the value and ensure no longer equal.
        other.isApplyBenchmarkSecuritiesChecked = false;
        expect(columnOption.equals(other)).toBeFalsy();

        // Try with a random other option.
        expect(columnOption.equals(new ActiveCalculationColumnOption())).toBeFalsy();
    });
});

