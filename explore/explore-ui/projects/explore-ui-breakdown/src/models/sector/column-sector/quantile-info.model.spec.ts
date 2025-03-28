import {QuantileInfo} from './quantile-info.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {SectorConstants} from '../../../constants/sector.constants';
import {BreakdownInitializer} from '../../../breakdown.initializer';

function serializeAndDeserializeData(quantileInfo: QuantileInfo) {
    const serializedData: string = JSON.stringify(quantileInfo.serialize());
    const deserializedData: any = JSON.parse(serializedData);
    const newQuantileInfo: QuantileInfo = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.QUANTILE_INFO, true);
    return newQuantileInfo;
}

describe('QuantileInfo tests', () => {
    let quantileInfo: QuantileInfo;
    beforeAll(() => {
        BreakdownInitializer.registerSectorConfigTypes();
    });

    beforeEach(() => {
        quantileInfo = new QuantileInfo();
    });

    describe('Test serialize/deserialize', () => {
        it('Test serialize with percentile breakpoints', () => {
            quantileInfo.percentileBreakpoints = [1, 2, 3];

            // Convert the object to string and then back to json again.
            const newQuantileInfo = serializeAndDeserializeData(quantileInfo);

            expect(quantileInfo.percentileBreakpoints).toEqual(newQuantileInfo.percentileBreakpoints);
        });

        it('Test serialize with number of quantiles', () => {
            quantileInfo.numberOfQuantiles = 5;

            // Convert the object to string and then back to json again.
            const newQuantileInfo = serializeAndDeserializeData(quantileInfo);

            expect(quantileInfo.numberOfQuantiles).toEqual(newQuantileInfo.numberOfQuantiles);
        });

        it('should serialize and deserialize quantileBasedOn', () => {
            quantileInfo.quantileBasedOn = SectorConstants.QUANTILE_BASED_ON.PORTFOLIO;
            const newQuantileInfo = serializeAndDeserializeData(quantileInfo);
            expect(quantileInfo.quantileBasedOn).toEqual(newQuantileInfo.quantileBasedOn);
        });

        it('should serialize and deserialize createQuantileFrom', () => {
            quantileInfo.periodType = SectorConstants.PERIOD_TYPE.START;
            const newQuantileInfo = serializeAndDeserializeData(quantileInfo);
            expect(quantileInfo.periodType).toEqual(newQuantileInfo.periodType);
        });
    });

    it('Test isValid', () => {
        // Should be false by default
        expect(quantileInfo.isValid()).toBeFalsy();

        quantileInfo.numberOfQuantiles = undefined;
        quantileInfo.percentileBreakpoints = [1, 2, 3];
        expect(quantileInfo.isValid()).toBeTruthy();

        quantileInfo.numberOfQuantiles = 5;
        expect(quantileInfo.isValid()).toBeTruthy();
    });

    it('Test reset', () => {
        quantileInfo.quantileSortOrder = SectorConstants.QUANTILE_SORT.DESCENDING;
        quantileInfo.numberOfQuantiles = 5;
        quantileInfo.percentileBreakpoints = [1, 2, 3];
        quantileInfo.quantileBasedOn = SectorConstants.QUANTILE_BASED_ON.PORTFOLIO;
        quantileInfo.periodType = SectorConstants.PERIOD_TYPE.END;

        quantileInfo.reset();

        expect(quantileInfo.numberOfQuantiles).toBeUndefined();
        expect(quantileInfo.percentileBreakpoints).toEqual([]);
        expect(quantileInfo.quantileSortOrder).toEqual(SectorConstants.QUANTILE_SORT.ASCENDING);
        expect(quantileInfo.quantileBasedOn).toEqual(SectorConstants.QUANTILE_BASED_ON.PORTFOLIO);
        expect(quantileInfo.periodType).toEqual(SectorConstants.PERIOD_TYPE.START);
    });
});
