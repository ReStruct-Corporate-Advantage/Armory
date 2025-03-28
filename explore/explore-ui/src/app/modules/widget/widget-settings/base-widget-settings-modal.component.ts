import {Directive, Input, OnInit} from '@angular/core';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {UserMetaDataStore, WorkspaceStore} from '../../../stores';
import {cloneDeep, isUndefined} from 'lodash';
import {
    AttributionSettings,
    ChartWidgetInputConfigType,
    ColumnConfig,
    ColumnOptionFactory,
    CommonUtils,
    PerformanceSettings,
    RestrictedOptionInterface,
    ReturnsUtilityService,
    SubscribableComponent,
    WidgetConfigInputCategory,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {takeUntil} from 'rxjs/operators';
import {UserPreference} from '@constants/user-preference.constants';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {v4 as uuid} from 'uuid';
import {AuxToggleChangedDetailInterface} from '@blk/aladdin-angular-components';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import {ROOT_LEVEL} from '@utils/qbstr';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {ChartUtils} from '@utils/chart.utils';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';

@Directive()
export abstract class BaseWidgetSettingsModalComponent extends SubscribableComponent implements OnInit {

    @Input() widget: Widget;

    userPreference: UserPreference;
    inputs: Map<string, WidgetInput>;
    inputCategories: WidgetConfigInputCategory[];
    displayTitle = '';
    temporaryAttributionColumns: ColumnConfig[];
    restrictedColumnOptions: RestrictedOptionInterface;

    previewWidget: Widget;
    showPreview = false;

    // current report and portfolio needed to create preview widget
    report: Report;
    portfolio: Portfolio;

    // checks if the widget is chart widget or table widget
    isChartWidget: boolean;

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.onInit();
        if (this.widget) {
            this.isChartWidget = ChartUtils.isChartWidget(this.widget);
            this.displayTitle = this.widget.title;
            // Create a copy of existing widget settings to prevent mutation of the original ones until Done is clicked
            this.inputs = cloneDeep(this.widget.dataStore.metaData.inputs);
            this.widget.displayInputs.forEach((val: WidgetInput, key: string) => {
                this.inputs.set(key, cloneDeep(val));
            });
            this.restrictedColumnOptions = ColumnOptionFactory.getRestrictedColumnOptions(this.widget.configType);
            ReturnsUtilityService.getCurrentColumnList$()
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((columns) => (this.temporaryAttributionColumns = columns));

            // Get user preference for whether or not widget preview should be shown
            if (this.userPreference) {
                // XXX: #1053829, hardcode initial showPreview to false
                UserMetaDataStore.setPreferenceValue(this.userPreference, 'false');

                UserMetaDataStore.getPreferenceSubject(this.userPreference)
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe((preference) => {
                        this.showPreview = preference === 'true';
                    });
            }

            // Clone widget to use for preview
            const previewDataStore = new WidgetDataStore();
            previewDataStore.copy(this.widget.dataStore);
            if (ChartUtils.isPGSSpritletWidget(this.widget.configType)) {
                previewDataStore.data = {
                    responseConfig: {},
                    customVizConfig: this.widget.dataStore.data?.customVizConfig
                };
            }
            previewDataStore.name = uuid();
            this.previewWidget = cloneDeep(this.widget);
            this.previewWidget.dataStore = previewDataStore;
            this.previewWidget.id = CommonUtils.generateUniqueIdAsNumber();
            this.previewWidget.showSettings = false;
            this.updateWidgetPreview();
        }

        // Get current report and portfolio needed for widget preview
        // No need to subscribe because report and portfolio cannot be changed when widget settings open
        this.report = WorkspaceStore.getCurrentReport();
        this.portfolio = WorkspaceStore.getCurrentPortfolio();
    }

    /**
     * Called on component initialization can be used by derived component.
     */
    abstract onInit();

    preUpdateWidget(): void {
        const hasAttributionSettings: boolean =
            this.inputs &&
            this.inputs.get('performanceSettings') &&
            !!(this.inputs.get('performanceSettings') as PerformanceSettings).attributionSettings;
        // For all other widgets or performance settings with no changes in attribution settings
        if (hasAttributionSettings) {
            this.addTemporaryAttributionColumnsToColumnList();
        }
    }

    resetChartTypesInComboChartSettingsIfStackedBreakdownIsNotEmpty(widget: Widget): void {
        const stackBreakdown: WidgetInput = widget.getCombinedInputs().get(WidgetInputType.STACKED_BREAKDOWN_TREE);
        const comboChartSettings = widget.getCombinedInputs().get(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS);
        if (stackBreakdown instanceof Breakdown && !stackBreakdown.isEmpty() && comboChartSettings instanceof ComboChartColumnSettings) {
            comboChartSettings.columns.forEach(column => {
                column.chartType = ComboChartColumn.getDefaultColumnChartType(widget.configType);
            });
        }
    }

    /**
     * If there are any temporary columns added due to performance settings and attribution settings changes, add those columns to the column list
     * else continue to update the chart
     */
    addTemporaryAttributionColumnsToColumnList(): void {
        const inputsAttributionSettings: AttributionSettings = (this.inputs.get('performanceSettings') as PerformanceSettings)
            .attributionSettings;
        const isColumnListUpdateEnabled: boolean = inputsAttributionSettings.isColumnListUpdateEnabled;
        let tempCols: ColumnConfig[] = this.temporaryAttributionColumns;
        if (!isColumnListUpdateEnabled || (tempCols && tempCols.length === 0)) {
            return;
        }
        const inputsCol: ColumnConfig[] = (this.inputs.get('columns') as ColumnSet).columns;
        const tempColTags: string[] = tempCols.map((tempCol: ColumnConfig) => tempCol.columnTag);
        const inputColTags: string[] = inputsCol.map((inputCol: ColumnConfig) => inputCol.columnTag);
        // get column tags which are not present in input cols already and remove common columns
        const newColTags: string[] = tempColTags.filter((tempColTag: string) => inputColTags.indexOf(tempColTag) === -1);
        // re-assign temp cols with only with those not present in input cols
        tempCols = tempCols.filter((tempCol: ColumnConfig) => newColTags.indexOf(tempCol.columnTag) !== -1);

        const widgetAttributionSettings: AttributionSettings = (this.widget.dataStore.metaData.inputs.get(
            'performanceSettings'
        ) as PerformanceSettings).attributionSettings;
        // check if attribution settings have been updated
        const hasAttributionSettingsChanged: boolean =
            inputsAttributionSettings && !inputsAttributionSettings.equals(widgetAttributionSettings);
        // if temporary columns are present add them to column list
        if (hasAttributionSettingsChanged && tempCols.length !== 0) {
            this.temporaryAttributionColumns.forEach((tempCol: ColumnConfig) => {
                if (inputsCol.filter((inputCol: ColumnConfig) => tempCol.columnTag === inputCol.columnTag).length === 0) {
                    inputsCol.push(tempCol);
                }
            });
        }
    }

    /**
     * Toggles the widget preview
     */
    onShowPreviewToggle(event: CustomEvent<AuxToggleChangedDetailInterface>): void {
        this.showPreview = event.detail.value.checked;
        if (this.userPreference) {
            UserMetaDataStore.setPreferenceValue(this.userPreference, this.showPreview.toString());
        }
    }

    /**
     * Updates the preview widget
     */
    updateWidgetPreview(): void {
        if (this.beforeWidgetPreviewUpdate()) {
            this.updateWidget(this.previewWidget);
        }
    }

    /**
     * Method called before widget preview is updated
     */
    abstract beforeWidgetPreviewUpdate(): boolean;

    /**
     * Updates a widget with the new settings and inputs
     */
    protected updateWidget(widgetToUpdate: Widget) {
        // Pre-update the widget by adding the temporary attributionSettings columns
        this.preUpdateWidget();
        // Set the new inputs into the widget
        const dataStoreInputs = new Map<string, WidgetInput>();
        const widgetInputs = new Map<string, WidgetInput>();
        this.inputs.forEach((val: WidgetInput, key: string) => {
            if (!isUndefined(widgetToUpdate.displayInputs.get(key))) {
                widgetInputs.set(key, cloneDeep(val));
            } else {
                dataStoreInputs.set(key, cloneDeep(val));
            }
        });
        const breakdown = dataStoreInputs.get('breakdownTree') as Breakdown;
        const origBreakdown = widgetToUpdate.dataStore.metaData.inputs.get('breakdownTree') as Breakdown;

        if (origBreakdown && !origBreakdown.equals(breakdown)) {
            const expandedState = widgetInputs.get(ExpandedState.CONFIG_TYPE) as ExpandedState;
            if (!isUndefined(expandedState)) {
                expandedState.reset([[ROOT_LEVEL]]);
            }
        }

        widgetToUpdate.title = this.displayTitle;
        widgetToUpdate.displayInputs = widgetInputs;
        const metaData = new WidgetDataStoreMetaData();
        metaData.parentMetaData = widgetToUpdate.dataStore.metaData.parentMetaData;
        metaData.inputs = dataStoreInputs;
        widgetToUpdate.dataStore.metaData = metaData;
        // stack breakdown and combo chart settings with different chart type are not supported.
        // We will reset combo chart settings chart type if stack breakdown is set and not empty
        this.resetChartTypesInComboChartSettingsIfStackedBreakdownIsNotEmpty(widgetToUpdate);
    }
}
