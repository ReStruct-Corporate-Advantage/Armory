import {cloneDeep, each, find, isEmpty, isNil, isUndefined, some} from 'lodash';
import {CoreDefinitionStore} from '../definition/core-definition.store';
import {ColumnDefinition} from '../definition/models/column-definition.model';
import {ConfigTypeFactory} from '../favorite/factories';
import {CoreColumnConstants} from '../core/constants';
import {PositionType} from '../core/enums';
import {CoreConfigUtils} from '../core/utils';
import {ColumnConstants} from './constants/column.constants';
import {IShareDefinitionWrapper} from '../definition/models/ishare-definition-wrapper.model';
import {NumericColumnFormat} from '../definition/models/column-format/numeric-column-format.model';
import {ColumnConfig} from './models/column-config/column-config.model';
import {FactorModelColumnDefinition} from '../definition/models/factor-model-column-definition.model';

// @dynamic
export class CoreColumnUtils {

    /**
     * Convert column definitions received from backend into appropriate models
     */
    static createColumnDefinitions(data: any): void {
        const cols = data.ColumnDefinitions;
        // init empty constraints; because we do not get optimization constraint from BE separately.
        // Now everything is present in the column definitions
        if (isNil(data.optimizationConstraints)) {
            data.optimizationConstraints = [];
        }
        CoreDefinitionStore.columns = [];
        CoreDefinitionStore.columnTagColumnsPairs = new Map<string, ColumnDefinition[]>();
        each(cols, function (col: any) {
            // Check if configType exists, if not, set it as ColumnDefinitionBean
            let colConfigType: string = col.configType;
            if (!colConfigType) {
                colConfigType = CoreColumnConstants.COL_DEF_BEAN;
            }
            const colDef: ColumnDefinition = ConfigTypeFactory.createConfig(col, colConfigType);
            CoreDefinitionStore.columns.push(colDef);

            CoreColumnUtils.createColumnMapping(colDef.columnTag, CoreDefinitionStore.columnTagColumnsPairs, colDef);

            if (colDef.aliasTags && colDef.aliasTags.length > 0) {
                colDef.aliasTags.forEach(aliasTag =>
                    CoreColumnUtils.createColumnMapping(aliasTag, CoreDefinitionStore.aliasTagColumnsPairs, colDef)
                );
            }

            if (col.constraintType) {
                data.optimizationConstraints.push(col);
            }
        });
    }

    static createColumnMapping(tag: string, columnsPairs: Map<string, ColumnDefinition[]>, colDef: ColumnDefinition) {
        let columns = columnsPairs.get(tag);
        if (isUndefined(columns)) {
            columns = [];
            columnsPairs.set(tag, columns);
        }
        columns.push(colDef);
    }

    /**
     * This method is used to parse the incoming response object of ishare definitions and create
     * array of Ishare definition objects.
     */
    static createIShareDefinitions(data: any): void {
        const iShareDefs = data.iSharesDefinitions;
        each(iShareDefs, function (iShareDef: any) {
            const iShareDefinitionWrapper: IShareDefinitionWrapper = ConfigTypeFactory.createConfig(iShareDef, CoreColumnConstants.ISHARE_DEF_BEAN);
            Array.prototype.push.apply(CoreDefinitionStore.iSharesDefinitions, iShareDefinitionWrapper.iShareDefinitions);
        });
    }

    /**
     * @return a given column tag which has whitespaces replaced with our replacement string for a whitespace.
     */
    static replaceWhitespaceInColumnTag(columnTag: string): string {
        if (isNil(columnTag) || isEmpty(columnTag) || columnTag.indexOf(' ') === -1) {
            // No whitespace replacement to be done for the given column tag
            return columnTag;
        }

        // Replace whitespace using regular expression's global replace
        return columnTag.replace(new RegExp('\\s', 'g'), '_space_');
    }

