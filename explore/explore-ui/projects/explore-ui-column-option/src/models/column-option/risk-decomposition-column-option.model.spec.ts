import {NumericColumnFormatColumnOption} from '../column-option/numeric-column-format-column-option.model';
import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {RiskDecompositionType} from '../../enums/risk-decomposition-type.enum';
import {RiskDecompositionColumnOption} from './risk-decomposition-column-option.model';

describe('Risk decomposition column option model test', () => {
    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(RiskDecompositionColumnOption.CONFIG_TYPE, RiskDecompositionColumnOption);
    });

    let riskDecompositionColumnOption: RiskDecompositionColumnOption;

    beforeEach(() => {
        riskDecompositionColumnOption = new RiskDecompositionColumnOption();
    });

    it('should create model from factory', () => {
        const defaultSettings: any = {
            columnOptionAttributes: [{
                title: 'Risk decomposition',
                key: 'riskDecomposition',
                dataType: 'S',
                values: [
                    {label: 'XSR', value: true},
                    {label: 'XSR_SYS_RESID', value: false}
                ]
            }]
        };

        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(RiskDecompositionColumnOption.CONFIG_TYPE, defaultSettings);
        expect(model).toBeDefined();
        expect(model instanceof RiskDecompositionColumnOption).toBeTruthy();
    });

    it('should check equals', () => {
        const model1: RiskDecompositionColumnOption = new RiskDecompositionColumnOption();
        const model2: RiskDecompositionColumnOption = new RiskDecompositionColumnOption();
        expect(model1.equals(model2)).toBeTruthy();

        const model3: NumericColumnFormatColumnOption = new NumericColumnFormatColumnOption();
        expect(model1.equals(model3)).toBeFalsy();

        model1.decompositionType = RiskDecompositionType.XSR;
        model2.decompositionType = RiskDecompositionType.XSR_SYS_RESID;
        expect(model1.equals(model2)).toBeFalsy();
    });

    it('should initialize model', () => {
        riskDecompositionColumnOption.initialize(null);
        expect(riskDecompositionColumnOption.decompositionType).toBeNull();

        const defaultSettings: any = {};
        riskDecompositionColumnOption.initialize(defaultSettings);
        expect(riskDecompositionColumnOption.decompositionType).toBeNull();

        defaultSettings.columnOptionAttributes = [{
            title: 'Risk decomposition',
            key: 'riskDecomposition',
            dataType: 'S',
            values: [
                {label: 'XSR', value: true},
                {label: 'XSR_SYS_RESID', value: false}
            ]
        }];
        riskDecompositionColumnOption.initialize(defaultSettings);
        expect(riskDecompositionColumnOption.decompositionType).toBeDefined();
    });

    it('should add request params', () => {
        let requestParams: any = {};
        riskDecompositionColumnOption.addRequestParams(requestParams);
        expect(requestParams.riskDecomposition).toBeUndefined();

        requestParams = {};
        riskDecompositionColumnOption.decompositionType = RiskDecompositionType.XSR;
        riskDecompositionColumnOption.addRequestParams(requestParams);
        expect(requestParams.riskDecomposition).toBeDefined();
        expect(requestParams.riskDecomposition.decompositionType).toBe('XSR');
    });

    it('should serialize', () => {
        let data: any = riskDecompositionColumnOption.serialize(false);
        expect(data).toBeNull();

        riskDecompositionColumnOption.decompositionType = RiskDecompositionType.XSR;
        data = riskDecompositionColumnOption.serialize(false);
        expect(data.riskDecomposition).toBeDefined();
        expect(data.riskDecomposition.decompositionType).toBe('XSR');
    });

    it('should deserialize', () => {
        let data: any;
        riskDecompositionColumnOption.deserialize(data);
        expect(riskDecompositionColumnOption.decompositionType).toBeUndefined();

        data = {};
        riskDecompositionColumnOption.deserialize(data);
        expect(riskDecompositionColumnOption.decompositionType).toBeUndefined();

        data.riskDecomposition = {
            decompositionType: 'XSR'
        };
        riskDecompositionColumnOption.deserialize(data);
        expect(riskDecompositionColumnOption.decompositionType).toBe(RiskDecompositionType.XSR);
    });
});
