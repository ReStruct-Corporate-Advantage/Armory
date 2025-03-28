import {CustomCalculationMeasureNodeColumnOption} from './custom-calculation-measure-node-column-option.model';

describe('CustomCalculationMeasureNodeColumnOption', () => {
    let customCalculationOperandNode: CustomCalculationMeasureNodeColumnOption;

    beforeEach(() => {
        customCalculationOperandNode = new CustomCalculationMeasureNodeColumnOption();
        customCalculationOperandNode.initialize(null);
    });

    it('Test model initialization', () => {
        expect(customCalculationOperandNode).not.toBeUndefined();
        expect(customCalculationOperandNode).not.toBeNull();
        expect(customCalculationOperandNode.nodeTypeValue).toBeTruthy();
        expect(customCalculationOperandNode.nodeTypeValue).toBe('security');
    });

    it('test CreateRequest Params', () => {
        const optionValues: any = {};
        customCalculationOperandNode.addRequestParams(optionValues);
        expect(optionValues.customCalculationNode).not.toBeUndefined();
        expect(optionValues.customCalculationNode).not.toBeNull();
        expect(optionValues.customCalculationNode).toBeTruthy();
        expect(optionValues.customCalculationNode.nodeType).toBe('security');
    });

    it('Serialize/Deserialize test', () => {
        customCalculationOperandNode.nodeTypeValue = 'total';
        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(customCalculationOperandNode.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const deserializedcustomCalculationOperandNode: CustomCalculationMeasureNodeColumnOption = new CustomCalculationMeasureNodeColumnOption(deserializedData);

        expect(deserializedcustomCalculationOperandNode).not.toBeUndefined();
        expect(deserializedcustomCalculationOperandNode).not.toBeNull();
        expect(deserializedcustomCalculationOperandNode.nodeTypeValue).toBeTruthy();
        expect(deserializedcustomCalculationOperandNode.nodeTypeValue).not.toBeNull();
        expect(deserializedcustomCalculationOperandNode.nodeTypeValue).not.toBeUndefined();
        expect(deserializedcustomCalculationOperandNode.nodeTypeValue).toBe('total');
    });

    it('getDisplayName test', () => {
        expect(CustomCalculationMeasureNodeColumnOption.getDisplayNodeName('parent')).toBe('Immediate Parent');
        expect(CustomCalculationMeasureNodeColumnOption.getDisplayNodeName('firstLevel')).toBe('First Level');
        expect(CustomCalculationMeasureNodeColumnOption.getDisplayNodeName(null)).toBe('Security');
    });
});
