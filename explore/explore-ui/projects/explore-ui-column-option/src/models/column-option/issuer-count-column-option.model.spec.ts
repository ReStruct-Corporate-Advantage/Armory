import {ColumnOptionFactory} from '@blk/explore-ui-core';
import {ActiveCalculationColumnOption} from './active-calculation-column-option.model';
import {IssuerCountColumnOption} from './issuer-count-column-option.model';

describe('Issuer count column options model test', () => {
    let columnOption: IssuerCountColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(IssuerCountColumnOption.CONFIG_TYPE, IssuerCountColumnOption);
    });

    beforeEach(() => {
        columnOption = new IssuerCountColumnOption();
        columnOption.value = true;
    });

    it('Test model initialization', () => {
        expect(columnOption).not.toBeUndefined();
        expect(columnOption).not.toBeNull();
        expect(columnOption.value).toBeTruthy();
    });

    it('test CreateRequest Params', () => {
        const optionValues: any = {};
        columnOption.addRequestParams(optionValues);
        expect(optionValues.issuerType).not.toBeUndefined();
        expect(optionValues.issuerType).not.toBeNull();
        expect(optionValues.issuerType).toBeTruthy();
    });

    it('Test serialize', () => {
        const data = columnOption.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.issuerType).toBeTruthy();
    });

    it('Test deserialize', () => {
        const data: any = {
            issuerType: false
        };
        const model = new IssuerCountColumnOption(data);
        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.value).toBeFalsy();
    });

    it('Test create from factory', () => {
        // NOTE:  We are passing the column option here as there is no default and when first implemented there was
        //        an exception caused by this.
        const mockedOption = {
            columnOptionAttributes: [{
                'title': 'Issuer Type',
                'key': 'issuerType',
                'dataType': 'B'
            }],
            columnOptionTitle: 'Additional Settings',
            columnOptionKey: 'issuercountColumnOptions'
        };

        const model = ColumnOptionFactory.createNewModel(IssuerCountColumnOption.CONFIG_TYPE, mockedOption);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof IssuerCountColumnOption).toBeTruthy();

        const issuerCountModel = model as IssuerCountColumnOption;
        expect(issuerCountModel.value).toBeTruthy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {};
        let model = IssuerCountColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.issuerType = true;
        model = IssuerCountColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.value).toBeTruthy();
    });

    it('Test equals', () => {
        expect(columnOption.equals(columnOption)).toBeTruthy();

        // Create another one the same and ensure it is still equal.
        const other = new IssuerCountColumnOption(columnOption.serialize());
        expect(columnOption.equals(other)).toBeTruthy();

        // Change the value and ensure no longer equal.
        other.value = !columnOption.value;
        expect(columnOption.equals(other)).toBeFalsy();

        // Try with a random other option.
        expect(columnOption.equals(new ActiveCalculationColumnOption())).toBeFalsy();
    });

    it('test getModifiedColumnTitle Params', function () {
        let modifiedTitle = columnOption.getModifiedColumnTitle('Issuer Count');
        expect(modifiedTitle).toBe('Direct Issuer Count');

        // Now try with the flag the other way.
        columnOption.value = false;
        modifiedTitle = columnOption.getModifiedColumnTitle('Issuer Count');
        expect(modifiedTitle).toBe('Parent Issuer Count');
    });
});
