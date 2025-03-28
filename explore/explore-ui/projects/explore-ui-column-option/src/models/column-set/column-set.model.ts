import {
    AbstractConfig,
    AbstractFavoriteConfig,
    ColumnConfig, ColumnConstants,
    ColumnState,
    ConfigState,
    CoreColumnUtils,
    CoreCommonConstants, CoreWidgetConfigStore,
    FavoriteDisplayEnum,
    RequestParamsCreator,
    RequestParamsWithFavCreator,
    SerializeFavoriteType,
    TabularColumnFilters, WidgetConfigType,
    WidgetInput,
    WidgetInputType,
    WidgetTitleModifiable
} from '@blk/explore-ui-core';
import {each, isEmpty, isNil, isObject, some} from 'lodash';
import {CustomCalculationConstants} from '../../constants';
import {ColumnOptionUtils, LibColumnUtils} from '../../utils';
import {StyleAnalysisColumnOption} from '../column-option/style-analysis-column-option.model';
import type {FilterModel} from 'ag-grid-community';

/**
 * Class for collection of columns in a widget.. This was previously referred as Report
 */
export class ColumnSet extends AbstractFavoriteConfig implements WidgetInput, RequestParamsCreator, RequestParamsWithFavCreator, WidgetTitleModifiable {

    static readonly configType = 'columnSet';

