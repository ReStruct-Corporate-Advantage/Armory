import {CustomSector} from './custom-sector.model';
import {ColumnSectorRule} from '../column-sector/column-sector-rule.model';
import {LinkedFavoriteSector} from '../linked-favorite-sector.model';
import {GroupRule} from '../group-rule.model';
import {ConfigTypeFactory, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {BreakdownInitializer} from '../../../breakdown.initializer';
import {SectorConstants} from '../../../constants/sector.constants';

describe('CustomSector', () => {

    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        BreakdownInitializer.registerSectorConfigTypes();
    });

    /**
     * Test calling serialize on the CustomSector and then using that generated string to deserialize into a new CustomSector and test it is the same.
     */
    it('Serialize/Deserialize test', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const groupRule = new GroupRule();
        groupRule.groupType = 'AND';

        const columnRule: ColumnSectorRule = new ColumnSectorRule();
        columnRule.columnName = 'Security Group';
        columnRule.columnTag = 'sec_group';
        columnRule.positionColumnType = 'ALL';
        columnRule.dataType = 'String';
        columnRule.comparisonType = 'EQUALS';
        columnRule.comparisonValues = ['EQUITY', 'BND'];
        columnRule.comparisonLabels = ['EQUITY', 'BOND'];

        const sector: CustomSector = new CustomSector();
        sector.rule = groupRule;
        const linkedFavoriteSector: LinkedFavoriteSector = new LinkedFavoriteSector();
        const childSector: CustomSector = new CustomSector();
        linkedFavoriteSector.sector = childSector;
        childSector.rule = columnRule;
        sector.addChild(linkedFavoriteSector);

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(sector.serialize(true));
        const deserializedData: any = JSON.parse(serializedData);
        const newSector: CustomSector = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.CUSTOM_SECTOR, true);

        // Validate that the before and after are the same.
        expect(newSector).toBeDefined();
        expect(newSector).not.toBeNull();
        expect(newSector.rule).toBeDefined();
        expect(newSector.rule).not.toBeNull();
        const newGroupRule: GroupRule = newSector.rule as GroupRule;
        expect(newGroupRule.groupType).toBe(groupRule.groupType);

        // Now check the child sector is there and that it has a column set.
        expect(newSector.children).toBeDefined();
        expect(newSector.children).not.toBeNull();
        expect(newSector.children.length).toBe(sector.children.length);
        expect(newSector.children.length).toBe(0);
    });

    /**
     * Test the different scenarios of the is valid.
     */
    it('test isValid', () => {
        const sector: CustomSector = new CustomSector();

        // Initially this should not be valid.
        expect(sector.isValid()).toBeFalsy();

        // Now set an empty group as a rule and it shouldn't be valid.
        sector.rule = new GroupRule();
        expect(sector.isValid()).toBeFalsy();

        // Now set a valid rule and it should be valid.
        const rule: ColumnSectorRule = new ColumnSectorRule();
        rule.columnTag = 'sec_group';
        rule.comparisonType = 'equals';
        rule.comparisonValues = ['ABS'];
        sector.rule = rule;
        expect(sector.isValid()).toBeTruthy();
    });
});
