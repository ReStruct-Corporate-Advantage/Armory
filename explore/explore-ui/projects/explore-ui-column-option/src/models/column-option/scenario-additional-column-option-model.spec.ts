import { ScenarioAdditionalColumnOptionModel } from './scenario-additional-column-option.model';

describe('ScenarioAdditionalColumnOptionModel', () => {
    let model: ScenarioAdditionalColumnOptionModel;

    beforeEach(() => {
        model = new ScenarioAdditionalColumnOptionModel();
    });

    it('should initialize correctly', () => {
        expect(model).toBeTruthy();
        expect(model.floorPnL).toBeUndefined();
        expect(model.fullReval).toBeUndefined();
    });

    it('should serialize data correctly', () => {
        model.floorPnL = true;
        model.fullReval = false;
        const serializedData = model.doSerialize();
        expect(serializedData).toEqual({ floorPnL: true, fullReval: false });

    });

    it('should deserialize data correctly', () => {
        const data = { floorPnL: true, fullReval: true };
        model.deserialize(data);
        expect(model.floorPnL).toBe(true);
        expect(model.fullReval).toBe(true);
    });

    it('should add request params correctly', () => {
        model.floorPnL = true;
        model.fullReval = false;
        const optionValues: any = {};
        model.addRequestParams(optionValues);
        expect(optionValues.scenarioAdditionalSettings).toEqual({ floorPnL: true, fullReval: false });
    });

    it('should return the correct config type', () => {
        expect(model.configType).toBe(ScenarioAdditionalColumnOptionModel.CONFIG_TYPE);
    });

    it('should correctly compare two instances', () => {
        const otherModel = new ScenarioAdditionalColumnOptionModel();
        otherModel.floorPnL = true;
        otherModel.fullReval = false;
        model.floorPnL = true;
        model.fullReval = false;
        expect(model.equals(otherModel)).toBe(true);

        otherModel.floorPnL = false;
        expect(model.equals(otherModel)).toBe(false);

        otherModel.floorPnL = true;
        otherModel.fullReval = true;
        expect(model.equals(otherModel)).toBe(false);
    });

    it('should validate the instance correctly', () => {
        expect(model.isValid()).toBe(false);
        model.floorPnL = true;
        expect(model.isValid()).toBe(true);
    });
});
