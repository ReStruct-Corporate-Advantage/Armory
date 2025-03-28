import {SectorUtils} from './sector.utils';
import {Breakdown} from '../models/breakdown/breakdown.model';
import {ColumnSector} from '../models/sector/column-sector/column-sector.model';
import {LinkedFavoriteSector} from '../models/sector/linked-favorite-sector.model';
import {CustomSector} from '../models/sector/custom-sector/custom-sector.model';
import {ColumnSectorRule} from '../models/sector/column-sector/column-sector-rule.model';
import {Sector} from '../interfaces/sector.interface';
import {BreakdownInitializer} from '../breakdown.initializer';
import {CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
describe('SectorUtils', () => {

    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        BreakdownInitializer.registerSectorConfigTypes();
    });

    it('Test isEqual', () => {
        const breakdown1 = new Breakdown();
        breakdown1.text = 'Test';
        const breakdown2 = new Breakdown();
        breakdown2.text = 'Test';
        expect(SectorUtils.isEqual(breakdown1, breakdown2)).toBeTruthy();
        breakdown2.text = 'Test1';
        expect(SectorUtils.isEqual(breakdown1, breakdown2)).toBeFalsy();
        // One of Sector is Undefined
        expect(SectorUtils.isEqual(breakdown1, undefined)).toBeFalsy();
        // Same Objects
        expect(SectorUtils.isEqual(breakdown1, breakdown1)).toBeTruthy();
        // children comparison
        const customSector1 = new CustomSector();
        customSector1.title = 'Custom Sector';
        const customSector2 = new CustomSector();
        customSector2.title = 'Custom Sector';
        breakdown2.text = 'Test';
        breakdown1.addChild(customSector1);
        breakdown2.addChild(customSector2);
        expect(SectorUtils.isEqual(breakdown1, breakdown2)).toBeTruthy();
        customSector1.title = 'Custom Sector 1';
        expect(SectorUtils.isEqual(breakdown1, breakdown2)).toBeFalsy();
        // Children undefined in one of sector
        breakdown1.children = undefined;
        expect(SectorUtils.isEqual(breakdown1, breakdown2)).toBeFalsy();
        // Children is empty in one of sector
        breakdown1.children = [];
        expect(SectorUtils.isEqual(breakdown1, breakdown2)).toBeFalsy();
        // Children of breakdown1 is [] while children of breakdown2 is undefined
        breakdown2.children = undefined;
        expect(SectorUtils.isEqual(breakdown1, breakdown2)).toBeTruthy();
    });

    it('Serialize/Deserialize Children test', () => {
        const breakdown: Breakdown = new Breakdown();
        breakdown.title = 'Test Breakdown';

        // Add a sub sector.
        const child: ColumnSector = new ColumnSector();
        child.columnName = 'Security Type';
        child.columnTag = 'sec_type';
        child.positionColumnType = 'ALL';
        child.dataType = 'String';
        child.useNoneBuckets = false;

        breakdown.addChild(child);

        // Add two sub sector to the first child
        const child1: ColumnSector = new ColumnSector();
        child1.columnName = 'Security Group';
        child1.columnTag = 'sec_group';
        child1.positionColumnType = 'ALL';
        child1.dataType = 'String';
        child1.useNoneBuckets = true;

        const child2: ColumnSector = new ColumnSector();
        child2.columnName = 'Portfolio Name';
        child2.columnTag = 'port_name';
        child2.positionColumnType = 'ALL';
        child2.dataType = 'String';
        child2.useNoneBuckets = false;

        child.addChild(child1);
        child.addChild(child2);

        const data: any = {
            breakdown: {
                breakdownTitle: 'Test Breakdown'
            }
        };
        // Serialize the breakdown's children into the data.breakdown.object
        SectorUtils.serializeChildren(breakdown, data.breakdown, 0);
        const serializedData: string = JSON.stringify(data);
        const expectedData = '{\"breakdown\":{\"breakdownTitle\":\"Test Breakdown\",' +
            '\"subSectors\":[{\"breakdownRuleType\":\"String\",' +
            '\"groupByColumn\":{\"columnName\":\"Security Type\",\"columnTag\":\"sec_type\",' +
            '\"dataType\":\"String\",\"positionColumnType\":\"ALL\"},\"subSectors\":[{\"breakdownRuleType\":\"String\",' +
            '\"groupByColumn\":{\"columnName\":\"Security Group\",\"columnTag\":\"sec_group\",' +
            '\"dataType\":\"String\",\"positionColumnType\":\"ALL\"},\"useNoneBuckets\":true},{\"breakdownRuleType\":\"String\",' +
            '\"groupByColumn\":{\"columnName\":\"Portfolio Name\",\"columnTag\":\"port_name\",' +
            '\"dataType\":\"String\",\"positionColumnType\":\"ALL\"},\"useNoneBuckets\":false}],\"useNoneBuckets\":false}]}}';
        // Check if the serialized strings match
        expect(expectedData).toEqual(serializedData);

        // Deserialize the serialized data
        const deserializedData: any = JSON.parse(serializedData);

        // Create a new breakdown object and deserialize children from the data into this new breakdown
        const newBreakdown: Breakdown = new Breakdown();
        SectorUtils.deserializeChildren(newBreakdown, deserializedData.breakdown);
        validateSectorHasCorrectNumberOfChildren(newBreakdown, 1);
        // Expect that the column sector under it is created as well
        validateSectorHasCorrectNumberOfChildren(newBreakdown.children[0], 2);
    });

    it('Serialize/Deserialize Children with Linked Favoried Sectors test', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const breakdown: Breakdown = new Breakdown();
        breakdown.title = 'Test Breakdown';

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

        breakdown.addChild(sector);
        const data: any = {
            breakdown: {
                breakdownTitle: 'Test Breakdown'
            }
        };
        // Serialize the breakdown's children into the data.breakdown.object
        SectorUtils.serializeChildren(breakdown, data.breakdown, 0);
        const serializedData: string = JSON.stringify(data);
        // Check if the serialized strings match
        expect(serializedData).toMatch(JSON.stringify({
            breakdown: {
                breakdownTitle: 'Test Breakdown',
                subSectors: [
                    {
                        breakdownRuleType: 'CustomSector',
                        includeOtherBucket: true,
                        rule: {
                            colPositionColumnType: 'ALL',
                            colTag: 'sec_group',
                            colTitle: 'Security Group',
                            colType: 'STRING',
                            compType: 'Equals',
                            compValues: ['ABS', 'CASH'],
                            customSectorType: 'Attributes',
                            ruleType: 'Rule'
                        },
                        title: 'Sec Group ABS CASH',
                        subSectors: [
                            {
                                breakdownRuleType: 'String',
                                groupByColumn: {
                                    columnName: 'Security Type',
                                    columnTag: 'sec_type',
                                    dataType: 'String',
                                    positionColumnType: 'ALL'
                                },
                                useNoneBuckets: false
                            }]
                    }]
            }
        }));
        ;

        // Deserialize the serialized data
        const deserializedData: any = JSON.parse(serializedData);

        // Create a new breakdown object and deserialize children from the data into this new breakdown
        const newBreakdown: Breakdown = new Breakdown();
        SectorUtils.deserializeChildren(newBreakdown, deserializedData.breakdown);
        validateSectorHasCorrectNumberOfChildren(newBreakdown, 1);
        // Expect the custom sector to deserialize into a proper LinkedFavoriteSector
        expect(newBreakdown.children[0] instanceof LinkedFavoriteSector).toBeTruthy();
        // Expect that the column sector under it is created as well
        validateSectorHasCorrectNumberOfChildren(newBreakdown.children[0], 1);
    });

    /**
     * Validates that a sector has the correct number of children
     */
    function validateSectorHasCorrectNumberOfChildren(sector: Sector, numberOfChildren: number): void {
        expect(sector.children).toBeDefined();
        expect(sector.children).not.toBeNull();
        expect(sector.children.length).toBe(numberOfChildren);
    }
});
