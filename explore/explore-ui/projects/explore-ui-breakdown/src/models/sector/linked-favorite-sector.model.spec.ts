import {LinkedFavoriteSector} from './linked-favorite-sector.model';
import {ColumnSectorRule} from './column-sector/column-sector-rule.model';
import {CustomSector} from './custom-sector/custom-sector.model';
import {ColumnSector} from './column-sector/column-sector.model';
import {BreakdownInitializer} from '../../breakdown.initializer';
import {CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';

describe('LinkedFavoriteSector', () => {

    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        BreakdownInitializer.registerSectorConfigTypes();
    });

    /**
     * Test calling serialize on the LinkedFavoriteSector and then using that generated string to deserialize into a new LinkedFavoriteSector and test it is the same.
     */
    it('Serialize/Deserialize test', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const sector: LinkedFavoriteSector = new LinkedFavoriteSector();

        const customSector: CustomSector = new CustomSector();
        customSector.title = 'Sec Group ABS CASH';
        customSector.includeOtherBucket = true;

        const columnSectorRule: ColumnSectorRule = new ColumnSectorRule();
        columnSectorRule.columnName = 'Security Group';
        columnSectorRule.columnTag = 'sec_group';
        columnSectorRule.positionColumnType = 'ALL';
        columnSectorRule.dataType = 'STRING';
        columnSectorRule.comparisonType = 'Equals';
        columnSectorRule.comparisonValues = ['ABS', 'CASH'];

        customSector.rule = columnSectorRule;
        sector.sector = customSector;

        // Add a sub sector.
        const child: ColumnSector = new ColumnSector();
        child.columnName = 'Security Type';
        child.columnTag = 'sec_type';
        child.positionColumnType = 'ALL';
        child.dataType = 'String';
        child.useNoneBuckets = false;
        sector.children.push(child);

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(sector.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newSector: LinkedFavoriteSector = new LinkedFavoriteSector();
        newSector.deserialize(deserializedData);

        // Validate that the before and after are the same.
        validateLinkedFavoriteSectorEqual(sector, newSector);

        // Validate child sector.
        expect(newSector.children).toBeDefined();
        expect(newSector.children).not.toBeNull();
        expect(newSector.children.length).toBe(1);
        const newChild: ColumnSector = newSector.children[0] as ColumnSector;
        validateSectorEqual(child, newChild);
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

    /**
     * validates that the linked favorite sector attributes are the same.
     */
    function validateLinkedFavoriteSectorEqual(origSector: LinkedFavoriteSector, newSector: LinkedFavoriteSector): void {
        expect(newSector.children.length).toEqual(origSector.children.length);
        validateCustomSectorEqual(origSector.sector as CustomSector, newSector.sector as CustomSector);
    }

    /**
     * Validates that the custom sector attributes are the same
     */
    function validateCustomSectorEqual(origSector: CustomSector, newSector: CustomSector): void {
        expect(newSector.title).toBe(origSector.title);
        expect(newSector.includeOtherBucket).toBe(origSector.includeOtherBucket);
        validateColumnSectorRuleEqual(origSector.rule as ColumnSectorRule, newSector.rule as ColumnSectorRule);
    }

    /**
     * Validates that the custom sector rule attributes are the same
     */
    function validateColumnSectorRuleEqual(origRule: ColumnSectorRule, newRule: ColumnSectorRule): void {
        expect(newRule.columnName).toBe(origRule.columnName);
        expect(newRule.columnTag).toBe(origRule.columnTag);
        expect(newRule.positionColumnType).toBe(origRule.positionColumnType);
        expect(newRule.dataType).toBe(origRule.dataType);
        expect(newRule.comparisonType).toBe(origRule.comparisonType);
        expect(newRule.comparisonValues.length).toBe(origRule.comparisonValues.length);
        expect(newRule.comparisonValues).toEqual(origRule.comparisonValues);
    }
});
