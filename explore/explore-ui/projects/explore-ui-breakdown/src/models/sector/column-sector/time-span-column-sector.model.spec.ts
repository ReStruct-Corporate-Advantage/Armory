import {TimeSpanColumnSector} from './time-span-column-sector.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {BreakdownInitializer} from '../../../breakdown.initializer';
import {SectorConstants} from '../../../constants/sector.constants';

describe('TimeSpanColumnSector', () => {

    beforeAll(() => {
        BreakdownInitializer.registerSectorConfigTypes();
    });

    /**
     * Test calling serialize on the NumericColumnConfig and then using that generated string to deserialize into a new NumericColumnConfig and test it is the same.
     */
    it('Serialize/Deserialize test', () => {
        const sector: TimeSpanColumnSector = new TimeSpanColumnSector();
        sector.columnName = 'Price';
        sector.columnTag = 'price';
        sector.positionColumnType = 'ALL';
        sector.dataType = 'DOUBLE';
        sector.useNoneBuckets = true;
        sector.bucketBreakpoints = ['1y', '2y', '3y', '4y'];

        // Add a sub sector.
        const child: TimeSpanColumnSector = new TimeSpanColumnSector();
        child.columnName = 'Duration';
        child.columnTag = 'dur';
        child.positionColumnType = 'PORT';
        child.dataType = 'DOUBLE';
        child.useNoneBuckets = false;
        child.bucketBreakpoints = ['5y', '6y', '7y', '8y', '9y'];
        sector.addChild(child);

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(sector.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newSector: TimeSpanColumnSector = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.TIME_SPAN_COLUMN_SECTOR, true);

        // Validate that the before and after are the same.
        validateSectorEqual(sector, newSector);

        // Validate child sector.
        expect(newSector.children).toBeDefined();
        expect(newSector.children).not.toBeNull();
        expect(newSector.children.length).toBe(1);
        const newChild: TimeSpanColumnSector = newSector.children[0] as TimeSpanColumnSector;
        validateSectorEqual(child, newChild);
    });

    /**
     * validates that the sector attributes are the same.
     */
    function validateSectorEqual(origSector: TimeSpanColumnSector, newSector: TimeSpanColumnSector): void {
        expect(newSector.columnName).toBe(origSector.columnName);
        expect(newSector.columnTag).toBe(origSector.columnTag);
        expect(newSector.positionColumnType).toBe(origSector.positionColumnType);
        expect(newSector.dataType).toBe(origSector.dataType);
        expect(newSector.useNoneBuckets).toBe(origSector.useNoneBuckets);

        if (origSector.bucketBreakpoints && origSector.bucketBreakpoints.length > 0) {
            expect(newSector.bucketBreakpoints).toBeDefined();
            expect(newSector.bucketBreakpoints).not.toBeNull();
            expect(newSector.bucketBreakpoints.length).toBe(origSector.bucketBreakpoints.length);
            const count: number = newSector.bucketBreakpoints.length;
            for (let i = 0; i < count; i++) {
                expect(newSector.bucketBreakpoints[i]).toBe(origSector.bucketBreakpoints[i]);
            }
        }
    }

    /**
     * Test the different scenarios of the is valid.
     */
    it('test isValid', () => {
        const sector: TimeSpanColumnSector = new TimeSpanColumnSector();

        // Initially this should not be valid.
        expect(sector.isValid()).toBeFalsy();

        // Add the column name and it should still not be valid.
        sector.columnTag = 'sec_group';
        expect(sector.isValid()).toBeFalsy();

        // Now set the breakpoint intervals to an empty array and should still be invalid.
        sector.bucketBreakpoints = [];
        expect(sector.isValid()).toBeFalsy();

        // Add an item and it should now be valid.
        sector.bucketBreakpoints.push('1y');
        expect(sector.isValid()).toBeTruthy();

        sector.bucketBreakpoints = ['1y', '2D', '2.44Y', '.2W', '2', '2.2'];
        expect(sector.isValid()).toBeTruthy();
        sector.bucketBreakpoints.push('1s');
        expect(sector.isValid()).toBeFalsy();
    });
});
