import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {FxFactorOptionsColumnOption} from './fx-factor-options-column-option.model';

describe('Fx factor options column option', () => {

    let fxFactorOptionsColumnOption: FxFactorOptionsColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(FxFactorOptionsColumnOption.CONFIG_TYPE, FxFactorOptionsColumnOption);
    });

    beforeEach(() => {
        fxFactorOptionsColumnOption = new FxFactorOptionsColumnOption();
    });

    it('Test model initialization', () => {
        expect(fxFactorOptionsColumnOption).not.toBeUndefined();
        expect(fxFactorOptionsColumnOption).not.toBeNull();
        expect(fxFactorOptionsColumnOption.fxCrossCurrency).toBe(undefined);
    });

    it('test CreateRequest Params', () => {
        fxFactorOptionsColumnOption.fxCrossCurrency = 'USD';
        const optionValues: any = {};
        fxFactorOptionsColumnOption.addRequestParams(optionValues);
        expect(optionValues.fxCrossCurrency).toBe('USD');
    });

    it('Test serialize/deserialize', () => {
        fxFactorOptionsColumnOption.fxCrossCurrency = 'USD';
        const data: any = fxFactorOptionsColumnOption.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.configType).toBe(fxFactorOptionsColumnOption.configType);
        expect(data.fxCrossCurrency).toBe(fxFactorOptionsColumnOption.fxCrossCurrency);


        const newFxFactorOptionsColumnOption = new FxFactorOptionsColumnOption();
        newFxFactorOptionsColumnOption.deserialize(data);
        expect(newFxFactorOptionsColumnOption.fxCrossCurrency).toBe(fxFactorOptionsColumnOption.fxCrossCurrency);
    });


    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(FxFactorOptionsColumnOption.CONFIG_TYPE);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof FxFactorOptionsColumnOption).toBeTruthy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: FxFactorOptionsColumnOption = FxFactorOptionsColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.fxCrossCurrency = 'AUD';

        model = FxFactorOptionsColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.fxCrossCurrency).toBe('AUD');
        expect(data.dateFormat).not.toBeDefined();
    });

    it('Test equals', () => {
        const model1: FxFactorOptionsColumnOption = new FxFactorOptionsColumnOption();
        const model2: FxFactorOptionsColumnOption = new FxFactorOptionsColumnOption();
        expect(model1.equals(model2)).toBeTruthy();

        // Different fxCrossCurrency
        model1.fxCrossCurrency = 'USD';
        model2.fxCrossCurrency = 'AUD';
        expect(model1.equals(model2)).toBeFalsy();

        // Everything same
        model2.fxCrossCurrency = 'USD';
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', () => {
        expect(fxFactorOptionsColumnOption.isValid()).toBeFalsy();
        fxFactorOptionsColumnOption.fxCrossCurrency = 'USD';
        expect(fxFactorOptionsColumnOption.isValid()).toBeTruthy();
    });

});

