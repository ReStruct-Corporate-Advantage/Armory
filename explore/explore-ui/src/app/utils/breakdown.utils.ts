import {CommonUtils, WidgetConfigType} from '@blk/explore-ui-core';
import {
    Breakdown,
    BreakdownConstants,
    BreakdownSectorSelectorOption,
    BreakdownSectorSelectorOptionType,
    BreakdownTreeNode,
    ColumnSector,
    CustomSector,
    LinkedFavoriteSector,
    NumericColumnSector,
    Sector,
    SectorConstants
} from '@blk/explore-ui-breakdown';
import {isEmpty, some} from 'lodash';
import {ColumnFilter, ColumnSelectorOption, createColumnFilter, LibColumnUtils} from '@blk/explore-ui-column-option';

export class BreakdownUtils {

    /**
     * 'Default Breakdown' option for breakdown selector
     */
    static MANDATE_DEFAULT_BKD_OPTION = new BreakdownSectorSelectorOption(BreakdownConstants.MANDATE_DEFAULT_BREAKDOWN_TITLE,
        'mandate_default',
        undefined,
        BreakdownSectorSelectorOptionType.INDIVIDUAL_MEASURES
    );

    static FACTOR_SPACE_USER_SCHEMA = new BreakdownSectorSelectorOption(BreakdownConstants.FACTOR_SPACE_USER_SPECIFIED_SCHEMA_TITLE,
        'factor_space_user_schema',
        undefined,
        BreakdownSectorSelectorOptionType.INDIVIDUAL_MEASURES
    );

    /**
     * Create sector selections for Individual Measures
     */
    static createIndividualMeasuresSectorTreeOptions(groupByFilter: ColumnFilter[], fieldToUse: string, showSchemaOption?: boolean): BreakdownSectorSelectorOption[] {
        const options: BreakdownSectorSelectorOption[] = LibColumnUtils.makeColumnTree(groupByFilter, fieldToUse).map(
            (option) => {
                return BreakdownSectorSelectorOption.createBreakdownSectorSelectorOption(option, BreakdownSectorSelectorOptionType.INDIVIDUAL_MEASURES);
            });
        options.push(BreakdownUtils.MANDATE_DEFAULT_BKD_OPTION);

        if (showSchemaOption) {
            options.push(BreakdownUtils.FACTOR_SPACE_USER_SCHEMA);
        }
        return options;
    }

    /**
     * Create sector selections for Common Hierarchies
     */
    static createCommonHierarchiesSectorTreeOptions(groupByFilter: ColumnFilter[], fieldToUse: string, includePerformanceBreakdown: boolean): BreakdownSectorSelectorOption[] {
        const gpColumnTree: ColumnSelectorOption[] = LibColumnUtils.makeColumnTree([createColumnFilter('columnType', '=', 'GR_SECTOR'), createColumnFilter('praadaBreakdown', '!=', true)], fieldToUse);
        gpColumnTree[0].label = 'Standard Breakdown';
        if (includePerformanceBreakdown) {
            const praadaColumnTree: ColumnSelectorOption[] = LibColumnUtils.makeColumnTree([createColumnFilter('praadaBreakdown', '=', true)], fieldToUse);
            if (praadaColumnTree && praadaColumnTree[0]) {
                praadaColumnTree[0].label = BreakdownConstants.BREAKDOWN_TYPE.PERFORMANCE_BREAKDOWN;
                gpColumnTree.push(praadaColumnTree[0]);
            }
        }
        return gpColumnTree.map((option) => {
            return BreakdownSectorSelectorOption.createBreakdownSectorSelectorOption(option, BreakdownSectorSelectorOptionType.COMMON_HIERARCHIES);
        });
    }

    /**
     * Recursively reconstruct a breakdown model from the Breakdown Tree Node
     */
    static convertBreakdownTreeNodeToModel(breakdown: BreakdownTreeNode, originalModel?: Sector): Sector {
        // Get the original model
        const sectorModel = originalModel ? originalModel : breakdown.sectorModel;
        // Clear out any of the children
        sectorModel.children = [];
        // Populate any of the children
        if (!isEmpty(breakdown.children)) {
            breakdown.children.forEach((child: BreakdownTreeNode) => {
                const childSectorModel = BreakdownUtils.convertBreakdownTreeNodeToModel(child);
                childSectorModel.parent = sectorModel;
                sectorModel.children.push(childSectorModel);
            });
        }
        return sectorModel;
    }

