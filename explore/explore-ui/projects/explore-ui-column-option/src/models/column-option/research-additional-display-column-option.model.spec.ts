import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {ResearchAdditionalDisplayColumnOption} from './research-additional-display-column-option.model';

describe('Research additional display column option model test', () => {
    let researchAdditionalDisplayColumnOption: ResearchAdditionalDisplayColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(ResearchAdditionalDisplayColumnOption.CONFIG_TYPE, ResearchAdditionalDisplayColumnOption);
    });

    beforeEach(() => {
        researchAdditionalDisplayColumnOption = new ResearchAdditionalDisplayColumnOption();
    });

    it('Test model initialization', () => {
        const defaultSettings = {
            columnOptionAttributes: [{
                defaultValue: {
                    value: false
                }
            }]
        };
        researchAdditionalDisplayColumnOption.initialize(defaultSettings);
        expect(researchAdditionalDisplayColumnOption).not.toBeUndefined();
        expect(researchAdditionalDisplayColumnOption).not.toBeNull();
        expect(researchAdditionalDisplayColumnOption.showMembership).toBeFalsy();
    });

    it('test CreateRequest Params', function () {
        let optionValues: any = {};
        researchAdditionalDisplayColumnOption.addRequestParams(optionValues);
        expect(optionValues.showMembership).toBeUndefined();

        researchAdditionalDisplayColumnOption.showMembership = true;
        optionValues = {};
        researchAdditionalDisplayColumnOption.addRequestParams(optionValues);
        expect(optionValues.showMembership).toBeTruthy();
    });

    it('Test serialize', function () {
        let data: any = researchAdditionalDisplayColumnOption.serialize(false);
        expect(data).toBeUndefined();
        researchAdditionalDisplayColumnOption.showMembership = false;
        data = researchAdditionalDisplayColumnOption.serialize(false);
        expect(data.showMembership).toBeFalsy();
    });

    it('Test deserialize', function () {
        const data: any = {
            showMembership: true
        };
        const newResearchAdditionalDisplayColumnOption = new ResearchAdditionalDisplayColumnOption();
        newResearchAdditionalDisplayColumnOption.deserialize(data);
        expect(newResearchAdditionalDisplayColumnOption).not.toBeUndefined();
        expect(newResearchAdditionalDisplayColumnOption).not.toBeNull();
        expect(newResearchAdditionalDisplayColumnOption.showMembership).toBeTruthy();
    });

    it('Test create from factory', function () {
        const defaultSettings = {
            columnOptionAttributes: [{
                defaultValue: {
                    value: false
                }
            }]
        };
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(ResearchAdditionalDisplayColumnOption.CONFIG_TYPE, defaultSettings);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof ResearchAdditionalDisplayColumnOption).toBeTruthy();
    });

    it('Test create legacy model', function () {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: ResearchAdditionalDisplayColumnOption = ResearchAdditionalDisplayColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.showMembership = false;
        model = ResearchAdditionalDisplayColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.showMembership).toBeFalsy();
    });

    it('Test equals', function () {
        const model1: ResearchAdditionalDisplayColumnOption = new ResearchAdditionalDisplayColumnOption();
        const model2: ResearchAdditionalDisplayColumnOption = new ResearchAdditionalDisplayColumnOption();
        expect(model1.equals(model2)).toBeTruthy();
        model1.showMembership = false;
        model2.showMembership = true;
        expect(model1.equals(model2)).toBeFalsy();
    });

    it('Test isValid', function () {
        const model1: ResearchAdditionalDisplayColumnOption = new ResearchAdditionalDisplayColumnOption();
        expect(model1.isValid()).toBeFalsy();
        model1.showMembership = false;
        expect(model1.isValid()).toBeTruthy();
    });
});
