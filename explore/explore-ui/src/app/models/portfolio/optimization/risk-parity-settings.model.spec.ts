import {RiskParitySettings} from '@models/portfolio/optimization/risk-parity-settings.model';
import {RiskParityCase} from '@enums/risk-parity-case.enum';
import {CustomFilter} from '@blk/explore-ui-breakdown';
import {ObjectiveSettings} from '@models/portfolio/objectives/objective.settings.model';
import {InvestmentUniverseSettings} from '@models/portfolio/investmentUniverse/investment-universe-settings.model';
import {TierDefinition} from '@models/portfolio/optimization/tier-definition.model';
import {Security} from '@interfaces/security.interface';
import {CoreUserMetaDataStore,UserMetaData} from '@blk/explore-ui-core';

/**
 * Test cases for RiskParitySettings.ts
 */
describe('Risk Parity Settings tests', () => {
    const riskParitySettings = {
        'riskParityCase': RiskParityCase.ACTIVE,
        'filter': new CustomFilter({'title': 'abc'}),
        'objectiveSettings': new ObjectiveSettings(),
        'investmentUniverseSettings': new InvestmentUniverseSettings(),
        'tierDefinitions': new TierDefinition({'tierOne': 1}),
        'securityConstraints': new Map<string, Security>().set('abc', {newValue: 56})
    };

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });

    it('tests Serialize/Deserialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const settings = new RiskParitySettings(riskParitySettings);
        const serialize = settings.serialize();
        expect(settings.tierDefinitions.tierOne).toEqual(serialize.tierDefinitions.tierOne);
        expect(settings.riskParityCase).toEqual(serialize.riskParityCase);
    });

    it('tests Default Objective', () => {
        const settings = new RiskParitySettings(riskParitySettings);
        settings.setDefaultObjective();
        expect(settings.objectiveSettings.portfolioObjectives.length).toEqual(2);
    });

    it('tests Do copy from', () => {
        const settings1 = new RiskParitySettings(riskParitySettings);
        settings1.setDefaultObjective();
        const settings2 = new RiskParitySettings();
        settings2.copyFrom(settings1);
        expect(settings2.objectiveSettings).toEqual(settings1.objectiveSettings);
    });

    it('tests equals', () => {
        const settings1 = new RiskParitySettings(riskParitySettings);
        let settings2 = new RiskParitySettings(riskParitySettings);
        expect(settings2.equals(settings1)).toBeTruthy();
        settings2.tierDefinitions.tierOne = 5;
        expect(settings2.equals(settings1)).toBeFalsy();
        settings2 = new RiskParitySettings(riskParitySettings);
        settings2.securityConstraints = new Map<string, Security>().set('def', {});
        expect(settings2.equals(settings1)).toBeFalsy();
    });

});
