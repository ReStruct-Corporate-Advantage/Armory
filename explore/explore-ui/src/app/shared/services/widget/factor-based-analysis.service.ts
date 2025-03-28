/**
 *
 *@author Ashish Agarwal
 */
import {Injectable} from '@angular/core';
import {ColumnSet, ScenarioColumnOption} from '@blk/explore-ui-column-option';
import {AlertConstants, ColumnConfig, ColumnConstants, CoreCommonConstants, ResponseData, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {CommonConstants} from '@constants/common.constants';
import {DataRequestConstants} from '@constants/data-request.constants';
import {NotificationConstants} from '@constants/notification.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponse} from '@interfaces/response.interface';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {RiskColumnSettings} from '@models/riskSettings/risk-column-settings.model';
import {Notification} from '@models/widget/notification.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {createDataCube} from '@utils/qbstr';
import {WidgetUtils} from '@utils/widget.utils';
import {isEmpty, isNil, isUndefined} from 'lodash';

/**
 * Service to retrieve data for the factor based widget.
 */
@Injectable()
export class FactorBasedAnalysisService extends AbstractWidgetService {

    /**
     * Creates a new instance with the given parameter
     * @param http2BmsService a service to use to "talk" to the backend server
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.RISK_DATA, exploreDataRequestService, [WidgetConfigType.PRA], WidgetDataViewOption.HOLDINGS_VIEW);
    }

    /**
     * return identifierColumn for FBA Widget
     */
    getIdentifierColumn() {
        return ColumnConstants.RISK_FACTOR_TAG_IDENTIFIER_COLUMN;
    }

    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        const riskColumnSettings = widgetInputs.get(CoreRiskConstants.CONFIG_TYPE.RISK_COLUMN_SETTINGS) as RiskColumnSettings;
        if (!riskColumnSettings) {
            return;
        }

        if (riskColumnSettings.disableSectorBreakdown) {
            widgetInputs.delete(CoreRiskConstants.CONFIG_TYPE.BREAKDOWN);
        }

        if (riskColumnSettings.disableFactorBreakdown) {
            widgetInputs.delete(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN);
        }
    }

    getMultiPortCompareUrl(): string {
        return DataRequestConstants.DATA_REQUEST_URL.RISK_MULTI_PORT_COMPARE;
    }

    /**
     * Processes the given response for FBA widget
     */
    protected processResponse(_widget: Widget, requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse, widgetPayload: WidgetPayload, request?: any): void {
        if (response.data.data && response.data.data.children && !!response.data.data.children.find(child => !!child.color)) {
            this.propagatePointColorToChildren(response.data.data.children);
        }
        widgetPayload.responseConfig.footerDetails.assetsCount = this.getAssetsCount(response.data.data);
        const {cube, breakdownLevels} = createDataCube(requestAdapterConfig, response, undefined, true, undefined, request.forDate);
        widgetPayload.cube = cube;
        widgetPayload.breakdownLevels = breakdownLevels;
    }

    /**
     * Count number of asset
     */
    private getAssetsCount(responseData: ResponseData): number {
        if (!responseData || !responseData.children) {
            return 0;
        }

        const specificNodes = responseData.children.filter(c => c.data[0] === 'SPECIFIC');
        if (specificNodes.length === 1 && specificNodes[0].children) {
            let assets = specificNodes[0].children.length;
            const benchmarkNode = specificNodes[0].children.filter(c => c.data[0] === 'Benchmark Only');
            if (benchmarkNode.length) {
                assets += benchmarkNode[0].children.length;
            }
            return assets;
        }
        return 0;
    }

    /**
     * Validates inputs, by default it considers the inputs to be valid and returns null.
     * @param widget a widget that needs the data
     * @param portfolio a portfolio to request the data for
     * @param report a report that the widget is part of
     * @return if the inputs are invalid, it returns a notification, otherwise it returns null.
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        const columnSet = widget.dataStore.metaData.inputs.get('columns') as ColumnSet;
        if (columnSet.columns && !!columnSet.columns.filter(col => this.hasStressScenario(col)).length) {
            return new Notification(`${NotificationConstants.NO_STRESS_SCENARIOS_SELECTED} ${AlertConstants.NOTIFICATION_STYLE.ERROR}`, NotificationConstants.NO_STRESS_SCENARIOS_SELECTED, AlertConstants.NOTIFICATION_STYLE.ERROR);
        }
        if (WidgetUtils.hasMacroFactorBreakdown(widget)) {
            const columnSet: ColumnSet = widget.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet;
            if (!isNil(columnSet.columns.find(columnConfig => columnConfig.isPerformanceColumn()))) {
                const notificationMessage = NotificationConstants.WIDGET_MACRO_FACTOR_BREAKDOWN_WITH_PERFORMANCE_COL_MSG;
                return new Notification(`${notificationMessage} ${AlertConstants.NOTIFICATION_STYLE.ERROR}`, notificationMessage, AlertConstants.NOTIFICATION_STYLE.ERROR);
            }
        }
        return super.validateInputs(widget, portfolio, report);
    }

    /**
     * Check if any namedScenarios, dateScenarios, otherScenarios are
     * present for a particular stress column
     */
    private hasStressScenario(col: ColumnConfig) {
        const scenarioColumnOption = col.optionValues.find(val => val instanceof ScenarioColumnOption) as ScenarioColumnOption;
        return !isUndefined(scenarioColumnOption) ? (isEmpty(scenarioColumnOption.nameScenarios) &&
            scenarioColumnOption.otherScenarios.every(option => !option.enabled) &&
            scenarioColumnOption.dateScenarios.every(option => !option.enabled)) : false;
    }

    /**
     * propagate point colors to children if received from server
     */
    private propagatePointColorToChildren(children: ResponseData[]): void {
        children
            .filter((child: ResponseData) => !isEmpty(child.color) && !isEmpty(child.children))
            .forEach((child: ResponseData) => {
                const colorPostfix = child.color.indexOf(CommonConstants.RESTRICT_INDICATOR) === -1 ? CommonConstants.RESTRICT_INDICATOR : CoreCommonConstants.EMPTY_STRING;
                child.children.forEach(childOfChild => childOfChild.color = child.color + colorPostfix);
                this.propagatePointColorToChildren(child.children);
            });
    }
}
