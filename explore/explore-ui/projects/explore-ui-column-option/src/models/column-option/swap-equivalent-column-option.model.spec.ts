import {ColumnOptionFactory} from '@blk/explore-ui-core';
import {ActiveCalculationColumnOption} from './active-calculation-column-option.model';
import {SwapEquivalentColumnOption} from './swap-equivalent-column-option.model';

describe('Swap equivalent column options model test', () => {

    let columnOption: SwapEquivalentColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(SwapEquivalentColumnOption.CONFIG_TYPE, SwapEquivalentColumnOption);
    });

    beforeEach(() => {
        columnOption = new SwapEquivalentColumnOption();
        columnOption.value = 10;
    });

    it('Test model initialization', () => {
        expect(columnOption).not.toBeUndefined();
        expect(columnOption).not.toBeNull();
        expect(columnOption.value).toBe(10);
    });

    it('test CreateRequest Params', () => {
        const optionValues: any = {};
        columnOption.addRequestParams(optionValues);
        expect(optionValues.swapDuration).not.toBeUndefined();
        expect(optionValues.swapDuration).not.toBeNull();
        expect(optionValues.swapDuration).toBe(10);
    });

    it('Test serialize', () => {
        const data = columnOption.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.swapDuration).toBe(10);
    });

    it('Test deserialize', () => {
        const data: any = {
            swapDuration: 2
        };
        const model = new SwapEquivalentColumnOption(data);

        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.value).toBe(2);
    });

    it('Test create from factory', () => {
        const model = ColumnOptionFactory.createNewModel(SwapEquivalentColumnOption.CONFIG_TYPE);

        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof SwapEquivalentColumnOption).toBeTruthy();

        const swapModel = model as SwapEquivalentColumnOption;
        expect(swapModel.value).toBe(1);
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {};
        let model = SwapEquivalentColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.swapDuration = 5;
        model = SwapEquivalentColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.value).toBe(5);
    });

    it('Test equals', () => {
        expect(columnOption.equals(columnOption)).toBeTruthy();

        // Create another one the same and ensure it is still equal.
        const other = new SwapEquivalentColumnOption(columnOption.serialize());
        expect(columnOption.equals(other)).toBeTruthy();

        // Change the value and ensure no longer equal.
        other.value = 5;
        expect(columnOption.equals(other)).toBeFalsy();

        // Try with a random other option.
        expect(columnOption.equals(new ActiveCalculationColumnOption())).toBeFalsy();
    });
});
