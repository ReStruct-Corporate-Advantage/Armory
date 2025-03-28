import {HttpParams} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {
    AbstractColumnOption,
    ColumnOptionFactory,
    ColumnOptionMetaDataInterface,
    CoreDefinitionStore,
    HTTP_SERVICE_TOKEN,
    HttpServiceInterface,
    RestrictedOptionInterface,
    ConfigState,
    CommonUtils,
    CoreRequestConstants
} from '@blk/explore-ui-core';
import {cloneDeep, isEmpty, isFunction, isNil, union} from 'lodash';
import {Observable, of} from 'rxjs';
import {map, share} from 'rxjs/operators';
import {ColumnOptionResponse} from '../interfaces';
import {ColumnOptionsStore} from '../stores/column-options.store';
import {SelectedColumnSelectorOption} from '../models/ui/selected-column-selector-option.model';
import {LiquidityStore} from '../liquidity/liquidity.store';
import {LiquidityColumnOption} from '../models/column-option/liquidity-column-option.model';
import {ColumnSet} from '../models/column-set/column-set.model';

@Injectable()
/**
 * Service for loading column options
 */
export class ColumnOptionService {
    bulkColumnOptionsObservable: Observable<any>;
    inProgressColumnOptionRequests: Map<string, boolean> = new Map<string, boolean>();
    /**
     * constructor
     */
    constructor(@Inject(HTTP_SERVICE_TOKEN) private http2BmsService: HttpServiceInterface) {
    }

    /**
     * Gets the column options for the multiple columnTag and use types.
     * @param inputs[]: array of colTag - column tag, use - use field
     */
    fetchColumnOptions$(inputs: { colTag: string; columnOptionType?: string; use: string }[]): Observable<ColumnOptionResponse[]> {
        const nonCachedInputs: { colTag: string; columnOptionType: string; use: string }[] = [];
        const columnOptions: ColumnOptionResponse[] = [];
        let someInputsAreInProgress = false;

        // See for which all inputs we can get data from cache
        inputs.forEach((input: { colTag: string; columnOptionType: string; use: string }) => {
            input.columnOptionType = isNil(input.columnOptionType) ? 'ColumnOption' : input.columnOptionType;
            const {colTag, columnOptionType, use} = input;
            const columnOptionsKey = `${colTag}_${use}_${columnOptionType}`;
            // Check if this column options request is already in progress
            if (this.inProgressColumnOptionRequests.get(columnOptionsKey)) {
                someInputsAreInProgress = true;
                return;
            }
            const options = ColumnOptionsStore.columnOptions.get(columnOptionsKey);
            if (isNil(options)) {
                // Add this columnOptionsKey to the map
                this.inProgressColumnOptionRequests.set(columnOptionsKey, true);
                nonCachedInputs.push(input);
                return;
            }
            columnOptions.push({colTag, use, columnOptionType, options: cloneDeep(options)});
        });

        // If all of the column option inputs are already in progress, just return the original observable
        if (someInputsAreInProgress) {
            return this.bulkColumnOptionsObservable;
        }

        // If all the column options were in the cache, just return.
        if (isEmpty(nonCachedInputs)) {
            return of(columnOptions);
        }

        // Fetch the missing column options.
        this.bulkColumnOptionsObservable = this.http2BmsService.post$('bulkColumnOptions', {colList: nonCachedInputs}, new HttpParams())
            .pipe(
                map((payload: any) => {
                    const items = payload.data;
                    items.forEach((item: any) => {
                        item.columnOptionType = isNil(item.columnOptionType) ? 'ColumnOption' : item.columnOptionType;
                        const columnOptionsKey = `${item.colTag}_${item.uses}_${item.columnOptionType}`;
                        // Remove the columnOptionsKey from the in progress map
                        this.inProgressColumnOptionRequests.delete(columnOptionsKey);
                        ColumnOptionsStore.columnOptions.set(columnOptionsKey, item.options);
                        columnOptions.push({
                            colTag: item.colTag,
                            use: item.uses,
                            columnOptionType: item.columnOptionType,
                            options: cloneDeep(item.options)
                        });
                    });
                    return columnOptions;
                }),
                share()
            );

        return this.bulkColumnOptionsObservable;
    }

    /**
     * Fetch and populate column options
     * The column callback provides a way to customize each selected column
     */
    fetchAndPopulateColumnOptions$(selectedColumns: SelectedColumnSelectorOption[],
                                   additionalColumnOptions: any[],
                                   restrictedColumnOptions: RestrictedOptionInterface,
                                   columnCallback?: (column) => void): Observable<SelectedColumnSelectorOption[]> {
        const columnsToBeFetched = selectedColumns.map(({column}: SelectedColumnSelectorOption) => {
            return {colTag: column.columnTag, use: column.positionColumnType};
        });

        return this.fetchColumnOptions$(columnsToBeFetched).pipe(
            map((response: ColumnOptionResponse[]) =>
                this.populateColumnOptions(response, selectedColumns, additionalColumnOptions, restrictedColumnOptions, columnCallback)
            )
        );
    }

