import {Widget} from '@models/widget/widget.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {ColumnUtils} from '@utils/column.utils';
import {WorkspaceStore} from '@stores/workspace.store';
import {
    ChartSpriteletClickType,
    ColumnConfig,
    ColumnConstants,
    ErrorTypeConstants,
    NOTIFICATION_SERVICE_TOKEN,
    PgsChartsAdditionalSettingsParameter,
    PgsChartsParameter,
    PortGroupSummaryChartLevel,
    PortGroupSummaryChartType,
    TelemetryActionConstants,
    TelemetryService,
    UIErrorParameters,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {ColumnSet, FactorSettingsColumnOption} from '@blk/explore-ui-column-option';
import {AbstractSpriteletLauncherService} from '@services/spritelet-launcher/abstract-spritelet-launcher.service';
import {CommonConstants} from '@constants/common.constants';
import {Inject, Injectable} from '@angular/core';
import {NotificationService} from '@services/notification';
import {ROOT_LEVEL} from '@utils/qbstr';
import {PgsChartInputs} from '@models/pgs-chart-inputs.model';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {NotificationConstants} from '@constants/notification.constants';

@Injectable({
    providedIn: 'root'
})
export abstract class AbstractPgsChartSpriteletLauncherService extends AbstractSpriteletLauncherService {

    constructor(@Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationService) {
        super();
    }

    readonly LEVEL = 'level-';

    launchSpritelet(widget: Widget, event: SpriteletEvent) {
        const isRowBased = 'node' in event.params && ColumnUtils.checkIfColumnIsRowBasedForSpriteletLaunch(event.params.column.getColId());
        const isBreakdownValid = this.checkIfValidBreakdown(this.getParentNumericalColumns((widget.dataStore.metaData.inputs.get(CommonConstants.CONFIG_TYPE.COLUMNS) as ColumnSet)).filter(column => column.columnTag !== ColumnConstants.PORTFOLIO));
        if (isRowBased && !isBreakdownValid) { // send error notification if columns with different column level breakdowns exist
            this.notificationService.error('To create a portfolio level chart from the Portfolio Group Summary widget, please set all the columns to have the same column-level breakdown or to have no column-level breakdown.',
                ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CONFIGURE_ROW_BASED_SPRITELET_ERROR);
            return;
        }

        const excludedWidgetConfigTypes = [
            WidgetConfigType.DIVERSIFICATION_TS,
            WidgetConfigType.MCVAR_PNL_TS,
            WidgetConfigType.PNL_TS
        ];

        if (!excludedWidgetConfigTypes.includes(this.getChildConfigType())) {
            const columns = (widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
            if (isRowBased) {
                const hasDiversificationScoreColumn = columns.find(col => col.optionValues.find(optionValue => optionValue instanceof FactorSettingsColumnOption));
                if (hasDiversificationScoreColumn) {
                    this.notificationService.error(NotificationConstants.PGS_CHARTS_NOT_SUPPORTED_FOR_DIVERSIFICATION_COLUMNS);
                    return;
                }
            } else {
                // Column right click handler
                const matchingCol = columns.find(col => col.columnTag === event.params.column.getColDef()['colTag']);
                if (matchingCol && matchingCol.optionValues.find(optionValue => optionValue instanceof FactorSettingsColumnOption)) {
                    this.notificationService.error(NotificationConstants.PGS_CHARTS_NOT_SUPPORTED_FOR_DIVERSIFICATION_COLUMNS);
                    return;
                }
            }
        }

        const childWidget = new Widget(this.getChildConfigType());
        childWidget.pgsChartInputs = new PgsChartInputs();
        childWidget.pgsChartInputs.actionKey = this.getSpriteletActionKey();
        // launch column based if spritelet is launched from 1st column (ag-Grid-AutoColumn)
        this.configureSpritelet(childWidget, widget, event, isRowBased);
        this.doLaunchSpritlet(childWidget, widget, event);
        this.trackSpriteletLaunchViaTelemetry(childWidget, event, isBreakdownValid);
        this.addSpriteletWidgetToReport(widget, childWidget, WorkspaceStore.getCurrentReport());
    }

    protected doLaunchSpritlet(_childWidget: Widget, _parentWidget: Widget, _event: SpriteletEvent) {
        // Do nothing
    }

    /**
     * Creates a bar chart spritelet using data from all numerical columns in parent grid
     * @param childWidget  Child spritelet widget whose inputs are being modified
     * @param parentWidget widget from which event was triggered
     * @param event  Event that triggered the spritelet
     * @param isRowBased if event was triggered from row or column
     */
    protected configureSpritelet(childWidget: Widget, parentWidget: Widget, event: SpriteletEvent, isRowBased: boolean) {
        this.setCustomVizConfigSettings(event.params['node'], childWidget, true);
        // filter parent's columns for child widget
        this.setChildWidgetColumns(childWidget, parentWidget, event.params, isRowBased);
    }

    /**
     * Updates the childWidget with all numerical columns from parent widget
     * @param childWidget  Widget whose inputs are being overridden
     * @param parentWidget widget from which event was triggered
     * @param params Event params that triggered the spritelet
     * @param isRowBased if event was triggered from row or column
     */
    protected setChildWidgetColumns(childWidget: Widget, parentWidget: Widget, params: any, isRowBased: boolean) {
        const parentColumnSet = parentWidget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        let columns: ColumnConfig[] = [...parentColumnSet.columns.filter(column => column.columnKey === ColumnConstants.PORTFOLIO), ...this.getParentNumericalColumns(parentColumnSet)];
        if (!isRowBased) {
            columns = this.getColumns(columns, params);
        }
        const childColumnSet = new ColumnSet({columns});
        childWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, childColumnSet);
    }

    /**
     * Checks if column breakdowns are valid or not
     * @param _columns
     * @protected
     */
    protected checkIfValidBreakdown(_columns: ColumnConfig[]): boolean {
        return true;
    }

    /**
     * Set customVizConfig for chart widget that gets created
     * @param node
     * @param childWidget
     * @param isSpriteletLaunch
     * @param portHierarchy
     * @protected
     */
    public setCustomVizConfigSettings(node: any, childWidget: Widget, isSpriteletLaunch: boolean): void {
        if (isSpriteletLaunch) {
            childWidget.pgsChartPortfolio = node.data[ROOT_LEVEL];
            // store the port hierarchy to the child widget which will be used to recreate charts when switching/loading
            childWidget.pgsChartInputs.portHierarchy = this.calculatePortHierarchy(node);
            childWidget.pgsChartInputs.level = node.level;
        }
        childWidget.dataStore.data = {
            responseConfig: {},
            customVizConfig: {
                breadcrumbsMeasures: [{columnTitle: node.hasChildren() ? node.key : node.data.portfolio || node.data[ROOT_LEVEL]}]
            }
        };
    }

    /**
     * Calculates the port hierarchy for the given node
     * @param iteratorNode
     * @private
     */
    private calculatePortHierarchy(iteratorNode: any): string {
        let portHierarchy = CommonConstants.EMPTY_STRING;
        for (let i = iteratorNode.level; i >= 0; i--) {
            let portfolio = i === 0 ? iteratorNode.data[ROOT_LEVEL] : iteratorNode.data[this.LEVEL + i]; // '|' signifies that element has children
            // if we have leaf level portfolio, then data is stored in 'portfolio' field
            // For non portgroups i.e. portfolios, data is still stored in '_ROOT_ field which is already handled
            if (!iteratorNode.hasChildren() && i !== 0) {
                portfolio = iteratorNode.data.portfolio;
                iteratorNode = iteratorNode.parent;
            } else {
                portfolio += CommonConstants.COLUMN_KEY_SPLITTER;
            }
            portHierarchy = CommonConstants.ARROW_OPERATOR + portfolio + portHierarchy;
        }
        return portHierarchy.slice(2, portHierarchy.length);
    }

    private trackSpriteletLaunchViaTelemetry(widget: Widget, event: SpriteletEvent, isBreakdownValid: boolean) {
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.PGS_CHART_LAUNCHED, new PgsChartsParameter({
            chartType: this.chartType(widget.configType),
            chartLevel: this.chartLevel(widget.pgsChartInputs.actionKey),
            chartSpriteletClickType: event.params.column.getColId() === ColumnConstants.ACTION_COL ? ChartSpriteletClickType.CHART_SPRITELET_CLICK_TYPE_CONTEXT_DOTS : ChartSpriteletClickType.CHART_SPRITELET_CLICK_TYPE_RIGHT_CLICK,
            pgsChartsAdditionalSettings: new PgsChartsAdditionalSettingsParameter({
                isBreakdownAdded: isBreakdownValid,
                isStackedChart: true,
                numberOfObservations: widget.configType === WidgetConfigType.PGS_TS ? 10 : 0
            })
        }));
    }

    /**
     * returns chart type from corresponding enum
     * @param type
     */
    chartType(type: string) {
        switch (type) {
            case WidgetConfigType.PGS_BAR:
                return PortGroupSummaryChartType.PORT_GROUP_SUMMARY_CHART_TYPE_BAR;
            case WidgetConfigType.PGS_TS:
                return PortGroupSummaryChartType.PORT_GROUP_SUMMARY_CHART_TYPE_TIME_SERIES;
            default:
                return PortGroupSummaryChartType.PORT_GROUP_SUMMARY_CHART_TYPE_UNSPECIFIED;
        }
    }

    /**
     * returns level at which chart was opened from corresponding enum
     * @param actionKey
     */
    chartLevel(actionKey: string) {
        switch (actionKey) {
            case TabularWidgetConstants.PGS_BAR_CHART_SPRITELET.ACTION_KEY:
            case TabularWidgetConstants.PGS_TS_CHART_SPRITELET.ACTION_KEY:
                return PortGroupSummaryChartLevel.PORT_GROUP_SUMMARY_CHART_LEVEL_AT_THIS_LEVEL;
            case TabularWidgetConstants.PGS_LEAF_BAR_CHART_SPRITELET.ACTION_KEY:
            case TabularWidgetConstants.PGS_TS_LEAF_CHART_SPRITELET.ACTION_KEY:
                return PortGroupSummaryChartLevel.PORT_GROUP_SUMMARY_CHART_LEVEL_INDIVIDUAL_PORTFOLIOS;
            default:
                return PortGroupSummaryChartType.PORT_GROUP_SUMMARY_CHART_TYPE_UNSPECIFIED;
        }
    }

    /**
     * Gets the widget config type to spawn
     * @protected
     */
    protected abstract getChildConfigType(): WidgetConfigType;

    /**
     * Gets columns with which child widget will load
     * @param columns
     * @param params
     * @protected
     */
    protected abstract getColumns(columns: ColumnConfig[], params: any): ColumnConfig[];
}
