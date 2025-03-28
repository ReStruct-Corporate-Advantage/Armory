import {isEmpty} from 'lodash';
import {ColumnConfig} from '@blk/explore-ui-core';
import {Breakdown, ColumnBreakdown, ColumnSector, MultiManagerBreakdownModel, Sector} from '@blk/explore-ui-breakdown';
import {DefinitionsStore} from '@stores/definitions.store';
import {MultiManagerConstants} from '@constants/multi-manager.constants';

/**
 * Utility class for multi-manager related operations.
 */
export class MultiManagerUtils {
    /**
     * Checks if the decision bench config is valid.
     * @param decisionBenchMap - Map of decision bench configurations.
     * @param allSectorPaths - List of all sector paths.
     * @returns boolean - True if the config is valid, otherwise false.
     */
    static isValidDecisionBenchConfig(decisionBenchMap: Map<string, string>, allSectorPaths: string[]): boolean {
        if (isEmpty(decisionBenchMap)) {
            return true;
        }
        // Check if all sector paths are present in decisionBenchMap (We are only comparing the size because the order of the keys in the map is not maintained)
        return decisionBenchMap.size === allSectorPaths.length;
    }

    /**
     * Checks if a column contains multi-manager options.
     * @param column - Column configuration.
     * @returns boolean - True if the column contains multi-manager options, otherwise false.
     */
    static columnContainsMultiManagerOptions(column: ColumnConfig): boolean {
        for (const option of column.optionValues) {
            if (option instanceof ColumnBreakdown && !this.isMMDecompositionDisabled(option.multiManagerData)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if multi-manager decomposition is enabled.
     * @param multiManagerData - Multi-manager breakdown model.
     * @returns boolean - True if decomposition is enabled, otherwise false.
     */
    static isMMDecompositionDisabled(multiManagerData: MultiManagerBreakdownModel): boolean {
        return isEmpty(multiManagerData) || multiManagerData?.decompositionMode === 'none';
    }

    /**
     * Validates the multi-manager breakdown.
     * @param widgetBreakdown - Breakdown configuration.
     * @returns boolean - True if the breakdown is valid, otherwise false.
     */
    static isValidMMBreakdown(widgetBreakdown: Breakdown): boolean {
        const portAttributeColTags: string[] = DefinitionsStore.topDownEligibleCols?.filter(topDownColDef => topDownColDef !== 'portfolio_tree');
        // If no breakdown is selected, return false
        if (isEmpty(widgetBreakdown.children)) {
            return false;
        }

        if(!this.isBreakdownSectorTypeCompatible(widgetBreakdown.children)) {
            return false;
        }

        const firstChild = widgetBreakdown.children[0] as ColumnSector;
        if (firstChild.columnTag === MultiManagerConstants.PORTFOLIO_TREE) {
            return isEmpty(firstChild.children);
        }

        return this.areValidMMBreakdownColumns(widgetBreakdown, portAttributeColTags);
    }

    /**
     * Validates the columns in the multi-manager breakdown.
     * @param widgetBreakdown - Breakdown configuration.
     * @param topDownColDefs - List of top-down column definitions.
     * @returns boolean - True if the columns are valid, otherwise false.
     */
    private static areValidMMBreakdownColumns(widgetBreakdown: Breakdown, topDownColDefs: string[]): boolean {
        if (!this.isBreakdownSectorTypeCompatible(widgetBreakdown.children)) {
            return false;
        }

        if (!topDownColDefs.includes((widgetBreakdown.children[0] as ColumnSector).columnTag)) {
            return false;
        }

        return !((widgetBreakdown.children[0] as ColumnSector).children && !this.areValidMMBreakdownColumns({children: widgetBreakdown.children[0].children} as Breakdown, topDownColDefs));
    }

    /**
     * Compares the children of two sectors.
     * @param decisionBenchBreakdownTree - Array of sectors from the decision bench breakdown tree.
     * @param widgetBreakdown - Array of sectors from the widget breakdown.
     * @returns boolean - True if the children are equal, otherwise false.
     */
    static compareChildren(decisionBenchBreakdownTree: Sector[], widgetBreakdown: Sector[]): boolean {
        if (isEmpty(decisionBenchBreakdownTree) || isEmpty(widgetBreakdown)) {
            return isEmpty(decisionBenchBreakdownTree) && isEmpty(widgetBreakdown);
        }

        if (!this.isBreakdownSectorTypeCompatible(widgetBreakdown) || !this.isBreakdownSectorTypeCompatible(decisionBenchBreakdownTree)) {
            return false;
        }

        if (decisionBenchBreakdownTree.length !== widgetBreakdown.length) {
            return false;
        }

        if ((decisionBenchBreakdownTree[0] as ColumnSector).columnTag !== (widgetBreakdown[0] as ColumnSector).columnTag) {
            return false;
        }

        return this.compareChildren(decisionBenchBreakdownTree[0].children , widgetBreakdown[0].children);
    }

    /**
     * Checks if the breakdown sector type is compatible.
     * @param breakdown - Array of sectors.
     * @returns boolean - True if the breakdown sector type is compatible, otherwise false.
     */
    private static isBreakdownSectorTypeCompatible(breakdown: Sector[]) {
        return breakdown.length === 1 && (breakdown[0] instanceof ColumnSector);
    }
}
