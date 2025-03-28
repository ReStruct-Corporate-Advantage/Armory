import {CommitmentRiskGrouping} from './commitment-risk-grouping.model';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

describe('CommitmentRiskGrouping', () => {
    it('should serialize and deserialize correctly', () => {
        const setting = new CommitmentRiskGrouping();
        setting.groupBy = 'GEOGRAPHY_FOCUS';

        const serializedSetting = setting.serialize(SerializeFavoriteType.SERIALIZE_LINKED_FAV);
        const deserializedSetting = new CommitmentRiskGrouping(serializedSetting);
        expect(deserializedSetting.groupBy).toEqual(setting.groupBy);
    });

    it('should add request param if grouping is selected', () => {
        let setting = new CommitmentRiskGrouping();
        setting.groupBy = 'GEOGRAPHY_FOCUS';

        let requestParams = {};
        setting.addRequestParams(requestParams);
        expect(requestParams).toEqual({ 'aggregationLevel': 'GEOGRAPHY_FOCUS'});

        setting = new CommitmentRiskGrouping({});
        requestParams = {};
        setting.addRequestParams(requestParams);
        expect(requestParams).toEqual({});
    });
});
