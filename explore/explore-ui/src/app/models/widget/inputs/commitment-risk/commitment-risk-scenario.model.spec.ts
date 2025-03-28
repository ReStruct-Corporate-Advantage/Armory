import {CommitmentRiskScenario} from './commitment-risk-scenario.model';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

describe('CommitmentRiskScenario', () => {
    it('should serialize and deserialize correctly', () => {
        const setting = new CommitmentRiskScenario();
        setting.scenario = 'fed_baseline';

        const serializedSetting = setting.serialize(SerializeFavoriteType.SERIALIZE_LINKED_FAV);
        const deserializedSetting = new CommitmentRiskScenario(serializedSetting);
        expect(deserializedSetting.scenario).toEqual(setting.scenario);
    });

    it('should add request param if grouping is selected', () => {
        let setting = new CommitmentRiskScenario();
        setting.scenario = 'fed_baseline';

        let requestParams = {};
        setting.addRequestParams(requestParams);
        expect(requestParams).toEqual({'scenario': 'fed_baseline'});

        setting = new CommitmentRiskScenario({});
        requestParams = {};
        setting.addRequestParams(requestParams);
        expect(requestParams).toEqual({});
    });
});
