import {SortOrderColumnOptionModel} from '@models/columns/column-options/sort-order-column-option.model';

describe('Sort Order column options', function () {

    let sortOrderColumnOptionModel: SortOrderColumnOptionModel;

    beforeEach(() => {
        sortOrderColumnOptionModel = new SortOrderColumnOptionModel();
        sortOrderColumnOptionModel.sortOrder = 'DESC';
    });

    it('Test model initialization', function () {
        expect(sortOrderColumnOptionModel).not.toBeUndefined();
        expect(sortOrderColumnOptionModel).not.toBeNull();
        expect(sortOrderColumnOptionModel.sortOrder).toBe('DESC');
    });

    it('test CreateRequest Params', function () {
        let optionValues: any = {};
        const optionKey = 'columnSorting';
        sortOrderColumnOptionModel.addRequestParams(optionValues);
        expect(optionValues[optionKey]).not.toBeUndefined();
        expect(optionValues[optionKey]).not.toBeNull();
        expect(optionValues[optionKey]).toStrictEqual({'sortOrder': 'DESC'});

        sortOrderColumnOptionModel.sortOrder = null;
        optionValues = {};
        sortOrderColumnOptionModel.addRequestParams(optionValues);
        expect(optionValues[optionKey]).toBeUndefined();
    });

    it('Test serialize', function () {
        let data: any = sortOrderColumnOptionModel.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.configType).toBe(sortOrderColumnOptionModel.configType);
        expect(data.sortOrder).toBe(sortOrderColumnOptionModel.sortOrder);

        sortOrderColumnOptionModel.sortOrder = null;
        data = sortOrderColumnOptionModel.serialize(false);
        expect(data).toBeUndefined();
    });

    it('Test deserialize', function () {
        const data: any = {
            sortOrder: 'DESC'
        };
        const model: SortOrderColumnOptionModel = new SortOrderColumnOptionModel(data);
        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.sortOrder).toBe('DESC');
    });

    it('Test equals', function () {
        const model1: SortOrderColumnOptionModel = new SortOrderColumnOptionModel();
        const model2: SortOrderColumnOptionModel = new SortOrderColumnOptionModel();
        expect(model1.equals(model2)).toBeTruthy();
        model1.sortOrder = 'DESC';
        model2.sortOrder = 'ASC';
        expect(model1.equals(model2)).toBeFalsy();

        model2.sortOrder = 'DESC';
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', function () {
        const model1: SortOrderColumnOptionModel = new SortOrderColumnOptionModel();
        expect(model1.isValid()).toBeFalsy();

        model1.sortOrder = null;
        expect(model1.isValid()).toBeFalsy();

        model1.sortOrder = '';
        expect(model1.isValid()).toBeFalsy();

        model1.sortOrder = 'DESC';
        expect(model1.isValid()).toBeTruthy();
    });
});