    columns: ColumnConfig[] = [];
    columnState = new ColumnState();

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof ColumnSet)) {
            return;
        }

        this.columns = source.columns;
    }

    doDeserialize(data: any): void {
        this.handleOldFavorites(data);

        if (!data.columns.length) {
            // Bad favorite can have data.columns in non array format, and this then can throw error and app will stop to load.
            return;
        }

        data.columns.forEach((col: any) => {
            const colConfig: ColumnConfig = new ColumnConfig(col);

            // When deserializing a saved custom calc we will set the columnKey using
            // 1. try to override the columnKey using the ColumnSet (for a saved custom calc column the ColumnSet will contain columnKey + AbstractFavoriteConfig link)
            // 2. If columnKey not available in ColumnSet, fallback to using the columnKey from custom calc favorite
            if (colConfig.id && colConfig.columnTag === CustomCalculationConstants.CUSTOM_CALCULATION && col.columnKey) {
                // option 1 above
                colConfig.columnKey = col.columnKey;
            }

            // fix a previous bug where if you had the same favorite custom calc in a ColumnSet, they would have the same columnKey.
            // this is rare but should there be a duplicate columnKey, we will change one of them
            if (this.columns.find(c => (c.columnTag === CustomCalculationConstants.CUSTOM_CALCULATION && c.columnKey === colConfig.columnKey))) {
                colConfig.columnKey = ColumnConfig.generateColumnKey(col.columnTag);
            }

            // We need to make sure the column exists before adding to the ColumnSet.
            // This can happen when the perms to a column have been removed and the favorite still has it included.
            const columnDef = CoreColumnUtils.getColumnDefByTagAndUse(colConfig.columnTag, colConfig.positionColumnType);

            if (!isNil(columnDef)) {
                // If column definition Port/Bench/Active use type, overwrite given column's position type.
                // This is because the given column could be coming from a old favourite, which does not have the
                // current use type.
                // (E.g. some performance columns used to have "Total Return" as their useTypes. In March 2018 they
                // were changed to have Port/Bench/Active use type but in the favourite they could
                // still have old use type).
                if (CoreColumnUtils.hasPositionUseType(columnDef)) {
                    colConfig.positionColumnType = columnDef.uses;
                }

                this.columns.push(colConfig);
            } else {
                // Log that we are not adding this column to the report.
                console.log('Column no longer exists and will be removed from report: ' + colConfig.columnTag);
            }
        });

        // Deserialize the column state.
        this.deserializeColumnState(data);
    }

    handleOldFavorites(data: any): void {
        if (data && data.data && !data.columns) {
            data.columns = data.data;
        }
        if (data && !data.columns) {
            data.columns = data;
        }
        if (data.columns) {
            this.columns = [];
        }
    }

    deserializeColumnState(data: any): void {
        if (data.columnState) {
            // This is a new style favorite so just deserialize the content into the model.
            this.columnState = new ColumnState(data.columnState);
        } else {
            // Old style favorite so try and generate from the column data itself.
            this.columnState = ColumnState.createFromLegacyColumnData(data);
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    doSerialize(isNested?: boolean | SerializeFavoriteType, shouldSaveLinkedFav?: (config: AbstractFavoriteConfig) => boolean): any {
        const data: any = {};
        data.configType = this.getConfigType();
        data.columns = [];

        each(this.columns, function (col: ColumnConfig) {
            // serializeColumnConfigFlag, if true the current ColumnConfig will get serialized and its new/existing column filter will be saved
            // meaning the method doSerialize in column-config.model.ts will be invoked
            // columnFilters in ColumnConfig objects need to be serialized to persist new changes done to existing report when we save them
            // refer to JIRA ticket PM-17240 for more details
            const serializeColumnConfigFlag = (col.columnFilters?.columnFilters && isNested) ? false : isNested;
            const serializedColumn = col.serialize(serializeColumnConfigFlag, shouldSaveLinkedFav);

            // when serializing a *favorite* custom calc column, we want to save the link to favorite but also preserve columnKey as part of the ColumnSet
            if (col.id && col.columnTag === CustomCalculationConstants.CUSTOM_CALCULATION) {
                serializedColumn.columnKey = col.columnKey;
            }
            if (col.positionColumnType === ColumnConstants.FACTOR_MODEL) {
                serializedColumn.columnTitle = col.columnTitle;
            }

            data.columns.push(serializedColumn);
        });

        // Need to add in the filtering of the existing columns in the state.
        // As an example if the column is changed then all the widths stored no longer need to exist.
        // NOTE:  the default columns do not have a column key, so check and use the tag instead.
        const columnKeys = this.columns.map((col) => isNil(col.columnKey) ? col.columnTag : col.columnKey);
        this.columnState.removeExcessColumns(columnKeys);

        // Add the column state to the serialized data.
        data.columnState = this.columnState.serialize(isNested);
        return data;
    }

    getConfigType(): string {
        return 'columnSet';
    }

    /**
     * Return true if the passed in columnSet is equal to this columnSet
     */
    equals(object: AbstractConfig): boolean {
        if (!(object instanceof ColumnSet)) {
            return false;
        }

        const columnSet: ColumnSet  = object;

        if (this.columns.length !== columnSet.columns.length) {
            return false;
        }

        const isAnyColumnUnequal = some(this.columns, function (column: ColumnConfig, i) {
            return !column.equals(columnSet.columns[i]);
        });

        return !isAnyColumnUnequal;
    }

    /**
     * Updates the column filters from ag-grid
     */
    updateColumnFiltersFromGrid(filters: FilterModel, autoGrpMappedField: string): void {
        // Remove all filters as any new ones will be reapplied below.
        this.columns.filter(col => col.columnFilters)
                    .forEach(col => col.columnFilters = undefined);

        // If there are no filters just get out of here.
        if (isEmpty(filters)) {
            return;
        }

        Object.entries(filters).forEach(([key, value]) => {
            // Don't bother processing any filters that do not have a value.
            // Date filters value don't have filter property
            if (isNil(value.filter) && value.filterType !== 'date') {
                return;
            }

            let effectiveFilterKey: string = key;
            let widgetColumn: ColumnConfig = this.columns.find(col => col.columnKey === effectiveFilterKey.split('|')[0]);
            if (!widgetColumn) {
                effectiveFilterKey = autoGrpMappedField;
                widgetColumn = this.columns.find(col => col.columnKey === autoGrpMappedField);
            }
            if (widgetColumn) {
                if (!widgetColumn.columnFilters) {
                    widgetColumn.columnFilters = new TabularColumnFilters();
                }
                widgetColumn.columnFilters.add(effectiveFilterKey, value);
            }
        });
    }

    /**
     * @return true
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * Adds columns request attribute to the given request parameters
     * @param requestParams request parameters to add the columns attribute to
     * @param paramName a request parameter name
     * @param isExportRequest - flag if the request is export related
     */
    addRequestParams(requestParams: any, paramName?: string, isExportRequest?: boolean): void {
        this.enrichRequestParams(requestParams, paramName, isExportRequest, false);
    }

    /**
     * Adds columns request attribute to the given request parameters with favIds
     * This is called when invoking generate API requests
     *
     * @param requestParams request parameters to add the columns attribute to
     * @param paramName a request parameter name
     */
    addRequestParamsWithFavId(requestParams: any, paramName?: string): void {
        this.enrichRequestParams(requestParams, paramName, false, true);
    }

    /**
     *  Return the column within this column set that matches the passed in attributes
     */
    getColumnBasedOnColTagAndUse(colTag: string, use: string): ColumnConfig {
        return this.columns.find((col: ColumnConfig) => col.columnTag === colTag && col.positionColumnType === use);
    }

    /**
     * Creates a column with the given parameters and adds it to the the column set
     * @param columnTag a column tag for the newly created column
     * @param columnKey a column key, if undefined, defaults to a given column tag
     * @param positionColumnType a position column type
     * @param title a title for the newly created column
     * @return newly created column
     *
     * @see ColumnConfig.createColumn
     */
    createColumnAndAdd(columnTag: string, columnKey?: string, positionColumnType?: string, title?: string): ColumnConfig {
        const column: ColumnConfig = ColumnConfig.createColumn(columnTag, positionColumnType, isNil(columnKey) ? columnTag : columnKey, title);
        this.columns.push(column);

        return column;
    }

    removeColumnIf(filterFn: (column: ColumnConfig) => boolean): void {
        this.columns = this.columns.filter(column => !filterFn(column));
    }

    /**
     * WidgetTitleModifiable.getModifiedWidgetTitleDetails(DateValue)
     */
    getModifiedWidgetTitleDetails(): any {
        return this.columns.length > 0 ? this.columns[0].getColumnTitleForWidgetTitleDetails() : CoreCommonConstants.EMPTY_STRING;
    }

    /**
     * @param requestParams enrich request params
     * @param paramName
     * @param isExportRequest
     * @param isAPIRequest
     */
    private enrichRequestParams(requestParams: any, paramName?: string, isExportRequest?: boolean, isAPIRequest?: boolean): void {
        const requestColumns: WidgetInput[] = [];

        if (this.columns) {
            if (!!requestParams.portTreeDecisionLevel || !isEmpty(requestParams.topDownCols)) {
                requestColumns.push(
                    this.columns.find(
                        (column: ColumnConfig) => column.columnTag === ColumnConstants.SECURITY_DESCRIPTION).createRequestColumn(isExportRequest, isAPIRequest)
                );
            } else {
                let hasMultiManagerEnabledColumns = false;
                this.columns.forEach((columnConfig: ColumnConfig) => {
                    if (!hasMultiManagerEnabledColumns && ColumnOptionUtils.isColumnRasMultiManagerEnabled(columnConfig)) {
                        // set (once and for all) the flag to true, if multi-manager is set for the given column
                        // once the flag is set, we do not enter this block again
                        hasMultiManagerEnabledColumns = true;
                    }

                    // For style analysis columns we need to initialize the column options if not already initialized
                    if (LibColumnUtils.isStyleColumn(columnConfig?.columnTag, columnConfig?.positionColumnType)) {
                        this.updateStyleColumnOptions(columnConfig);
                    }
                    requestColumns.push(columnConfig.createRequestColumn(isExportRequest, isAPIRequest));
                });

                if (!hasMultiManagerEnabledColumns) {
                    // remove the "decisionBenchMap" param in case multi-manager is not enabled on any of the columns in the column set
                    delete requestParams.decisionBenchMap;
                }
            }
        }
        const paramNameToUse: string = paramName || WidgetInputType.COLUMNS;
        requestParams[paramNameToUse] = requestColumns;
    }

    getDisplayType(parent?: AbstractConfig): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.COLUMN_SET;
    }

    /**
     * Clear any flags that were set in order to detect changes to the favorite (ie column option)
     */
    resetChangeDetectionFlags(): void {
        // reset all columns that are not favorites (custom calc columns will reset themselves when saved)
        this.columns.filter(column => !column.id)
            .forEach(col => col.resetChangeDetectionFlags());
        this.columnState.changeState = ConfigState.EXISTING;
    }

    /**
     * find and update the StyleAnalysisColumnOption if not already updated
     */
    updateStyleColumnOptions(columnConfig: ColumnConfig) {
        const styleAnalysisColumnOption: any = columnConfig.optionValues.find((option: any) => option instanceof StyleAnalysisColumnOption);
        LibColumnUtils.updateMeasureMapping(columnConfig.columnTag, styleAnalysisColumnOption, CoreWidgetConfigStore.getChartConfigForType(WidgetConfigType.RISK_EXPOSURE));
    }
}
