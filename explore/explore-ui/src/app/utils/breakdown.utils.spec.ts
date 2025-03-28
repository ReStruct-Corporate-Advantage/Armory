import {BreakdownUtils} from './breakdown.utils';
import {
    Breakdown,
    BreakdownConstants, BreakdownInitializer,
    BreakdownSectorSelectorOption,
    BreakdownSectorSelectorOptionType,
    BreakdownTreeNode,
    ColumnSector,
    CustomSector,
    LinkedFavoriteSector,
    NumericColumnSector,
    SectorConstants, SectorUtils
} from '@blk/explore-ui-breakdown';
import {TestUtils} from '@utils/test.utils';
import {omit} from 'lodash';
import {ColumnSelectorOption, createColumnFilter, LibColumnUtils} from '@blk/explore-ui-column-option';
import {ColumnDefinition, WidgetConfigType} from '@blk/explore-ui-core';

describe('BreakdownUtils', () => {

    it('Test convertBreakdownTreeNodeToModel', () => {
        const breakdownTreeNodeTotal = new BreakdownTreeNode();
        breakdownTreeNodeTotal.label = 'Total';
        breakdownTreeNodeTotal.sectorModel = new Breakdown();
        const breakdownTreeNodeCustomSector = new BreakdownTreeNode();
        breakdownTreeNodeCustomSector.label = 'CustomSector';
        const customSector = new CustomSector();
        customSector.title = 'Custom Sector';
        breakdownTreeNodeCustomSector.sectorModel = customSector;
        const breakdownTreeNodeSecType = new BreakdownTreeNode();
        breakdownTreeNodeSecType.label = 'Security Type';
        const secTypeColumnSector = new ColumnSector();
        secTypeColumnSector.columnName = 'Security Type';
        breakdownTreeNodeSecType.sectorModel = secTypeColumnSector;
        const breakdownTreeNodeSecGroup = new BreakdownTreeNode();
        breakdownTreeNodeSecGroup.label = 'Security Group';
        const secGroupColumnSector = new ColumnSector();
        secGroupColumnSector.columnName = 'Security Type';
        breakdownTreeNodeSecGroup.sectorModel = secGroupColumnSector;
        breakdownTreeNodeTotal.children = [breakdownTreeNodeSecType, breakdownTreeNodeCustomSector];
        breakdownTreeNodeSecType.children = [breakdownTreeNodeSecGroup];
        const expectedBreakdown = new Breakdown();
        expectedBreakdown.children = [secTypeColumnSector, customSector];
        secTypeColumnSector.children = [secGroupColumnSector];
        const sector = BreakdownUtils.convertBreakdownTreeNodeToModel(breakdownTreeNodeTotal);
        expect(sector).toEqual(expectedBreakdown);
    });

    it('Test createRootAndConvertBreakdown', () => {
        const breakdown = new Breakdown();
        const secTypeColumnSector = new ColumnSector();
        secTypeColumnSector.columnName = 'Security Type';
        const customSector = new CustomSector();
        customSector.title = 'Custom Sector';
        const linkedSector = new LinkedFavoriteSector();
        linkedSector.sector = customSector;
        breakdown.children = [secTypeColumnSector, linkedSector];
        const breakdownTreeNodeTotal = new BreakdownTreeNode();
        breakdownTreeNodeTotal.label = 'Total';
        breakdownTreeNodeTotal.isExpanded = true;
        breakdownTreeNodeTotal.parent = undefined;
        breakdownTreeNodeTotal.sectorModel = breakdown;
        breakdownTreeNodeTotal.type = 'root';
        breakdownTreeNodeTotal.enableContextMenu();
        expect(breakdownTreeNodeTotal.contextMenu).toEqual([
            {label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.PASTE, isDisabled: true}
        ]);
        const breakdownTreeNodeCustomSector = new BreakdownTreeNode();
        breakdownTreeNodeCustomSector.label = 'Custom Sector';
        breakdownTreeNodeCustomSector.type = 'custom';
        breakdownTreeNodeCustomSector.isExpanded = true;
        breakdownTreeNodeCustomSector.parent = breakdownTreeNodeTotal;
        breakdownTreeNodeCustomSector.sectorModel = linkedSector;
        breakdownTreeNodeCustomSector.enableContextMenu();
        breakdownTreeNodeCustomSector.isDeletable = true;
        expect(breakdownTreeNodeCustomSector.contextMenu).toEqual([
            {label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.DELETE_NODE},
            {label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.DELETE_NODE_AND_CHILD},
            {label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.COPY_NODE},
            {label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.COPY_NODE_AND_CHILD},
            {label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.PASTE, isDisabled: true}
        ]);
        const breakdownTreeNodeSecType = new BreakdownTreeNode();
        breakdownTreeNodeSecType.label = 'Security Type';
        breakdownTreeNodeSecType.type = 'groupBy';
        breakdownTreeNodeSecType.isExpanded = true;
        breakdownTreeNodeSecType.enableContextMenu();
        breakdownTreeNodeSecType.isDeletable = true;
        breakdownTreeNodeSecType.parent = breakdownTreeNodeTotal;
        breakdownTreeNodeSecType.sectorModel = secTypeColumnSector;
        breakdownTreeNodeTotal.children = [breakdownTreeNodeSecType, breakdownTreeNodeCustomSector];
        const treeData = BreakdownUtils.createRootAndConvertBreakdown(breakdown);
        TestUtils.removeUIDFromAdvanceTreeListNodes([treeData]);
        expect(treeData).toEqual(breakdownTreeNodeTotal);
    });

    it('Test createRootAndConvertBreakdown for preset breakdown', () => {
        const presetBreakdown = new Breakdown();
        presetBreakdown.presetBreakdownId = 'iaa_breakdown';
        presetBreakdown.isConfigured = true;
        presetBreakdown.title = 'IAA Breakdown';

        const rootNode = BreakdownUtils.createRootAndConvertBreakdown(presetBreakdown);
        expect(rootNode.label).toEqual('Total');
        expect(rootNode.type).toEqual('root');
        expect(rootNode.contextMenu).toBeUndefined();
        expect(rootNode.children).toHaveLength(1);
        expect(rootNode.children[0].label).toEqual(presetBreakdown.title);
    });

    it('Test refreshBreakdownNodeData', () => {
        const breakdown = new Breakdown();
        const secTypeColumnSector = new ColumnSector();
        secTypeColumnSector.columnName = 'Security Type';
        const customSector = new CustomSector();
        customSector.title = 'Custom Sector';
        const linkedSector = new LinkedFavoriteSector();
        linkedSector.sector = customSector;
        breakdown.children = [secTypeColumnSector, linkedSector];
        const breakdownTreeNodeTotal = new BreakdownTreeNode();
        breakdownTreeNodeTotal.label = 'Total';
        breakdownTreeNodeTotal.isExpanded = true;
        breakdownTreeNodeTotal.parent = undefined;
        breakdownTreeNodeTotal.sectorModel = breakdown;
        breakdownTreeNodeTotal.type = 'root';
        const breakdownTreeNodeCustomSector = new BreakdownTreeNode();
        breakdownTreeNodeCustomSector.label = 'Custom Sector';
        breakdownTreeNodeCustomSector.type = 'custom';
        breakdownTreeNodeCustomSector.isExpanded = true;
        breakdownTreeNodeCustomSector.parent = breakdownTreeNodeTotal;
        breakdownTreeNodeCustomSector.sectorModel = linkedSector;
        breakdownTreeNodeCustomSector.enableContextMenu();
        breakdownTreeNodeCustomSector.isDeletable = true;

        const breakdownTreeNodeSecType = new BreakdownTreeNode();
        breakdownTreeNodeSecType.label = 'Security Type';
        breakdownTreeNodeSecType.type = 'groupBy';
        breakdownTreeNodeSecType.isExpanded = true;
        breakdownTreeNodeSecType.enableContextMenu();
        breakdownTreeNodeSecType.isDeletable = true;
        breakdownTreeNodeSecType.parent = breakdownTreeNodeTotal;
        breakdownTreeNodeSecType.sectorModel = secTypeColumnSector;
        breakdownTreeNodeTotal.children = [breakdownTreeNodeSecType, breakdownTreeNodeCustomSector];
        const refreshedBreakdownData = BreakdownUtils.refreshBreakdownNodeData(breakdownTreeNodeTotal);
        expect(omit(refreshedBreakdownData, 'children')).toEqual(omit(breakdownTreeNodeTotal, 'children'));
        expect(omit(refreshedBreakdownData.children[0], 'parent')).toEqual(omit(breakdownTreeNodeTotal.children[0], 'parent'));
        expect(omit(refreshedBreakdownData.children[1], 'parent')).toEqual(omit(breakdownTreeNodeTotal.children[1], 'parent'));
    });

    it('Test getNodeWithUID', () => {
        const parentNode = new BreakdownTreeNode();
        parentNode.uid = '345';
        const childNode1 = new BreakdownTreeNode();
        childNode1.uid = '541';
        const childNode2 = new BreakdownTreeNode();
        childNode2.uid = '765';
        parentNode.children = [childNode1, childNode2];
        // Node not found
        expect(BreakdownUtils.getNodeWithUID(parentNode, '987')).toBeUndefined();
        // parent node search
        expect(BreakdownUtils.getNodeWithUID(parentNode, '345')).toEqual(parentNode);
        // child node search
        expect(BreakdownUtils.getNodeWithUID(parentNode, '765')).toEqual(childNode2);
    });

    it('Test createIndividualMeasuresSectorTreeOptions', () => {
        const secTypeColumn = new ColumnDefinition();
        secTypeColumn.title = 'Security Type';
        secTypeColumn.columnTag = 'sec_type';
        const secGroupColumn = new ColumnDefinition();
        secGroupColumn.title = 'Security Group';
        secGroupColumn.columnTag = 'sec_group';
        const secTypeOption = new ColumnSelectorOption('Security Type', undefined, undefined, 'column', secTypeColumn, true);
        const secGroupOption = new ColumnSelectorOption('Security Group', undefined, undefined, 'column', secGroupColumn, false);
        const positionColumnGroup: ColumnSelectorOption = new ColumnSelectorOption('Position', undefined, [secGroupOption, secTypeOption], 'group');
        jest.spyOn(LibColumnUtils, 'makeColumnTree').mockReturnValue(
            [positionColumnGroup]
        );
        const individualMeasuresOptions = BreakdownUtils.createIndividualMeasuresSectorTreeOptions([], 'Test');
        const secTypeSectorOption = new BreakdownSectorSelectorOption('Security Type', undefined, undefined, BreakdownSectorSelectorOptionType.INDIVIDUAL_MEASURES, secTypeColumn, true);
        const secGroupSectorOption = new BreakdownSectorSelectorOption('Security Group', undefined, undefined, BreakdownSectorSelectorOptionType.INDIVIDUAL_MEASURES, secGroupColumn, false);
        const positionColumnGroupSectorOption = new BreakdownSectorSelectorOption('Position', undefined, [secGroupSectorOption, secTypeSectorOption], BreakdownSectorSelectorOptionType.GROUP);
        secTypeSectorOption.parent = positionColumnGroupSectorOption;
        secGroupSectorOption.parent = positionColumnGroupSectorOption;
        expect(individualMeasuresOptions).toEqual([positionColumnGroupSectorOption, BreakdownUtils.MANDATE_DEFAULT_BKD_OPTION]);
    });

    it('Test createIndividualMeasuresSectorTreeOptions - Default Breakdown', () => {
        jest.spyOn(LibColumnUtils, 'makeColumnTree').mockReturnValue([]);
        const individualMeasuresOptions = BreakdownUtils.createIndividualMeasuresSectorTreeOptions([], 'Test');
        expect(individualMeasuresOptions).toEqual([BreakdownUtils.MANDATE_DEFAULT_BKD_OPTION]);
    });

    it('Test createIndividualMeasuresSectorTreeOptions - User specifed Schema', () => {
        jest.spyOn(LibColumnUtils, 'makeColumnTree').mockReturnValue([]);
        const individualMeasuresOptions = BreakdownUtils.createIndividualMeasuresSectorTreeOptions([], 'Test', true);
        expect(individualMeasuresOptions[0].uid).toEqual('mandate_default');
        expect(individualMeasuresOptions[1].uid).toEqual('factor_space_user_schema');
    });

    describe('Test createCommonHierarchiesSectorTreeOptions', () => {

        it('includePerformanceBreakdown = false', () => {
            const secTypeColumn = new ColumnDefinition();
            secTypeColumn.title = 'Security Type';
            secTypeColumn.columnTag = 'sec_type';
            const secTypeOption = new ColumnSelectorOption('Security Type', undefined, undefined, 'column', secTypeColumn, true);
            const positionColumnGroup: ColumnSelectorOption = new ColumnSelectorOption('Position', undefined, [secTypeOption], 'group');
            jest.clearAllMocks();
            jest.spyOn(LibColumnUtils, 'makeColumnTree').mockReturnValue(
                [positionColumnGroup]
            );
            const commonHierarchiesSectorTreeOptions = BreakdownUtils.createCommonHierarchiesSectorTreeOptions([], 'Test', false);
            const secTypeSectorOption = new BreakdownSectorSelectorOption('Security Type', undefined, undefined, BreakdownSectorSelectorOptionType.COMMON_HIERARCHIES, secTypeColumn, true);
            const positionColumnGroupSectorOption = new BreakdownSectorSelectorOption('Standard Breakdown', undefined, [secTypeSectorOption], BreakdownSectorSelectorOptionType.GROUP);
            secTypeSectorOption.parent = positionColumnGroupSectorOption;
            expect(commonHierarchiesSectorTreeOptions).toEqual([positionColumnGroupSectorOption]);
            expect(LibColumnUtils.makeColumnTree).toHaveBeenCalledTimes(1);
            expect(LibColumnUtils.makeColumnTree).toHaveBeenCalledWith([createColumnFilter('columnType', '=', 'GR_SECTOR'), createColumnFilter('praadaBreakdown', '!=', true)], 'Test');
        });

        it('includePerformanceBreakdown = true', () => {
            const secTypeColumn = new ColumnDefinition();
            secTypeColumn.title = 'Security Type';
            secTypeColumn.columnTag = 'sec_type';
            const perfColumn = new ColumnDefinition();
            perfColumn.title = 'Performance';
            perfColumn.columnTag = 'perf';
            const secTypeOption = new ColumnSelectorOption('Security Type', undefined, undefined, 'column', secTypeColumn, true);
            const perfOption = new ColumnSelectorOption('Performance', undefined, undefined, 'column', perfColumn, true);
            const perfOptionGroup = new ColumnSelectorOption('Performance Group', undefined, [perfOption], 'group',);
            const positionColumnGroup: ColumnSelectorOption = new ColumnSelectorOption('Position', undefined, [secTypeOption], 'group');
            jest.clearAllMocks();
            jest.spyOn(LibColumnUtils, 'makeColumnTree').mockReturnValueOnce(
                [positionColumnGroup]
            );
            jest.spyOn(LibColumnUtils, 'makeColumnTree').mockReturnValueOnce(
                [perfOptionGroup]
            );
            const commonHierarchiesSectorTreeOptions = BreakdownUtils.createCommonHierarchiesSectorTreeOptions([], 'Test', true);
            const secTypeSectorOption = new BreakdownSectorSelectorOption('Security Type', undefined, undefined, BreakdownSectorSelectorOptionType.COMMON_HIERARCHIES, secTypeColumn, true);
            const perfSectorOption = new BreakdownSectorSelectorOption('Performance', undefined, undefined, BreakdownSectorSelectorOptionType.COMMON_HIERARCHIES, perfColumn, true);
            const positionColumnGroupSectorOption = new BreakdownSectorSelectorOption('Standard Breakdown', undefined, [secTypeSectorOption], BreakdownSectorSelectorOptionType.GROUP);
            const perfColumnGroupSectorOption = new BreakdownSectorSelectorOption(BreakdownConstants.BREAKDOWN_TYPE.PERFORMANCE_BREAKDOWN, undefined, [perfSectorOption], BreakdownSectorSelectorOptionType.GROUP);
            perfSectorOption.parent = perfColumnGroupSectorOption;
            secTypeSectorOption.parent = positionColumnGroupSectorOption;
            expect(commonHierarchiesSectorTreeOptions).toEqual([positionColumnGroupSectorOption, perfColumnGroupSectorOption]);
            expect(LibColumnUtils.makeColumnTree).toHaveBeenCalledTimes(2);
        });
    });

    it('test convertPlaceholderBreakdownToNode PresetBreakdown', () => {
        const presetBreakdown = new Breakdown();
        presetBreakdown.presetBreakdownId = 'iaa_breakdown';
        presetBreakdown.isConfigured = true;
        presetBreakdown.title = 'IAA Breakdown';

        const parentNode = new BreakdownTreeNode();

        const presetBreakdownNode = BreakdownUtils.convertPlaceholderBreakdownToNode(presetBreakdown, parentNode);
        expect(presetBreakdownNode.type).toEqual(BreakdownTreeNode.TYPE_PLACEHOLDER);
        expect(presetBreakdownNode.label).toEqual(presetBreakdown.title);
        expect(presetBreakdownNode.isDeletable).toEqual(true);
        expect(presetBreakdownNode.parent).toEqual(parentNode);
    });

    it('Test isInvalidQuantileBreakdownForWidgetType', () => {
        expect(BreakdownUtils.isInvalidQuantileBreakdownForWidgetType(null, null)).toBeFalsy();
        const breakdown = new Breakdown();
        expect(BreakdownUtils.isInvalidQuantileBreakdownForWidgetType(breakdown, null)).toBeFalsy();
        const numericSector = new NumericColumnSector();
        numericSector.children = [];
        numericSector.bucketIntervals = 2;
        breakdown.addChild(numericSector);
        expect(BreakdownUtils.isInvalidQuantileBreakdownForWidgetType(breakdown, null)).toBeFalsy();
        expect(BreakdownUtils.isInvalidQuantileBreakdownForWidgetType(breakdown, WidgetConfigType.RISK_EXPOSURE)).toBeFalsy();
        numericSector.bucketIntervals = 0;
        numericSector.quantileInfo.numberOfQuantiles = 2;
        expect(BreakdownUtils.isInvalidQuantileBreakdownForWidgetType(breakdown, WidgetConfigType.RISK_EXPOSURE)).toBeFalsy();
        // Test with RA quantile but RE widget should be invalid
        numericSector.quantileInfo.quantileBasedOn = SectorConstants.QUANTILE_BASED_ON.PORTFOLIO;
        expect(BreakdownUtils.isInvalidQuantileBreakdownForWidgetType(breakdown, WidgetConfigType.RISK_EXPOSURE)).toBeTruthy();
        // RA quantile with RA widget is valid (false)
        expect(BreakdownUtils.isInvalidQuantileBreakdownForWidgetType(breakdown, WidgetConfigType.RETURNS)).toBeFalsy();
        numericSector.quantileInfo.quantileBasedOn = SectorConstants.QUANTILE_BASED_ON.NUMBER_OF_SECURITIES;
        // RE quantile with RA widget should be invalid
        expect(BreakdownUtils.isInvalidQuantileBreakdownForWidgetType(breakdown, WidgetConfigType.RETURNS)).toBeTruthy();
    });

    it('Test getColumnLevelInBreakdown', () => {
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();

        const newBreakdown: Breakdown = new Breakdown();
        SectorUtils.deserializeChildren(newBreakdown, {
            "isConfigured": true,
            "breakdownTitle": "<Untitled>",
            "subSectors": [{
                "breakdownRuleType": "String",
                "groupByColumn": {
                    "columnName": "Strategy Level 1",
                    "columnTag": "strat_level_1",
                    "dataType": "STRING",
                    "positionColumnType": "ALL"
                },
                "subSectors": [{
                    "breakdownRuleType": "String",
                    "groupByColumn": {
                        "columnName": "Portfolio Name",
                        "columnTag": "portfolio_name",
                        "dataType": "STRING",
                        "positionColumnType": "ALL"
                    },
                    "useNoneBuckets": true
                }
                ],
                "useNoneBuckets": true
            }
            ]
        });

        expect(BreakdownUtils.getColumnLevelInBreakdown(newBreakdown.children, 'portfolio_name', 0)).toBe(1);

        expect(BreakdownUtils.getColumnLevelInBreakdown(newBreakdown.children, 'portfolio_qwerty', 0)).toBe(-1);
    });
});
