import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WidgetServiceRegistry} from '@services/widget/widget-service-registry';
import {ChartUtils} from '@utils/chart.utils';
import {WidgetUtils} from '@utils/widget.utils';
import {BatchExportingStore, WorkspaceStore} from '../../stores';
import {AppUtils} from '../../utils';
import {filter, takeUntil} from 'rxjs/operators';
import {
    ExportConstants,
    StatusConstants,
    URLConstants,
    WidgetConstants,
    WorkspaceMenuItemsConstants
} from '../../constants';
import {GridsterItemComponent, GridsterPush} from 'explore-angular-gridster2';
import {cloneDeep, isNil} from 'lodash';
import {NotificationService} from '../../shared/services';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {SpriteletLauncherServiceRegistry} from '@services/spritelet-launcher/spritelet-launcher-service.registry';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {WidgetConfigFactory} from '../../factories';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {PriceChartInputs} from '@models/price-chart-inputs/price-chart-inputs.model';
import {SplitColumnHeaderKey} from '@interfaces/response.interface';
import {ReportUtils} from '@utils/report.utils';
import {decidesChartingLib} from '@interfaces/decides-charting-lib.interface';
import {
    AuxInlineMenuInterface,
    AuxNotificationGroup,
    AuxTabBarItemInterface,
    AuxTabBarSelectedDetailInterface
} from '@blk/aladdin-angular-components';
import {TopBottomFilterInput} from '@models/widget/inputs/top-bottom-filter-input.model';
import {MinValFilter} from '@models/widget/inputs/min-val-filter.model';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {ExportUtils} from '@utils/export/export.utils';
import {AppStore} from '../../app.store';
import {FootnoteState} from '@models/widget/inputs/footnote-state.model';
import {ExportDownloadingStatus} from '@interfaces/export-downloading-status.interface';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';
import {BarChartSettings} from '@models/widget/inputs/chart-settings/bar-chart-settings.model';
import {ChartType} from '@qbstr/highcharts-api';
import {FactorPathInput} from '@models/widget/inputs/factor-path-input.model';
import {ROOT_LEVEL} from '@utils/qbstr';
import {BarChartAdditionalSettings} from '@models/widget/inputs/chart-settings/bar-chart-additional-settings.model';
import {
    AlertConstants,
    ChartWidgetInputConfigType,
    ColumnConfig,
    ColumnDescriptionTrackingParameters,
    CoreUserMetaDataStore,
    CoreWidgetConfigStore,
    CoreWidgetConstants,
    ErrorTypeConstants, SerializeFavoriteType,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryReportActionParameters,
    TelemetryService,
    TelemetryWidgetReloadParameters,
    UIErrorParameters,
    WidgetConfigType,
    WidgetCopyPasteEnum,
    WidgetDisplayInputConfigType,
    WidgetExportType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {ColumnSet, ScenarioColumnOption} from '@blk/explore-ui-column-option';
import {ApiRequestFactory} from '../../factories/api-request.factory';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {Notification} from '@models/widget/notification.model';
import {CustomFilter} from '@blk/explore-ui-breakdown';
import {ExportService} from '@services/export/export.service';
import {UIErrorTelemetryContextUtils} from '@utils/ui-error-telemetry.context.utils';
import {HideUnassignedFilterInput} from '@models/widget/inputs/hide-unassigned-filter-input.model';
import {FactorDataChartSettings} from '@models/widget/inputs/chart-settings/factor-data-chart-settings.model';
import {ShowAsChartInput} from '@models/widget/inputs/show-as-chart-input.model';
import {FactorTimeSeriesUtil} from '@enums/factor-time-series-selected-option.enum';
import {AxisSettings} from '@models/widget/inputs/chart-settings/axis-settings.model';
import {FactorBarCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {SecondaryAxis} from '@models/widget/inputs/chart-settings/secondary-axis.model';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';
import {HttpRequestQueueService} from '@services/http-request-queue/http-request-queue.service';
import {FavoriteConstants} from '@constants/favorite.constants';
import {ExportHubStore} from '@stores/export-hub.store';
import {ExportHubUtils} from '../export-hub/utils/export-hub.utils';
import {
    ExportHubJob,
    ExportHubJobWidget
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {ApiModelConversionService} from '@services/portfolio-analytics-api/api-model-conversion.service';

@Component({
    selector: 'app-widget',
    templateUrl: './widget.component.html',
    styleUrls: ['./widget.component.scss']
})
/**
 * Widget Component
 *
 * @example
 *  <ng-container *ngIf="report?.widgets">
 *      <gridster [options]="gridsterOptions">
 *          <gridster-item [item]="widget" *ngFor="let widget of report.widgets">
 *              <app-widget [widget]="widget" [portfolio]="portfolio" [report]="report"></app-widget>
 *          </gridster-item>
 *      </gridster>
 *  </ng-container>
 */
export class WidgetComponent extends SubscribableComponent implements OnInit, OnChanges {
    // height deduction for floating header
    private static readonly HEIGHT_DEDUCTIONS: number = 97;
    // width deduction for sidebar
    private static readonly WIDTH_DEDUCTIONS: number = 48;

    readonly WidgetConfigType = WidgetConfigType;
    readonly CHARTING_LIB = CoreWidgetConstants.CHARTING_LIB;
    notificationIDArray: string[] = [];

    /** The widget data */
    @Input() widget: Widget;

    /** The report that contains the widget */
    @Input() report: Report;

    /** The {@link GridsterItemComponent} that wraps this widget */
    @Input() gridsterItem: GridsterItemComponent;

    /** The portfolio that is currently selected */
    @Input() portfolio: Portfolio;

    /** Flag if this widget is used for a batch export */
    @Input() isBatchExport = false;

    /** Widget hidden status eg> on date change and portfolio change */
    @Input() widgetHiddenStatus$: BehaviorSubject<boolean>;

    @Input() showWidgetOptions = true;

    @Input() runHardRefresh = false;

    /** Outputs a call to minimize all widgets in the report */
    @Output() minimizeAllWidgets = new EventEmitter();

    isWidgetSettingsModalOpen = false;

    isWidgetApiRequestModalOpen = false;

    widgetInitialized = false;

    widgetTitle: string;

    widgetPayload: WidgetPayload;

    @ViewChild('widgetNotify', {static: false}) widgetLevelNotification: AuxNotificationGroup;

    // ViewChild to gain access to inner component for PDF export flow
    innerWidgetComponent: ElementRef;

    @ViewChild('widgetRender', {static: false}) set content(content: ElementRef) {
        if (this.isBatchExport) {
            this.innerWidgetComponent = content;
        }
    }

    exportForWidget = ExportConstants.EXPORT_WIDGET;

    chartingLib: string;

    showColumnDefinitionForColumn: ColumnConfig;

    isLoading$: BehaviorSubject<boolean>;

    // control price chart pop over
    priceChartInputs: PriceChartInputs;

    showGridTransitionControl: boolean;

    showCompareTabs: boolean;

    compareTabs: string[];

    compareTabsData: AuxTabBarItemInterface[];

    activeCompareTab = '0';

    showAsChartControl: boolean;

    showFilterIcon: boolean;

    exportOptions: AuxInlineMenuInterface[][] = [];

    exportingInProgress = false;

    // footnote is currently available only for FBA widget
    footnoteState: FootnoteState;
    isFootnoteChecked: boolean;

    exportNotSupported: boolean;

    refreshNotSupported: boolean;

    showTableSearch: boolean;
    isTableSearchActive$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    hasPayload: boolean;

    widgetNotification: Notification;

    suppressRootNode = false;

    readonly ChartWidgetInputConfigType = ChartWidgetInputConfigType;

    /**
     * constructor
     */
    constructor(
        private widgetServiceRegistry: WidgetServiceRegistry,
        private notificationService: NotificationService,
        private changeDetectorRef: ChangeDetectorRef,
        private spriteletLauncherServiceRegistry: SpriteletLauncherServiceRegistry,
        private exportService: ExportService,
        private appStore: AppStore,
        private httpRequestQueueService: HttpRequestQueueService,
        private exportHubStore: ExportHubStore,
        private apiModelConversionService: ApiModelConversionService
    ) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        if (!this.widget) {
            return;
        }

        this.appStore.exportDownloadingStatus$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((downloadStatus: ExportDownloadingStatus) => {
                this.exportingInProgress = ExportUtils.isExportDownloadingStatusValid(downloadStatus) && downloadStatus.exportComposite.widget && this.widget.id === downloadStatus.exportComposite.widget.id;
                this.changeDetectorRef.detectChanges();
            });

        // for loading, set widgetLoadingStatusMap
        // child spritelets that use parent data do not need loader
        this.setLoadingStatus(!this.widget.dataStore.isDependentOnParentForData);
        if (this.isBatchExport) {
            // Only add widgets that are not dependent on a parent data store to the loading status map
            if (!this.widget.dataStore.isDependentOnParentForData) {
                BatchExportingStore.widgetLoadingStatusMap.set(this.widget.id, this.isLoading$);
            }
        } else {
            WorkspaceStore.widgetLoadingStatusMap.set(this.widget.id, this.isLoading$);
        }

        this.refreshNotSupported = CoreWidgetConfigStore.getChartConfigForType(this.widget.configType).refreshNotSupported;

        this.chartingLib = WidgetConfigFactory.getWidgetChartingLib(this.widget.configType);
        this.widget.getCombinedInputs().forEach((widgetInput: WidgetInput) => {
            if (decidesChartingLib(widgetInput)) {
                this.chartingLib = widgetInput.getChartingLib();
                this.showAsChartControl = true;
            }
        });
        this.showGridTransitionControl = WidgetConfigFactory.getShowGridTransitionControl(this.widget.configType);
        // Need to make sure that when the widget is configured that the portfolio is set.
        this.updateWidgetDerivedSettings();

        this.footnoteState = (this.widget.displayInputs.get(FootnoteState.CONFIG_TYPE) as FootnoteState);
        if (this.footnoteState) {
            this.isFootnoteChecked = this.footnoteState.showFootnote;
        }
        this.setExportOptions();
        this.showTableSearch = WidgetConfigFactory.getShowTableSearch(this.widget.configType);

        this.initializeDataStoreSubscriptions();

        // set the flag to true, as widget has been initialized
        // Check if the filter at WhatIf should be applied to the widgets
        if (this.portfolio instanceof WhatIfPortfolio && this.portfolio.compositionSetting?.isApplyFilterToNewWidgetsChecked && !this.portfolio.compositionSetting.compositionFilter?.isFilterEmpty()) {
            this.widget.dataStore.metaData.inputs.set(WidgetInputType.FILTER, this.portfolio.compositionSetting.compositionFilter);
            if (this.portfolio.compositionSetting.isNormalized?.data) {
                this.widget.dataStore.metaData.inputs.set(FavoriteConstants.NORMALIZED_FLAG, this.portfolio.compositionSetting.isNormalized);
            }
            this.refreshWidget();
        }
        this.widgetInitialized = true;

    }

    /**
     * Subscribes to various data store changes
     */
    initializeDataStoreSubscriptions(): void {
        // Listen for changes to widget data..
        this.widget.dataStore.getData$().pipe(takeUntil(this.ngUnsubscribe), filter((payload) => !isNil(payload)))
            .subscribe((payload: WidgetPayload) => {
                this.updateWidgetPayloadOrDisplayNotification(payload);

                // refresh child widget if parent has updated
                if (this.widget.dataStore.isDependentOnParentForData) {
                    this.refreshChildWidget();
                }
            });

        if (this.widget.dataStore.metaData && this.widget.dataStore.metaData.dependentOnParentForMetaData()) {
            this.widget.dataStore.parentDataStore
                .getMetaData$()
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(() => {
                    if (this.widget.dataStore.parentDataStore.metaData.inputs.size > 0) {
                        this.widgetTitle = this.widget.title;
                        // Need to relink the spritelet column performance settings to the parent widget settings as they might have changed
                        this.updateWidgetDerivedSettings();
                        this.refreshWidget();
                    }
                });
        }
        this.widget.dataStore.getMetaData$()
            .pipe(
                takeUntil(this.ngUnsubscribe),
                filter((payload) => payload !== undefined)
            )
            .subscribe(() => {
                this.setWidgetHeaderFilterIcon();
                this.widget.setDisplayTitle(this.portfolio.datePicker);
                this.widgetTitle = this.widget.displayTitle;
                this.updateSettingsForFactorDataWidget();
                const runHardRefresh = this.isHardRefreshRequired();
                if (!this.widgetInitialized && AppUtils.getURLParamWithDefault(URLConstants.WIDGET_AUTO_LOAD, true) === 'false') {
                    // If widgetAutoLoad is set to false, skip sending a request for widget data upon initialization of the widget
                    // This is to be able to control sending unnecessary calls to the backend when we don't need them
                    this.isLoading$.next(false);
                    return;
                }
                this.refreshWidget(runHardRefresh);
            });
    }

    // Method to set export options
    setExportOptions() {
        // Export options
        const exportType = CoreWidgetConfigStore.getChartConfigForType(this.widget.configType).exportType;
        switch (exportType) {
            case WidgetExportType.NONE:
                this.exportNotSupported = true;
                break;
            case WidgetExportType.PDF:
                this.exportOptions = ExportConstants.EXPORT_OPTION_PDF_IMG;
                break;
            case WidgetExportType.IMAGE:
                this.exportOptions = [[ExportConstants.EXPORT_OPTION_IMAGE]];
                break;
            case WidgetExportType.EXCEL:
                this.exportOptions = [[ExportConstants.EXPORT_OPTION_EXCEL]];
                break;
            default:
                this.exportOptions = this.chartingLib === 'agGrid' ? ExportConstants.EXPORT_OPTION_PDF_EXCEL : ExportConstants.EXPORT_OPTION_PDF_EXCEL_IMG;
        }

        // Export option to generate Portfolio Analytics API request body
        const isApiRequestEnabled = CoreUserMetaDataStore.userMetaData.apiAccess;
        const isApiRequestSupported = ApiRequestFactory.widgetHasApiRequestType(this.widget.configType);
        if (isApiRequestEnabled && isApiRequestSupported) {
            this.exportOptions = [[
                ...(this.exportOptions[0] || []),
                ExportConstants.GENERATE_API_REQUEST_OPTION
            ]];
            if (ExportHubUtils.isExportHubEnabled()) {
                this.exportOptions[0].push(ExportConstants.SCHEDULE_JOB_OPTION);
            }
        }

    }

    /**
     * Detect any changed and handle the accordingly.
     */
    ngOnChanges(changes: SimpleChanges): void {
        // maximize widgets if is maximized is set to true
        if (changes.widget?.currentValue?.isMaximized) {
            this.maximizeWidget();
        }
        // If the widget has not been initialised then don't bother with the changes.
        if (!this.widgetInitialized) {
            return;
        }

        // If the portfolio has changed then update the derived settings prior to the refresh.
        if (changes.portfolio && changes.portfolio.currentValue !== changes.portfolio.previousValue) {
            this.updateWidgetDerivedSettings();
        }
    }

    isHardRefreshRequired(): boolean {
        if (this.isBatchExport && this.runHardRefresh) {
            return true;
        }
        const widgetInputs = this.widget.dataStore.metaData.inputs;
        const columnSet = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        if (!columnSet) {
            return false;
        }
        const scenarioColumnOptions: ScenarioColumnOption[] = columnSet.columns.map(column => column.optionValues.find(optionValue => optionValue instanceof ScenarioColumnOption) as ScenarioColumnOption).filter(scenarioColumn => scenarioColumn);
        if (scenarioColumnOptions.length === 0) {
            return false;
        }
        let isRefreshRequired = false;
        for (const scenarioColumnOption of scenarioColumnOptions) {
            isRefreshRequired = isRefreshRequired || scenarioColumnOption.refreshRequired;
            scenarioColumnOption.refreshRequired = false;
        }
        if (isRefreshRequired) {
            this.notificationService.warning(AlertConstants.NOTIFICATION.STRESS_SCENARIO_UPDATED);
            return true;
        }
        return false;
    }

    /**
     * Callback when one of the widget header icons is clicked in the more menu
     */
    onMoreMenuItemClicked(details: any): void {
        const menuOption = details.element.eventData;
        switch (menuOption) {
            case 'duplicate':
                this.copyWidget();
                break;
            case 'refresh':
                this.refreshWidget(true);
                break;
            case 'settings':
                this.openWidgetSettingsModal();
                break;
            case 'minimize':
                this.minimizeWidget();
                break;
            case 'maximize':
                this.maximizeWidget();
                break;
            case 'delete':
                this.deleteWidget(details.srcEvent);
                break;
            case 'tabularView':
                this.launchTabularView();
                break;
            case 'chartingLibChanged':
                this.changeChartingLib();
                break;
            case WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_PDF:
            case WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_IMAGE:
            case WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_EXCEL:
            case WorkspaceMenuItemsConstants.LABELS.GENERATE_API_REQUEST:
            case WorkspaceMenuItemsConstants.LABELS.SCHEDULE_JOB:
                this.onExportItemClicked(menuOption);
                break;
            case 'search':
                this.toggleTableSearch();
                break;
            case 'showFootnotes':
                this.showFootnote();
                break;
            default:
                console.warn('Not supported: ' + menuOption);
        }
    }

    /**
     * Set the widget header filter icon
     */
    setWidgetHeaderFilterIcon(): void {
        const inputs = this.widget.dataStore.metaData.inputs;
        this.showFilterIcon = (inputs.get(WidgetInputType.FILTER)
            && !(inputs.get(WidgetInputType.FILTER) as CustomFilter).isFilterEmpty())
            || !!TopBottomFilterInput.isValidTopBottomFilter(inputs.get(WidgetInputType.TOP_BOTTOM_FILTER))
            || !!MinValFilter.isValidMinValFilter(inputs.get(WidgetInputType.MIN_VAL_FILTER) as MinValFilter)
            || (inputs.get(WidgetInputType.HIDE_UNASSIGNED_FILTER) && (inputs.get(WidgetInputType.HIDE_UNASSIGNED_FILTER) as HideUnassignedFilterInput).hideUnassignedFilter);
    }

    /**
     * Callback to open widget settings
     */
    openWidgetSettingsModal(): void {
        this.isWidgetSettingsModalOpen = true;
    }

    /**
     * Close widget settings modal, bound with emit event
     */
    closeWidgetSettingsModal(): void {
        this.isWidgetSettingsModalOpen = false;
    }

    /**
     * Callback to open widget settings
     */
    openWidgetApiRequestModal(): void {
        this.isWidgetApiRequestModalOpen = true;
    }

    /**
     * Close widget settings modal, bound with emit event
     */
    closeWidgetApiRequestModal(): void {
        this.isWidgetApiRequestModalOpen = false;
    }

    /**
     * On refresh button click
     */
    onRefreshButtonClick(event: MouseEvent) {
        // if refresh button is clicked with Ctrl and shift together, enable debug context to enable additional conditional logging
        const debugContext = AppUtils.isCtrlPressed(event) && AppUtils.isShiftPressed(event);
        this.refreshWidget(AppUtils.isCtrlPressed(event), undefined, debugContext);
        this.trackWidgetRefreshedViaTelemetry(AppUtils.isCtrlPressed(event));
    }

    /**
     * track when users click on reload widget
     * @param hardRefresh
     */
    trackWidgetRefreshedViaTelemetry(hardRefresh?: boolean): void {
        if (this.widget) {
            const columnTags = AppUtils.getConfigColumnTags(this.widget);
            const reportUserActionParameters = new TelemetryWidgetReloadParameters(this.widget.configType.toString(), hardRefresh, columnTags, WidgetUtils.sanitizeString(this.widget.displayTitle));
            TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.RELOAD_WIDGET, reportUserActionParameters);
        }
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * Callback to refresh a widget
     */
    refreshWidget(hardRefresh?: boolean, bypassBrowserCache?: boolean, debugContext?: boolean): void {
        this.isTableSearchActive$.next(false);
        // if widget is dependent on a parent data store for data, there is not a call to the backend
        if (this.widget.dataStore.isDependentOnParentForData) {
            // update the subset of columns we are using for the child widget
            this.refreshChildWidget(hardRefresh);
            return;
        }
        // TODO if the user is holding down the Ctrl key, pass
        //  the 'byPass cache' flag to widgetDataService.extractDataAndStore (the flag and the cache are yet to be implemented)
        //  (Once done remove the "noinspection JSUnusedLocalSymbols" instruction above the method)
        const allPortfolios: Portfolio[] = this.isBatchExport ? BatchExportingStore.getPortfoliosForExport() : WorkspaceStore.getCurrentWorkpad().getAllPortfolios();
        const widgetDataService = this.widgetServiceRegistry.getService(this.widget.configType);
        if (widgetDataService) {
            widgetDataService.extractDataAndStore({
                widget: this.widget,
                portfolio: this.portfolio,
                report: this.report,
                allPortfolios,
                omitData: null,
                isBatchExport: this.isBatchExport,
                hardRefresh,
                bypassBrowserCache,
                debugContext
            });
        }
    }

    private refreshChildWidget(hardRefresh?: boolean): void {
        if (!this.widgetPayload) {
            return;
        }

        delete this.widgetPayload.customVizConfig.columns;
        const parentColumns = (this.widget.dataStore.parentDataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        // update the subset of columns we are using for the child widget
        if (this.widgetPayload.responseConfig.splitColumnKeys) {
            this.widgetPayload.customVizConfig.columns = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(this.widget.dataStore.metaData.inputs, this.widget.displayInputs, this.widget.configType, undefined, this.widgetPayload.responseConfig.columnHeaderDetails, this.widgetPayload.responseConfig.columns, this.widgetPayload.responseConfig.splitColumnKeys);
        } else {
            const widgetCols = (this.widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
            (this.widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns = widgetCols.filter((col: ColumnConfig) => {
                return parentColumns.find((parentCol) => col.columnTag === parentCol.columnTag);
            });
            if ((this.widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns.length === 0) {
                (this.widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns.push(parentColumns[parentColumns.length - 1]);
            }
            this.widgetPayload.customVizConfig.columns = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(this.widget.dataStore.metaData.inputs, this.widget.displayInputs, this.widget.configType, undefined, this.widgetPayload.responseConfig.columnHeaderDetails);
        }

        // Since Pie chart only supports one column at a time
        // so if there are more columns we need to filter the columns based on selectedColumnKey inside customVizConfig
        if (WidgetConfigType.FACTOR_GRAPHING_PIE_CHART === this.widget.configType && this.widgetPayload.customVizConfig.columns.length > 1) {
            if (this.widget.dataStore.data && this.widget.dataStore.data.customVizConfig && this.widget.dataStore.data.customVizConfig['selectedColumnKey']) {
                this.widgetPayload.customVizConfig.columns = this.widgetPayload.customVizConfig.columns.filter(col => col.columnKey === this.widget.dataStore.data.customVizConfig['selectedColumnKey']);
            } else { // default to first column if selectedColumnKey does not exist
                this.widgetPayload.customVizConfig.columns.splice(1, this.widgetPayload.customVizConfig.columns.length - 1);
            }
        }

        // Remap column keys
        if (!this.widgetPayload.responseConfig.splitColumnKeys) {
            this.widgetPayload.customVizConfig.columns.forEach((column: VizualizationColumnConfig) => {
                const parentCol = parentColumns.find((col) => col.columnTag === column.columnTag);
                if (parentCol.columnKey !== column.columnKey) {
                    column.columnKey = parentCol.columnKey;
                }
            });
        }

        delete this.widgetPayload.customVizConfig.queryKeys;

        const factorPathInput = this.widget.dataStore.metaData.inputs.get(FactorPathInput.configType) as FactorPathInput;
        // generate the composite keys for filtering a subset of the data cube
        if (factorPathInput && factorPathInput.path.length > 0) {
            // here we are trying to update ROOT value for the factorPath i.e. portfolio name, since it needs to update if the portfolio has changed
            factorPathInput.path[0].value = factorPathInput.path[0].level === ROOT_LEVEL
            && this.widgetPayload.requestConfig
            && this.widgetPayload.requestConfig.portfolio !== factorPathInput.path[0].level
                ? this.widgetPayload.requestConfig.portfolio
                : factorPathInput.path[0].value;
            this.widgetPayload.customVizConfig.queryKeys = WidgetUtils.generateQueryKeys(factorPathInput && factorPathInput.path);
        }

        // add the leaf level so that chart can drill down to it
        delete this.widgetPayload.customVizConfig.leafLevels;
        if (factorPathInput) {
            const parentColumnSet = this.widget.dataStore.parentDataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
            this.widgetPayload.customVizConfig.leafLevels = [WidgetUtils.getLeafBreakdownLevel(parentColumnSet)];
        }

        if (ChartUtils.isFactorGraphingBarSpritelet(this.widget.configType)) {
            this.updateWidgetPayloadForFBABar();
        }

        this.updateWidgetPayloadOrDisplayNotification(this.widgetPayload);
    }

    private updateWidgetPayloadForFBABar(): void {
        const widgetCombinedInputs = this.widget.getCombinedInputs();
        const secondaryAxis = widgetCombinedInputs.get(ChartWidgetInputConfigType.SECONDARY_AXIS_COLUMN) as SecondaryAxis;
        const comboChartColSettings = widgetCombinedInputs.get(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS) as ComboChartColumnSettings;
        const primaryAxisSettings = widgetCombinedInputs.get(ChartWidgetInputConfigType.PRIMARY_AXIS_SETTINGS) as AxisSettings;
        const secondaryAxisSettings = widgetCombinedInputs.get(ChartWidgetInputConfigType.SECONDARY_AXIS_SETTINGS) as AxisSettings;

        const sortedColsInput = widgetCombinedInputs.get(WidgetDisplayInputConfigType.SORTED_COLUMNS) as SortedColumns;
        const barChartSettings = widgetCombinedInputs.get(WidgetDisplayInputConfigType.CHART) as BarChartSettings; // can this be ChartWidgetInputConfigType.BAR_SETTINGS?

        const topBottomFilterInput = widgetCombinedInputs.get(WidgetInputType.TOP_BOTTOM_FILTER) as TopBottomFilterInput;
        const additionalSettings = widgetCombinedInputs.get(BarChartAdditionalSettings.configType) as BarChartAdditionalSettings;

        this.widgetPayload.customVizConfig = {
            ...this.widgetPayload.customVizConfig,
            showTotal: undefined,
            showGridLines: (widgetCombinedInputs.get(WidgetDisplayInputConfigType.SHOW_GRID_LINES) as GridLines)?.showGridLines,
            secondaryYAxis: secondaryAxis && typeof secondaryAxis.secondaryAxisColumn === 'string' ? secondaryAxis.secondaryAxisColumn : undefined,
            comboChartColumns: comboChartColSettings?.columns,
            sortOrder: this.getSortOrderForFBABar(sortedColsInput),
            sortBy: sortedColsInput?.sortedColumns?.[0]?.colId,
            chartOrientation: barChartSettings?.chartType === ChartType.COLUMN ? ChartType.COLUMN : ChartType.BAR,
            showBaseline: barChartSettings?.showBaseline,
            topBottomFilterParams: TopBottomFilterInput?.isValidTopBottomFilter(topBottomFilterInput) ? {
                top: topBottomFilterInput.top,
                bottom: topBottomFilterInput.bottom,
                columnKey: topBottomFilterInput.columnKey
            } : undefined,
            isStacked: additionalSettings?.isStacked,
            stackByImmediateChild: additionalSettings?.stackByImmediateChild,
            showSelected: this.widget.configType === WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART ? false : additionalSettings?.showSelected,
            selectedAsMeasureSeries: additionalSettings?.selectedAsMeasureSeries,
            selectedChartType: additionalSettings?.selectedChartType,
            selectedChartMarkerSymbol: additionalSettings?.selectedChartMarkerSymbol,
            hidePrimaryYAxisTitle: primaryAxisSettings?.hideAxisTitle,
            primaryYAxisOverride: primaryAxisSettings?.axisTitle,
            primaryYUpperBound: primaryAxisSettings?.yUpperBound,
            primaryYLowerBound: primaryAxisSettings?.yLowerBound,
            primaryYInterval: primaryAxisSettings?.yInterval,
            hideSecondaryYAxisTitle: secondaryAxisSettings?.hideAxisTitle,
            secondaryYAxisOverride: secondaryAxisSettings?.axisTitle,
            secondaryYUpperBound: secondaryAxisSettings?.yUpperBound,
            secondaryYLowerBound: secondaryAxisSettings?.yLowerBound,
            secondaryYInterval: secondaryAxisSettings?.yInterval,
        } as FactorBarCustomVizConfig;
    }

    /**
     * Gets the sort order for the FBA bar chart
     */
    getSortOrderForFBABar(sortedColsInput: SortedColumns): string {
        if (isNil(sortedColsInput?.sortedColumns?.[0]?.sort)) {
            return undefined;
        }
        return sortedColsInput.sortedColumns[0].sort === 'ASC' ? 'ASC' : 'DESC';
    }

    /**
     * Open alert dialog with delete widget callback
     */
    deleteWidget(event: MouseEvent): void {
        AppUtils.alertNotification(
            event,
            AlertConstants.HEADER.REMOVE_WIDGET,
            AlertConstants.BODY.REMOVE_WIDGET,
            AlertConstants.BTN.REMOVE,
            AlertConstants.BTN.CANCEL,
            this.deleteWidgetFromReport,
            this.notificationService
        );
    }

    /**
     * Callback function to delete widget
     */
    deleteWidgetFromReport = () => {
        WorkspaceStore.getCurrentReport().deleteWidget(this.widget);
        // cancel the request for the widget if it is queued
        this.httpRequestQueueService.cancelQueuedRequest(this.widget.id);
    }

    /**
     * Update widget derived settings with their parent settings
     */
    updateWidgetDerivedSettings(): void {
        WidgetUtils.updateWidgetWithPortfolioSettings(this.widget, this.portfolio);
        this.widgetTitle = this.widget.displayTitle;
    }

    /**
     * Show foot note (on FBA widget)
     */
    showFootnote(): void {
        this.isFootnoteChecked = !this.isFootnoteChecked;
        this.trackWidgetFootnoteCheckedViaTelemetry(this.isFootnoteChecked, this.widget, WorkspaceStore.getCurrentReport());
        (this.widget.displayInputs.get(FootnoteState.CONFIG_TYPE) as FootnoteState).showFootnote = this.footnoteState.showFootnote = this.isFootnoteChecked;

        this.widget.originalDimensions = cloneDeep(this.widget.dimensions);

        if (this.isFootnoteChecked) {
            this.widget.originalDimensions.rows *= 2;
        } else {
            this.widget.originalDimensions.rows /= 2;
        }

        this.updateWidgetDimension(
            this.widget.originalDimensions.x,
            this.widget.originalDimensions.y,
            this.widget.originalDimensions.cols,
            this.widget.originalDimensions.rows
        );
    }


    private trackWidgetFootnoteCheckedViaTelemetry(isFootnoteChecked: boolean, widget: Widget, currentReport: Report) {
        const actionType = isFootnoteChecked ? 'FOOTNOTE CHECKED' : 'FOOTNOTE UNCHECKED';
        const reportUserActionParameters = new TelemetryReportActionParameters({actionType, widgetTypes: Array.of(widget.configType.toString()),
                reportTitle: currentReport.title, reportId: currentReport.id, reportOwner: currentReport.owner, isWhatIfPortfolio: this.portfolio instanceof WhatIfPortfolio});
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.WIDGET_SHOW_FOOTNOTES, reportUserActionParameters);
    }
    /**
     * Maximizes a widget to fill screen below floating header and aligns widget to top of screen
     */
    maximizeWidget(): void {
        // only one widget can be maximized at a time, minimize all others
        this.minimizeAllWidgets.emit();

        // save original size and positioning for minimizing
        this.widget.originalDimensions = cloneDeep(this.widget.dimensions);

        // height minus the floating header
        const panelHeight = window.innerHeight - WidgetComponent.HEIGHT_DEDUCTIONS;
        // width minus the sidebar
        const panelWidth = window.innerWidth - WidgetComponent.WIDTH_DEDUCTIONS;
        const maximizedNumRows = Math.floor((panelHeight / panelWidth) * WidgetConstants.GRIDSTER_CONSTANTS.MAX_COLS);

        this.updateWidgetDimension(0, this.widget.dimensions.y, WidgetConstants.GRIDSTER_CONSTANTS.MAX_COLS, maximizedNumRows);

        this.widget.isMaximized = true;

        // scroll to the maximized widget, aligned to bottom
        // must use timeout so widget has enough time to maximize in DOM, otherwise we get a partial scroll
        setTimeout(() => this.gridsterItem.el.scrollIntoView({behavior: 'smooth', block: 'start'}), 400);
    }

    /**
     * Update widget dimension
     */
    private updateWidgetDimension(positionX: number, positionY: number, cols: number, rows: number): void {
        // due to limitations of gridster2, need to set the height of the widget to 0 and then incrementally grow
        // by minimum widget height to reach the max height
        for (let numRows = 0; numRows <= rows; numRows++) {
            this.resizePush(positionX, positionY, cols, numRows);
        }
    }

    /**
     * Callback to minimize widget back to original size
     */
    minimizeWidget(scrollToWidget: boolean = false): void {
        if (isNil(this.widget.originalDimensions)) {
            return;
        }

        // minimize widget
        if (
            this.resizePush(
                this.widget.originalDimensions.x,
                this.widget.originalDimensions.y,
                this.widget.originalDimensions.cols,
                this.widget.originalDimensions.rows
            )
        ) {
            this.widget.isMaximized = false;
        }

        // scroll to widget
        if (scrollToWidget) {
            this.gridsterItem.el.scrollIntoView({behavior: 'smooth', block: 'end'});
        }
    }

    /**
     * Resize a widget and creates a push event to push the other widgets down
     * @param xPosition  New point on x-axis to place widget
     * @param yPosition  New point on y-axis to place widget
     * @param numCols  New number of columns for widget to fill (x-axis)
     * @param numRows  New number of rows for widget to fill (y-axis)
     * @return  True if the resize and push was successful, false if the resize and push failed
     */
    resizePush(xPosition: number, yPosition: number, numCols: number, numRows: number): boolean {
        const origX = this.gridsterItem.$item.x;
        const origY = this.gridsterItem.$item.y;
        const origCols = this.gridsterItem.$item.cols;
        const origRows = this.gridsterItem.$item.rows;

        let resizeSuccess = true;

        // create a push instance which tries to push overlapped widgets down
        const push = new GridsterPush(this.gridsterItem);
        this.gridsterItem.$item.x = xPosition;
        this.gridsterItem.$item.y = yPosition;
        this.gridsterItem.$item.cols = numCols;
        this.gridsterItem.$item.rows = numRows;
        if (push.pushItems(push.fromNorth)) {
            // push other widgets down
            push.checkPushBack(); // check for items can restore to original position
            push.setPushedItems(); // save the items pushed
            this.gridsterItem.setSize();
            this.gridsterItem.checkItemChanges(this.gridsterItem.$item, this.gridsterItem.item);
        } else {
            // push failed, revert to previous size and undo push
            this.gridsterItem.$item.x = origX;
            this.gridsterItem.$item.y = origY;
            this.gridsterItem.$item.cols = origCols;
            this.gridsterItem.$item.rows = origRows;
            push.restoreItems(); // restore pushed items to initial states
            resizeSuccess = false;
        }
        push.destroy();

        return resizeSuccess;
    }

    /**
     * Copy a widget config to the clipboard for paste use.
     */
    copyWidget(): void {
        const widgetConfig = cloneDeep(this.widget);
        const ds = widgetConfig.dataStore;
        const config = {
            nestedWidgetConfig: widgetConfig.serialize(true),
            nestedDataStore: ds ? ds.serialize(true) : {},
            nonNestedWidgetConfig: widgetConfig.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE),
            nonNestedDataStore: ds ? ds.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE) : {},
            href: AppUtils.getHref(),
            reportKey: WorkspaceStore.getCurrentReport().key
        };
        // If the copy command was executed successfully then show the notification.
        AppUtils.copyTextToClipboard(JSON.stringify(config))
            ? this.widgetCopiedSuccessfullyNotification()
            : this.widgetCopiedErrorNotification();
    }



    /**
     * alerts the user that the widget was copied successfully
     * invokes trackWidgetCopiedViaTelemetry, to track the action
     * @private
     */
    private widgetCopiedSuccessfullyNotification(): void {
        this.notificationService.success('Widget copied.');
        this.trackWidgetCopiedViaTelemetry(WidgetCopyPasteEnum.WIDGET_COPIED);
    }

    /**
     * alerts the user that the widget was not copied successfully
     * invokes trackWidgetCopiedViaTelemetry, to track the action
     * @private
     */
    private widgetCopiedErrorNotification(): void {
        this.notificationService.error('Failed to copy widget.', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_COPY_WIDGET_ERROR);
        this.trackWidgetCopiedViaTelemetry(WidgetCopyPasteEnum.COPY_ERROR_FAILED_TO_COPY_WIDGET);
    }

    /**
     * tracks (un)successful action of a widget being copied
     * @param actionType: 'WIDGET_COPIED' or 'ERROR_FAILED_TO_COPY_WIDGET'
     * @private
     */
    private trackWidgetCopiedViaTelemetry(actionType: string) {
        const reportUserActionParameters = new TelemetryReportActionParameters({actionType, widgetTypes: Array.of(this.widget.configType.toString()),
            reportTitle: this.report.title, reportId: this.report.id, reportOwner: this.report.owner, isWhatIfPortfolio: this.portfolio instanceof WhatIfPortfolio});
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.WIDGET_COPY_PASTE, reportUserActionParameters);
    }

    /**
     * Assigns a given widget payload to its own instance, or if the given widget payload has notification,
     * shows it in the widget.
     *
     * @param payload a payload with the information to show in the widget
     */
    updateWidgetPayloadOrDisplayNotification(payload: WidgetPayload) {
        if (payload && payload.notification) {
            if (this.widgetLevelNotification) {
                // close any existing notification only if it has different id than current notification
                // before opening a new one, otherwise the notification gets closed.
                if (payload.notification.id !== this.widgetNotification?.id) {
                    (this.widgetLevelNotification as any).close(this.widgetNotification?.id);
                }
                payload.notification.widgetConfigType = this.widget.configType;
                payload.notification.widgetTitle = this.widget.displayTitle;

                UIErrorTelemetryContextUtils.notificationTrack(payload.notification);
                // open a new notification
                (this.widgetLevelNotification as any).open(payload.notification.toPlainObj());
            }

            this.widgetNotification = payload.notification;
            // reset loading indicator
            const widgetLoadingStatus$ = AppStore.getWidgetLoadingStatus$(this.widget.id, this.isBatchExport);
            if (widgetLoadingStatus$) {
                widgetLoadingStatus$.next(false);
            }
        }

        // NOTE:  This needs to do a copy of the payload otherwise 2 widgets with the same parent payload gets the columns slammed over.
        //        also need to copy the custom vis object as that is where the columns live.
        this.widgetPayload = payload && payload.notification ? null : {...payload};
        if (!this.widgetPayload) {
            this.changeDetectorRef.markForCheck();
            return;
        }
        if (this.widgetPayload && this.widgetPayload.customVizConfig) {
            this.widgetPayload.customVizConfig = {...this.widgetPayload.customVizConfig};
        }

        // close any existing notifications as they cause issue with test automation
        (this.widgetLevelNotification as any)?.close(this.widgetNotification?.id);

        // If this is a comparison widget then setup what is required for it.
        // NOTE:  A comparison can happen in 2 ways:
        //        1.  Compare mode is enabled.
        //        2.  A column that spawns child columns is selected, eg.  KRDs. (Not in Scatter Chart)
        //        3.  Slope graph having more than one column
        const isMultiColumnSlopeGraph = WidgetConfigType.SLOPE_GRAPH === this.widget.configType && this.widgetPayload.requestConfig.columns.length > 1;
        // Do not show compare tabs if No Breakdown is configured for scatter/treemap in comparison mode
        const isNoBrkdwnChartComparison = (WidgetConfigType.SCATTER === this.widget.configType || WidgetConfigType.TREEMAP === this.widget.configType) && this.widgetPayload.breakdownLevels.length < 2 && WorkspaceStore.getCurrentWorkpad()?.isCompareMode(this.report.comparisonConfigId);
        this.showCompareTabs = this.isShowCompareOn(isNoBrkdwnChartComparison, isMultiColumnSlopeGraph);
        if (this.showCompareTabs && this.widgetPayload) {
            this.compareTabs = [];

            if (!isMultiColumnSlopeGraph) {
                const splitColumnKeys: SplitColumnHeaderKey[] = this.widgetPayload.responseConfig.splitColumnKeys[Object.keys(this.widgetPayload.responseConfig.splitColumnKeys)[0]];
                splitColumnKeys.forEach((splitColumnHeaderKey: SplitColumnHeaderKey) => {
                    this.compareTabs.push(splitColumnHeaderKey.header);
                });
            } else {
                this.widgetPayload.requestConfig.columns.forEach((column: VizualizationColumnConfig) => {
                    this.compareTabs.push(column.columnTitle);
                });
            }

            // This will check for the currently active tab name before the tabs get updated.
            const activeTabName = this.compareTabsData?.find(tab => tab.uid.toString() === this.activeCompareTab)?.label;
            this.compareTabsData = this.compareTabs.map( (tab, index) => {
                return {
                    label: tab, uid: index, eventData: tab
                } as unknown as AuxTabBarItemInterface;
            });

            this.checkCurrentActiveTab(activeTabName);

            if (!this.widgetPayload.customVizConfig || !this.widgetPayload.customVizConfig.header) {
                this.widgetPayload.customVizConfig = {
                    ...this.widgetPayload.customVizConfig,
                    header: this.compareTabs[0]
                };
                this.activeCompareTab = '0';
            }
        }

        this.setPayloadStatus(!isNil(this.widgetPayload));
        this.changeDetectorRef.markForCheck();
    }

    /**
     * check if compare mode is ON
     * @param isNoBrkdwnChartComparison
     * @param isMultiColumnSlopeGraph
     */
    private isShowCompareOn(isNoBrkdwnChartComparison: boolean, isMultiColumnSlopeGraph: boolean) {
        return (this.widgetPayload &&
            (WorkspaceStore.getCurrentWorkpad()?.isCompareMode(this.report.comparisonConfigId) || (!isNil(this.widgetPayload.responseConfig.splitColumnKeys)
                && (WidgetConfigType.SCATTER !== this.widget.configType)))
            && WidgetConfigFactory.getShowCompareTabs(this.widget.configType)
            && !isNoBrkdwnChartComparison) || isMultiColumnSlopeGraph;
    }

    /**
     * If the active tab is not the first one, we compare the active tab name to the updated tabs coming in.
     * If it's able to find the tab name in the updated tabs with the uid, then we will use the current tab data.
     * Otherwise, it will default to the first tab.
     * @param activeTabName
     */
    private checkCurrentActiveTab(activeTabName: string) {
        if (this.activeCompareTab !== '0' && (!this.widgetPayload.customVizConfig || Object.keys(this.widgetPayload.customVizConfig).length === 0)) {
            const tabName = this.compareTabsData?.find(tab => tab.uid.toString() === this.activeCompareTab)?.label;
            if (activeTabName === tabName) {
                this.widgetPayload.customVizConfig = {
                    ...this.widgetPayload.customVizConfig,
                    header: tabName
                };
            }
        }
    }

    /**
     * Callback method invoked from explore table component when the user right clicked to launch a spritelet
     */
    widgetSpriteletLaunched(event: SpriteletEvent) {
        const spriteletLauncherService = this.spriteletLauncherServiceRegistry.getSpriteletLauncherService(event.actionName);
        if (spriteletLauncherService) {
            const callback = event.callbackMethodName ? this[event.callbackMethodName] : () => {
                this.changeDetectorRef.markForCheck();
            };
            spriteletLauncherService.launchSpritelet(this.widget, event, callback);
        }
    }

    /**
     * Launch the tabular view (risk and exposure) widget from this chart widget
     */
    launchTabularView() {
        this.widgetSpriteletLaunched(new SpriteletEvent(WidgetConstants.TABULAR_VIEW_SPRITELET.ACTION_KEY, null));
    }

    /**
     * Callback method to launch/close column definition popover
     */
    setShowColumnDefinitionForColumn = (column?: ColumnConfig) => {
        this.showColumnDefinitionForColumn = column;
        if (column) {
            // log request to show col def
            const columnTrackingParams = new ColumnDescriptionTrackingParameters(column.columnTag);
            TelemetryService.track(
                TelemetryActionConstants.COLUMN.SHOW_COLUMN_DEFINITION,
                columnTrackingParams);
        }
    };

    /**
     * SubscribableComponent.onDestroy()
     */
    protected onDestroy() {
        // QueryKeys for PGS chart widgets are stored in customVizConfig in data and needs to remain in the widget data
        if (!ChartUtils.isPGSSpritletWidget(this.widget.configType)) {
            this.widget.dataStore.data = null;
        }
        WorkspaceStore.widgetLoadingStatusMap.delete(this.widget.id);
        // Check whether rest of the widgets are loading or not
        ReportUtils.checkIsReportLoading();
    }

    /**
     * Callback method to launch price chart popover
     */
    setShowPriceChart = (priceChartInputs: PriceChartInputs) => {
        this.priceChartInputs = priceChartInputs;
    };

    /**
     * Method invoked when compare tab is clicked in charts
     */
    onComparePortTabSelected(event: CustomEvent<AuxTabBarSelectedDetailInterface>) {
        this.activeCompareTab = event.detail.uid;
        this.widgetPayload.customVizConfig = {
            ...this.widgetPayload.customVizConfig,
            header: event.detail.eventData
        };
        const widgetPayloadCopy = cloneDeep(this.widgetPayload);
        this.updateWidgetPayloadOrDisplayNotification(widgetPayloadCopy);
    }

    /**
     * Method invoked when the widget's charting lib is changed
     */
    changeChartingLib() {
        this.widget.getCombinedInputs().forEach((widgetInput: WidgetInput) => {
            if (decidesChartingLib(widgetInput)) {
                widgetInput.toggleChartingLib();
                this.chartingLib = widgetInput.getChartingLib();
                this.setExportOptions();
                this.changeDetectorRef.markForCheck();
            }
        });
    }

    /*
    * Event method to capture the changed header name
    */
    headerInputValueChanged(value: string) {
        this.widgetTitle = value;
        this.widget.title = value;
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Method is triggered when export icon is clicked
     */
    onExportItemClicked(exportType: string): void {
        if (this.widget.configType === WidgetConfigType.TIME_SERIES
            && WorkspaceStore.getCurrentWorkpad()?.isCompareMode(this.report.comparisonConfigId)
            && (exportType === WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_IMAGE || exportType === WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_EXCEL)) {
            const exportingType = exportType === WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_IMAGE ? 'Image' : 'Excel';
            this.notificationService.warning(`${exportingType} exporting is not currently supported in time series comparison mode.`, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.ACTION);
            return;
        }

        switch (exportType) {
            case WorkspaceMenuItemsConstants.LABELS.GENERATE_API_REQUEST:
                this.openWidgetApiRequestModal();
                break;
            case WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_IMAGE: {
                const exportComposite = ExportUtils.getExportComposite(exportType, this.exportForWidget, this.widget, this.chartingLib);
                this.appStore.updateExportDownloadingStatus(true, exportComposite);
                this.exportService.processPDF(exportComposite);
                break;
            }
            case WorkspaceMenuItemsConstants.LABELS.SCHEDULE_JOB: {
                this.validateWidgetForExportJob().subscribe({
                    next: () => {
                        const scheduledJob = new ExportHubJob();
                        const exportHubWidget = new ExportHubJobWidget();
                        exportHubWidget.setTitle(this.widget.displayTitle);
                        exportHubWidget.setWidgetType(CoreWidgetConfigStore.getChartConfigForType(this.widget.configType).title);
                        try {
                            exportHubWidget.setWidgetSetting(ExportHubUtils.encodeWidgetSettingsForScheduledJob(this.widget));
                        } catch (e) {
                            this.notificationService.error(e.message);
                            return;
                        }
                        scheduledJob.addJobWidgets(exportHubWidget);
                        this.exportHubStore.openScheduleJobModal(scheduledJob);
                    },
                    error: (err: any) => this.notificationService.error(err.message ? err.message : 'Failed to validate widget for scheduled job', null, null, true)
                });
                break;
            }
            default:
                this.appStore.openExportOptionsModal$.next(ExportUtils.getExportComposite(exportType, this.exportForWidget, this.widget, this.chartingLib));
                break;
        }
    }

    setLoadingStatus(isLoading: boolean) {
        this.isLoading$ = new BehaviorSubject<boolean>(isLoading);
    }

    setPayloadStatus(hasPayload: boolean) {
        this.hasPayload = hasPayload;
    }

    toggleTableSearch() {
        this.isTableSearchActive$.next(!this.isTableSearchActive$.value);
    }

    /**
     * This method is specific to Factor Data Widget.
     * This method opens the widget-settings modal when the widget is created from FBA widget and
     * hides showAsChartControl for Risk Matrix mode and
     * updates the export options based on showAsChartInput
     * @private
     */
    private updateSettingsForFactorDataWidget(): void {
        if (this.widget.configType !== WidgetConfigType.FACTOR_DATA) {
            return;
        }

        const showAsChartInput = this.widget.dataStore.metaData.inputs.get(ShowAsChartInput.configType) as ShowAsChartInput;
        const factorDataChartSettings = this.widget.dataStore.metaData.inputs.get(FactorDataChartSettings.configType) as FactorDataChartSettings;
        const factorSelectedOption = FactorTimeSeriesUtil.getDisplayName(factorDataChartSettings.factorTimeSeriesSelectedOption);

        this.widgetTitle = this.widget.displayTitle + ' - ' + factorSelectedOption;

        // When Factor Data widget is added for the first time, open the widget-settings-modal.
        if (!this.widgetInitialized) {
            this.isWidgetSettingsModalOpen = factorDataChartSettings.isDefaultWidgetSettingsModalOpen;
            this.suppressRootNode = true;
            factorDataChartSettings.isDefaultWidgetSettingsModalOpen = false;
        }

        if (factorDataChartSettings.isTimeSeriesMode) {
            if (!this.showAsChartControl) {
                // This is when mode is switched from Risk Matrix to Time Series.
                // set showAsChart as false because this will get toggled in changeChartingLib method.
                showAsChartInput.showAsChart = false;
                this.changeChartingLib();
            }
        } else {
            // set showAsChart as true because this will get toggled in changeChartingLib method.
            showAsChartInput.showAsChart = true;
            this.changeChartingLib();
        }

        // This line must be kept at the end of this method
        // Show the showAsChartControl button on menu item when the TimeSeries mode is selected.
        this.showAsChartControl = factorDataChartSettings.isTimeSeriesMode;
    }

    /**
     * Validate widget for Export Job by making a generateApiRequest() call
     * @private
     */
    private validateWidgetForExportJob(): Observable<string> {
        const [isGenerateApiRequestSupported, unsupportedMessage] = ExportUtils.checkGenerateApiRequestSupported(this.portfolio);
        if (!isGenerateApiRequestSupported) {
            return throwError(() => {
                return { message: unsupportedMessage};
            });
        }
        const generateApiRequestPayload = this.apiModelConversionService.getGenerateApiRequestPayload(this.widget, this.portfolio);
        return this.apiModelConversionService.convertExploreModelToApiModel$(generateApiRequestPayload, StatusConstants.VALIDATING_EXPORT_HUB_JOB);
    }
}
