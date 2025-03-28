import { MultiManagerBreakdownModel } from './multi-manager-breakdown.model';

describe('MultiManagerModel', () => {
    let model: MultiManagerBreakdownModel;

    beforeEach(() => {
        model = new MultiManagerBreakdownModel();
    });

    it('should create an instance with default values', () => {
        expect(model.decompositionMode).toBeUndefined();
        expect(model.decompositionType).toBeUndefined();
        expect(model.breakdownType).toBeUndefined();
    });

    it('should initialize with provided data', () => {
        const data = {
            decompositionMode: 'mode1',
            decompositionType: 'type1',
            breakdownType: 'typeA'
        };
        model = new MultiManagerBreakdownModel(data);
        expect(model.decompositionMode).toBe('mode1');
        expect(model.decompositionType).toBe('type1');
        expect(model.breakdownType).toBe('typeA');
    });

    it('should add request parameters', () => {
        model.decompositionMode = 'mode1';
        model.decompositionType = 'type1';
        model.breakdownType = 'typeA';
        const reqParams: any = {};
        model.addRequestParams(reqParams);
        expect(reqParams.multiManagerData).toEqual({
            decompositionMode: 'mode1',
            decompositionType: 'type1',
            breakdownType: 'typeA'
        });
    });

    it('should deserialize data correctly', () => {
        const data = {
            decompositionMode: 'mode1',
            decompositionType: 'type1',
            breakdownType: 'typeA'
        };
        model.deserialize(data);
        expect(model.decompositionMode).toBe('mode1');
        expect(model.decompositionType).toBe('type1');
        expect(model.breakdownType).toBe('typeA');
    });

    it('should return true for equal models', () => {
        const data = {
            decompositionMode: 'mode1',
            decompositionType: 'type1',
            breakdownType: 'typeA'
        };
        const model1 = new MultiManagerBreakdownModel(data);
        const model2 = new MultiManagerBreakdownModel(data);
        expect(model1.equals(model2)).toBe(true);
    });

    it('should return false for different models', () => {
        const model1 = new MultiManagerBreakdownModel({
            decompositionMode: 'mode1',
            decompositionType: 'type1',
            breakdownType: 'typeA'
        });
        const model2 = new MultiManagerBreakdownModel({
            decompositionMode: 'mode2',
            decompositionType: 'type2',
            breakdownType: 'typeB'
        });
        expect(model1.equals(model2)).toBe(false);
    });

    it('should serialize data correctly', () => {
        model.decompositionMode = 'mode1';
        model.decompositionType = 'type1';
        model.breakdownType = 'typeA';
        const serializedData = model.serialize();
        expect(serializedData).toEqual({
            decompositionMode: 'mode1',
            decompositionType: 'type1',
            breakdownType: 'typeA'
        });
    });
});