    /**
     * Get column by column tag or alias Tag.. This would be used for columns where use type is not present in the col def like performance and risk columns
     */
    static getColumnDefByTag(tag: string): ColumnDefinition {
        // check on the basis of colTag
        let column: ColumnDefinition = CoreColumnUtils.getColumnDefFromStore(CoreDefinitionStore.columnTagColumnsPairs, tag);

        // if no col def found, check on the basis of tag in aliasTagColumnPairs
        if (!column) {
            column = this.getColumnBasedOnAliasTag(tag);
        }

        // if no col def found return null
        if (!column) {
            console.error('Could not find column (tag:' + tag + ')');
            return null;
        }
        return column;
    }

    private static getColumnBasedOnAliasTag(tag: string) {
        return CoreColumnUtils.getColumnDefFromStore(CoreDefinitionStore.aliasTagColumnsPairs, tag);
    }

    static getColumnDefFromStore(columnpairs: Map<string, ColumnDefinition[]>, tag: string): ColumnDefinition {
        const columns: ColumnDefinition[] = columnpairs.get(tag);
        if (columns && columns.length > 0) {
            // returning a copy here because we do not want to make changes in ColumnService.columns
            return cloneDeep(columns[0]);
        }
        return null;
    }

    static getColumnDefByTagAndUse(colTag: string, positionColumnType: string): ColumnDefinition {
        return CoreColumnUtils.getColumnDefByTagAndOptionallyByUse(colTag, positionColumnType, true);
    }

    /**
     * Searches for the column definitions with the given column tag / alias tag and:
     * - If none found, it returns null
     * - Else If there is only one such column definition (e.g. performance column "bench_total_ret"), it returns this
     * column definition to the caller
     * - Otherwise (when there is more than one column definition found)
     *    -- If the caller does not want to check the use type (the caller passed false for checkUseType parameter),
     *      it returns any column definition from the found column definitions.
     *      E.g. if the caller asked for market_val and asked not to check for the use type, it randomly returns one
     *      of the three market_val columns. In other words it returns PORT, BENCH or ACTIVE column definition, randomly.
     *    -- Otherwise (when the caller wants to check the use type (the caller passed true for checkUseType parameter)),
     *       it looks for the column definition in the found column definitions that has the same use type as the given
     *       by the caller useType:
     *         If it finds such column definition, it returns this column definition to the caller.
     *         Otherwise it returns null.
     *
     * @param tag - column/alias tag
     * @param useType - position column type
     * @param checkUseType true - to get the column with not only the given column tag, but also with the given useType;
     *                     false - to get any column with the given column tag
     */
    static getColumnDefByTagAndOptionallyByUse(tag: string, useType: string, checkUseType: boolean): ColumnDefinition {
        if (useType === ColumnConstants.FACTOR_MODEL) {
            return this.createFactorColumnDefinition(tag);
        }

        // Get columns that have given column tag or alias Tag
        let columnsWithTheSameTag = CoreDefinitionStore.columnTagColumnsPairs.get(tag);
        if (isNil(columnsWithTheSameTag) || columnsWithTheSameTag.length === 0) {
            columnsWithTheSameTag =  CoreDefinitionStore.aliasTagColumnsPairs.get(tag);
        }
        if (isNil(columnsWithTheSameTag) || columnsWithTheSameTag.length === 0) {
            return null;
        }

        let column;
        if (columnsWithTheSameTag.length === 1 || checkUseType === false || isNil(checkUseType)) {
            // Found one column only or the caller does not want to check on the use type.
            // Get the first column definition in the found column definitions.
            column = columnsWithTheSameTag[0];
        } else {
            // Find a column with the matching useType
            column = find(columnsWithTheSameTag, {uses: useType});
        }

        if (isUndefined(column)) {
            //  Could not find a matching column
            column = null;
            console.error('Could not find column (colTag:' + tag + ' use:' + useType + ')');
        } else {
            // returning a copy here because we do not want to make changes in the original column
            column = cloneDeep(column);
        }

        return column;
    }

    /**
     * Create Column Definition for Factor Model Column
     * @param colTag Factor column tag
     * @return ColumnDefinition
     */
    public static createFactorColumnDefinition(colTag: string): FactorModelColumnDefinition {
        const colDef = new FactorModelColumnDefinition();
        colDef.columnTag = colTag;
        colDef.title = '';
        colDef.uses = ColumnConstants.FACTOR_MODEL;
        colDef.columnFormat = new NumericColumnFormat();

        const format: any = {
            'scalingOptions': {'Thousands (m)': 1000, 'Millions (mm)': 1000000, 'None': 1, 'Billions (mmm)': 1000000000},
            'scalable': true,
            'scalingFactor': 1,
            'useThousandsSeparator': true,
            'decimalPlaces': 8,
        };
        colDef.columnFormat.deserialize(format);
        colDef.dataType = 'DOUBLE';
        return colDef;
    }