    private populateColumnOptions(response: ColumnOptionResponse[],
                                  selectedColumns: SelectedColumnSelectorOption[],
                                  additionalColumnOptions: any[],
                                  restrictedColumnOptions: RestrictedOptionInterface,
                                  columnCallback?: (column) => void): SelectedColumnSelectorOption[] {
        response.forEach((colOptionsInterface: ColumnOptionResponse) => {
            selectedColumns.filter((item) =>
                item.column.columnTag === colOptionsInterface.colTag && item.column.positionColumnType === colOptionsInterface.use
            ).forEach((selectedItem) => {
                selectedItem.columnOptions = ColumnOptionFactory.getFilteredColumnOptions(undefined, colOptionsInterface.options, restrictedColumnOptions);

                if (!isEmpty(additionalColumnOptions)) {
                    // scope column option only needs to be added if incoming column uses is of type PORT
                    const scopeOptionIndex = additionalColumnOptions.findIndex(option => option.columnOptionTitle === 'Scope');
                    if (scopeOptionIndex >= 0) {
                        if (selectedItem.column.positionColumnType === 'PORT') {
                            selectedItem.columnOptions = selectedItem.columnOptions.concat(additionalColumnOptions);
                        }
                    } else {
                        selectedItem.columnOptions = selectedItem.columnOptions.concat(additionalColumnOptions);
                    }
                }
                this.loadColumnOptionValues(selectedItem, columnCallback);
            });
        });

        return selectedColumns;
    }

    private loadColumnOptionValues(selectedItem: SelectedColumnSelectorOption, columnCallback?: (column) => void): void {
        const column = selectedItem.column;
        const columnOptions = selectedItem.columnOptions;

        columnOptions.forEach((option: ColumnOptionMetaDataInterface) => {
            // If Column options Values already exist then we don't have to initialize column Option's model again.
            // NOTE: for column options like column breakdown, where we send the all column values as an object, we don't need to create models. Their model are created at the middleware
            // But for other column options ( such as dxs ) where we send the column options individually ( cap, floor etc) we need to create models again with the saved values (This is catered in ColumnOptionFactory.getModel
            // Example: column.optionValues = { 'cap': 1,
            //  'columnBreakdown': {},
            //  'floor': 3,
            //      'isOasBased': false,
            //      'useDurationForEuroGovtBonds': false
            //  }
            let columnOptionModel: AbstractColumnOption = column.getOptionValueByConfigType(option.columnOptionConfigType);
            if (!columnOptionModel) {
                const optionDefinitions = this.getOptionDefinitions();
                columnOptionModel = ColumnOptionFactory.createModel(option.columnOptionConfigType, option, optionDefinitions);
                if (columnOptionModel) {
                    // the column option is new and set to the defaults
                    columnOptionModel.optionState = ConfigState.NEW;

                    column.optionValues.push(columnOptionModel);
                }
            } else if (columnOptionModel instanceof LiquidityColumnOption) {
                // Since column option attributes might be updated to reflect new settings ( we need to update them here)
                const serializedOptionModel = columnOptionModel.doSerialize(false);
                const currIdx = column.optionValues.findIndex(optionValue => columnOptionModel === optionValue);
                if (currIdx !== -1) {
                    column.optionValues.splice(currIdx, 1);
                    const optionDefinitions = this.getOptionDefinitions();
                    const newLiquidityColumnOptionModel = ColumnOptionFactory.createModel(option.columnOptionConfigType, option, optionDefinitions);
                    newLiquidityColumnOptionModel.deserialize(serializedOptionModel);
                    newLiquidityColumnOptionModel.optionState = ConfigState.EXISTING;
                    column.optionValues.push(newLiquidityColumnOptionModel);
                }
            }
        });

        if (isFunction(columnCallback)) {
            columnCallback(column);
        }
    }

    /**
     * Validates if selected column spawns multiple child columns
     * @param columns columns for which we want to know if it spawns single or multiple child columns
     */
    isSingleChildColumn$(columns: ColumnSet) {
        const requestParams = {};
        let params = new HttpParams();
        const loadingKey = CoreRequestConstants.LOADING_PREFIX + CommonUtils.generateUniqueIdAsString(7);
        params = params.set(CoreRequestConstants.LOADING_KEY, loadingKey);
        params = params.set(CoreRequestConstants.LOADING_MESSAGE, 'Validating Columns');
        columns.addRequestParams(requestParams, 'columns');
        return this.http2BmsService.post$('isSingleChildColumn', requestParams, params);
    }

    /**
     * Get option definitions
     */
    protected getOptionDefinitions(): Map<string, any> {
        return new Map(union(Object.entries(CoreDefinitionStore), Object.entries(LiquidityStore)));
    }
}
