import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {MissingDataHandlingColumnOptionModel} from './missing-data-handling-column-option.model';

describe('Missing Data Handling column options', () => {
    let missingDataHandlingColumnOptionModel: MissingDataHandlingColumnOptionModel;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(MissingDataHandlingColumnOptionModel.CONFIG_TYPE, MissingDataHandlingColumnOptionModel);
    });

    beforeEach(() => {
        missingDataHandlingColumnOptionModel = new MissingDataHandlingColumnOptionModel();
        missingDataHandlingColumnOptionModel.missingDataHandling = 'applyDNTConstraint';
    });

    it('Test model initialization', () => {
        expect(missingDataHandlingColumnOptionModel).not.toBeUndefined();
        expect(missingDataHandlingColumnOptionModel).not.toBeNull();
        expect(missingDataHandlingColumnOptionModel.missingDataHandling).toEqual('applyDNTConstraint');
    });

    it('test CreateRequest Params', () => {
        const optionValues: any = {};
        missingDataHandlingColumnOptionModel.addRequestParams(optionValues);
        expect(optionValues.missingDataHandling).toEqual('applyDNTConstraint');
    });

    it('Test serialize/deserialize', () => {
        const data: any = missingDataHandlingColumnOptionModel.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.configType).toBe(missingDataHandlingColumnOptionModel.configType);
        expect(data.missingDataHandling).toBe(missingDataHandlingColumnOptionModel.missingDataHandling);

        const newMissingDataHandlingColumnOption = new MissingDataHandlingColumnOptionModel();
        newMissingDataHandlingColumnOption.deserialize(data);
        expect(newMissingDataHandlingColumnOption.missingDataHandling).toBe(missingDataHandlingColumnOptionModel.missingDataHandling);
    });


    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(MissingDataHandlingColumnOptionModel.CONFIG_TYPE);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof MissingDataHandlingColumnOptionModel).toBeTruthy();
    });

    it('Test equals', () => {
        const model1: MissingDataHandlingColumnOptionModel = new MissingDataHandlingColumnOptionModel();
        const model2: MissingDataHandlingColumnOptionModel = new MissingDataHandlingColumnOptionModel();
        expect(model1.equals(model2)).toBeTruthy();

        // Different number of decimal places
        model1.missingDataHandling = 'setValueZero';
        model2.missingDataHandling = 'applyDNTConstraint';
        expect(model1.equals(model2)).toBeFalsy();

        // Everything same
        model2.missingDataHandling = 'setValueZero';
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', () => {
        missingDataHandlingColumnOptionModel = new MissingDataHandlingColumnOptionModel();
        missingDataHandlingColumnOptionModel.missingDataHandling = 'setValueZero';
        expect(missingDataHandlingColumnOptionModel.isValid()).toBeTruthy();
    });
});

