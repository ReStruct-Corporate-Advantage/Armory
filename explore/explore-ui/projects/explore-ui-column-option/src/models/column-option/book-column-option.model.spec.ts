import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {BookColumnOption} from './book-column-option.model';

describe('Book column options', () => {
    let bookColumnModel: BookColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(BookColumnOption.CONFIG_TYPE, BookColumnOption);
    });

    beforeEach(() => {
        bookColumnModel = new BookColumnOption();
        bookColumnModel.accountingConvention = 'GAAP';
    });

    it('Test model initialization', () => {
        expect(bookColumnModel).not.toBeUndefined();
        expect(bookColumnModel).not.toBeNull();
        expect(bookColumnModel.accountingConvention).toBe('GAAP');
    });

    it('test CreateRequest Params', () => {
        let optionValues: any = {};
        const optionKey = 'accountingConvention';
        bookColumnModel.addRequestParams(optionValues);
        expect(optionValues[optionKey]).not.toBeUndefined();
        expect(optionValues[optionKey]).not.toBeNull();
        expect(optionValues[optionKey]).toBe('GAAP');

        bookColumnModel.accountingConvention = null;
        optionValues = {};
        bookColumnModel.addRequestParams(optionValues);
        expect(optionValues[optionKey]).toBeUndefined();
    });

    it('test getModifiedColumnTitle Params', () => {
        const modifiedTitle = bookColumnModel.getModifiedColumnTitle('Book Value');
        expect(modifiedTitle).toBe('Book Value (GAAP)');
    });

    it('Test serialize', () => {
        let data: any = bookColumnModel.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.configType).toBe(bookColumnModel.configType);
        expect(data.accountingConvention).toBe(bookColumnModel.accountingConvention);

        bookColumnModel.accountingConvention = null;
        data = bookColumnModel.serialize(false);
        expect(data).toBeUndefined();
    });

    it('Test deserialize', () => {
        const data: any = {
            accountingConvention: 'GAAP'
        };
        const model: BookColumnOption = new BookColumnOption(data);
        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.accountingConvention).toBe('GAAP');
    });

    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(BookColumnOption.CONFIG_TYPE);

        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof BookColumnOption).toBeTruthy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: BookColumnOption = BookColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.accountingConvention = 'GAAP';
        model = BookColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.accountingConvention).toBe('GAAP');
        expect(data.accountingConvention).not.toBeDefined();
    });

    it('Test equals', () => {
        const model1: BookColumnOption = new BookColumnOption();
        const model2: BookColumnOption = new BookColumnOption();
        expect(model1.equals(model2)).toBeTruthy();
        model1.accountingConvention = 'GAAP';
        model2.accountingConvention = 'WSTO';
        expect(model1.equals(model2)).toBeFalsy();

        model2.accountingConvention = 'GAAP';
        model1.bookFxConversion = true;

        expect(model1.equals(model2)).toBeFalsy();
        model1.bookFxConversion = false;
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', () => {
        const model1: BookColumnOption = new BookColumnOption();
        expect(model1.isValid()).toBeFalsy();

        model1.accountingConvention = null;
        expect(model1.isValid()).toBeFalsy();

        model1.accountingConvention = '';
        expect(model1.isValid()).toBeFalsy();

        model1.accountingConvention = 'GAAP';
        expect(model1.isValid()).toBeTruthy();
    });

});