    /**
     * Convert the root breakdown and call a method to recursively reconstruct a breakdown tree node object
     */
    static createRootAndConvertBreakdown(breakdown: Breakdown): BreakdownTreeNode {
        const rootNode = new BreakdownTreeNode();
        rootNode.label = 'Total';
        rootNode.type = BreakdownTreeNode.TYPE_ROOT;
        rootNode.isExpanded = true;
        if (!breakdown?.isPlaceholderBreakdown()) {
            rootNode.enableContextMenu();
        }
        rootNode.uid = CommonUtils.generateUniqueIdAsString();
        rootNode.sectorModel = breakdown ? breakdown : new Breakdown();
        if (breakdown?.isPlaceholderBreakdown()) {
            // placeholder breakdown selected (mandate default breakdown or portfolio-specific breakdown)
            rootNode.children = [BreakdownUtils.convertPlaceholderBreakdownToNode(breakdown, rootNode)];
        } else if (!isEmpty(breakdown?.children)) {
            rootNode.children = [];
            breakdown.children.forEach((sector: Sector) => {
                rootNode.children.push(BreakdownUtils.convertBreakdown(sector, rootNode));
                sector.parent = rootNode.sectorModel;
            });
        }
        return rootNode;
    }

    /**
     * Method to recreate breakdown tree data. It is done to reinitialize breakdown tree.
     */
    static refreshBreakdownNodeData(rootNode: BreakdownTreeNode, changeUid: boolean = false): BreakdownTreeNode {
        const sectorNode = new BreakdownTreeNode();
        sectorNode.label = rootNode.label;
        sectorNode.type = rootNode.type;
        sectorNode.contextMenu = rootNode.contextMenu;
        sectorNode.isDeletable = rootNode.isDeletable;
        sectorNode.isExpanded = rootNode.isExpanded;
        sectorNode.isSelected = rootNode.isSelected;
        sectorNode.sectorModel = rootNode.sectorModel;
        sectorNode.uid = rootNode.uid;
        if (changeUid) {
            sectorNode.uid = CommonUtils.generateUniqueIdAsString();
        }
        if (!isEmpty(rootNode.children)) {
            sectorNode.children = [];
            rootNode.children.forEach((childNode: BreakdownTreeNode) => {
                sectorNode.children.push(BreakdownUtils.refreshBreakdownNodeData(childNode, changeUid));
                childNode.parent = sectorNode;
            });
        }
        return sectorNode;
    }

    /**
     * Recursively convert a breakdown tree into a breakdown tree node object
     */
    static convertBreakdown(sector: Sector, parent: BreakdownTreeNode): BreakdownTreeNode {
        // Create the sector Node. This class will contain a reference to the proper Sector model
        const sectorNode = new BreakdownTreeNode();
        sectorNode.uid = CommonUtils.generateUniqueIdAsString();
        sectorNode.isDeletable = true;
        sectorNode.enableContextMenu();
        if (sector instanceof LinkedFavoriteSector) {
            if (sector.sector instanceof CustomSector) {
                sectorNode.label = sector.getTitle();
                sectorNode.type = 'custom';
            }
            // TODO: Handle nested breakdowns
        } else {
            sectorNode.type = 'groupBy';
            sectorNode.label = sector.getTitle();
        }
        sectorNode.isExpanded = true;
        sectorNode.parent = parent;
        sectorNode.sectorModel = sector;
        if (!isEmpty(sector.children)) {
            sectorNode.children = [];
            sector.children.forEach((subSector: Sector) => {
                sectorNode.children.push(BreakdownUtils.convertBreakdown(subSector, sectorNode));
                subSector.parent = sector;
            });
        }
        return sectorNode;
    }