    /**
     *
     * @return true if the given column definition has a port, bench or active use type
     * otherwise it returns false.
     */
    static hasPositionUseType(columnDefinition: ColumnDefinition): boolean {
        const posTypes = Object.keys(PositionType);
        return some(posTypes, function (posType: string) {
            return posType === columnDefinition.uses;
        });
    }

    /**
     * Takes a column and returns the root key
     *
     * @param column key that can have | as a delimiter
     */
    static rootColumnKey(column: string): string {
        if (column.indexOf('_before') !== -1) {
            return column.split('_before')[0];
        } else if (column.indexOf('_after') !== -1) {
            return column.split('_after')[0];
        } else if (column.indexOf('_change') !== -1) {
            return column.split('_change')[0];
        } else {
            return column.split('|')[0];
        }
    }

    /**
     * Gets the sort order for the use type for the column.  This is to control that the order of PORT,BENCH and ACTIVE are correct.
     * @param use - special use field
     * @param title - title of the column
     * @returns number later used for comparison
     */
    static getUseOrder(use: string, title: string): number {
        if (
            use === CoreColumnConstants.USE_TYPES.PORT ||
            use === CoreColumnConstants.USE_TYPES_FULL_NAME.PORT ||
            title.startsWith(CoreColumnConstants.COLUMN_PREFIX.PORTFOLIO)
        ) {
            return 0;
        } else if (
            use === CoreColumnConstants.USE_TYPES.BENCH ||
            use === CoreColumnConstants.USE_TYPES_FULL_NAME.BENCH ||
            title.startsWith(CoreColumnConstants.COLUMN_PREFIX.BENCHMARK)
        ) {
            return 1;
        } else if (
            use === CoreColumnConstants.USE_TYPES.ACTIVE ||
            use === CoreColumnConstants.USE_TYPES_FULL_NAME.ACTIVE ||
            title.startsWith(CoreColumnConstants.COLUMN_PREFIX.ACTIVE)
        ) {
            return 2;
        }
        return 0;
    }

    /**
     * Return the original column title for the column matching the passed in colTag and positionColumnType
     * Extracts the original column title for the given column tag and positionColumnType.
     * If positionColumnType is undefined, it returns the title of the first found column with the same tag.
     * @return original column title or null if could not find the column with the given parameters.
     */
    static getOriginalColumnTitle(colTag: string, positionColumnType: string): string {
        if (positionColumnType === ColumnConstants.FACTOR_MODEL) {
            return null;
        }

        let column: ColumnDefinition;
        const columns = CoreDefinitionStore.columnTagColumnsPairs.get(colTag);
        if (columns && columns.length === 1) {
            column = columns[0];
        } else if (columns && columns.length > 1) {
            column = find(columns, {uses: positionColumnType});
        }
        if (column) {
            return column.title;
        }

        console.error('Could not find column (colTag:' + colTag + ')');
        return null;
    }

    static getOriginalTitleForResearchTopicColumns(column: ColumnConfig){
        let colDef = CoreDefinitionStore.columnTagColumnsPairs.get(column.columnTag);
        if(!colDef){
            return;
        }
        if((colDef[0].columnType === "RESEARCH_NOTE" && column.columnTag.includes("topics"))) {
            column.columnTitle = colDef[0].groups[colDef[0].groups.length - 1] + ' - ' + colDef[0].title;
        }
    }

    /**
     * Method to get to the column option given its config type
     */
    // added @dynamic on class level for this
    static getOptionValueByConfigType(optionValues: any[], optionConfigType: string): any {
        return optionValues.find((optionVal: any) => {
            return optionVal.configType === optionConfigType || (CoreConfigUtils.doesSupportAlternateConfigType(optionVal) && optionVal.getAltConfigType() === optionConfigType);
        });
    }
}
