import {ConfigInitializer} from '../../../initializers/config.initializer';
import {ReturnSpriteletInput} from '@models/widget/inputs/return-spritelet-input.model';
import {SectorRule} from '@models/portfolio/tradeRules/sector-rule.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';

/**
 * ReturnSpriteletInput tests
 */
describe('ReturnSpriteletInput test', function () {

    beforeAll((function () {
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function() {
        const returnSpriteletInput: ReturnSpriteletInput = new ReturnSpriteletInput();
        returnSpriteletInput.pnlID = '1';
        returnSpriteletInput.nodeDesc = 'Total';
        returnSpriteletInput.sectorPathRules.push(new SectorRule('ABS', 10.0, []));

        // Convert the object to string and then back to json again.
        const serializedData: any = returnSpriteletInput.serialize();

        const newReturnSpriteletInput: ReturnSpriteletInput = ConfigTypeFactory.createConfig(serializedData, ReturnSpriteletInput.configType, false);
        // Validate that the before and after are the same.
        expect(newReturnSpriteletInput.pnlID).toBe(returnSpriteletInput.pnlID);
        expect(newReturnSpriteletInput.nodeDesc).toBe(returnSpriteletInput.nodeDesc);
        expect(newReturnSpriteletInput.sectorPathRules.length).toBe(returnSpriteletInput.sectorPathRules.length);
        expect(newReturnSpriteletInput.sectorPathRules[0].lineItem).toBe('ABS');
        expect(newReturnSpriteletInput.sectorPathRules[0].newWeight).toBe(10.0);
    });

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize without sector Path rules', function() {
        const returnSpriteletInput: ReturnSpriteletInput = new ReturnSpriteletInput();
        returnSpriteletInput.pnlID = '1';
        returnSpriteletInput.nodeDesc = 'Total';

        // Convert the object to string and then back to json again.
        const serializedData: any = returnSpriteletInput.serialize();
        delete serializedData.sectorPathRules;

        const newReturnSpriteletInput: ReturnSpriteletInput = ConfigTypeFactory.createConfig(serializedData, ReturnSpriteletInput.configType, false);
        // Validate that the before and after are the same.
        expect(newReturnSpriteletInput.pnlID).toBe(returnSpriteletInput.pnlID);
        expect(newReturnSpriteletInput.nodeDesc).toBe(returnSpriteletInput.nodeDesc);
        expect(newReturnSpriteletInput.sectorPathRules.length).toBe(returnSpriteletInput.sectorPathRules.length);
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const model1: ReturnSpriteletInput = new ReturnSpriteletInput();
        const model2: ReturnSpriteletInput = new ReturnSpriteletInput();
        expect(model1.equals(model2)).toBeTruthy();

        // Different pnlID
        model1.pnlID = '1';
        model1.nodeDesc = 'Total';
        model1.sectorPathRules.push(new SectorRule('ABS', 10.0, []));
        model2.pnlID = '2';
        model2.nodeDesc = 'Total';
        model2.sectorPathRules.push(new SectorRule('ABS', 10.0, []));
        expect(model1.equals(model2)).toBeFalsy();

        // Different nodeDesc
        model2.pnlID = model1.pnlID;
        model2.nodeDesc  = 'CASH';
        expect(model1.equals(model2)).toBeFalsy();

        // Different sectorPathRules length
        model2.nodeDesc = model1.nodeDesc;
        model2.sectorPathRules  = [];
        expect(model1.equals(model2)).toBeFalsy();

        // Different sectorPathRules
        model2.sectorPathRules.push(new SectorRule('BND', 10.0, []));
        expect(model1.equals(model2)).toBeFalsy();


        // Everything same now
        model2.sectorPathRules  = [];
        model2.sectorPathRules.push(new SectorRule('ABS', 10.0, []));
        expect(model1.equals(model2)).toBeTruthy();
    });

    /**
     * Test case for addRequestParams
     */
    it('Test addRequestParams', function() {
        const returnSpriteletInput: ReturnSpriteletInput = new ReturnSpriteletInput();
        returnSpriteletInput.pnlID = '1';
        returnSpriteletInput.nodeDesc = 'Total';

        let requestParams: any = {};
        returnSpriteletInput.addRequestParams(requestParams);
        expect(requestParams.ledgerId).toBe(returnSpriteletInput.pnlID);
        expect(requestParams.nodeDescription).toBe(returnSpriteletInput.nodeDesc);
        expect(requestParams.sectorPathRules).not.toBeDefined();

        requestParams = {};
        returnSpriteletInput.sectorPathRules.push(new SectorRule('ABS', 10.0, []));
        returnSpriteletInput.addRequestParams(requestParams);
        expect(requestParams.ledgerId).toBe(returnSpriteletInput.pnlID);
        expect(requestParams.nodeDescription).toBe(returnSpriteletInput.nodeDesc);
        expect(requestParams.sectorPathRules).toBeDefined();
        expect(requestParams.sectorPathRules).toEqual('[{"lineItem":"ABS","newWeight":10,"ruleType":"Sector","sectorRulesInfo":[]}]');
    });

    it('Test shouldSkipSerialize', () => {
        const model = new ReturnSpriteletInput();
        expect(model.shouldSkipSerialize()).toBeFalsy();
    });
});

