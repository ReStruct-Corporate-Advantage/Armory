import {BehaviorSubject} from 'rxjs';
import {ColumnType, RestrictedOptionInterface, WidgetConfigInput, WidgetInput} from '@blk/explore-ui-core';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';

/**
 *  this store manages the data within the factorDataChartSettings component scope
 */
export class FactorDataChartSettingsStore {

    static isApplyButtonDisabled$: BehaviorSubject<boolean>;
    private static refreshFactorSummaryGrid$: BehaviorSubject<boolean>;
    private static hideFactorColumnRiskSettings$: BehaviorSubject<boolean>;

    /* Used in FactorDataChartSettingsComponent when the factorSelectedOption is modified
    and in FactorDataAddFactorsComponent to update the table when columnSet is modified on Done clicked of FactorDataColumnModal
    and subscribed in FactorDataSummaryGridComponent
    */
    private static refreshComparisonFactorSummaryGrid$: BehaviorSubject<boolean>;

    // Used in FactorDataSummaryGridComponent to show or hide the risk settings columns in factor summary grid based on factorSelectedOption
    private static hideComparisonFactorColumnRiskSettings$: BehaviorSubject<boolean>;

    static restrictedColumnOptions: RestrictedOptionInterface;

    // This is used to avoid fetching RiskSettings column option on FactorDataColumnModal in base-column-set-settings.component
    static restrictedColumnOptionsForComparisonColumns: RestrictedOptionInterface;

    static inputs: Map<string, WidgetInput>;

    static timeSeriesWidgetConfigInput: WidgetConfigInput;
    static columnsWidgetConfigInput: WidgetConfigInput;
    static comparisonColumnsWidgetConfigInput: WidgetConfigInput;
    static riskMatrixWidgetConfigInput: WidgetConfigInput;
    static highlightWidgetConfigInput: WidgetConfigInput;

    static factorTimeSeriesSelectedOption: BehaviorSubject<FactorTimeSeriesSelectedOption>;

    /**
     * Contains factor tag to permission map for factors which do not have perms
     */
    static factorTagToPermissionMap: Map<string, string>;

    static init(): void {
        FactorDataChartSettingsStore.factorTagToPermissionMap = new Map<string, string>();
        FactorDataChartSettingsStore.isApplyButtonDisabled$ = new BehaviorSubject<boolean>(false);
        FactorDataChartSettingsStore.refreshFactorSummaryGrid$ = new BehaviorSubject<boolean>(false);
        FactorDataChartSettingsStore.refreshComparisonFactorSummaryGrid$ = new BehaviorSubject<boolean>(false);
        FactorDataChartSettingsStore.hideFactorColumnRiskSettings$ = new BehaviorSubject<boolean>(false);
        FactorDataChartSettingsStore.hideComparisonFactorColumnRiskSettings$ = new BehaviorSubject<boolean>(true);
        FactorDataChartSettingsStore.factorTimeSeriesSelectedOption = new BehaviorSubject<FactorTimeSeriesSelectedOption>(FactorTimeSeriesSelectedOption.FACTOR_LEVELS);
    }

    static getRefreshFactorSummaryGrid$(columnType: ColumnType): BehaviorSubject<boolean> {
        switch (columnType) {
            case ColumnType.COLUMNS: return this.refreshFactorSummaryGrid$;
            case ColumnType.FACTOR_COMPARISON_COLUMNS: return this.refreshComparisonFactorSummaryGrid$;
            default: return undefined;
        }
    }

    static getHideFactorColumnRiskSettings$(columnType: ColumnType): BehaviorSubject<boolean> {
        switch (columnType) {
            case ColumnType.COLUMNS: return this.hideFactorColumnRiskSettings$;
            case ColumnType.FACTOR_COMPARISON_COLUMNS: return this.hideComparisonFactorColumnRiskSettings$;
            default: return undefined;
        }
    }

    static getColumnsWidgetConfigInput(columnType: ColumnType): WidgetConfigInput {
        switch (columnType) {
            case ColumnType.COLUMNS: return this.columnsWidgetConfigInput;
            case ColumnType.FACTOR_COMPARISON_COLUMNS: return this.comparisonColumnsWidgetConfigInput;
            default: return undefined;
        }
    }

    static getRestrictedColumnOptions(columnType: ColumnType): RestrictedOptionInterface {
        switch (columnType) {
            case ColumnType.COLUMNS: return this.restrictedColumnOptions;
            case ColumnType.FACTOR_COMPARISON_COLUMNS: return this.restrictedColumnOptionsForComparisonColumns;
            default: return undefined;
        }
    }
}
