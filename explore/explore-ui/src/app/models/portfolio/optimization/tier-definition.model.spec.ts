import {TierDefinition} from '@models/portfolio/optimization/tier-definition.model';
import {TierDefinitionType} from '@enums/tier-definition-type.enum';

describe('Tier Definition tests', () => {
    it('Test save', () => {
        const tierDef = new TierDefinition();
        tierDef.tierType = TierDefinitionType.PERCENTILE;
        tierDef.tierOne = 5;
        tierDef.tierTwo = 10;

        expect(tierDef.serialize()).toEqual({
            tierType: 1,
            tierOne: 5,
            tierTwo: 10
        });

        tierDef.riskBudgetTierRatio = '0.5';
        tierDef.riskBudgetFixedAssetRatio = '0.1';

        expect(tierDef.serialize()).toEqual({
            tierType: 1,
            tierOne: 5,
            tierTwo: 10,
            riskBudgetTierRatio: 0.5,
            riskBudgetFixedAssetRatio: 0.1
        });
    });

    it('should test deserialize', function () {
        const tierDef = new TierDefinition();
        tierDef.deserialize({
            tierType: 1,
            tierOne: 5,
            tierTwo: 10
        });

        expect(tierDef.tierType).toEqual(1);
        expect(tierDef.tierOne).toEqual(5);
        expect(tierDef.tierTwo).toEqual(10);

        tierDef.deserialize({
            tierType: 1,
            tierOne: 5,
            tierTwo: 10,
            riskBudgetTierRatio: 0.5,
            riskBudgetFixedAssetRatio: 0.1
        });

        expect(tierDef.riskBudgetTierRatio).toEqual(0.5);
        expect(tierDef.riskBudgetFixedAssetRatio).toEqual(0.1);
    });

    it('should test equals', function () {
        const data: any = {
            tierType: 1,
            tierOne: 5,
            tierTwo: 10
        };
        const tierDef1 = new TierDefinition();
        tierDef1.deserialize(data);
        const tierDef2 = new TierDefinition();
        tierDef2.deserialize(data);

        expect(tierDef1.equals(tierDef2)).toBeTruthy();
        tierDef2.tierType = 0;
        expect(tierDef1.equals(tierDef2)).toBeFalsy();
        tierDef2.tierType = 1;
        tierDef2.tierOne = 2;
        expect(tierDef1.equals(tierDef2)).toBeFalsy();
        tierDef2.tierType = 1;
        tierDef2.tierOne = 5;
        tierDef2.tierTwo = 8;
        expect(tierDef1.equals(tierDef2)).toBeFalsy();
    });
});

