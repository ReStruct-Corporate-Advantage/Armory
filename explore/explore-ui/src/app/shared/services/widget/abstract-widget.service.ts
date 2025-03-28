import {ColumnSet, OverrideDateColumnOption} from '@blk/explore-ui-column-option';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {
    AlertConstants,
    CalendarDateUtils,
    ChartWidgetInputConfigType,
    ColumnConfig,
    ColumnConstants, CommonUtils,
    CoreConfigUtils,
    CoreFavoriteConstants,
    DateFormatConstants,
    ErrorTypeConstants,
    getWidgetType,
    TelemetryActionConstants,
    TelemetryCollapsedLookThroughErrorParameters,
    TelemetryService,
    UIErrorParameters,
    WidgetConfigInput,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {NotificationConstants} from '@constants/notification.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Breakdown, ColumnBreakdown} from '@blk/explore-ui-breakdown';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ExploreDataRequest} from '@models/requests/explore-data-request.model';
import {TopBottomFilterInput} from '@models/widget/inputs/top-bottom-filter-input.model';
import {Notification} from '@models/widget/notification.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WorkspaceStore} from '@stores/workspace.store';
import {HighlightUtils} from '@utils/highlight.utils';
import {ObjectUtils} from '@utils/object.utils';
import {createDataCube, DataCubeContext} from '@utils/qbstr';
import {WidgetUtils} from '@utils/widget.utils';
import {isNil, some} from 'lodash';
import moment from 'moment';
import {first, map} from 'rxjs/operators';
import {AppStore} from '../../../app.store';
import {CommonConstants, CompositionConstants, DataRequestConstants} from '../../../constants';
import {WidgetConfigFactory} from '../../../factories';
import {WidgetInputValidatorFactory} from '../../../factories/widget-input-validator.factory';
import {ExploreResponse, ExploreResponseConfig, RequestAdapterConfig, YAxisOverridable} from '../../../interfaces';
import {
    CollapsedLookthroughColumnOption
} from '@models/columns/column-options/collapsed-lookthrough-column-option.model';
import {PortfolioRule} from '@models/portfolio/tradeRules/portfolio-rule.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {WorkpadUtils} from '@utils/workpad.utils';
import {RequestValidationUtils} from '@utils/request-validation.utils';
import {ErrorCodeLookupUtils} from '@utils/error-code-lookup.utils';
import {AxisSettings} from '@models/widget/inputs/chart-settings/axis-settings.model';
import {ModellingType} from '@enums/modelling-type.enum';
import {ChartUtils} from '@utils/chart.utils';
import {NotificationService} from '@services/notification';
import {WidgetServiceData} from '@interfaces/widget-service-data.interface';
import {AuxNotificationStyleEnum, AuxNotificationToastTypeEnum} from '@blk/aladdin-angular-components';

/**
 * Defines common behaviour for the widget data services
 */
export abstract class AbstractWidgetService {

    public readonly NO_DATA_IN_RESPONSE = 'No data in the response';
    public readonly NO_DATA_IN_RESPONSE_WITH_MSG = this.NO_DATA_IN_RESPONSE + ', response.message =';

    /**
     *
     * @param widgetInputs widget inputs to extract the breakdown from
     * @param breakdownInputName name of the breakdown in the given widgetInputs' keys.
     * @return extracted breakdown, or <code>undefined</code> if there is no breakdown
     * with the given breakdownInputName or the extracted breakdown is empty.
     */
    static getBreakdown(widgetInputs: Map<string, WidgetInput>, breakdownInputName: string): Breakdown {
        const breakdownWidgetInput: WidgetInput = widgetInputs.get(breakdownInputName);

        if (breakdownWidgetInput instanceof Breakdown && !breakdownWidgetInput.isEmpty()) {
            return breakdownWidgetInput;
        }
        return undefined;
    }

    /**
     * Creates request parameters that are not specific to the widget
     * @param report a report in which the widget resides
     * @param widget a widget for which the request params are being created
     * @param isPortfolioAnchor boolean if portfolio is selected as an anchor portfolio
     */
    static createNonWidgetRequestParams(report: Report, widget: Widget, isPortfolioAnchor: boolean): any {
        // create request parameters
        const owner = WorkspaceStore.getWorkspace().owner;

        return {
            layout: report.title,
            todayDate: CalendarDateUtils.getDateInFormat(CalendarDateUtils.checkOverrideAndGetToday(), DateFormatConstants.MMDDYYYY_SLASH),
            isAnchorPortfolio: isPortfolioAnchor,
            isEnterpriseWorkspace: CoreFavoriteConstants.ADMIN === owner,
            isFavoriteWidget: ((WorkspaceStore.getWorkspace().id || report.id) && !widget.isNewlySaved)
        };
    }

    /**
     * Creates a new instance with the given parameters
     * @param baseUrl url for the backend server request
     * @param exploreDataRequestService a service to use to 'talk' to the backend server
     * @param widgetConfigTypes  config types of the widgets for which the service extract the data
     * @param widgetDataViewOption required data view for the widget
     */
    constructor(
        protected baseUrl: string,
        protected exploreDataRequestService: ExploreDataRequestService,
        protected widgetConfigTypes: WidgetConfigType[],
        protected widgetDataViewOption: WidgetDataViewOption,
        protected notificationService?: NotificationService) {
        // Empty
    }

    /**
     * Let's subclasses modify the widget inputs before they are used to generated the request.
     * The subclasses are free to do nothing if no modifications are required.
     * @param widgetInputs original widget inputs
     * @param widget a widget for which the inputs are to be modified
     */
    protected abstract modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget, isExportRequest?: boolean): void;

    /**
     * @return the widget config types for which this service should be used
     */
    getWidgetConfigTypes(): string[] {
        return this.widgetConfigTypes;
    }

    /**
     * return basic multiPortCompare URL
     */
    getMultiPortCompareUrl(): string {
        return DataRequestConstants.DATA_REQUEST_URL.MULTI_PORT_COMPARE;
    }

    /**
     * this is base method for returning cusip identifierColumn
     * Other class can override this and return specific identifier column as per need
     */
    getIdentifierColumn() {
        return ColumnConstants.CUSIP_IDENTIFIER_COLUMN;
    }

    /**
     *
     * @return static widget request parameters
     */
    getStaticWidgetRequestParams(): any {
        const staticWidgetRequestParams: any = {
            dataFormat: DataRequestConstants.DATA_FORMAT.COMPACT_JSON
        };

        if (this.widgetDataViewOption === WidgetDataViewOption.SECTOR_VIEW) {
            staticWidgetRequestParams.isSectorView = 'Y';
        }
        return staticWidgetRequestParams;
    }

    /**
     * creating final request param as per condition
     */
    public createFinalDataRequest(widget: Widget, portfolios: Portfolio[], report: Report, modifiedWidgetInputs: Map<string, WidgetInput>, isExportRequest?: boolean, omitData?: boolean, isBatchExport?: boolean): ExploreDataRequest {
        // Let the subclasses modifiy the widget inputs if required.
        // For instance, a bar chart service will create one breakdown input from two breakdown inputs (stacked and sector)
        // (Get a copy of the widget meta data's inputs first to ensure the original inputs are not modified.)
        this.modifyWidgetInputsForRequest(modifiedWidgetInputs, widget, isExportRequest);

        // Create request parameters
        const requestParams = this.createRequestParams(report, widget, portfolios, modifiedWidgetInputs, isExportRequest, omitData, isBatchExport);
        requestParams.forEach((params: any) => {
            if (WorkspaceStore.getCurrentWorkpad()?.isCompareMode(report.comparisonConfigId)) {
                this.addIdentifierColumn(params);
            }
        });

        // Determine the set of request params to send across the wire
        return new ExploreDataRequest(requestParams);
    }

    /**
     * Creates a request for the given parameters, extracts data from the backend server and saves in the datastore
     *
     * @param widgetServiceData a data object containing the -
     * widget,
     * portfolio,
     * report,
     * allPortfolios,
     * omitData,
     * isBatchExport,
     * harRefresh,
     * bypassBrowserCache,
     * debugContext,
     * customizeResponse
     */
    extractDataAndStore(widgetServiceData: WidgetServiceData) {
        const {
            widget,
            portfolio,
            report,
            allPortfolios,
            omitData,
            isBatchExport,
            hardRefresh,
            bypassBrowserCache,
            debugContext,
            customizeResponse
        } = widgetServiceData;
        const portfolios: Portfolio[] = WorkspaceStore.getCurrentWorkpad()?.isCompareMode(report.comparisonConfigId) && WorkpadUtils.getPortfoliosToCompare(report, allPortfolios).length > 0 ? WorkpadUtils.getPortfoliosToCompare(report, allPortfolios) : [portfolio];

        let canProcessRequest = true;

        portfolios.forEach((port: Portfolio) => {
            // Check if can proceed with the data extraction
            const notification: Notification = this.validateInputs(widget, port, report);
            if (notification) {
                // Could not get data for the request, something unexpected occurred - show an error
                // Store the payload for rendering in the widget's data store
                // For PGS chart widgets, we want to preserve the customVizConfig
                widget.dataStore.data = ChartUtils.isPGSGraphingSpritelet(widget.configType) ? {widgetConfigType: widget.configType, notification, customVizConfig: widget.dataStore?.data?.customVizConfig} : {widgetConfigType: widget.configType, notification};                canProcessRequest = false;
                AppStore.loadAllRequestSubject$.next({widget, port: portfolio});
                return;
            }
        });

        if (!canProcessRequest) {
            if (isBatchExport) {
                this.exploreDataRequestService.removeWidgetWithNotificationFromBatchMap(widget.id);
            }
            return;
        }

        // (Get a copy of the widget meta data's inputs first to ensure the original inputs are not modified.)
        const modifiedWidgetInputs: Map<string, WidgetInput> = new Map(widget.dataStore.metaData.inputs);

        const serverRequest = this.createFinalDataRequest(widget, portfolios, report, modifiedWidgetInputs, undefined, omitData, isBatchExport);
        serverRequest.isBatchExport = isBatchExport;
        serverRequest.widgetId = widget.id;
        serverRequest.hardRefresh = hardRefresh;
        serverRequest.debugContext = debugContext;
        serverRequest.reportTitle = report.title;
        serverRequest.widgetTitle = widget.displayTitle;
        serverRequest.workspaceTitle = WorkspaceStore.getWorkspace().title;
        serverRequest.workspaceOwner = WorkspaceStore.getWorkspace().owner;


        // adding params for loading to handle in interceptor
        const paramsOptions: any = {widgetId: widget.id.toString()};

        if (isBatchExport) {
            paramsOptions.isBatch = 'true';
        }
        const isCompareMode = WorkspaceStore.getCurrentWorkpad()?.isCompareMode(report.comparisonConfigId);
        const urlToBeUsed: string = this.getUrlToBeUsed(isCompareMode);

        // Extract data from the backend server and store it in the datastore
        this.exploreDataRequestService.getData$(serverRequest, isCompareMode, urlToBeUsed, bypassBrowserCache, omitData)
            .pipe(
                first(),
                map(customizeResponse ? customizeResponse : response => response)
            )
            .subscribe((response: ExploreResponse) => {
                // If we have cancelled response from the request OR request is duplicate, then return.
                if (response.message === DataRequestConstants.DUPLICATE_REQUEST || response.message === DataRequestConstants.CANCELLED_RESPONSE) {
                    return;
                }

                if (response && omitData) {
                    for (const port of portfolios) {
                        AppStore.loadAllRequestSubject$.next({widget, port});
                    }
                    return;
                }

                // If this request is not the last request generated from this widget, then we'll consider it to be 'soft canceled'
                // 'Soft canceled' means we want to add the data to the cache but we don't want to populate the widget
                if (ExploreDataRequestService.widgetRequestMap[widget.id] !== serverRequest.getCacheKey()) {
                    return;
                }

                // Check QC
                this.checkIsNullQC(portfolio, response);

                this.handleResponse(serverRequest.requestParams[0], response, widget, modifiedWidgetInputs, WorkspaceStore.getCurrentWorkpad()?.isCompareMode(report.comparisonConfigId));
            }, error => {
                widget.dataStore.data = {notification: Notification.createErrorNotification(error instanceof Error ? error.message : error, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_DATA_ERROR)};
                console.error(error + ' while getting data for ' + widget.configType);
            });
    }

    /**
     * get the URL to be used for the request
     * @param isCompareMode
     * @protected
     */
    protected getUrlToBeUsed(isCompareMode: boolean): string {
        return isCompareMode ? this.getMultiPortCompareUrl() : this.baseUrl;
    }

    /**
     * Add identifierColumn boolean to requestColumn to be true
     */
    addIdentifierColumn(compareParam: any) {
        let identifierColPresent = false;
        const identifierColumn = this.getIdentifierColumn();

        if (!identifierColumn) {
            return;
        }

        for (const col of compareParam.columns) {
            if (col.columnTag === identifierColumn.columnTag) {
                // We have identifier Column in request will set request identifierColPresent as true
                identifierColPresent = true;
                col.identifierColumn = true;
                break;
            }
        }

        if (!identifierColPresent) {
            // If identifierCol is not present then add
            compareParam.columns.push(identifierColumn);
        }
    }

    /**
     * Creates request parameters by extracting the required information from the given parameters
     * @param report a report in which the given widget resides
     * @param widget a widget for which the request params are to be created
     * @param portfolios portfolios for which the data is to be extracted
     * @param widgetInputs modified widget inputs which would be used to create widget request params
     * @param isExportRequest true when call is from export.service
     * @param omitData - for loadAll Requests
     * @return created request parameters
     */
    createRequestParams(report: Report, widget: Widget, portfolios: Portfolio[], widgetInputs: Map<string, WidgetInput>, isExportRequest?: boolean, omitData?: boolean, isBatchExport?: boolean): any[] {
        const requestParams = [];

        // we need to check here if riskless cash bucket is enabled on any one of the incoming portfolios
        // if it is, then we want other portfolios as well to create this bucket so that in multi compare mode
        // the tree gets rendered correctly
        const isRisklessCashBucketEnabledOnAnyPortfolio = portfolios.some(
            (port: Portfolio) => port instanceof WhatIfPortfolio && port.modellingType === ModellingType.POSITION && port.compositionSetting.isOptimizationCashSettingChecked);

        portfolios.forEach((port: Portfolio) => {
            // Create empty  request params
            let combinedParams: any = this.getInitialCombinedParams();

            const copyWidgetInputs = new Map<string, WidgetInput>(widgetInputs);

            // Add portfolio request params
            port.addRequestParams(combinedParams);

            // Create widget request params;
            combinedParams = this.createWidgetRequestParams(widget, combinedParams, port, copyWidgetInputs, isExportRequest, omitData, isRisklessCashBucketEnabledOnAnyPortfolio, isBatchExport);

            const isPortfolioAnchor = (WorkspaceStore.getCurrentWorkpad()?.isCompareMode(report.comparisonConfigId) && WorkspaceStore.getCurrentWorkpad()?.comparisonConfigMap.get(report.comparisonConfigId).portAnchorId)
                ? WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.get(report.comparisonConfigId).portAnchorId === port.portId
                : false;

            // Add non-widget request params
            combinedParams = ObjectUtils.mergeObjectKeys(
                combinedParams,
                AbstractWidgetService.createNonWidgetRequestParams(report, widget, isPortfolioAnchor)
            );

            // Create the overall request params
            requestParams.push(combinedParams);
        });

        if (portfolios.length > 1) {
            // When we're done creating all the widget request params, re-update the widget input with the active portfolio's settings
            // Because during multi-port request generation, in order to properly set request params,
            // We loop through portfolios and apply those settings onto the widget input models directly
            WidgetUtils.updateWidgetWithPortfolioSettings(widget, WorkspaceStore.getCurrentPortfolio());
        }

        return requestParams;
    }

    protected getInitialCombinedParams(): any {
        return {};
    }

    clearDataFromCache(widget: Widget, portfolio: Portfolio, report: Report, allPortfolios?: Portfolio[]) {
        const portfolios: Portfolio[] = WorkspaceStore.getCurrentWorkpad()?.isCompareMode(report.comparisonConfigId) ? WorkpadUtils.getPortfoliosToCompare(report, allPortfolios) : [portfolio];

        // (Get a copy of the widget meta data's inputs first to ensure the original inputs are not modified.)
        const modifiedWidgetInputs: Map<string, WidgetInput> = new Map(widget.dataStore.metaData.inputs);

        const serverRequest = this.createFinalDataRequest(widget, portfolios, report, modifiedWidgetInputs);

        // Extract data from the backend server and store it in the datastore
        this.exploreDataRequestService.clearDataFromCache(serverRequest);
    }

    /**
     * This is overwritten by false for timeseries and return widgets.
     */
    supportsPointInTimePortfolio(): boolean {
        return true;
    }

    /**
     * Return True if override Date is applied
     */
    checkForOverrideDate(widget: Widget): boolean {
        return (widget.getCombinedInputs()?.get(CommonConstants.CONFIG_TYPE.COLUMNS) as ColumnSet)?.columns?.some(column =>
            column.optionValues?.some(optionValue =>
                optionValue instanceof OverrideDateColumnOption && (optionValue.overrideDateTypes?.length > 0 || optionValue.multiOverrideDateTypeFrequency)
            ));
    }

    /**
     * checks if we would want to show error message based on override date or positionbased portfolios
     */
    checkForErrorMessage(errorMessageForOverrideDate: string, errorMessageForSupportingPointInTimePortfolio: string, widget: Widget) {
        // check if it supports point in time portfolio or has a override date applied to it
        if (!this.supportsPointInTimePortfolio()) {
            return new Notification(`${errorMessageForSupportingPointInTimePortfolio} message`, errorMessageForSupportingPointInTimePortfolio, 'error');
        } else if (this.checkForOverrideDate(widget)) {
            return new Notification(`${errorMessageForOverrideDate} message`, errorMessageForOverrideDate, 'error');
        }
    }

    /**
     * Validates inputs, by default it considers the inputs to be valid and returns null.
     * @param widget a widget that needs the data
     * @param portfolio a portfolio to request the data for
     * @param report a report that the widget is part of
     * @return if the inputs are invalid, it returns a notification, otherwise it returns null.
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        let notification: Notification;

        notification = this.validatePortNameAndDate(portfolio);
        if (notification) {
            return notification;
        }

        if ((portfolio as WhatIfPortfolio)?.holdingChanges?.length > 0) {
            let notificationForRuleBased: Notification;
            if (portfolio instanceof PortfolioWithPositions) {
                // check if it is a position-based portfolio or a port group with position-based portfolio
                notificationForRuleBased = this.checkForErrorMessage(CommonConstants.NOTIFICATION_MESSAGE.DOES_NOT_SUPPORT_POSITION_PORTFOLIOS_WITH_OVERRIDE_DATES, CommonConstants.NOTIFICATION_MESSAGE.DOES_NOT_SUPPORT_POSITION_PORTFOLIOS, widget);
            } else if ((portfolio as RulesBasedPortfolio).compositionRules?.tradeRules?.some(rule => [CompositionConstants.WHATIF_POS.TYPE, CompositionConstants.ADHOC_PORT].indexOf((rule as PortfolioRule).portfolioType) !== -1)) {
                // since it's a rule based portfolio (or port group), check if it contains child position-based portfolios or adhoc portfolios
                notificationForRuleBased = this.checkForErrorMessage(CommonConstants.NOTIFICATION_MESSAGE.DOES_NOT_SUPPORT_PORT_GROUP_WITH_POSITION_PORTFOLIOS_WITH_OVERRIDE_DATES, CommonConstants.NOTIFICATION_MESSAGE.DOES_NOT_SUPPORT_PORT_GROUP_WITH_POSITION_PORTFOLIOS, widget);
            }

            // return notification object if returned by above logic.
            if (notificationForRuleBased instanceof Notification) {
                return notificationForRuleBased;
            }
        }

        if (WidgetConfigType.SCATTER !== widget.configType && !this.isInputValidForColumnBreakdown(widget)) {   // we do not support column breakdown in Scatter plot
            return new Notification(`${NotificationConstants.REMOVE_BREAKDOWN_OR_TOPBOTTOM_FILTER} ${AlertConstants.NOTIFICATION_STYLE.ERROR}`, NotificationConstants.REMOVE_BREAKDOWN_OR_TOPBOTTOM_FILTER, AlertConstants.NOTIFICATION_STYLE.ERROR);
        }

        for (const widgetInput of Array.from(widget.getCombinedInputs().values())) {
            const inputValidator = widgetInput.getConfigType && WidgetInputValidatorFactory.getInputValidator(widgetInput.getConfigType());
            if (inputValidator) {
                notification = inputValidator.validateInput(widgetInput, portfolio, widget);
                if (notification) {
                    return notification;
                } else {
                    const notificationMessages: string[] = inputValidator.validateInputForWarning(widgetInput);
                    if (notificationMessages && this.notificationService) {
                        const detailedNotification = {
                            toastType: AuxNotificationToastTypeEnum.TIMEOUT,
                            header: 'Warning',
                            id: CommonUtils.generateUniqueIdAsString(),
                            message: notificationMessages,
                            notificationStyle: AuxNotificationStyleEnum.WARNING
                        };
                        this.notificationService.detailedMessage(detailedNotification);
                    }
                }
            }

            if (widgetInput instanceof ColumnSet) {
                // This variable is for the first value of collapsed look-through security types
                // We currently do not support different collapsed look through secruity type configs on different columns as part of the same widget
                // What we're going to do here is check if all collapsed look-through configs are matching
                // If not, we'll error out the widget
                let firstCollapsedLTOptionValue: CollapsedLookthroughColumnOption;

                for (const col of widgetInput.columns) {

                    // Check the Collapsed look-through column option for the look through security types
                    const collapsedLTOptionValue: CollapsedLookthroughColumnOption = col.getOptionValueByConfigType(CollapsedLookthroughColumnOption.CONFIG_TYPE) as CollapsedLookthroughColumnOption;
                    if (collapsedLTOptionValue?.isValid()) {
                        if (!firstCollapsedLTOptionValue) {
                            firstCollapsedLTOptionValue = collapsedLTOptionValue;
                        } else {
                            // Check equality of the current column's CollapsedLookthroughColumnOption to the first valid one found
                            if (!firstCollapsedLTOptionValue.equals(collapsedLTOptionValue)) {
                                this.trackCollapsedLTErrorViaTelemetry(widget, widgetInput.columns, portfolio);
                                // If they're not equal, then error out the widget
                                return new Notification(`${NotificationConstants.COLLAPSED_LOOKTHROUGH_NON_MATCHING_SECURITY_TYPES_ERROR_MSG} ${AlertConstants.NOTIFICATION_STYLE.ERROR}`, NotificationConstants.COLLAPSED_LOOKTHROUGH_NON_MATCHING_SECURITY_TYPES_ERROR_MSG, AlertConstants.NOTIFICATION_STYLE.ERROR);
                            }
                        }
                    }

                    // Check if the widget holds decomposition column with the aggregation types other than 'Weighted average' and 'Score with short handling'.
                    if (!RequestValidationUtils.validateForDecompositionColumnWithAggregationType(col)) {
                        return new Notification(`${NotificationConstants.DECOMPOSITION_AGGREGATION_TYPE_ERROR_MSG} ${AlertConstants.NOTIFICATION_STYLE.ERROR}`, NotificationConstants.DECOMPOSITION_AGGREGATION_TYPE_ERROR_MSG, AlertConstants.NOTIFICATION_STYLE.ERROR);
                    }
                }
            }
        }
        return null;
    }

    /**
     * trackCollapsedLTErrorViaTelemetry is invoked when Collapsed look-through has different security type configurations in a single widget.
     * @param widget
     * @param columns
     * @param portfolio
     * @param firstCollapsedLTOptionValue
     * @param collapsedLTOptionValue
     */
    trackCollapsedLTErrorViaTelemetry(widget: Widget, columns: ColumnConfig[], portfolio: Portfolio): void {
        const widgetType = widget.configType;
        const portTicker = portfolio.portName;
        const collapsedLookThroughSecTypes: Map<string, string[]> = new Map<string, string[]>();
        const allColumns = [];
        // iterate through all the ColumnConfigs.
        // Only for the columns with a CollapsedLookThroughColumnOption, the tag of the column and its ltSecurityTypes array is added to the collapsedLookThroughSecTypes Map
        columns.forEach( colConfig => {
            if (colConfig.optionValues) {
                const collapsedLookThroughColumnOption  = colConfig.optionValues.filter( option => option instanceof CollapsedLookthroughColumnOption);
                if (collapsedLookThroughColumnOption?.length > 0) {
                    collapsedLookThroughSecTypes.set(colConfig.columnTag, collapsedLookThroughColumnOption[0]['lookthroughSettings'].ltSecurityTypes);
                }
            }
            allColumns.push(colConfig.columnTag);
        });

        const collapsedLTErrorParameters = new TelemetryCollapsedLookThroughErrorParameters(widgetType, allColumns, portTicker, collapsedLookThroughSecTypes);
        TelemetryService.track(TelemetryActionConstants.UI_ERRORS.COLLAPSED_LOOK_THROUGH_ERROR,
            collapsedLTErrorParameters);
    }

    /**
     * Check whether top-bottom filter and column breakdowns are not applied on same column. If yes, return error notification
     */
    protected isInputValidForColumnBreakdown(widget: Widget): boolean {
        const topBottomFilter: TopBottomFilterInput = widget.getCombinedInputs().get(CommonConstants.CONFIG_TYPE.TOP_BOTTOM_FILTER) as TopBottomFilterInput;
        if (!topBottomFilter || !TopBottomFilterInput.isValidTopBottomFilter(topBottomFilter)) {
            return true;
        }

        const widgetColumnConfigs: ColumnConfig[] = (widget.getCombinedInputs().get(CommonConstants.CONFIG_TYPE.COLUMNS) as ColumnSet)?.columns  || [];
        for (const colConfig of widgetColumnConfigs) {
            const columnBreakdown = colConfig.optionValues.find(option => option.configType === ColumnBreakdown.CONFIG_TYPE);
            if (columnBreakdown && (columnBreakdown as ColumnBreakdown).isBreakdownPopulated() && topBottomFilter.columnKey === colConfig.columnKey) {
                return false;
            }
        }

        return true;
    }

    /**
     * check if portfolio has a valid port name and date, else return error notification
     */
    protected validatePortNameAndDate(portfolio: Portfolio): Notification {
        let notificationMessage: string;
        if (portfolio && !portfolio.portName) {
            notificationMessage = NotificationConstants.INVALID_PORTNAME_MESSAGE;
        } else if (portfolio && (!portfolio.datePicker || !portfolio.datePicker.date)) {
            notificationMessage = NotificationConstants.INVALID_PORTDATE_MESSAGE;
        }

        return notificationMessage ? new Notification(`${notificationMessage} ${AlertConstants.NOTIFICATION_STYLE.ERROR}`, notificationMessage, AlertConstants.NOTIFICATION_STYLE.ERROR) : null;
    }

    /**
     * Processes the given response and assigns the processed data to the attributes in the given widget payload
     *
     * @param widget a widget on whose behalf the request to the backend server was made
     * @param requestAdapterConfig some parts of the request that are required in order to process the response
     * @param response a response to process
     * @param widgetPayload a payload to be be used to render the data in the widget
     * @param _request
     */
    protected processResponse(
        widget: Widget,
        requestAdapterConfig: RequestAdapterConfig,
        response: ExploreResponse,
        widgetPayload: WidgetPayload,
        _request?: any
    ): void {
        const {cube, breakdownLevels} = this.createCube(requestAdapterConfig, response);
        widgetPayload.cube = cube;
        widgetPayload.breakdownLevels = breakdownLevels;
    }

    /**
     * Function to create the data cube for this widget.
     * Move into a separate function as the R&E and Returns table widgets are now using a TreeCube instead.
     */
    protected createCube(requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse): DataCubeContext {
        return createDataCube(requestAdapterConfig, response);
    }

    /**
     * - Adds widget data request params for the given widget to the given request params
     * - Creates static widget request params
     * - Creates the overall widget request params with the given request params (which had widget params added)
     * and the static widget params
     * @param widget a widget for which the request params are to be created
     * @param requestParams request params to add the widget params to
     * @param portfolio current portfolio
     * @param widgetInputs modified widget inputs which would be used to create widget request params
     * @return created widget request params
     * @param isExportRequest true if from export.service
     * @param omitData - for loadAll Requests
     * @param isRisklessCashBucketEnabled
     */
    protected createWidgetRequestParams(widget: Widget, requestParams: any, portfolio: Portfolio, widgetInputs: Map<string, WidgetInput>, isExportRequest?: boolean, omitData?: boolean,
                                        isRisklessCashBucketEnabled?: boolean, isBatchExport?: boolean): any {
        //update derived widget/column Settings with portfolio level settings for a loadAll request before creating requestParams
        WidgetUtils.updateWidgetWithPortfolioSettings(widget, portfolio);

        const widgetRiskSettings = widgetInputs.get(CoreRiskConstants.RISK_SETTINGS);

        // If there is no widget level riskSettings then set portfolio level risk settings in order to send it as a part of the request
        if (isNil(widgetRiskSettings)) {
            widgetInputs.set(CoreRiskConstants.RISK_SETTINGS, portfolio.portfolioRiskSettings);
        } else {
            // Creating new WidgetRiskSettings with keeping widget specific risk settings and setting current portfolio's RiskSettings as parentRiskSettings
            const copyWidgetRiskSettings = new RiskSettings();
            copyWidgetRiskSettings.copySettings(widgetRiskSettings as RiskSettings);
            copyWidgetRiskSettings.updateDerivedSettings(portfolio.portfolioRiskSettings);
            copyWidgetRiskSettings.setSettingsSource(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            widgetInputs.set(CoreRiskConstants.RISK_SETTINGS, copyWidgetRiskSettings);
        }

        widgetInputs.forEach((widgetInput: WidgetInput, key: string) => {
            if (widgetInput && CoreConfigUtils.isRequestParamsCreator(widgetInput)) {

                // For columns we should update the columnTitle based on option values.. if we don't then the first time the column request params gets passed with default Title.. when data comes back and we try to create the viz columns.. we call this same
                // method which ends up updating the title.. and if the same widget now gets loaded again we can't use cache since column title would have changed.. So  to fix this we are doing this upfront
                if (widgetInput instanceof ColumnSet) {
                    widgetInput.columns.forEach((col: ColumnConfig) => {
                        WidgetUtils.getTheModifiedColumnTitle(col, widget.configType);
                    });
                }

                // Ask widget input to add request parameters
                widgetInput.addRequestParams(requestParams, key, isExportRequest, isBatchExport);
                // Add widget configurations to the request parameter if applicable
                this.addToRequestParamFromWidgetInputConfig(widget.widgetConfigInputs, key, requestParams, isExportRequest);
            }
        });

        // Add other widget request parameters
        this.enrichRequestParams(requestParams, widget, portfolio, isRisklessCashBucketEnabled, widgetInputs);

        // Add static widget request params
        return ObjectUtils.mergeObjectKeys(requestParams, this.getStaticWidgetRequestParams());
    }

    private enrichRequestParams(requestParams: any, widget: Widget, portfolio: Portfolio | WhatIfPortfolio, isRisklessCashBucketEnabled: boolean, widgetInputs: Map<string, WidgetInput>) {
        requestParams.title = widget.title;
        requestParams.type = getWidgetType(widget.configType);
        if (portfolio.benchmark?.name) {
            requestParams.benchmark = portfolio.benchmark.name;
            requestParams.benchmarkFullName = portfolio.benchmark.portfolio ? portfolio.benchmark.portfolio.fullName : portfolio.benchmark.name;
        }
        if (!requestParams.type) {
            // Unexpected, the mappings between the widget type and the widget config type need to be set up.
            const msg = 'Widget config type is not mapped to widget type, widget.configType=' + widget.configType;
            console.error(msg);
            // Set type to the config type
            requestParams.type = widget.configType;
        }

        // TODO add this to the static widget request params
        requestParams.createNestedNoneBuckets = WidgetConfigFactory.isCreateNestedNoneBuckets(widget.configType);
        requestParams.createNestedOtherBuckets = WidgetConfigFactory.isCreateNestedOtherBuckets(widget.configType);
        if (isRisklessCashBucketEnabled) {
            requestParams.createOptimizationCashBucket = isRisklessCashBucketEnabled;
        }

        // For core asset optimization, widgets with the same filter should be considered as fully specified port for VAR Server requests
        if (portfolio instanceof PortfolioWithPositions && portfolio.holdingChanges?.some(holdingChange => !isNil(holdingChange) && holdingChange.isOptoGeneratedChange) && portfolio.compositionSetting?.compositionFilter?.equals(widgetInputs.get(CommonConstants.CONFIG_TYPE.FILTER))) {
            requestParams.isFullySpecifiedPortfolio = 'Y';
        }
    }

    /**
     * Adds to the request parameter additional elements if there are defined in the given widgetConfigInputs
     * @param widgetConfigInputs widget configurations from widget's json file
     * @param paramName request parameter name
     * @param widgetRequestParams all request parameters
     * @param isExportRequest true if from export.service
     */
    protected addToRequestParamFromWidgetInputConfig(widgetConfigInputs: WidgetConfigInput[], paramName: string, widgetRequestParams: any, isExportRequest?: boolean): void {
        if (paramName !== WidgetInputType.COLUMNS) {
            // Nothing to do for any other input than the columns
            return;
        }

        // Extract columns from the request params
        const configInput: WidgetConfigInput = this.getColumnsWidgetConfigInput(widgetConfigInputs);
        if (isNil(configInput) || isNil(configInput.hiddenColumns)) {
            // Nothing else to do as we were after the hidden columns
            return;
        }

        // Add hidden columns to the request params
        const requestColumns: WidgetInput[] = widgetRequestParams[paramName];

        configInput.hiddenColumns.forEach((hiddenColumn: ColumnConfig) => {
            // Add hidden columns only if requested column doesn't contain them already.
            if (this.shouldAddHiddenColumnToRequestColumns(requestColumns, hiddenColumn)) {
                const colData = hiddenColumn.createRequestColumn();
                requestColumns.push(colData);
                // send down the hidden column for export request, but mark it as hidden so that it is trimmed in the exported excel file
                colData.visible = false;
            }
        });
    }

    /**
     * Get the WidgetConfigInput that contains the columns to be sent in the request
     * @param widgetConfigInputs
     * @protected
     */
    protected getColumnsWidgetConfigInput(widgetConfigInputs: WidgetConfigInput[]): WidgetConfigInput {
        return widgetConfigInputs.find((inputConfig) => inputConfig.inputName === WidgetInputType.COLUMNS);
    }

    /**
     * condition check for adding hidden column to request columns
     *
     * @param requestColumns
     * @param hiddenColumn
     * @protected
     */
    protected shouldAddHiddenColumnToRequestColumns(requestColumns: WidgetInput[], hiddenColumn: ColumnConfig): boolean {
        return !some(requestColumns, function (col: ColumnConfig) {
            return col.columnTag === hiddenColumn.columnTag;
        });
    }

    /**
     * Check if data is available and return the error message to handleResponse.
     */
    protected noDataResponse(response: ExploreResponse): string {
        if (!response.data) {
            if (response.errorCode) {
                return ErrorCodeLookupUtils.findErrorMessage(response.errorCode) || response.message;
            } else if (response.message) {
                return ErrorCodeLookupUtils.findConvertedMessage(this.NO_DATA_IN_RESPONSE_WITH_MSG, response.message);
            } else {
                return this.NO_DATA_IN_RESPONSE;
            }
        }
    }

    /**
     * Handles the given ExploreResponse by creating the WidgetPayload instance and populating it with the common attributes,
     * and letting the subclasses populate with the specific attributes via "processResponse" method.
     * At the end it stores the created and populated WidgetPayload instance in the widget's data store, which the
     * widget will use to render the data.
     * @param request request to the backend server
     * @param response response from the backend server
     * @param widget a widget for which the given request/response was sent/received from the backend server
     * @param widgetInputs modified widget inputs which would be used to create visualization columns
     * @param isCompareMode Flag to indicate this is in compare mode
     */
    private handleResponse(request: any, response: ExploreResponse, widget: Widget, widgetInputs: Map<string, WidgetInput>, isCompareMode: boolean): void {
        const errorMessage = this.noDataResponse(response);
        // Create the payload to be used to render the data in the widget
        if (errorMessage) {
            // Could not get data for the request, something unexpected occurred - show an error
            console.error(errorMessage);

            // Store the payload for rendering in the widget's data store
            widget.dataStore.data = {notification: Notification.createErrorNotification(errorMessage, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_HANDLE_RESPONSE_ERROR)};
            return;
        }
        // Create request config
        const requestConfig: RequestAdapterConfig = this.createRequestConfig(widgetInputs, widget, response, request, isCompareMode);

        // check if we have additional columns in the updated splitColumns
        // if yes, re-assign response columns to have additional ones as well
        const requestColumns: string[] = (requestConfig.splitColumns ? requestConfig.splitColumns : requestConfig.columns).map(col => col.columnKey);
        response.data.columns = (response.data.columns && response.data.columns.length) < requestColumns.length ? requestColumns : response.data.columns;

        // Create the response config
        const responseConfig: ExploreResponseConfig = {
            columnHeaderDetails: response.data.columnHeaderDetails,
            columns: response.data.columns,
            splitColumnKeys: response.data.splitColumnKeys,
            footerDetails: response.data.footerDetails
        };

        const widgetPayload: WidgetPayload = {
            requestConfig,
            responseConfig,
            widgetConfigType: widget.configType,
            customVizConfig: this.customVizConfig(widget, widgetInputs, requestConfig.portfolio)
        };

        // Apply highlighting to the data based on highlight rules created by user before placing into qbstr cube
        HighlightUtils.applyHighlighting(response, widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet);

        // Let the subclasses process the response
        this.processResponse(widget, requestConfig, response, widgetPayload, request);

        // Store the payload for rendering in the widget's data store
        widget.dataStore.data = widgetPayload;
    }

    /**
     * Responsible for widget specific configuration
     * e.g. table expanded state, soring model or chart specific axes
     */
    protected customVizConfig(widget: Widget, widgetInputs: Map<string, WidgetInput>, portfolio?: string): any {
        return {};
    }

    /**
     * Create visualization request adapter config using the passed in inputs
     */
    protected createRequestConfig(widgetInputs: Map<string, WidgetInput>, widget: Widget, response: ExploreResponse, request: any, isCompareMode: boolean): RequestAdapterConfig {
        return {
            columns: WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widgetInputs, widget.displayInputs, widget.configType, response, response.data.columnHeaderDetails),
            splitColumns: WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widgetInputs, widget.displayInputs, widget.configType, response, response.data.columnHeaderDetails, response.data.columns, response.data.splitColumnKeys),
            columnFilters: WidgetUtils.assembleDefaultFilterValues(widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet, response.data.columns),
            portfolio: this.getPortfolioName(request, isCompareMode),
            isCompareMode,
            widgetConfig: widget.configType
        };
    }

    /**
     * Get the PUBLISH_TIME object from the footer in the response. It is the latest publsih time for any portfolio
     * in the QC map on the server or from the risk_port table
     * Set isNullQC to true if PUBLISH_TIME is after the largest publish times from the old publish data
     * This will make the QC Indicator look like a empty circle with a blue outline
     */
    checkIsNullQC(portfolio: Portfolio, data: any) {
        // QC publish time will not have an explicit timezone but it is in the local timezone
        // PUBLISH_TIME will be the number of milliseconds from 01/01/1970 00:00:00.000 GMT-0000 so it's timezone is defined
        // Retrieve the largest QC publish time and compare it to PUBLISH_TIME
        const publishStateWrapper = portfolio.publishStateWrapperSubject$.getValue();
        if (data.footerDetails && data.footerDetails.PUBLISH_TIME && publishStateWrapper.publishedStateResults.length > 0) {
            const publishTimes = publishStateWrapper.publishedStateResults.map(x => {
                // Convert the portfolioPublishedDate to a moment object if it is a valid time
                const date = moment(x.publishDate);
                return date.isValid() ? date : moment(0);
            });

            // If the received PUBLISH_TIME is greater than the largest stored QC publish time,
            // it means that the publish state got updated and the user needs to be notified via the changed
            // Publish State icon. Hence setting the isNullQC flag to true.
            if (moment(data.footerDetails.PUBLISH_TIME).isAfter(moment.max(publishTimes))) {
                publishStateWrapper.isNullQC = true;
                portfolio.publishStateWrapperSubject$.next(publishStateWrapper);
            }
        }
    }

    getPortfolioName(request: any, isCompareMode?: boolean): string {
        if (isCompareMode) {
            return CommonConstants.COMPARE;
        }
        const port = request.portfolio;
        let portName = !isNil(request.portfolioIdentifier) ? request.portfolioIdentifier : request.portfolio;
        if (port.indexOf(',') === -1) {
            return portName;
        }
        if (portName.length > 15) {
            portName = portName.substr(0, 20);
            portName = portName + '..';
        }
        return portName;
    }

    /**
     * Returns overridden Y-Axis values from Chart Settings input fields
     */
    protected getYAxisOverrideInputs(widgetInputs: Map<string, WidgetInput>): YAxisOverridable {
        const primaryAxisSettings = widgetInputs.get(ChartWidgetInputConfigType.PRIMARY_AXIS_SETTINGS) as AxisSettings;
        const secondaryAxisSettings = widgetInputs.get(ChartWidgetInputConfigType.SECONDARY_AXIS_SETTINGS) as AxisSettings;

        return {
            hidePrimaryYAxisTitle: primaryAxisSettings?.hideAxisTitle,
            primaryYAxisOverride: primaryAxisSettings?.axisTitle,
            primaryYUpperBound: primaryAxisSettings?.yUpperBound,
            primaryYLowerBound: primaryAxisSettings?.yLowerBound,
            primaryYInterval: primaryAxisSettings?.yInterval,

            hideSecondaryYAxisTitle: secondaryAxisSettings?.hideAxisTitle,
            secondaryYAxisOverride: secondaryAxisSettings?.axisTitle,
            secondaryYUpperBound: secondaryAxisSettings?.yUpperBound,
            secondaryYLowerBound: secondaryAxisSettings?.yLowerBound,
            secondaryYInterval: secondaryAxisSettings?.yInterval
        };
    }
}