    /**
     * Creates a tree node for a placeholder breakdown - mandate default breakdown or portfolio-specific breakdown (ex. IAA Breakdown)
     */
    static convertPlaceholderBreakdownToNode(presetBreakdown: Breakdown, parent: BreakdownTreeNode): BreakdownTreeNode {
        const presetBreakdownNode = new BreakdownTreeNode();
        presetBreakdownNode.uid = CommonUtils.generateUniqueIdAsString();
        presetBreakdownNode.isDeletable = true;
        presetBreakdownNode.type = BreakdownTreeNode.TYPE_PLACEHOLDER;
        presetBreakdownNode.label = presetBreakdown.title;
        presetBreakdownNode.isExpanded = true;
        presetBreakdownNode.parent = parent;
        presetBreakdownNode.enableContextMenu();
        return presetBreakdownNode;
    }

    /**
     *  Method to return reference of node with provided id
     */
    static getNodeWithUID(breakdownTreeNode: BreakdownTreeNode, uid: string): BreakdownTreeNode {
        if (breakdownTreeNode && breakdownTreeNode.uid === uid) {
            return breakdownTreeNode;
        }
        if (!isEmpty(breakdownTreeNode.children)) {
            for (const childNode of breakdownTreeNode.children) {
                const nodeFound = BreakdownUtils.getNodeWithUID(childNode, uid);
                if (nodeFound) {
                    return nodeFound;
                }
            }
        }
        return undefined;
    }

    /**
     * picks up the first occurrence of passed column tag and returns the level in passed breakdown children
     */
    static getColumnLevelInBreakdown(children: Sector[], columnTag: string, iterationLevel: number): number {
        if (isEmpty(children)) {
            return -1;
        }

        for (const child of children) {
            if (!(child instanceof ColumnSector)) {
                console.warn('The method currently does not support child sectors other than column sector. Returning....');
                continue;
            }

            if (child.columnTag === columnTag) {
                return iterationLevel;
            }

            return BreakdownUtils.getColumnLevelInBreakdown(child.children, columnTag, iterationLevel + 1);
        }
    }

    /**
     * Checks if the breakdown has a quantile sector configured from Returns widget (quantileBasedOn == PORT or BENCH)
     */
    static isInvalidQuantileBreakdownForWidgetType(breakdown: Breakdown, widgetType: string): boolean {
        if (!breakdown || breakdown.isEmpty() || !widgetType) {
            return false;
        }
        // Check if the breakdown even has quantiles
        const quantiles: NumericColumnSector[] = [];
        for (const childSector of breakdown.children) {
            Breakdown.getQuantileSectors(childSector, quantiles);
        }

        // If we didn't get any quantiles, just return false
        if (isEmpty(quantiles)) {
            return false;
        }

        // It's a returns quantile if the quantileBasedOn is set to PORT or BENCH
        const isReturnsQuantiles = some(quantiles, (quantile) => quantile.quantileInfo.quantileBasedOn === SectorConstants.QUANTILE_BASED_ON.PORTFOLIO || quantile.quantileInfo.quantileBasedOn === SectorConstants.QUANTILE_BASED_ON.BENCHMARK);

        // If the widget is not Return Analysis and the quantiles are configured for Returns
        // OR
        // If the widget is Return Analysis and the quantiles are NOT configured for Returns
        // return true
        return (widgetType !== WidgetConfigType.RETURNS && isReturnsQuantiles) || (widgetType === WidgetConfigType.RETURNS && !isReturnsQuantiles);
    }

    /**
     * Check if the given breakdown has any custom sectors.
     * @param breakdown - The breakdown to check for custom sectors.
     * @returns boolean - True if the breakdown has custom sectors, false otherwise.
     */
    static hasCustomSector(breakdown: Sector): boolean {
        // If there are no children, return false
        if (!breakdown.children?.length) {
            return false;
        }

        // If any child is an instance of LinkedFavoriteSector, return true
        if (breakdown.children.some(child => child instanceof LinkedFavoriteSector)) {
            return true;
        }

        // Recursively check each child for custom sectors
        for (const child of breakdown.children) {
            if (BreakdownUtils.hasCustomSector(child)) {
                return true;
            }
        }

        // Return false if no custom sectors are found
        return false;
    }
}
