import {LookthroughHolding} from './lookthrough-holding.model';
import * as lookthroughHoldingJSON from '../../../../mocks/lookthroughHoldingsMock.json';
import {isEmpty} from 'lodash';


describe('LookthroughHoldingsModel', () => {
    it('tests deserialize', () => {
        const lookthroughHolding: LookthroughHolding = new LookthroughHolding(lookthroughHoldingJSON);
        expect(lookthroughHolding).toBeDefined();
        verifylookthroughHolding(lookthroughHolding, lookthroughHoldingJSON);
    });

    it('tests deserialize with ignoreLookthroughHoldings', () => {
        const lookthroughHolding: LookthroughHolding = new LookthroughHolding(lookthroughHoldingJSON, true);
        expect(lookthroughHolding).toBeDefined();
        verifylookthroughHolding(lookthroughHolding, lookthroughHoldingJSON);
    });

    it('tests transformDisplayName', () => {
        const lookthroughHolding: LookthroughHolding = new LookthroughHolding(lookthroughHoldingJSON);
        lookthroughHolding.transformDisplayName(null, 'Portfolio Securities');
        expect(lookthroughHolding.displayName.length === 2
            && lookthroughHolding.displayName.indexOf('Portfolio Securities') !== -1
            && lookthroughHolding.displayName.indexOf('MSRAG2AV1A') !== -1).toBeTruthy();

        expect(lookthroughHolding.lookthroughHoldings[0].displayName.length === 3
            && lookthroughHolding.lookthroughHoldings[0].displayName.indexOf('Portfolio Securities') !== -1
            && lookthroughHolding.lookthroughHoldings[0].displayName.indexOf('MSRAG2AV1A') !== -1
            && lookthroughHolding.lookthroughHoldings[0].displayName.indexOf('MSRAG2AV1B') !== -1).toBeTruthy();

        expect(lookthroughHolding.lookthroughHoldings[0].lookthroughHoldings[0].displayName.length === 4
            && lookthroughHolding.lookthroughHoldings[0].lookthroughHoldings[0].displayName.indexOf('Portfolio Securities') !== -1
            && lookthroughHolding.lookthroughHoldings[0].lookthroughHoldings[0].displayName.indexOf('MSRAG2AV1A') !== -1
            && lookthroughHolding.lookthroughHoldings[0].lookthroughHoldings[0].displayName.indexOf('MSRAG2AV1B') !== -1
            && lookthroughHolding.lookthroughHoldings[0].lookthroughHoldings[0].displayName.indexOf('MSR-JUNE-A-*-*-*BRSU8L3A4') !== -1).toBeTruthy();
    });

    const verifylookthroughHolding = (ltHolding: LookthroughHolding, ltHoldingJSON: any) => {
        expect(ltHolding.cusip === ltHoldingJSON.cusip).toBeTruthy();
        expect(ltHolding.secType === ltHoldingJSON.secType).toBeTruthy();
        expect(ltHolding.secDesc === ltHoldingJSON.secDesc).toBeTruthy();
        expect(ltHolding.lookthroughType === ltHoldingJSON.lookthroughType).toBeTruthy();
        expect(ltHolding.secGroup === ltHoldingJSON.secGroup).toBeTruthy();
        expect(ltHolding.fullName === ltHoldingJSON.fullName).toBeTruthy();
        ltHolding.displayName.forEach((displayName, index) => expect(displayName === ltHoldingJSON.displayName[index]).toBeTruthy());
        if (!isEmpty(ltHolding.lookthroughHoldings)) {
            ltHolding.lookthroughHoldings.forEach((holding, index) => verifylookthroughHolding(holding, ltHoldingJSON.lookthroughHoldings[index]));
        } else {
            expect(ltHolding.lookthroughHoldings).toBeUndefined();
        }
    };
});
