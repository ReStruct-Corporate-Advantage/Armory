import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {ActiveType} from '../../enums';
import {ActiveCalculationColumnOption} from './active-calculation-column-option.model';

describe('Active Calculation Column Options model test', () => {
    let activeCalculationColumnOptionModel: ActiveCalculationColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(ActiveCalculationColumnOption.CONFIG_TYPE, ActiveCalculationColumnOption);
    });

    beforeEach(() => {
        activeCalculationColumnOptionModel = new ActiveCalculationColumnOption();
        activeCalculationColumnOptionModel.activeType = ActiveType[ActiveType.RATIO_2TO1];
    });

    it('Test model initialization', () => {
        expect(activeCalculationColumnOptionModel).not.toBeUndefined();
        expect(activeCalculationColumnOptionModel).not.toBeNull();
        expect(activeCalculationColumnOptionModel.activeType).toBe(ActiveType[ActiveType.RATIO_2TO1]);
    });

    it('test CreateRequest Params', () => {
        let optionValues: any = {};
        activeCalculationColumnOptionModel.addRequestParams(optionValues);
        expect(optionValues.activeType).not.toBeUndefined();
        expect(optionValues.activeType).not.toBeNull();
        expect(optionValues.activeType).toBe(ActiveType[ActiveType.RATIO_2TO1]);

        activeCalculationColumnOptionModel.activeType = null;
        optionValues = {};
        activeCalculationColumnOptionModel.addRequestParams(optionValues);
        expect(optionValues.activeType).toBeUndefined();
    });


    it('Test serialize', () => {
        let data = activeCalculationColumnOptionModel.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.activeType).toBe(ActiveType[ActiveType.RATIO_2TO1]);

        activeCalculationColumnOptionModel.activeType = null;
        data = activeCalculationColumnOptionModel.serialize(false);
        expect(data).toBeUndefined();
    });

    it('Test deserialize', () => {
        const data: any = {
            activeType: ActiveType[ActiveType.RATIO_2TO1]
        };
        const model: ActiveCalculationColumnOption = new ActiveCalculationColumnOption(data);

        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.activeType).toBe(ActiveType[ActiveType.RATIO_2TO1]);
    });

    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(ActiveCalculationColumnOption.CONFIG_TYPE);

        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof ActiveCalculationColumnOption).toBeTruthy();
    });

    it('Test equals', () => {
        const model1: ActiveCalculationColumnOption = new ActiveCalculationColumnOption();
        const model2: ActiveCalculationColumnOption = new ActiveCalculationColumnOption();
        expect(model1.equals(model2)).toBeTruthy();
        model1.activeType = ActiveType[ActiveType.RATIO_2TO1];
        model2.activeType = ActiveType[ActiveType.DIFF_1MINUS2];
        expect(model1.equals(model2)).toBeFalsy();

        model1.activeType = ActiveType[ActiveType.DIFF_1MINUS2];
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', () => {
        const model1: ActiveCalculationColumnOption = new ActiveCalculationColumnOption();
        expect(model1.isValid()).toBeFalsy();

        model1.activeType = null;
        expect(model1.isValid()).toBeFalsy();

        model1.activeType = '';
        expect(model1.isValid()).toBeFalsy();

        model1.activeType = ActiveType[ActiveType.RATIO_2TO1];
        expect(model1.isValid()).toBeTruthy();
    });
});
