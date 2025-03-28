import {ColumnSector} from './column-sector.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {BreakdownInitializer} from '../../../breakdown.initializer';
import {SectorConstants} from '../../../constants/sector.constants';

describe('ColumnSector', () => {

    beforeAll(() => {
        BreakdownInitializer.registerSectorConfigTypes();
    });

    /**
     * Test calling serialize on the ColumnSector and then using that generated string to deserialize into a new ColumnSector and test it is the same.
     */
    it('Serialize/Deserialize test', () => {
        const sector: ColumnSector = new ColumnSector();
        sector.columnName = 'Security Group';
        sector.columnTag = 'sec_group';
        sector.positionColumnType = 'ALL';
        sector.dataType = 'String';
        sector.useNoneBuckets = true;

        // Add a sub sector.
        const child: ColumnSector = new ColumnSector();
        child.columnName = 'Security Type';
        child.columnTag = 'sec_type';
        child.positionColumnType = 'ALL';
        child.dataType = 'String';
        child.useNoneBuckets = false;
        sector.addChild(child);

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(sector.serialize(true));
        const deserializedData = JSON.parse(serializedData);
        const newSector: ColumnSector = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.COLUMN_SECTOR, true);

        // Validate that the before and after are the same.
        validateSectorEqual(sector, newSector);

        // Validate child sector.
        expect(newSector.children).toBeDefined();
        expect(newSector.children).not.toBeNull();
        expect(newSector.children.length).toBe(1);
        const newChild: ColumnSector = newSector.children[0] as ColumnSector;
        validateSectorEqual(child, newChild);
    });

    /**
     * Test the different scenarios of the is valid.
     */
    it('isValid', () => {
        const sector: ColumnSector = new ColumnSector();

        // Initially this should not be valid.
        expect(sector.isValid()).toBeFalsy();

        // Now set the value to true and it should be valid.
        sector.columnTag = 'sec_group';
        expect(sector.isValid()).toBeTruthy();
    });

    /**
     * Tests that a whitespace gets replaced in a column tag when creating
     * ColumnSector with the deserialised data
     */
    it('test white space replacement in a column tag', () => {
        const colTagForSector = ' sec   attr1  ';
        const expectedStringForSector = '_space_sec_space__space__space_attr1_space__space_';
        const colTagForChildSector = ' ab  cc';
        const expectedStringForChildSector = '_space_ab_space__space_cc';

        // Create a sector
        const sector: ColumnSector = new ColumnSector();
        sector.columnName = 'Security Group';
        sector.columnTag = colTagForSector;
        sector.positionColumnType = 'ALL';
        sector.dataType = 'String';

        // Add a sub sector.
        const child: ColumnSector = new ColumnSector();
        child.columnName = 'Security Type';
        child.columnTag = colTagForChildSector;
        child.positionColumnType = 'ALL';
        child.dataType = 'String';
        sector.addChild(child);

        // Serialise / deserialise
        const serializedData: string = JSON.stringify(sector.serialize());
        const deserializedData: any = JSON.parse(serializedData);

        // Create sectors from deserialised
        const newSector: ColumnSector = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.COLUMN_SECTOR, true);
        const newChild: ColumnSector = newSector.children[0] as ColumnSector;

        // Check that the whitespace is replaced in both column tags
        expect(newSector.columnTag).toEqual(expectedStringForSector);
        expect(newChild.columnTag).toEqual(expectedStringForChildSector);
    });
});

/**
 * validates that the sector attributes are the same.
 */
function validateSectorEqual(origSector: ColumnSector, newSector: ColumnSector): void {
    expect(newSector.columnName).toBe(origSector.columnName);
    expect(newSector.columnTag).toBe(origSector.columnTag);
    expect(newSector.positionColumnType).toBe(origSector.positionColumnType);
    expect(newSector.dataType).toBe(origSector.dataType);
    expect(newSector.useNoneBuckets).toBe(origSector.useNoneBuckets);
}
