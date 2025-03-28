import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {PortfolioNameColumnOption} from './portfolio-name-column-option.model';

describe('PortfolioNameColumnOption', () => {
    let portfolioNameOptionsModel: PortfolioNameColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(PortfolioNameColumnOption.CONFIG_TYPE, PortfolioNameColumnOption);
    });

    beforeEach(() => {
        portfolioNameOptionsModel = new PortfolioNameColumnOption();
        portfolioNameOptionsModel.initialize('defaultSettings');
    });

    it('Test model initialization', () => {
        expect(portfolioNameOptionsModel).not.toBeUndefined();
        expect(portfolioNameOptionsModel).not.toBeNull();
        portfolioNameOptionsModel.initialize('defaultSettings');
        expect(portfolioNameOptionsModel.showShortNameForPortGroup).toBe(true);
        expect(portfolioNameOptionsModel.showShortNameForPortfolio).toBe(true);
    });

    it('Test CreateRequest Params', () => {
        const optionValues: any = {};
        portfolioNameOptionsModel.doAddRequestParams(optionValues);
        expect(optionValues['showShortNameForPortfolio']).not.toBeUndefined();
        expect(optionValues['showShortNameForPortfolio']).not.toBeNull();
        expect(optionValues['showShortNameForPortfolio']).toBeTruthy();
        expect(optionValues['showShortNameForPortGroup']).not.toBeUndefined();
        expect(optionValues['showShortNameForPortGroup']).not.toBeNull();
        expect(optionValues['showShortNameForPortGroup']).toBeTruthy();
    });

    it('Test serialize', () => {
        const data = portfolioNameOptionsModel.serialize();
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.showShortNameForPortGroup).toBeTruthy();
        expect(data.showShortNameForPortfolio).toBeTruthy();
    });

    it('Test deserialize', () => {
        const data: any = {
            showShortNameForPortGroup: true,
            showShortNameForPortfolio: false
        };
        const model: PortfolioNameColumnOption = new PortfolioNameColumnOption(data);
        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.showShortNameForPortGroup).toBeTruthy();
        expect(model.showShortNameForPortfolio).toBeFalsy();
    });

    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(PortfolioNameColumnOption.CONFIG_TYPE);

        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof PortfolioNameColumnOption).toBeTruthy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: PortfolioNameColumnOption = PortfolioNameColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.showShortNameForPortfolio = true;
        data.showShortNameForPortGroup = false;

        model = PortfolioNameColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.showShortNameForPortfolio).toBeTruthy();
        expect(model.showShortNameForPortGroup).toBeFalsy();
        expect(data.showShortNameForPortfolio).not.toBeDefined();
        expect(data.showShortNameForPortGroup).not.toBeDefined();
    });

    it('Test equals', () => {
        const model1: PortfolioNameColumnOption = new PortfolioNameColumnOption();
        const model2: PortfolioNameColumnOption = new PortfolioNameColumnOption();
        expect(model1.equals(model2)).toBeTruthy();
        model1.showShortNameForPortfolio = true;
        model1.showShortNameForPortGroup = false;
        model2.showShortNameForPortfolio = false;
        model2.showShortNameForPortGroup = true;
        expect(model1.equals(model2)).toBeFalsy();

        model2.showShortNameForPortfolio = true;
        model2.showShortNameForPortGroup = false;
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', () => {
        const model1: PortfolioNameColumnOption = new PortfolioNameColumnOption();
        expect(model1.isValid()).toBeFalsy();

        model1.showShortNameForPortfolio = true;
        expect(model1.isValid()).toBeFalsy();

        model1.showShortNameForPortGroup = true;
        expect(model1.isValid()).toBeTruthy();
    });
});
