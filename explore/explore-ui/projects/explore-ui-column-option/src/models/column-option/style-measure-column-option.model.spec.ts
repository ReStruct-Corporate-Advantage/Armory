import {StyleMeasureColumnOptionModel} from './style-measure-column-option.model';

describe('Style measure column options model test', () => {
    let styleMeasureColumnOptionModel: StyleMeasureColumnOptionModel;

    beforeEach(() => {
        styleMeasureColumnOptionModel = new StyleMeasureColumnOptionModel({
            min: 0,
            max: 10,
            weight: 25,
            isNormal: true
        });
    });

    it('Test model initialization', () => {
        expect(styleMeasureColumnOptionModel).not.toBeUndefined();
        expect(styleMeasureColumnOptionModel).not.toBeNull();
        expect(styleMeasureColumnOptionModel.isValid()).toBeTruthy();
        expect(styleMeasureColumnOptionModel.isNormal).toBeTruthy();
        expect(styleMeasureColumnOptionModel.min).toBe(0);
        expect(styleMeasureColumnOptionModel.max).toBe(10);
        expect(styleMeasureColumnOptionModel.weight).toBe(25);
        expect(styleMeasureColumnOptionModel.configType).toBe(StyleMeasureColumnOptionModel.CONFIG_TYPE);
    });

    it('Serialize/Deserialize test', () => {
        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(styleMeasureColumnOptionModel.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const decodedStyleMeasureColumnOptionModel: StyleMeasureColumnOptionModel = new StyleMeasureColumnOptionModel(deserializedData);

        expect(decodedStyleMeasureColumnOptionModel).not.toBeUndefined();
        expect(decodedStyleMeasureColumnOptionModel).not.toBeNull();
        expect(decodedStyleMeasureColumnOptionModel.isNormal).toBeTruthy();
        expect(decodedStyleMeasureColumnOptionModel.min).toBe(0);
        expect(decodedStyleMeasureColumnOptionModel.max).toBe(10);
        expect(decodedStyleMeasureColumnOptionModel.weight).toBe(25);
    });

    it('Equal test', () => {
        const styleMeasureColumnOptionModelCopy: StyleMeasureColumnOptionModel = new StyleMeasureColumnOptionModel();
        expect(styleMeasureColumnOptionModel.equals(styleMeasureColumnOptionModelCopy));

        styleMeasureColumnOptionModelCopy.min = 10;
        styleMeasureColumnOptionModelCopy.max = 20;
        styleMeasureColumnOptionModelCopy.weight = 26;
        styleMeasureColumnOptionModelCopy.isNormal = false;
        expect(styleMeasureColumnOptionModel.equals(styleMeasureColumnOptionModelCopy));

        styleMeasureColumnOptionModelCopy.min = 0;
        styleMeasureColumnOptionModelCopy.max = 10;
        styleMeasureColumnOptionModelCopy.weight = 25;
        styleMeasureColumnOptionModelCopy.isNormal = true;
        expect(styleMeasureColumnOptionModel.equals(styleMeasureColumnOptionModelCopy));
    });
});
