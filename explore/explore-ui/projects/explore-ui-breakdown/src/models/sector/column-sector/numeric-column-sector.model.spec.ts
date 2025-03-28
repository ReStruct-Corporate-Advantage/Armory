import {NumericColumnSector} from './numeric-column-sector.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {SectorConstants} from '../../../constants/sector.constants';
import {BreakdownInitializer} from '../../../breakdown.initializer';
import {QuantileInfo} from './quantile-info.model';

describe('NumericColumnSector', () => {

    beforeAll(() => {
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();
    });

    /**
     * Test calling serialize on the NumericColumnConfig and then using that generated string to deserialize into a new NumericColumnConfig and test it is the same.
     */
    it('Serialize/Deserialize test', () => {
        const sector: NumericColumnSector = new NumericColumnSector();
        sector.columnName = 'Price';
        sector.columnTag = 'price';
        sector.positionColumnType = 'ALL';
        sector.dataType = 'DOUBLE';
        sector.useNoneBuckets = true;
        sector.bucketBreakpoints = [1, 2, 3, 4];
        sector.bucketLabelPrefix = '$';
        sector.decimalDigitsToDisplay = 0;

        // Add a sub sector.
        const child: NumericColumnSector = new NumericColumnSector();
        child.columnName = 'Duration';
        child.columnTag = 'dur';
        child.positionColumnType = 'PORT';
        child.dataType = 'DOUBLE';
        child.useNoneBuckets = false;
        child.bucketIntervals = 0.5;
        child.bucketLabelPrefix = 'dur';
        child.decimalDigitsToDisplay = 1;
        sector.addChild(child);

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(sector.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newSector: NumericColumnSector = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.NUMERIC_COLUMN_SECTOR, true);

        // Validate that the before and after are the same.
        validateSectorEqual(sector, newSector);

        // Validate child sector.
        expect(newSector.children).toBeDefined();
        expect(newSector.children).not.toBeNull();
        expect(newSector.children.length).toBe(1);
        const newChild: NumericColumnSector = newSector.children[0] as NumericColumnSector;
        validateSectorEqual(child, newChild);
    });

    it('Test serialize/deserialize with quantile info', () => {
        const sector: NumericColumnSector = new NumericColumnSector();
        sector.columnName = 'Price';
        sector.columnTag = 'price';
        sector.quantileInfo.numberOfQuantiles = 5;
        sector.quantileInfo.quantileSortOrder = SectorConstants.QUANTILE_SORT.DESCENDING;

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(sector.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newSector: NumericColumnSector = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.NUMERIC_COLUMN_SECTOR, true);
        // Validate that the before and after are the same.
        validateSectorEqual(sector, newSector);
    });

    it('isValid test', () => {
        const numericColumnSector = new NumericColumnSector();
        numericColumnSector.columnTag = 'sec_type';
        // Valid if bucket breakpoints and bucket interval is not defined
        expect(numericColumnSector.isValid()).toBeTruthy();

        // valid if bucket breakpoints array is empty
        numericColumnSector.bucketBreakpoints = [];
        expect(numericColumnSector.isValid()).toBeTruthy();

        // valid if bucket breakpoint has all values as number
        numericColumnSector.bucketBreakpoints = [2, 3, 4];
        expect(numericColumnSector.isValid()).toBeTruthy();

        // Invalid if any bucket breakpoint value is not number
        numericColumnSector.bucketBreakpoints = [2, Number('a'), 3];
        expect(numericColumnSector.isValid()).toBeFalsy();

        // Invalid if bucket interval is not number
        numericColumnSector.bucketBreakpoints = undefined;
        numericColumnSector.bucketIntervals = Number('a');
        expect(numericColumnSector.isValid()).toBeFalsy();
    });

    it('Test isQuantile', () => {
        const numericColumnSector = new NumericColumnSector();
        // Defaults to blank bucketIntervals
        expect(numericColumnSector.isQuantile()).toBeFalsy();

        numericColumnSector.bucketIntervals = 2;
        expect(numericColumnSector.isQuantile()).toBeFalsy();

        numericColumnSector.bucketIntervals = 0;
        numericColumnSector.bucketBreakpoints = [2, 3, 4];
        expect(numericColumnSector.isQuantile()).toBeFalsy();
        numericColumnSector.bucketBreakpoints = [];
        numericColumnSector.quantileInfo = new QuantileInfo();
        numericColumnSector.quantileInfo.numberOfQuantiles = 0;
        numericColumnSector.quantileInfo.percentileBreakpoints = [];
        numericColumnSector.quantileInfo.quantileBasedOn = '';
        expect(numericColumnSector.isQuantile()).toBeFalsy();

        numericColumnSector.quantileInfo.numberOfQuantiles = 2;
        expect(numericColumnSector.isQuantile()).toBeTruthy();
    });

    /**
     * validates that the sector attributes are the same.
     */
    function validateSectorEqual(origSector: NumericColumnSector, newSector: NumericColumnSector): void {
        expect(newSector.columnName).toBe(origSector.columnName);
        expect(newSector.columnTag).toBe(origSector.columnTag);
        expect(newSector.positionColumnType).toBe(origSector.positionColumnType);
        expect(newSector.dataType).toBe(origSector.dataType);
        expect(newSector.useNoneBuckets).toBe(origSector.useNoneBuckets);

        expect(newSector.bucketLabelPrefix).toBe(origSector.bucketLabelPrefix);
        expect(newSector.decimalDigitsToDisplay).toBe(origSector.decimalDigitsToDisplay);
        expect(newSector.bucketIntervals).toBe(origSector.bucketIntervals);

        if (origSector.bucketBreakpoints && origSector.bucketBreakpoints.length > 0) {
            expect(newSector.bucketBreakpoints).toBeDefined();
            expect(newSector.bucketBreakpoints).not.toBeNull();
            expect(newSector.bucketBreakpoints.length).toBe(origSector.bucketBreakpoints.length);
            const count: number = newSector.bucketBreakpoints.length;
            for (let i = 0; i < count; i++) {
                expect(newSector.bucketBreakpoints[i]).toBe(origSector.bucketBreakpoints[i]);
            }
        }

        if (origSector.quantileInfo) {
            expect(origSector.quantileInfo.numberOfQuantiles).toEqual(newSector.quantileInfo.numberOfQuantiles);
            expect(origSector.quantileInfo.percentileBreakpoints).toEqual(newSector.quantileInfo.percentileBreakpoints);
            expect(origSector.quantileInfo.quantileSortOrder).toEqual(newSector.quantileInfo.quantileSortOrder);
        }
    }
});
