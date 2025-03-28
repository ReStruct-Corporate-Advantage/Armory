import {DateColumnSector} from './date-column-sector.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {BreakdownInitializer} from '../../../breakdown.initializer';
import {SectorConstants} from '../../../constants/sector.constants';

describe('DateColumnSector', () => {

    beforeAll(() => {
        BreakdownInitializer.registerSectorConfigTypes();
    });

    /**
     * Test calling serialize on the DateColumnSector and then using that generated string to deserialize into a new DateColumnSector and test it is the same.
     */
    it('Serialize/Deserialize test', () => {
        const sector: DateColumnSector = new DateColumnSector();
        sector.columnName = 'Price';
        sector.columnTag = 'price';
        sector.positionColumnType = 'ALL';
        sector.dataType = 'DOUBLE';
        sector.useNoneBuckets = true;
        sector.groupByYear = true;

        // Add a sub sector.
        const child: DateColumnSector = new DateColumnSector();
        child.columnName = 'Duration';
        child.columnTag = 'dur';
        child.positionColumnType = 'PORT';
        child.dataType = 'DOUBLE';
        child.useNoneBuckets = false;
        child.groupByYear = false;
        sector.addChild(child);

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(sector.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newSector: DateColumnSector = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.DATE_COLUMN_SECTOR, true);

        // Validate that the before and after are the same.
        validateSectorEqual(sector, newSector);

        // Validate child sector.
        expect(newSector.children).toBeDefined();
        expect(newSector.children).not.toBeNull();
        expect(newSector.children.length).toBe(1);
        const newChild: DateColumnSector = newSector.children[0] as DateColumnSector;
        validateSectorEqual(child, newChild);
    });

    /**
     * validates that the sector attributes are the same.
     */
    function validateSectorEqual(origSector: DateColumnSector, newSector: DateColumnSector): void {
        expect(newSector.columnName).toBe(origSector.columnName);
        expect(newSector.columnTag).toBe(origSector.columnTag);
        expect(newSector.positionColumnType).toBe(origSector.positionColumnType);
        expect(newSector.dataType).toBe(origSector.dataType);
        expect(newSector.useNoneBuckets).toBe(origSector.useNoneBuckets);
        expect(newSector.groupByYear).toBe(origSector.groupByYear);
    }

    /**
     * Test the different scenarios of the is valid.
     */
    it('test isValid', () => {
        const sector: DateColumnSector = new DateColumnSector();

        // Initially this should not be valid.
        expect(sector.isValid()).toBeFalsy();

        // Add the column name and it should still not be valid.
        sector.columnTag = 'sec_group';
        expect(sector.isValid()).toBeFalsy();

        // Now set the value to true and it should be valid.
        sector.groupByYear = true;
        expect(sector.isValid()).toBeTruthy();

        // Now set the value to false and it should be valid.
        sector.groupByYear = false;
        expect(sector.isValid()).toBeTruthy();
    });
});
