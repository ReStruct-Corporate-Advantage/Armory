import {Breakdown} from './breakdown.model';
import {ColumnSector} from '../sector/column-sector/column-sector.model';
import {CustomSector} from '../sector/custom-sector/custom-sector.model';
import {SchemaSector} from '../sector/schema-sector/schema-sector.model';
import {NumericColumnSector} from '../sector/column-sector/numeric-column-sector.model';
import {DateColumnSector} from '../sector/column-sector/date-column-sector.model';
import {TimeSpanColumnSector} from '../sector/column-sector/time-span-column-sector.model';
import {ColumnSectorRule} from '../sector/column-sector/column-sector-rule.model';
import {LinkedFavoriteSector} from '../sector/linked-favorite-sector.model';
import {Sector} from '../../interfaces/sector.interface';
import {BreakdownInitializer} from '../../breakdown.initializer';
import {SectorConstants} from '../../constants/sector.constants';
import {ColumnDefinition, ConfigTypeFactory, CoreColumnUtils, WidgetInputType,CoreUserMetaDataStore,UserMetaData} from '@blk/explore-ui-core';
import * as momentTz from 'moment-timezone';

describe('Breakdown', () => {

    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();
    });

    /**
     * Test Equals method
     */
    it('Test Equals', () => {
        const breakdown1 = new Breakdown();
        breakdown1.text = 'Test';
        const breakdown2 = new Breakdown();
        breakdown2.text = 'Test';
        expect(breakdown1.equals(breakdown2)).toBeTruthy();
        breakdown2.text = 'Test1';
        expect(breakdown1.equals(breakdown2)).toBeFalsy();
        // One of Sector is Undefined
        expect(breakdown1.equals(undefined)).toBeFalsy();
        // Same Objects
        expect(breakdown1.equals(breakdown1)).toBeTruthy();
        // children comparison
        const customSector1 = new CustomSector();
        customSector1.title = 'Custom Sector';
        const customSector2 = new CustomSector();
        customSector2.title = 'Custom Sector';
        breakdown2.text = 'Test';
        breakdown1.addChild(customSector1);
        breakdown2.addChild(customSector2);
        expect(breakdown1.equals(breakdown2)).toBeTruthy();
        customSector1.title = 'Custom Sector 1';
        expect(breakdown1.equals(breakdown2)).toBeFalsy();
        // Children undefined in one of sector
        breakdown1.children = undefined;
        expect(breakdown1.equals(breakdown2)).toBeFalsy();
        // Children is empty in one of sector
        breakdown1.children = [];
        expect(breakdown1.equals(breakdown2)).toBeFalsy();
    });

    it('Test Equals with preset breakdowns', () => {
        const breakdown1 = new Breakdown();
        const breakdown2 = new Breakdown();
        breakdown1.presetBreakdownId = 'preset_breakdown_1';
        expect(breakdown1.equals(breakdown2)).toBeFalsy();

        breakdown2.presetBreakdownId = 'preset_breakdown_2';
        expect(breakdown1.equals(breakdown2)).toBeFalsy();

        breakdown2.presetBreakdownId = 'preset_breakdown_1';
        expect(breakdown1.equals(breakdown2)).toBeTruthy();
    });

    it('Test equals with mandate default breakdown', () => {
        const breakdown1 = new Breakdown();
        const breakdown2 = new Breakdown();
        breakdown1.isMandateDefaultBreakdown = true;
        expect(breakdown1.equals(breakdown2)).toBeFalsy();

        breakdown2.isMandateDefaultBreakdown = true;
        expect(breakdown1.equals(breakdown2)).toBeTruthy();
    });

    /**
     * Test calling serialize on the Breakdown and
     * then using that generated string to deserialize into a new Breakdown and test it is the same.
     */
    it('Serialize/Deserialize test', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const breakdown: Breakdown = new Breakdown();

        // Add a sub sector.
        const child: ColumnSector = new ColumnSector();
        child.columnName = 'Security Type';
        child.columnTag = 'sec_type';
        child.positionColumnType = 'ALL';
        child.dataType = 'String';
        child.useNoneBuckets = false;
        breakdown.addChild(child);

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(breakdown.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newBreakdown: Breakdown = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.BREAKDOWN, true);

        // Validate child sector.
        expect(newBreakdown.children).toBeDefined();
        expect(newBreakdown.children).not.toBeNull();
        expect(newBreakdown.children.length).toBe(breakdown.children.length);

        const newChild: ColumnSector = newBreakdown.children[0] as ColumnSector;
        validateSectorEqual(child, newChild);
    });

    it('Deserialize test with no data.breakdown.breakdownTitle', () => {
        const data = '{"title":"demotitle","breakdown":{"breakdownTitle":"demo","subSectors":[{"id":0,"breakdownRuleType":"CustomSector",' +
            '"useNoneBuckets":true}]},"customSectors":{"0":{"id":0,"sectorName":"Equity",' +
            '"sectorRule":{"colTag":"sec_group","compType":"Equals","colType":"STRING",' +
            '"ruleType":"Rule","colTitle":"Security Group","colPositionColumnType":"ALL",' +
            '"compValues":["EQUITY"],"compValuesLabel":["EQUITY"]},"includeOtherBucket":true,"ruleType":null}}}';
        const deserializedData: any = JSON.parse(data);
        const newBreakdown: Breakdown = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.BREAKDOWN, true);
        expect(newBreakdown.title).toBe('demo');
        const data_two = '{"breakdown":{"breakdownTitle":"demo","subSectors":[{"id":0,"breakdownRuleType":"CustomSector",' +
            '"useNoneBuckets":true}]},"customSectors":{"0":{"id":0,"sectorName":"Equity",' +
            '"sectorRule":{"colTag":"sec_group","compType":"Equals","colType":"STRING",' +
            '"ruleType":"Rule","colTitle":"Security Group","colPositionColumnType":"ALL",' +
            '"compValues":["EQUITY"],"compValuesLabel":["EQUITY"]},"includeOtherBucket":true,"ruleType":null}}}';
        const deserializedDataTwo: any = JSON.parse(data_two);
        const newBreakdownTwo: Breakdown = ConfigTypeFactory.createConfig(deserializedDataTwo, SectorConstants.ConfigType.BREAKDOWN, true);
        expect(newBreakdownTwo.title).toBe('demo');
        const data_three = '{"title":"demotitle","breakdown":{"breakdownTitle":null,"subSectors":[{"id":0,"breakdownRuleType":"CustomSector",' +
            '"useNoneBuckets":true}]},"customSectors":{"0":{"id":0,"sectorName":"Equity",' +
            '"sectorRule":{"colTag":"sec_group","compType":"Equals","colType":"STRING",' +
            '"ruleType":"Rule","colTitle":"Security Group","colPositionColumnType":"ALL",' +
            '"compValues":["EQUITY"],"compValuesLabel":["EQUITY"]},"includeOtherBucket":true,"ruleType":null}}}';
        const deserializedDataThree: any = JSON.parse(data_three);
        const newBreakdownThree: Breakdown = ConfigTypeFactory.createConfig(deserializedDataThree, SectorConstants.ConfigType.BREAKDOWN, true);
        expect(newBreakdownThree.title).toBe('demotitle');
        const data_four = '{"title":null,"breakdown":{"breakdownTitle":null,"subSectors":[{"id":0,"breakdownRuleType":"CustomSector",' +
            '"useNoneBuckets":true}]},"customSectors":{"0":{"id":0,"sectorName":"Equity",' +
            '"sectorRule":{"colTag":"sec_group","compType":"Equals","colType":"STRING",' +
            '"ruleType":"Rule","colTitle":"Security Group","colPositionColumnType":"ALL",' +
            '"compValues":["EQUITY"],"compValuesLabel":["EQUITY"]},"includeOtherBucket":true,"ruleType":null}}}';
        const deserializedDataFour: any = JSON.parse(data_four);
        const newBreakdownFour: Breakdown = ConfigTypeFactory.createConfig(deserializedDataFour, SectorConstants.ConfigType.BREAKDOWN, true);
        expect(newBreakdownFour.title).toBe('<Equity>');
    });

    it('Test deserialize with isConfigured flag', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const breakdown: Breakdown = new Breakdown();

        // Convert the object to string and then back to json again.
        let serializedData: string = JSON.stringify(breakdown.serialize());
        let deserializedData: any = JSON.parse(serializedData);
        let newBreakdown: Breakdown = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.BREAKDOWN, true);

        // Test for the isConfigured flag. Should default to true if left undefined
        expect(newBreakdown.isConfigured).toBeTruthy();

        // Change the flag to false and serialize/deserialize again
        newBreakdown.isConfigured = false;
        serializedData = JSON.stringify(newBreakdown.serialize(true));
        deserializedData = JSON.parse(serializedData);
        newBreakdown = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.BREAKDOWN, true);
        expect(newBreakdown.isConfigured).toBeFalsy();

        // Change the flag back to true and serialize/deserialize again
        newBreakdown.isConfigured = true;
        serializedData = JSON.stringify(newBreakdown.serialize(true));
        deserializedData = JSON.parse(serializedData);
        newBreakdown = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.BREAKDOWN, true);
        expect(newBreakdown.isConfigured).toBeTruthy();
    });

    it('Test serialize and deserialize for presetBreakdownId', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const breakdown = new Breakdown();
        breakdown.presetBreakdownId = 'iaa_breakdown';
        breakdown.title = 'IAA Breakdown';
        breakdown.isConfigured = true;

        const serializedData: string = JSON.stringify(breakdown.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const deserializedBreakdown: Breakdown = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.BREAKDOWN, false);

        expect(deserializedBreakdown.presetBreakdownId).toEqual(breakdown.presetBreakdownId);
        expect(deserializedBreakdown.title).toEqual(breakdown.title);
        expect(deserializedBreakdown.isConfigured).toEqual(true);
    });

    it('Test serialize and deserialize for isMandateDefaultBreakdown', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const breakdown = new Breakdown();
        breakdown.isMandateDefaultBreakdown = true;
        breakdown.title = 'Default Breakdown';
        breakdown.isConfigured = false;

        const serializedData: string = JSON.stringify(breakdown.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const deserializedBreakdown: Breakdown = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.BREAKDOWN, false);

        expect(deserializedBreakdown.isMandateDefaultBreakdown).toEqual(breakdown.isMandateDefaultBreakdown);
        expect(deserializedBreakdown.title).toEqual(breakdown.title);
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
     * Test deserialising a breakdown with a custom sector in it.
     */
    it('Deserialize breakdown with custom sector', () => {
        const data = '{"breakdown":{"breakdownTitle":null,"subSectors":[{"id":0,"breakdownRuleType":"CustomSector",' +
            '"useNoneBuckets":true}]},"customSectors":{"0":{"id":0,"sectorName":"Equity",' +
            '"sectorRule":{"colTag":"sec_group","compType":"Equals","colType":"STRING",' +
            '"ruleType":"Rule","colTitle":"Security Group","colPositionColumnType":"ALL",' +
            '"compValues":["EQUITY"],"compValuesLabel":["EQUITY"]},"includeOtherBucket":true,"ruleType":null}}}';

        // Convert the object to json and then into a breakdown object.
        const deserializedData: any = JSON.parse(data);
        const newBreakdown: Breakdown = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.BREAKDOWN, true);

        // Validate that the breakdown contains 1 child sector and that it is a custom sector.
        expect(newBreakdown).toBeDefined();
        expect(newBreakdown).not.toBeNull();
        expect(newBreakdown.children).toBeDefined();
        expect(newBreakdown.children).not.toBeNull();
        expect(newBreakdown.children.length).toBe(1);

        const child: Sector = newBreakdown.children[0];
        expect(child instanceof LinkedFavoriteSector).toBeTruthy();
        const linkedFavoriteSector: LinkedFavoriteSector = child as LinkedFavoriteSector;
        const customSector: CustomSector = linkedFavoriteSector.sector as CustomSector;
        expect(customSector.rule instanceof ColumnSectorRule).toBeTruthy();
        const columnRule: ColumnSectorRule = customSector.rule as ColumnSectorRule;
        expect(columnRule.columnTag).toBe('sec_group');
    });

    /**
     * Test calling the isEmpty function.
     */
    it('Test isEmpty', () => {
        const breakdown: Breakdown = new Breakdown();

        // Try with null.
        breakdown.children = null;
        expect(breakdown.isEmpty()).toBeTruthy();

        // Try with undefined.
        breakdown.children = undefined;
        expect(breakdown.isEmpty()).toBeTruthy();

        // Try with empty.
        breakdown.children = [];
        expect(breakdown.isEmpty()).toBeTruthy();

        // Try with a child sector.
        breakdown.addChild(new ColumnSector());
        expect(breakdown.isEmpty()).toBeFalsy();
    });

    it('Test isEmpty for isDefaultMandateBreakdown', () => {
        const breakdown: Breakdown = new Breakdown();

        breakdown.isMandateDefaultBreakdown = false;
        expect(breakdown.isEmpty()).toEqual(true);

        breakdown.isMandateDefaultBreakdown = true;
        expect(breakdown.isEmpty()).toEqual(false);
    });

    /**
     * Test calling the isMulti function.
     */
    it('Test isSimpleSingleLevel', () => {
        const breakdown: Breakdown = new Breakdown();

        // Try with null.
        breakdown.children = null;
        expect(breakdown.isSimpleSingleLevel()).toBeFalsy();

        // Try with undefined.
        breakdown.children = undefined;
        expect(breakdown.isSimpleSingleLevel()).toBeFalsy();

        // Try with empty.
        breakdown.children = [];
        expect(breakdown.isSimpleSingleLevel()).toBeFalsy();

        // Try with a child sector that has no children.
        breakdown.addChild(new ColumnSector());
        expect(breakdown.isSimpleSingleLevel()).toBeTruthy();

        // Try with 2 child sectors.
        breakdown.addChild(new ColumnSector());
        expect(breakdown.isSimpleSingleLevel()).toBeFalsy();

        // Try with one child with a child sector.
        breakdown.children.splice(-1, 1);
        breakdown.children[0].addChild(new ColumnSector());
        expect(breakdown.isSimpleSingleLevel()).toBeFalsy();

        // Try with a child sector that is not a ColumnSector
        breakdown.children = [];
        breakdown.addChild(new CustomSector());
        expect(breakdown.isSimpleSingleLevel()).toBeFalsy();

        // Try with a timespan child.
        breakdown.children = [];
        breakdown.addChild(new TimeSpanColumnSector());
        expect(breakdown.isSimpleSingleLevel()).toBeFalsy();

        // Try with a date child.
        breakdown.children = [];
        breakdown.addChild(new DateColumnSector());
        expect(breakdown.isSimpleSingleLevel()).toBeFalsy();

        // Try with a numeric child.
        breakdown.children = [];
        breakdown.addChild(new NumericColumnSector());
        expect(breakdown.isSimpleSingleLevel()).toBeFalsy();
    });

    /**
     * Test calling the isMulti function.
     */
    it('Test isMultiLevel', () => {
        const breakdown: Breakdown = new Breakdown();

        // Try with null.
        breakdown.children = null;
        expect(breakdown.isMultiLevel()).toBeFalsy();

        // Try with undefined.
        breakdown.children = undefined;
        expect(breakdown.isMultiLevel()).toBeFalsy();

        // Try with empty.
        breakdown.children = [];
        expect(breakdown.isMultiLevel()).toBeFalsy();

        // Try with a child sector.
        breakdown.addChild(new ColumnSector());
        expect(breakdown.isMultiLevel()).toBeFalsy();

        // Try with 2 child sectors.
        breakdown.addChild(new ColumnSector());
        expect(breakdown.isMultiLevel()).toBeFalsy();

        // Try with a child with a child sector.
        breakdown.children[1].addChild(new ColumnSector());
        expect(breakdown.isMultiLevel()).toBeTruthy();
    });

    /**
     * Test calling the stripChildrenToLevel function.
     */
    it('Test stripChildrenToLevel', () => {
        let breakdown: Breakdown = new Breakdown();
        breakdown.addChild(new ColumnSector());
        breakdown.children[0].addChild(new ColumnSector());
        breakdown.children[0].children[0].addChild(new ColumnSector());

        // Try trimming to level 2.
        // We should only end up having the first 2 child nodes.
        breakdown.stripChildrenToLevel(2);
        expect(breakdown.isEmpty()).toBeFalsy();
        expect(breakdown.children[0].children.length).toBe(1);
        expect(breakdown.children[0].children[0].children.length).toBe(0);

        // Try trimming to level 1.
        // We should only end up having the first 2 child nodes.
        breakdown.stripChildrenToLevel(1);
        expect(breakdown.isEmpty()).toBeFalsy();
        expect(breakdown.children[0].children.length).toBe(0);

        // Test for linked Favorite Sector when sector is not defined
        breakdown = new Breakdown();
        const linkedFavSector = new LinkedFavoriteSector();
        linkedFavSector.addChild(new ColumnSector());
        breakdown.addChild(linkedFavSector);

        breakdown.stripChildrenToLevel(1);
        expect(breakdown.isEmpty()).toBeFalsy();
        expect(breakdown.children[0].children.length).toBe(0);

        // Test for linked Favorite Sector when sector is defined
        breakdown = new Breakdown();
        const customSector = new CustomSector();
        customSector.addChild(new ColumnSector());
        linkedFavSector.sector = customSector;
        breakdown.addChild(linkedFavSector);

        breakdown.stripChildrenToLevel(1);
        expect(breakdown.isEmpty()).toBeFalsy();
        expect(breakdown.children[0].children.length).toBe(0);
        expect((breakdown.children[0] as LinkedFavoriteSector).sector.children.length).toBe(0);
    });

    it('should add request params with default param name', () => {
        const requestParams: any = {};
        let breakdown: Breakdown = new Breakdown();
        breakdown.isTopBottomSectoring = true;
        breakdown.isDisplayAtGroupNode = true;

        breakdown.addRequestParams(requestParams);

        expect(requestParams[WidgetInputType.BREAKDOWN_TREE]).toBe(JSON.stringify(breakdown.serialize()));
        expect(requestParams.isTopBottomSectoring).toBe(true);
    });

    it('should add request params with provided param name', () => {
        const requestParams: any = {};
        const paramName = 'customParam';
        let breakdown: Breakdown = new Breakdown();
        breakdown.isTopBottomSectoring = false;

        breakdown.addRequestParams(requestParams, paramName);

        expect(requestParams[paramName]).toBe(JSON.stringify(breakdown.serialize()));
        expect(requestParams.isTopBottomSectoring).toBe(false);
        expect(requestParams.isDisplayAtGroupNode).toBe(false);
    });

    it('should add decision benchmark data specific breakdown params when isDecisionLevelData is true and portTreeDecisionLevel > 0', () => {
        const requestParams: any = { isDecisionLevelData: true, portTreeDecisionLevel: 1 };
        let breakdown: Breakdown = new Breakdown();
        let sectorChild = new ColumnSector();
        sectorChild.columnTag = 'portfolio_tree';
        breakdown.addChild(sectorChild);
        breakdown.isTopBottomSectoring = false;

        breakdown.addRequestParams(requestParams);

        expect(requestParams[WidgetInputType.BREAKDOWN_TREE]).toBe(JSON.stringify(breakdown.serialize()));
        expect(requestParams.isTopBottomSectoring).toBe(true);
    });

    it('should add decision benchmark data specific breakdown params when isDecisionLevelData is true and topDownCols is not empty', () => {
        const requestParams: any = { isDecisionLevelData: true, topDownCols: ['col1', 'col2'] };
        let breakdown: Breakdown = new Breakdown();
        breakdown.isTopBottomSectoring = false;

        breakdown.addRequestParams(requestParams);

        const expectedBreakdown = new Breakdown();
        const columnSector1 = new ColumnSector();
        columnSector1.columnTag = 'col1';
        const columnSector2 = new ColumnSector();
        columnSector2.columnTag = 'col2';
        expectedBreakdown.children.push(columnSector1);
        columnSector1.children = [columnSector2];

        expect(requestParams[WidgetInputType.BREAKDOWN_TREE]).toBe(JSON.stringify(expectedBreakdown.serialize()));
        expect(requestParams.isTopBottomSectoring).toBe(true);
    });

    it('should not add decision benchmark data specific breakdown params when isDecisionLevelData is false', () => {
        const requestParams: any = { isDecisionLevelData: false };
        let breakdown: Breakdown = new Breakdown();
        breakdown.isTopBottomSectoring = false;

        breakdown.addRequestParams(requestParams);

        expect(requestParams[WidgetInputType.BREAKDOWN_TREE]).toBe(JSON.stringify(breakdown.serialize()));
        expect(requestParams.isTopBottomSectoring).toBe(false);
        expect(requestParams.isDisplayAtGroupNode).toBe(false);
    });

    /**
     * Test calling the append function to add 2 breakdowns together.
     */
    it('Test append breakdowns', () => {
        const leaf1: ColumnSector = new ColumnSector();
        const leaf2: ColumnSector = new ColumnSector();
        const nonLeaf: ColumnSector = new ColumnSector();

        const breakdown: Breakdown = new Breakdown();
        breakdown.addChild(leaf1);
        breakdown.addChild(nonLeaf);
        nonLeaf.addChild(leaf2);

        const breakdown2: Breakdown = new Breakdown();
        breakdown2.addChild(new ColumnSector());

        // Add the 2 breakdowns together.
        breakdown.append(breakdown2);

        // Validate.
        // We should end up with an extra level under each of the original leaf nodes.
        expect(leaf1.children.length).toBe(1);
        expect(leaf2.children.length).toBe(1);
        expect(nonLeaf.children.length).toBe(1);
    });

    /**
     * Test calling the append function to add 2 breakdowns together.
     */
    it('Test get default breakdown', () => {
        const breakdown: Breakdown = Breakdown.getDefaultBreakdown();
        expect(breakdown).toBeDefined();
        expect(breakdown).not.toBeNull();
        expect(breakdown.children).toBeDefined();
        expect(breakdown.children).not.toBeNull();
        expect(breakdown.children.length).toBe(1);
    });

    it('Test breakdown tree has portfolio name column', () => {
        const breakdown: Breakdown = Breakdown.getDefaultBreakdown();
        expect(breakdown.hasPortfolioNameColumn()).toBeFalsy();
        const sector: ColumnSector = new ColumnSector();
        sector.columnTag = 'portfolio_name';
        sector.columnName = 'Portfolio name';
        breakdown.addChild(sector);
        expect(breakdown.hasPortfolioNameColumn()).toBeTruthy();
    });

    /**
     * Test calling the getDisplayTitle function for all the various ways through the code.
     */
    it('Test get display title', () => {
        // Validate that an empty breakdown returns no title.
        let breakdown: Breakdown = new Breakdown();
        expect(breakdown.getDisplayTitle()).toBe('');

        // Validate that a breakdown with a title returns the title.
        breakdown.title = 'named breakdown';
        expect(breakdown.getDisplayTitle()).toBe(breakdown.title);

        // Add a simple sector and expect the column name to be returned.
        breakdown = Breakdown.getDefaultBreakdown();
        breakdown.title = undefined;
        expect(breakdown.getDisplayTitle()).toBe('Security Group');

        // Add a child and it should be concatenated.
        breakdown.children[0].addChild(Breakdown.getDefaultBreakdown().children[0]);
        expect(breakdown.getDisplayTitle()).toBe('Security Group\\Security Group');

        // Add a custom sector and it should add that to the title.
        breakdown = Breakdown.getDefaultBreakdown();
        breakdown.title = undefined;
        breakdown.children[0].addChild(new CustomSector());
        expect(breakdown.getDisplayTitle()).toBe('Security Group\\Custom');

        // Add another child at the root level to test that complex is returned.
        breakdown.addChild(Breakdown.getDefaultBreakdown().children[0]);
        expect(breakdown.getDisplayTitle()).toBe('Complex');
    });

    it('Test deserialize for already deserialized  breakdown', () => {
        const breakdown: Breakdown = new Breakdown();

        // Add a sub sector.
        const child: ColumnSector = new ColumnSector();
        child.columnName = 'Country Name';
        child.columnTag = 'country';
        child.positionColumnType = 'ALL';
        child.dataType = 'String';
        child.useNoneBuckets = false;
        breakdown.addChild(child);
        breakdown.title = 'countryName';
        breakdown.owner = 'userX';

        const breakdownObjAfterDeserilization: Breakdown = new Breakdown();
        breakdownObjAfterDeserilization.deserialize(breakdown);
        const children: any = breakdownObjAfterDeserilization.children;

        expect(children.length).toBe(1);
        expect(children[0].columnTag).toBe('country');
    });

    /**
     * Test the setDefaultTitle method and that it sets the title properly based on the Breakdown's contents
     */
    it('Test setDefaultTitle method', () => {
        const breakdown: Breakdown = new Breakdown();

        breakdown.setDefaultTitle();
        expect(breakdown.title).toBe('');

        // Add a ColumnSector as a sub sector.
        const child: ColumnSector = new ColumnSector();
        child.columnName = 'Security Type';
        child.columnTag = 'sec_type';
        child.positionColumnType = 'ALL';
        child.dataType = 'String';
        child.useNoneBuckets = false;
        breakdown.addChild(child);

        // Call setDefaultTitle and check the title
        breakdown.setDefaultTitle();
        expect(breakdown.title).toBe('<Security Type>');

        // Clear the children
        breakdown.stripChildrenToLevel(0);

        // Add a CustomSector as a sub sector.
        const linkedFavoriteSector: LinkedFavoriteSector = new LinkedFavoriteSector();
        const childSector: CustomSector = new CustomSector();
        childSector.title = 'Custom Sector';
        linkedFavoriteSector.sector = childSector;
        breakdown.addChild(linkedFavoriteSector);

        // Call setDefaultTitle and check the title
        breakdown.setDefaultTitle();
        expect(breakdown.title).toBe('<Custom Sector>');

        // Add in another child so that the breakdown is not a single-level breakdown (only one sector on a level)
        breakdown.addChild(child);

        // Call setDefaultTitle and check the title
        breakdown.setDefaultTitle();
        expect(breakdown.title).toBe('<Untitled>');
    });

    it('Tests if break is a GR Sector breakdown only', () => {
        const breakdown: Breakdown = new Breakdown();

        const columnSector: ColumnSector = new ColumnSector();
        breakdown.children.push(columnSector);

        // single level non GR Sector
        columnSector.columnTag = 'ABCD';
        let breakdownColTags: Set<string> = new Set<string>();
        expect(breakdown.isGRSectorBreakdownOnly(breakdownColTags)).toBeFalsy();
        expect(breakdownColTags.size).toBe(0);

        // single level GR Secotr
        columnSector.columnTag = 'grsector`ABCD';
        expect(breakdown.isGRSectorBreakdownOnly(breakdownColTags)).toBeTruthy();
        expect(breakdownColTags.size).toBe(1);

        // multilevel GR Sector
        breakdownColTags = new Set<string>();
        columnSector.columnTag = 'grsector`ABCD`1';
        columnSector.children = new Array<Sector>();
        columnSector.children[0] = new ColumnSector();
        const childColSector: ColumnSector = columnSector.children[0] as ColumnSector;
        childColSector.columnTag = 'grsector`CDEF`1';
        expect(breakdown.isGRSectorBreakdownOnly(breakdownColTags)).toBeTruthy();
        expect(breakdownColTags.size).toBe(2);

        // multilevel non GR Sector
        breakdownColTags = new Set<string>();
        childColSector.columnTag = 'CDEF';
        expect(breakdown.isGRSectorBreakdownOnly(breakdownColTags)).toBeFalsy();
        expect(breakdownColTags.size).toBe(1);

        // multilevel non GR Sector - undefined colTag at 2nd level
        breakdownColTags = new Set<string>();
        childColSector.columnTag = undefined;
        expect(breakdown.isGRSectorBreakdownOnly(breakdownColTags)).toBeFalsy();
        expect(breakdownColTags.size).toBe(1);

        // Test for empty colTag
        breakdownColTags = new Set<string>();
        columnSector.columnTag = '';
        expect(breakdown.isGRSectorBreakdownOnly(breakdownColTags)).toBeFalsy();
        expect(breakdownColTags.size).toBe(0);

        // Test for undefined colTag
        breakdownColTags = new Set<string>();
        columnSector.columnTag = undefined;
        expect(breakdown.isGRSectorBreakdownOnly(breakdownColTags)).toBeFalsy();
        expect(breakdownColTags.size).toBe(0);

        // Test for null colTag
        breakdownColTags = new Set<string>();
        columnSector.columnTag = null;
        expect(breakdown.isGRSectorBreakdownOnly(breakdownColTags)).toBeFalsy();
        expect(breakdownColTags.size).toBe(0);
    });

    /**
     * Tests addRequestParams
     */
    it('addRequestParams', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        // Param name is not specified
        runAddRequestParamsAndVerify();

        // Param name is specified
        runAddRequestParamsAndVerify('xyz');
    });

    /**
     * Tests hasChildren
     */
    it('hasChildren', () => {
        const breakdown: Breakdown = new Breakdown();

        // Has no children
        expect(breakdown.hasChildren()).toBeFalsy();

        // Has children
        breakdown.addChild(new ColumnSector());
        expect(breakdown.hasChildren()).toBeTruthy();
    });

    it('tests isPerformanceBreakdown', () => {
        const breakdown: Breakdown = new Breakdown();
        expect(breakdown.isPerformanceBreakdown()).toBeTruthy();
        breakdown.addChild(new ColumnSector());
        expect(breakdown.isPerformanceBreakdown()).toBeFalsy();
        (breakdown.children[0] as ColumnSector).columnTag = 'abc';
        const colDefSpy = jest.spyOn(CoreColumnUtils, 'getColumnDefByTagAndUse');
        colDefSpy.mockReturnValue(new ColumnDefinition());
        expect(breakdown.isPerformanceBreakdown()).toBeFalsy();
        colDefSpy.mockReturnValue(new ColumnDefinition({title: '', praadaBreakdown: true}));
        expect(breakdown.isPerformanceBreakdown()).toBeTruthy();
        breakdown.addChild(new ColumnSector());
        expect(breakdown.isPerformanceBreakdown()).toBeFalsy();
    });

    /**
     * Tests deepCloneAndOptionalStripToSpecifiedLevel
     */
    it('deepCloneAndOptionalStripToSpecifiedLevel', () => {
        // Scenario - undefined level
        // Expected result - deep clone with levels preserved
        runDeepCloneAndOptionalStripToSpecifiedLevelAndVerify(false);

        // Scenario - defined level
        // Expected result - deep clone stripped to the specified level
        runDeepCloneAndOptionalStripToSpecifiedLevelAndVerify(true);
    });

    /**
     * Tests setIncludeNoneBucket
     */
    it('setIncludeNoneBucket', () => {
        runSetIncludeNoneBucketAndValidate(false);
        runSetIncludeNoneBucketAndValidate(true);
    });

    /**
     * Tests Breakdown.setIncludeNoneBucket
     * @param includeNoneBucket includeNoneBucket flag
     */
    function runSetIncludeNoneBucketAndValidate(includeNoneBucket: boolean) {
        // Create breakdown with two levels
        const levelOneSector = new ColumnSector();
        const levelTwoSector = new ColumnSector();
        levelOneSector.addChild(levelTwoSector);

        const breakdown: Breakdown = new Breakdown();
        breakdown.addChild(levelOneSector);

        // Set both sectors' useNoneBuckets flags to the opposite of the given flag to ensure the methods sets it correctly
        levelOneSector.useNoneBuckets = !includeNoneBucket;
        levelTwoSector.useNoneBuckets = !includeNoneBucket;

        // Run the method
        Breakdown.setIncludeNoneBucket(breakdown.children, includeNoneBucket);

        // Validate
        expect(levelOneSector.useNoneBuckets).toBe(includeNoneBucket);
        expect(levelTwoSector.useNoneBuckets).toBe(includeNoneBucket);
    }

    /**
     * Tests Breakdown.deepCloneAndOptionalStripToSpecifiedLevel with the one level breakdown
     * @param strip true to test stripping the levels as well as deep copy, false to just test deep copy
     */
    function runDeepCloneAndOptionalStripToSpecifiedLevelAndVerify(strip: boolean) {
        // Create breakdown with one level
        const levelOneSector = new ColumnSector();
        const breakdown: Breakdown = new Breakdown();
        breakdown.addChild(levelOneSector);

        // Create a deep clone
        let deepClonedBreakdown: Breakdown;
        if (strip) {
            // Deep clone and strip to empty (to zero level)
            deepClonedBreakdown = Breakdown.deepCloneAndOptionalStripToSpecifiedLevel(breakdown, 0);
        } else {
            // Deep clone
            deepClonedBreakdown = Breakdown.deepCloneAndOptionalStripToSpecifiedLevel(breakdown);
        }

        // Verify that the original breakdown is not changed
        expect(breakdown.children.length).toBe(1);
        expect(breakdown.getChildSectorAtIndex(0)).toBe(levelOneSector);

        // Verify that we have a deep copy
        expect(deepClonedBreakdown).not.toBe(breakdown);

        if (strip) {
            // Verify that levels are stripped
            expect(deepClonedBreakdown.hasChildren()).toBe(false);
        } else {
            // Verify that levels are not stripped
            expect(deepClonedBreakdown.children.length).toEqual(breakdown.children.length);
            expect(deepClonedBreakdown.getChildSectorAtIndex(0)).not.toBe(levelOneSector);
        }
    }

    /**
     * @param paramName a parameter name to use for the breakdown parameter, if not passed, it validates that
     * WidgetInputType.BREAKDOWN_TREE is used as the parameter name
     */
    function runAddRequestParamsAndVerify(paramName?: string) {
        const breakdown: Breakdown = new Breakdown();
        // Param name is not specified
        const requestParams: any = {};
        if (paramName) {
            breakdown.addRequestParams(requestParams, paramName);
        } else {
            breakdown.addRequestParams(requestParams);
        }
        const addedBreakdown = requestParams[paramName ? paramName : WidgetInputType.BREAKDOWN_TREE];
        // Expect default param name to be used
        expect(addedBreakdown).toMatch(JSON.stringify({
            breakdown: {}
        }));
    }

    /**
     * Test case for getModifiedWidgetTitleDetails
     */
    it('Test getModifiedWidgetTitleDetails', function () {
        /**
         * Test case for condition when Breakdown is not empty
         */
        const breakdown: Breakdown = new Breakdown();
        const customSector1 = new CustomSector();
        customSector1.title = 'Custom Sector';
        breakdown.addChild(customSector1);
        breakdown.title = 'abcd';
        const details = breakdown.getModifiedWidgetTitleDetails();
        expect(details).toBe('abcd x ');

        /**
         * Test case for condition when Breakdown in empty
         */
        const breakdown1: Breakdown = new Breakdown();
        breakdown1.title = '';
        const details1 = breakdown1.getModifiedWidgetTitleDetails();
        expect(details1).toBe('');
    });

    /**
     * Test isMacroFactorBreakdown
     */
    it('tests isMacroFactorBreakdown', () => {
        const breakdown: Breakdown = new Breakdown();
        expect(breakdown.isMacroFactorBreakdown()).toBeFalsy();
        breakdown.addChild(new ColumnSector());
        expect(breakdown.isMacroFactorBreakdown()).toBeFalsy();
        (breakdown.children[0] as ColumnSector).columnTag = 'abc';
        const colDefSpy = jest.spyOn(CoreColumnUtils, 'getColumnDefByTagAndUse');
        colDefSpy.mockReturnValue(new ColumnDefinition());
        expect(breakdown.isMacroFactorBreakdown()).toBeFalsy();
        colDefSpy.mockReturnValue(new ColumnDefinition({title: '', isMacroFactor: true}));
        expect(breakdown.isMacroFactorBreakdown()).toBeTruthy();
        breakdown.addChild(new ColumnSector());
        expect(breakdown.isMacroFactorBreakdown()).toBeFalsy();
    });

    it('should test if breakdown is schema breakdown', () => {
        const breakdown: Breakdown = new Breakdown();
        expect(breakdown.isSchemaBreakdown()).toBeFalsy();

        breakdown.addChild(new SchemaSector());
        expect(breakdown.isSchemaBreakdown()).toBeTruthy();
    });

    it('Test hasQuantiles', () => {
        const breakdown: Breakdown = new Breakdown();
        const columnSector = new ColumnSector();
        breakdown.addChild(columnSector);
        const numericSector = new NumericColumnSector();
        numericSector.bucketIntervals = 2;
        columnSector.addChild(numericSector);
        const numericQuantileSector = new NumericColumnSector();
        numericQuantileSector.quantileInfo.numberOfQuantiles = 2;
        numericSector.addChild(numericQuantileSector);
        numericQuantileSector.children = [];
        expect(breakdown.hasQuantiles()).toBeTruthy();
    });

    it('Test getTrackableProperties', () => {
        // Configurable Grouping
        const breakdown = new Breakdown();
        breakdown.isConfigured = true;
        const trackableProperties = breakdown.getTrackableProperties();
        expect(trackableProperties).toBeDefined();
        expect(trackableProperties.columnTag).toEqual('Configured Breakdown');
        // Quick Grouping
        const breakdownQGrouping = new Breakdown();
        breakdownQGrouping.isConfigured = false;
        const columnSector = new ColumnSector();
        columnSector.columnTag = 'sec_type';
        breakdownQGrouping.addChild(columnSector);
        const trackablePropertiesChild = breakdownQGrouping.getTrackableProperties();
        expect(trackablePropertiesChild.columnTag).toEqual('sec_type');
        // No Grouping
        const breakdownNoGrouping = new Breakdown();
        breakdownNoGrouping.isConfigured = false;
        const trackablePropertiesNoGrouping = breakdownNoGrouping.getTrackableProperties();
        expect(trackablePropertiesNoGrouping.columnTag).toEqual('');
    });
});
