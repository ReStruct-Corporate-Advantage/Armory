import {
    ColumnConfig,
    ColumnConstants,
    ColumnDefinition,
    CoreColumnUtils,
    CoreDefinitionStore,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {cloneDeep, isEmpty, isNil, sortBy} from 'lodash';
import {ColumnOptionConstants} from '../constants';
import {ColumnFilter} from '../interfaces';
import {ColumnSet} from '../models/column-set/column-set.model';
import {ColumnSelectorOption} from '../models/ui/column-selector-option.model';
import {AuxContextMenuInterface, AuxGridColumnType} from '@blk/aladdin-angular-components';
import {StyleMeasureColumnOptionModel} from '../models/column-option/style-measure-column-option.model';
import {StyleAnalysisColumnOption} from '../models/column-option/style-analysis-column-option.model';
import {ColDef} from 'ag-grid-community';

// @dynamic
export class LibColumnUtils {
    static COLUMN_SELECTOR_CONTEXT_MENU: AuxContextMenuInterface[] = [{label: 'Clone column'}];

    /**
     * This function is called by each widget settings instance for rendering the column/breakdown selection.
     * @param filters - filter criteria for the columns
     * @param fieldToUse - which fields to put into columnTag
     * @param groupName - group name under which we need to add all the columns i.e. do not consider any other group except it.
     * @param availableOverrideList - report that internally contains list of columns
     * @returns ColumnSelectorOption[] - data consumed by pick-list component
     */
    static makeColumnTree(filters: ColumnFilter[], fieldToUse: string, groupName?: string, availableOverrideList?: ColumnSet, widgetType?: WidgetConfigType, recentColumns?: string[]): ColumnSelectorOption[] {
        const result = LibColumnUtils.getFilteredList(filters, availableOverrideList);
        return LibColumnUtils.prepareColumnTree(result, groupName, widgetType, recentColumns);
    }

    static prepareColumnTree(filteredList: ColumnDefinition[], groupName?: string, widgetType?: WidgetConfigType, recentColumns?: string[]) {
        // The order in which we want to show the top level nodes of available columns.
        // TODO: groupOrder shouldn't be hardcoded
        let groupOrder: string[] = cloneDeep(ColumnOptionConstants.AVAILABLE_TREE_GROUP_ORDER);

        if (WidgetConfigType.PGS === widgetType) {
            groupOrder = LibColumnUtils.prioritizeGroupOrder(groupOrder, ColumnOptionConstants.PORTFOLIO);
        } else if (WidgetConfigType.RETURNS === widgetType) {
            groupOrder = LibColumnUtils.prioritizeGroupOrder(groupOrder, ColumnOptionConstants.PERFORMANCE);
        }

        // Sort the columns is some sort of a useful way.
        filteredList.sort(LibColumnUtils.compareColumns);

        return this.prepareColumnTreeHelper(filteredList, groupOrder, groupName, recentColumns);
    }

    /**
     * prioritize the given group to be at the top in the group order
     */
    static prioritizeGroupOrder(groupOrder: string[], groupToPrioritize: string) {
        const index = groupOrder.indexOf(groupToPrioritize);
        if (index !== -1) {
            const group = groupOrder.splice(index, 1)[0];
            groupOrder.unshift(group);
        }
        return groupOrder;
    }

    private static prepareColumnTreeHelper(filteredList: ColumnDefinition[], groupOrder: string[], groupName?: string, recentColumns?: string[]) {
        const availableTree = this.getAvailableTree(filteredList, groupName);

        // recent used columns
        if (recentColumns?.length > 0) {
            const recentGroup = new ColumnSelectorOption(ColumnOptionConstants.RECENT_COLUMNS, 'recentColumns', [], 'group');
            recentGroup.isExpanded = true;
            const recentColumnsList = filteredList.filter(col => recentColumns.includes(LibColumnUtils.getKeyForRecentColumns(col)));
            if (recentColumnsList.length > 0) {
                recentColumnsList.sort((col1, col2) => recentColumns.indexOf(LibColumnUtils.getKeyForRecentColumns(col1)) - recentColumns.indexOf(LibColumnUtils.getKeyForRecentColumns(col2)));
                recentColumnsList.forEach( column => recentGroup.children.push(new ColumnSelectorOption(column.title, LibColumnUtils.getKeyForRecentColumns(column), null, 'column', column, undefined, !!column.columnDesc?.length)));
                availableTree.push(recentGroup);
                groupOrder.unshift(ColumnOptionConstants.RECENT_COLUMNS);
            }
        }

        // now rearrange the available tree by the predefined order.
        const availableTreeHighestIndex = groupOrder.length;
        return sortBy(availableTree, (a: ColumnSelectorOption) => {
            const groupIndex = groupOrder.indexOf(a.label);
            // If the group is not specified in the groupOrder constant or the option is of type 'column', sort it last
            if (a.type === 'column' || groupIndex < 0) {
                return availableTreeHighestIndex;
            } else {
                return groupIndex;
            }
        });
    }

    static makeFactorColumnTree(factorDefinitions: ColumnDefinition[]) {
        factorDefinitions.sort((colA: ColumnDefinition, colB: ColumnDefinition): number => {
            return colA.title.localeCompare(colB.title) <= 0 ? -1 : 1;
        });

        const groupOrder = [];
        const groupOrderSet = new Set<string>();

        factorDefinitions.filter(col => !isNil(col.groups)).forEach(col => groupOrderSet.add(col.groups[0]));
        groupOrderSet.forEach(val => groupOrder.push(val));
        groupOrder.sort();

        return this.prepareColumnTreeHelper(factorDefinitions, groupOrder);
    }

    static getAvailableTree(filteredList: ColumnDefinition[], groupName?: string) {
        const availableTree = filteredList.reduce((tree: ColumnSelectorOption[], column) => {
            let parentNode: ColumnSelectorOption[];
            const isLearnLink = !!column.columnDesc?.length;

            const nodeData = new ColumnSelectorOption(column.title, column.columnTag + '_' + column.uses, null, 'column', column, undefined, isLearnLink);

            if (groupName && column.groups && column.groups.length > 0 && groupName !== column.groups[0]) {
                // A group name was supplied so if this column does not match that group skip it.
                return tree;
            } else if (!column.groups || !column.groups.length) {
                // Just add the column to the tree object.
                parentNode = tree;
            } else {
                parentNode = LibColumnUtils.makeGroups(column.groups, tree).children;
            }
            parentNode.push(nodeData);

            return tree;
        }, []);
        return availableTree;
    }

    /**
     * This function creates nested structure based on column groups.
     * @param columnGroups - column groups
     * @param tree - object that contains tree based structure consumed later by pick-list
     * @returns ColumnSelectorOption - parent group
     */
    static makeGroups(columnGroups: string[], tree: ColumnSelectorOption[]): ColumnSelectorOption {
        // Make sure the groups for this field all exist and then add the child to the last one.
        return columnGroups.reduce((nextItem: any, group, index, groups) => {
            // Get the groupID by concatenating group names. This is done so groups
            // with the same name don't clash. So, for column Current Ratio, groupID will be 'Company Fundamentals:Ratios:Credit measures'.
            const groupID = groups.slice(0, index + 1).join(':');
            return LibColumnUtils.ensureChild(nextItem.children || nextItem, groupID, group);
        }, tree);
    }

    /**
     * This function creates group tree.
     * @param children - object to check for children
     * @param groupID - group id to check
     * @param group - group name under which we need to add all the columns i.e. do not consider any other group except it
     * @returns ColumnSelectorOption - existing or created group
     */
    static ensureChild(children: any, groupID: string, group: string): ColumnSelectorOption {
        // If the child has already been created then return it.
        for (const child of children) {
            if (child.uid === groupID) {
                return child;
            }
        }

        // Create the child group object and add to the list.
        const childGroup = new ColumnSelectorOption(group, groupID, [], 'group');
        children.push(childGroup);
        return childGroup;
    }

    /**
     * Determines if a column should be removed because it does not match the filter criteria.
     * @returns boolean - true if the column passes, false otherwise
     */
    static doesColumnPassAllFilters(filters: ColumnFilter[], column: ColumnConfig): boolean {
        const columnDef = LibColumnUtils.getColumnDefinition(column);
        // If there are no filters or no column definition, then column is not filtered
        if (!filters || !Array.isArray(filters) || !columnDef) {
            return true;
        }

        // Now filter the columns
        return filters.every((filter) => LibColumnUtils.doesColumnPassFilter(filter, columnDef));
    }

    /**
     * This function will apply the given filters to the list of columns and return the column list that pass the filter criteria
     * @param filters - This is an object that filter criteria. Check widgets.json for examples
     * @param availableOverrideList - list of column overrides
     * @returns ColumnDefinition[] - column list
     */
    static getFilteredList(filters?: ColumnFilter[], availableOverrideList?: ColumnSet): ColumnDefinition[] {
        // If there are no filters supplied then just get out of here with a copy of the columns.
        if (!filters || !Array.isArray(filters)) {
            return CoreDefinitionStore.columns.slice();
        }

        // Now filter the columns
        // If we have an override list ( we have a predefined list of columns which we want to show as available columns, we use that list
        if (availableOverrideList) {
            return CoreDefinitionStore.columns.filter((column) => {
                // Add Columns which are in override list.
                if (
                    availableOverrideList.columns.find((overrideColumn) => {
                        return column.dataType !== 'STRING' && overrideColumn.columnTag === column.columnTag;
                    })
                ) {
                    return true;
                }

                // Reject everything else
                return false;
            });
        } else {
            return CoreDefinitionStore.columns.filter((col) => {
                // Go through the filters 1 at a time and make sure that it passes each one of them.

                for (const filter of filters) {
                    if (!LibColumnUtils.doesColumnPassFilter(filter, col)) {
                        return false;
                    }
                }
                // If we got to here then it must have passed all filters.
                return true;
            });
        }
    }

    /**
     * This is a private function to the column service that is used to filter a column.
     * @param filter - column filter to use
     * @param column - column to be filtered
     */
    static doesColumnPassFilter(filter: ColumnFilter, column: ColumnDefinition): boolean {
        // Grab out the required attributes.
        const key = filter.key;
        const filterType = filter.type;
        let filterValue: string | string[] = filter.value;
        let columnValue = column[key];

        // Check for 'undefined' filter value
        filterValue = filterValue === 'undefined' ? undefined : filterValue;

        // Check if this is a not (!) rule.  If so we need to invert the return value.
        // ! = false otherwise true.
        const matchReturnValue = filterType !== '!=';

        // If the value is undefined then it cannot match the filter.  So return the inverse of the match value.
        // Examples where this is used:
        // - isGroupable = true uses this and if there is no value then we want to return false.
        // - Some columns in PGS do not have any groups, but that rule is a !== to I think we end up returning the right value.
        if (columnValue === undefined && filterValue !== undefined) {
            return !matchReturnValue;
        }

        // If the filter value and column value both are undefined, then return the match value
        if (filterValue === undefined && columnValue === undefined) {
            return matchReturnValue;
        }

        // If neither of the values are an array, then just check the values are equal.
        if (!Array.isArray(filterValue) && !Array.isArray(columnValue)) {
            if (filterValue === columnValue) {
                return matchReturnValue;
            }
            return !matchReturnValue;
        }

        // One of the values is an array so the easiest thing to do here is make them both arrays and then check that
        // one of the items exists in the other array.
        if (!Array.isArray(filterValue)) {
            filterValue = [filterValue];
        }
        if (!Array.isArray(columnValue)) {
            columnValue = [columnValue];
        }

        // Check if one of the filter values exists int he column values.
        for (let i = 0; i < filterValue.length; i++) {
            if (columnValue.indexOf(filterValue[i]) >= 0) {
                return matchReturnValue;
            }
        }
        return !matchReturnValue;
    }

    /**
     * A function that compares two columns for sorting purposes.
     * @param colA - column used for comparison
     * @param colB - column used for comparison
     * @returns number - comparison result
     */
    static compareColumns(colA: ColumnDefinition, colB: ColumnDefinition): number {
        const strippedA = colA.strippedName;
        const strippedB = colB.strippedName;
        let valA: string | number;
        let valB: string | number;
        if (colA.columnTag === colB.columnTag || strippedA === strippedB) {
            // If the column tags are equal then we want the columns to be in Port,Bench,Active order.
            valA = CoreColumnUtils.getUseOrder(colA.uses, colA.title);
            valB = CoreColumnUtils.getUseOrder(colB.uses, colB.title);
        } else {
            // To sort different columns we want to do it based on the stripped titles.
            valA = strippedA;
            valB = strippedB;
        }
        return valA < valB ? -1 : valA === valB ? 0 : 1;
    }

    /**
     * Gets a column definition with the given column's column tag and optionally (if the given column's
     * position type is defined) the same useType as the given column's position type.
     * For more information see {@link #getColumnDefByTagAndOptionallyByUse} method.
     */
    static getColumnDefinition(col: ColumnConfig): ColumnDefinition {
        const checkUseType = !isNil(col.positionColumnType);
        return CoreColumnUtils.getColumnDefByTagAndOptionallyByUse(col.columnTag, col.positionColumnType, checkUseType);
    }

    /**
     * Checks if the column passed in is a Style column
     */
    static isStyleColumn(columnTag: string, positionColumnType?: string): boolean {
        if (positionColumnType && positionColumnType === ColumnConstants.FACTOR_MODEL) {
            return false;
        }
        return !isEmpty(columnTag) && ColumnConstants.STYLE_COLUMN === CoreColumnUtils.getColumnDefByTag(columnTag)?.groups?.[0];
    }

    /**
     * updated the measure mapping column options for style column
     * @param columnTag
     * @param styleAnalysisColumnOption
     * @param widgetConfig
     */
    static updateMeasureMapping(columnTag: string, styleAnalysisColumnOption: StyleAnalysisColumnOption, widgetConfig: any) {
        if (isEmpty(styleAnalysisColumnOption?.measureMapping)) {
            const styleAnalysisConfig = widgetConfig?.styleAnalysis[columnTag];
            if (!isNil(styleAnalysisConfig)) {
                styleAnalysisColumnOption.measureMapping = {};
                styleAnalysisColumnOption.styleMeasureMapping = {};
                styleAnalysisConfig.column.forEach((styleConfig) => {
                    const column: ColumnConfig = new ColumnConfig(styleConfig);
                    column.columnKey = ColumnConfig.generateColumnKey(column.columnTag);
                    styleAnalysisColumnOption.measureMapping[column.columnKey] = column;
                    styleAnalysisColumnOption.styleMeasureMapping[column.columnKey] = new StyleMeasureColumnOptionModel(styleConfig);
                });
            }
        }
    }

    /**
     * returns the unique key for recent columns
     */
    static getKeyForRecentColumns(column: ColumnDefinition) {
        return column?.columnTag + ColumnOptionConstants.UNDERSCORE + column?.uses;
    }

    /**
     * get recent columns for given widget type
     * @param userRecentColumns
     * @param widgetType
     */
    static getRecentColumnsForWidget(userRecentColumns: any, widgetType: string): string[] {
        if (isNil(userRecentColumns)) {
            return;
        }
        switch (widgetType) {
            case WidgetConfigType.PGS :
                return userRecentColumns[ColumnOptionConstants.PGS_COLUMNS];
            case WidgetConfigType.RETURNS :
                return userRecentColumns[ColumnOptionConstants.RETURN_COLUMNS];
            case WidgetConfigType.PRA :
                return userRecentColumns[ColumnOptionConstants.PRA_COLUMNS];
            default :
                return userRecentColumns[ColumnOptionConstants.COMMON_COLUMNS];
        }
    }

    /**
     * set recent columns for given widget type
     * @param userRecentColumns
     * @param widgetRecentColumns
     * @param widgetType
     */
    static setRecentColumnsForWidget(userRecentColumns: any, widgetRecentColumns: string[], widgetType: string) {
        if (isNil(widgetRecentColumns) || isNil(userRecentColumns)) {
            return;
        }
        switch (widgetType) {
            case WidgetConfigType.PGS :
                userRecentColumns[ColumnOptionConstants.PGS_COLUMNS] = widgetRecentColumns;
                break;
            case WidgetConfigType.RETURNS :
                userRecentColumns[ColumnOptionConstants.RETURN_COLUMNS] = widgetRecentColumns;
                break;
            case WidgetConfigType.PRA :
                userRecentColumns[ColumnOptionConstants.PRA_COLUMNS] = widgetRecentColumns;
                break;
            default :
                userRecentColumns[ColumnOptionConstants.COMMON_COLUMNS] = widgetRecentColumns;
        }
    }

    /**
     * Create action column definition
     * @return ColDef
     */
    static getActionColDef(): ColDef {
        return {
            headerName: '',
            field: ColumnConstants.ACTION_COL,
            type: AuxGridColumnType.AUX_ACTION_COLUMN,
            width: 32,
            resizable: false,
            suppressSizeToFit: true,
            sortable: false,
            floatingFilter: false,
            pinned: 'left',
            cellStyle: { 'padding-left': '0.5rem', 'padding-right': '0.5rem'},
        };
    }

    /**
     * returns the count of columns
     */
    static getColumnCount(option: ColumnSelectorOption): number {
        let count = 0;
        if (option.type === 'column' && option.match) {
            count++;
        }
        if (option.children) {
            for (let child of option.children) {
                count += this.getColumnCount(child);
            }
        }
        return count;
    }
}
