import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
    ColumnOptionUtils,
    ColumnSet,
    FxFactorOptionsColumnOption,
    LibColumnUtils,
    OverrideDateColumnOption,
    StyleAnalysisColumnOption
} from '@blk/explore-ui-column-option';
import {
    AlertConstants,
    ChartWidgetInputConfigType,
    ColumnConfig,
    ColumnConstants,
    ColumnType,
    CoreWidgetConfigStore,
    ErrorTypeConstants,
    EventType,
    OverrideDateConstants,
    populateTelemetryGenericEventParameters,
    TelemetryActionConstants,
    TelemetryFactorDataWidgetRiskMatrixRequestParameters,
    TelemetryFactorDataWidgetTimeSeriesRequestParameters,
    TelemetryFactorParameters,
    TelemetryGenericEventParameters,
    TelemetryService,
    TelemetryStyleAnalysisParameters,
    TelemetryStyleColumnSettingsParameters,
    TelemetryStyleMeasureSettingsParameters,
    TelemetryTimeSeriesSettingParameters,
    UIErrorParameters,
    WidgetConfigInput,
    WidgetConfigInputCategory,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {UserPreference} from '@constants/user-preference.constants';
import {Breakdown, ColumnBreakdown} from '@blk/explore-ui-breakdown';
import {LightLookthrough} from '@models/lookthrough/light-lookthrough.model';
import {RiskColumnSettings} from '@models/riskSettings/risk-column-settings.model';
import {SortedColumnsX} from '@models/widget/inputs/chart-settings/sorted-columns-x.model';
import {ChartUtils} from '@utils/chart.utils';
import {isEmpty, isNil, isUndefined} from 'lodash';
import {DefinitionsStore, WorkspaceStore} from '../../../stores';
import {BaseWidgetSettingsModalComponent} from './base-widget-settings-modal.component';
import {Widget} from '@models/widget/widget.model';
import {NotificationService} from '@services/notification';
import {RiskAndExposureAdditionalSettings} from '@models/widget/inputs/risk-and-exposure-additional-settings.model';
import {WidgetConstants} from '@constants/widget.constants';
import {UIErrorTelemetryContextUtils} from '@utils/ui-error-telemetry.context.utils';
import {AuxTabBarItemInterface, AuxTabBarSelectedDetailInterface} from '@blk/aladdin-angular-components';
import {CommonConstants} from '@constants/common.constants';
import {FactorDataChartSettings} from '@models/widget/inputs/chart-settings/factor-data-chart-settings.model';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {ShowAsChartInput} from '@models/widget/inputs/show-as-chart-input.model';
import {FactorTimeSeriesSelectedOption, FactorTimeSeriesUtil} from '@enums/factor-time-series-selected-option.enum';
import {ColumnUtils} from '@utils/column.utils';
import {
    FactorDataRiskMatrixSettings
} from '@models/widget/inputs/factor-data-settings/factor-data-risk-matrix-settings.model';
import {
    FactorDataHighlightSettings
} from '@models/widget/inputs/factor-data-settings/factor-data-highlight-settings.model';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';
import {AppUtils} from '@utils/app.utils';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';

/**
 * Widget Settings Modal Component
 *
 * @example
 *  <ng-container *ngIf="isWidgetSettingsModalOpen">
 *      <app-widget-settings-modal [widget]="widget"
 *                           [isOpen]="isWidgetSettingsModalOpen"
 *                           (modalClosed)="closeWidgetSettingsModal()">
 *      </app-widget-settings-modal>
 *  </ng-container>
 */
@Component({
    selector: 'app-widget-settings-modal',
    templateUrl: './widget-settings-modal.component.html',
    styleUrls: ['./widget-settings-modal.component.scss']
})
export class WidgetSettingsModalComponent extends BaseWidgetSettingsModalComponent implements OnInit {
    static DATE_VARY_COL_BREAKDOWN_ERROR_MESSAGE = 'Date Vary is not supported with Column Level Breakdowns. Remove the column level breakdown to proceed.';
    static DATE_VARY_POSITION_AGGREGATION_ERROR_MESSAGE = 'Date Vary is not supported with Aggregation settings enabled in Display Settings. Please select None for all aggregation options in Display Settings or remove the Date Vary option to proceed.';

    // variables to control modal open/close event
    @Input() isOpen: boolean;
    @Output() modalClosed: EventEmitter<void> = new EventEmitter<void>();

    activeTabIndex = '0';
    isApplyButtonDisabled = {value: 0};
    widgetSettingsTabData: AuxTabBarItemInterface[];

    isChartWidget = false;
    settingsDisplayTitle = '';
    readonly widgetNameTitle = WidgetConstants.WIDGET_NAME_TITLE;
    displaySettingsOnDone = new TelemetryGenericEventParameters(EventType.WIDGET_INPUT_DONE_EVENT);

    constructor(private notificationService: NotificationService) {
        super();
    }

    onInit() {
        // set the current widget when settings model is opened
        WorkspaceStore.updateCurrentWidget(this.widget);

        this.activeTabIndex = '0';
        this.userPreference = UserPreference.SHOW_WIDGET_PREVIEW;
        if (ChartUtils.isChartWidget(this.widget)) {
            this.isChartWidget = true;
        }
        this.loadTabs();
        this.settingsDisplayTitle = this.getWidgetOrigTitle(this.widget.configType);
    }

    /**
     * @inheritDoc
     */
    beforeWidgetPreviewUpdate() {
        return true;
    }

    /**
     * Load tabs
     */
    loadTabs(): void {
        // Retrieve and filter the input categories for the ones that are visible or have inputs
        const config = CoreWidgetConfigStore.getChartConfigForType(this.widget.configType);
        this.inputCategories = config.inputCategories.filter((item) => item.inputs && item.visible !== false);
        this.widgetSettingsTabData = this.inputCategories.filter(inputCategory => !(inputCategory.inputNotValidForTables && !this.isChartWidget)).map((inputCategory: WidgetConfigInputCategory, index: number) => {
           return {label: inputCategory.categoryTitle, uid: index.toString()};
        });
    }

    /**
     * Close the widget modal
     */
    closeModal(): void {
        // reset the current widget when settings model is opened
        WorkspaceStore.updateCurrentWidget(undefined);
        this.isOpen = false;
        this.modalClosed.emit();
    }

    /**
     * Checks whether sector/factor breakdown needs to be shown for FBA widget based on selected grouping type.
     */
    checkInputEligibility(inputConfig: WidgetConfigInput): boolean {
        const riskColumnSettings: RiskColumnSettings = this.inputs.get(
            CoreRiskConstants.CONFIG_TYPE.RISK_COLUMN_SETTINGS
        ) as RiskColumnSettings;
        if (inputConfig.inputConfigType === LightLookthrough.configType) {
            if (!this.checkIfLightLookthroughCanBePerformed()) {
                this.inputs.set(LightLookthrough.configType, new LightLookthrough(false));
                return false;
            }
            return true;
        }

        const chartSettingsBreakdownsEnabled = {
            X: (this.inputs.get('breakdownTree') as Breakdown)?.children?.length > 0,
            Y: (this.inputs.get('columnBreakdownTree') as Breakdown)?.children?.length > 0,
        };

        if (inputConfig.inputConfigType === ChartWidgetInputConfigType.SORTED_COLUMNS_X) {
            if (chartSettingsBreakdownsEnabled.X) {
                return true;
            } else {
                this.inputs.set(ChartWidgetInputConfigType.SORTED_COLUMNS_X, new SortedColumnsX());
                return false;
            }
        }

        if (inputConfig.inputConfigType === ChartWidgetInputConfigType.SORTED_COLUMNS_Y) {
            if (chartSettingsBreakdownsEnabled.Y) {
                return true;
            } else {
                this.inputs.set(ChartWidgetInputConfigType.SORTED_COLUMNS_Y, new SortedColumnsX());
                return false;
            }
        }

        if (inputConfig.inputConfigType !== CoreRiskConstants.CONFIG_TYPE.BREAKDOWN || isEmpty(riskColumnSettings)) {
            return true;
        }

        const isSectorBreakdownApplicable =
            inputConfig.inputName === CoreRiskConstants.CONFIG_TYPE.BREAKDOWN && !riskColumnSettings.disableSectorBreakdown;
        const isFactorBreakdownApplicable =
            inputConfig.inputName === CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN && !riskColumnSettings.disableFactorBreakdown;
        return isSectorBreakdownApplicable || isFactorBreakdownApplicable;
    }

    /**
     * On done clicked
     */
    onDoneClicked(event: MouseEvent): void {
        if (!this.isValid()) {
            return;
        }
        // To update the widget level performance settings on performance columns
        (this.inputs?.get(ColumnType.COLUMNS) as ColumnSet)?.columns.forEach((col: ColumnConfig) => {
            ColumnUtils.updateColumnWithWidgetAndPortfolioSettings(col, WorkspaceStore.getCurrentPortfolio(), this.inputs, this.widget.configType);
            col.optionValues.forEach(value => {
                ColumnOptionUtils.updateColumnTitle(col, value, this.widget.configType);
            });
        });
        if (this.checkIfStackBreakdownAndComboChartSettingsMismatch()) {
            AppUtils.alertNotification(
                event,
                AlertConstants.HEADER.CUSTOM_CHART_TYPE,
                AlertConstants.BODY.CUSTOM_CHART_TYPE,
                AlertConstants.BTN.CONTINUE,
                AlertConstants.BTN.CANCEL,
                this.updateWidgetOnDone,
                this.notificationService
            );
        } else {
            this.updateWidgetOnDone();
        }
    }

    checkIfStackBreakdownAndComboChartSettingsMismatch() {
        const stackBreakdown: WidgetInput = this.inputs.get(WidgetInputType.STACKED_BREAKDOWN_TREE);
        const comboChartSettings = this.inputs.get(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS);
        if (stackBreakdown instanceof Breakdown && !stackBreakdown.isEmpty() && comboChartSettings instanceof ComboChartColumnSettings) {
            const defaultChartType: ColumnSeriesChartType = ComboChartColumn.getDefaultColumnChartType(this.widget.configType);
            return comboChartSettings.columns.some(column => column.chartType && column.chartType !== defaultChartType);
        }
        return false;
    }

    updateWidgetOnDone = (): void => {
        this.refreshColumnState(this.widget);
        this.trackStyleColumnsTelemetry();

        // Populate the original state of widget inputs for telemetry
        this.populateTelemetryParametersForWidgetInputs(this.widget, true);

        this.updateWidget(this.widget);
        if (this.widget.configType === WidgetConfigType.FACTOR_DATA) {
            this.trackFactorDataRequestTelemetry();
        }

        // Populate the changed state of widget inputs for telemetry
        this.populateTelemetryParametersForWidgetInputs(this.widget, false);
        if (this.displaySettingsOnDone.details.size >  0) {
            // Track telemetry only if the details map is populated
            this.displaySettingsOnDone.details.set('widgetType', this.widget.configType);
            TelemetryService.track(TelemetryActionConstants.GENERIC_EVENT, this.displaySettingsOnDone);
        }

        this.closeModal();
    };

    /**
     * populates telemetry parameters for widget inputs
     * original inputs are always tracked and new inputs are tracked only if there is a change.
     */
    private populateTelemetryParametersForWidgetInputs(widgetToParse: Widget, isOriginal: boolean): void {
        const inputs: Map<string, WidgetInput> = widgetToParse.getCombinedInputs();

        inputs.forEach((displayInputType: WidgetInput, key: string) => {
            if (displayInputType.getTrackableProperties) {
                //removed check if the input can be serialized to be taken later for redesign
                populateTelemetryGenericEventParameters(displayInputType, key, this.displaySettingsOnDone, isOriginal);
            }
        });
    }

    /**
     * Validate before update widget.
     */
    isValid(): boolean {
        if (this.includeDateVaryAndColumnBreakdown()) {
            const uIErrorParameters = UIErrorTelemetryContextUtils.createUIErrorParameters(ErrorTypeConstants.UI_VALIDATION_ERROR, WidgetSettingsModalComponent.DATE_VARY_COL_BREAKDOWN_ERROR_MESSAGE, this.widget.configType, this.widget.displayTitle);
            this.notificationService.error(WidgetSettingsModalComponent.DATE_VARY_COL_BREAKDOWN_ERROR_MESSAGE);
            TelemetryService.track(
                UIErrorParameters.ACTION,
                uIErrorParameters,
                UIErrorParameters.TELEMETRY_FUNCTION_NAME_DATE_VARY_WITH_COLUMN_BREAKDOWN_ERROR
            );
            return false;
        } else if (this.isDateVaryAndPositionAggregation()) {
            const uiErrorParameters = UIErrorTelemetryContextUtils.createUIErrorParameters(ErrorTypeConstants.UI_VALIDATION_ERROR, WidgetSettingsModalComponent.DATE_VARY_POSITION_AGGREGATION_ERROR_MESSAGE, this.widget.configType, this.widget.displayTitle);
            this.notificationService.error(WidgetSettingsModalComponent.DATE_VARY_POSITION_AGGREGATION_ERROR_MESSAGE);
            TelemetryService.track(
                UIErrorParameters.ACTION,
                uiErrorParameters,
                UIErrorParameters.TELEMETRY_FUNCTION_NAME_DATE_VARY_WITH_POSITION_AGGREGATION_ERROR
            );
            return false;
        } else if (ChartUtils.isPGSGraphingSpritelet(this.widget.configType) && ColumnUtils.isNonNumericalPGSColumn(this.inputs)) { // only applicable to PGS charting widgets
            this.notificationService.error(AlertConstants.NOTIFICATION.PGS_CHART_INVALID_COLUMNS);
            return false;
        }
        return true;
    }

    /**
     * Check if the inputs include column with date vary (vary analytic) and column with column breakdown
     */
    private includeDateVaryAndColumnBreakdown(): boolean {
        // If we have both date vary (vary analytic) and column breakdown in inputs, we do not want to proceed.
        for (const [, value] of this.inputs) {
            // Check the value type before looping through it
            if (!(value instanceof ColumnSet)) {
                continue;
            }
            for (const column of value.columns) {
                if (column.optionValues.find(option => option instanceof OverrideDateColumnOption && option.dateType === OverrideDateConstants.DATE_VARY_TYPES.ANALYTIC[0])
                    && column.optionValues.find(option => option instanceof ColumnBreakdown && !option.breakdown.isEmpty())) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Checks if a Risk & Exposure widget has a date vary column and position aggregation enabled
     */
    private isDateVaryAndPositionAggregation(): boolean {
        // only applicable to Risk & Exposure widgets
        if (this.widget.configType === WidgetConfigType.RISK_EXPOSURE && this.inputs.has(RiskAndExposureAdditionalSettings.configType) && this.inputs.has(WidgetInputType.COLUMNS)) {
            // check if there is a date vary column and position aggregation enabled on the widget
            const columnSet: ColumnSet = this.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
            const containsDateVaryColumn = columnSet.columns.find((col: ColumnConfig) => col.optionValues.find(option => option instanceof OverrideDateColumnOption && option.dateType === OverrideDateConstants.DATE_VARY_TYPES.ANALYTIC[0]));

            const aggregationSettings: RiskAndExposureAdditionalSettings = this.inputs.get(RiskAndExposureAdditionalSettings.configType) as RiskAndExposureAdditionalSettings;
            return containsDateVaryColumn && aggregationSettings.isAnyPositionAggregationEnabled();
        }
        return false;
    }

    /**
     *  check if column breakdown has changed or column has been removed and delete the states accordingly
     */
    protected refreshColumnState(widgetToUpdate: Widget) {
        const columnSetWidget = widgetToUpdate.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet;
        const columnSetUpdated = this.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;

        // if there are no updates, return
        if (!columnSetUpdated || !columnSetWidget) {
            return;
        }

        // if they are not the same favorites, it means new column set was loaded and we need not to clear the state.
        if (columnSetUpdated.id !== columnSetWidget.id) {
            return;
        }
        columnSetWidget.columns.forEach(column => {
            const columnUpdated = columnSetUpdated.columns.find(columnUpdtd => columnUpdtd.columnKey === column.columnKey);
            // if the column is removed, we would remove the state of column and its child columns
            if (!columnUpdated) {
                columnSetUpdated.columnState.removeColumnState(column.columnKey);
                return;
            }
            // If the breakdown is updated we would remove the column state of child columns
            const breakdown = columnUpdated.getOptionValueByConfigType(ColumnBreakdown.CONFIG_TYPE) as ColumnBreakdown;
            const origBreakdown = column.getOptionValueByConfigType(ColumnBreakdown.CONFIG_TYPE) as ColumnBreakdown;
            if (origBreakdown && (!breakdown || !origBreakdown.equals(breakdown))) {
                columnSetUpdated.columnState.removeColumnState(columnUpdated.columnKey, true);
            }
        });
    }

    /**
     * Set display title
     */
    setDisplayTitle(newValue: string): void {
        this.displayTitle = newValue || this.widget.title;
    }

    /**
     * Method invoked when an input category tab is selected
     */
    onTabSelected($event: CustomEvent<AuxTabBarSelectedDetailInterface>): void {
        this.activeTabIndex = $event.detail.uid;
    }

    /**
     * Function to check if light look-through can be performed for given breakdown
     */
    private checkIfLightLookthroughCanBePerformed = (): boolean => {
        if (!this.widget || !CoreWidgetConfigStore.getChartConfigForType(this.widget.configType).isEligibleForLightLookthrough) {
            return false;
        }

        if (!this.inputs) {
            return false;
        }

        const breakdownTree = !isUndefined(this.inputs.get(WidgetInputType.BREAKDOWN_TREE)) ? this.inputs.get(WidgetInputType.BREAKDOWN_TREE) as Breakdown : undefined;
        const stackedBreakdownTree = !isUndefined(this.inputs.get(WidgetInputType.STACKED_BREAKDOWN_TREE)) ? this.inputs.get(WidgetInputType.STACKED_BREAKDOWN_TREE) as Breakdown : undefined;

        if (breakdownTree && !isEmpty(breakdownTree.children) && stackedBreakdownTree && !isEmpty(stackedBreakdownTree.children)) {
            return false;
        }

        if (!(breakdownTree && !isEmpty(breakdownTree.children)) && !(stackedBreakdownTree && !isEmpty(stackedBreakdownTree.children))) {
            return false;
        }

        const breakDown: Breakdown = stackedBreakdownTree && !isEmpty(stackedBreakdownTree.children) ? stackedBreakdownTree : breakdownTree;
        const breakdownColTags: Set<string> = new Set<string>();
        if (!breakDown.isGRSectorBreakdownOnly(breakdownColTags)) {
            return false;
        }
        if (breakdownColTags.size > 1) {
            return false;
        }

        if (isEmpty(DefinitionsStore.fundCharacteristicBreakdown) || DefinitionsStore.fundCharacteristicBreakdown.indexOf(breakdownColTags.values().next().value) === -1) {
            return false;
        }

        const columns = this.inputs.get(WidgetInputType.COLUMNS) ? this.inputs.get(WidgetInputType.COLUMNS) as ColumnSet : undefined;
        // column related checks
        if (!columns || isEmpty(columns.columns)) {
            return false;
        }

        // At least one of the mandatory columns must be present for light look-through
        const mandatoryColumns: any = columns.columns.filter(column => column && ColumnConstants.MANDATORY_LIGHT_LOOKTHROUGH_COLUMNS.indexOf(column.columnTag) !== -1);
        return !isEmpty(mandatoryColumns);
    };

    /**
     * Return Widget title from Config type
     */
    getWidgetOrigTitle(configType: string) {
        return 'Widget Type: '.concat(CoreWidgetConfigStore.getWidgetTitle(configType));
    }

    /**
     * Telemetry for style analysis columns
     */
    trackStyleColumnsTelemetry(): void {
        const styleMap: Map<string, TelemetryStyleColumnSettingsParameters> = new Map();
        const styleColumns: ColumnConfig[] = (this.inputs.get(WidgetInputType.COLUMNS) as ColumnSet)?.columns?.filter(column => LibColumnUtils.isStyleColumn(column.columnTag, column.positionColumnType)) ?? [];
        styleColumns.forEach(column => {
                const measureMap: Map<string, TelemetryStyleMeasureSettingsParameters> = new Map();
                let subColumn = '';
                const columnOption: StyleAnalysisColumnOption = column.optionValues.find(option => option instanceof StyleAnalysisColumnOption) as StyleAnalysisColumnOption;
                Object.entries(columnOption.styleMeasureMapping).forEach((styleMeasure) => {
                    subColumn = subColumn.concat(styleMeasure[0] + CommonConstants.SINGLE_SPACE);
                    measureMap.set(styleMeasure[0], new TelemetryStyleMeasureSettingsParameters(styleMeasure[1]));
                });
                styleMap.set(column.columnKey, new TelemetryStyleColumnSettingsParameters({'subColumn': subColumn, 'measuresSettings': measureMap, 'measuresExpanded': columnOption.showMeasures}));
        });
        if (styleColumns.length !== 0) {
            TelemetryService.track(
                TelemetryActionConstants.USER_BEHAVIOUR.STYLE_ANALYSIS_COLUMNS,
                new TelemetryStyleAnalysisParameters({
                    'widgetType': this.widget.configType,
                    'columnSettings': styleMap
                }),
            );
        }
    }

    private trackFactorDataRequestTelemetry(): void {
        const inputs = this.widget.dataStore.metaData.inputs;
        const factorChartSettings = inputs.get(FactorDataChartSettings.configType) as FactorDataChartSettings;
        const columns = inputs.get(ColumnType.COLUMNS) as ColumnSet;
        const showAsChartInput = inputs.get(ShowAsChartInput.configType) as ShowAsChartInput;
        const widgetRiskSettings = inputs.get(CoreRiskConstants.RISK_SETTINGS) as RiskSettings;

        const columnLevelRiskSettingsIgnored = ColumnUtils.checkToHideColumnRiskSettingsFactorDataWidget(factorChartSettings.isTimeSeriesMode, factorChartSettings.factorTimeSeriesSelectedOption);
        const isFactorLevel = factorChartSettings.factorTimeSeriesSelectedOption === FactorTimeSeriesSelectedOption.FACTOR_LEVELS;

        const riskSettingsChanged = isFactorLevel ? undefined : !isEmpty(widgetRiskSettings.getRequestParams());
        const factorColumnsList = this.telemetryFactorsListHelper(columns, columnLevelRiskSettingsIgnored);
        const factorAnalytic = FactorTimeSeriesUtil.getFactorDataAnalytic(factorChartSettings.factorTimeSeriesSelectedOption);

        if (factorChartSettings.isTimeSeriesMode) {
            const timeSeriesSettings = inputs.get(TimeSeriesSettings.INPUT_CONFIG_NAME) as TimeSeriesSettings;
            const comparisonColumns = inputs.get(ColumnType.FACTOR_COMPARISON_COLUMNS) as ColumnSet;

            const telemetryTimeSeriesSettingParameters = new TelemetryTimeSeriesSettingParameters({
                frequency: timeSeriesSettings.frequency,
                periodCount: timeSeriesSettings.periods,
                chartType: timeSeriesSettings.chartType,
                formatDateType: timeSeriesSettings.dateFormat,
                compareMode: timeSeriesSettings.compareModeToggle ? timeSeriesSettings.compareMode : 'none',
            });

            const telemetryFactorDataWidgetTimeSeriesRequestParameters = new TelemetryFactorDataWidgetTimeSeriesRequestParameters({
                factorAnalytic,
                showAsChart: showAsChartInput.showAsChart,
                timeSeriesSetting: telemetryTimeSeriesSettingParameters,
                factorColumnsList,
                riskSettingsChanged,
            });

            if (!isNil(comparisonColumns)) {
                telemetryFactorDataWidgetTimeSeriesRequestParameters.comparisonFactorColumnsList = this.telemetryFactorsListHelper(comparisonColumns, true);
            }

            TelemetryService.track(
                TelemetryActionConstants.USER_BEHAVIOUR.FACTOR_DATA_WIDGET_TIME_SERIES_REQUEST,
                telemetryFactorDataWidgetTimeSeriesRequestParameters
            );
        } else {
            const factorDataHighlightSettings = inputs.get(FactorDataHighlightSettings.configType) as FactorDataHighlightSettings;
            let conditionalFormattingEnabled = factorDataHighlightSettings.lowerHighlightSettings?.highlightSettings.filter(setting => setting.isValid()).length > 0;
            conditionalFormattingEnabled = conditionalFormattingEnabled || factorDataHighlightSettings.upperHighlightSettings?.highlightSettings.filter(setting => setting.isValid()).length > 0;

            const factorDataRiskMatrixSettings = inputs.get(FactorDataRiskMatrixSettings.configType) as FactorDataRiskMatrixSettings;

            const telemetryFactorDataWidgetRiskMatrixRequestParameters = new TelemetryFactorDataWidgetRiskMatrixRequestParameters({
                factorAnalytic,
                factorColumnsList,
                riskSettingsChanged,
                triangularMatrix: factorDataRiskMatrixSettings.isTriangularMatrix,
                showChangeUpperTriangle: factorDataRiskMatrixSettings.showChangeInUpperTriangle,
                comparisonMode: !isEmpty(factorDataRiskMatrixSettings.comparisonDate),
                conditionalFormattingEnabled,
            });

            TelemetryService.track(
                TelemetryActionConstants.USER_BEHAVIOUR.FACTOR_DATA_WIDGET_RISK_MATRIX_REQUEST,
                telemetryFactorDataWidgetRiskMatrixRequestParameters
            );
        }
    }

    private telemetryFactorsListHelper(columns: ColumnSet, columnLevelRiskSettingsIgnored?: boolean): TelemetryFactorParameters[] {
        return columns.columns.map(column => {
            let riskSettingsChanged;
            let fxCrossCurrencyChanged;
            column.optionValues.forEach(optionValue => {
                if (optionValue.configType === RiskSettings.CONFIG_TYPE && !columnLevelRiskSettingsIgnored) {
                    riskSettingsChanged = (optionValue as RiskSettings).economyRiskSettings.isEconomyRiskSettingChanged();
                } else if (optionValue.configType === FxFactorOptionsColumnOption.CONFIG_TYPE) {
                    fxCrossCurrencyChanged = (optionValue as FxFactorOptionsColumnOption).isFxCrossCurrencyChanged;
                }
            });
            return new TelemetryFactorParameters({
                factorKey: column.columnKey,
                factorTag: column.columnTag,
                riskSettingsChanged,
                fxCrossCurrencyChanged,
            });
        });
    }
}
